import { createClient, createServiceClient } from '@/lib/supabase/server';
import { MessageDirection } from '@/types';

export async function createMessage(data: {
  lead_id: string;
  workspace_id: string;
  direction: MessageDirection;
  subject?: string;
  body?: string;
  from_email?: string;
  to_email?: string;
  sendgrid_message_id?: string;
}) {
  const supabase: any = await createServiceClient();
  
  const { data: message, error } = await supabase
    .from('messages')
    .insert(data)
    .select()
    .single();
  
  if (error) throw error;
  
  return message;
}

export async function getMessagesByLead(leadId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('lead_id', leadId)
    .order('sent_at', { ascending: true });
  
  if (error) throw error;
  
  return data;
}
