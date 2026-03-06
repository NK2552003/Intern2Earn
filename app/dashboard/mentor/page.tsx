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
      <div className="flex h-screen bg-[#05040f]">
        <Sidebar role="mentor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#05040f]">
      <Sidebar role="mentor" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">

          {/* Welcome Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Mentor
            </div>
            <h1 className="text-3xl font-black text-white">
              Welcome, <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{profile?.full_name?.split(" ")[0] || user?.email}</span>
            </h1>
            <p className="text-white/40 mt-1">Manage your internships and guide your students to success</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { title: "Active Internships", value: stats.internships, Icon: Briefcase, color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
              { title: "Total Applications", value: stats.applications, Icon: Clipboard, color: "from-violet-500/20 to-violet-600/5", border: "border-violet-500/20", iconColor: "text-violet-400" },
              { title: "Accepted Students", value: stats.accepted, Icon: CheckCircle, color: "from-fuchsia-500/20 to-fuchsia-600/5", border: "border-fuchsia-500/20", iconColor: "text-fuchsia-400" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`relative bg-linear-to-br ${stat.color} border ${stat.border} rounded-2xl p-6 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[#05040f]/70 rounded-2xl" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-black text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-white/5 ${stat.iconColor}`}>
                    <stat.Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/internships/manage"
                className="group relative overflow-hidden bg-linear-to-r from-emerald-500 to-teal-500 p-6 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white mb-1">Create Internship</h3>
                    <p className="text-sm text-white/70">Post a new opportunity</p>
                  </div>
                  <Briefcase className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </div>
              </Link>
              <Link
                href="/applicants"
                className="group bg-white/4 border border-white/8 p-6 rounded-2xl hover:bg-white/6 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white mb-1">Review Applicants</h3>
                    <p className="text-sm text-white/40">Check pending applications</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-white/40 group-hover:text-emerald-400 transition-colors" />
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Applications */}
          <div>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Recent Applications</h2>
            <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
              {recentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/6">
                      <tr>
                        {["Internship", "Status", "Applied On", "Action"].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr key={app.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                          <td className="px-6 py-4 text-sm text-white">{app.internship?.title}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              app.status === "accepted" ? "bg-emerald-500/15 text-emerald-300"
                              : app.status === "rejected" ? "bg-red-500/15 text-red-300"
                              : "bg-amber-500/15 text-amber-300"
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/40">
                            {new Date(app.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <Link href={`/applicants/${app.id}`} className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
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
                  <div className="w-14 h-14 rounded-2xl bg-white/4 flex items-center justify-center mx-auto mb-4">
                    <Clipboard className="w-7 h-7 text-white/20" />
                  </div>
                  <p className="text-white/30">No applications yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}