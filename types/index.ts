export type LeadStatus = 'SENT' | 'REPLIED' | 'WON' | 'LOST' | 'MANUAL_PAUSE';
export type MessageDirection = 'in' | 'out';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'inactive';
export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise';
export type WorkspaceRole = 'owner' | 'admin' | 'member';

export interface CreateWorkspaceData {
  slug: string;
  company_name: string;
  sender_name: string;
  sender_email: string;
  signature_text?: string;
  timezone?: string;
}

export interface CreateLeadData {
  workspace_id: string;
  customer_email: string;
  customer_name?: string;
  service_type?: string;
  thread_id?: string;
}

export interface TemplateContext {
  namn?: string;
  tjänst?: string;
  signatur: string;
  company_name?: string;
}

export interface EmailEnhancementContext extends TemplateContext {
  subject: string;
  body: string;
}

export interface LeadWithSequence {
  id: string;
  customer_email: string;
  customer_name: string | null;
  service_type: string | null;
  status: LeadStatus;
  created_at: string;
  sequence_state: {
    current_step: number;
    next_send_at: string | null;
    is_paused: boolean;
    paused_reason: string | null;
  } | null;
}

export interface DashboardStats {
  leads_this_month: number;
  emails_sent: number;
  reply_rate: number;
  active_leads: LeadWithSequence[];
}
