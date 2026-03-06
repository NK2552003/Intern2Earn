"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"

export default function OnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<"student" | "mentor" | "admin" | null>(null)
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [skills, setSkills] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const router = useRouter()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (!isLoaded) return

      if (!user) {
        router.push("/auth/sign-up")
        return
      }

      // Check if user already has a profile with a role
      const supabase = createClient()
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (existingProfile?.role) {
        // User is already onboarded, redirect to their dashboard
        router.push(`/dashboard/${existingProfile.role}`)
        return
      }

      // No profile yet, allow onboarding
      setIsCheckingProfile(false)
    }

    checkProfileAndRedirect()
  }, [user, isLoaded, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!selectedRole) {
      setError("Please select a role")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)

      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: user!.id,
          email: user!.emailAddresses[0]?.emailAddress || "",
          full_name: fullName,
          bio,
          location,
          skills: skillsArray,
          phone_number: phone,
          role: selectedRole,
        },
        { onConflict: "id" },
      )

      if (upsertError) throw upsertError

      // Wait a brief moment for the data to be synced before redirecting
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Use replace to avoid back button issues
      router.replace(`/dashboard/${selectedRole}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  if (!isLoaded || !user || isCheckingProfile) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#05040f] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/5 rounded-lg shadow-lg border border-white/8 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
            <p className="text-white/60">
              Let's get to know you better to match you with the best opportunities
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">What is your role?</label>
              <div className="space-y-2">
                {(["student", "mentor", "admin"] as const).map((role) => (
                  <label
                    key={role}
                    className="flex items-center p-3 border border-white/8 rounded-lg cursor-pointer hover:bg-violet-500/15 transition-colors"
                    onClick={() => setSelectedRole(role)}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value as "student" | "mentor" | "admin")}
                      className="w-4 h-4 text-violet-400"
                    />
                    <span className="ml-3 text-white capitalize font-medium">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/6 border border-white/8 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-white/6 border border-white/8 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-white mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 bg-white/6 border border-white/8 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              />
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-white mb-2">
                Skills
              </label>
              <input
                id="skills"
                type="text"
                placeholder="Enter skills separated by commas (e.g., React, TypeScript, Python)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-2 bg-white/6 border border-white/8 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                placeholder="Tell us about yourself..."
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 bg-white/6 border border-white/8 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !fullName || !selectedRole}
              className="w-full py-2 px-4 bg-linear-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Completing Profile..." : "Complete Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
