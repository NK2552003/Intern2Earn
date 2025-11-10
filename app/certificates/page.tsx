"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Trophy } from "lucide-react"

interface Certificate {
  id: string
  title: string
  issued_at: string
  certificate_url?: string
  application?: {
    internship: {
      title: string
      company_name: string
    }
  }
}

export default function CertificatesPage() {
  const [user, setUser] = useState<any>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
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

      const { data: certificatesData } = await supabase
        .from("certificates")
        .select(`
          id,
          title,
          issued_at,
          certificate_url,
          application: applications(
            internship: internships(title, company_name)
          )
        `)
        .eq("student_id", clerkUser.id)
        .order("issued_at", { ascending: false })

      setCertificates(certificatesData || [])
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
      <main className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
              <p className="text-muted-foreground mt-2">Your earned certificates and achievements</p>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <Trophy className="w-10 h-10 mx-auto mb-4 text-primary" />
                  <h3 className="font-bold text-lg text-foreground mb-2">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{cert.application?.internship?.title}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Issued {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                  {cert.certificate_url && (
                    <a
                      href={cert.certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-colors"
                    >
                      View Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>

            {certificates.length === 0 && (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-muted-foreground mb-4">
                  No certificates yet. Complete your internship and earn your certificate!
                </p>
              </div>
            )}
          </div>
      </main>
    </div>
  )
}
