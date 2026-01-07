import { createClient } from '@/lib/supabase/server';
import { CreateWorkspaceData } from '@/types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function getUserWorkspaces(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(*)')
    .eq('user_id', userId);
  
  if (error) throw error;
  
  return data.map(item => ({
    ...item.workspaces,
    role: item.role,
  }));
}

export async function getWorkspaceById(workspaceId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function getWorkspaceBySlug(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function createWorkspace(data: CreateWorkspaceData, userId: string) {
  const supabase = await createClient();
  
  // Generate inbound email address
  const { data: inboundEmail, error: emailError } = await supabase
    .rpc('generate_inbound_email', { workspace_slug: data.slug });
  
  if (emailError) throw emailError;
  
  // Create workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({
      ...data,
      inbound_email_address: inboundEmail,
    })
    .select()
    .single();
  
  if (workspaceError) throw workspaceError;
  
  // Add user as owner
  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspace.id,
      user_id: userId,
      role: 'owner',
    });
  
  if (memberError) throw memberError;
  
  // Create default subscription
  const { error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      workspace_id: workspace.id,
      status: 'inactive',
    });
  
  if (subscriptionError) throw subscriptionError;
  
  // Create default sequence
  const { error: sequenceError } = await supabase
    .rpc('create_default_sequence', { p_workspace_id: workspace.id });
  
  if (sequenceError) throw sequenceError;
  
  return workspace;
}

export async function updateWorkspace(workspaceId: string, data: Partial<CreateWorkspaceData>) {
  const supabase = await createClient();
  
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .update(data)
    .eq('id', workspaceId)
    .select()
    .single();
  
  if (error) throw error;
  
  return workspace;
}

export async function getWorkspaceSubscription(workspaceId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();
  
  if (error) throw error;
  
  return data;
}
