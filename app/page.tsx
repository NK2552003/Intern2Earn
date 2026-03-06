"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import {
  ArrowRight, Zap, Users, Award, TrendingUp, Star,
  Rocket, GraduationCap, Briefcase, CheckCircle2,
  BarChart3, Shield, Globe, Sparkles, ChevronRight,
} from "lucide-react"

// ── animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 60
    const id = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(id) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(id)
  }, [inView, target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── marquee strip ─────────────────────────────────────────────────────────────
const marqueeItems = [
  "Full-Stack Development", "Data Science", "UI/UX Design", "Cloud Computing",
  "Machine Learning", "Cybersecurity", "Product Management", "DevOps",
  "Blockchain", "Mobile Development", "Digital Marketing", "AI Engineering",
]

export default function HomePage() {
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [userProfile, setUserProfile] = useState<any>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const checkProfile = async () => {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data: profile } = await supabase
          .from("profiles").select("role").eq("id", clerkUser.id).single()
        setUserProfile(profile)
      }
      checkProfile()
    }
  }, [clerkUser, isLoaded])

  const fade = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.12 } }),
  }

  return (
    <div className="min-h-screen bg-[#05040f] text-white overflow-hidden">

      {/* ── FLOATING NAV ─────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between px-5 h-14 rounded-2xl bg-white/6 border border-white/10 backdrop-blur-xl shadow-2xl">
          {/* Logo */}
          <motion.div
            className="font-extrabold text-xl bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            Upskillify
          </motion.div>

          {/* Links (desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            {[["Features","#features"],["How it works","#how"],["Testimonials","#testimonials"]].map(([label, href]) => (
              <a key={label} href={href} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-2">
            {isLoaded && clerkUser ? (
              <>
                <motion.button
                  onClick={() => router.push(userProfile?.role ? `/dashboard/${userProfile.role}` : "/onboarding")}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 text-sm rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium transition-colors"
                >
                  Dashboard
                </motion.button>
                <button
                  onClick={() => signOut(() => router.push("/"))}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors hidden sm:block">
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/auth/sign-up"
                    className="px-4 py-2 text-sm rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 text-white font-medium transition-opacity"
                  >
                    Get started
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-fuchsia-600/15 blur-[100px]"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />
        </div>

        <div className="text-center max-w-5xl mx-auto">
          {/* Announce badge */}
          <motion.div
            custom={0} variants={fade} initial="hidden" animate="visible"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-sm text-white/70 mb-8"
          >
            <Sparkles size={14} className="text-violet-400" />
            <span>The #1 platform for student internships</span>
            <ChevronRight size={14} className="text-violet-400" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            custom={1} variants={fade} initial="hidden" animate="visible"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
          >
            <span className="text-white">Turn Skills Into</span>
            <br />
            <span className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Real Careers.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            custom={2} variants={fade} initial="hidden" animate="visible"
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Connect with top mentors, work on live projects, earn verified certificates,
            and land your dream role — all in one place.
          </motion.p>

          {/* CTA row */}
          <motion.div
            custom={3} variants={fade} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {isLoaded && clerkUser ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => router.push(userProfile?.role ? `/dashboard/${userProfile.role}` : "/onboarding")}
                  className="px-8 py-4 rounded-2xl bg-linear-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-lg shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-shadow flex items-center gap-2 group"
                >
                  Go to Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <Link href="/internships" className="px-8 py-4 rounded-2xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 font-semibold text-lg transition-colors">
                  Browse Internships
                </Link>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/auth/sign-up"
                    className="px-8 py-4 rounded-2xl bg-linear-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-lg shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-shadow flex items-center gap-2 group"
                  >
                    Start for free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <Link href="/auth/login" className="px-8 py-4 rounded-2xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 font-semibold text-lg transition-colors">
                  Sign in
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust line */}
          <motion.p
            custom={4} variants={fade} initial="hidden" animate="visible"
            className="mt-6 text-sm text-white/30"
          >
            No credit card required · Free for students
          </motion.p>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/25 text-xs"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-white/40" />
          </motion.div>
          scroll
        </motion.div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────── */}
      <div className="border-y border-white/6 bg-white/2 overflow-hidden py-4">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-sm text-white/30 font-medium tracking-wide flex items-center gap-3">
              {item}
              <span className="text-violet-500/50">◆</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── STATS BAR ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: 500, suffix: "+", label: "Active Internships", icon: Rocket },
          { value: 2000, suffix: "+", label: "Students Placed", icon: GraduationCap },
          { value: 300, suffix: "+", label: "Expert Mentors", icon: Users },
          { value: 95, suffix: "%", label: "Success Rate", icon: TrendingUp },
        ].map(({ value, suffix, label, icon: Icon }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/4 border border-white/7 hover:border-violet-500/30 transition-colors"
          >
            <Icon size={22} className="text-violet-400 mb-3" />
            <p className="text-3xl font-black text-white">
              <Counter target={value} suffix={suffix} />
            </p>
            <p className="text-sm text-white/40 mt-1">{label}</p>
          </motion.div>
        ))}
      </section>

      {/* ── BENTO FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-12"
        >
          <p className="text-sm text-violet-400 font-semibold uppercase tracking-widest mb-3">Everything you need</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">Built for every role.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Big card — Students */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0 }}
            whileHover={{ y: -4 }}
            className="md:col-span-2 p-8 rounded-3xl bg-linear-to-br from-violet-900/40 to-violet-950/20 border border-violet-500/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-5">
              <GraduationCap size={22} className="text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">For Students</h3>
            <p className="text-white/50 leading-relaxed mb-6 max-w-md">
              Apply to curated internships, submit weekly progress, get mentored by industry experts,
              and earn blockchain-verified certificates.
            </p>
            <ul className="space-y-2">
              {["Apply in 2 clicks", "Track your progress live", "Earn verified certificates", "Build a public portfolio"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle2 size={14} className="text-violet-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <motion.div whileHover={{ x: 4 }} className="mt-6 flex items-center gap-1 text-violet-400 text-sm font-semibold cursor-pointer group/link">
              <Link href="/auth/sign-up" className="flex items-center gap-1">Explore internships <ArrowRight size={14} /></Link>
            </motion.div>
          </motion.div>

          {/* Mentors card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-linear-to-br from-emerald-900/30 to-emerald-950/10 border border-emerald-500/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-5">
              <Briefcase size={22} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">For Mentors</h3>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Post internships, review submissions, give actionable feedback, and shape the next generation.
            </p>
            <ul className="space-y-2">
              {["Manage applicants","Review work submissions","Issue certifications"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Analytics card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-linear-to-br from-fuchsia-900/30 to-fuchsia-950/10 border border-fuchsia-500/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-fuchsia-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-5">
              <BarChart3 size={22} className="text-fuchsia-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Admin Analytics</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Full-platform visibility with real-time dashboards, application funnels, and cohort reporting.
            </p>
          </motion.div>

          {/* Trust / Security card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-linear-to-br from-sky-900/30 to-sky-950/10 border border-sky-500/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-sky-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center mb-5">
              <Shield size={22} className="text-sky-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Verified by Design</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Every certificate is tamper-proof and publicly verifiable. Employers trust what we issue.
            </p>
          </motion.div>

          {/* Global access card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-linear-to-br from-orange-900/30 to-orange-950/10 border border-orange-500/20 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-orange-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-5">
              <Globe size={22} className="text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Remote-First</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              All internships are remote-friendly. Work with mentors anywhere in the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-4 bg-white/2 border-y border-white/6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16"
          >
            <p className="text-sm text-violet-400 font-semibold uppercase tracking-widest mb-3">Simple process</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">From zero to hired in<br />three steps.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-8 left-[17%] right-[17%] h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

            {[
              { step: "01", icon: Zap, title: "Create Your Profile", desc: "Sign up, set your skills and learning goals. Let us know what type of internship excites you.", color: "violet" },
              { step: "02", icon: Briefcase, title: "Apply & Get Matched", desc: "Browse real internship listings, apply with one click, and get matched to the right mentor.", color: "fuchsia" },
              { step: "03", icon: Award, title: "Complete & Earn", desc: "Deliver weekly submissions, receive feedback, complete the program, and earn your certificate.", color: "emerald" },
            ].map(({ step, icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className={`w-16 h-16 rounded-2xl bg-${color}-500/15 border border-${color}-500/25 flex items-center justify-center mb-4 relative`}>
                  <Icon size={24} className={`text-${color}-400`} />
                  <span className={`absolute -top-2 -right-2 text-[10px] font-black text-${color}-400 bg-[#05040f] px-1.5 rounded-full border border-${color}-500/30`}>{step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center mb-14"
        >
          <p className="text-sm text-violet-400 font-semibold uppercase tracking-widest mb-3">Real stories</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white">Students who made it.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: "Priya Sharma", role: "Frontend Intern → Full-time at Razorpay", stars: 5, quote: "Upskillify gave me real projects that actually showed up on my GitHub. The mentor feedback was brutally useful — in the best way." },
            { name: "Arjun Mehta", role: "Data Science Intern → SDE at Swiggy", stars: 5, quote: "I applied to 40 companies and kept getting rejected. After 8 weeks on Upskillify, I had 3 job offers. The certificate carried serious weight." },
            { name: "Sneha Iyer", role: "UI/UX Intern → Design Lead", stars: 5, quote: "The structured curriculum and mentor pairings kept me accountable. I stopped procrastinating and actually finished something. Game changer." },
          ].map(({ name, role, stars, quote }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="p-7 rounded-3xl bg-white/4 border border-white/8 hover:border-violet-500/25 transition-colors"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6">"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                  {name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{name}</p>
                  <p className="text-white/35 text-xs">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto rounded-3xl p-12 sm:p-16 text-center relative overflow-hidden bg-linear-to-br from-violet-950 to-fuchsia-950 border border-violet-500/30"
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-linear-to-br from-violet-600/20 to-fuchsia-600/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/30 rounded-full blur-[80px]" />
          </div>

          {isLoaded && clerkUser ? (
            <>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 relative">
                Welcome back, {clerkUser.firstName || "there"} 👋
              </h2>
              <p className="text-white/50 text-lg mb-8 relative">Pick up where you left off.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => router.push(userProfile?.role ? `/dashboard/${userProfile.role}` : "/onboarding")}
                  className="px-8 py-4 rounded-2xl bg-white text-violet-900 font-bold text-lg hover:bg-white/90 transition-colors"
                >
                  Go to Dashboard
                </motion.button>
                <Link href="/internships" className="px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-colors">
                  Browse Internships
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 relative">
                Your career starts<br />with one step.
              </h2>
              <p className="text-white/50 text-lg mb-8 relative">
                Join thousands of students already building real skills.
              </p>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="relative inline-block">
                <Link
                  href="/auth/sign-up"
                  className="px-10 py-4 rounded-2xl bg-white text-violet-900 font-bold text-lg hover:bg-white/90 transition-colors inline-flex items-center gap-2 group"
                >
                  Create your free account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 bg-white/1">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="md:max-w-xs">
              <h4 className="font-extrabold text-xl bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-3">
                Upskillify
              </h4>
              <p className="text-white/40 text-sm leading-relaxed">
                Bridging the gap between talent and opportunity — one internship at a time.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              {[
                { title: "Product", links: [{ label: "Internships", href: "/internships" }, { label: "Certificates", href: "/certificates" }, { label: "Progress", href: "/progress" }] },
                { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blogs" }, { label: "Careers", href: "/career" }] },
                { title: "Support", links: [{ label: "Help Center", href: "/help-center" }, { label: "Contact", href: "/contact" }, { label: "Status", href: "/status" }] },
              ].map(({ title, links }) => (
                <div key={title}>
                  <p className="text-white/60 font-semibold mb-3">{title}</p>
                  <ul className="space-y-2">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <Link href={href} className="text-white/35 hover:text-white/70 transition-colors">{label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/6 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/25">
            <p>© 2026 Upskillify. All rights reserved.</p>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/50 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
