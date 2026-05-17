"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tripsApi } from "@/lib/api/trips";

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      destination: (form.elements.namedItem("destination") as HTMLInputElement).value,
      duration_days: Number((form.elements.namedItem("duration_days") as HTMLInputElement).value),
      budget: Number((form.elements.namedItem("budget") as HTMLInputElement).value),
      currency: "BRL",
      preferences: (form.elements.namedItem("preferences") as HTMLTextAreaElement).value,
    };

    try {
      const trip = await tripsApi.create(data);
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create trip");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Plan a New Trip</h1>
          <p className="text-muted-foreground mt-1">
            Tell us about your trip and our AI agents will do the rest
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Trip name</Label>
            <Input
              id="title"
              name="title"
              placeholder="Japan Gastronomic Adventure"
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              name="destination"
              placeholder="Tokyo, Japan"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_days">Duration (days)</Label>
              <Input
                id="duration_days"
                name="duration_days"
                type="number"
                placeholder="7"
                min={1}
                max={365}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (BRL)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                placeholder="15000"
                min={1}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Preferences & interests</Label>
            <Textarea
              id="preferences"
              name="preferences"
              placeholder="Focus on gastronomy, sushi, ramen, izakayas, local markets..."
              rows={4}
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Trip"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}