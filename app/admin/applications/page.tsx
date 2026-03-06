"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

interface Application {
  id: string
  status: string
  submitted_at: string
  student_id: string
  internship_id: string
  profile?: {
    full_name: string
    email: string
  }
  internship?: {
    title: string
    company_name: string
  }
}

export default function ApplicationsPage() {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
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

      // Get all applications with related data
      const { data: applicationsData } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          submitted_at,
          student_id,
          internship_id,
          profile: profiles!student_id(full_name, email),
          internship: internships(title, company_name)
        `)
        .order("submitted_at", { ascending: false })

      setApplications((applicationsData as any) || [])
      setFilteredApplications((applicationsData as any) || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  useEffect(() => {
    let filtered = applications

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }, [statusFilter, applications])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/15 text-amber-300"
      case "approved":
        return "bg-emerald-500/15 text-emerald-300"
      case "rejected":
        return "bg-red-500/15 text-red-300"
      case "accepted":
        return "bg-violet-500/15 text-violet-300"
      default:
        return "bg-white/8 text-white/60"
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId)

    if (!error) {
      // Update local state
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#05040f]">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#05040f]">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Applications</h1>
              <p className="text-white/60 mt-2">Review and manage all internship applications</p>
            </div>

            {/* Filters */}
            <div className="bg-white/5 border border-white/8 rounded-lg p-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-48 px-4 py-2 bg-white/6 border border-white/8 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white/5 border border-white/8 rounded-lg overflow-hidden">
              {filteredApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/8 bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-white">Student</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-white">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-white">Internship</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-white">Company</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-white">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-white">Submitted</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app) => (
                        <tr key={app.id} className="border-b border-white/8 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-white">{app.profile?.full_name || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-white/60">{app.profile?.email || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-white">{app.internship?.title || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-white/60">{app.internship?.company_name || "N/A"}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">
                            {new Date(app.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              className="px-2 py-1 bg-white/6 border border-white/8 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="accepted">Accepted</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-white/60">No applications found</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
