"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import {
  BarChart3,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    students: 0,
    mentors: 0,
    internships: 0,
    applications: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [applicationStats, setApplicationStats] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  useEffect(() => {
    const getData = async () => {
      if (!isLoaded) {
        return
      }

      if (!clerkUser) {
        router.push("/auth/login")
        return
      }

      const supabase = createClient()

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      if (profileError || !profile || !profile.role) {
        console.log("Profile incomplete, redirecting to onboarding", profileError)
        router.replace("/onboarding")
        return
      }

      if (profile.role !== "admin") {
        console.log("User is not admin, redirecting to student dashboard")
        router.replace("/dashboard/student")
        return
      }

      setUser(clerkUser)

      // Get platform stats
      const { data: students } = await supabase.from("profiles").select("id").eq("role", "student")

      const { data: mentors } = await supabase.from("profiles").select("id").eq("role", "mentor")

      const { data: internships } = await supabase.from("internships").select("id")

      const { data: applications } = await supabase.from("applications").select("id")

      setStats({
        students: students?.length || 0,
        mentors: mentors?.length || 0,
        internships: internships?.length || 0,
        applications: applications?.length || 0,
      })

      // Get application status stats
      const { data: appsByStatus } = await supabase
        .from("applications")
        .select("status")
        .then((response) => {
          const counts = {
            pending: 0,
            accepted: 0,
            rejected: 0,
          }
          response.data?.forEach((app: any) => {
            if (app.status in counts) {
              counts[app.status as keyof typeof counts]++
            }
          })
          return {
            data: [
              { name: "Pending", value: counts.pending, fill: "#eab308" },
              { name: "Accepted", value: counts.accepted, fill: "#22c55e" },
              { name: "Rejected", value: counts.rejected, fill: "#ef4444" },
            ],
          }
        })

      setApplicationStats(appsByStatus || [])

      // Generate mock chart data for trending
      const mockChartData = [
        { month: "Jan", students: 120, mentors: 45, internships: 12 },
        { month: "Feb", students: 145, mentors: 52, internships: 15 },
        { month: "Mar", students: 168, mentors: 61, internships: 18 },
        { month: "Apr", students: 192, mentors: 71, internships: 22 },
        { month: "May", students: 215, mentors: 82, internships: 26 },
        { month: "Jun", students: (students?.length || 0), mentors: (mentors?.length || 0), internships: (internships?.length || 0) },
      ]

      setChartData(mockChartData)

      // Get recent applications
      const { data: recentApps } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          submitted_at,
          profile: profiles!student_id(full_name),
          internship: internships(title)
        `,
        )
        .order("submitted_at", { ascending: false })
        .limit(6)

      setRecentActivity(recentApps || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#05040f]">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  const statCards = [
    { title: "Total Students", value: stats.students, icon: <Users className="w-5 h-5" />, color: "from-blue-500/20 to-blue-600/5", border: "border-violet-500/20", iconColor: "text-blue-400" },
    { title: "Total Mentors", value: stats.mentors, icon: <Briefcase className="w-5 h-5" />, color: "from-violet-500/20 to-violet-600/5", border: "border-violet-500/20", iconColor: "text-violet-400" },
    { title: "Active Internships", value: stats.internships, icon: <BarChart3 className="w-5 h-5" />, color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
    { title: "Applications", value: stats.applications, icon: <FileText className="w-5 h-5" />, color: "from-fuchsia-500/20 to-fuchsia-600/5", border: "border-fuchsia-500/20", iconColor: "text-fuchsia-400" },
  ]

  return (
    <div className="flex h-screen bg-[#05040f]">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">

          {/* Welcome Section */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-medium mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              Admin
            </div>
            <h1 className="text-3xl font-black text-white">
              Admin <span className="bg-linear-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-white/40 mt-1">Monitor and manage the Upskillify platform</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.08 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {statCards.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -3 }}
                  className={`relative bg-linear-to-br ${stat.color} border ${stat.border} rounded-2xl p-6 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-[#05040f]/70 rounded-2xl" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-white/50 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-black text-white mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-white/5 ${stat.iconColor}`}>{stat.icon}</div>
                  </div>
                </motion.div>
              ))}
          </motion.div>

          {/* Charts Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8"
          >
            {/* Trending Chart */}
            <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-white">Platform Growth</h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f0d1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }} />
                  <Line type="monotone" dataKey="students" stroke="#818cf8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="mentors" stroke="#a78bfa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="internships" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Application Status Chart */}
            <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-fuchsia-400" />
                <h2 className="text-sm font-semibold text-white">Application Status</h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={applicationStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f0d1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                  <Bar dataKey="value" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Management Sections */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          >
            {[
              { title: "User Management", description: "Manage students, mentors, and admins", href: "/admin/users", icon: <Users className="w-6 h-6" />, accent: "violet" },
              { title: "Internship Management", description: "Review and manage all internships", href: "/admin/internships", icon: <Briefcase className="w-6 h-6" />, accent: "emerald" },
              { title: "Application Review", description: "Review and approve applications", href: "/admin/applications", icon: <FileText className="w-6 h-6" />, accent: "fuchsia" },
              { title: "Reports & Analytics", description: "View platform analytics and reports", href: "/admin/reports", icon: <BarChart3 className="w-6 h-6" />, accent: "amber" },
            ].map((section, idx) => (
              <motion.div key={idx} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Link
                  href={section.href}
                  className="group bg-white/4 border border-white/8 rounded-2xl p-6 hover:bg-white/6 hover:border-violet-500/30 transition-all block h-full"
                >
                  <div className={`w-10 h-10 rounded-xl bg-${section.accent}-500/15 flex items-center justify-center text-${section.accent}-400 mb-4 group-hover:scale-110 transition-transform`}>
                    {section.icon}
                  </div>
                  <h3 className="font-bold text-white mb-1">{section.title}</h3>
                  <p className="text-white/40 text-sm">{section.description}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Recent Activity</h2>
            <div className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
              {recentActivity.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/6">
                      <tr>
                        {["Student", "Internship", "Status", "Date"].map((h) => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((activity) => (
                        <motion.tr
                          key={activity.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-white/4 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-white">{activity.profile?.full_name || "Unknown"}</td>
                          <td className="px-6 py-4 text-sm text-white/60">{activity.internship?.title || "N/A"}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              {activity.status === "accepted" && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                              {activity.status === "rejected" && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                              {activity.status === "pending" && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                activity.status === "accepted" ? "bg-emerald-500/15 text-emerald-300"
                                : activity.status === "rejected" ? "bg-red-500/15 text-red-300"
                                : "bg-amber-500/15 text-amber-300"
                              }`}>
                                {activity.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/30">
                            {new Date(activity.submitted_at).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/4 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-7 h-7 text-white/20" />
                  </div>
                  <p className="text-white/30">No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
