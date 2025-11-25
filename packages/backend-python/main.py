import json
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config.settings import settings
from db.mongodb import get_db_client
from graph.workflow import create_workflow, run_workflow_stream


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db = get_db_client()
    db.connect()
    yield
    # Shutdown
    db.disconnect()


app = FastAPI(
    title="Multi-Agent Research Assistant",
    description="A general-purpose multi-agent system using LangGraph and Tavily",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    session_id: Optional[str] = None


class SessionResponse(BaseModel):
    session_id: str


class QueryHistoryResponse(BaseModel):
    queries: list[dict]


class AgentOutputsResponse(BaseModel):
    outputs: list[dict]


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Multi-Agent Research Assistant is running"}


@app.post("/api/sessions", response_model=SessionResponse)
async def create_session():
    """Create a new chat session."""
    db = get_db_client()
    session_id = db.create_session()
    return {"session_id": session_id}


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details including message history."""
    db = get_db_client()
    session = db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session["_id"] = str(session["_id"])
    return session


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Process a chat request through the multi-agent workflow.
    Returns a streaming response with agent activities and final response.
    """
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages array is required")
    
    user_message = request.messages[-1].content if request.messages else ""
    
    if not user_message:
        raise HTTPException(status_code=400, detail="No user message provided")
    
    db = get_db_client()
    
    # Create or use existing session
    session_id = request.session_id
    if not session_id:
        session_id = db.create_session()
    
    # Log the query
    query_id = db.log_query(user_message, session_id)
    
    # Add user message to session
    db.add_message_to_session(session_id, "user", user_message)
    
    async def generate():
        workflow = create_workflow()
        
        async for event in run_workflow_stream(workflow, user_message, session_id, query_id):
            yield f"data: {json.dumps(event)}\n\n"
        
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/api/queries", response_model=QueryHistoryResponse)
async def get_queries(limit: int = 100):
    """Get query history."""
    db = get_db_client()
    queries = db.get_queries(limit)
    return {"queries": queries}


@app.get("/api/queries/{query_id}/outputs", response_model=AgentOutputsResponse)
async def get_query_outputs(query_id: str):
    """Get agent outputs for a specific query."""
    db = get_db_client()
    outputs = db.get_agent_outputs_for_query(query_id)
    return {"outputs": outputs}


@app.get("/api/outputs", response_model=AgentOutputsResponse)
async def get_all_outputs(limit: int = 100):
    """Get all agent outputs."""
    db = get_db_client()
    outputs = db.get_all_agent_outputs(limit)
    return {"outputs": outputs}


@app.get("/api/export/{session_id}")
async def export_session(session_id: str, format: str = "json"):
    """Export session data in JSON or CSV format."""
    db = get_db_client()
    session = db.get_session(session_id)
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session["_id"] = str(session["_id"])
    
    if format == "csv":
        import csv
        import io
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["timestamp", "role", "content"])
        
        for msg in session.get("messages", []):
            writer.writerow([
                msg.get("timestamp", ""),
                msg.get("role", ""),
                msg.get("content", "")
            ])
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=session_{session_id}.csv"}
        )
    
    return session


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )

