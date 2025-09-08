import { resetPassword } from '../lib/actions/password-reset';

async function testCompleteReset() {
  console.log('🧪 Testing complete password reset...');
  
  // Use the token from the previous test
  const token = '25015de48e20c2f0765087ff5d671e33a86604dc3755f19cc465871cdebc3eb2';
  const newPassword = 'NewSecure123!';
  
  // Create form data
  const formData = new FormData();
  formData.append('token', token);
  formData.append('password', newPassword);
  formData.append('confirmPassword', newPassword);
  
  try {
    const result = await resetPassword(formData);
    console.log('✅ Password reset completion result:', result);
    
    if (result.success) {
      console.log('🎉 Password reset completed successfully!');
      console.log('Jennifer can now sign in with the new password:', newPassword);
    } else if (result.error) {
      console.log('❌ Password reset completion failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error completing password reset:', error);
  }
}

testCompleteReset();