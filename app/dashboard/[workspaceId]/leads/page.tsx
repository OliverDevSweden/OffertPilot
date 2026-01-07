import { createClient } from "@/lib/supabase/server";
import { getWorkspaceById } from "@/lib/db/workspaces";
import { getLeadsByWorkspace } from "@/lib/db/leads";
import { redirect } from "next/navigation";
import LeadsContent from "./LeadsContent";

export default async function LeadsPage({
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
    const leads = await getLeadsByWorkspace(workspaceId);

    return <LeadsContent workspace={workspace} leads={leads} />;
  } catch (error) {
    redirect("/dashboard");
  }
}
