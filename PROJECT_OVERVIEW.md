# OffertPilot - Projektöversikt

## 📊 Sammanfattning

OffertPilot är en fullständig production-ready micro-SaaS applikation för städfirmor i Sverige. Systemet automatiserar uppföljningar av offerter genom intelligent e-postsekvensering.

## ✅ Vad är implementerat

### Kärnfunktionalitet

- ✅ **Authentication & Authorization**

  - Supabase Auth integration
  - Email/password signup och login
  - Session management med middleware
  - Row Level Security (RLS) på alla tabeller

- ✅ **Workspace Management**

  - Multi-workspace support
  - Workspace settings (företagsnamn, avsändare, signatur)
  - Unik BCC-adress per workspace
  - AI toggle (aktivera/inaktivera per workspace)

- ✅ **Lead Management**

  - BCC-baserad lead ingestion
  - Automatisk lead-skapande från inkommande emails
  - Lead status tracking (SENT, REPLIED, WON, LOST, MANUAL_PAUSE)
  - Email threading support

- ✅ **Email Sequences**

  - Default 3-stegs sequence (dag 2, 5, 9)
  - Template-baserade emails med placeholders
  - Automatisk schemaläggning
  - Auto-pause vid kundsvar

- ✅ **Email Infrastructure**

  - SendGrid integration (inbound + outbound)
  - Template substitution ({namn}, {tjänst}, {signatur})
  - OpenAI email enhancement (valfritt)
  - Message logging (alla in/out emails)

- ✅ **Scheduler**

  - Vercel Cron (körs var 15:e minut)
  - Hanterar alla schedulade emails
  - Uppdaterar sequence state automatiskt
  - Error handling och retry logic

- ✅ **Billing**

  - Stripe Checkout integration
  - 3 subscription plans (Starter, Professional, Enterprise)
  - Webhook synkronisering
  - Customer Portal för subscription management
  - Feature gating baserat på plan

- ✅ **Dashboard**

  - Statistik (leads denna månad, emails skickade, svarfrekvens)
  - Aktiva leads med nästa utskick-tid
  - Lead status management
  - Alla leads översikt

- ✅ **Security**
  - RLS policies på alla tabeller
  - Webhook signature verification
  - Environment variables för secrets
  - CORS konfiguration
  - Auth middleware

### Teknisk Implementation

- ✅ **Next.js 14+ App Router**

  - Server Components
  - Server Actions
  - API Routes
  - Middleware
  - TypeScript strict mode

- ✅ **Database**

  - Supabase PostgreSQL
  - Komplett schema med migrations
  - RLS policies
  - Triggers och functions
  - Indexes för performance

- ✅ **UI/UX**
  - Tailwind CSS
  - Responsive design
  - Modern, clean interface
  - Swedish language
  - Form validation

## 📁 Fil- och Mappstruktur

```
OffertPilot/
├── 📱 app/                          # Next.js App Router
│   ├── (auth)/                      # Auth pages
│   │   ├── login/                   # Login page
│   │   ├── signup/                  # Signup page
│   │   └── onboarding/              # Workspace creation
│   ├── dashboard/                   # Dashboard pages
│   │   ├── [workspaceId]/
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── DashboardContent.tsx
│   │   │   ├── leads/              # All leads view
│   │   │   ├── settings/           # Workspace settings
│   │   │   └── billing/            # Billing & subscriptions
│   │   └── page.tsx                # Workspace redirect
│   ├── api/                        # API routes
│   │   ├── webhooks/
│   │   │   ├── stripe/            # Stripe webhook
│   │   │   └── email/inbound/     # Email inbound webhook
│   │   ├── cron/
│   │   │   └── send-emails/       # Scheduler endpoint
│   │   ├── workspaces/            # Workspace CRUD
│   │   ├── leads/                 # Lead management
│   │   └── stripe/                # Stripe Checkout/Portal
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Landing page
│
├── 🔧 lib/                          # Business logic
│   ├── supabase/
│   │   ├── server.ts              # Server client
│   │   └── client.ts              # Browser client
│   ├── db/                        # Data access layer
│   │   ├── workspaces.ts
│   │   ├── leads.ts
│   │   ├── messages.ts
│   │   └── stats.ts
│   ├── email/
│   │   └── sendgrid.ts            # Email sending
│   ├── ai/
│   │   └── enhance.ts             # OpenAI integration
│   ├── stripe/
│   │   └── index.ts               # Stripe helpers
│   └── utils/
│       ├── template.ts            # Template substitution
│       ├── date.ts                # Date formatting
│       └── helpers.ts             # General helpers
│
├── 🗄️ supabase/                    # Database
│   └── migrations/
│       ├── 20240101000000_initial_schema.sql
│       └── 20240101000001_seed_default_sequence.sql
│
├── 📝 types/                        # TypeScript types
│   ├── supabase.ts                # Generated DB types
│   └── index.ts                   # Custom types
│
├── 🔒 middleware.ts                 # Auth middleware
├── 📦 package.json
├── ⚙️ tsconfig.json
├── 🎨 tailwind.config.ts
├── 🚀 vercel.json                   # Vercel Cron config
├── 📖 README.md                     # Huvuddokumentation
├── 🚀 DEPLOYMENT.md                 # Deployment guide
├── ⚡ QUICKSTART.md                 # Quick start
├── 🤝 CONTRIBUTING.md               # Contributing guide
└── 📋 CHANGELOG.md                  # Version history
```

## 🔑 Miljövariabler (Environment Variables)

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL           # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Public anon key
SUPABASE_SERVICE_ROLE_KEY          # Service role (server-only)

# Stripe (Required for billing)
STRIPE_SECRET_KEY                  # Secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY # Publishable key
STRIPE_WEBHOOK_SECRET              # Webhook signing secret
STRIPE_STARTER_PRICE_ID           # Starter plan price ID
STRIPE_PROFESSIONAL_PRICE_ID      # Professional plan price ID
STRIPE_ENTERPRISE_PRICE_ID        # Enterprise plan price ID

# SendGrid (Required for emails)
SENDGRID_API_KEY                  # API key
EMAIL_INBOUND_WEBHOOK_SECRET      # Webhook verification

# OpenAI (Optional)
OPENAI_API_KEY                    # API key for AI enhancement

# App Configuration
NEXT_PUBLIC_APP_BASE_URL          # Base URL (e.g., https://app.offertpilot.se)
APP_INBOUND_EMAIL_DOMAIN          # Email domain (e.g., in.offertpilot.se)
CRON_SECRET                       # Secret for cron authentication
```

## 🔄 Dataflöden

### Lead Capture Flow

```
Offert skickas med BCC
    ↓
SendGrid tar emot
    ↓
POST /api/webhooks/email/inbound
    ↓
Lead skapas i DB
    ↓
Message (in) loggas
    ↓
Lead länkas till default sequence
    ↓
next_send_at sätts till dag 2
```

### Scheduler Flow

```
Vercel Cron (var 15 min)
    ↓
GET /api/cron/send-emails
    ↓
Hämta leads där next_send_at <= NOW
    ↓
För varje lead:
  - Hämta nästa sequence step
  - Substituera template
  - (Valfritt) AI-förbättra
  - Skicka via SendGrid
  - Logga message (out)
  - Uppdatera sequence state
```

### Reply Detection Flow

```
Kund svarar på email
    ↓
SendGrid tar emot reply
    ↓
POST /api/webhooks/email/inbound
    ↓
Matcha mot befintlig lead (email)
    ↓
Sätt status = REPLIED
    ↓
Pausa sequence
    ↓
Logga message (in)
```

## 🎯 Subscription Plans

| Feature            | Free | Starter | Professional | Enterprise |
| ------------------ | ---- | ------- | ------------ | ---------- |
| Leads/månad        | 10   | 50      | Unlimited    | Unlimited  |
| Auto-uppföljningar | ❌   | ✅      | ✅           | ✅         |
| AI-emails          | ❌   | ❌      | ✅           | ✅         |
| Statistik          | Bas  | Bas     | Avancerad    | Avancerad  |
| Support            | ❌   | Email   | Prioriterad  | Dedikerad  |
| Pris/mån           | 0    | 299 SEK | 599 SEK      | 1499 SEK   |

## 🛠️ Installation & Setup

Se [QUICKSTART.md](QUICKSTART.md) för snabb igångsättning.
Se [DEPLOYMENT.md](DEPLOYMENT.md) för production deployment.

## 🧪 Testing

### Manuell testning

1. Skapa konto och workspace
2. Lägg till test-lead via Supabase
3. Ändra delay_days till 0 för snabb test
4. Kör scheduler manuellt: `/api/cron/send-emails`
5. Verifiera email skickades

### Unit tests

```bash
# Template substitution
pnpm test lib/utils/template.test.ts
```

## 📈 Performance

- Server-side rendering för snabb initial load
- Database indexes på ofta använda queries
- RLS för automatisk data isolation
- Optimistic updates i UI

## 🔒 Security Features

- Row Level Security (RLS) på alla tabeller
- Webhook signature verification
- Environment variables för secrets
- HTTPS only
- CORS konfiguration
- Rate limiting (planerat)

## 🚧 Vad är kvar för production

### Kritiskt

- [ ] Email deliverability (SPF, DKIM, DMARC)
- [ ] Custom domain setup
- [ ] Monitoring & logging (Sentry)
- [ ] Rate limiting
- [ ] GDPR compliance

### Önskvärt

- [ ] More comprehensive tests
- [ ] Error boundaries i UI
- [ ] Email unsubscribe handling
- [ ] Custom sequences (inte bara default)
- [ ] Team collaboration
- [ ] API för integrations

## 📊 Database Schema

9 huvudtabeller:

- `profiles` - User profiles
- `workspaces` - Företag
- `workspace_members` - User-workspace koppling
- `subscriptions` - Stripe subscriptions
- `sequences` - Email sequences
- `sequence_steps` - Sequence steg
- `leads` - Kund-leads
- `messages` - Email messages (in/out)
- `lead_sequence_state` - Current state i sequence

## 🎨 UI Components

- Landing page med feature showcase
- Authentication forms (login/signup)
- Onboarding flow
- Dashboard med stats cards
- Leads table med filtering
- Settings form
- Billing page med plan selection
- Responsive design med Tailwind

## 📚 Dokumentation

- ✅ README.md - Fullständig dokumentation
- ✅ DEPLOYMENT.md - Deployment guide
- ✅ QUICKSTART.md - Snabb start
- ✅ CONTRIBUTING.md - Bidrag guide
- ✅ CHANGELOG.md - Version history
- ✅ Inline kod-kommentarer
- ✅ TypeScript types för allt

## 💰 Cost Estimation

**Månadskostnader (100 aktiva workspaces):**

- Vercel Pro: $20
- Supabase Pro: $25
- SendGrid Essentials: $20
- OpenAI: ~$5
- Stripe fees: ~1.4% + 1.8 SEK/transaktion
- **Total: ~$70/månad + Stripe fees**

**Revenue (100 workspaces à genomsnitt 299 SEK):**

- 100 × 299 SEK = 29,900 SEK (~$2,800/månad)
- **Gross margin: >95%**

## 🎓 Lärdomar & Best Practices

1. **Supabase RLS är powerful** - Ingen backend-logik behövs för auth
2. **Server Actions vs API Routes** - Använd Server Actions där möjligt
3. **TypeScript strict mode** - Fångar många buggar tidigt
4. **Template substitution** - Enkel men effektiv personalisering
5. **Vercel Cron** - Perfekt för schemalagda tasks
6. **SendGrid Inbound Parse** - Genial för BCC-baserad lead capture

## 🤝 Contributing

Se [CONTRIBUTING.md](CONTRIBUTING.md) för guidelines.

## 📞 Support

- Email: support@offertpilot.se
- GitHub Issues: För bug reports
- Docs: README.md

## 📜 License

MIT License - Se LICENSE fil

---

**Status: Production Ready MVP ✅**

Systemet är fullt funktionellt och redo att användas. För production behövs ytterligare setup av email deliverability och monitoring.
