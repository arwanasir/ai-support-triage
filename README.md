# ai-support-triage

A service-based intelligent triage system designed for processing high-frequency webhooks and automated data classification.

---

## Architecture & Design

The project utilizes a **Modular Monolith** architecture to ensure low-latency processing and type-safe data flow.

### Core Stack

- **Runtime:** Node.js (v20+) with **TypeScript** for strict type safety.
- **Web Framework:** **Fastify** (chosen for its superior overhead-to-performance ratio compared to Express).
- **Data Layer:** **PostgreSQL** orchestrated with **Drizzle ORM** for lightweight, SQL-like interactions.
- **Caching & Messaging:** **Redis** for asynchronous task queuing and state management.
- **Orchestration:** **Docker Compose** for containerized database and cache services.

---

## Professional Setup

### 1. Environment Preparation

Create a `.env` file in the root directory and configure the following variables:

```env
# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/triage_db

# Redis Connection
REDIS_URL=redis://localhost:6379

# API Config
PORT=3000
NODE_ENV=development
```

### 2. Infrastructure Initialization

Spin up the persistent storage layers using Docker:

```bash
docker-compose up -d db redis
```

### 3. Dependency & Schema Management

Install the workspace dependencies and push the schema to the database using the Drizzle Kit:

```bash
npm install
npx drizzle-kit push
```

### 4. Development Execution

Run the API service locally to leverage full system resources:

```bash
cd apps/api
npm install
npm run dev
```

### Architecture

The project is structured as a Modular Monolith to balance development speed with future scalability:

- **API Layer:** Built with Fastify and Node.js for low-overhead, asynchronous webhook handling.

- **Data Layer:** Managed by PostgreSQL with Drizzle ORM for type-safe database interactions and migrations.

- **Message Broker:** Redis is utilized for task queuing to ensure no webhook data is lost during high-traffic bursts.

- **Orchestration:** Development environment orchestrated via Docker to ensure consistency across different machines.

### Trade-offs

- **Hybrid Runtime:** Running the database and cache in Docker while executing the API "on the metal" (locally). This bypasses common Docker memory resource limits (Exit Code 254) and provides significantly faster development feedback loops.

- **Drizzle ORM:** Chosen over heavier ORMs for its minimal abstraction layer and zero-runtime overhead, aligning with the goal of building a lightweight, high-performance service.

- **Modular Monolith vs. Microservices:** Prioritizing a modular monolith initially to reduce dev-ops complexity while maintaining clear domain boundaries for future extraction.
