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
<!-- Adicione aqui um print da página inicial (http://localhost:3000) -->
![Landing Page](docs/screenshots/landing.png)

---

### Trip List
<!-- Adicione aqui um print da lista de viagens (http://localhost:3000/trips) -->
![Trip List](docs/screenshots/trips.png)

---

### Create Trip
<!-- Adicione aqui um print do formulário de criação -->
![Create Trip](docs/screenshots/new-trip.png)

---

### AI Agent Workspace
<!-- Adicione aqui um print do workspace com o chat funcionando -->
![Workspace](docs/screenshots/workspace.png)

---

### Multi-Agent Chat
<!-- Adicione aqui um print mostrando diferentes agentes respondendo (Destination, Budget, Hotel, Itinerary) -->
![Multi-Agent Chat](docs/screenshots/agents-chat.png)

---

### API Documentation
<!-- Adicione aqui um print do Swagger UI (http://localhost:8000/api/docs) -->
![API Docs](docs/screenshots/api-docs.png)

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
│     Landing · Trip List · New Trip · Workspace           │
└─────────────────────┬───────────────────────────────────┘
                       │ REST + SSE
                       ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI — Python 3.12                        │
│     /api/v1/trips   ·   /api/v1/agents                   │
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
| Styling | TailwindCSS, shadcn/ui | Rapid UI development, accessible components |
| Backend | FastAPI, Python 3.12 | Async-native, auto OpenAPI, Pydantic |
| ORM | SQLAlchemy 2.0, Alembic | Async queries, typed models, migrations |
| AI Orchestration | LangGraph, LangChain | Graph-based multi-agent workflows |
| LLM | Groq (LLaMA 3.3 70b) | 10x faster inference than OpenAI for dev |
| Database | PostgreSQL 16 + pgvector | Relational + vector storage in one service |
| Cache | Redis 7 | Session state, rate limiting |
| Infra | Docker Compose, Nginx | One-command setup, reverse proxy with SSE |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Python 3.12](https://www.python.org/downloads/release/python-31210/)
- [Node.js 20+](https://nodejs.org)
- [Groq API Key](https://console.groq.com) — free tier available

### 1. Clone the repository

```bash
git clone https://github.com/your-username/voyageai.git
cd voyageai
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

## Usage

### Creating a trip

<!-- Adicione aqui um GIF ou sequência de prints mostrando o fluxo completo:
     1. Clicar em "New Trip"
     2. Preencher o formulário
     3. Ser redirecionado para o workspace -->

1. Go to http://localhost:3000
2. Click **Get Started** or **Plan a Trip**
3. Fill in destination, duration, budget and preferences
4. Click **Create Trip** — you'll be redirected to the workspace

### Chatting with agents

<!-- Adicione aqui prints mostrando cada agente respondendo com seu nome -->

Each message is automatically routed to the best agent:

| Ask about | Agent |
|---|---|
| Attractions, culture, tips | 🗺️ Destination Agent |
| Costs, budget breakdown | 💰 Budget Agent |
| Hotels, neighborhoods | 🏨 Hotel Agent |
| Day-by-day schedule | 📅 Itinerary Agent |
| General questions | 🤖 Coordinator Agent |

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
│   │       ├── app/               # Pages and routing
│   │       │   ├── page.tsx       # Landing page
│   │       │   ├── trips/         # Trip list
│   │       │   │   ├── new/       # Create trip form
│   │       │   │   └── [id]/      # Trip workspace
│   │       ├── components/
│   │       │   ├── ui/            # shadcn components
│   │       │   └── features/
│   │       │       └── trip/      # TripWorkspace
│   │       ├── lib/
│   │       │   └── api/           # API clients
│   │       └── types/             # TypeScript types
│   │
│   └── backend/                   # FastAPI
│       └── app/
│           ├── api/v1/routes/     # trips.py, agents.py
│           ├── core/              # config.py, database.py
│           ├── models/            # SQLAlchemy ORM
│           ├── schemas/           # Pydantic DTOs
│           ├── services/          # Business logic
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
│           ├── state.py           # TripPlanningState
│           └── workflow.py        # LangGraph + routing
│
├── infrastructure/
│   ├── docker/                    # Dockerfiles
│   └── nginx/                     # nginx.conf
│
├── docs/
│   └── screenshots/               # Add your screenshots here
│
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

Server-Sent Events are HTTP-native, work through proxies without special configuration, and are sufficient for unidirectional streaming (server → client). WebSockets add handshake complexity and stateful connections without benefit for this use case.

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

### v0.4 — Export & Share
- [ ] PDF itinerary export
- [ ] Shareable trip links
- [ ] Email itinerary delivery

### v0.5 — Integrations
- [ ] Google Flights price lookup
- [ ] Booking.com hotel availability
- [ ] Google Maps integration

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
