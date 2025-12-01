from datetime import datetime
from typing import Optional
import uuid

try:
    from pymongo import MongoClient
    from pymongo.database import Database
    from bson import ObjectId
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
    MongoClient = None
    Database = None
    ObjectId = None

from config.settings import settings


class MongoDBClient:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.connected = False
    
    def connect(self):
        if not MONGODB_AVAILABLE:
            print("MongoDB not available - running without persistence")
            return self
        
        if not self.client:
            try:
                self.client = MongoClient(settings.mongodb_uri, serverSelectionTimeoutMS=2000)
                # Test connection
                self.client.admin.command('ping')
                self.db = self.client[settings.mongodb_database]
                self.connected = True
                print("MongoDB connected successfully")
            except Exception as e:
                print(f"MongoDB connection failed: {e} - running without persistence")
                self.client = None
                self.db = None
                self.connected = False
        return self
    
    def disconnect(self):
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            self.connected = False
    
    # Sessions
    def create_session(self) -> str:
        if not self.connected or self.db is None:
            return str(uuid.uuid4())
        result = self.db.sessions.insert_one({
            "created_at": datetime.utcnow(),
            "messages": []
        })
        return str(result.inserted_id)
    
    def get_session(self, session_id: str) -> Optional[dict]:
        if not self.connected or self.db is None:
            return None
        try:
            return self.db.sessions.find_one({"_id": ObjectId(session_id)})
        except Exception:
            return None
    
    def add_message_to_session(self, session_id: str, role: str, content: str):
        if not self.connected or self.db is None:
            return
        try:
            self.db.sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$push": {"messages": {
                    "role": role,
                    "content": content,
                    "timestamp": datetime.utcnow()
                }}}
            )
        except Exception:
            pass
    
    def save_agent_history_to_session(self, session_id: str, query_id: str, agent_history: list):
        """Save agent history for a specific query to the session."""
        if not self.connected or self.db is None:
            return
        try:
            # Store agent_history keyed by query_id in the session
            self.db.sessions.update_one(
                {"_id": ObjectId(session_id)},
                {"$set": {f"agent_history.{query_id}": agent_history}}
            )
        except Exception:
            pass
    
    def get_all_sessions(self, limit: int = 100) -> list:
        """Get all sessions sorted by creation date (newest first)."""
        if not self.connected or self.db is None:
            return []
        cursor = self.db.sessions.find().sort("created_at", -1).limit(limit)
        return [{**doc, "_id": str(doc["_id"])} for doc in cursor]
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session by ID."""
        if not self.connected or self.db is None:
            return False
        try:
            result = self.db.sessions.delete_one({"_id": ObjectId(session_id)})
            return result.deleted_count > 0
        except Exception:
            return False
    
    # Queries
    def log_query(self, user_query: str, session_id: Optional[str] = None) -> str:
        if not self.connected or self.db is None:
            return str(uuid.uuid4())
        result = self.db.queries.insert_one({
            "user_query": user_query,
            "session_id": session_id,
            "timestamp": datetime.utcnow()
        })
        return str(result.inserted_id)
    
    def get_queries(self, limit: int = 100) -> list:
        if not self.connected or self.db is None:
            return []
        cursor = self.db.queries.find().sort("timestamp", -1).limit(limit)
        return [{**doc, "_id": str(doc["_id"])} for doc in cursor]
    
    # Agent Outputs
    def log_agent_output(
        self,
        query_id: str,
        agent_name: str,
        output: str,
        metadata: Optional[dict] = None
    ) -> str:
        if not self.connected or self.db is None:
            return str(uuid.uuid4())
        result = self.db.agent_outputs.insert_one({
            "query_id": query_id,
            "agent_name": agent_name,
            "output": output,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow()
        })
        return str(result.inserted_id)
    
    def get_agent_outputs_for_query(self, query_id: str) -> list:
        if not self.connected or self.db is None:
            return []
        cursor = self.db.agent_outputs.find({"query_id": query_id}).sort("timestamp", 1)
        return [{**doc, "_id": str(doc["_id"])} for doc in cursor]
    
    def get_all_agent_outputs(self, limit: int = 100) -> list:
        if not self.connected or self.db is None:
            return []
        cursor = self.db.agent_outputs.find().sort("timestamp", -1).limit(limit)
        return [{**doc, "_id": str(doc["_id"])} for doc in cursor]


_db_client: Optional[MongoDBClient] = None


def get_db_client() -> MongoDBClient:
    global _db_client
    if _db_client is None:
        _db_client = MongoDBClient()
        _db_client.connect()
    return _db_client

