# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-07

### Added

- Initial MVP release
- Complete authentication system with Supabase
- Workspace management with multi-workspace support
- Lead ingestion via BCC email
- Automatic email sequences (3 steps: day 2, 5, 9)
- Email sending via SendGrid
- Vercel Cron scheduler for automated follow-ups
- Auto-pause on customer reply
- Dashboard with statistics (leads, emails sent, reply rate)
- Stripe subscription integration (3 plans)
- OpenAI email enhancement (optional)
- Row Level Security (RLS) for all tables
- Webhook verification for Stripe and SendGrid
- Template substitution system
- Comprehensive README and deployment guides
- Supabase migrations
- TypeScript types for all entities

### Features

- 📧 BCC-based lead capture
- 🤖 AI-powered email improvements
- 📊 Real-time dashboard analytics
- 💳 Stripe payment integration
- 🔒 Enterprise-grade security with RLS
- ⏰ Automated scheduling via Vercel Cron
- 🎨 Modern UI with Tailwind CSS
- 🌍 Swedish language support

### Technical

- Next.js 14+ with App Router
- TypeScript strict mode
- Supabase for database and auth
- SendGrid for email delivery
- OpenAI GPT-4o-mini for enhancements
- Stripe for subscriptions
- Vercel for hosting

## [Unreleased]

### Planned

- [ ] Custom email sequences (not just default)
- [ ] Sequence templates library
- [ ] Lead import/export (CSV)
- [ ] Team collaboration features
- [ ] Email template editor
- [ ] A/B testing for sequences
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] API for integrations
- [ ] Webhook events for third-party integrations
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Email tracking (opens, clicks)
- [ ] Custom fields for leads
- [ ] Lead scoring
- [ ] Integration with CRM systems

### Bug Fixes

- None yet - this is the initial release!

## Release Notes

### v0.1.0 - MVP Launch

This is the initial production-ready MVP of OffertPilot. The system is fully functional and ready for use by Swedish cleaning companies ("städfirmor").

**What works:**

- Complete user authentication and workspace setup
- Lead ingestion via BCC
- Automated 3-step email sequences
- Auto-pause when customers reply
- Stripe billing with 3 subscription tiers
- AI-enhanced emails (optional)
- Real-time dashboard

**What's needed for production:**

- Email deliverability setup (SPF, DKIM, DMARC)
- Domain configuration
- Monitoring and logging
- Rate limiting
- Additional testing
- GDPR compliance measures

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.
