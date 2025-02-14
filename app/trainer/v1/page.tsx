// app/trainer/page.tsx (Server Component)
import { currentUser } from "@/lib/auth";
import TrainerPageClient from "./client-component";
import { ExtendedUser } from "@/schemas";

export default async function TrainerPage() {
  const user = await currentUser() as ExtendedUser;
  return <TrainerPageClient user={user} />;
}