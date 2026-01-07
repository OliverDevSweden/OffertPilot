import { createClient, createServiceClient } from '@/lib/supabase/server';
import { CreateLeadData, LeadStatus, LeadWithSequence } from '@/types';
import { addDays } from 'date-fns';

export async function getLeadsByWorkspace(workspaceId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      sequence_state:lead_sequence_state(*)
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data as LeadWithSequence[];
}

export async function getLeadById(leadId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      sequence_state:lead_sequence_state(*),
      messages(*)
    `)
    .eq('id', leadId)
    .single();
  
  if (error) throw error;
  
  return data;
}

export async function createLead(data: CreateLeadData) {
  const supabase = await createClient();
  
  // Create lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .insert(data)
    .select()
    .single();
  
  if (leadError) throw leadError;
  
  // Get default sequence for workspace
  const { data: defaultSequence, error: sequenceError } = await supabase
    .from('sequences')
    .select('id, sequence_steps(*)')
    .eq('workspace_id', data.workspace_id)
    .eq('is_default', true)
    .single();
  
  if (sequenceError) throw sequenceError;
  
  // Get first step delay
  const firstStep = defaultSequence.sequence_steps.find(s => s.step_number === 1);
  const nextSendAt = firstStep ? addDays(new Date(), firstStep.delay_days) : null;
  
  // Create lead sequence state
  const { error: stateError } = await supabase
    .from('lead_sequence_state')
    .insert({
      lead_id: lead.id,
      sequence_id: defaultSequence.id,
      current_step: 0,
      next_send_at: nextSendAt?.toISOString() || null,
    });
  
  if (stateError) throw stateError;
  
  return lead;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus, pausedReason?: string) {
  const supabase = await createClient();
  
  // Update lead status
  const { error: leadError } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId);
  
  if (leadError) throw leadError;
  
  // If pausing, update sequence state
  if (status === 'MANUAL_PAUSE' || status === 'REPLIED' || status === 'WON' || status === 'LOST') {
    const { error: stateError } = await supabase
      .from('lead_sequence_state')
      .update({
        is_paused: true,
        paused_reason: pausedReason || status,
      })
      .eq('lead_id', leadId);
    
    if (stateError) throw stateError;
  }
}

export async function findLeadByEmail(workspaceId: string, email: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('customer_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  
  return data;
}

export async function getLeadsForScheduler() {
  const supabase = await createServiceClient();
  
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('lead_sequence_state')
    .select(`
      *,
      lead:leads(*),
      sequence:sequences(
        *,
        steps:sequence_steps(*)
      )
    `)
    .eq('is_paused', false)
    .eq('is_completed', false)
    .lte('next_send_at', now)
    .not('next_send_at', 'is', null);
  
  if (error) throw error;
  
  return data;
}

export async function updateLeadSequenceState(
  leadId: string, 
  updates: {
    current_step?: number;
    next_send_at?: string | null;
    is_completed?: boolean;
  }
) {
  const supabase = await createServiceClient();
  
  const { error } = await supabase
    .from('lead_sequence_state')
    .update(updates)
    .eq('lead_id', leadId);
  
  if (error) throw error;
}
