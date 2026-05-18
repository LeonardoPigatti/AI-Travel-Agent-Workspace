# VoyageAI 🗺️

> AI-powered travel planning platform with multiple collaborative agents

VoyageAI is a full-stack SaaS application where specialized AI agents work together to plan your perfect trip — researching destinations, optimizing budgets, suggesting accommodations, and generating day-by-day itineraries.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-blue)](https://langchain-ai.github.io/langgraph)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://postgresql.org)

---

## Screenshots

### Landing Page
<img width="1920" height="1080" alt="Captura de tela 2026-05-18 022533" src="https://github.com/user-attachments/assets/898b7442-9c78-46e8-8aec-a12eaacb8b3b" />
<img width="1920" height="1080" alt="Captura de tela 2026-05-18 022545" src="https://github.com/user-attachments/assets/6c29c582-522a-411d-a550-1441e5516097" />

---

### Trip List
<img width="1920" height="1080" alt="Captura de tela 2026-05-18 022613" src="https://github.com/user-attachments/assets/a228c673-293a-4c8a-9910-5d9ce36a4770" />

---

### Create Trip
<img width="1920" height="1080" alt="Captura de tela 2026-05-18 022900" src="https://github.com/user-attachments/assets/3fcb005c-b707-4b3a-a415-4aaaf72526a4" />
<img width="1920" height="1080" alt="Captura de tela 2026-05-18 023151" src="https://github.com/user-attachments/assets/41df31c6-be63-4d3e-9073-11d240137d1d" />


---

### AI Agent Workspace
<img width="1920" height="1080" alt="Captura de tela 2026-05-18 024033" src="https://github.com/user-attachments/assets/a9ca0842-6ba2-45af-ae3b-729ab8aeaa21" />
<img width="1920" height="1080" alt="Captura de tela 2026-05-18 023451" src="https://github.com/user-attachments/assets/7bdf97fc-4869-4fc0-839f-f055682e318a" />
<img width="1920" height="1080" alt="Captura de tela 2026-05-18 023300" src="https://github.com/user-attachments/assets/ecec127a-6b3f-46b7-83b9-ee6953db8cac" />


---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        User Browser                      │
└─────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 — App Router                     │
│  Landing · Trip List · New Trip · Workspace · Share      │
└─────────────────────┬───────────────────────────────────┘
                       │ REST + SSE
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI — Python 3.12                        │
│     /api/v1/trips  ·  /api/v1/agents  ·  /api/v1/export │
│     SQLAlchemy · Alembic · Pydantic                      │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐     ┌───────────────────────────────┐
│  PostgreSQL 16   │     │     LangGraph Orchestration    │
│  + pgvector      │     │                               │
│                  │     │  ┌─────────────────────────┐  │
│  trips           │     │  │  Router (LLM-based)      │  │
│  agent_sessions  │     │  └────────────┬────────────┘  │
│  messages        │     │               │               │
└──────────────────┘     │   ┌───────────▼───────────┐   │
                         │   │    Coordinator Agent   │   │
┌──────────────────┐     │   └───────────────────────┘   │
│  Redis 7         │     │   ┌───────┐ ┌───────┐         │
│                  │     │   │  Dst  │ │  Bdg  │         │
│  Session cache   │     │   └───────┘ └───────┘         │
│  Rate limiting   │     │   ┌───────┐ ┌───────┐         │
└──────────────────┘     │   │  Htl  │ │  Itn  │         │
                         │   └───────┘ └───────┘         │
                         └───────────────────────────────┘
```

### Agent Routing Flow

```
User Message
      │
      ▼
  Router Node (LLM decides)
      │
      ├──► Destination Agent  → attractions, culture, tips
      ├──► Budget Agent       → costs, breakdown, savings
      ├──► Hotel Agent        → accommodation, neighborhoods
      ├──► Itinerary Agent    → day-by-day schedule
      └──► Coordinator Agent  → general, unclear requests
      │
      ▼
  SSE Streaming → Frontend
      │
      ▼
  Saved to PostgreSQL
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16, TypeScript | App Router, Server Components, type safety |
| Styling | TailwindCSS v4, shadcn/ui, Framer Motion | Premium UI, animations, accessible components |
| Backend | FastAPI, Python 3.12 | Async-native, auto OpenAPI, Pydantic |
| ORM | SQLAlchemy 2.0, Alembic | Async queries, typed models, migrations |
| AI Orchestration | LangGraph, LangChain | Graph-based multi-agent workflows |
| LLM | Groq (LLaMA 3.3 70b) | 10x faster inference than OpenAI for dev |
| Database | PostgreSQL 16 + pgvector | Relational + vector storage in one service |
| Cache | Redis 7 | Session state, rate limiting |
| PDF | ReportLab | Server-side PDF generation, no system deps |
| Images | Pexels API | Real destination photos |
| Infra | Docker Compose, Nginx | One-command setup, reverse proxy with SSE |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Python 3.12](https://www.python.org/downloads/release/python-31210/)
- [Node.js 20+](https://nodejs.org)
- [Groq API Key](https://console.groq.com) — free tier available
- [Pexels API Key](https://www.pexels.com/api/) — free tier available

### 1. Clone the repository

```bash
git clone https://github.com/LeonardoPigatti/AI-Travel-Agent-Workspace.git
cd AI-Travel-Agent-Workspace
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
GROQ_API_KEY=gsk_your_key_here
SECRET_KEY=your_secret_key_here
```

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_key_here
```

### 3. Start infrastructure

```bash
docker compose up -d postgres redis
```

Verify both services are healthy:

```bash
docker compose ps
```

### 4. Start backend

```bash
cd apps/backend

# Windows
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1

# macOS/Linux
python3.12 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 5. Start frontend

```bash
cd apps/frontend
npm install
npm run dev
```

### Access

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Docs | http://localhost:8000/api/docs |

---

## Features

### AI Agent Chat
Each message is automatically routed to the best specialist agent:

| Ask about | Agent |
|---|---|
| Attractions, culture, tips | ◎ Destination Agent |
| Costs, budget breakdown | ◈ Budget Agent |
| Hotels, neighborhoods | ◇ Hotel Agent |
| Day-by-day schedule | ◉ Itinerary Agent |
| General questions | ⬡ Coordinator Agent |

### Workspace
- Real-time streaming chat with token-by-token SSE responses
- Persistent session history — reopen a trip and continue where you left off
- Google Maps embed in dark mode showing the destination
- Booking links for Google Flights, Booking.com, Airbnb and TripAdvisor with pre-filled dates
- Export itinerary as a formatted PDF
- Share trip via public read-only link

### Trip Management
- Create trips with destination, duration, budget and preferences
- Live destination photo preview powered by Pexels API
- Quick start suggestions for popular destinations
- Trip list with real destination photos

---

## API Reference

### Trips

```
POST   /api/v1/trips/           Create a new trip
GET    /api/v1/trips/           List all trips (paginated)
GET    /api/v1/trips/{id}       Get trip by ID
PATCH  /api/v1/trips/{id}       Update trip
DELETE /api/v1/trips/{id}       Delete trip
```

### Agents

```
POST   /api/v1/agents/run                       Run agent — returns SSE stream
GET    /api/v1/agents/sessions/{trip_id}        Get chat history for a trip
POST   /api/v1/agents/sessions/{id}/messages    Save agent message
```

### Export

```
GET    /api/v1/export/trips/{id}/pdf            Export trip as PDF
```

### Health

```
GET    /api/health    System health check
```

---

## Project Structure

```
voyageai/
├── apps/
│   ├── frontend/                  # Next.js 16 App Router
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx           # Landing page
│   │       │   ├── trips/             # Trip list
│   │       │   │   ├── new/           # Create trip form
│   │       │   │   └── [id]/          # Trip workspace
│   │       │   └── share/[id]/        # Public share page
│   │       ├── components/
│   │       │   ├── ui/                # shadcn components
│   │       │   └── features/trip/
│   │       │       ├── TripWorkspace.tsx
│   │       │       └── ShareWorkspace.tsx
│   │       ├── lib/
│   │       │   ├── api/               # trips, agents, pexels clients
│   │       │   └── utils/markdown.tsx # Custom markdown renderer
│   │       └── types/trip.ts
│   │
│   └── backend/                   # FastAPI
│       └── app/
│           ├── api/v1/routes/     # trips.py, agents.py, export.py
│           ├── core/              # config.py, database.py
│           ├── models/            # SQLAlchemy ORM
│           ├── schemas/           # Pydantic DTOs
│           ├── services/          # pdf_service.py
│           └── repositories/      # DB access layer
│
├── services/
│   └── ai-agents/                 # LangGraph pipeline
│       ├── agents/
│       │   ├── base.py            # BaseAgent, LLM factory
│       │   ├── coordinator.py
│       │   ├── destination.py
│       │   ├── budget.py
│       │   ├── hotel.py
│       │   └── itinerary.py
│       └── graph/
│           ├── state.py           # TripPlanningState TypedDict
│           └── workflow.py        # LangGraph + LLM router
│
├── infrastructure/
│   ├── docker/                    # Dockerfiles
│   └── nginx/nginx.conf           # Reverse proxy + SSE config
│
├── docs/screenshots/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Technical Decisions

### Why LangGraph over plain LangChain?

LangChain chains are linear — A → B → C. LangGraph uses a state graph where nodes can conditionally route to different agents, share state, and loop. This enables the routing pattern where one LLM call decides which specialist handles the message, and each specialist enriches the shared state (destination research, budget breakdown) that subsequent agents can use.

### Why Groq?

Development velocity. Groq's LPU delivers ~10x faster inference than OpenAI API for LLaMA models, making the streaming feel instant during development. Swapping to GPT-4o in production requires changing one environment variable — `OPENAI_API_KEY` — since LangChain abstracts the provider.

### Why SSE over WebSockets?

Server-Sent Events are HTTP-native, work through proxies without special configuration, and are sufficient for unidirectional streaming (server → client). WebSockets add handshake complexity and stateful connections without benefit for this use case. Nginx is configured with `proxy_buffering off` to prevent buffering the stream at the edge.

### Why ReportLab over WeasyPrint?

WeasyPrint requires GTK system libraries unavailable on Windows without complex setup. ReportLab is pure Python with no system dependencies — works identically on Windows, macOS and Linux.

### Why pgvector in PostgreSQL?

Keeps the MVP simple — vector embeddings for semantic memory live in the same database as relational data. No extra infrastructure, no extra cost. The architecture allows extracting to Pinecone or Weaviate later without changing application code.

### Why Repository Pattern?

Decouples business logic (services) from data access (repositories). The service layer doesn't know if data comes from PostgreSQL, a cache, or a mock — enabling easy testing and future changes to storage backends.

---

## Roadmap

### v0.2 — Authentication
- [ ] JWT-based auth with refresh tokens
- [ ] User registration and login pages
- [ ] Trip ownership and access control

### v0.3 — Enhanced AI
- [ ] pgvector semantic memory across sessions
- [ ] Parallel agent execution for faster responses
- [ ] Agent confidence scores and source citations

### v0.4 — Delivery
- [ ] Email itinerary delivery via Resend

### v1.0 — Production
- [ ] Kubernetes deployment
- [ ] Multi-tenancy with row-level security
- [ ] Usage-based billing
- [ ] Mobile app (React Native)

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ using Next.js, FastAPI, and LangGraph
</div>
