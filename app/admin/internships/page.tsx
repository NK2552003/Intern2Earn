"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Sidebar from "@/components/sidebar"

interface Internship {
  id: string
  title: string
  company_name: string
  location: string
  status: string
  created_at: string
  mentor?: {
    full_name: string
    email: string
  }
}

export default function InternshipsPage() {
  const [user, setUser] = useState<any>(null)
  const [internships, setInternships] = useState<Internship[]>([])
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

      const { data: internshipsData } = await supabase
        .from("internships")
        .select(`
          id,
          title,
          company_name,
          location,
          status,
          created_at,
          mentor: profiles!mentor_id(full_name, email)
        `)
        .order("created_at", { ascending: false })

      setInternships((internshipsData as any) || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      case "filled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Internship Management</h1>
              <p className="text-muted-foreground mt-2">Monitor all internships on the platform</p>
            </div>

            {/* Internships Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {internships.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-secondary">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Title</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Company</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Mentor</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Location</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internships.map((internship) => (
                        <tr key={internship.id} className="border-b border-border hover:bg-secondary transition-colors">
                          <td className="px-6 py-4 text-sm text-foreground">{internship.title}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{internship.company_name}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {internship.mentor?.full_name || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{internship.location}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                                internship.status,
                              )}`}
                            >
                              {internship.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {new Date(internship.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">No internships found</div>
              )}
            </div>
          </div>
      </main>
    </div>
  )
}
