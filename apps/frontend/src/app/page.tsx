"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const AGENTS = [
  { name: "Coordinator", icon: "⬡", color: "#6366f1", desc: "Understands intent and orchestrates the right specialists for every query." },
  { name: "Destination", icon: "◎", color: "#06b6d4", desc: "Deep research on attractions, culture, hidden gems and local tips." },
  { name: "Budget", icon: "◈", color: "#10b981", desc: "Optimizes spending, breaks down daily costs and finds savings." },
  { name: "Hotel", icon: "◇", color: "#f59e0b", desc: "Curates accommodations by neighborhood, style and budget range." },
  { name: "Itinerary", icon: "◉", color: "#ec4899", desc: "Builds realistic day-by-day schedules with meals, timing and tips." },
];

const MOCK_MESSAGES = [
  { role: "user", content: "Plan a 7-day gastronomic trip to Tokyo with R$15.000" },
  {
    role: "agent", agent: "Coordinator", color: "#6366f1",
    content: "Perfect. I'll coordinate your Tokyo gastronomy trip. Let me bring in the specialists...",
  },
  {
    role: "agent", agent: "Destination", color: "#06b6d4",
    content: "**Top Areas for Food in Tokyo**\n\n- **Tsukiji Outer Market** — fresh sushi and street food\n- **Shibuya & Shinjuku** — ramen alleys and izakayas\n- **Yanaka** — traditional shotengai market street",
  },
  {
    role: "agent", agent: "Budget", color: "#10b981",
    content: "**Daily Budget: R$ 2.142**\n\n- Accommodation: R$ 800/night\n- Food & drinks: R$ 900/day\n- Transport: R$ 200/day",
  },
];

function MockChat() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= MOCK_MESSAGES.length) return;
    const t = setTimeout(() => setVisibleCount((v) => v + 1), visibleCount === 0 ? 800 : 1400);
    return () => clearTimeout(t);
  }, [visibleCount]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "#080808",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 0 80px rgba(37,99,235,0.12), 0 0 160px rgba(99,102,241,0.06)",
      }}
    >
      {/* Mock top bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-60" />
          </div>
          <span className="text-[11px] text-gray-600 ml-2">Tokyo Gastronomy · 7 days</span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[10px] text-emerald-500">live</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-64">
        {MOCK_MESSAGES.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div
                  className="max-w-[75%] px-3 py-2 rounded-xl text-xs text-gray-300"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl p-3 relative overflow-hidden"
                style={{
                  background: "#0f0f0f",
                  border: `1px solid ${msg.color}22`,
                  boxShadow: `0 0 20px ${msg.color}11`,
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{ background: msg.color }}
                />
                <div className="pl-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: msg.color }}>
                      {msg.agent}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 leading-relaxed whitespace-pre-line">
                    {msg.content.replace(/\*\*/g, "")}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {visibleCount < MOCK_MESSAGES.length && (
          <div className="flex items-center gap-1.5 pl-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-indigo-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mock input */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="flex-1 px-3 py-1.5 rounded-lg text-[11px] text-gray-600"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          Ask about your trip...
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-[11px] text-white"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
        >
          Send
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "#080808",
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.1) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 90% 90%, rgba(99,102,241,0.06) 0%, transparent 50%)
        `,
      }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
              boxShadow: "0 0 16px rgba(37,99,235,0.3)",
            }}
          >
            ⬡
          </div>
          <span className="text-sm font-semibold text-gray-100 tracking-tight">VoyageAI</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/trips" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            My Trips
          </Link>
          <Link
            href="/trips/new"
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 0 16px rgba(37,99,235,0.25)",
            }}
          >
            Start Planning
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-24">
        <div className="grid grid-cols-2 gap-16 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] mb-8"
              style={{
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
                color: "#60a5fa",
              }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              5 AI Agents · Powered by LLaMA 3.3
            </div>

            <h1 className="text-5xl font-light text-gray-100 leading-tight tracking-tight mb-6">
              Travel planning,{" "}
              <span
                className="font-normal"
                style={{
                  background: "linear-gradient(135deg, #60a5fa, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                orchestrated
              </span>
              {" "}by AI agents.
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed mb-10 max-w-md">
              Tell us your destination, budget and preferences.
              Five specialized agents collaborate in real-time to research, plan and build your perfect trip.
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/trips/new"
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  boxShadow: "0 0 24px rgba(37,99,235,0.3)",
                }}
              >
                Plan a trip →
              </Link>
              <Link
                href="/trips"
                className="px-6 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                View trips
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-12">
              {[
                { value: "5", label: "AI Agents" },
                { value: "Real-time", label: "Streaming" },
                { value: "LangGraph", label: "Orchestration" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-sm font-medium text-gray-200">{value}</p>
                  <p className="text-[11px] text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <MockChat />
          </motion.div>
        </div>
      </section>

      {/* Agents section */}
      <section
        className="py-24"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <p className="text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-3">
              The Agent Pipeline
            </p>
            <h2 className="text-2xl font-light text-gray-200">
              Five specialists. One seamless experience.
            </h2>
          </motion.div>

          <div className="grid grid-cols-5 gap-4">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative p-5 rounded-xl cursor-default transition-all duration-300"
                style={{
                  background: "#0d0d0d",
                  border: `1px solid rgba(255,255,255,0.06)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${agent.color}33`;
                  e.currentTarget.style.boxShadow = `0 0 24px ${agent.color}11`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-4"
                  style={{
                    background: `${agent.color}15`,
                    border: `1px solid ${agent.color}33`,
                    color: agent.color,
                  }}
                >
                  {agent.icon}
                </div>
                <p className="text-xs font-medium text-gray-300 mb-2">{agent.name}</p>
                <p className="text-[11px] text-gray-600 leading-relaxed">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-light text-gray-100 mb-4">
              Ready to plan smarter?
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Describe your trip. Let the agents handle the rest.
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                boxShadow: "0 0 32px rgba(37,99,235,0.25)",
              }}
            >
              Start for free →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-6 max-w-7xl mx-auto flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-700">VoyageAI</span>
          <span className="text-gray-800">·</span>
          <span className="text-xs text-gray-700">Built with Next.js, FastAPI and LangGraph</span>
        </div>
        <span className="text-xs text-gray-700">MIT License</span>
      </footer>
    </div>
  );
}