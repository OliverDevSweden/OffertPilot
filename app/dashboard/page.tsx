import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/lib/db/workspaces";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const workspaces = await getUserWorkspaces(user.id);

  if (workspaces.length === 0) {
    redirect("/onboarding");
  }

  // Redirect to first workspace
  redirect(`/dashboard/${workspaces[0].id}`);
}
