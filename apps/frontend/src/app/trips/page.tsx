import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tripsApi } from "@/lib/api/trips";
import type { Trip } from "@/types/trip";

const statusColors: Record<string, string> = {
  draft: "secondary",
  planning: "default",
  ready: "default",
  archived: "secondary",
};

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-semibold">{trip.title}</h2>
          <Badge variant={statusColors[trip.status] as "default" | "secondary"}>
            {trip.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{trip.destination}</p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>📅 {trip.duration_days} days</span>
          <span>💰 {trip.currency} {Number(trip.budget).toLocaleString()}</span>
        </div>
      </div>
    </Link>
  );
}

export default async function TripsPage() {
  let trips = { items: [], total: 0 };

  try {
    trips = await tripsApi.list();
  } catch {
    // backend offline em dev — mostra lista vazia
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Trips</h1>
            <p className="text-muted-foreground mt-1">{trips.total} trips planned</p>
          </div>
          <Button asChild>
            <Link href="/trips/new">+ New Trip</Link>
          </Button>
        </div>

        {trips.items.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-lg font-medium">No trips yet</p>
            <p className="text-sm mt-1">Start planning your first AI-powered trip</p>
            <Button asChild className="mt-6">
              <Link href="/trips/new">Plan a Trip</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {trips.items.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}