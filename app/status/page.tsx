"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function StatusPage() {
  const services = [
    {
      name: "Web Application",
      status: "operational",
      uptime: "99.98%",
      lastIncident: "Nov 5, 2025",
    },
    {
      name: "API",
      status: "operational",
      uptime: "99.95%",
      lastIncident: "Nov 3, 2025",
    },
    {
      name: "Dashboard",
      status: "operational",
      uptime: "99.99%",
      lastIncident: "Oct 28, 2025",
    },
    {
      name: "Email Service",
      status: "operational",
      uptime: "99.90%",
      lastIncident: "Oct 20, 2025",
    },
    {
      name: "Payment Processing",
      status: "operational",
      uptime: "99.99%",
      lastIncident: "Oct 15, 2025",
    },
    {
      name: "Analytics",
      status: "operational",
      uptime: "99.85%",
      lastIncident: "Oct 10, 2025",
    },
  ]

  const incidents = [
    {
      date: "Nov 8, 2025",
      title: "Minor API Performance Degradation",
      status: "resolved",
      duration: "30 minutes",
      description: "Temporary slowdown in API response times. Issue has been fully resolved.",
    },
    {
      date: "Oct 25, 2025",
      title: "Scheduled Maintenance",
      status: "resolved",
      duration: "2 hours",
      description: "Regular database maintenance and updates. All systems restored.",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500/10 border-green-500/20 text-green-600"
      case "degraded":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-600"
      case "offline":
        return "bg-red-500/10 border-red-500/20 text-red-600"
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle size={20} />
      case "degraded":
        return <AlertCircle size={20} />
      case "offline":
        return <AlertCircle size={20} />
      default:
        return <Clock size={20} />
    }
  }

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
              System <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">Status</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Monitor the real-time status of all Inter2Earn services.
            </p>

            {/* Overall Status */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/10 border border-green-500/20 mx-auto"
            >
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-semibold text-green-600">All Systems Operational</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Service Status</h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-4 sm:p-6 rounded-lg border border-border bg-background hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg border ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{service.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">Last incident: {service.lastIncident}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 sm:text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Uptime (30 days)</p>
                      <p className="font-semibold text-foreground">{service.uptime}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Incident History</h2>
            <p className="text-muted-foreground">Recent incidents and maintenance</p>
          </motion.div>

          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {incidents.map((incident, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="p-6 sm:p-8 rounded-lg border border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{incident.title}</h3>
                    <p className="text-sm text-muted-foreground">{incident.date}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-600">
                      {incident.status}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-600">
                      {incident.duration}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground">{incident.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Subscribe for Updates */}
      <section className="bg-linear-to-r from-primary/10 to-accent/10 border-t border-border py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Stay Updated</h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Subscribe to receive notifications about service status and maintenance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary"
              />
              <button className="px-6 py-3 bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
