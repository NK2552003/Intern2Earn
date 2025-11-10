"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronDown, HelpCircle, MessageSquare, Phone } from "lucide-react"
import { useState } from "react"

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      id: 1,
      question: "How do I create an account?",
      answer: "Click on 'Sign Up' and fill in your details. You'll need to verify your email to complete the registration process.",
    },
    {
      id: 2,
      question: "What is the cost of using Inter2Earn?",
      answer: "Inter2Earn is completely free for students. Mentors can also use our platform free of charge.",
    },
    {
      id: 3,
      question: "How do I find an internship?",
      answer: "Browse our internship listings, filter by your interests and skills, and apply directly through the platform. Mentors can help guide your selection.",
    },
    {
      id: 4,
      question: "How does mentorship work?",
      answer: "Students can request mentorship from professionals in their field. Once accepted, you'll have regular sessions to discuss your career growth.",
    },
    {
      id: 5,
      question: "Can I apply for multiple internships?",
      answer: "Yes, you can apply for multiple internships simultaneously. However, you can only work on one internship at a time.",
    },
    {
      id: 6,
      question: "How do I report an issue?",
      answer: "Use our contact form or email support@inter2earn.com with details about your issue. Our team will respond within 24 hours.",
    },
  ]

  const support = [
    { icon: MessageSquare, title: "Email Support", desc: "support@inter2earn.com", action: "Send Email" },
    { icon: Phone, title: "Live Chat", desc: "Chat with our team in real-time", action: "Start Chat" },
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
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
              Help <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Find answers to common questions and get support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {support.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 sm:p-8 rounded-xl border border-border bg-background hover:border-primary/30 transition-all text-center"
              >
                <item.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-6">{item.desc}</p>
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-medium">
                  {item.action}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                variants={itemVariants}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-card transition-colors text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openFaq === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} className="text-primary" />
                  </motion.div>
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: openFaq === faq.id ? "auto" : 0,
                    opacity: openFaq === faq.id ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 text-muted-foreground border-t border-border bg-card">{faq.answer}</div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="bg-linear-to-r from-primary/10 to-accent/10 border-t border-border py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Still need help?</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">Our support team is ready to assist you.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact"
                className="px-6 sm:px-10 py-3 sm:py-4 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-lg transition-all inline-block"
              >
                Contact Support
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
