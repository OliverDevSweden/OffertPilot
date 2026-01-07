import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createLead, findLeadByEmail, updateLeadStatus } from '@/lib/db/leads';
import { createMessage } from '@/lib/db/messages';
import { extractNameFromEmail, normalizeEmailForMatching, extractThreadId } from '@/lib/utils/template';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook (basic secret verification)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.EMAIL_INBOUND_WEBHOOK_SECRET;
    
    if (!authHeader || !expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const fromEmail = normalizeEmailForMatching(formData.get('from') as string || '');
    const toEmail = normalizeEmailForMatching(formData.get('to') as string || '');
    const subject = (formData.get('subject') as string) || '';
    const text = (formData.get('text') as string) || (formData.get('html') as string) || '';
    
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
    const existingLead = await findLeadByEmail((workspace as any).id, fromEmail) as any;
    
    if (existingLead) {
      // This is a reply - pause the sequence
      await updateLeadStatus(existingLead.id, 'REPLIED', 'customer_replied');
      
      // Save the inbound message
      await createMessage({
        lead_id: existingLead.id,
        workspace_id: (workspace as any).id,
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
      const customerName = extractNameFromEmail(fromEmail);
      const threadId = extractThreadId(subject);
      
      const lead = await createLead({
        workspace_id: (workspace as any).id,
        customer_email: fromEmail,
        customer_name: customerName,
        thread_id: threadId || undefined,
      }) as any;
      
      // Save the initial message
      await createMessage({
        lead_id: lead.id,
        workspace_id: (workspace as any).id,
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
