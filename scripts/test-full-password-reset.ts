import { resetPassword } from '../lib/actions/password-reset';

async function testFullPasswordReset() {
  console.log('🧪 Testing complete password reset functionality...');
  
  // Use the token we generated: 25015de48e20c2f0765087ff5d671e33a86604dc3755f19cc465871cdebc3eb2
  const resetToken = '25015de48e20c2f0765087ff5d671e33a86604dc3755f19cc465871cdebc3eb2';
  const newPassword = 'NewSecure123!@#';
  
  // Create form data
  const formData = new FormData();
  formData.append('token', resetToken);
  formData.append('password', newPassword);
  formData.append('confirmPassword', newPassword);
  
  try {
    const result = await resetPassword(formData);
    console.log('✅ Password reset result:', result);
    
    if (result.success) {
      console.log('🎉 Password reset successful!');
      console.log('Jennifer can now sign in with the new password:', newPassword);
    } else if (result.error) {
      console.log('❌ Password reset failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing password reset:', error);
  }
}

testFullPasswordReset();