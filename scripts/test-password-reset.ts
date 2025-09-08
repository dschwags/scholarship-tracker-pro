import { requestPasswordReset } from '../lib/actions/password-reset';

async function testPasswordReset() {
  console.log('🧪 Testing password reset functionality...');
  
  // Create form data
  const formData = new FormData();
  formData.append('email', 'jennifer.grad@stp.com');
  
  try {
    const result = await requestPasswordReset(formData);
    console.log('✅ Password reset result:', result);
    
    if (result.success) {
      console.log('🎉 Password reset request successful!');
      console.log('Check the console output above for the reset link.');
    } else if (result.error) {
      console.log('❌ Password reset failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing password reset:', error);
  }
}

testPasswordReset();