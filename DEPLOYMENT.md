# Deployment Guide

## Vercel Deployment (Rekommenderat)

### Steg 1: Förberedelser

1. Skapa GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/offertpilot.git
git push -u origin main
```

2. Skapa accounts:

- [Vercel](https://vercel.com)
- [Supabase](https://supabase.com)
- [Stripe](https://stripe.com)
- [SendGrid](https://sendgrid.com)
- [OpenAI](https://platform.openai.com)

### Steg 2: Supabase Setup

1. Skapa nytt projekt i Supabase
2. Gå till SQL Editor
3. Kör migrations:

   - Kopiera innehållet från `supabase/migrations/20240101000000_initial_schema.sql`
   - Kör i SQL Editor
   - Kopiera innehållet från `supabase/migrations/20240101000001_seed_default_sequence.sql`
   - Kör i SQL Editor

4. Hämta credentials:
   - Settings > API
   - Kopiera Project URL
   - Kopiera anon/public key
   - Kopiera service_role key (håll hemlig!)

### Steg 3: SendGrid Setup

1. Skapa account och verifiera email
2. Skapa API Key:

   - Settings > API Keys
   - Create API Key
   - Full Access
   - Kopiera key

3. Verifiera sender domain:

   - Settings > Sender Authentication
   - Authenticate Your Domain
   - Följ DNS-instruktionerna

4. Konfigurera Inbound Parse (efter Vercel deployment):

   - Settings > Inbound Parse
   - Add Host & URL
   - Domain: `in.yourdomain.com`
   - URL: `https://your-vercel-app.vercel.app/api/webhooks/email/inbound`

5. Lägg till MX record i DNS:
   ```
   Type: MX
   Host: in
   Value: mx.sendgrid.net
   Priority: 10
   TTL: 3600
   ```

### Steg 4: Stripe Setup

1. Skapa Stripe account
2. Skapa produkter:

   - Products > Add product
   - Skapa 3 recurring products:
     - Starter: 299 SEK/månad
     - Professional: 599 SEK/månad
     - Enterprise: 1499 SEK/månad
   - Kopiera Price IDs

3. Hämta API keys:

   - Developers > API Keys
   - Kopiera Publishable key
   - Kopiera Secret key

4. Konfigurera webhook (efter Vercel deployment):
   - Developers > Webhooks
   - Add endpoint
   - URL: `https://your-vercel-app.vercel.app/api/webhooks/stripe`
   - Events:
     - checkout.session.completed
     - customer.subscription.updated
     - customer.subscription.deleted
   - Kopiera Webhook signing secret

### Steg 5: OpenAI Setup

1. Skapa account på platform.openai.com
2. Add payment method (krävs för API access)
3. API Keys > Create new secret key
4. Kopiera key

### Steg 6: Vercel Deployment

1. Gå till [vercel.com](https://vercel.com/new)
2. Import GitHub repository
3. Konfigurera projekt:

   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `pnpm build`
   - Output Directory: .next

4. Lägg till Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
EMAIL_INBOUND_WEBHOOK_SECRET=create-random-secret-here

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# App
NEXT_PUBLIC_APP_BASE_URL=https://your-vercel-app.vercel.app
APP_INBOUND_EMAIL_DOMAIN=in.yourdomain.com
CRON_SECRET=create-another-random-secret
```

5. Deploy!

### Steg 7: Post-Deployment

1. **Custom Domain** (valfritt):

   - Vercel Dashboard > Settings > Domains
   - Add domain
   - Följ DNS-instruktionerna
   - Uppdatera `NEXT_PUBLIC_APP_BASE_URL`

2. **Uppdatera Webhooks**:

   - SendGrid: Uppdatera Inbound Parse URL
   - Stripe: Uppdatera webhook endpoint URL

3. **Verifiera Cron**:

   - Vercel Dashboard > Deployments > Functions
   - Se till att cron-funktionen finns
   - Vänta 15 minuter och kontrollera logs

4. **Testa systemet**:
   - Skapa konto
   - Skapa workspace
   - Skicka test-email med BCC
   - Kontrollera att lead skapas
   - Vänta 2 dagar (eller ändra delay_days för test)
   - Verifiera att uppföljning skickas

## Production Checklist

- [ ] Custom domain konfigurerat
- [ ] SSL certifikat aktivt (Vercel auto)
- [ ] SendGrid sender domain verifierad
- [ ] Stripe i production mode
- [ ] Environment variables uppdaterade
- [ ] Webhooks konfigurerade och testade
- [ ] Cron fungerar (kontrollera logs)
- [ ] RLS policies verifierade
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics setup (Vercel Analytics)
- [ ] Backup strategi för databas
- [ ] GDPR compliance (privacy policy, terms)
- [ ] Email unsubscribe implementerat
- [ ] Rate limiting implementerat

## Monitoring & Maintenance

### Vercel Dashboard

- **Functions**: Se cron execution logs
- **Analytics**: User metrics
- **Logs**: Runtime errors

### Supabase Dashboard

- **Table Editor**: Manuella dataändringar
- **SQL Editor**: Queries och maintenance
- **Logs**: Database queries och errors
- **Auth**: User management

### Stripe Dashboard

- **Customers**: Se alla betalande kunder
- **Subscriptions**: Hantera prenumerationer
- **Webhooks**: Verifiera webhook deliveries
- **Logs**: Event history

### SendGrid Dashboard

- **Activity**: Se skickade emails
- **Suppressions**: Bounces och spam reports
- **Inbound Parse**: Webhook deliveries
- **Stats**: Email metrics

## Troubleshooting

### Emails skickas inte

1. Kontrollera SendGrid Activity Feed
2. Verifiera API key
3. Se Vercel function logs
4. Kontrollera sender domain verification

### Cron kör inte

1. Verifiera `vercel.json` finns
2. Kontrollera function logs i Vercel
3. Se till att `CRON_SECRET` matchar
4. Vänta upp till 15 minuter

### Stripe webhook misslyckades

1. Se webhook attempts i Stripe Dashboard
2. Verifiera endpoint URL
3. Kontrollera signing secret
4. Se Vercel function logs

### Database errors

1. Kontrollera RLS policies
2. Verifiera migrations kördes
3. Se Supabase logs
4. Testa queries i SQL Editor

## Scaling Considerations

### Database

- Supabase Free tier: 500 MB, 2 GB bandwidth
- Pro tier ($25/mo): 8 GB, 100 GB bandwidth
- Överväg indexing för större datasets
- Regelbundna vacuum och analyze

### Email

- SendGrid Free tier: 100 emails/dag
- Essentials ($20/mo): 50,000 emails/månad
- Pro ($90/mo): 1,500,000 emails/månad
- Överväg email warmup för ny domain

### Vercel

- Free tier: 100 GB bandwidth
- Pro tier ($20/mo): 1 TB bandwidth
- Cron limited to 1 invocation/minute på Free
- Överväg Pro för production

### OpenAI

- Pay-as-you-go
- GPT-4o-mini: ~$0.15/1M input tokens
- Sätt usage limits i OpenAI Dashboard
- Cache templates för att minska costs

## Backup Strategy

### Database Backups

Supabase gör automatiska backups:

- Point-in-time recovery (7 dagar på Free, 30 dagar på Pro)
- Exportera manuellt för extra säkerhet:

```sql
-- Export all tables
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### Environment Variables

- Spara säker kopia av alla secrets
- Använd password manager
- Dokumentera var varje key kommer ifrån

## Security Best Practices

1. **Never commit secrets**

   - Use environment variables
   - Add `.env*` to `.gitignore`

2. **Rotate keys regelbundet**

   - Stripe keys: var 6:e månad
   - API keys: var 3:e månad
   - Webhook secrets: om komprometterade

3. **Monitor för suspicious activity**

   - Stripe: unusual payment patterns
   - Supabase: query patterns
   - Vercel: function invocations

4. **Enable 2FA**
   - Vercel account
   - Supabase account
   - Stripe account
   - GitHub account

## Cost Estimation

**Monthly costs for 100 active workspaces:**

- Vercel Pro: $20
- Supabase Pro: $25
- SendGrid Essentials: $20
- OpenAI (500 emails/dag): ~$5
- Stripe fees: 1.4% + 1.8 SEK per transaction
- **Total: ~$70/månad + Stripe fees**

**Revenue at 100 workspaces (average Starter):**

- 100 × 299 SEK = 29,900 SEK (~$2,800)
- Gross margin: >95%

## Support

För deployment-frågor:

- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/docs
- Stripe: https://support.stripe.com
- SendGrid: https://support.sendgrid.com
