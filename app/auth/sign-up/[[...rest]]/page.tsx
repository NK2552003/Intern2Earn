"use client"

import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#05040f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white/5 rounded-2xl shadow-2xl border border-white/8 p-8",
              headerTitle: "text-3xl font-bold text-white mb-2",
              headerSubtitle: "text-white/60",
              socialButtonsBlockButton: "bg-white/6 border border-white/8 text-white hover:bg-white/10",
              formButtonPrimary: "bg-violet-500 text-white hover:bg-violet-600",
              formFieldInput: "bg-white/6 border border-white/8 text-white",
              footerActionLink: "text-violet-400 hover:underline",
            },
          }}
          redirectUrl="/onboarding"
        />
      </div>
    </div>
  )
}
