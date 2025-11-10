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
      <div className="flex h-screen">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.students,
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
    },
    {
      title: "Total Mentors",
      value: stats.mentors,
      icon: <Briefcase className="w-6 h-6" />,
      color: "bg-purple-500",
    },
    {
      title: "Active Internships",
      value: stats.internships,
      icon: <BarChart3 className="w-6 h-6" />,
      color: "bg-green-500",
    },
    {
      title: "Applications",
      value: stats.applications,
      icon: <FileText className="w-6 h-6" />,
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-auto">
      <div className="p-6">
            {/* Welcome Section */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">Monitor and manage the Inter2Earn platform</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {statCards.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>{stat.icon}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {/* Trending Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Platform Growth</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                    <Line type="monotone" dataKey="mentors" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7" }} />
                    <Line
                      type="monotone"
                      dataKey="internships"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: "#22c55e" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Application Status Chart */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Application Status</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={applicationStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Management Sections */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {[
                {
                  title: "User Management",
                  description: "Manage students, mentors, and admins",
                  href: "/admin/users",
                  icon: <Users className="w-8 h-8" />,
                },
                {
                  title: "Internship Management",
                  description: "Review and manage all internships",
                  href: "/admin/internships",
                  icon: <Briefcase className="w-8 h-8" />,
                },
                {
                  title: "Application Review",
                  description: "Review and approve applications",
                  href: "/admin/applications",
                  icon: <FileText className="w-8 h-8" />,
                },
                {
                  title: "Reports",
                  description: "View platform analytics and reports",
                  href: "/admin/reports",
                  icon: <BarChart3 className="w-8 h-8" />,
                },
              ].map((section, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={section.href}
                    className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all block h-full"
                  >
                    <div className="text-primary mb-4">{section.icon}</div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{section.title}</h3>
                    <p className="text-muted-foreground text-sm">{section.description}</p>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
              </div>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {recentActivity.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border bg-secondary">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Student</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Internship</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivity.map((activity) => (
                          <motion.tr
                            key={activity.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-border hover:bg-secondary transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-foreground">
                              {activity.profile?.full_name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground">{activity.internship?.title || "N/A"}</td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center gap-2">
                                {activity.status === "accepted" && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                                {activity.status === "rejected" && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                                {activity.status === "pending" && (
                                  <Clock className="w-4 h-4 text-yellow-500" />
                                )}
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                                    activity.status === "accepted"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : activity.status === "rejected"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  }`}
                                >
                                  {activity.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {new Date(activity.submitted_at).toLocaleDateString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">No recent activity</div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    )
  }
