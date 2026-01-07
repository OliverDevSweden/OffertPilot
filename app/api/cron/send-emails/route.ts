import { NextResponse } from 'next/server';
import { getLeadsForScheduler, updateLeadSequenceState } from '@/lib/db/leads';
import { createMessage } from '@/lib/db/messages';
import { sendEmail } from '@/lib/email/sendgrid';
import { substituteTemplate } from '@/lib/utils/template';
import { enhanceEmail } from '@/lib/ai/enhance';
import { getWorkspaceById } from '@/lib/db/workspaces';
import { addDays } from 'date-fns';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadsToProcess = await getLeadsForScheduler();
    
    console.log(`Processing ${leadsToProcess.length} leads for scheduled emails`);
    
    const results: any[] = [];
    
    for (const item of leadsToProcess as any[]) {
      try {
        const lead = item.lead as any;
        const sequence = item.sequence as any;
        const workspace = await getWorkspaceById(lead.workspace_id) as any;
        
        // Get next step
        const nextStepNumber = item.current_step + 1;
        const nextStep = sequence.steps.find((s: any) => s.step_number === nextStepNumber);
        
        if (!nextStep) {
          // No more steps - mark as completed
          await updateLeadSequenceState(lead.id, {
            is_completed: true,
          });
          results.push({ leadId: lead.id, status: 'completed' });
          continue;
        }
        
        // Prepare template context
        const context = {
          namn: lead.customer_name || undefined,
          tjänst: lead.service_type || undefined,
          signatur: workspace.signature_text || '',
          company_name: workspace.company_name,
        };
        
        // Substitute templates
        let subject = substituteTemplate(nextStep.subject_template, context);
        let body = substituteTemplate(nextStep.body_template, context);
        
        // Enhance with AI if enabled
        if (workspace.ai_enabled) {
          try {
            const enhanced = await enhanceEmail(subject, body, {
              ...context,
              subject,
              body,
            });
            subject = enhanced.subject;
            body = enhanced.body;
          } catch (error) {
            console.error('AI enhancement failed, using original:', error);
          }
        }
        
        // Send email
        const messageId = await sendEmail({
          to: lead.customer_email,
          from: workspace.sender_email,
          fromName: workspace.sender_name,
          subject,
          text: body,
        });
        
        // Log outbound message
        await createMessage({
          lead_id: lead.id,
          workspace_id: workspace.id,
          direction: 'out',
          subject,
          body,
          from_email: workspace.sender_email,
          to_email: lead.customer_email,
          sendgrid_message_id: messageId || undefined,
        });
        
        // Update sequence state
        const furtherStep = sequence.steps.find((s: any) => s.step_number === nextStepNumber + 1);
        const nextSendAt = furtherStep 
          ? addDays(new Date(), furtherStep.delay_days).toISOString()
          : null;
        
        await updateLeadSequenceState(lead.id, {
          current_step: nextStepNumber,
          next_send_at: nextSendAt,
          is_completed: !furtherStep,
        });
        
        results.push({ leadId: lead.id, status: 'sent', step: nextStepNumber });
      } catch (error: any) {
        console.error(`Error processing lead ${item.lead_id}:`, error);
        results.push({ leadId: item.lead_id, status: 'error', error: error.message });
      }
    }
    
    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
