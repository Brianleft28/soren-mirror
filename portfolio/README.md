# Portfolio v2 - Brian Benegas

Un portfolio interactivo con temática de explorador de archivos, diseñado para demostrar habilidades full-stack a través de una arquitectura de microservicios dockerizados.

### Stack Tecnológico

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 🎯 Arquitectura y Estrategia


Este proyecto sigue un patrón de **arquitectura de microservicios dockerizados**, organizados en un **monorepo** y orquestados a través de `docker-compose`.

-   **Frontend:** Un servicio SvelteKit responsable de la interfaz de usuario.
-   **Backend:** Un servicio Nest.js que expone una API RESTful.
-   **Base de Datos:** Un servicio MySQL para la persistencia de datos.

`Docker Compose` crea una red privada donde los servicios se comunican por sus nombres (ej. el frontend llama a `http://api:3000`).

### Flujo de Despliegue (CI/CD)

El proyecto está configurado para un despliegue continuo totalmente automatizado en un VPS. Un `push` a `main` dispara un workflow de GitHub Actions que construye, publica y despliega las nuevas imágenes Docker.

---

## 🗺️ Roadmap y Documentación

La planificación detallada y la documentación técnica del proyecto se encuentran dentro de la carpeta `frontend/src/lib/docs`.

-   **[Ver el Roadmap del Proyecto](./src/lib/docs/roadmap.MD)**
-   **[Ver Guía de Migración a Monorepo](./src/lib/docs/monorepo-setup.md)**
-   **[Ver Diseño de la Base de Datos](./src/lib/docs/database-schema.md)**

---

## 📁 Estructura del Monorepo

```
.
├── api/                  # Microservicio de Backend (NestJS)
├── frontend/             # Microservicio de Frontend (SvelteKit)
└── docker-compose.yml    # Orquesta todos los servicios
```

---

## 🏃‍♂️ Desarrollo Local

Existen dos formas de trabajar en este proyecto.

### Opción 1: Ejecutar la Arquitectura Completa (Recomendado)

Este método utiliza Docker Compose para levantar todos los microservicios y simular el entorno de producción.

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/Brianleft28/portfolio_sveltekit.git
    cd portfolio_sveltekit
    ```
2.  **Levantar los servicios:**
    ```bash
    docker-compose up -d --build
    ```
3.  **Acceder:** El frontend estará disponible en `http://localhost:5173`.

### Opción 2: Desarrollar un Servicio de Forma Aislada

Si solo necesitas trabajar en un servicio específico sin levantar toda la infraestructura.

**Para el Frontend (SvelteKit):**
```bash
cd frontend
npm install
npm run dev
```

**Para el Backend (NestJS):**
```bash
cd api
npm install
npm run start:dev
```

---

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 👤 Autor

**Brian Benegas**

-   Sitio web: [brianleft.com](https://portfolio.brianleft.com)
-   GitHub: [Brianleft28](https://github.com/Brianleft28)
-   LinkedIn: [Brian Benegas](https://www.linkedin.com/in/brian-benegas-44770729b/) 