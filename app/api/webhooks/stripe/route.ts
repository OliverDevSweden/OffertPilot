import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = await constructWebhookEvent(body, signature);
    const supabase: any = await createServiceClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const workspaceId = session.metadata.workspaceId;
        const plan = session.metadata.plan;
        
        // Create or update subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: 'active',
            plan: plan,
          })
          .eq('workspace_id', workspaceId);

        if (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            stripe_price_id: subscription.items.data[0].price.id,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error canceling subscription:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
