"use client"

import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border border-border p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a confirmation link to your email address. Please verify your account to get started.
            </p>
          </div>

          <div className="space-y-3 mt-8">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button className="text-primary hover:underline font-medium">try again</button>
            </p>
            <Link
              href="/auth/login"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
