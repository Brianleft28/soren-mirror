# Repositorio Principal

Este espacio de trabajo contiene varios proyectos relacionados:

- **[`portfolio/`](./portfolio/)**: Mi portafolio personal.
- **[`soren-mirror/`](./soren-mirror/)**: Un agente de IA diseñado como un "Segundo Cerebro".

Para más detalles sobre cada proyecto, consulta el archivo `README.md` dentro de su respectivo directorio.

## 🐳 Arquitectura Docker

Este espacio de trabajo utiliza Docker para contenerizar y orquestar los servicios, principalmente el proyecto `soren-mirror`.

-   **Sistema Dockerizado**: El proyecto [`soren-mirror/`](soren-mirror/) es una aplicación Node.js que se ejecuta dentro de un contenedor Docker. Esto garantiza un entorno de ejecución consistente y aislado, independientemente de la máquina donde se ejecute.

-   **Orquestación con Docker Compose**: El archivo `docker.compose` en la raíz del proyecto se utiliza para definir y gestionar los servicios de la aplicación. Este archivo lee la configuración de los `Dockerfile` de cada proyecto para construir las imágenes y coordinar los contenedores.

Para iniciar los servicios, puedes usar el comando especificado en la documentación de `soren-mirror`:

```yml
docker-compose up -d -f
```

Este comando leerá el archivo `docker.compose`, construirá la imagen del contenedor de `soren-mirror` si aún no existe y ejecutará la aplicación en segundo plano.
