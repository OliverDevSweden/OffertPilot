import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCustomerPortalSession } from '@/lib/stripe';
import { getWorkspaceSubscription } from '@/lib/db/workspaces';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId } = await request.json();

    const subscription = await getWorkspaceSubscription(workspaceId);

    if (!subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No customer ID found' },
        { status: 400 }
      );
    }

    const session = await createCustomerPortalSession(
      subscription.stripe_customer_id,
      workspaceId
    );

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
