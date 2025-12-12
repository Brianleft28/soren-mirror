<script lang="ts">
    import { onMount } from 'svelte';
    import { isTerminalVisible } from '$lib/stores/ui';
    import { currentPath } from '$lib/stores/terminal';
    import { fileSystemData, type FileSystemNode } from '$lib/data/file-system';

    type HistoryItem = {
        type: 'prompt' | 'response' | 'error' | 'system';
        text: string;
        promptIndicator?: string;
    };

    let history: HistoryItem[] = [
        { type: 'system', text: "Bienvenido a la terminal de Brian Benegas. Escribe '-h' para ver los comandos." }
    ];
    let currentPrompt = '';
    let isLoading = false;
    let inputElement: HTMLInputElement;
    let terminalElement: HTMLDivElement;
    let isChatModeActive = false;
    let chatProjectContext: string | null = null; 

    const commands: Record<string, (args: string[]) => Promise<void>> = {

        '-h': async () => {  const helpText = `<pre>Comandos disponibles:
                    <span class="command-highlight">'cls'</span>: Limpia la consola.
                    <span class="command-highlight">'exit'</span>: Cierra la terminal.
                    <span class="command-highlight">'cd [directorio]'</span>: Cambia de directorio.
                    <span class="command-highlight">'ll'</span> o <span class="command-highlight">'dir'</span>: Lista el contenido del directorio.
                    <span class="command-highlight">'soren_proyectos'</span>: Lista los proyectos documentados.
                    <span class="command-highlight">'soren_chat [tu mensaje]'</span>: Inicia una conversación sobre cualquiera de mis proyectos o habilidades!
                    </pre>`;
            addSystemMessage(helpText);
        },

        cls: async () => {
            history = [];
            isChatModeActive = false;
            currentPath.set('C:\\');
            chatProjectContext = null;
            addSystemMessage("Escribe '-h' para ver los comandos disponibles.");
        },

ll: async () => {
        const pathParts = $currentPath.split('\\').filter((p) => p && p !== 'C:');

        // Navegar hasta el directorio actual en el file system
        let currentLevel: FileSystemNode[] = fileSystemData.children; // Iniciar con los hijos del root

        for (const part of pathParts) {
            const foundDir = currentLevel.find(
                (node) => node.name.toLowerCase() === part.toLowerCase() && node.type === 'folder'
            );

            // --- INICIO DE LA CORRECCIÓN ---
            if (foundDir && foundDir.type === 'folder') {
                // Asignamos la propiedad 'children' de la carpeta encontrada
                currentLevel = foundDir.children;
            } else {
                addErrorMessage(`Directorio no encontrado: ${part}`);
                return; // Salir si una parte de la ruta no es válida
            }
            // --- FIN DE LA CORRECCIÓN ---
        }

        // Una vez en el directorio correcto, listar su contenido
        if (currentLevel.length === 0) {
            addSystemMessage('Directorio vacío.');
        } else {
            const listing = currentLevel
                .map((node) => {
                    return node.type === 'folder' ? `[${node.name}]` : node.name;
                })
                .join('\n');
            addSystemMessage(listing);
        }
    },
        exit: async () => {
            handleClose();
        },

        cd: async (args) => {
            const targetDir = args[0];
            if (!targetDir) {
                addSystemMessage(`Ruta actual: ${$currentPath}`);
                return;
            }
            if (targetDir === '..') {
                const parts = $currentPath.split('\\').filter(p => p);
                if (parts.length > 1) {
                    parts.pop();
                    currentPath.set(parts.join('\\') + '\\');
                } else {
                    currentPath.set('C:\\');
                }
                return;
            }
            // añadir lógica para validar si el directorio existe en file-system.ts
            const parts = $currentPath.split('\\').filter(p => p);
            parts.push(targetDir);
            currentPath.set(parts.join('\\') + '\\');
        },
     

        soren_chat: async (args) => {
            isChatModeActive = true;
            const project = args[0];
            if (project) {
                chatProjectContext = project;
                addSystemMessage(
                    `Modo de chat activado con contexto del proyecto: <span class="command-highlight">'${project}'</span>.`
                );
            } else {
                chatProjectContext = null;
                addSystemMessage(
                    'Modo de chat general activado. Ahora puedes conversar con Søren sobre Brian.'
                );
            }
        },
        soren_proyectos: async () => {
            try {
                const res = await fetch('/api/chat', { method: 'GET' });
                if (!res.ok) throw new Error('No se pudo obtener la lista de proyectos.');
                const { proyectos } = await res.json();

                if (proyectos && proyectos.length > 0) {
                    const projectList = proyectos.map((p: string) => `- ${p}`).join('\n');
                    addSystemMessage(
                        `Proyectos disponibles para discutir:\n${projectList}\n\nUsa 'soren_chat [nombre_del_proyecto]' para hablar de uno.`
                    );
                } else {
                    addSystemMessage('No se encontraron proyectos documentados.');
                }
            } catch (error: any) {
                addErrorMessage(error.message);
            }
        }
    };
 function addHistoryItem(item: HistoryItem) {
        history = [...history, item];
        setTimeout(() => {
            const container = terminalElement.querySelector('.terminal-output');
            container?.scrollTo(0, container.scrollHeight);
        }, 0);
    }

    function addSystemMessage(text: string) {
        addHistoryItem({ type: 'system', text });
    }

    function addErrorMessage(text: string) {
        addHistoryItem({ type: 'error', text });
    }

    onMount(() => {
        inputElement?.focus();
        terminalElement.focus();
    });

    function handleClose() {
        isChatModeActive = false;
        chatProjectContext = null;
        isTerminalVisible.set(false);
    }
    async function handleSubmit() {
        if (isLoading || !currentPrompt.trim()) return;

        const promptText = currentPrompt;
        addHistoryItem({ type: 'prompt', text: promptText, promptIndicator: promptIndicator }); // Usamos el valor reactivo
        currentPrompt = '';
        isLoading = true;

        const [command, ...args] = promptText.toLowerCase().trim().split(' ');
        const commandHandler = commands[command];

        if (commandHandler) {
            await commandHandler(args);
        } else if (isChatModeActive) {
            await handleAIChat(promptText);
        } else {
            addErrorMessage(`Comando no reconocido: '${command}'. Escribe '-h' para ver la lista.`);
        }

        isLoading = false;
        setTimeout(() => inputElement?.focus(), 0);
    }

    async function handleAIChat(prompt: string) {
        const responseIndex = history.length;
        addHistoryItem({ type: 'response', text: '' });

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    project: chatProjectContext
                })
            });

            if (!response.ok) {
                // Si la respuesta no es OK, es un error JSON del backend.
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido del servidor');
            }

            if (!response.body) {
                // Si la respuesta es OK pero no hay cuerpo, es un error inesperado.
                throw new Error('La respuesta del servidor estaba vacía.');
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                // Decodificar el chunk y añadirlo al buffer
                buffer += decoder.decode(value, { stream: true });
                
                // Procesar todas las líneas completas en el buffer
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Guardar la última línea (puede estar incompleta)

                for (const line of lines) {
                    if (line.trim() === '') continue;
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.response) {
                            // Añadir solo el texto de la respuesta al historial
                            history[responseIndex].text += parsed.response;
                        }
                    } catch (e) {
                        console.error('Error parseando JSON del stream:', line);
                    }
                }
                history = [...history];
                scrollToBottom();
            }
        } catch (err: any) {
            history[responseIndex] = { type: 'error', text: err.message || 'No se pudo conectar con el servidor.' };
            history = [...history];
        }
    }

    function scrollToBottom() {
        setTimeout(() => {
            const container = terminalElement.querySelector('.terminal-output');
            if (container) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            }
        }, 0);
    }

      $: promptIndicator = isChatModeActive
        ? `Søren-Chat${chatProjectContext ? `(${chatProjectContext})` : ''}>`
        : $currentPath + '>'; // Usamos el valor del store
</script>


<!-- svelte-ignore a11y-autofocus -->
<div
    bind:this={terminalElement}
    class="terminal-overlay position-fixed bottom-0 start-0 w-100 d-flex flex-column"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-label="Terminal"
    on:keydown={(e) => {
        if (e.key === 'Escape') handleClose();
    }}
>
    <div class="d-flex justify-content-end p-2">
        <button class="btn-close btn-close-white" on:click={handleClose} aria-label="Cerrar Terminal"></button>
    </div>

    <div
        class="terminal-content flex-grow-1 d-flex flex-column overflow-hidden px-3 pb-3"
        role="button"
        tabindex="0"
        on:click={() => inputElement?.focus()}
        on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputElement?.focus();
        }}
    >
        <div class="terminal-output flex-grow-1 overflow-y-auto pe-2">
            {#each history as item, i (i)}
                <div class="line mb-2">
                    {#if item.type === 'prompt'}
                        <span class="prompt-user">{history[i - 1]?.type === 'prompt' && isChatModeActive ? `Søren-Chat${chatProjectContext ? `(${chatProjectContext})` : ''}>` : 'C:\\>'}</span>
                        <span>{item.text}</span>
                    {:else if item.type === 'response'}
                        <div>
                            <span class="prompt-soren">Søren:</span>
                            <p class="d-inline">{item.text}</p>
                        </div>
                    {:else if item.type === 'error'}
                        <div>
                            <span class="prompt-error">Error:</span>
                            <p class="d-inline">{item.text}</p>
                        </div>
                    {:else}
                        <div class="system-message mb-0">{@html item.text}</div>
                    {/if}
                </div>
            {/each}
            {#if isLoading}
                <div class="line">
                    <span class="prompt-soren">Søren:</span>
                    <span class="thinking">...</span>
                </div>
            {/if}
        </div>

        <div class="terminal-input d-flex align-items-center mt-2">
            <span class="prompt-user">{promptIndicator}</span>
            <input
                bind:this={inputElement}
                bind:value={currentPrompt}
                on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
                type="text"
                class="form-control-plaintext bg-transparent text-light flex-grow-1"
                spellcheck="false"
                autocomplete="off"
                disabled={isLoading}
                autofocus
            />
        </div>
    </div>
</div>

<style>
    .terminal-overlay {
        height: 70vh;
        background-color: rgba(26, 26, 26, 0.9);
        backdrop-filter: blur(5px);
        border-top: 1px solid #444;
        z-index: 1000;
        animation: slide-up 0.3s ease-out;
        font-family: 'Consolas', 'Courier New', monospace;
    }
    .terminal-output {
        scrollbar-width: thin;
        scrollbar-color: #555 #333;
    }
    .line p,
    .line div {
        white-space: pre-wrap;
        word-break: break-word;
    }
    .prompt-user {
        color: #39c539;
        margin-right: 0.5rem;
    }
    .prompt-soren {
        color: #d7ba7d;
        margin-right: 0.5rem;
    }
    .prompt-error {
        color: #f44747;
        margin-right: 0.5rem;
    }
    .system-message {
        color: #808080;
    }
    :global(.command-highlight) {
        color: #9cdcfe;
        font-weight: bold;
    }
    .form-control-plaintext:focus {
        outline: none;
        box-shadow: none;
    }
    .thinking {
        animation: blink 1s infinite;
    }
    @keyframes blink {
        50% {
            opacity: 0;
        }
    }
    @keyframes slide-up {
        from {
            transform: translateY(100%);
        }
        to {
            transform: translateY(0);
        }
    }
</style>