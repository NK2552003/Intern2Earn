"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Briefcase, MapPin, Clock } from "lucide-react"

export default function CareerPage() {
  const jobs = [
    {
      id: 1,
      title: "Senior Product Manager",
      company: "Inter2Earn",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Lead our product strategy and vision for the next generation of learning platform.",
      skills: ["Product Strategy", "Data Analysis", "Leadership"],
    },
    {
      id: 2,
      title: "Full-stack Developer",
      company: "Inter2Earn",
      location: "Remote",
      type: "Full-time",
      description: "Build and scale our platform with modern web technologies.",
      skills: ["Next.js", "React", "Node.js", "PostgreSQL"],
    },
    {
      id: 3,
      title: "Community Manager",
      company: "Inter2Earn",
      location: "New York, NY",
      type: "Full-time",
      description: "Build and nurture our vibrant community of students and mentors.",
      skills: ["Community Building", "Social Media", "Events Management"],
    },
    {
      id: 4,
      title: "Marketing Manager",
      company: "Inter2Earn",
      location: "Los Angeles, CA",
      type: "Full-time",
      description: "Drive growth and brand awareness across multiple channels.",
      skills: ["Digital Marketing", "Content Strategy", "Analytics"],
    },
    {
      id: 5,
      title: "Data Analyst",
      company: "Inter2Earn",
      location: "Remote",
      type: "Full-time",
      description: "Analyze user behavior and drive data-informed decisions.",
      skills: ["Python", "SQL", "Data Visualization", "Statistics"],
    },
    {
      id: 6,
      title: "UI/UX Designer",
      company: "Inter2Earn",
      location: "Remote",
      type: "Full-time",
      description: "Design beautiful and intuitive user experiences.",
      skills: ["Figma", "User Research", "Design Systems", "Prototyping"],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            className="absolute top-10 -left-20 w-40 h-40 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -right-20 top-40 w-40 h-40 sm:w-72 sm:h-72 bg-accent/10 rounded-full blur-3xl"
            animate={{ y: [30, 0, 30] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Join Our <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Team</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Help us transform careers and build the future of learning.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 sm:p-8 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>

                <p className="text-muted-foreground mb-4 text-sm sm:text-base">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={16} />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={16} />
                    {job.type}
                  </div>
                </div>

                <motion.div whileHover={{ x: 4 }}>
                  <button className="flex items-center gap-2 text-primary hover:gap-3 transition-all text-sm font-medium">
                    Apply Now
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            className="mt-12 sm:mt-16 text-center p-6 sm:p-8 rounded-xl border border-border bg-card"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground mb-4">Don't see what you're looking for?</p>
            <p className="font-semibold text-foreground">Send us your resume and tell us what you're interested in!</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-4">
              <Link
                href="/contact"
                className="px-6 sm:px-10 py-3 sm:py-4 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2 group"
              >
                Contact Us
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
