# ai-support-triage

# ai-support-triage

# AI Support Triage System

A backend system for ingesting, deduplicating, and processing high-frequency support tickets via webhook ingestion and asynchronous AI triage.

Designed as a modular monolith with an event-driven architecture and a future-ready AI + human-in-the-loop pipeline.

---

# Overview

This service processes incoming support tickets from external systems via webhook requests.

It ensures:

- safe ingestion using idempotency
- structured validation using Zod
- asynchronous processing via a job queue
- AI-based ticket classification and response generation
- human review and final resolution flow

The system simulates a real-world support automation pipeline used in production-grade SaaS systems.

---

# Architecture

## System Design

Modular Monolith with clear domain separation:

- API Layer (Fastify)
- Data Layer (PostgreSQL + Drizzle ORM)
- Cache Layer (Redis)
- Queue Layer (BullMQ)
- Worker Layer (AI triage processor)

---

## Tech Stack

- **Runtime:** Node.js (v20+)
- **Language:** TypeScript (strict mode)
- **Framework:** Fastify
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Queue:** BullMQ
- **Cache / Idempotency Store:** Redis (ioredis)
- **Validation:** Zod
- **Containerization:** Docker Compose

---

# Current Implementation (Completed)

## 1. Ticket Ingestion Endpoint

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

### Asynchronous Processing (BullMQ)

#### After ticket creation:

- Ticket is enqueued into triage queue
- Worker consumes job from Redis queue

### Worker-Based AI Triage Pipeline

#### Worker responsibilities:

Step flow:

- Receive job from queue
- Fetch ticket from database
- Update status → `triaged`
- Call AI service (Claude)
  Validate AI output using Zod schema:
  - category
  - priority
  - sentiment
  - suggested_reply
- Persist AI analysis to ticket
- Insert record into ai_runs
- Update ticket status → awaiting_review

### Human Review Endpoint

`POST /tickets/:id/reply`

Used by support agents to:

- approve AI response
- edit AI response
- reject AI response

Behavior:

- Inserts record into agents_action
- Updates ticket status:
- `approve → sent`
- `reject → closed`
  Stores final reply text

### Ticket Lifecycle

```
new
→ triaged
→ awaiting_review
→ sent / closed
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
ticket_id
model
prompt_hash
input_tokens
output_tokens
cost_usd
latency_ms
response_json
created_at
```

#### agents_action (future stage)

- Tracks human agent decisions:

```
ticket_id
tool_name (approve | edit | reject)
input
output
created_at
```

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

#### Idempotency via Redis

`Ensures webhook safety under retries and network instability.`

#### Event-driven Architecture

`Decouples API layer from AI processing using BullMQ.`

#### Worker-based AI processing

`Keeps AI workload off the main API thread.`

#### Modular Monolith

Chosen to:

- simplify development
- maintain clear domain boundaries
- allow future microservice extraction

Drizzle ORM

- lightweight
- type-safe
- minimal abstraction overhead

Zod Validation

- ensures strict runtime validation
- guarantees AI + API data consistency

### Current Status

```
✔ Step 1: Infrastructure setup
✔ Step 2: Ticket ingestion + idempotency
✔ Step 3: Queue + worker system (DONE)
✔ Step 4: AI triage pipeline (DONE)
✔ Step 5: Agent review system (DONE) ticket status transitions (triaged → awaiting_review)
```

### Summary

- This system now implements a full production-style support pipeline:

- webhook ingestion
- idempotent processing
- asynchronous queue system
- AI classification + response generation
- structured persistence (tickets + AI logs)
- human review workflow
- complete ticket lifecycle management
