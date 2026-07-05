import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSessionProfile } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (!profile || profile.status !== "approved") redirect("/pending");

  return <AppShell profile={profile as Profile}>{children}</AppShell>;
}
