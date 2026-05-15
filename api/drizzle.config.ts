import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite', // <--- Isso é o que estava faltando!
  dbCredentials: {
    url: 'file:sqlite.db',
  },
} satisfies Config;