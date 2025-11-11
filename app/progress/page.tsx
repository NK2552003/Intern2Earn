"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react"

interface ProgressEntry {
  id: string
  week_number: number
  description: string
  status: string
  mentor_comment?: string
  created_at: string
  application_id: string
  student_name?: string
  internship_title?: string
}

export default function ProgressPage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<"student" | "mentor" | "admin">("student")
  const [progress, setProgress] = useState<ProgressEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    week_number: "",
    description: "",
    application_id: "",
  })
  const [studentComment, setStudentComment] = useState<{ [key: string]: string }>({})
  const [mentorFeedback, setMentorFeedback] = useState<{ [key: string]: string }>({})
  const [isAddingComment, setIsAddingComment] = useState<{ [key: string]: boolean }>({})
  const [isAddingFeedback, setIsAddingFeedback] = useState<{ [key: string]: boolean }>({})
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
      setUserRole(profile.role)

      if (profile.role === "student") {
        // Get student's applications
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
      } else if (profile.role === "mentor") {
        // Get mentor's internships
        const { data: internships } = await supabase
          .from("internships")
          .select("id, title")
          .eq("mentor_id", clerkUser.id)

        const internshipIds = internships?.map((i) => i.id) || []

        // Get accepted applications for mentor's internships
        const { data: apps } = await supabase
          .from("applications")
          .select(`
            id, 
            student_id,
            internship_id,
            internship: internships(title),
            student: profiles!applications_student_id_fkey(full_name, email)
          `)
          .in("internship_id", internshipIds)
          .eq("status", "accepted")

        setAcceptedApps(apps || [])

        // Get all progress entries for these applications
        const { data: progressData } = await supabase
          .from("progress")
          .select("*")
          .in("application_id", apps?.map((a) => a.id) || [])
          .order("created_at", { ascending: false })

        // Enrich progress data with student and internship info
        const enrichedProgress = progressData?.map((progress) => {
          const app = apps?.find((a: any) => a.id === progress.application_id)
          return {
            ...progress,
            student_name: (app?.student as any)?.full_name || "Unknown Student",
            internship_title: (app?.internship as any)?.title || "Unknown Internship"
          }
        }) || []

        setProgress(enrichedProgress as any)
      }

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

  const handleAddComment = async (progressId: string) => {
    const comment = studentComment[progressId]
    if (!comment || !comment.trim()) return

    setIsAddingComment((prev) => ({ ...prev, [progressId]: true }))

    try {
      const supabase = createClient()
      
      // Update the progress entry with the student's additional comment
      // For now, we'll append it to the description
      const currentProgress = progress.find(p => p.id === progressId)
      if (!currentProgress) return

      const updatedDescription = `${currentProgress.description}\n\n[Additional Comment]: ${comment}`
      
      const { error } = await supabase
        .from("progress")
        .update({ description: updatedDescription })
        .eq("id", progressId)

      if (error) throw error

      // Refresh progress
      await refreshProgress()
      setStudentComment((prev) => ({ ...prev, [progressId]: "" }))
    } catch (error: unknown) {
      console.error("Error adding comment:", error)
    } finally {
      setIsAddingComment((prev) => ({ ...prev, [progressId]: false }))
    }
  }

  const handleAddMentorFeedback = async (progressId: string) => {
    const feedback = mentorFeedback[progressId]
    if (!feedback || !feedback.trim()) return

    setIsAddingFeedback((prev) => ({ ...prev, [progressId]: true }))

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from("progress")
        .update({ 
          mentor_comment: feedback,
          status: "pending_review"
        })
        .eq("id", progressId)

      if (error) throw error

      // Refresh progress
      await refreshProgress()
      setMentorFeedback((prev) => ({ ...prev, [progressId]: "" }))
    } catch (error: unknown) {
      console.error("Error adding feedback:", error)
    } finally {
      setIsAddingFeedback((prev) => ({ ...prev, [progressId]: false }))
    }
  }

  const refreshProgress = async () => {
    const supabase = createClient()
    
    if (userRole === "student") {
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
    } else if (userRole === "mentor") {
      const { data: internships } = await supabase
        .from("internships")
        .select("id")
        .eq("mentor_id", user.id)

      const internshipIds = internships?.map((i) => i.id) || []

      const { data: apps } = await supabase
        .from("applications")
        .select(`
          id, 
          student_id,
          internship_id,
          internship: internships(title),
          student: profiles!applications_student_id_fkey(full_name, email)
        `)
        .in("internship_id", internshipIds)
        .eq("status", "accepted")

      const { data: progressData } = await supabase
        .from("progress")
        .select("*")
        .in("application_id", apps?.map((a: any) => a.id) || [])
        .order("created_at", { ascending: false })

      // Enrich progress data with student and internship info
      const enrichedProgress = progressData?.map((progress) => {
        const app = apps?.find((a: any) => a.id === progress.application_id)
        return {
          ...progress,
          student_name: (app?.student as any)?.full_name || "Unknown Student",
          internship_title: (app?.internship as any)?.title || "Unknown Internship"
        }
      }) || []

      setProgress(enrichedProgress as any)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "pending_review":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "ongoing":
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar role={userRole} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading progress...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={userRole} />
      <main className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Progress Tracking</h1>
            <p className="text-muted-foreground mt-2">
              {userRole === "student" 
                ? "Track your weekly progress and updates" 
                : "Review and provide feedback on student progress"}
            </p>
          </div>
          {userRole === "student" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
            >
              {showForm ? "Cancel" : "Log Progress"}
            </button>
          )}
        </div>

        {/* Form - Student Only */}
        {showForm && userRole === "student" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Log Weekly Progress</CardTitle>
              <CardDescription>Record your accomplishments and updates for the week</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Internship</label>
                    <select
                      required
                      value={formData.application_id}
                      onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select an internship</option>
                      {acceptedApps.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.internship?.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Week Number</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.week_number}
                      onChange={(e) => setFormData({ ...formData, week_number: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Progress Description</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="What did you accomplish this week? Include key milestones, challenges faced, and learnings..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about your achievements and progress
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Logging...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Log Progress
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setFormData({ week_number: "", description: "", application_id: "" })
                    }}
                    className="px-6 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Progress Timeline */}
        <div className="space-y-6">
          {progress.map((entry, idx) => (
            <div key={entry.id} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg border-4 border-primary/20">
                  W{entry.week_number}
                </div>
                {idx < progress.length - 1 && <div className="w-1 flex-1 bg-border mt-2"></div>}
              </div>
              <div className="flex-1 pb-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          Week {entry.week_number}
                          {getStatusIcon(entry.status)}
                        </CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {new Date(entry.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          {userRole === "mentor" && entry.student_name && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Student:</span> {entry.student_name}
                              <span className="text-muted-foreground">•</span>
                              <span className="font-medium">Internship:</span> {entry.internship_title}
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Description */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Progress Details</h4>
                      <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                        {entry.description}
                      </p>
                    </div>

                    <Separator />

                    {/* Mentor Comment Section */}
                    {entry.mentor_comment ? (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                            Mentor Feedback
                          </h4>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                          {entry.mentor_comment}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Waiting for mentor feedback
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Student Comment Section - Only for Students */}
                    {userRole === "student" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-sm font-semibold text-foreground">Add a Comment</h4>
                        </div>
                        <div className="flex gap-2">
                          <textarea
                            value={studentComment[entry.id] || ""}
                            onChange={(e) => 
                              setStudentComment((prev) => ({ 
                                ...prev, 
                                [entry.id]: e.target.value 
                              }))
                            }
                            placeholder="Add additional notes or updates about this week's progress..."
                            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={3}
                          />
                        </div>
                        <button
                          onClick={() => handleAddComment(entry.id)}
                          disabled={
                            isAddingComment[entry.id] || 
                            !studentComment[entry.id] || 
                            !studentComment[entry.id].trim()
                          }
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingComment[entry.id] ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Add Comment
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Mentor Feedback Section - Only for Mentors */}
                    {userRole === "mentor" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <h4 className="text-sm font-semibold text-foreground">
                            {entry.mentor_comment ? "Update Feedback" : "Provide Feedback"}
                          </h4>
                        </div>
                        <div className="flex gap-2">
                          <textarea
                            value={mentorFeedback[entry.id] || ""}
                            onChange={(e) => 
                              setMentorFeedback((prev) => ({ 
                                ...prev, 
                                [entry.id]: e.target.value 
                              }))
                            }
                            placeholder="Provide constructive feedback on the student's progress..."
                            className="flex-1 px-3 py-2 text-sm border border-blue-200 dark:border-blue-800 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                          />
                        </div>
                        <button
                          onClick={() => handleAddMentorFeedback(entry.id)}
                          disabled={
                            isAddingFeedback[entry.id] || 
                            !mentorFeedback[entry.id] || 
                            !mentorFeedback[entry.id].trim()
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAddingFeedback[entry.id] ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              {entry.mentor_comment ? "Update Feedback" : "Send Feedback"}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {progress.length === 0 && !showForm && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              {userRole === "student" ? (
                <>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Progress Entries Yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your internship journey by logging your first week!</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
                  >
                    Log Your First Week
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Progress Entries to Review</h3>
                  <p className="text-muted-foreground">
                    Students haven't logged any progress yet. Progress entries will appear here once students start tracking their work.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      </main>
    </div>
  )
}
