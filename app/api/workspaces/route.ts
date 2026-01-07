import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createWorkspace } from '@/lib/db/workspaces';
import { CreateWorkspaceData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateWorkspaceData = await request.json();

    // Validate required fields
    if (!body.slug || !body.company_name || !body.sender_name || !body.sender_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const workspace = await createWorkspace(body, user.id);

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
