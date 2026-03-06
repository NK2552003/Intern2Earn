"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { MapPin } from "lucide-react"

interface Student {
  id: string
  full_name: string
  email: string
  bio?: string
  location?: string
  skills?: string[]
  internship?: any
  application_status?: string
}

export default function MyStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
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

      // Validate profile is complete and is a mentor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      if (profileError || !profile?.role || profile.role !== "mentor") {
        router.replace("/dashboard/student")
        return
      }

      // Get all internships created by this mentor
      const { data: mentorInternships } = await supabase
        .from("internships")
        .select("id, title, company_name")
        .eq("mentor_id", clerkUser.id)

      const internshipIds = mentorInternships?.map((i) => i.id) || []

      // Get all accepted applications for these internships
      let studentsData: Student[] = []
      if (internshipIds.length > 0) {
        const { data: applications } = await supabase
          .from("applications")
          .select(`
            student_id,
            status,
            internship: internships(id, title, company_name)
          `)
          .in("internship_id", internshipIds)
          .eq("status", "accepted")

        if (applications && applications.length > 0) {
          const studentIds = [...new Set(applications.map((app) => app.student_id))]

          // Get student profiles
          const { data: studentProfiles } = await supabase
            .from("profiles")
            .select("id, full_name, email, bio, location, skills")
            .in("id", studentIds)

          // Combine student data with internship info
          studentsData = (studentProfiles || []).map((profile) => {
            const studentApps = applications.filter((app) => app.student_id === profile.id)
            return {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              bio: profile.bio,
              location: profile.location,
              skills: profile.skills,
              internship: studentApps[0]?.internship,
              application_status: studentApps[0]?.status,
            }
          })
        }
      }

      setStudents(studentsData)
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#05040f]">
        <Sidebar role="mentor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#05040f]">
      <Sidebar role="mentor" />
      <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">My Students</h1>
              <p className="text-white/60 mt-2">View and manage your mentored students</p>
            </div>

            {/* Students Grid */}
            {students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <div key={student.id} className="bg-white/5 border border-white/8 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-white">{student.full_name}</h3>
                      <p className="text-sm text-white/60">{student.email}</p>
                    </div>

                    {student.location && (
                      <div className="mb-3">
                        <p className="text-sm text-white/60 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> {student.location}
                        </p>
                      </div>
                    )}

                    {student.bio && (
                      <div className="mb-4">
                        <p className="text-sm text-white">{student.bio}</p>
                      </div>
                    )}

                    {student.skills && student.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-white/60 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white/5 text-white text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="px-2 py-1 bg-white/5 text-white text-xs rounded">
                              +{student.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {student.internship && (
                      <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-xs font-medium text-white/60 mb-1">Current Internship</p>
                        <p className="text-sm font-medium text-white">{student.internship.title}</p>
                        <p className="text-xs text-white/60">{student.internship.company_name}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-white/8">
                      <a
                        href={`/profile?student=${student.id}`}
                        className="flex-1 text-center py-2 px-3 bg-linear-to-r from-violet-500 to-fuchsia-500 text-white rounded text-sm font-medium hover:opacity-90 transition-colors"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/8 rounded-lg p-12 text-center">
                <p className="text-white/60 mb-2">You don't have any students yet</p>
                <p className="text-sm text-white/60">Create internships to attract and mentor students</p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }
