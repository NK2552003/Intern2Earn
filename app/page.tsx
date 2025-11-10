"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Zap, Users, Award, TrendingUp, Star, ChevronDown, Rocket, GraduationCap, Briefcase } from "lucide-react"
import GlobeAnimation from "@/components/globe-animation"

export default function HomePage() {
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    if (isLoaded && clerkUser) {
      // Fetch user profile to check if they have completed onboarding
      const checkProfile = async () => {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", clerkUser.id)
          .single()

        setUserProfile(profile)
      }
      checkProfile()
    }
  }, [clerkUser, isLoaded])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <motion.nav className="bg-card border-b border-border sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div className="font-bold text-2xl bg-linear-to-r from-primary to-accent bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            Inter2Earn
          </motion.div>
          <div className="flex items-center space-x-4">
            {isLoaded && clerkUser ? (
              <>
                <motion.button
                  onClick={() => {
                    if (userProfile?.role) {
                      router.push(`/dashboard/${userProfile.role}`)
                    } else {
                      router.push("/onboarding")
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
                >
                  Dashboard
                </motion.button>
                <motion.button
                  onClick={() => signOut(() => router.push("/"))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-foreground hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/auth/sign-up"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors inline-block"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute top-10 -left-20 sm:top-20 sm:left-10 w-40 h-40 sm:w-72 sm:h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-20 -right-20 sm:top-40 sm:right-10 w-40 h-40 sm:w-72 sm:h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl"
            animate={{ y: [30, 0, 30] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <motion.div
          className="max-w-7xl mx-auto w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <motion.div variants={itemVariants} className="order-2 md:order-1">
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <Zap size={14} className="text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-primary">Launching Your Career</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                Launch Your Career with{" "}
                <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                  Real Internships
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                Connect with experienced mentors, gain practical skills, and build your professional network through
                curated internship opportunities tailored to your aspirations.
              </p>
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full xs:w-auto">
                  <Link
                    href="/auth/sign-up"
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all text-center inline-flex items-center justify-center xs:justify-start gap-2 group w-full xs:w-auto"
                  >
                    Get Started
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform hidden xs:inline" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full xs:w-auto">
                  <Link
                    href="#features"
                    className="px-6 sm:px-8 py-3 sm:py-4 border border-primary/30 text-foreground rounded-xl font-semibold hover:bg-primary/5 transition-all text-center inline-flex items-center justify-center xs:justify-start gap-2 group w-full xs:w-auto"
                  >
                    Learn More
                    <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform hidden xs:inline" />
                  </Link>
                </motion.div>
              </div>

              {/* Stats */}
              <motion.div
                className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6"
                variants={itemVariants}
              >
                {[
                  { number: "500+", label: "Internships" },
                  { number: "2K+", label: "Students" },
                  { number: "95%", label: "Success Rate" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-primary">{stat.number}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Globe Animation */}
            <motion.div
              variants={itemVariants}
              transition={{ type: "spring", stiffness: 100 }}
              className="order-1 md:order-2 w-full flex justify-center items-center"
            >
              <GlobeAnimation />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card border-y border-border py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-40 h-40 sm:w-80 sm:h-80 bg-accent/10 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">Why Choose Inter2Earn?</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              A comprehensive platform designed to connect students, mentors, and administrators for mutual growth
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* For Students */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="p-6 sm:p-8 rounded-xl border border-border bg-background hover:border-primary/30 transition-all"
            >
              <motion.div
                className="w-12 sm:w-14 h-12 sm:h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <TrendingUp size={20} className="text-blue-600 sm:w-6 sm:h-6" />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">For Students</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Gain practical experience, learn from industry experts, build your portfolio, and earn recognized certifications to boost your career.
              </p>
              <motion.div
                className="mt-4 flex items-center gap-2 text-blue-600 cursor-pointer group"
                whileHover={{ x: 5 }}
              >
                <span className="text-xs sm:text-sm font-medium">Learn more</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </motion.div>

            {/* For Mentors */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="p-6 sm:p-8 rounded-xl border border-border bg-background hover:border-primary/30 transition-all"
            >
              <motion.div
                className="w-12 sm:w-14 h-12 sm:h-14 bg-green-500/10 rounded-xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <Users size={20} className="text-green-600 sm:w-6 sm:h-6" />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">For Mentors</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Share your expertise, guide the next generation of professionals, and build a legacy of mentorship while earning recognition.
              </p>
              <motion.div
                className="mt-4 flex items-center gap-2 text-green-600 cursor-pointer group"
                whileHover={{ x: 5 }}
              >
                <span className="text-xs sm:text-sm font-medium">Learn more</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </motion.div>

            {/* For Admins */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="p-6 sm:p-8 rounded-xl border border-border bg-background hover:border-primary/30 transition-all"
            >
              <motion.div
                className="w-12 sm:w-14 h-12 sm:h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <Award size={20} className="text-purple-600 sm:w-6 sm:h-6" />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3">For Admins</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Manage the entire platform with powerful analytics, review applications, issue certifications, and oversee all activities seamlessly.
              </p>
              <motion.div
                className="mt-4 flex items-center gap-2 text-purple-600 cursor-pointer group"
                whileHover={{ x: 5 }}
              >
                <span className="text-xs sm:text-sm font-medium">Learn more</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 w-full">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { number: "500+", label: "Active Internships", Icon: Rocket },
            { number: "2000+", label: "Students", Icon: GraduationCap },
            { number: "300+", label: "Mentors", Icon: Briefcase },
            { number: "95%", label: "Success Rate", Icon: Star },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
            >
              <div className="text-2xl sm:text-3xl mb-2"><stat.Icon className="w-8 sm:w-10 h-8 sm:h-10 mx-auto" /></div>
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">{stat.number}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section - Conditional for logged-in/non-logged-in users */}
      <section className="bg-linear-to-r from-primary/10 to-accent/10 border-t border-border py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 -z-10 overflow-hidden"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-accent/10 rounded-full -mr-16 sm:-mr-32 -mt-16 sm:-mt-32" />
        </motion.div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {isLoaded && clerkUser ? (
              // Content for logged-in users
              <>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                  Welcome Back, {clerkUser.firstName || "User"}! 👋
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
                  Continue your journey towards success. Explore new internships, connect with mentors, and track your progress.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <button
                      onClick={() => {
                        if (userProfile?.role) {
                          router.push(`/dashboard/${userProfile.role}`)
                        } else {
                          router.push("/onboarding")
                        }
                      }}
                      className="px-6 sm:px-10 py-3 sm:py-4 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center sm:justify-start gap-2 group"
                    >
                      Go to Dashboard
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform hidden sm:inline" />
                    </button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/internships"
                      className="px-6 sm:px-10 py-3 sm:py-4 border border-primary/30 text-foreground rounded-xl font-semibold hover:bg-primary/5 transition-all inline-flex items-center justify-center sm:justify-start gap-2 group"
                    >
                      Browse Internships
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform hidden sm:inline" />
                    </Link>
                  </motion.div>
                </div>
              </>
            ) : (
              // Content for non-logged-in users
              <>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">Ready to Start Your Journey?</h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
                  Join thousands of students and mentors transforming careers on Inter2Earn. Start today!
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/auth/sign-up"
                    className="px-6 sm:px-10 py-3 sm:py-4 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center sm:justify-start gap-2 group"
                  >
                    Create Your Account Now
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform hidden sm:inline" />
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className="bg-card border-t border-border py-8 sm:py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-6 sm:mb-8">
            <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="md:w-1/3">
              <h4 className="font-bold text-foreground mb-3 sm:mb-4 text-base sm:text-lg">Inter2Earn</h4>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Connecting students with mentors for real-world learning experiences and career growth.
              </p>
              <div className="flex gap-3 mt-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer"
                  />
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 sm:gap-8 md:w-1/2 md:justify-end">
              {[
                { 
                  title: "Company", 
                  links: [
                    { label: "About", href: "/about" },
                    { label: "Blog", href: "/blogs" },
                    { label: "Careers", href: "/career" }
                  ] 
                },
                { 
                  title: "Support", 
                  links: [
                    { label: "Help Center", href: "/help-center" },
                    { label: "Contact", href: "/contact" },
                    { label: "Status", href: "/status" }
                  ] 
                },
              ].map((section, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h4 className="font-bold text-foreground mb-3 text-sm sm:text-base">{section.title}</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm inline-block"
                        >
                          <motion.span whileHover={{ x: 4 }} className="inline-block">
                            {link.label}
                          </motion.span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="border-t border-border pt-6 sm:pt-8 text-center text-muted-foreground text-xs sm:text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2025 Inter2Earn. All rights reserved.</p>
            <div className="flex justify-center gap-2 sm:gap-4 mt-4 text-xs flex-wrap">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span className="hidden sm:inline">•</span>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <span className="hidden sm:inline">•</span>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  )
}
