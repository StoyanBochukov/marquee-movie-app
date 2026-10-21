import Config from 'react-native-config';
import { z } from 'zod';

const envSchema = z.object({
  OMDB_API_KEY: z
    .string({ error: 'OMDB_API_KEY is missing. Copy .env.example to .env and rebuild the app.' })
    .min(1),
  OMDB_BASE_URL: z.url().default('https://www.omdbapi.com'),
});

export type Env = z.infer<typeof envSchema>;

/** Fails fast at startup so a misconfigured build never ships silently. */
export const env: Env = envSchema.parse(Config);
