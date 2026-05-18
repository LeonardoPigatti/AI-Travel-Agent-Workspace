from pydantic import BaseModel
import uuid


class AgentRunRequest(BaseModel):
    trip_id: uuid.UUID
    message: str
    session_id: uuid.UUID | None = None


class AgentRunResponse(BaseModel):
    session_id: uuid.UUID
    agent_name: str
    content: str

class AgentRunRequest(BaseModel):
    trip_id: uuid.UUID
    message: str
    session_id: uuid.UUID | None = None


class AgentRunResponse(BaseModel):
    session_id: uuid.UUID
    agent_name: str
    content: str


class SaveMessageRequest(BaseModel):
    agent_name: str
    content: str