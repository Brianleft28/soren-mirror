<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { isTerminalVisible } from '../lib/stores/ui';
    import Terminal from '$lib/components/Terminal.svelte';

    onMount(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && (event.key === 'ñ' || event.key === 'Ñ')) {
                event.preventDefault();
                isTerminalVisible.update((visible) => {
                    const newVisible = !visible;
                    console.log(`[DEBUG] Terminal visibility toggled: ${newVisible}`);
                    return newVisible;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });
</script>

<svelte:head>
    <title>brianbenegas.js</title>

    <meta
        name="description"
        content="Explora el portfolio de Brian Benegas, un desarrollador de software especializado en la creación de aplicaciones web robustas y escalables con tecnologías como SvelteKit, Nest.js y Docker."
    />
    <meta name="author" content="Brian Benegas" />
    <meta property="og:title" content="Brian Benegas - Portfolio" />
    <meta
        property="og:description"
        content="Un vistazo a los proyectos, habilidades y experiencia de Brian Benegas."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://brianleft.com" />
    <meta property="og:image" content="https://brianleft.com/social-preview.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Portfolio BB" />
    <meta
        name="twitter:description"
        content="Explora los proyectos y la experiencia de Brian Benegas."
    />
    <meta name="twitter:image" content="https://brianleft.com/social-preview.png" />
</svelte:head>

<main class="container-fluid font-monospace">
    <slot />
</main>

<!-- La terminal se renderiza aquí, fuera del <main> para que sea un overlay global -->
{#if $isTerminalVisible}
    <Terminal />
{/if}