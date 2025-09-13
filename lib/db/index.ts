// Re-export the database instance and client for easier imports
export { db, client } from './drizzle';

// Re-export all schema exports for convenience
export * from './schema';
export * from './schema-financial-goals';

// Re-export queries
export * from './queries';