"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MarkdownRenderer } from "@/lib/utils/markdown";
import { getSessionHistory, type ChatMessage } from "@/lib/api/agents";
import { getDestinationImage } from "@/lib/api/pexels";
import type { Trip } from "@/types/trip";

const AGENT_CONFIG: Record<string, { color: string; icon: string }> = {
  Coordinator: { color: "#6366f1", icon: "⬡" },
  Destination: { color: "#06b6d4", icon: "◎" },
  Budget: { color: "#10b981", icon: "◈" },
  Hotel: { color: "#f59e0b", icon: "◇" },
  Itinerary: { color: "#ec4899", icon: "◉" },
};

export function ShareWorkspace({ trip }: { trip: Trip }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getSessionHistory(trip.id)
      .then((h) => setMessages(h.messages ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
    getDestinationImage(trip.destination).then(setImageUrl);
  }, [trip.id, trip.destination]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const agentMessages = messages.filter(
    (m) => m.role === "agent" && m.content.trim()
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#080808",
        backgroundImage:
          "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(37,99,235,0.07) 0%, transparent 60%)",
      }}
    >
      <nav
        className="flex items-center justify-between px-8 py-4 max-w-4xl mx-auto"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
              boxShadow: "0 0 16px rgba(37,99,235,0.3)",
            }}
          >
            ⬡
          </div>
          <span className="text-sm font-semibold text-gray-100">VoyageAI</span>
        </Link>

        <div className="flex items-center gap-3">
          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-medium"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#34d399",
            }}
          >
            Shared Trip
          </div>

          <button
            onClick={copyLink}
            className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
            style={{
              background: copied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)",
              border: copied
                ? "1px solid rgba(16,185,129,0.3)"
                : "1px solid rgba(255,255,255,0.08)",
              color: copied ? "#34d399" : "#9ca3af",
            }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>

          
<a
  href={`http://localhost:8000/api/v1/export/trips/${trip.id}/pdf`}
  target="_blank"
  rel="noreferrer"
  className="px-3 py-1.5 rounded-lg text-xs"
  style={{
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#9ca3af",
    textDecoration: "none",
  }}
>
  Export PDF
</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-8 py-10">
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-56 rounded-2xl overflow-hidden mb-8"
          >
            <img
              src={imageUrl}
              alt={trip.destination}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(8,8,8,0.9) 100%)",
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-2xl font-semibold text-white">
                {trip.destination}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-light text-gray-100 mb-3">
            {trip.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{trip.duration_days} days</span>
            <span className="text-gray-700">·</span>
            <span>
              {trip.currency} {Number(trip.budget).toLocaleString()}
            </span>
            {trip.preferences && (
              <>
                <span className="text-gray-700">·</span>
                <span>{trip.preferences}</span>
              </>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-32 rounded-xl"
                style={{
                  background: "#0d0d0d",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : agentMessages.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <p className="text-sm">No itinerary generated yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agentMessages.map((msg, i) => {
              const cfg =
                AGENT_CONFIG[msg.agent_name ?? "Coordinator"] ??
                AGENT_CONFIG.Coordinator;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    background: "#0d0d0d",
                    border: `1px solid ${cfg.color}22`,
                    boxShadow: `0 0 24px ${cfg.color}0a`,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5"
                    style={{
                      background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}44)`,
                    }}
                  />
                  <div className="pl-5 pr-5 py-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span
                        className="text-[10px] font-semibold tracking-widest uppercase"
                        style={{ color: cfg.color }}
                      >
                        {msg.agent_name ?? "Agent"}
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{
                          background: `linear-gradient(90deg, ${cfg.color}33, transparent)`,
                        }}
                      />
                    </div>
                    <div className="text-[13px] leading-relaxed text-gray-300">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center py-10 rounded-2xl"
          style={{
            background: "rgba(37,99,235,0.05)",
            border: "1px solid rgba(37,99,235,0.12)",
          }}
        >
          <p className="text-sm text-gray-400 mb-2">
            Want to plan your own AI-powered trip?
          </p>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white mt-2 transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 0 20px rgba(37,99,235,0.25)",
            }}
          >
            Start planning
          </Link>
        </motion.div>
      </main>
    </div>
  );
}