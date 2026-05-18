"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { tripsApi } from "@/lib/api/trips";
import type { Trip } from "@/types/trip";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  draft:    { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", label: "Draft" },
  planning: { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  label: "Planning" },
  ready:    { color: "#34d399", bg: "rgba(52,211,153,0.12)",  label: "Ready" },
  archived: { color: "#4b5563", bg: "rgba(75,85,99,0.12)",    label: "Archived" },
};

// Unsplash source — busca por keyword do destino
function getDestinationImage(destination: string): string {
  const keyword = destination.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");
  return `https://source.unsplash.com/1200x400/?${keyword},travel,city`;
}

function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const status = STATUS_CONFIG[trip.status] ?? STATUS_CONFIG.draft;
  const imageUrl = getDestinationImage(trip.destination);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link href={`/trips/${trip.id}`}>
        <div
          className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
          style={{
            background: "#0d0d0d",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Image */}
          <div className="relative h-52 overflow-hidden">
            <img
              src={imageUrl}
              alt={trip.destination}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 60%, rgba(13,13,13,1) 100%)",
              }}
            />

            {/* Status badge — top right */}
            <div className="absolute top-3 right-3">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm"
                style={{
                  background: `rgba(0,0,0,0.6)`,
                  border: `1px solid ${status.color}44`,
                  color: status.color,
                }}
              >
                <div className="w-1 h-1 rounded-full" style={{ background: status.color }} />
                {status.label}
              </div>
            </div>

            {/* Destination overlay — bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-3">
              <p className="text-xl font-semibold text-white leading-tight drop-shadow-lg">
                {trip.destination}
              </p>
            </div>
          </div>

          {/* Info row */}
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200 mb-0.5">{trip.title}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{trip.duration_days} days</span>
                <span className="text-gray-700">·</span>
                <span>{trip.currency} {Number(trip.budget).toLocaleString()}</span>
                <span className="text-gray-700">·</span>
                <span>
                  {new Date(trip.created_at).toLocaleDateString("en-US", {
                    month: "short", day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 transition-all duration-200 group-hover:text-gray-300"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              →
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<{ items: Trip[]; total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    tripsApi.list().then(setTrips).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = trips.items.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#080808",
        backgroundImage: "radial-gradient(ellipse 70% 40% at 50% -10%, rgba(37,99,235,0.07) 0%, transparent 60%)",
      }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 py-5 max-w-3xl mx-auto"
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

        <Link
          href="/trips/new"
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            boxShadow: "0 0 16px rgba(37,99,235,0.25)",
          }}
        >
          <span>+</span>
          <span>New Trip</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-2">
            Your Workspace
          </p>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-light text-gray-100">My Trips</h1>
              <p className="text-sm text-gray-600 mt-1">
                {trips.total} {trips.total === 1 ? "trip" : "trips"} planned
              </p>
            </div>

            {trips.total > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg w-52"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span className="text-gray-600 text-xs">⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search trips..."
                  className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 outline-none"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-64 rounded-2xl"
                style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.05)" }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : trips.total === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-6"
              style={{
                background: "linear-gradient(135deg, #0f1219, #1a1f2e)",
                border: "1px solid rgba(37,99,235,0.15)",
                boxShadow: "0 0 40px rgba(37,99,235,0.08)",
              }}
            >
              🗺️
            </div>
            <h3 className="text-base font-medium text-gray-300 mb-2">No trips yet</h3>
            <p className="text-sm text-gray-600 mb-8 max-w-xs">
              Start planning your first AI-powered trip. Our agents will handle the research.
            </p>
            <Link
              href="/trips/new"
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                boxShadow: "0 0 24px rgba(37,99,235,0.25)",
              }}
            >
              Plan your first trip →
            </Link>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-gray-600 text-sm"
          >
            No trips match &quot;{search}&quot;
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {filtered.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}