import { Suspense } from 'react';
import { EnhancedLogin } from '@/components/auth/enhanced-login';

export default function SignInPage() {
  return (
    <Suspense>
      <EnhancedLogin mode="signin" />
    </Suspense>
  );
}
