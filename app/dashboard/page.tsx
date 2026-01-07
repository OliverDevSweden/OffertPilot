import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/lib/db/workspaces";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
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
  } catch (error) {
    console.error("Dashboard error:", error);
    // If there's an error, redirect to onboarding to create a workspace
    redirect("/onboarding");
  }
}
