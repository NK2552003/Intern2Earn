"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, User, Search, BookOpen, Zap, Users, Briefcase, Lightbulb } from "lucide-react"
import { useState } from "react"

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const blogs = [
    {
      id: 1,
      title: "How to Land Your First Internship",
      excerpt: "A comprehensive guide to preparing for and successfully landing your first internship opportunity.",
      date: "Nov 10, 2025",
      author: "Sarah Johnson",
      category: "Career Tips",
      icon: BookOpen,
    },
    {
      id: 2,
      title: "The Art of Mentorship: For Mentors",
      excerpt: "Learn how to be an effective mentor and make a lasting impact on the next generation of professionals.",
      date: "Nov 8, 2025",
      author: "Michael Chen",
      category: "Mentorship",
      icon: Users,
    },
    {
      id: 3,
      title: "Building Your Professional Network",
      excerpt: "Discover effective strategies to expand your professional network and create meaningful connections.",
      date: "Nov 5, 2025",
      author: "Emily Rodriguez",
      category: "Professional Growth",
      icon: Briefcase,
    },
    {
      id: 4,
      title: "Remote Work: Thriving in a Virtual Environment",
      excerpt: "Best practices for productivity, communication, and collaboration when working remotely.",
      date: "Nov 1, 2025",
      author: "James Wilson",
      category: "Work Culture",
      icon: Lightbulb,
    },
    {
      id: 5,
      title: "Interview Preparation Guide",
      excerpt: "Master the art of interviews with our comprehensive preparation guide and common questions.",
      date: "Oct 28, 2025",
      author: "Lisa Anderson",
      category: "Career Tips",
      icon: User,
    },
    {
      id: 6,
      title: "Tech Skills That Employers Want in 2025",
      excerpt: "The most in-demand technical skills for 2025 and how to develop them.",
      date: "Oct 25, 2025",
      author: "David Kumar",
      category: "Technical Skills",
      icon: Zap,
    },
  ]

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Our <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Insights, tips, and stories from the Inter2Earn community.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all group cursor-pointer"
                >
                  <div className="p-6 sm:p-8">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <blog.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                      <p className="text-xs font-medium text-primary">{blog.category}</p>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{blog.excerpt}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {blog.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {blog.author}
                      </div>
                    </div>

                    <motion.div whileHover={{ x: 4 }} className="mt-4">
                      <button className="flex items-center gap-2 text-primary hover:gap-3 transition-all text-sm font-medium">
                        Read More
                        <ArrowRight size={14} />
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No articles found matching your search.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
