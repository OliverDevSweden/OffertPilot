import { NextRequest, NextResponse } from 'next/server';
import { updateLeadStatus } from '@/lib/db/leads';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, paused_reason } = await request.json();

    await updateLeadStatus(leadId, status, paused_reason);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating lead status:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
