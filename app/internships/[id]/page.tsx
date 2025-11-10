"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface Internship {
  id: string
  title: string
  company_name: string
  description: string
  location: string
  salary_min?: number
  salary_max?: number
  duration_weeks: number
  required_skills: string[]
  status: string
  mentor?: {
    full_name: string
    bio: string
    location: string
  }
}

export default function InternshipDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [internship, setInternship] = useState<Internship | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [hasApplied, setHasApplied] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { user: clerkUser, isLoaded } = useUser()
  const id = params?.id as string

  useEffect(() => {
    const getData = async () => {
      if (!isLoaded) return

      if (!clerkUser) {
        router.push("/auth/login")
        return
      }

      const supabase = createClient()

      // Validate profile is complete
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      if (profileError || !profile?.role) {
        router.replace("/onboarding")
        return
      }

      setUser(clerkUser)

      // Get internship details
      const { data: internshipData } = await supabase
        .from("internships")
        .select(`
          *,
          mentor: profiles!mentor_id(full_name, bio, location)
        `)
        .eq("id", id)
        .single()

      setInternship(internshipData)

      // Check if user has already applied
      const { data: existingApp } = await supabase
        .from("applications")
        .select("id")
        .eq("internship_id", id)
        .eq("student_id", clerkUser.id)
        .single()

      setHasApplied(!!existingApp)
      setIsLoading(false)
    }

    getData()
  }, [id, router, isLoaded, clerkUser])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsApplying(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("applications").insert({
        internship_id: id,
        student_id: user.id,
        cover_letter: coverLetter,
        status: "pending",
      })

      if (error) throw error

      setHasApplied(true)
      setCoverLetter("")
      alert("Application submitted successfully!")
    } catch (error: unknown) {
      console.error("Error applying:", error)
      alert("Error submitting application")
    } finally {
      setIsApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!internship) {
    return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Internship not found</div>
        </div>
    )
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <button onClick={() => router.back()} className="text-primary hover:underline mb-4 font-medium">
                ← Back
              </button>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{internship.title}</h1>
                <p className="text-lg text-muted-foreground">{internship.company_name}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-8">
                {/* Details */}
                <div className="bg-card border border-border rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">About this Internship</h2>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-muted-foreground text-sm">Location</p>
                      <p className="text-foreground font-medium">{internship.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Duration</p>
                      <p className="text-foreground font-medium">{internship.duration_weeks} weeks</p>
                    </div>
                    {internship.salary_min && (
                      <div>
                        <p className="text-muted-foreground text-sm">Salary</p>
                        <p className="text-foreground font-medium text-accent">
                          ${internship.salary_min.toLocaleString()} - ${internship.salary_max?.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-sm">Status</p>
                      <p className="text-foreground font-medium capitalize">{internship.status}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground mb-3">Description</h3>
                    <p className="text-foreground whitespace-pre-wrap">{internship.description}</p>
                  </div>
                </div>

                {/* Required Skills */}
                {internship.required_skills.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Required Skills</h2>
                    <div className="flex flex-wrap gap-3">
                      {internship.required_skills.map((skill, idx) => (
                        <span key={idx} className="px-4 py-2 bg-accent/10 text-accent rounded-lg font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mentor Info */}
                {internship.mentor && (
                  <div className="bg-card border border-border rounded-lg p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">About Your Mentor</h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Name</p>
                        <p className="text-foreground font-medium">{internship.mentor.full_name}</p>
                      </div>
                      {internship.mentor.location && (
                        <div>
                          <p className="text-muted-foreground text-sm">Location</p>
                          <p className="text-foreground">{internship.mentor.location}</p>
                        </div>
                      )}
                      {internship.mentor.bio && (
                        <div>
                          <p className="text-muted-foreground text-sm">Bio</p>
                          <p className="text-foreground">{internship.mentor.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div>
                {/* Apply Card */}
                {!hasApplied ? (
                  <div className="bg-card border border-border rounded-lg p-8 sticky top-6">
                    <h3 className="font-bold text-lg text-foreground mb-6">Apply Now</h3>
                    <form onSubmit={handleApply} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Cover Letter</label>
                        <textarea
                          required
                          rows={6}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Tell us why you're interested..."
                          className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplying}
                        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                      >
                        {isApplying ? "Applying..." : "Apply"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-green-100 text-green-800 rounded-lg p-8">
                    <p className="font-bold text-lg mb-2">✓ Application Submitted</p>
                    <p className="text-sm">
                      You have already applied for this internship. Check your applications page for updates.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
    )
  }
