from abc import ABC, abstractmethod
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from app.core.config import settings


def get_llm(temperature: float = 0.7):
    if settings.groq_api_key:
        return ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=temperature,
            api_key=settings.groq_api_key,
        )
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=temperature,
        api_key=settings.openai_api_key,
    )


class BaseAgent(ABC):
    def __init__(self, name: str, temperature: float = 0.7):
        self.name = name
        self.llm = get_llm(temperature)

    @abstractmethod
    async def run(self, state: dict) -> dict:
        pass