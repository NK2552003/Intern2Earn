"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface ProgressEntry {
  id: string
  week_number: number
  description: string
  status: string
  mentor_comment?: string
  created_at: string
}

export default function ProgressPage() {
  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState<ProgressEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    week_number: "",
    description: "",
    application_id: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptedApps, setAcceptedApps] = useState<any[]>([])
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

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

      // Get applications
      const { data: apps } = await supabase
        .from("applications")
        .select("id, internship: internships(title)")
        .eq("student_id", clerkUser.id)
        .eq("status", "accepted")

      setAcceptedApps(apps || [])

      // Get progress entries
      const { data: progressData } = await supabase
        .from("progress")
        .select("*")
        .in("application_id", apps?.map((a) => a.id) || [])
        .order("week_number", { ascending: false })

      setProgress(progressData || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("progress").insert({
        application_id: formData.application_id,
        week_number: Number.parseInt(formData.week_number),
        description: formData.description,
        status: "ongoing",
      })

      if (error) throw error

      // Refresh progress
      const { data: apps } = await supabase
        .from("applications")
        .select("id")
        .eq("student_id", user.id)
        .eq("status", "accepted")

      const { data: progressData } = await supabase
        .from("progress")
        .select("*")
        .in("application_id", apps?.map((a) => a.id) || [])
        .order("week_number", { ascending: false })

      setProgress(progressData || [])
      setShowForm(false)
      setFormData({ week_number: "", description: "", application_id: "" })
    } catch (error: unknown) {
      console.error("Error creating progress entry:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar role="student" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="student" />
      <main className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Progress Tracking</h1>
            <p className="text-muted-foreground mt-2">Track your weekly progress and updates</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            {showForm ? "Cancel" : "Log Progress"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Log Weekly Progress</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Internship</label>
                  <select
                    required
                    value={formData.application_id}
                    onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select an internship</option>
                    {acceptedApps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.internship?.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Week Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.week_number}
                    onChange={(e) => setFormData({ ...formData, week_number: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Progress Description</label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="What did you accomplish this week?"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Logging..." : "Log Progress"}
              </button>
            </form>
          </div>
        )}

        {/* Progress Timeline */}
        <div className="space-y-6">
          {progress.map((entry, idx) => (
            <div key={entry.id} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  W{entry.week_number}
                </div>
                {idx < progress.length - 1 && <div className="w-1 h-16 bg-border mt-2"></div>}
              </div>
              <div className="flex-1 pb-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground">Week {entry.week_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${entry.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : entry.status === "pending_review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {entry.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-foreground mb-3">{entry.description}</p>
                  {entry.mentor_comment && (
                    <div className="bg-secondary p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Mentor Feedback</p>
                      <p className="text-foreground text-sm">{entry.mentor_comment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {progress.length === 0 && !showForm && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No progress entries yet. Start by logging your first week!</p>
          </div>
        )}
      </div>
      </main>
    </div>
  )
}
