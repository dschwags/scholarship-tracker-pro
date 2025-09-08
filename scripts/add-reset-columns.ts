import { client, db } from '../lib/db/drizzle';

async function addResetColumns() {
  try {
    console.log('🔧 Adding reset token columns to users table...');
    
    await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token text;`;
    console.log('✅ Added reset_token column');
    
    await client`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry timestamp;`;
    console.log('✅ Added reset_token_expiry column');
    
    console.log('🎉 Reset token columns added successfully!');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
  } finally {
    await client.end();
  }
}

addResetColumns();