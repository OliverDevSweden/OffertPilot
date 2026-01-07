import { createClient } from "@/lib/supabase/server";
import {
  getWorkspaceById,
  getWorkspaceSubscription,
} from "@/lib/db/workspaces";
import { redirect } from "next/navigation";
import BillingContent from "./BillingContent";

export default async function BillingPage({
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

    return <BillingContent workspace={workspace} subscription={subscription} />;
  } catch (error) {
    redirect("/dashboard");
  }
}
