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
  internship?: {
    title: string
    company_name: string
    location: string
  }
}

export default function ApplicationsPage() {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

      const { data: applicationsData } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          submitted_at,
          internship: internships(title, company_name, location)
        `)
        .eq("student_id", clerkUser.id)
        .order("submitted_at", { ascending: false })

      setApplications(applicationsData || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
              <p className="text-muted-foreground mt-2">Track your internship applications</p>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-secondary">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Position</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Company</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Location</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Applied On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id} className="border-b border-border hover:bg-secondary transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground">{app.internship?.title || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{app.internship?.company_name || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{app.internship?.location || "N/A"}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                app.status,
                              )}`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(app.submitted_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">You haven't applied to any internships yet</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
