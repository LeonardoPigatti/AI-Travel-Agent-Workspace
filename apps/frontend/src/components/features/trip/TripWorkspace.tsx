"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownRenderer } from "@/lib/utils/markdown";
import { runAgent, getSessionHistory, saveAgentMessage, type ChatMessage } from "@/lib/api/agents";
import type { Trip } from "@/types/trip";

const AGENT_CONFIG: Record<string, { color: string; glow: string; icon: string; label: string }> = {
  Coordinator: { color: "#6366f1", glow: "rgba(99,102,241,0.15)", icon: "⬡", label: "Coordinator" },
  Destination: { color: "#06b6d4", glow: "rgba(6,182,212,0.15)", icon: "◎", label: "Destination" },
  Budget:      { color: "#10b981", glow: "rgba(16,185,129,0.15)", icon: "◈", label: "Budget" },
  Hotel:       { color: "#f59e0b", glow: "rgba(245,158,11,0.15)", icon: "◇", label: "Hotel" },
  Itinerary:   { color: "#ec4899", glow: "rgba(236,72,153,0.15)", icon: "◉", label: "Itinerary" },
};

function TypingIndicator({ agentName }: { agentName: string }) {
  const cfg = AGENT_CONFIG[agentName] ?? AGENT_CONFIG.Coordinator;
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: cfg.color }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: cfg.color }}>
        {cfg.label} is thinking
      </span>
    </div>
  );
}

function AgentMessage({ msg, isStreaming }: { msg: ChatMessage; isStreaming?: boolean }) {
  const cfg = AGENT_CONFIG[msg.agent_name ?? "Coordinator"] ?? AGENT_CONFIG.Coordinator;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f0f0f 0%, #111 100%)",
          border: `1px solid ${cfg.color}22`,
          boxShadow: `0 0 24px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.03)`,
        }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
          style={{ background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}44)` }}
        />

        <div className="pl-5 pr-4 py-4">
          {/* Agent header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm" style={{ color: cfg.color }}>{cfg.icon}</span>
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: cfg.color }}>
              {cfg.label}
            </span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${cfg.color}33, transparent)` }} />
          </div>

          {/* Content */}
          <div className="text-[13px] leading-relaxed" style={{ color: "#d1d5db" }}>
            <MarkdownRenderer content={msg.content} />
            {isStreaming && (
              <motion.span
                className="inline-block w-0.5 h-3.5 ml-0.5 rounded-full align-middle"
                style={{ background: cfg.color }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UserMessage({ msg }: { msg: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex justify-end"
    >
      <div
        className="max-w-[65%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
        style={{
          background: "linear-gradient(135deg, #1d2332, #161b27)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#e5e7eb",
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

function AgentStatus({ activeAgent, loading }: { activeAgent: string; loading: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(AGENT_CONFIG).map(([key, cfg]) => {
        const isActive = loading && activeAgent === key;
        return (
          <div
            key={key}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300"
            style={{
              background: isActive ? `${cfg.glow}` : "transparent",
              border: isActive ? `1px solid ${cfg.color}33` : "1px solid transparent",
            }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: isActive ? cfg.color : "#374151" }}
              animate={isActive ? { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span
              className="text-xs font-medium tracking-wide"
              style={{ color: isActive ? cfg.color : "#4b5563" }}
            >
              {cfg.label}
            </span>
            {isActive && (
              <motion.span
                className="ml-auto text-[10px] tracking-widest"
                style={{ color: cfg.color }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ACTIVE
              </motion.span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TripWorkspace({ trip }: { trip: Trip }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState("Coordinator");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await getSessionHistory(trip.id);
        if (history.session_id) {
          setSessionId(history.session_id);
          setMessages(history.messages);
        }
      } catch {
        // no history
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, [trip.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const agentMessage: ChatMessage = { role: "agent", content: "", agent_name: "Coordinator" };
    setMessages((prev) => [...prev, agentMessage]);

    try {
      await runAgent(
        trip.id,
        input,
        sessionId,
        (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + token,
            };
            return updated;
          });
        },
        (newSessionId, agentName) => {
          setActiveAgent(agentName);
          setSessionId(newSessionId);
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            const updatedMsg = { ...lastMsg, agent_name: agentName };
            updated[updated.length - 1] = updatedMsg;
            saveAgentMessage(newSessionId, agentName, lastMsg.content);
            return updated;
          });
        },
      );
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Connection error. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  const lastMsg = messages[messages.length - 1];
  const isStreamingLast = loading && lastMsg?.role === "agent";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#080808",
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37,99,235,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 50%)
        `,
      }}
    >
      {/* Top nav */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/trips"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <span>←</span>
            <span>Trips</span>
          </Link>
          <div className="w-px h-3.5 bg-gray-800" />
          <span className="text-sm font-medium text-gray-200">{trip.title}</span>
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-widest uppercase"
            style={{
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(37,99,235,0.25)",
              color: "#60a5fa",
            }}
          >
            {trip.status}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{trip.destination}</span>
          <span className="text-gray-700">·</span>
          <span>{trip.duration_days}d</span>
          <span className="text-gray-700">·</span>
          <span>{trip.currency} {Number(trip.budget).toLocaleString()}</span>
          {sessionId && (
            <>
              <span className="text-gray-700">·</span>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1 h-1 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-emerald-500">live</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-600"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-2xl"
                  style={{
                    background: "linear-gradient(135deg, #1a1f2e, #0f1219)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    boxShadow: "0 0 40px rgba(37,99,235,0.1)",
                  }}
                >
                  ⬡
                </div>
                <h3 className="text-base font-medium text-gray-200 mb-2">
                  Mission Control Ready
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Your AI agents are standing by. Ask anything about{" "}
                  <span className="text-gray-300">{trip.destination}</span>.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-2 w-full max-w-md">
                  {[
                    "What are the top attractions?",
                    "How should I split my budget?",
                    "Where should I stay?",
                    "Create a full itinerary",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                      className="px-3 py-2 rounded-lg text-xs text-gray-400 text-left transition-all duration-200 hover:text-gray-200"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <div key={i}>
                    {msg.role === "user" ? (
                      <UserMessage msg={msg} />
                    ) : (
                      <AgentMessage
                        msg={msg}
                        isStreaming={isStreamingLast && i === messages.length - 1}
                      />
                    )}
                  </div>
                ))}
                {loading && lastMsg?.role === "agent" && lastMsg.content === "" && (
                  <TypingIndicator agentName={activeAgent} />
                )}
              </AnimatePresence>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="px-6 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={() => {}}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={`Ask about ${trip.destination}...`}
                disabled={loading || loadingHistory}
                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim() || loadingHistory}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-30"
                style={{
                  background: input.trim() && !loading
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "rgba(255,255,255,0.06)",
                  color: input.trim() && !loading ? "#fff" : "#6b7280",
                  boxShadow: input.trim() && !loading
                    ? "0 0 16px rgba(37,99,235,0.3)"
                    : "none",
                }}
              >
                {loading ? (
                  <motion.div
                    className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <span>Send</span>
                    <span className="text-[10px] opacity-50">↵</span>
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-700">
              Powered by LLaMA 3.3 · 5 specialized agents
            </p>
          </div>
        </div>

        {/* Right sidebar */}
        <div
          className="w-64 shrink-0 flex flex-col gap-6 px-4 py-6 overflow-y-auto"
          style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}
        >

          {/* Trip details */}
          <div>
            <p className="text-[10px] font-medium tracking-widest uppercase text-gray-600 mb-3">
              Mission Brief
            </p>
            <div className="space-y-2.5">
              {[
                { label: "Destination", value: trip.destination },
                { label: "Duration", value: `${trip.duration_days} days` },
                { label: "Budget", value: `${trip.currency} ${Number(trip.budget).toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-600 mb-0.5">{label}</p>
                  <p className="text-xs text-gray-300 font-medium">{value}</p>
                </div>
              ))}
              {trip.preferences && (
                <div>
                  <p className="text-[10px] text-gray-600 mb-0.5">Preferences</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{trip.preferences}</p>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-800" />

          {/* Agent status */}
          <div>
            <p className="text-[10px] font-medium tracking-widest uppercase text-gray-600 mb-3">
              Agent Status
            </p>
            <AgentStatus activeAgent={activeAgent} loading={loading} />
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-800" />

          {/* Stats */}
          <div>
            <p className="text-[10px] font-medium tracking-widest uppercase text-gray-600 mb-3">
              Session
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[11px] text-gray-600">Messages</span>
                <span className="text-[11px] text-gray-400">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[11px] text-gray-600">Status</span>
                <span className="text-[11px]" style={{ color: sessionId ? "#34d399" : "#6b7280" }}>
                  {sessionId ? "Active" : "New"}
                </span>
              </div>
              <button
  onClick={async () => {
    window.open(
      `http://localhost:8000/api/v1/export/trips/${trip.id}/pdf`,
      "_blank"
    );
  }}
  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all duration-200"
  style={{
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#9ca3af",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
    e.currentTarget.style.color = "#e5e7eb";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
    e.currentTarget.style.color = "#9ca3af";
  }}
>
  ↓ Export PDF
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}