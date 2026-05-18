"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { tripsApi } from "@/lib/api/trips";
import { getDestinationImage } from "@/lib/api/pexels";

const SUGGESTIONS = [
  { destination: "Tokyo, Japan", title: "Japanese Gastronomy", days: 7, budget: 15000 },
  { destination: "Paris, France", title: "Parisian Romance", days: 5, budget: 12000 },
  { destination: "Bali, Indonesia", title: "Bali Wellness Retreat", days: 10, budget: 8000 },
  { destination: "New York, USA", title: "NYC City Break", days: 4, budget: 10000 },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function DestinationPreview({ destination }: { destination: string }) {
  const [imageUrl, setImageUrl] = useState("");
  const [loaded, setLoaded] = useState(false);
  const debouncedDest = useDebounce(destination, 800);

  useEffect(() => {
    if (debouncedDest.length > 2) {
      setLoaded(false);
      setImageUrl("");
      getDestinationImage(debouncedDest).then((url) => {
        setImageUrl(url);
      });
    } else {
      setImageUrl("");
      setLoaded(false);
    }
  }, [debouncedDest]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "#0d0d0d",
        border: "1px solid rgba(255,255,255,0.07)",
        minHeight: "500px",
      }}
    >
      <AnimatePresence>
        {imageUrl ? (
          <motion.div
            key={imageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: loaded ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={imageUrl}
              alt={debouncedDest}
              className="w-full h-full object-cover"
              onLoad={() => setLoaded(true)}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 p-6"
            >
              <p className="text-[11px] font-medium tracking-widest uppercase text-gray-400 mb-1">
                Destination
              </p>
              <p className="text-2xl font-light text-white">{debouncedDest}</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
          >
            {debouncedDest.length > 2 ? (
              <motion.div
                className="w-8 h-8 border border-gray-700 border-t-gray-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{
                    background: "rgba(37,99,235,0.08)",
                    border: "1px solid rgba(37,99,235,0.15)",
                  }}
                >
                  🌍
                </div>
                <p className="text-sm text-gray-500">
                  Type a destination to see a preview
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    destination: "",
    duration_days: "",
    budget: "",
    preferences: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function applySuggestion(s: typeof SUGGESTIONS[0]) {
    setForm({
      title: s.title,
      destination: s.destination,
      duration_days: String(s.days),
      budget: String(s.budget),
      preferences: "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const trip = await tripsApi.create({
        title: form.title,
        destination: form.destination,
        duration_days: Number(form.duration_days),
        budget: Number(form.budget),
        currency: "BRL",
        preferences: form.preferences,
      });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip");
      setLoading(false);
    }
  }

  const isValid = form.title && form.destination && form.duration_days && form.budget;

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
        className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto"
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
        <Link href="/trips" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← My Trips
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-2 gap-12 items-start">

          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-2">
              New Mission
            </p>
            <h1 className="text-2xl font-light text-gray-100 mb-8">Plan a Trip</h1>

            {/* Quick suggestions */}
            <div className="mb-8">
              <p className="text-[11px] text-gray-600 mb-3">Quick start</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.destination}
                    onClick={() => applySuggestion(s)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    }}
                  >
                    {s.destination.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Trip name */}
              <div>
                <label className="block text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-2">
                  Trip Name
                </label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Japanese Gastronomy Adventure"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-700 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-2">
                  Destination
                </label>
                <input
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  placeholder="Tokyo, Japan"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-700 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                />
              </div>

              {/* Duration + Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-2">
                    Duration
                  </label>
                  <div className="relative">
                    <input
                      value={form.duration_days}
                      onChange={(e) => set("duration_days", e.target.value)}
                      placeholder="7"
                      type="number"
                      min={1}
                      max={365}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-700 outline-none transition-all duration-200 pr-12"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                      days
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-2">
                    Budget (BRL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                      R$
                    </span>
                    <input
                      value={form.budget}
                      onChange={(e) => set("budget", e.target.value)}
                      placeholder="15.000"
                      type="number"
                      min={1}
                      required
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-700 outline-none transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-2">
                  Preferences{" "}
                  <span className="text-gray-700 normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={form.preferences}
                  onChange={(e) => set("preferences", e.target.value)}
                  placeholder="Focus on gastronomy, local markets, avoid tourist traps..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-700 outline-none transition-all duration-200 resize-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl text-xs text-red-400"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !isValid}
                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all duration-300 disabled:opacity-40"
                style={{
                  background: isValid && !loading
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "rgba(255,255,255,0.06)",
                  boxShadow: isValid && !loading
                    ? "0 0 24px rgba(37,99,235,0.3)"
                    : "none",
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Creating mission...</span>
                  </div>
                ) : (
                  "Launch Mission →"
                )}
              </button>
            </form>
          </motion.div>

          {/* Right — Preview */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="sticky top-8"
          >
            <p className="text-[11px] font-medium tracking-widest uppercase text-gray-600 mb-3">
              Destination Preview
            </p>
            <DestinationPreview destination={form.destination} />

            <AnimatePresence>
              {isValid && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(37,99,235,0.06)",
                    border: "1px solid rgba(37,99,235,0.15)",
                  }}
                >
                  <p className="text-[11px] font-medium tracking-widest uppercase text-blue-500 mb-3">
                    Mission Summary
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Trip", value: form.title },
                      { label: "Destination", value: form.destination },
                      { label: "Duration", value: `${form.duration_days} days` },
                      { label: "Budget", value: `BRL ${Number(form.budget).toLocaleString()}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">{label}</span>
                        <span className="text-xs text-gray-300 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}