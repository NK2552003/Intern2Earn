"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import {
  FileText,
  Clock,
  CheckCircle,
  Briefcase,
  TrendingUp,
  ArrowRight,
} from "lucide-react"

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    applications: 0,
    active: 0,
    accepted: 0,
  })
  const [recentInternships, setRecentInternships] = useState<any[]>([])
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

      setUser(clerkUser)

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clerkUser.id)
        .single()

      if (profileError || !profileData || !profileData.role) {
        console.log("Profile incomplete, redirecting to onboarding", profileError)
        router.replace("/onboarding")
        return
      }

      setProfile(profileData)

      const { data: applications } = await supabase.from("applications").select("id, status").eq("student_id", clerkUser.id)

      const accepted = applications?.filter((a) => a.status === "accepted").length || 0
      const pending = applications?.filter((a) => a.status === "pending").length || 0

      setStats({
        applications: applications?.length || 0,
        active: pending,
        accepted: accepted,
      })

      const { data: internships } = await supabase
        .from("internships")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(6)

      setRecentInternships(internships || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

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
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Welcome Section */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-4xl font-bold text-foreground">
                Welcome back, {profile?.full_name || user?.email}
              </h1>
              <p className="text-muted-foreground mt-2">Here's what's happening in your internship journey</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {[
                {
                  title: "Total Applications",
                  value: stats.applications,
                  icon: <FileText className="w-6 h-6" />,
                  color: "bg-blue-500",
                },
                {
                  title: "Pending Reviews",
                  value: stats.active,
                  icon: <Clock className="w-6 h-6" />,
                  color: "bg-yellow-500",
                },
                {
                  title: "Accepted",
                  value: stats.accepted,
                  icon: <CheckCircle className="w-6 h-6" />,
                  color: "bg-green-500",
                },
              ].map((stat, idx) => (
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

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/internships"
                  className="bg-linear-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-lg hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold mb-1">Browse Internships</h3>
                      <p className="text-sm opacity-90">Find new opportunities</p>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
                <Link
                  href="/applications"
                  className="bg-card border border-border p-6 rounded-lg hover:bg-secondary transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground mb-1">My Applications</h3>
                      <p className="text-sm text-muted-foreground">Check your status</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Opportunities */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recently Added Opportunities
              </h2>
              {recentInternships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentInternships.slice(0, 6).map((internship, idx) => (
                    <motion.div
                      key={internship.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={`/internships/${internship.id}`}
                        className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all block h-full"
                      >
                        <h3 className="font-bold text-foreground mb-2">{internship.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{internship.company_name}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{internship.location}</span>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">
                            {internship.duration_weeks}w
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No internship opportunities available at the moment</p>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
