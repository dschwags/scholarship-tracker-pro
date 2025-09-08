import { Suspense } from 'react';
import InvitePageContent from './invite-content';

export default function InvitePage() {
  return (
    <Suspense fallback={<div>Loading invitation...</div>}>
      <InvitePageContent />
    </Suspense>
  );
}