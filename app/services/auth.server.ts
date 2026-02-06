import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP, organization } from 'better-auth/plugins';
import Stripe from 'stripe';
import { db } from '~/db';
import { env } from './env.server';
import { stripe } from '@better-auth/stripe';

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  plugins: [
    organization(),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      subscription: {
        enabled: true,
        plans: [
          {
            name: 'pro',
            priceId: 'price_1SxnWYEQkxlavIvl9Cp1b9hO',
          },
        ],
        authorizeReference: async ({ user, referenceId }) => {
          const member = await db.query.member.findFirst({
            where: (member, { eq, and }) => and(eq(member.userId, user.id), eq(member.organizationId, referenceId)),
          });

          return member?.role === 'owner' || member?.role === 'admin';
        },
      },
      organization: {
        enabled: true,
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // biome-ignore lint/suspicious/noConsole: dev logging
        console.log(`Sending ${type} OTP to ${email}: ${otp}`);
        await Promise.resolve(); // Simulate async operation
      },
    }),
  ],
});
