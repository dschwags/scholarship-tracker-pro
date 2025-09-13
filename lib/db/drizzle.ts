import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// BugX: Conditional database connection to prevent import-time errors
if (!process.env.POSTGRES_URL) {
  console.warn('⚠️ POSTGRES_URL not set - database operations will fail');
}

// BugX: Only create connection if environment variable exists
const connectionString = process.env.POSTGRES_URL;
let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

if (connectionString) {
  client = postgres(connectionString);
  db = drizzle(client, { schema });
} else {
  // BugX: Create dummy exports that will throw descriptive errors when used
  client = new Proxy({} as postgres.Sql, {
    get() {
      throw new Error('Database client not available - POSTGRES_URL environment variable is not set');
    }
  });
  
  db = new Proxy({} as ReturnType<typeof drizzle>, {
    get() {
      throw new Error('Database not available - POSTGRES_URL environment variable is not set');
    }
  });
}

export { client, db };
