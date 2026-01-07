# Quick Start Guide

Kom igång med OffertPilot på 5 minuter!

## Förutsättningar

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Supabase account (gratis)
- SendGrid account (gratis tier räcker)

## Installation

### 1. Clone och installera

```bash
git clone <repo-url>
cd OffertPilot
pnpm install
```

### 2. Kopiera environment template

```bash
cp .env.example .env.local
```

### 3. Supabase Setup (2 min)

1. Skapa projekt på [supabase.com](https://supabase.com)
2. Gå till SQL Editor
3. Kopiera och kör `supabase/migrations/20240101000000_initial_schema.sql`
4. Kopiera och kör `supabase/migrations/20240101000001_seed_default_sequence.sql`
5. Gå till Settings > API och kopiera:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. SendGrid Setup (2 min)

1. Skapa account på [sendgrid.com](https://sendgrid.com)
2. Settings > API Keys > Create API Key (Full Access)
3. Kopiera key → `SENDGRID_API_KEY`

### 5. Minimal .env.local för utveckling

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# SendGrid
SENDGRID_API_KEY=SG.xxxxx

# App
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
APP_INBOUND_EMAIL_DOMAIN=in.offertpilot.se
EMAIL_INBOUND_WEBHOOK_SECRET=dev-secret
CRON_SECRET=dev-secret

# Optional (lämna tom för utveckling)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
```

### 6. Starta utvecklingsserver

```bash
pnpm dev
```

Öppna [http://localhost:3000](http://localhost:3000)

## Nästa steg

### För utveckling:

1. Skapa ett konto
2. Skapa workspace
3. Utforska dashboard
4. Testa funktioner lokalt

### För production:

1. Konfigurera Stripe (se [DEPLOYMENT.md](DEPLOYMENT.md))
2. Konfigurera OpenAI (valfritt)
3. Sätt upp email domain
4. Deploya till Vercel
5. Konfigurera webhooks

## Vanliga problem

### "Supabase connection error"

- Kontrollera att URL och keys är korrekta
- Kolla att migrations har körts

### "Email sending failed"

- Kontrollera SendGrid API key
- För dev: emails kanske inte skickas utan verified sender

### "Database permissions error"

- RLS policies kräver att du är inloggad
- Använd service role key för server-side operations

## Hjälp

- 📖 [README.md](README.md) - Fullständig dokumentation
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- 🤝 [CONTRIBUTING.md](CONTRIBUTING.md) - Bidra till projektet
- 📧 support@offertpilot.se

## Utvecklingsmiljö

Rekommenderade VS Code extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostCSS Language Support

Användbara kommandon:

```bash
pnpm dev          # Starta dev server
pnpm build        # Bygg för production
pnpm start        # Kör production build
pnpm lint         # Lint kod
```

## Testa systemet lokalt

1. **Skapa test-lead manuellt:**

   - Gå till Supabase Table Editor
   - Lägg till rad i `leads` table
   - Verifiera att sequence state skapas

2. **Testa scheduler:**

   - Ändra `delay_days` i sequence_steps till 0
   - Sätt `next_send_at` till nu
   - Gå till `http://localhost:3000/api/cron/send-emails?secret=dev-secret`
   - Kontrollera att email skickas

3. **Testa template substitution:**
   - Se exempel i `lib/utils/__tests__/template.test.ts`
   - Kör i Node console eller skapa test-route

Lycka till! 🚀
