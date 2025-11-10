"use client"

import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Send, Linkedin, Twitter } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log(formData)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const contactInfo = [
    { icon: Mail, title: "Email", value: "hello@inter2earn.com", href: "mailto:hello@inter2earn.com" },
    { icon: Phone, title: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: MapPin, title: "Address", value: "123 Tech Street, San Francisco, CA", href: "#" },
  ]

  const social = [
    { icon: Linkedin, href: "#" },
    { icon: Twitter, href: "#" },
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
              Get in <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Contact Form */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="p-6 sm:p-8 rounded-xl border border-border bg-card"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary resize-none"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-full px-6 py-3 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  Send Message
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6 sm:space-y-8"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Have any questions? We're here to help. Feel free to reach out to us through any of these channels.
                </p>
              </div>

              <motion.div className="space-y-6" variants={containerVariants}>
                {contactInfo.map((info, idx) => (
                  <motion.a
                    key={idx}
                    variants={itemVariants}
                    href={info.href}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-all group cursor-pointer"
                  >
                    <info.icon className="w-6 h-6 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{info.title}</p>
                      <p className="text-muted-foreground text-sm">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
              </motion.div>

              {/* Social Links */}
              <div className="pt-8 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Follow us</h3>
                <div className="flex gap-4">
                  {social.map((link, idx) => (
                    <motion.a
                      key={idx}
                      href={link.href}
                      whileHover={{ scale: 1.2, y: -2 }}
                      className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <link.icon size={20} className="text-primary" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
