from datetime import datetime
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from bson import ObjectId
from config.settings import settings


class MongoDBClient:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
    
    def connect(self):
        if not self.client:
            self.client = MongoClient(settings.mongodb_uri)
            self.db = self.client[settings.mongodb_database]
        return self
    
    def disconnect(self):
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
    
    # Sessions
    def create_session(self) -> str:
        result = self.db.sessions.insert_one({
            "created_at": datetime.utcnow(),
            "messages": []
        })
        return str(result.inserted_id)
    
    def get_session(self, session_id: str) -> Optional[dict]:
        return self.db.sessions.find_one({"_id": ObjectId(session_id)})
    
    def add_message_to_session(self, session_id: str, role: str, content: str):
        self.db.sessions.update_one(
            {"_id": ObjectId(session_id)},
            {"$push": {"messages": {
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow()
            }}}
        )
    
    # Queries
    def log_query(self, user_query: str, session_id: Optional[str] = None) -> str:
        result = self.db.queries.insert_one({
            "user_query": user_query,
            "session_id": session_id,
            "timestamp": datetime.utcnow()
        })
        return str(result.inserted_id)
    
    def get_queries(self, limit: int = 100) -> list:
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
        result = self.db.agent_outputs.insert_one({
            "query_id": query_id,
            "agent_name": agent_name,
            "output": output,
            "metadata": metadata or {},
            "timestamp": datetime.utcnow()
        })
        return str(result.inserted_id)
    
    def get_agent_outputs_for_query(self, query_id: str) -> list:
        cursor = self.db.agent_outputs.find({"query_id": query_id}).sort("timestamp", 1)
        return [{**doc, "_id": str(doc["_id"])} for doc in cursor]
    
    def get_all_agent_outputs(self, limit: int = 100) -> list:
        cursor = self.db.agent_outputs.find().sort("timestamp", -1).limit(limit)
        return [{**doc, "_id": str(doc["_id"])} for doc in cursor]


_db_client: Optional[MongoDBClient] = None


def get_db_client() -> MongoDBClient:
    global _db_client
    if _db_client is None:
        _db_client = MongoDBClient()
        _db_client.connect()
    return _db_client

