import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { tripsApi } from "@/lib/api/trips";
import { notFound } from "next/navigation";

export default async function TripWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let trip;
  try {
    trip = await tripsApi.get(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/trips" className="text-muted-foreground text-sm hover:text-foreground">
                ← My Trips
              </Link>
            </div>
            <h1 className="text-3xl font-bold">{trip.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-muted-foreground">{trip.destination}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{trip.duration_days} days</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {trip.currency} {Number(trip.budget).toLocaleString()}
              </span>
              <Badge>{trip.status}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit</Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-lg border bg-card p-6">
            <h2 className="font-semibold mb-4">AI Agent Chat</h2>
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-4xl mb-3">🤖</div>
              <p className="font-medium">Agents ready</p>
              <p className="text-sm mt-1">
                Chat coming in the next phase
              </p>
            </div>
          </div>

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
                {["Coordinator", "Destination", "Budget", "Hotel", "Itinerary"].map((agent) => (
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