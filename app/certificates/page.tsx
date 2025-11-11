"use client"

import { createClient } from "@/lib/supabase/client"
import Sidebar from "@/components/sidebar"
import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Trophy, Download, Eye, X, RefreshCw } from "lucide-react"
import { CertificateTemplate } from "@/components/certificate-template"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Certificate {
  id: string
  title: string
  issued_at: string
  certificate_url?: string
  student_id: string
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
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  const fetchCertificates = useCallback(async () => {
    if (!clerkUser) return

    const supabase = createClient()
    const { data: certificatesData, error: certError } = await supabase
      .from("certificates")
      .select(`
        id,
        title,
        issued_at,
        certificate_url,
        student_id,
        application: applications(
          internship: internships(title, company_name)
        )
      `)
      .eq("student_id", clerkUser.id)
      .order("issued_at", { ascending: false })

    if (certError) {
      console.error("Error fetching certificates:", certError)
    }

    console.log("Certificates fetched:", certificatesData)
    setCertificates(certificatesData as any || [])
  }, [clerkUser])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchCertificates()
    setIsRefreshing(false)
  }

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
      await fetchCertificates()
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser, fetchCertificates])

  // ESC key handler for closing modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCert) {
        setSelectedCert(null)
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [selectedCert])

  const handleDownloadPDF = async (cert: Certificate) => {
    setIsDownloading(true)
    try {
      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: true,
          logging: false,
          removeContainer: true,
          imageTimeout: 0,
          ignoreElements: (element) => {
            // Ignore elements that might cause issues
            return false
          }
        })

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [canvas.width, canvas.height],
        })

        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
        pdf.save(`certificate-${cert.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
      }
    } catch (error) {
      console.error("Error downloading certificate:", error)
      alert("Error downloading certificate. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadImage = async (cert: Certificate) => {
    setIsDownloading(true)
    try {
      if (certificateRef.current) {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: true,
          logging: false,
          removeContainer: true,
          imageTimeout: 0,
          ignoreElements: (element) => {
            // Ignore elements that might cause issues
            return false
          }
        })

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = `certificate-${cert.title.replace(/\s+/g, "-").toLowerCase()}.png`
            link.click()
            URL.revokeObjectURL(url)
          }
        })
      }
    } catch (error) {
      console.error("Error downloading certificate:", error)
      alert("Error downloading certificate. Please try again.")
    } finally {
      setIsDownloading(false)
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
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
              <p className="text-muted-foreground mt-2">Your earned certificates and achievements</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="relative bg-linear-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-xl p-6 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  {/* Trophy Icon with Glow */}
                  <div className="relative mb-4 inline-block">
                    <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative bg-linear-to-br from-amber-400 to-amber-600 p-4 rounded-full">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
                    {(cert.application?.internship as any)?.title || "Internship"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {(cert.application?.internship as any)?.company_name || "Company"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4 flex items-center justify-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Issued {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => setSelectedCert(cert)}
                      variant="default"
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedCert(cert)
                          // Wait for render then download
                          setTimeout(() => handleDownloadPDF(cert), 500)
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedCert(cert)
                          // Wait for render then download
                          setTimeout(() => handleDownloadImage(cert), 500)
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PNG
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {certificates.length === 0 && (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                No certificates yet. Complete your internship and get your submission approved to earn your certificate!
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Certificates are automatically generated when your final submission is approved by your mentor.
              </p>
            </div>
          )}
        </div>

        {/* Certificate Preview Modal - Fullscreen */}
        {selectedCert && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Header Bar */}
            <div className="bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Certificate Preview</h2>
                <p className="text-sm text-muted-foreground">
                  {(selectedCert.application?.internship as any)?.title || "Internship"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleDownloadImage(selectedCert)}
                  disabled={isDownloading}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download PNG"}
                </Button>
                <Button
                  onClick={() => handleDownloadPDF(selectedCert)}
                  disabled={isDownloading}
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download PDF"}
                </Button>
                <Button
                  onClick={() => setSelectedCert(null)}
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Certificate Display Area */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8">
              <div className="relative w-full max-w-7xl">
                {/* Shadow effect */}
                <div className="absolute inset-0 bg-white/5 blur-3xl transform scale-95"></div>
                
                {/* Certificate with responsive scaling */}
                <div 
                  className="relative flex items-center justify-center"
                  style={{
                    transform: window.innerWidth < 768 ? 'scale(0.35)' : window.innerWidth < 1280 ? 'scale(0.55)' : 'scale(0.75)',
                    transformOrigin: 'center',
                  }}
                >
                  <CertificateTemplate
                    ref={certificateRef}
                    studentName={clerkUser?.fullName || "Student Name"}
                    internshipTitle={(selectedCert.application?.internship as any)?.title || "Internship"}
                    companyName={(selectedCert.application?.internship as any)?.company_name || "Company"}
                    issuedDate={selectedCert.issued_at}
                    certificateId={selectedCert.id}
                  />
                </div>
              </div>
            </div>

            {/* Footer with instructions */}
            <div className="bg-background/95 backdrop-blur-sm border-t border-border px-6 py-3 text-center">
              <p className="text-sm text-muted-foreground">
                Click the download buttons above to save your certificate • Press ESC or click X to close
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
