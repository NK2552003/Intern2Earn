"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Internship {
  id: string
  title: string
  company_name: string
  description: string
  location: string
  salary_min?: number
  salary_max?: number
  duration_weeks: number
  required_skills: string[]
  status: string
  mentor_id: string
}

export default function EditInternshipPage() {
  const [internship, setInternship] = useState<Internship | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_name: "",
    location: "",
    salary_min: "",
    salary_max: "",
    duration_weeks: "",
    required_skills: "",
    status: "open",
  })
  const router = useRouter()
  const params = useParams()
  const { user: clerkUser, isLoaded } = useUser()
  const id = params?.id as string

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

      // Fetch the internship
      const { data: internshipData, error: internshipError } = await supabase
        .from("internships")
        .select("*")
        .eq("id", id)
        .single()

      if (internshipError || !internshipData) {
        router.push("/internships/manage")
        return
      }

      // Verify the mentor owns this internship
      if (internshipData.mentor_id !== clerkUser.id) {
        router.push("/internships/manage")
        return
      }

      setInternship(internshipData)
      setFormData({
        title: internshipData.title,
        description: internshipData.description,
        company_name: internshipData.company_name,
        location: internshipData.location,
        salary_min: internshipData.salary_min?.toString() || "",
        salary_max: internshipData.salary_max?.toString() || "",
        duration_weeks: internshipData.duration_weeks.toString(),
        required_skills: internshipData.required_skills.join(", "),
        status: internshipData.status,
      })
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const skillsArray = formData.required_skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)

      const { error } = await supabase
        .from("internships")
        .update({
          title: formData.title,
          description: formData.description,
          company_name: formData.company_name,
          location: formData.location,
          salary_min: formData.salary_min ? Number.parseInt(formData.salary_min) : null,
          salary_max: formData.salary_max ? Number.parseInt(formData.salary_max) : null,
          duration_weeks: Number.parseInt(formData.duration_weeks),
          required_skills: skillsArray,
          status: formData.status,
        })
        .eq("id", id)

      if (error) throw error

      router.push("/internships/manage")
    } catch (error) {
      console.error("Error updating internship:", error)
      alert("Failed to update internship. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading internship...</p>
        </div>
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Internship not found</p>
          <Link href="/internships/manage" className="text-primary hover:underline mt-4 inline-block">
            Back to Manage Internships
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link
            href="/internships/manage"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Internships
          </Link>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Internship</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. Frontend Developer Intern"
              />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium mb-2">
                Company Name *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. Tech Corp"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe the internship role, responsibilities, and what the intern will learn..."
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. Remote, New York, NY"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium mb-2">
                  Minimum Salary (optional)
                </label>
                <input
                  type="number"
                  id="salary_min"
                  name="salary_min"
                  value={formData.salary_min}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g. 1000"
                />
              </div>

              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium mb-2">
                  Maximum Salary (optional)
                </label>
                <input
                  type="number"
                  id="salary_max"
                  name="salary_max"
                  value={formData.salary_max}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g. 2000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="duration_weeks" className="block text-sm font-medium mb-2">
                Duration (weeks) *
              </label>
              <input
                type="number"
                id="duration_weeks"
                name="duration_weeks"
                value={formData.duration_weeks}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 12"
              />
            </div>

            <div>
              <label htmlFor="required_skills" className="block text-sm font-medium mb-2">
                Required Skills *
              </label>
              <input
                type="text"
                id="required_skills"
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter skills separated by commas
              </p>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? "Updating..." : "Update Internship"}
              </button>
              <Link
                href="/internships/manage"
                className="flex-1 py-3 px-6 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-colors text-center font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
