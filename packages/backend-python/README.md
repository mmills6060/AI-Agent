# Multi-Agent Research Assistant - Python Backend

A general-purpose multi-agent system built with LangGraph, FastAPI, and Tavily for real-time web research.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User Query                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR AGENT                               │
│  • Analyzes query intent                                                 │
│  • Creates execution plan                                                │
│  • Routes to appropriate agents                                          │
└─────────────────────────────────────────────────────────────────────────┘
                    │                               │
          needs_research=true              needs_research=false
                    │                               │
                    ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│      RESEARCHER AGENT         │    │      SIMPLE RESPONSE          │
│  • Tavily API search          │    │  • Direct LLM response        │
│  • Web data extraction        │    └──────────────────────────────┘
│  • Multi-query support        │                   │
└──────────────────────────────┘                   │
                    │                               │
                    ▼                               │
┌──────────────────────────────┐                   │
│       VALIDATOR AGENT         │                   │
│  • Fact verification          │                   │
│  • Source cross-referencing   │                   │
│  • Conflict identification    │                   │
└──────────────────────────────┘                   │
                    │                               │
                    ▼                               │
┌──────────────────────────────┐                   │
│      SYNTHESIZER AGENT        │◄──────────────────┘
│  • Response generation        │
│  • Source citation            │
│  • Markdown formatting        │
└──────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Final Response                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Agent Orchestration | LangGraph |
| LLM | OpenAI GPT-4o-mini |
| Web Search | Tavily API |
| Database | MongoDB Atlas |
| Deployment | AWS Elastic Beanstalk |

## Project Structure

```
backend-python/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose for local dev
├── Procfile               # AWS EB process configuration
├── agents/
│   ├── __init__.py
│   ├── orchestrator.py    # Query analysis and planning
│   ├── researcher.py      # Tavily web search
│   ├── validator.py       # Fact verification
│   └── synthesizer.py     # Response generation
├── graph/
│   ├── __init__.py
│   ├── state.py           # LangGraph state schema
│   └── workflow.py        # Agent workflow definition
├── db/
│   ├── __init__.py
│   └── mongodb.py         # MongoDB client
├── config/
│   ├── __init__.py
│   └── settings.py        # Environment configuration
├── .ebextensions/         # AWS EB configuration
└── .platform/             # AWS EB platform hooks
```

## Setup

### Prerequisites

- Python 3.11+
- MongoDB Atlas account
- OpenAI API key
- Tavily API key

### Local Development

1. **Clone and navigate to backend:**
   ```bash
   cd packages/backend-python
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**
   ```env
   OPENAI_API_KEY=your_openai_api_key
   TAVILY_API_KEY=your_tavily_api_key
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   MONGODB_DATABASE=multi_agent_db
   HOST=0.0.0.0
   PORT=8000
   DEBUG=true
   ```

5. **Run the server:**
   ```bash
   python main.py
   ```

   Or with uvicorn:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Development

```bash
# With local MongoDB
docker-compose --profile dev up

# Without local MongoDB (use Atlas)
docker-compose up
```

## API Endpoints

### Health Check
```
GET /health
```

### Chat
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "What is the latest news about AI?" }
  ],
  "session_id": "optional-session-id"
}
```

Returns Server-Sent Events (SSE) with agent updates and final response.

### Sessions
```
POST /api/sessions           # Create new session
GET /api/sessions/{id}       # Get session details
```

### Export
```
GET /api/export/{session_id}?format=json  # Export as JSON
GET /api/export/{session_id}?format=csv   # Export as CSV
```

### Query History
```
GET /api/queries                    # Get all queries
GET /api/queries/{id}/outputs       # Get agent outputs for query
GET /api/outputs                    # Get all agent outputs
```

### API Documentation
```
GET /docs       # Swagger UI
GET /redoc      # ReDoc
```

## MongoDB Schema

### Collections

**sessions**
```json
{
  "_id": "ObjectId",
  "created_at": "datetime",
  "messages": [
    {
      "role": "user|assistant",
      "content": "string",
      "timestamp": "datetime"
    }
  ]
}
```

**queries**
```json
{
  "_id": "ObjectId",
  "user_query": "string",
  "session_id": "string|null",
  "timestamp": "datetime"
}
```

**agent_outputs**
```json
{
  "_id": "ObjectId",
  "query_id": "string",
  "agent_name": "orchestrator|researcher|validator|synthesizer",
  "output": "string",
  "metadata": {},
  "timestamp": "datetime"
}
```

## AWS Deployment

### Elastic Beanstalk Setup

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB application:**
   ```bash
   eb init -p python-3.11 multi-agent-research
   ```

3. **Create environment:**
   ```bash
   eb create production --single
   ```

4. **Set environment variables:**
   ```bash
   eb setenv \
     OPENAI_API_KEY=your_key \
     TAVILY_API_KEY=your_key \
     MONGODB_URI=your_mongodb_uri \
     MONGODB_DATABASE=multi_agent_db
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `TAVILY_API_KEY` | Tavily API key | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DATABASE` | Database name | No (default: multi_agent_db) |
| `HOST` | Server host | No (default: 0.0.0.0) |
| `PORT` | Server port | No (default: 8000) |
| `DEBUG` | Debug mode | No (default: false) |

## Agent Roles

### Orchestrator
- Analyzes user queries
- Creates execution plans
- Determines if web research is needed
- Generates specific search queries

### Researcher
- Executes Tavily API searches
- Supports multiple search queries
- Extracts relevant content from web
- Provides source citations

### Validator
- Cross-references information
- Identifies conflicting data
- Assesses source reliability
- Extracts verified facts

### Synthesizer
- Generates final response
- Incorporates validated facts
- Formats with markdown
- Cites sources appropriately

## License

MIT

