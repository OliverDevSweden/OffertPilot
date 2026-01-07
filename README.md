# OffertPilot

**En production-ready micro-SaaS för städfirmor i Sverige som automatiserar offertuppföljningar via email.**

## 🎯 Översikt

OffertPilot hjälper städfirmor att automatisera uppföljningar av offerter genom intelligenta e-postsekvenser. När en offert skickas startas automatiskt en uppföljningssekvens (dag 2, 5, och 9) som pausas automatiskt om kunden svarar.

### Kärnfunktioner

- ✅ **Automatiska uppföljningar** - 3-stegs sekvens efter första kontakten
- ✅ **BCC-baserad lead ingestion** - Skicka BCC till unik adress per workspace
- ✅ **Auto-pause vid svar** - Stoppar automatiskt uppföljningar när kund svarar
- ✅ **AI-förbättrade emails** - OpenAI optimerar texter (valfritt)
- ✅ **Stripe subscriptions** - 3 planer med webhook-synkronisering
- ✅ **Dashboard** - Översikt över leads, statistik, nästa utskick
- ✅ **Multi-workspace** - Stöd för flera företag per användare
- ✅ **RLS-säkerhet** - Supabase Row Level Security

## 🏗️ Teknisk Stack

- **Frontend:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **Email:** SendGrid (inbound + outbound)
- **AI:** OpenAI API (GPT-4o-mini)
- **Payments:** Stripe (Checkout + Webhooks)
- **Hosting:** Vercel (med Cron)
- **Version Control:** Git/GitHub

## 📁 Projektstruktur

```
OffertPilot/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── onboarding/
│   ├── dashboard/
│   │   ├── [workspaceId]/
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── settings/             # Workspace settings
│   │   │   └── billing/              # Stripe billing
│   │   └── page.tsx                  # Redirect to first workspace
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── stripe/               # Stripe webhook
│   │   │   └── email/inbound/        # SendGrid inbound webhook
│   │   ├── cron/
│   │   │   └── send-emails/          # Vercel Cron för schemaläggning
│   │   ├── workspaces/               # Workspace CRUD
│   │   ├── leads/                    # Lead management
│   │   └── stripe/                   # Stripe Checkout & Portal
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 # Server-side Supabase client
│   │   └── client.ts                 # Client-side Supabase client
│   ├── db/
│   │   ├── workspaces.ts             # Workspace queries
│   │   ├── leads.ts                  # Lead queries
│   │   ├── messages.ts               # Message queries
│   │   └── stats.ts                  # Dashboard statistics
│   ├── email/
│   │   └── sendgrid.ts               # SendGrid integration
│   ├── ai/
│   │   └── enhance.ts                # OpenAI email enhancement
│   ├── stripe/
│   │   └── index.ts                  # Stripe helpers
│   └── utils/
│       └── template.ts               # Template substitution
├── supabase/
│   └── migrations/
│       ├── 20240101000000_initial_schema.sql
│       └── 20240101000001_seed_default_sequence.sql
├── types/
│   ├── supabase.ts                   # Generated Supabase types
│   └── index.ts                      # Custom types
├── middleware.ts                     # Auth middleware
├── vercel.json                       # Vercel Cron config
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🚀 Setup & Installation

### 1. Prerequisites

- Node.js 18+ och pnpm
- Supabase project
- Stripe account
- SendGrid account
- OpenAI API key
- Vercel account (för deployment)

### 2. Clone och installera

```bash
git clone <repository-url>
cd OffertPilot
pnpm install
```

### 3. Supabase Setup

#### a) Skapa Supabase projekt

1. Gå till [supabase.com](https://supabase.com) och skapa nytt projekt
2. Kopiera URL och anon key

#### b) Kör migrations

```bash
# Installera Supabase CLI
npm install -g supabase

# Logga in
supabase login

# Länka projektet
supabase link --project-ref <your-project-ref>

# Kör migrations
supabase db push
```

Eller kör SQL-filerna manuellt i Supabase SQL Editor:

1. Öppna SQL Editor i Supabase Dashboard
2. Kör `supabase/migrations/20240101000000_initial_schema.sql`
3. Kör `supabase/migrations/20240101000001_seed_default_sequence.sql`

#### c) Konfigurera Auth

1. Gå till Authentication > Providers
2. Aktivera Email provider
3. Konfigurera redirect URLs:
   - Site URL: `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. SendGrid Setup

#### a) API Key

1. Gå till [sendgrid.com](https://sendgrid.com)
2. Settings > API Keys > Create API Key
3. Ge full access och kopiera key

#### b) Inbound Parse Setup

1. Settings > Inbound Parse > Add Host & URL
2. Domain: `in.offertpilot.se` (eller din subdomain)
3. URL: `https://yourdomain.com/api/webhooks/email/inbound`
4. Check all options (POST raw, spam check)

#### c) DNS Setup

Lägg till MX record i din DNS:

```
Type: MX
Host: in (eller subdomain)
Value: mx.sendgrid.net
Priority: 10
```

#### d) Verifiera Sender Domain

1. Settings > Sender Authentication
2. Authenticate Your Domain
3. Följ instruktionerna för att lägga till DNS-poster

### 5. Stripe Setup

#### a) API Keys

1. Gå till [stripe.com](https://stripe.com/dashboard)
2. Developers > API Keys
3. Kopiera Secret key och Publishable key

#### b) Skapa produkter och priser

```bash
# Använd Stripe CLI eller Dashboard
stripe prices create \
  --product "Starter Plan" \
  --currency sek \
  --unit-amount 29900 \
  --recurring-interval month
```

Eller skapa via Dashboard:

1. Products > Add Product
2. Skapa 3 planer: Starter (299 SEK), Professional (599 SEK), Enterprise (1499 SEK)
3. Kopiera Price IDs och lägg till i `.env`

#### c) Webhook Setup

1. Developers > Webhooks > Add endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Kopiera Webhook signing secret

### 6. OpenAI Setup

1. Gå till [platform.openai.com](https://platform.openai.com)
2. API Keys > Create new secret key
3. Kopiera key

### 7. Environment Variables

Kopiera `.env.example` till `.env.local`:

```bash
cp .env.example .env.local
```

Fyll i alla värden:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_INBOUND_WEBHOOK_SECRET=random-secret-here

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# App
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
APP_INBOUND_EMAIL_DOMAIN=in.offertpilot.se
CRON_SECRET=your-random-cron-secret
```

### 8. Lokal utveckling

```bash
pnpm dev
```

Öppna [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment till Vercel

### 1. Push till GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy till Vercel

1. Gå till [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Lägg till alla Environment Variables från `.env.local`
4. Deploy

### 3. Konfigurera Vercel Cron

Cron är redan konfigurerad i `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-emails",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Detta kör email-scheduler var 15:e minut.

### 4. Uppdatera webhook URLs

Efter deployment, uppdatera:

- **SendGrid Inbound Parse URL** till `https://yourdomain.vercel.app/api/webhooks/email/inbound`
- **Stripe Webhook URL** till `https://yourdomain.vercel.app/api/webhooks/stripe`
- **Environment variables** med rätt `NEXT_PUBLIC_APP_BASE_URL`

## 📊 Hur det fungerar

### Lead Ingestion Flow

1. Städfirma skickar offert till kund via sin vanliga email
2. Lägger till BCC till workspace-specifik adress (t.ex. `firmanamn.abc123@in.offertpilot.se`)
3. SendGrid tar emot mailet och skickar till `/api/webhooks/email/inbound`
4. System skapar Lead och Message i databasen
5. Lead länkas till default sequence med nästa utskick schemalagt om 2 dagar

### Scheduler Flow

1. Vercel Cron kör `/api/cron/send-emails` var 15:e minut
2. Hittar alla leads där `next_send_at <= NOW()` och inte pausade
3. För varje lead:
   - Hämtar nästa steg i sekvensen
   - Substituerar placeholders (`{namn}`, `{tjänst}`, `{signatur}`)
   - (Valfritt) Förbättrar text med OpenAI
   - Skickar email via SendGrid
   - Loggar outbound message
   - Uppdaterar `next_send_at` till nästa steg (eller markerar som klar)

### Reply Detection Flow

1. Kund svarar på uppföljningsmail
2. SendGrid tar emot reply och skickar till samma webhook
3. System matchar email mot befintliga leads (via `customer_email`)
4. Sätter lead status till `REPLIED`
5. Pausar sequence (`is_paused = true`, `paused_reason = "customer_replied"`)
6. Loggar inbound message

### Template Substitution

Templates använder placeholders:

- `{namn}` - Kundens namn (eller "Hej!" om saknas)
- `{tjänst}` - Typ av tjänst (eller "städtjänster")
- `{signatur}` - Företagets signatur

Exempel:

```
Subject: Uppföljning: Din offertförfrågan

Hej {namn},

Jag ville följa upp din förfrågan om {tjänst}.
Har du haft möjlighet att titta på informationen?

{signatur}
```

### AI Enhancement (Valfritt)

När `ai_enabled = true`:

1. System skickar template + kontext till OpenAI
2. GPT-4o-mini förbättrar texten (mer naturlig, professionell)
3. **Viktigt:** AI får INTE lägga till ny information (priser, datum, etc.)
4. Endast omformulering för bättre ton och språk

## 🔒 Säkerhet

### Row Level Security (RLS)

Alla tabeller har RLS policies:

- Users kan endast se data för workspaces de är medlemmar i
- Service role key används för webhooks och cron
- Webhook endpoints verifierar signaturer

### Webhook Verification

**Stripe:**

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);
```

**SendGrid Inbound:**

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${EMAIL_INBOUND_WEBHOOK_SECRET}`) {
  return 401;
}
```

**Cron:**

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${CRON_SECRET}`) {
  return 401;
}
```

### Secrets Management

- Alla secrets i environment variables
- `.env` i `.gitignore`
- Service role key används endast server-side
- Vercel miljövariabler krypterade

## 📈 Subscription Plans & Limits

| Feature            | Starter | Professional | Enterprise |
| ------------------ | ------- | ------------ | ---------- |
| Pris/mån           | 299 SEK | 599 SEK      | 1499 SEK   |
| Leads/mån          | 50      | Obegränsat   | Obegränsat |
| Auto-uppföljningar | ✅      | ✅           | ✅         |
| AI-emails          | ❌      | ✅           | ✅         |
| Statistik          | Bas     | Avancerad    | Avancerad  |
| Support            | Email   | Prioriterad  | Dedikerad  |
| Flera användare    | ❌      | ❌           | ✅         |
| API access         | ❌      | ❌           | ✅         |

### Free Tier (Utan subscription)

- Max 10 leads/mån
- Inga automatiska utskick
- Endast manuell hantering

## 🧪 Testing

### Testa template substitution

```typescript
import { substituteTemplate } from "@/lib/utils/template";

const result = substituteTemplate(
  "Hej {namn}, tack för din förfrågan om {tjänst}!",
  {
    namn: "Anna",
    tjänst: "kontorsstädning",
    signatur: "Mvh, Team",
  }
);
// Result: "Hej Anna, tack för din förfrågan om kontorsstädning!"
```

### Testa inbound webhook lokalt

```bash
curl -X POST http://localhost:3000/api/webhooks/email/inbound \
  -H "Authorization: Bearer your-secret" \
  -H "Content-Type: application/json" \
  -d @test-email.json
```

### Testa Stripe webhook lokalt

```bash
# Installera Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

## 🐛 Troubleshooting

### Emails skickas inte

1. Kontrollera SendGrid API key är korrekt
2. Verifiera sender domain i SendGrid
3. Kolla logs i SendGrid Activity Feed
4. Kontrollera att Vercel Cron körs (se Functions > Logs)

### Inbound emails kommer inte in

1. Verifiera MX records: `dig MX in.offertpilot.se`
2. Kontrollera Inbound Parse webhook URL i SendGrid
3. Testa med SendGrid Inbound Parse tester
4. Kolla webhook secret är rätt

### Stripe webhooks fungerar inte

1. Kontrollera webhook endpoint URL i Stripe Dashboard
2. Verifiera webhook signing secret
3. Se event logs i Stripe Dashboard > Webhooks
4. Testa med Stripe CLI

### RLS policies blockerar queries

1. Kontrollera att user är medlem i workspace
2. Använd service role key för server-side operations
3. Debug med Supabase logs (Dashboard > Logs)

## 📚 Viktiga API Endpoints

### Public

- `POST /api/webhooks/stripe` - Stripe webhook
- `POST /api/webhooks/email/inbound` - SendGrid inbound webhook
- `GET /api/cron/send-emails` - Scheduler (Vercel Cron)

### Authenticated

- `POST /api/workspaces` - Skapa workspace
- `PATCH /api/workspaces/[id]` - Uppdatera workspace
- `PATCH /api/leads/[id]/status` - Uppdatera lead status
- `POST /api/stripe/checkout` - Skapa Stripe Checkout session
- `POST /api/stripe/portal` - Skapa Customer Portal session

## 🚧 Vad är kvar för production?

### Implementerat ✅

- ✅ Komplett auth flow (signup, login, sessions)
- ✅ Workspace management med RLS
- ✅ Lead ingestion via BCC
- ✅ Sequence system med 3 steg
- ✅ Email sending via SendGrid
- ✅ Scheduler med Vercel Cron
- ✅ Auto-pause on reply
- ✅ Dashboard med statistik
- ✅ Stripe subscriptions med webhooks
- ✅ OpenAI email enhancement
- ✅ Security (RLS, webhook verification)

### Behöver kompletteras för production 🔧

1. **Email Deliverability**

   - SPF, DKIM, DMARC konfiguration
   - Sender reputation monitoring
   - Bounce/complaint handling
   - Email warmup för nya domäner

2. **Domain Setup**

   - Custom domain istället för Vercel-domain
   - SSL certifikat (hanteras av Vercel)
   - Email subdomain DNS (in.offertpilot.se)

3. **Monitoring & Logging**

   - Sentry eller liknande för error tracking
   - Log aggregation (Datadog, LogRocket)
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Performance monitoring (Vercel Analytics)

4. **Rate Limiting**

   - API rate limiting (Upstash, Vercel Edge Config)
   - Email sending rate limits
   - Webhook rate limiting

5. **Testing**

   - Unit tests (Vitest)
   - Integration tests
   - E2E tests (Playwright)
   - Load testing

6. **UI/UX Polish**

   - Loading states överallt
   - Error boundaries
   - Toast notifications
   - Optimistic updates
   - Mobile responsiveness

7. **Analytics**

   - User tracking (PostHog, Mixpanel)
   - Conversion funnels
   - Feature usage tracking
   - Revenue analytics

8. **Compliance**

   - GDPR compliance (privacy policy, cookie banner)
   - Data export functionality
   - Account deletion
   - Email unsubscribe handling

9. **Advanced Features**

   - Custom sequences (inte bara default)
   - Sequence templates
   - Lead import/export
   - Team collaboration
   - API för integrations
   - Webhooks för events

10. **Performance**
    - Database indexing review
    - Query optimization
    - Image optimization
    - Caching strategy (Redis)
    - CDN för static assets

## 📝 Database Schema Översikt

```sql
profiles              # User profiles (extends auth.users)
├── id (uuid, PK)
├── email
└── full_name

workspaces           # Städfirmor
├── id (uuid, PK)
├── slug (unique)
├── company_name
├── sender_email
├── sender_name
├── signature_text
├── timezone
├── ai_enabled
└── inbound_email_address (unique)

workspace_members    # User-workspace relations
├── id (uuid, PK)
├── workspace_id (FK)
├── user_id (FK)
└── role

subscriptions        # Stripe subscriptions
├── id (uuid, PK)
├── workspace_id (FK, unique)
├── stripe_customer_id
├── stripe_subscription_id
├── status
├── plan
└── current_period_end

sequences            # Email sequences
├── id (uuid, PK)
├── workspace_id (FK)
├── name
└── is_default

sequence_steps       # Individual steps in sequences
├── id (uuid, PK)
├── sequence_id (FK)
├── step_number
├── delay_days
├── subject_template
└── body_template

leads                # Customer leads
├── id (uuid, PK)
├── workspace_id (FK)
├── customer_email
├── customer_name
├── service_type
├── status
└── thread_id

messages             # Email messages (in/out)
├── id (uuid, PK)
├── lead_id (FK)
├── workspace_id (FK)
├── direction
├── subject
├── body
└── sendgrid_message_id

lead_sequence_state  # Current state of lead in sequence
├── id (uuid, PK)
├── lead_id (FK, unique)
├── sequence_id (FK)
├── current_step
├── next_send_at
├── is_paused
└── is_completed
```

## 🤝 Contributing

1. Fork projektet
2. Skapa feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push till branch (`git push origin feature/AmazingFeature`)
5. Öppna Pull Request

## 📄 License

MIT License - Se LICENSE fil för detaljer

## 💬 Support

- **Email:** support@offertpilot.se
- **Dokumentation:** [docs.offertpilot.se](https://docs.offertpilot.se)
- **Issues:** GitHub Issues

---

**Byggt med ❤️ för svenska städfirmor**
