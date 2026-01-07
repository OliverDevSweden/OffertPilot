import { createClient } from "@/lib/supabase/server";
import {
  getWorkspaceById,
  getWorkspaceSubscription,
} from "@/lib/db/workspaces";
import { redirect } from "next/navigation";
import SettingsContent from "./SettingsContent";

export default async function SettingsPage({
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
    const subscription = await getWorkspaceSubscription(workspaceId);

    return (
      <SettingsContent workspace={workspace} subscription={subscription} />
    );
  } catch (error) {
    redirect("/dashboard");
  }
}
