"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface Applicant {
  id: string
  status: string
  cover_letter: string
  student_id: string
  internship_id: string
  submitted_at: string
  internship?: {
    title: string
    company_name: string
  }
  profile?: {
    full_name: string
    email: string
    skills: string[]
  }
}

export default function ApplicantsPage() {
  const [user, setUser] = useState<any>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState("pending")
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

      // Validate profile is complete and user is mentor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      if (profileError || !profile?.role || profile.role !== "mentor") {
        router.replace("/onboarding")
        return
      }

      setUser(clerkUser)

      // Get mentor's internships
      const { data: internships } = await supabase.from("internships").select("id").eq("mentor_id", clerkUser.id)

      const internshipIds = internships?.map((i) => i.id) || []

      if (internshipIds.length === 0) {
        setIsLoading(false)
        return
      }

      // Get applicants
      const { data: applicantsData } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          cover_letter,
          student_id,
          internship_id,
          submitted_at,
          internship: internships(title, company_name),
          profile: profiles!student_id(full_name, email, skills)
        `)
        .in("internship_id", internshipIds)
        .eq("status", selectedStatus)
        .order("submitted_at", { ascending: false })

      setApplicants(applicantsData || [])
      setIsLoading(false)
    }

    getData()
  }, [router, selectedStatus, isLoaded, clerkUser])

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      await supabase
        .from("applications")
        .update({ status: newStatus, reviewed_at: new Date().toISOString() })
        .eq("id", applicantId)

      setApplicants(applicants.filter((a) => a.id !== applicantId))
    } catch (error) {
      console.error("Error updating status:", error)
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
              <h1 className="text-3xl font-bold text-foreground">Review Applicants</h1>
              <p className="text-muted-foreground mt-2">Manage applications to your internships</p>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 mb-8">
              {["pending", "accepted", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    selectedStatus === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Applicants */}
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Student</p>
                      <p className="font-bold text-foreground">{applicant.profile?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{applicant.profile?.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Internship</p>
                      <p className="font-bold text-foreground">{applicant.internship?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {applicant.profile?.skills?.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Applied</p>
                      <p className="font-bold text-foreground">
                        {new Date(applicant.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {applicant.cover_letter && (
                    <div className="mb-4 p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Cover Letter</p>
                      <p className="text-foreground text-sm">{applicant.cover_letter}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(applicant.id, "accepted")}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(applicant.id, "rejected")}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:opacity-90 transition-colors font-medium text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {applicants.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground">No {selectedStatus} applications</p>
              </div>
            )}
          </div>
      </main>
    </div>
  )
}
