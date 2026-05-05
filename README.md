# ai-support-triage

# AI Support Triage System

A backend system for ingesting, deduplicating, and processing high-frequency support tickets via webhook ingestion.  
Designed as a modular monolith with a future-ready AI triage pipeline.

---

# Overview

This service processes incoming support tickets from external systems via webhook requests.  
It ensures safe ingestion using idempotency, persists structured ticket data, and prepares jobs for downstream asynchronous processing (AI triage pipeline coming next).

The system is designed with **production-style backend patterns** including:

- Idempotent request handling
- Event-driven architecture readiness
- Redis-backed caching layer
- Strong schema validation
- Structured relational data modeling

---

# Architecture

## System Design

Modular Monolith with clear domain separation:

- API Layer (Fastify)
- Data Layer (PostgreSQL + Drizzle ORM)
- Cache Layer (Redis)
- Async Layer (BullMQ-ready architecture)

---

## Tech Stack

- **Runtime:** Node.js (v20+)
- **Language:** TypeScript (strict mode)
- **Framework:** Fastify
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Cache / Idempotency Store:** Redis (ioredis)
- **Containerization:** Docker Compose
- **Validation:** Zod

---

# Current Implementation (Completed Step)

## Ticket Ingestion Endpoint

### `POST /webhooks/tickets`

Accepts:

```json
{
  "subject": "string",
  "body": "string",
  "customer_email": "string (valid email)"
}
```

## Idempotency Handling

Each request requires:

Idempotency-Key: <unique-key>

### Behavior:

- First request → ticket created + stored in Redis cache
- Duplicate request (same key) → returns cached response
- Prevents duplicate DB inserts under retries or network failures

### Response Format

```json
{
  "ticket_id": "uuid",
  "status": "queued"
}
```

### Request Flow

```
Request received at /webhooks/tickets
Zod validates request body
Idempotency-Key checked in Redis
If exists → return cached response
If not → continue processing
Ticket inserted into PostgreSQL
Response cached in Redis (24h TTL)
Response returned to client
```

### Database Schema

#### tickets

```
id (UUID, primary key)
subject (varchar)
body (text)
customer_email (text)
status (new → triaged → awaiting_review → sent → closed)
priority (default: P3)
category (default: other)
sentiment (nullable)
draft_reply (nullable)
created_at
updated_at
```

##### ai_runs (future stage)

- Tracks LLM execution metadata:

```
model
tokens
cost
latency
response JSON
```

#### agents_action (future stage)

- Tracks human agent decisions:
- approve / edit / reject actions
- final response submissions

### API Testing

- A full HTTP test suite is included in:

```
tickets.http
```

Covered Test Cases:

1. Happy Path

```
Valid ticket creation with idempotency key
```

2. Duplicate Request

```
Same Idempotency-Key → returns cached response, no duplicate DB insert
```

3. Validation Failure

```
Missing required fields → returns 400 error (Zod validation)
```

### Setup & Installation

1. Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/triage_db
REDIS_URL=redis://localhost:6379
PORT=3000
NODE_ENV=development
```

2. Start Infrastructure

```bash
docker-compose up -d db redis
```

3. Install Dependencies

```bash
npm install
```

4. Run Database Migrations

```bash
npx drizzle-kit push
```

5. Start Development Server

```bash
cd apps/api
npm run dev
```

### Key Design Decisions

- Idempotency via Redis
- Ensures webhook safety under retries or network instability.
- Modular Monolith Structure

Chosen to:

- Keep system simple in early stages
- Maintain clear separation of concerns
- Allow future extraction into microservices
- Drizzle ORM

Used for:

- Type-safe SQL queries
- Minimal abstraction overhead
- Predictable database behavior
- Zod Validation

Ensures:

- strict input validation
- early rejection of malformed requests
- type-safe request handling
- Docker Strategy

Only database + Redis are containerized:

- API runs locally for fast iteration
- reduces debugging friction
- avoids unnecessary container overhead

### Next Phase (Not Yet Implemented)

- BullMQ triage queue integration
- Worker-based ticket processing
- AI classification pipeline
- Structured LLM output validation
- ai_runs logging implementation
- ticket status transitions (triaged → awaiting_review)

### Project Status

```
✔ Step 1: Infrastructure setup
✔ Step 2: Ticket ingestion + idempotency (current)
⏳ Step 3: Queue + worker system
⏳ Step 4: AI triage pipeline
⏳ Step 5: Agent review system
```

### Summary

- This system is built to simulate a real-world support ticket pipeline with:

- reliable ingestion
- safe retry handling
- future AI automation integration
- structured backend architecture
