import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateWorkspace } from '@/lib/db/workspaces';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const workspace = await updateWorkspace(workspaceId, body);

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
