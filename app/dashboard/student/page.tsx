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
      <div className="flex h-screen bg-[#05040f]">
        <Sidebar role="student" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#05040f]">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">

            {/* Welcome Section */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Active Student
              </div>
              <h1 className="text-3xl font-black text-white">
                Welcome back, <span className="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{profile?.full_name?.split(" ")[0] || "there"}</span> 👋
              </h1>
              <p className="text-white/40 mt-1">Here's what's happening in your internship journey</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { title: "Total Applications", value: stats.applications, icon: <FileText className="w-5 h-5" />, color: "from-violet-500/20 to-violet-600/5", border: "border-violet-500/20", iconColor: "text-violet-400" },
                { title: "Pending Reviews", value: stats.active, icon: <Clock className="w-5 h-5" />, color: "from-amber-500/20 to-amber-600/5", border: "border-amber-500/20", iconColor: "text-amber-400" },
                { title: "Accepted", value: stats.accepted, icon: <CheckCircle className="w-5 h-5" />, color: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
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
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-8">
              <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/internships"
                  className="group relative overflow-hidden bg-linear-to-r from-violet-500 to-fuchsia-500 p-6 rounded-2xl hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white mb-1">Browse Internships</h3>
                      <p className="text-sm text-white/70">Find new opportunities</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link
                  href="/applications"
                  className="group bg-white/4 border border-white/8 p-6 rounded-2xl hover:bg-white/6 hover:border-violet-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white mb-1">My Applications</h3>
                      <p className="text-sm text-white/40">Check your status</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/40 group-hover:translate-x-1 group-hover:text-white transition-all" />
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* Recent Opportunities */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white/40 uppercase tracking-widest">Recent Opportunities</h2>
                <Link href="/internships" className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              {recentInternships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentInternships.slice(0, 6).map((internship, idx) => (
                    <motion.div
                      key={internship.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + idx * 0.05 }}
                      whileHover={{ y: -3 }}
                    >
                      <Link
                        href={`/internships/${internship.id}`}
                        className="group bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/6 hover:border-violet-500/30 transition-all block h-full"
                      >
                        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center mb-3">
                          <Briefcase size={16} className="text-violet-400" />
                        </div>
                        <h3 className="font-bold text-white mb-1 line-clamp-1">{internship.title}</h3>
                        <p className="text-sm text-white/40 mb-3">{internship.company_name}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/30">{internship.location || "Remote"}</span>
                          <span className="bg-violet-500/15 text-violet-300 px-2 py-0.5 rounded-full font-semibold">
                            {internship.duration_weeks}w
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/4 border border-white/8 rounded-2xl p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-7 h-7 text-violet-400/40" />
                  </div>
                  <p className="text-white/30">No internship opportunities available at the moment</p>
                </div>
              )}
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  )
}
