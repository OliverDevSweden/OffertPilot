import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createLead, findLeadByEmail, updateLeadStatus } from '@/lib/db/leads';
import { createMessage } from '@/lib/db/messages';
import { extractNameFromEmail, normalizeEmailForMatching, extractThreadId } from '@/lib/utils/template';
// @ts-ignore - SendGrid types
import { parseEmail } from '@sendgrid/inbound-mail-parser';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook (basic secret verification)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.EMAIL_INBOUND_WEBHOOK_SECRET;
    
    if (!authHeader || !expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.text();
    const parsed = parseEmail(body);
    
    const fromEmail = normalizeEmailForMatching(parsed.from.email);
    const toEmail = normalizeEmailForMatching(parsed.to[0].email);
    const subject = parsed.subject || '';
    const text = parsed.text || parsed.html || '';
    
    // Find workspace by inbound email address
    const supabase = await createServiceClient();
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('inbound_email_address', toEmail)
      .single();
    
    if (workspaceError || !workspace) {
      console.error('Workspace not found for email:', toEmail);
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }
    
    // Check if this is a reply to an existing lead
    const existingLead = await findLeadByEmail(workspace.id, fromEmail);
    
    if (existingLead) {
      // This is a reply - pause the sequence
      await updateLeadStatus(existingLead.id, 'REPLIED', 'customer_replied');
      
      // Save the inbound message
      await createMessage({
        lead_id: existingLead.id,
        workspace_id: workspace.id,
        direction: 'in',
        subject: subject,
        body: text,
        from_email: fromEmail,
        to_email: toEmail,
      });
      
      return NextResponse.json({ 
        status: 'reply_processed',
        leadId: existingLead.id 
      });
    } else {
      // This is a new lead
      const customerName = extractNameFromEmail(fromEmail) || parsed.from.name;
      const threadId = extractThreadId(subject);
      
      const lead = await createLead({
        workspace_id: workspace.id,
        customer_email: fromEmail,
        customer_name: customerName,
        thread_id: threadId,
      });
      
      // Save the initial message
      await createMessage({
        lead_id: lead.id,
        workspace_id: workspace.id,
        direction: 'in',
        subject: subject,
        body: text,
        from_email: fromEmail,
        to_email: toEmail,
      });
      
      return NextResponse.json({ 
        status: 'lead_created',
        leadId: lead.id 
      });
    }
  } catch (error: any) {
    console.error('Inbound email webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
