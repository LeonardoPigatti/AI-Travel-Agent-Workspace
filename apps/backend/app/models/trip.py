import uuid
from enum import Enum

from sqlalchemy import ForeignKey, String, Text, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class TripStatus(str, Enum):
    DRAFT = "draft"
    PLANNING = "planning"
    READY = "ready"
    ARCHIVED = "archived"


class Trip(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "trips"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    budget: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="BRL")
    preferences: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TripStatus] = mapped_column(default=TripStatus.DRAFT)
    itinerary: Mapped[str | None] = mapped_column(Text, nullable=True)

    sessions: Mapped[list["AgentSession"]] = relationship(
        back_populates="trip",
        cascade="all, delete-orphan",
    )


class AgentSession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "agent_sessions"

    trip_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(String(50), default="active")

    trip: Mapped["Trip"] = relationship(back_populates="sessions")
    messages: Mapped[list["Message"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
    )


class Message(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "messages"

    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("agent_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    agent_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    session: Mapped["AgentSession"] = relationship(back_populates="messages")