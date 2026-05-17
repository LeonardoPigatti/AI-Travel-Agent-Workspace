"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { runAgent, type ChatMessage } from "@/lib/api/agents";
import type { Trip } from "@/types/trip";

const AGENTS = ["Coordinator", "Destination", "Budget", "Hotel", "Itinerary"];

export function TripWorkspace({ trip }: { trip: Trip }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
        (newSessionId) => {
          setSessionId(newSessionId);
        },
      );
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <Link href="/trips" className="text-muted-foreground text-sm hover:text-foreground">
              ← My Trips
            </Link>
            <h1 className="text-3xl font-bold mt-1">{trip.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-muted-foreground text-sm">
              <span>{trip.destination}</span>
              <span>·</span>
              <span>{trip.duration_days} days</span>
              <span>·</span>
              <span>{trip.currency} {Number(trip.budget).toLocaleString()}</span>
              <Badge>{trip.status}</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Chat */}
          <div className="col-span-2 rounded-lg border bg-card flex flex-col" style={{ height: "600px" }}>
            <div className="p-4 border-b">
              <h2 className="font-semibold">AI Agent Chat</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="text-4xl mb-3">🤖</div>
                  <p className="font-medium">Agents ready</p>
                  <p className="text-sm mt-1">Ask anything about your trip</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}>
                    {msg.role === "agent" && (
                      <div className="text-xs font-medium mb-1 opacity-70">
                        {msg.agent_name ?? "Agent"}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {msg.content}
                      {loading && i === messages.length - 1 && msg.role === "agent" && (
                        <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your trip..."
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()}>
                {loading ? "..." : "Send"}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-sm mb-3">Trip Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <span>{trip.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{trip.duration_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget</span>
                  <span>{trip.currency} {Number(trip.budget).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">{trip.status}</Badge>
                </div>
              </div>
            </div>

            {trip.preferences && (
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold text-sm mb-2">Preferences</h3>
                <p className="text-sm text-muted-foreground">{trip.preferences}</p>
              </div>
            )}

            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold text-sm mb-3">Active Agents</h3>
              <div className="space-y-2">
                {AGENTS.map((agent) => (
                  <div key={agent} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span>{agent} Agent</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}