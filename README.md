# Multi-Agent Research Assistant

A general-purpose multi-agent system using LangGraph and Tavily API for real-time web research with a modern Next.js frontend and Python/FastAPI backend.

## Project Overview

This project implements a multi-agent research system where specialized AI agents collaborate to answer user queries:

1. **Orchestrator Agent** - Analyzes queries and creates execution plans
2. **Researcher Agent** - Performs real-time web searches using Tavily API
3. **Validator Agent** - Fact-checks and verifies information
4. **Synthesizer Agent** - Generates coherent, well-cited responses

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                              │
│  ┌─────────────┐  ┌─────────────────┐  ┌────────────────────────────────┐   │
│  │ Thread List │  │  Chat Interface │  │  Agent Activity Panel          │   │
│  └─────────────┘  └─────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                              REST API + SSE
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI + LangGraph)                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                          LangGraph Workflow                            │  │
│  │                                                                        │  │
│  │   ┌────────────┐    ┌────────────┐    ┌───────────┐    ┌───────────┐  │  │
│  │   │Orchestrator│───▶│ Researcher │───▶│ Validator │───▶│Synthesizer│  │  │
│  │   └────────────┘    └────────────┘    └───────────┘    └───────────┘  │  │
│  │         │                  │                                          │  │
│  │         │                  │                                          │  │
│  │         ▼                  ▼                                          │  │
│  │    OpenAI API         Tavily API                                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MongoDB Atlas                                     │
│  ┌─────────────┐  ┌─────────────────┐  ┌────────────────────────────────┐   │
│  │  sessions   │  │     queries     │  │        agent_outputs           │   │
│  └─────────────┘  └─────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TailwindCSS, assistant-ui |
| Backend | Python 3.11+, FastAPI, LangGraph, LangChain |
| LLM | OpenAI GPT-4o-mini |
| Web Search | Tavily API |
| Database | MongoDB Atlas |
| Deployment | AWS Elastic Beanstalk |

## Project Structure

```
AI-Agent/
├── packages/
│   ├── backend-python/          # Python backend
│   │   ├── main.py              # FastAPI entry point
│   │   ├── agents/              # Agent implementations
│   │   │   ├── orchestrator.py  # Query planning
│   │   │   ├── researcher.py    # Tavily search
│   │   │   ├── validator.py     # Fact verification
│   │   │   └── synthesizer.py   # Response generation
│   │   ├── graph/               # LangGraph workflow
│   │   │   ├── state.py         # State schema
│   │   │   └── workflow.py      # Workflow definition
│   │   ├── db/                  # MongoDB integration
│   │   ├── config/              # Settings
│   │   ├── .ebextensions/       # AWS EB config
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   └── frontend/                # Next.js frontend
│       ├── app/
│       │   ├── page.tsx
│       │   ├── assistant.tsx
│       │   └── api/chat/route.ts
│       ├── components/
│       │   ├── assistant-ui/    # Chat components
│       │   ├── agent-activity-panel.tsx
│       │   └── export-button.tsx
│       └── lib/
│           └── agent-store.ts   # Agent state management
│
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas account
- OpenAI API key
- Tavily API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI-Agent
```

### 2. Setup Backend

```bash
cd packages/backend-python

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
MONGODB_DATABASE=multi_agent_db
HOST=0.0.0.0
PORT=8000
DEBUG=true
EOF

# Run the server
python main.py
```

### 3. Setup Frontend

```bash
cd packages/frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Features

### Multi-Agent Collaboration
- **Orchestrator**: Analyzes queries, determines if research is needed
- **Researcher**: Performs web searches via Tavily API
- **Validator**: Cross-references and fact-checks information
- **Synthesizer**: Generates well-structured, cited responses

### Real-time Agent Activity
- Visual panel showing which agent is currently working
- Step-by-step activity log during query processing

### Data Export
- Export conversation history as JSON or CSV
- Full audit trail of agent outputs

### MongoDB Logging
- All queries and responses logged
- Agent outputs stored with metadata
- Session management for conversation continuity

## API Reference

### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [{"role": "user", "content": "Your question here"}],
  "session_id": "optional-session-id"
}
```

### Session Management
```http
POST /api/sessions              # Create session
GET /api/sessions/{session_id}  # Get session
```

### Export
```http
GET /api/export/{session_id}?format=json
GET /api/export/{session_id}?format=csv
```

### Query History
```http
GET /api/queries                     # All queries
GET /api/queries/{query_id}/outputs  # Agent outputs
```

## AWS Deployment

### Elastic Beanstalk

```bash
cd packages/backend-python

# Initialize EB
eb init -p python-3.11 multi-agent-research

# Create environment
eb create production

# Set environment variables
eb setenv OPENAI_API_KEY=xxx TAVILY_API_KEY=xxx MONGODB_URI=xxx

# Deploy
eb deploy
```

### Frontend (Vercel)

```bash
cd packages/frontend
vercel deploy
```

## Environment Variables

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `TAVILY_API_KEY` | Yes | Tavily API key |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DATABASE` | No | Database name (default: multi_agent_db) |

### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | No | Backend URL (default: http://localhost:8000) |

## License

MIT
