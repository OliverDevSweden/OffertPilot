import { createClient } from "@/lib/supabase/server";
import { getWorkspaceById } from "@/lib/db/workspaces";
import { getDashboardStats } from "@/lib/db/stats";
import { redirect } from "next/navigation";
import DashboardContent from "./DashboardContent";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const workspace = await getWorkspaceById(workspaceId);
    const stats = await getDashboardStats(workspaceId);

    return <DashboardContent workspace={workspace} stats={stats} />;
  } catch (error) {
    redirect("/dashboard");
  }
}
