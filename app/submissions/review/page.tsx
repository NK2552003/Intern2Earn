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
  application_id: string
  application?: {
    student_id: string
    student: {
      full_name: string
      email: string
    }
    internship: {
      title: string
      company_name: string
    }
  }
}

export default function ReviewSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [reviewNote, setReviewNote] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)
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

      // Validate profile is complete and is a mentor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      if (profileError || !profile?.role || profile.role !== "mentor") {
        router.replace("/dashboard/student")
        return
      }

      // Get all internships created by this mentor
      const { data: mentorInternships } = await supabase
        .from("internships")
        .select("id")
        .eq("mentor_id", clerkUser.id)

      const internshipIds = mentorInternships?.map((i) => i.id) || []

      // Get all submissions for these internships
      if (internshipIds.length > 0) {
        // First get all application IDs for these internships
        const { data: applications } = await supabase
          .from("applications")
          .select("id")
          .in("internship_id", internshipIds)

        const applicationIds = applications?.map((a) => a.id) || []

        if (applicationIds.length > 0) {
          // Now get submissions for these applications with proper joins
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
              application_id,
              application:applications(
                student_id,
                student:profiles!applications_student_id_fkey(full_name, email),
                internship:internships(title, company_name)
              )
            `)
            .in("application_id", applicationIds)
            .order("submission_date", { ascending: false })

          setSubmissions(submissionsData || [])
        }
      }

      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  const handleReviewSubmit = async (e: React.FormEvent, newStatus: string) => {
    e.preventDefault()
    if (!selectedSubmission) return

    setIsReviewing(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("submissions")
        .update({
          status: newStatus,
        })
        .eq("id", selectedSubmission.id)

      if (error) throw error

      // Refresh submissions
      const { data: mentorInternships } = await supabase
        .from("internships")
        .select("id")
        .eq("mentor_id", clerkUser!.id)

      const internshipIds = mentorInternships?.map((i) => i.id) || []

      if (internshipIds.length > 0) {
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
            student_id,
            application: applications(
              student: profiles(full_name, email),
              internship: internships(title, company_name)
            )
          `)
          .in("application_id", (await supabase.from("applications").select("id").in("internship_id", internshipIds)).data?.map((a) => a.id) || [])
          .order("submission_date", { ascending: false })

        setSubmissions(submissionsData || [])
      }

      setSelectedSubmission(null)
      setReviewNote("")
    } catch (error: unknown) {
      console.error("Error reviewing submission:", error)
    } finally {
      setIsReviewing(false)
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
        <Sidebar role="mentor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="mentor" />
      <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Review Submissions</h1>
              <p className="text-muted-foreground mt-2">Review and evaluate student project submissions</p>
            </div>

            {/* Submissions List */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {submissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-secondary">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Student</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Submission</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Internship</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="border-b border-border hover:bg-secondary transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground">
                            {submission.application?.student?.full_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{submission.title}</td>
                          <td className="px-6 py-4 text-sm text-foreground">
                            {submission.application?.internship?.title}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                                submission.status,
                              )}`}
                            >
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(submission.submission_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => setSelectedSubmission(submission)}
                              className="text-primary hover:underline"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">No submissions to review yet</p>
                </div>
              )}
            </div>

            {/* Review Modal */}
            {selectedSubmission && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-card border border-border rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedSubmission.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        By {selectedSubmission.application?.student?.full_name}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(null)}
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
                      <h3 className="font-medium text-foreground mb-2">Current Status</h3>
                      <p className="text-foreground capitalize">{selectedSubmission.status}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Review Notes (optional)</label>
                      <textarea
                        rows={4}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Add feedback for the student..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={(e) => handleReviewSubmit(e, "approved")}
                        disabled={isReviewing}
                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                      >
                        {isReviewing ? "Updating..." : "Approve"}
                      </button>
                      <button
                        onClick={(e) => handleReviewSubmit(e, "revision_needed")}
                        disabled={isReviewing}
                        className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                      >
                        {isReviewing ? "Updating..." : "Request Revision"}
                      </button>
                      <button
                        onClick={(e) => handleReviewSubmit(e, "rejected")}
                        disabled={isReviewing}
                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                      >
                        {isReviewing ? "Updating..." : "Reject"}
                      </button>
                      <button
                        onClick={() => setSelectedSubmission(null)}
                        disabled={isReviewing}
                        className="flex-1 py-2 px-4 bg-secondary text-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  )
}
