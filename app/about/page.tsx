"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Users, Target, Award, Heart, ArrowRight, Zap, Briefcase, Code, UserCheck } from "lucide-react"

export default function AboutPage() {
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

  const team = [
    { name: "Nitish Kumar", role: "Founder & CEO", icon: Briefcase },
    { name: "Priya Singh", role: "Product Lead", icon: Target },
    { name: "Rahul Patel", role: "Tech Lead", icon: Code },
    { name: "Anjali Sharma", role: "Community Manager", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
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

        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
              <Zap size={14} className="text-primary shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-primary">About Inter2Earn</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Connecting Talent with{" "}
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Opportunity</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Our mission is to bridge the gap between aspirational students and experienced mentors, creating real-world learning experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-card border-y border-border py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-xl border border-border bg-background">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower students with practical experience and mentorship from industry experts, enabling them to build successful careers while connecting mentors with talented individuals eager to grow.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-xl border border-border bg-background">
              <Award className="w-12 h-12 text-accent mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the most trusted platform for internship opportunities and mentorship, where students transform into confident professionals and mentors shape the future of their industries.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-base sm:text-lg text-muted-foreground">The principles that guide everything we do</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: Heart, title: "Integrity", desc: "We believe in honesty and transparency" },
              { icon: Users, title: "Community", desc: "We foster meaningful connections" },
              { icon: Award, title: "Excellence", desc: "We strive for the highest quality" },
              { icon: Zap, title: "Innovation", desc: "We embrace continuous improvement" },
            ].map((value, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 rounded-xl border border-border hover:border-primary/30 transition-all text-center"
              >
                <value.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-card border-y border-border py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Our Team</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Meet the people building Inter2Earn</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl border border-border text-center hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <member.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-primary/10 to-accent/10 border-t border-border py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Join Our Community</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">Be part of something bigger. Transform careers. Create opportunities.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/auth/sign-up"
                className="px-6 sm:px-10 py-3 sm:py-4 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2 group"
              >
                Get Started Today
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
