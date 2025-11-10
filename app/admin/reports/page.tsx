"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Sidebar from "@/components/sidebar"

interface ReportData {
  totalStudents: number
  totalMentors: number
  totalInternships: number
  totalApplications: number
  approvedApplications: number
  rejectedApplications: number
  pendingApplications: number
  completedInternships: number
  activeInternships: number
}

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [reportData, setReportData] = useState<ReportData>({
    totalStudents: 0,
    totalMentors: 0,
    totalInternships: 0,
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    completedInternships: 0,
    activeInternships: 0,
  })
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

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      // If profile doesn't exist or user is not admin, redirect accordingly
      if (profileError || !profile || !profile.role) {
        router.replace("/onboarding")
        return
      }

      if (profile.role !== "admin") {
        router.replace("/dashboard/student")
        return
      }

      setUser(clerkUser)

      // Get statistics
      const { data: students } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "student")

      const { data: mentors } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "mentor")

      const { data: internships } = await supabase
        .from("internships")
        .select("id, status")

      const { data: applications } = await supabase
        .from("applications")
        .select("id, status")

      const approvedApps = applications?.filter((app) => app.status === "approved").length || 0
      const rejectedApps = applications?.filter((app) => app.status === "rejected").length || 0
      const pendingApps = applications?.filter((app) => app.status === "pending").length || 0
      const completedInternships = internships?.filter((int) => int.status === "closed").length || 0
      const activeInternships = internships?.filter((int) => int.status === "open").length || 0

      setReportData({
        totalStudents: students?.length || 0,
        totalMentors: mentors?.length || 0,
        totalInternships: internships?.length || 0,
        totalApplications: applications?.length || 0,
        approvedApplications: approvedApps,
        rejectedApplications: rejectedApps,
        pendingApplications: pendingApps,
        completedInternships,
        activeInternships,
      })

      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const StatCard = ({
    title,
    value,
    subtitle,
    bgColor,
  }: {
    title: string
    value: number
    subtitle?: string
    bgColor: string
  }) => (
    <div className={`${bgColor} rounded-lg p-6 text-white`}>
      <h3 className="text-sm font-medium opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar role="admin" />
      </div>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sidebar role="admin" />
      </div>
      <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
              <p className="text-muted-foreground mt-2">Platform statistics and insights</p>
            </div>

            {/* User Statistics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">User Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Students"
                  value={reportData.totalStudents}
                  bgColor="bg-blue-500"
                />
                <StatCard
                  title="Total Mentors"
                  value={reportData.totalMentors}
                  bgColor="bg-green-500"
                />
                <StatCard
                  title="Total Admins"
                  value={1}
                  bgColor="bg-purple-500"
                />
              </div>
            </div>

            {/* Internship Statistics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Internship Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Internships"
                  value={reportData.totalInternships}
                  bgColor="bg-indigo-500"
                />
                <StatCard
                  title="Active Internships"
                  value={reportData.activeInternships}
                  subtitle="Currently accepting applications"
                  bgColor="bg-orange-500"
                />
                <StatCard
                  title="Completed Internships"
                  value={reportData.completedInternships}
                  bgColor="bg-teal-500"
                />
              </div>
            </div>

            {/* Application Statistics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Application Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Total Applications"
                  value={reportData.totalApplications}
                  bgColor="bg-slate-500"
                />
                <StatCard
                  title="Approved"
                  value={reportData.approvedApplications}
                  bgColor="bg-emerald-500"
                />
                <StatCard
                  title="Pending"
                  value={reportData.pendingApplications}
                  bgColor="bg-amber-500"
                />
                <StatCard
                  title="Rejected"
                  value={reportData.rejectedApplications}
                  bgColor="bg-rose-500"
                />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Approval Rate</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {reportData.totalApplications > 0
                        ? Math.round(
                            (reportData.approvedApplications / reportData.totalApplications) * 100
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {reportData.approvedApplications} of {reportData.totalApplications} applications
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Average Applications Per Internship</h3>
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {reportData.totalInternships > 0
                      ? (reportData.totalApplications / reportData.totalInternships).toFixed(1)
                      : 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Applications per internship listing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
