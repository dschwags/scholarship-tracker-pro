import { Suspense } from 'react';
import { EnhancedLogin } from '@/components/auth/enhanced-login';

export default function SignUpPage() {
  return (
    <Suspense>
      <EnhancedLogin mode="signup" />
    </Suspense>
  );
}
