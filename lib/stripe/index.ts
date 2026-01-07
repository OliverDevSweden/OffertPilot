import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    price: 299,
    currency: 'SEK',
    interval: 'month' as const,
    features: [
      '50 leads per månad',
      'Automatiska uppföljningar',
      'Basstatistik',
      'Email support',
    ],
    limits: {
      leadsPerMonth: 50,
    },
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    price: 599,
    currency: 'SEK',
    interval: 'month' as const,
    features: [
      'Obegränsade leads',
      'Automatiska uppföljningar',
      'AI-förbättrade emails',
      'Avancerad statistik',
      'Prioriterad support',
    ],
    limits: {
      leadsPerMonth: null, // Unlimited
    },
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    price: 1499,
    currency: 'SEK',
    interval: 'month' as const,
    features: [
      'Allt i Professional',
      'Flera användare',
      'Custom sequences',
      'API access',
      'Dedikerad support',
    ],
    limits: {
      leadsPerMonth: null, // Unlimited
    },
  },
};

export async function createCheckoutSession(
  workspaceId: string,
  plan: keyof typeof STRIPE_PLANS,
  customerId?: string
) {
  const planConfig = STRIPE_PLANS[plan];
  
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/dashboard/${workspaceId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/dashboard/${workspaceId}/billing`,
    metadata: {
      workspaceId,
      plan,
    },
  });
  
  return session;
}

export async function createCustomerPortalSession(customerId: string, workspaceId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/dashboard/${workspaceId}/billing`,
  });
  
  return session;
}

export async function constructWebhookEvent(
  body: string,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
