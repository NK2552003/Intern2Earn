"use client"

import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-[#05040f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 rounded-lg shadow-lg border border-white/8 p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-violet-500/15/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-white/60">
              We've sent a confirmation link to your email address. Please verify your account to get started.
            </p>
          </div>

          <div className="space-y-3 mt-8">
            <p className="text-sm text-white/60">
              Didn't receive the email? Check your spam folder or{" "}
              <button className="text-violet-400 hover:underline font-medium">try again</button>
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-4 py-2 bg-linear-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
