import { createClient } from '@/lib/supabase/server';
import { startOfMonth, endOfMonth } from 'date-fns';
import { DashboardStats } from '@/types';

export async function getDashboardStats(workspaceId: string): Promise<DashboardStats> {
  const supabase = await createClient();
  
  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();
  
  // Get leads this month
  const { count: leadsThisMonth } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd);
  
  // Get emails sent this month
  const { count: emailsSent } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('direction', 'out')
    .gte('sent_at', monthStart)
    .lte('sent_at', monthEnd);
  
  // Get reply rate
  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);
  
  const { count: repliedLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('status', 'REPLIED');
  
  const replyRate = totalLeads && totalLeads > 0 ? (repliedLeads || 0) / totalLeads : 0;
  
  // Get active leads
  const { data: activeLeads } = await supabase
    .from('leads')
    .select(`
      *,
      sequence_state:lead_sequence_state(*)
    `)
    .eq('workspace_id', workspaceId)
    .in('status', ['SENT'])
    .order('created_at', { ascending: false })
    .limit(10);
  
  return {
    leads_this_month: leadsThisMonth || 0,
    emails_sent: emailsSent || 0,
    reply_rate: replyRate,
    active_leads: (activeLeads || []) as any,
  };
}
