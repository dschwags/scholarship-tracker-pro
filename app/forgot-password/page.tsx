import { Suspense } from 'react'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l6.586-6.586A6 6 0 0121 9z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No worries! Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        
        <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
          <ForgotPasswordForm />
        </Suspense>

        <div className="text-center">
          <Link
            href="/sign-in"
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}