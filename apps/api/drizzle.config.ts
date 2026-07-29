import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: 'src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // @ts-ignore
    url: "postgres://postgres:postgres@localhost:5432/triage_db",
  },
});
// "postgres://postgres:postgres@localhost:5432/triage_db"
// process.env.DATABASE_URL as string


// "postgres://postgres:postgres@localhost:5432/triage_db"