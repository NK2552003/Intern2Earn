"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface Submission {
  id: string
  title: string
  description: string
  status: string
  submission_date: string
  application?: {
    internship: {
      title: string
      company_name: string
    }
  }
}

export default function SubmissionsPage() {
  const [user, setUser] = useState<any>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [acceptedApps, setAcceptedApps] = useState<any[]>([])
  const [formData, setFormData] = useState({
    application_id: "",
    title: "",
    description: "",
    project_url: "",
    github_url: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
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

      // Get student's submissions
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select(`
          id,
          title,
          description,
          status,
          submission_date,
          application: applications(
            internship: internships(title, company_name)
          )
        `)
        .in(
          "application_id",
          (await supabase.from("applications").select("id").eq("student_id", clerkUser.id)).data?.map((a) => a.id) || [],
        )
        .order("submission_date", { ascending: false })

      setSubmissions(submissionsData || [])

      // Get accepted applications for submission form
      const { data: apps } = await supabase
        .from("applications")
        .select("id, internship: internships(title)")
        .eq("student_id", clerkUser.id)
        .eq("status", "accepted")

      setAcceptedApps(apps || [])
      setIsLoading(false)
    }

    getData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("submissions")
        .insert({
          application_id: formData.application_id,
          title: formData.title,
          description: formData.description,
          project_url: formData.project_url,
          github_url: formData.github_url,
          status: "pending",
        })
        .select()

      if (error) throw error

      // Refresh submissions
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select(`
          id,
          title,
          description,
          status,
          submission_date,
          application: applications(
            internship: internships(title, company_name)
          )
        `)
        .order("submission_date", { ascending: false })

      setSubmissions(submissionsData || [])
      setShowForm(false)
      setFormData({
        application_id: "",
        title: "",
        description: "",
        project_url: "",
        github_url: "",
      })
    } catch (error: unknown) {
      console.error("Error creating submission:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "revision_needed":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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
            <h1 className="text-3xl font-bold text-foreground">My Submissions</h1>
            <p className="text-muted-foreground mt-2">Track your project submissions</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
          >
            {showForm ? "Cancel" : "New Submission"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Create New Submission</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="block text-sm font-medium text-foreground mb-2">Submission Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Q1 Project Deliverable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Describe your submission..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Project URL (optional)</label>
                  <input
                    type="url"
                    value={formData.project_url}
                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">GitHub URL (optional)</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        )}

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{submission.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {submission.application?.internship?.title} • {submission.application?.internship?.company_name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                    submission.status,
                  )}`}
                >
                  {submission.status}
                </span>
              </div>
              <p className="text-foreground mb-4">{submission.description}</p>
              <p className="text-sm text-muted-foreground">
                Submitted: {new Date(submission.submission_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {submissions.length === 0 && !showForm && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground mb-4">You haven't submitted any projects yet</p>
          </div>
        )}
      </div>
      </main>
    </div>
  )
}
