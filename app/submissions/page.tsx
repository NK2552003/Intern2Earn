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
  project_url?: string
  github_url?: string
  mentor_feedback?: string
  application_id: string
  application?: {
    internship: {
      title: string
      company_name: string
    }
  }
}

interface Review {
  id: string
  reviewer_id: string
  comment: string
  created_at: string
  reviewer: {
    full_name: string
    role: string
  }
}

export default function SubmissionsPage() {
  const [user, setUser] = useState<any>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [acceptedApps, setAcceptedApps] = useState<any[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
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
          project_url,
          github_url,
          mentor_feedback,
          application_id,
          application: applications(
            internship: internships(title, company_name)
          )
        `)
        .in(
          "application_id",
          (await supabase.from("applications").select("id").eq("student_id", clerkUser.id)).data?.map((a) => a.id) || [],
        )
        .order("submission_date", { ascending: false })

      setSubmissions(submissionsData as any || [])

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
      const { data: studentApps } = await supabase
        .from("applications")
        .select("id")
        .eq("student_id", clerkUser!.id)
      
      const appIds = studentApps?.map((a) => a.id) || []
      
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select(`
          id,
          title,
          description,
          status,
          submission_date,
          project_url,
          github_url,
          mentor_feedback,
          application_id,
          application: applications(
            internship: internships(title, company_name)
          )
        `)
        .in("application_id", appIds)
        .order("submission_date", { ascending: false })

      setSubmissions(submissionsData as any || [])
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

  const loadReviews = async (applicationId: string) => {
    try {
      const supabase = createClient()
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id,
          reviewer_id,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, role)
        `)
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true })

      setReviews(reviewsData as any || [])
    } catch (error) {
      console.error("Error loading reviews:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSubmission) return

    setIsSendingMessage(true)

    try {
      const supabase = createClient()
      await supabase
        .from("reviews")
        .insert({
          application_id: selectedSubmission.application_id,
          reviewer_id: clerkUser!.id,
          rating: 3, // Default rating for chat messages
          comment: newMessage,
        })

      setNewMessage("")
      await loadReviews(selectedSubmission.application_id)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSendingMessage(false)
    }
  }

  useEffect(() => {
    if (selectedSubmission) {
      loadReviews(selectedSubmission.application_id)
    }
  }, [selectedSubmission])

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
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      submission.status,
                    )}`}
                  >
                    {submission.status}
                  </span>
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90"
                  >
                    View Details
                  </button>
                </div>
              </div>
              <p className="text-foreground mb-4">{submission.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(submission.submission_date).toLocaleDateString()}
                </p>
                {submission.mentor_feedback && (
                  <span className="text-xs text-primary font-medium">Has Feedback</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submission Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedSubmission.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSubmission.application?.internship?.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedSubmission(null)
                    setReviews([])
                    setNewMessage("")
                  }}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Description</h3>
                  <p className="text-foreground whitespace-pre-wrap">{selectedSubmission.description}</p>
                </div>

                {selectedSubmission.project_url && (
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Project URL</h3>
                    <a
                      href={selectedSubmission.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {selectedSubmission.project_url}
                    </a>
                  </div>
                )}

                {selectedSubmission.github_url && (
                  <div>
                    <h3 className="font-medium text-foreground mb-2">GitHub URL</h3>
                    <a
                      href={selectedSubmission.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {selectedSubmission.github_url}
                    </a>
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-foreground mb-2">Status</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      selectedSubmission.status,
                    )}`}
                  >
                    {selectedSubmission.status}
                  </span>
                </div>

                {selectedSubmission.mentor_feedback && (
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Mentor Feedback</h3>
                    <div className="bg-secondary/30 border border-border rounded-lg p-4">
                      <p className="text-foreground whitespace-pre-wrap">{selectedSubmission.mentor_feedback}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat/Discussion Section */}
              <div className="border border-border rounded-lg bg-secondary/30">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-foreground">Discussion with Mentor</h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className={`p-3 rounded-lg ${
                          review.reviewer_id === clerkUser?.id
                            ? "bg-primary/10 ml-8"
                            : "bg-secondary mr-8"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">
                            {review.reviewer?.full_name} ({review.reviewer?.role})
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
                  )}
                </div>
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message to your mentor..."
                      className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || !newMessage.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
