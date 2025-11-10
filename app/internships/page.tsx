"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { MapPin, Clock } from "lucide-react"

export default function InternshipsPage() {
  const [user, setUser] = useState<any>(null)
  const [internships, setInternships] = useState<any[]>([])
  const [filteredInternships, setFilteredInternships] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [durationFilter, setDurationFilter] = useState("")
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

      // Get all open internships
      const { data: internshipsData } = await supabase
        .from("internships")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })

      setInternships(internshipsData || [])
      setFilteredInternships(internshipsData || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  useEffect(() => {
    let filtered = internships

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.company_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (locationFilter) {
      filtered = filtered.filter((i) => i.location.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    if (durationFilter) {
      filtered = filtered.filter((i) => i.duration_weeks <= Number.parseInt(durationFilter))
    }

    setFilteredInternships(filtered)
  }, [searchTerm, locationFilter, durationFilter, internships])

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
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Browse Internships</h1>
              <p className="text-muted-foreground">Find and apply to your next opportunity</p>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City or region..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Duration (weeks)</label>
                  <input
                    type="number"
                    placeholder="e.g., 12"
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Internships Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInternships.map((internship) => (
                <Link
                  key={internship.id}
                  href={`/internships/${internship.id}`}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary transition-all"
                >
                  <h3 className="font-bold text-foreground text-lg mb-2">{internship.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{internship.company_name}</p>
                  <p className="text-sm text-foreground mb-4 line-clamp-2">{internship.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {internship.location}</div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {internship.duration_weeks}w</div>
                    </div>
                    {internship.salary_min && (
                      <div className="text-accent font-medium">
                        ${internship.salary_min?.toLocaleString()} - ${internship.salary_max?.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-medium text-sm">
                    View Details
                  </button>
                </Link>
              ))}
            </div>

            {filteredInternships.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No internships found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setLocationFilter("")
                    setDurationFilter("")
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
