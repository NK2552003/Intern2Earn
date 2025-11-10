"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Briefcase, Clipboard, CheckCircle } from "lucide-react"

export default function MentorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    internships: 0,
    applications: 0,
    accepted: 0,
  })
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  useEffect(() => {
    const getData = async () => {
      // Check if user is authenticated
      if (!isLoaded) {
        return
      }

      if (!clerkUser) {
        router.push("/auth/login")
        return
      }

      const supabase = createClient()

      setUser(clerkUser)

      // Get mentor profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clerkUser.id)
        .single()

      // If profile doesn't exist or doesn't have a role, redirect to onboarding
      if (profileError || !profileData || !profileData.role) {
        console.log("Profile incomplete, redirecting to onboarding", profileError)
        router.replace("/onboarding")
        return
      }

      setProfile(profileData)

      // Get internship stats
      const { data: internships } = await supabase.from("internships").select("id").eq("mentor_id", clerkUser.id)

      // Get all applications for this mentor's internships
      const internshipIds = internships?.map((i) => i.id) || []

      let applications: any[] = []
      if (internshipIds.length > 0) {
        const { data: applicationsData } = await supabase
          .from("applications")
          .select("*")
          .in("internship_id", internshipIds)

        applications = applicationsData || []
      }

      const accepted = applications.filter((a) => a.status === "accepted").length

      setStats({
        internships: internships?.length || 0,
        applications: applications.length,
        accepted: accepted,
      })

      // Get recent applications
      const { data: recentApps } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          submitted_at,
          student_id,
          internship: internships(title, company_name)
        `)
        .in("internship_id", internshipIds)
        .order("submitted_at", { ascending: false })
        .limit(5)

      setRecentApplications(recentApps || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

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
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Welcome, {profile?.full_name || user?.email}</h1>
              <p className="text-muted-foreground mt-2">Manage your internships and guide your students to success</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  title: "Active Internships",
                  value: stats.internships,
                  Icon: Briefcase,
                },
                {
                  title: "Total Applications",
                  value: stats.applications,
                  Icon: Clipboard,
                },
                {
                  title: "Accepted Students",
                  value: stats.accepted,
                  Icon: CheckCircle,
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                    </div>
                    <stat.Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/internships/manage"
                  className="bg-primary text-primary-foreground p-6 rounded-lg hover:opacity-90 transition-colors"
                >
                  <h3 className="font-bold mb-1">Create Internship</h3>
                  <p className="text-sm opacity-90">Post a new opportunity</p>
                </Link>
                <Link
                  href="/applicants"
                  className="bg-card border border-border p-6 rounded-lg hover:bg-secondary transition-colors"
                >
                  <h3 className="font-bold text-foreground mb-1">Review Applicants</h3>
                  <p className="text-sm text-muted-foreground">Check pending applications</p>
                </Link>
              </div>
            </div>

            {/* Recent Applications */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Recent Applications</h2>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {recentApplications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border bg-secondary">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Internship</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Applied On</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentApplications.map((app) => (
                          <tr key={app.id} className="border-b border-border hover:bg-secondary transition-colors">
                            <td className="px-6 py-4 text-sm text-foreground">{app.internship?.title}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                                  app.status === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : app.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(app.submitted_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <Link href={`/applicants/${app.id}`} className="text-primary hover:underline">
                                Review
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground">No applications yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }