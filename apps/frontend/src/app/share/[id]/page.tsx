import { notFound } from "next/navigation";
import { tripsApi } from "@/lib/api/trips";
import { ShareWorkspace } from "@/components/features/trip/ShareWorkspace";

export const dynamic = "force-dynamic";

export default async function SharePage({
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

  return <ShareWorkspace trip={trip} />;
}