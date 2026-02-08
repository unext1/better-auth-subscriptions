# Organization Based Stripe Subscriptions with Better Auth & React Router v7

A minimal, functional demo app built for my YouTube tutorial showing how to implement organization level Stripe subscriptions using Better Auth and React Router v7.

## What This Is

This project demonstrates:

- **Better Auth** with the organization plugin
- **Stripe subscriptions attached to organizations** (not individual users)
- **Email OTP authentication** (passwordless login)
- Organization creation and subscription upgrades and cancellations
- React Router v7 server-side rendering and data loading
- Minimal UI built with Tailwind CSS and shadcn/ui (focused on functionality, not polish)

## Key Features

- **Passwordless auth**: Users log in via email OTP codes
- **Organization-first**: Create and manage organizations
- **Org subscriptions**: Subscribe organizations to a "pro" plan via Stripe
- **Stripe webhooks**: Handle subscription events server-side
- **SQLite + Drizzle**: Local database with type-safe queries

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Stripe account with API keys
- Stripe CLI (for webhook testing locally)

### Installation

1. Clone and install:

```bash
git clone git@github.com:unext1/better-auth-subscriptions.git
cd better-auth-subscription
pnpm install
```

2. Set up environment variables:

Create a `.env` file based on `.env.example`:

```bash
BASE_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Getting your Stripe keys:**

- Get `STRIPE_SECRET_KEY` from your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- Get `STRIPE_WEBHOOK_SECRET` by running: `stripe listen --forward-to http://localhost:3000/api/auth/stripe/webhook`

3. Setup database:

```bash
pnpm migrate:apply
```

4. Start the dev server:

```bash
pnpm dev
```

5. In another terminal, forward Stripe webhooks:

```bash
stripe listen --forward-to http://localhost:3000/api/auth/stripe/webhook
```

Your app will be available at http://localhost:3000

## 📂 Project Structure

- `/app/routes/_auth+/` - Login/logout with email OTP
- `/app/routes/onboarding+/` - Organization creation and listing
- `/app/routes/org+/$id/` - Organization dashboard with subscription management
- `/app/services/auth.server.ts` - Better Auth configuration with Stripe plugin
- `/app/db/` - Drizzle ORM setup and migrations

---

Built with React Router v7, Better Auth, and Stripe.
