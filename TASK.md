# Task: Containerization & Deployment of a demo E-Commerce Application

## 1. Overview

You've been given the source code for a simple 3-tier e-commerce application:

```
+------------------------------------------------+
|                 Frontend Tier                  |
|              React Web Application              |
+------------------------+-----------------------+
                         |
                         v
+------------------------------------------------+
|              Application Tier                  |
|             Java Spring Boot API               |
+------------------------+-----------------------+
                         |
                         v
+------------------------------------------------+
|                 Database Tier                  |
|                  PostgreSQL                    |
+------------------------------------------------+
```

- **Frontend**: React app (`/frontend`) that calls `GET /api/products` on the backend and renders a product list.
- **Backend**: Spring Boot REST API (`/backend`) exposing `/api/products` (GET/POST), backed by PostgreSQL via Spring Data JPA.
- **Database**: PostgreSQL, with an optional seed script at `/database/init.sql`.

**None of these services have Dockerfiles yet, and there is no docker-compose setup.** Your job is to containerize all three tiers and wire them together so the whole stack runs with a single command.

This task is meant to make you comfortable with: multi-stage builds, image size/layer optimization, environment variable configuration, container networking, volumes, and basic health checks.

---

## 2. Tasks

### Task A — Dockerize the Backend (Spring Boot)
1. Write a `Dockerfile` in `/backend` that:
   - Uses a **multi-stage build**: one stage to build the JAR with Maven, a second, smaller stage to run it (e.g. a JRE-only base image).
   - Does **not** bake DB credentials into the image — they must come from environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) which are already wired up in `application.properties`.
   - Exposes port `8080`.
   - Runs as a **non-root user**.

### Task B — Dockerize the Frontend (React)
1. Write a `Dockerfile` in `/frontend` that:
   - Uses a **multi-stage build**: one stage to `npm install && npm run build`, a second stage that serves the static build output using **nginx** (or another lightweight web server).
   - Exposes port `80`.
2. Investigate and answer (in writing, a few sentences): React env vars like `REACT_APP_API_URL` are baked in at **build time**. What are two different strategies you could use to make the backend URL configurable per-environment (e.g. dev vs prod) without rebuilding the image each time? Pick one and implement it.

### Task C — Database
1. You do **not** need to write a custom Dockerfile for PostgreSQL — use the official `postgres` image.
2. Figure out how to mount `/database/init.sql` so it runs automatically on first container startup (hint: look into how the official postgres image handles an init directory).
3. Add a **named volume** so data persists across container restarts.

### Task D — Publish Images to Docker Hub
1. Create Docker Hub repositories for the frontend and backend images.
2. Build and tag the images:
   docker build -t <dockerhub-username>/ecommerce-backend:1.0 ./backend
   docker build -t <dockerhub-username>/ecommerce-frontend:1.0 ./frontend
3. Log in to Docker Hub and push the images:
   docker login

   docker push <dockerhub-username>/ecommerce-backend:1.0
   docker push <dockerhub-username>/ecommerce-frontend:1.0
4. Update the deployment configuration to use the published images and verify that the application can be started successfully by pulling the images from Docker Hub instead of building them locally.

### Task E — Orchestration with Docker Compose
Write a `docker-compose.yml` at the project root that:
1. Defines three services: `frontend`, `backend`, `db`.
2. Puts all services on a **custom bridge network**.
3. Backend depends on the database being not just *started* but **actually ready** to accept connections (hint: `depends_on` with `condition: service_healthy`, plus a `healthcheck` on the `db` service).
4. Frontend depends on the backend similarly.
5. Passes all required environment variables to the backend (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) — use a `.env` file, do not hardcode secrets in the compose file.
6. Maps sensible host ports for frontend (e.g. `3000:80`) and backend (e.g. `8080:8080`). Database port does **not** need to be exposed to the host.
7. Adds healthchecks for backend (`/actuator/health`) and db.

### Task F — Verification
Once `docker compose up -d` runs successfully:
1. Confirm `http://localhost:8080/api/products` returns the seeded product list as JSON.
2. Confirm `http://localhost:3000` renders the product list in the browser.
3. Stop and restart the stack (`docker compose down` then `docker compose up`, **without** `-v`) and confirm the product data persisted.
4. Run `docker images` and note the final image sizes for frontend and backend — could either be made smaller? How?

---

## 3. Stretch Goals (optional, if you finish early)
- Add a `.dockerignore` to both `frontend` and `backend` to keep build contexts small.
- Convert one of the Dockerfiles to use a specific pinned base image digest instead of a floating tag, and explain why that matters.
- Add resource limits (`mem_limit`, `cpus`) to each service in compose.


---

## 4. Deliverables
Please submit:
1. `backend/Dockerfile`
2. `frontend/Dockerfile`
3. `docker-compose.yml`
4. `.env.example` (showing required variable names, no real secrets)
5. A short note answering:
   - Your answer to the env var question in Task B.2
   - The image size findings from Task F.4
   - Anything that tripped you up and how you solved it

---

## 5. Useful Hints
- Spring Boot Actuator is already included as a dependency — `/actuator/health` is available out of the box once the app starts.
- The official `postgres` Docker image automatically runs any `.sql`/`.sh` scripts placed in `/docker-entrypoint-initdb.d/` on first startup of an **empty** data directory.
- `depends_on` with only a service name (no `condition`) just waits for the container to *start*, not for the app inside to be *ready* — this is a very common source of "connection refused" bugs.
- You will likely need a `.dockerignore` for the backend to avoid copying `target/` into the build context, and one for the frontend to avoid copying `node_modules/`.
