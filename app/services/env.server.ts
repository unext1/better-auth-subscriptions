import 'dotenv/config';
import z from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BASE_URL: z.string().min(1),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
});

export const env = environmentSchema.parse(process.env);
