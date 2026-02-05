import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { db } from '~/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // biome-ignore lint/suspicious/noConsole: dev logging
        console.log(`Sending ${type} OTP to ${email}: ${otp}`);
        await Promise.resolve(); // Simulate async operation
      },
    }),
  ],
});
