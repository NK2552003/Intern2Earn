"use client"

import { SignIn } from "@clerk/nextjs"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card rounded-lg shadow-lg border border-border p-8",
              headerTitle: "text-3xl font-bold text-foreground mb-2",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "bg-input border border-border text-foreground hover:bg-accent",
              formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90",
              formFieldInput: "bg-input border border-border text-foreground",
              footerActionLink: "text-primary hover:underline",
            },
          }}
          redirectUrl="/onboarding"
        />
      </div>
    </div>
  )
}
