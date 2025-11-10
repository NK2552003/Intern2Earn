"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { MapPin, Clock } from "lucide-react"

export default function ManageInternshipsPage() {
  const [user, setUser] = useState<any>(null)
  const [internships, setInternships] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_name: "",
    location: "",
    salary_min: "",
    salary_max: "",
    duration_weeks: "",
    required_skills: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
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

      // Validate profile is complete and user is mentor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      if (profileError || !profile?.role || profile.role !== "mentor") {
        router.replace("/onboarding")
        return
      }

      setUser(clerkUser)

      const { data: internshipsData } = await supabase
        .from("internships")
        .select("*")
        .eq("mentor_id", clerkUser.id)
        .order("created_at", { ascending: false })

      setInternships(internshipsData || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const skillsArray = formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)

      const { data, error } = await supabase
        .from("internships")
        .insert({
          title: formData.title,
          description: formData.description,
          company_name: formData.company_name,
          location: formData.location,
          salary_min: formData.salary_min ? Number.parseInt(formData.salary_min) : null,
          salary_max: formData.salary_max ? Number.parseInt(formData.salary_max) : null,
          duration_weeks: Number.parseInt(formData.duration_weeks),
          required_skills: skillsArray,
          mentor_id: user.id,
          status: "open",
        })
        .select()

      if (error) throw error

      setInternships([data[0], ...internships])
      setShowForm(false)
      setFormData({
        title: "",
        description: "",
        company_name: "",
        location: "",
        salary_min: "",
        salary_max: "",
        duration_weeks: "",
        required_skills: "",
      })
    } catch (error: unknown) {
      console.error("Error creating internship:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this internship?")) {
      try {
        const supabase = createClient()
        await supabase.from("internships").delete().eq("id", id)
        setInternships(internships.filter((i) => i.id !== id))
      } catch (error) {
        console.error("Error deleting internship:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar role="mentor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="mentor" />
      <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Manage Internships</h1>
                <p className="text-muted-foreground mt-2">Create and manage your internship opportunities</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
              >
                {showForm ? "Cancel" : "Create Internship"}
              </button>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-card border border-border rounded-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Create New Internship</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Frontend Developer Intern"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                      <input
                        type="text"
                        required
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Describe the internship opportunity..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Duration (weeks)</label>
                      <input
                        type="number"
                        required
                        value={formData.duration_weeks}
                        onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Salary Min</label>
                      <input
                        type="number"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Salary Max</label>
                      <input
                        type="number"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Required Skills</label>
                    <input
                      type="text"
                      value={formData.required_skills}
                      onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="React, TypeScript, Python (comma-separated)"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? "Creating..." : "Create Internship"}
                  </button>
                </form>
              </div>
            )}

            {/* Internships List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <div
                  key={internship.id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-bold text-lg text-foreground mb-2">{internship.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{internship.company_name}</p>
                  <p className="text-sm text-foreground mb-4 line-clamp-2">{internship.description}</p>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {internship.location}</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {internship.duration_weeks} weeks</div>
                    {internship.salary_min && (
                      <div className="text-accent">
                        ${internship.salary_min.toLocaleString()} - ${internship.salary_max.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/internships/${internship.id}/edit`}
                      className="flex-1 py-2 px-4 bg-secondary text-foreground rounded-lg hover:opacity-90 transition-colors text-sm text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(internship.id)}
                      className="flex-1 py-2 px-4 bg-destructive/10 text-destructive rounded-lg hover:opacity-90 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {internships.length === 0 && !showForm && (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground mb-4">You haven't created any internships yet</p>
                <button onClick={() => setShowForm(true)} className="text-primary hover:underline font-medium">
                  Create your first internship
                </button>
              </div>
            )}
          </div>
      </main>
    </div>
  )

}
