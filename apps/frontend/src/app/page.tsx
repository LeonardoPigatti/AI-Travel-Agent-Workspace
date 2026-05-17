import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">
            Voyage<span className="text-primary">AI</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-powered travel planning with multiple intelligent agents
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/trips">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/trips/new">Plan a Trip</Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-12 text-sm text-muted-foreground">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl mb-2">🗺️</div>
            <div className="font-medium text-foreground">Destination Agent</div>
            <div>Researches the best places to visit</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium text-foreground">Budget Agent</div>
            <div>Optimizes your travel budget</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-medium text-foreground">Itinerary Agent</div>
            <div>Creates your perfect schedule</div>
          </div>
        </div>
      </div>
    </main>
  );
}