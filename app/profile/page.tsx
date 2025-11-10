"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [userRole, setUserRole] = useState<"student" | "mentor" | "admin">("student")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    skills: [] as string[],
    phone_number: "",
  })
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return

      if (!clerkUser) {
        router.push("/auth/login")
        return
      }

      const supabase = createClient()

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clerkUser.id)
        .single()

      if (profileError) {
        if (profileError.code === "PGRST116") {
          // Profile doesn't exist
          setError("Profile not found. Please complete onboarding first.")
          setTimeout(() => router.push("/onboarding"), 2000)
        } else {
          setError(profileError.message)
        }
        return
      }

      setProfile(profileData)
      setUserRole(profileData.role || "student")
      setFormData({
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        location: profileData.location || "",
        skills: profileData.skills || [],
        phone_number: profileData.phone_number || "",
      })
      setIsLoading(false)
    }

    loadProfile()
  }, [clerkUser, isLoaded, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const skillsArray = value.split(",").map((s) => s.trim()).filter((s) => s)
    setFormData((prev) => ({
      ...prev,
      skills: skillsArray,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          skills: formData.skills,
          phone_number: formData.phone_number,
        })
        .eq("id", clerkUser!.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar role={userRole} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-screen">
        <Sidebar role={userRole} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <p className="text-muted-foreground">Redirecting to onboarding...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={userRole} />
      <main className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Your Profile</h1>
              <p className="text-muted-foreground">Update your information and settings</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
              {/* Role Display */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                <div className="px-4 py-2 bg-secondary text-foreground rounded-lg capitalize">
                  {profile.role}
                </div>
              </div>

              {/* Email Display */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <div className="px-4 py-2 bg-secondary text-foreground rounded-lg">
                  {profile.email}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Skills */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-foreground mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  id="skills"
                  type="text"
                  value={formData.skills.join(", ")}
                  onChange={handleSkillsChange}
                  placeholder="e.g., JavaScript, React, Node.js"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
      </main>
    </div>
  )
}
