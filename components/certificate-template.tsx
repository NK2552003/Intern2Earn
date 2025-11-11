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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400 rounded-full blur-3xl"></div>
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
            <Star className="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-lg" />
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <Shield className="w-8 h-8 text-blue-300 opacity-70" />
        </div>
        <div className="absolute top-12 right-12 flex flex-col items-end gap-1">
          <div className="flex gap-1">
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
            <Star className="w-7 h-7 text-amber-400 fill-amber-400 drop-shadow-lg" />
          </div>
          <Medal className="w-8 h-8 text-blue-300 opacity-70" />
        </div>
        <div className="absolute bottom-12 left-12">
          <div className="flex gap-1 items-end">
            <Medal className="w-8 h-8 text-amber-300 opacity-70" />
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
        </div>
        <div className="absolute bottom-12 right-12">
          <div className="flex gap-1 items-end">
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
            <Shield className="w-8 h-8 text-amber-300 opacity-70" />
          </div>
        </div>

        {/* Main Decorative Border - Multiple Layers */}
        <div className="absolute inset-10 border-[6px] border-white/40 rounded-3xl shadow-2xl"></div>
        <div className="absolute inset-12 border-[3px] border-amber-400/70 rounded-2xl"></div>
        <div className="absolute inset-[52px] border border-white/20 rounded-xl"></div>

        {/* Inner Content Container with proper padding */}
        <div className="absolute inset-[60px] flex flex-col items-center justify-between overflow-hidden">
          {/* Top Section - Logo and Header */}
          <div className="flex flex-col items-center w-full pt-2">
            {/* Top Badge with Icon */}
            <div className="relative mb-4 z-10">
              <div className="absolute inset-0 bg-linear-to-r from-amber-400 to-amber-500 rounded-full blur-2xl opacity-60"></div>
              <div className="relative flex items-center justify-center w-24 h-24 bg-linear-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-2xl border-4 border-white ring-4 ring-amber-200/30">
                <Award className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
            </div>

            {/* Platform Name */}
            <div className="mb-2 text-center">
              <p className="text-sm text-amber-300 tracking-[0.15em] font-bold uppercase">Intern2Earn Platform</p>
            </div>

            {/* Header */}
            <div className="mb-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-amber-300 drop-shadow-lg" />
                <h1 className="text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4), 0 2px 10px rgba(251,191,36,0.3)" }}>
                  CERTIFICATE
                </h1>
                <Sparkles className="w-5 h-5 text-amber-300 drop-shadow-lg" />
              </div>
              <p className="text-xl text-amber-200 tracking-[0.3em] font-bold">OF EXCELLENCE</p>
            </div>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-20 h-0.5 bg-linear-to-r from-transparent via-amber-400 to-amber-400 rounded-full"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full shadow-lg"></div>
              <div className="w-24 h-0.5 bg-amber-400 rounded-full shadow-lg"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full shadow-lg"></div>
              <div className="w-20 h-0.5 bg-linear-to-l from-transparent via-amber-400 to-amber-400 rounded-full"></div>
            </div>
          </div>

          {/* Middle Section - Main Content */}
          <div className="flex flex-col items-center space-y-3 w-full max-w-4xl flex-1 justify-center -mt-4">
            <p className="text-base text-white font-medium italic text-center">This certificate is proudly presented to</p>
            
            {/* Student Name - Highlighted */}
            <div className="relative py-4 px-12 w-full max-w-3xl">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl border-[3px] border-amber-400 shadow-2xl"></div>
              <div className="absolute inset-0 bg-linear-to-r from-amber-500/10 via-transparent to-amber-500/10 rounded-2xl"></div>
              <h2 className="relative text-4xl font-bold text-white tracking-wide text-center wrap-break-word leading-tight px-4" style={{ textShadow: "0 3px 15px rgba(0,0,0,0.3)", fontFamily: "'Georgia', serif" }}>
                {studentName}
              </h2>
            </div>

            <p className="text-base text-white/95 leading-relaxed px-8 max-w-3xl text-center font-medium">
              for outstanding performance and successful completion of the
            </p>

            {/* Internship Title */}
            <div className="relative py-3 px-8 w-full max-w-3xl">
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500/25 via-blue-500/25 to-cyan-500/25 backdrop-blur-sm rounded-xl border-2 border-cyan-300/60 shadow-xl"></div>
              <h3 className="relative text-xl font-bold text-white text-center wrap-break-word leading-snug px-4">
                {internshipTitle}
              </h3>
            </div>

            <p className="text-base text-white/95 font-medium text-center">internship program at</p>

            {/* Company Name */}
            <div className="py-3 px-8 bg-white/15 backdrop-blur-sm rounded-xl border-2 border-white/40 shadow-lg max-w-2xl">
              <h3 className="text-xl font-bold text-amber-200 wrap-break-word text-center px-2 leading-snug" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                {companyName}
              </h3>
            </div>

            {/* Completion Badge */}
            <div className="flex items-center gap-2 mt-2 bg-green-500/25 backdrop-blur-sm px-4 py-1 rounded-full border-2 border-green-400/60 shadow-xl">
              <CheckCircle className="w-5 h-5 text-green-300 drop-shadow-lg" fill="currentColor" />
              <span className="text-white text-xs font-bold tracking-wide">SUCCESSFULLY COMPLETED</span>
            </div>
          </div>

          {/* Bottom Section - Credentials */}
          <div className="w-full pb-2">
            <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t-[3px] border-white/40">
              <div className="text-center flex flex-col items-center">
                <p className="text-xs text-amber-300 font-bold mb-1.5 tracking-wide uppercase">Date of Issue</p>
                <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30 inline-block">
                  <p className="text-sm font-bold text-white leading-tight">{formattedDate}</p>
                </div>
              </div>

              {certificateId && (
                <div className="text-center flex flex-col items-center">
                  <p className="text-xs text-amber-300 font-bold mb-1.5 tracking-wide uppercase">Certificate ID</p>
                  <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30 inline-block">
                    <p className="text-[10px] font-mono text-white font-bold tracking-wider leading-tight">
                      {certificateId.slice(0, 16).toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center flex flex-col items-center">
                <p className="text-xs text-amber-300 font-bold mb-1.5 tracking-wide uppercase">Authorized By</p>
                <div className="inline-block">
                  <div className="border-t-2 border-amber-400 pt-2 px-4 mb-1">
                    <p className="text-xs font-bold text-white tracking-wide leading-tight">Digital Signature</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/30">
                    <p className="text-[10px] text-amber-200 font-semibold leading-tight">Platform Director</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center justify-center gap-2 mt-4 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border-2 border-white/30 shadow-lg mx-auto w-fit">
              <Shield className="w-4 h-4 text-green-300 drop-shadow-lg" />
              <p className="text-[10px] text-white font-bold tracking-wider uppercase leading-tight">Verified & Authenticated</p>
              <Medal className="w-4 h-4 text-amber-300 drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }
)

CertificateTemplate.displayName = "CertificateTemplate"
