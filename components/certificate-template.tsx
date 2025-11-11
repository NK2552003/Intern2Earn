"use client"

import React from "react"
import { Award, CheckCircle, Sparkles, Star, Shield, Medal } from "lucide-react"

interface CertificateTemplateProps {
  studentName: string
  internshipTitle: string
  companyName: string
  issuedDate: string
  certificateId?: string
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ studentName, internshipTitle, companyName, issuedDate, certificateId }, ref) => {
    const formattedDate = new Date(issuedDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return (
      <div
        ref={ref}
        className="relative w-[1200px] h-[900px] bg-white p-8 overflow-visible"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 30%, #2563eb 60%, #0ea5e9 100%)",
          fontFamily: "'Inter', 'Georgia', system-ui, serif",
        }}
      >
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full" style={{ backgroundColor: 'rgba(103, 232, 249, 0.6)' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ backgroundColor: 'rgba(96, 165, 250, 0.5)' }}></div>
        </div>

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative Corner Ornaments */}
        <div className="absolute top-12 left-12 flex flex-col gap-1">
          <div className="flex gap-1">
            <Star className="w-7 h-7" style={{ color: '#fbbf24', fill: '#fbbf24', filter: 'none' }} />
            <Star className="w-6 h-6" style={{ color: '#fcd34d', fill: '#fcd34d' }} />
          </div>
          <Shield className="w-8 h-8" style={{ color: '#93c5fd', opacity: 0.7 }} />
        </div>
        <div className="absolute top-12 right-12 flex flex-col items-end gap-1">
          <div className="flex gap-1">
            <Star className="w-6 h-6" style={{ color: '#fcd34d', fill: '#fcd34d' }} />
            <Star className="w-7 h-7" style={{ color: '#fbbf24', fill: '#fbbf24', filter: 'none' }} />
          </div>
          <Medal className="w-8 h-8" style={{ color: '#93c5fd', opacity: 0.7 }} />
        </div>
        <div className="absolute bottom-12 left-12">
          <div className="flex gap-1 items-end">
            <Medal className="w-8 h-8" style={{ color: '#fcd34d', opacity: 0.7 }} />
            <Star className="w-6 h-6" style={{ color: '#fcd34d', fill: '#fcd34d' }} />
          </div>
        </div>
        <div className="absolute bottom-12 right-12">
          <div className="flex gap-1 items-end">
            <Star className="w-6 h-6" style={{ color: '#fcd34d', fill: '#fcd34d' }} />
            <Shield className="w-8 h-8" style={{ color: '#fcd34d', opacity: 0.7 }} />
          </div>
        </div>

        {/* Main Decorative Border - Multiple Layers */}
        <div className="absolute inset-10 border-[6px] rounded-3xl" style={{ borderColor: 'rgba(255, 255, 255, 0.4)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}></div>
        <div className="absolute inset-12 border-[3px] rounded-2xl" style={{ borderColor: 'rgba(251, 191, 36, 0.7)' }}></div>
        <div className="absolute inset-[52px] border rounded-xl" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}></div>

        {/* Inner Content Container with proper padding */}
        <div className="absolute inset-[60px] flex flex-col items-center justify-between overflow-hidden">
          {/* Top Section - Logo and Header */}
          <div className="flex flex-col items-center w-full pt-2">
            {/* Top Badge with Icon */}
            <div className="relative mb-4 z-10">
              <div className="absolute -inset-4 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(251, 191, 36, 0) 70%)' }}></div>
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-white" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 4px rgba(251, 191, 36, 0.3)' }}>
                <Award className="w-14 h-14 text-white" strokeWidth={2.5} style={{ filter: 'none' }} />
              </div>
            </div>

            {/* Platform Name */}
            <div className="mb-2 text-center">
              <p className="text-sm tracking-[0.15em] font-bold uppercase" style={{ color: '#fcd34d' }}>Intern2Earn Platform</p>
            </div>

            {/* Header */}
            <div className="mb-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-5 h-5" style={{ color: '#fcd34d', filter: 'none' }} />
                <h1 className="text-5xl font-black tracking-tight" style={{ color: '#ffffff', textShadow: "0 4px 30px rgba(0,0,0,0.4), 0 2px 10px rgba(251,191,36,0.3)" }}>
                  CERTIFICATE
                </h1>
                <Sparkles className="w-5 h-5" style={{ color: '#fcd34d', filter: 'none' }} />
              </div>
              <p className="text-xl tracking-[0.3em] font-bold" style={{ color: '#fde68a' }}>OF EXCELLENCE</p>
            </div>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-20 h-0.5 rounded-full" style={{ background: 'linear-gradient(to right, transparent, #fbbf24, #fbbf24)' }}></div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fbbf24', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}></div>
              <div className="w-24 h-0.5 rounded-full" style={{ backgroundColor: '#fbbf24', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}></div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fbbf24', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}></div>
              <div className="w-20 h-0.5 rounded-full" style={{ background: 'linear-gradient(to left, transparent, #fbbf24, #fbbf24)' }}></div>
            </div>
          </div>

          {/* Middle Section - Main Content */}
          <div className="flex flex-col items-center space-y-3 w-full max-w-4xl flex-1 justify-center -mt-4">
            <p className="text-base font-medium italic text-center" style={{ color: '#ffffff' }}>This certificate is proudly presented to</p>
            
            {/* Student Name - Highlighted */}
            <div className="relative py-4 px-12 w-full max-w-3xl">
              <div className="absolute inset-0 rounded-2xl border-[3px] border-amber-400" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}></div>
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(to right, rgba(245, 158, 11, 0.1), transparent, rgba(245, 158, 11, 0.1))' }}></div>
              <h2 className="relative text-4xl font-bold tracking-wide text-center wrap-break-word leading-tight px-4" style={{ color: '#ffffff', textShadow: "0 3px 15px rgba(0,0,0,0.3)", fontFamily: "'Georgia', serif" }}>
                {studentName}
              </h2>
            </div>

            <p className="text-base leading-relaxed px-8 max-w-3xl text-center font-medium" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
              for outstanding performance and successful completion of the
            </p>

            {/* Internship Title */}
            <div className="relative py-3 px-8 w-full max-w-3xl">
              <div className="absolute inset-0 rounded-xl border-2" style={{ background: 'linear-gradient(to right, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25), rgba(6, 182, 212, 0.25))', borderColor: 'rgba(103, 232, 249, 0.6)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}></div>
              <h3 className="relative text-xl font-bold text-center wrap-break-word leading-snug px-4" style={{ color: '#ffffff' }}>
                {internshipTitle}
              </h3>
            </div>

            <p className="text-base font-medium text-center" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>internship program at</p>

            {/* Company Name */}
            <div className="py-3 px-8 rounded-xl border-2 max-w-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.4)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <h3 className="text-xl font-bold wrap-break-word text-center px-2 leading-snug" style={{ color: '#fde68a', textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                {companyName}
              </h3>
            </div>

            {/* Completion Badge */}
            <div className="flex items-center gap-2 mt-2 px-4 py-1 rounded-full border-2" style={{ backgroundColor: 'rgba(34, 197, 94, 0.25)', borderColor: 'rgba(74, 222, 128, 0.6)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
              <CheckCircle className="w-5 h-5" fill="currentColor" style={{ color: '#86efac', filter: 'none' }} />
              <span className="text-sm font-bold tracking-wide" style={{ color: '#ffffff' }}>SUCCESSFULLY COMPLETED</span>
            </div>
          </div>

          {/* Bottom Section - Credentials */}
          <div className="w-full pb-2">
            <div className="grid grid-cols-3 gap-4 w-full pt-4" style={{ borderTop: '3px solid rgba(255, 255, 255, 0.4)' }}>
              <div className="text-center flex flex-col items-center">
                <p className="text-xs font-bold mb-1.5 tracking-wide uppercase" style={{ color: '#fcd34d' }}>Date of Issue</p>
                <div className="px-3 py-2 rounded-lg border inline-block" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                  <p className="text-sm font-bold leading-tight" style={{ color: '#ffffff' }}>{formattedDate}</p>
                </div>
              </div>

              {certificateId && (
                <div className="text-center flex flex-col items-center">
                  <p className="text-xs font-bold mb-1.5 tracking-wide uppercase" style={{ color: '#fcd34d' }}>Certificate ID</p>
                  <div className="px-3 py-2 rounded-lg border inline-block" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                    <p className="text-[10px] font-mono font-bold tracking-wider leading-tight" style={{ color: '#ffffff' }}>
                      {certificateId.slice(0, 16).toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center flex flex-col items-center">
                <p className="text-xs font-bold mb-1.5 tracking-wide uppercase" style={{ color: '#fcd34d' }}>Authorized By</p>
                <div className="inline-block">
                  <div className="pt-2 px-4 mb-1" style={{ borderTop: '2px solid #fbbf24' }}>
                    <p className="text-xs font-bold tracking-wide leading-tight" style={{ color: '#ffffff' }}>Digital Signature</p>
                  </div>
                  <div className="px-3 py-1 rounded-lg border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                    <p className="text-[10px] font-semibold leading-tight" style={{ color: '#fde68a' }}>Platform Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center justify-center gap-2 mt-4 px-5 py-2 rounded-full border-2 mx-auto w-fit" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.3)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <Shield className="w-4 h-4" style={{ color: '#86efac', filter: 'none' }} />
              <p className="text-[10px] font-bold tracking-wider uppercase leading-tight" style={{ color: '#ffffff' }}>Verified & Authenticated</p>
              <Medal className="w-4 h-4" style={{ color: '#fcd34d', filter: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }
)

CertificateTemplate.displayName = "CertificateTemplate"
