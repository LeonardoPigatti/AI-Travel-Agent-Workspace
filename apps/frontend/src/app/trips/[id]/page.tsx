import { tripsApi } from "@/lib/api/trips";
import { notFound } from "next/navigation";
import { TripWorkspace } from "@/components/features/trip/TripWorkspace";

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

  return <TripWorkspace trip={trip} />;
}