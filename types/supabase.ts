export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          slug: string
          company_name: string
          sender_name: string
          sender_email: string
          signature_text: string | null
          timezone: string
          ai_enabled: boolean
          inbound_email_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          company_name: string
          sender_name: string
          sender_email: string
          signature_text?: string | null
          timezone?: string
          ai_enabled?: boolean
          inbound_email_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          company_name?: string
          sender_name?: string
          sender_email?: string
          signature_text?: string | null
          timezone?: string
          ai_enabled?: boolean
          inbound_email_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          workspace_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: string
          plan: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: string
          plan?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: string
          plan?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sequences: {
        Row: {
          id: string
          workspace_id: string
          name: string
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sequence_steps: {
        Row: {
          id: string
          sequence_id: string
          step_number: number
          delay_days: number
          subject_template: string
          body_template: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sequence_id: string
          step_number: number
          delay_days: number
          subject_template: string
          body_template: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sequence_id?: string
          step_number?: number
          delay_days?: number
          subject_template?: string
          body_template?: string
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          workspace_id: string
          customer_email: string
          customer_name: string | null
          service_type: string | null
          status: string
          thread_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          customer_email: string
          customer_name?: string | null
          service_type?: string | null
          status?: string
          thread_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          customer_email?: string
          customer_name?: string | null
          service_type?: string | null
          status?: string
          thread_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          lead_id: string
          workspace_id: string
          direction: string
          subject: string | null
          body: string | null
          from_email: string | null
          to_email: string | null
          sendgrid_message_id: string | null
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          workspace_id: string
          direction: string
          subject?: string | null
          body?: string | null
          from_email?: string | null
          to_email?: string | null
          sendgrid_message_id?: string | null
          sent_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          workspace_id?: string
          direction?: string
          subject?: string | null
          body?: string | null
          from_email?: string | null
          to_email?: string | null
          sendgrid_message_id?: string | null
          sent_at?: string
          created_at?: string
        }
      }
      lead_sequence_state: {
        Row: {
          id: string
          lead_id: string
          sequence_id: string
          current_step: number
          next_send_at: string | null
          is_paused: boolean
          paused_reason: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          sequence_id: string
          current_step?: number
          next_send_at?: string | null
          is_paused?: boolean
          paused_reason?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          sequence_id?: string
          current_step?: number
          next_send_at?: string | null
          is_paused?: boolean
          paused_reason?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_default_sequence: {
        Args: { p_workspace_id: string }
        Returns: string
      }
      generate_inbound_email: {
        Args: { workspace_slug: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
