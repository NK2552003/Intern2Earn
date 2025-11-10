"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Clock,
  Award,
  User,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  CheckCircle,
  BookOpen,
  BarChart3,
  ChevronRight,
  Plus,
  MoreHorizontal,
} from "lucide-react"

interface SidebarProps {
  role: "student" | "mentor" | "admin"
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  category?: string
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { user: clerkUser } = useUser()
  const { signOut } = useClerk()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      if (isMobileView) {
        setIsExpanded(false)
        setIsManuallyExpanded(false)
      } else {
        setIsExpanded(true)
        setIsManuallyExpanded(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const getProfile = async () => {
      if (!clerkUser) return
      try {
        const supabase = createClient()
        const { data } = await supabase.from("profiles").select("*").eq("id", clerkUser.id).single()
        setUserProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }
    getProfile()
  }, [clerkUser])

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case "student":
        return [
          { href: "/dashboard/student", label: "Dashboard", icon: <LayoutDashboard size={20} />, category: "main" },
          { href: "/internships", label: "Browse Internships", icon: <Briefcase size={20} />, category: "explore" },
          { href: "/applications", label: "My Applications", icon: <FileText size={20} />, category: "explore" },
          { href: "/submissions", label: "Submissions", icon: <CheckCircle size={20} />, category: "work" },
          { href: "/progress", label: "Track Progress", icon: <Clock size={20} />, category: "work" },
          { href: "/certificates", label: "Certificates", icon: <Award size={20} />, category: "achievements" },
          { href: "/profile", label: "Profile", icon: <User size={20} />, category: "account" },
        ]
      case "mentor":
        return [
          { href: "/dashboard/mentor", label: "Dashboard", icon: <LayoutDashboard size={20} />, category: "main" },
          { href: "/internships/manage", label: "My Internships", icon: <Briefcase size={20} />, category: "manage" },
          { href: "/applicants", label: "Applicants", icon: <Users size={20} />, category: "manage" },
          { href: "/submissions/review", label: "Reviews", icon: <CheckCircle size={20} />, category: "manage" },
          { href: "/students", label: "My Students", icon: <BookOpen size={20} />, category: "manage" },
          { href: "/profile", label: "Profile", icon: <User size={20} />, category: "account" },
        ]
      case "admin":
        return [
          { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard size={20} />, category: "main" },
          { href: "/admin/users", label: "User Management", icon: <Users size={20} />, category: "manage" },
          { href: "/admin/internships", label: "Internships", icon: <Briefcase size={20} />, category: "manage" },
          { href: "/admin/applications", label: "Applications", icon: <FileText size={20} />, category: "manage" },
          { href: "/admin/reports", label: "Reports & Analytics", icon: <BarChart3 size={20} />, category: "insights" },
          { href: "/admin/settings", label: "Settings", icon: <Settings size={20} />, category: "account" },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()
  
  // Group items by category
  const groupedItems = navItems.reduce((acc, item) => {
    const category = item.category || "other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, NavItem[]>)

  const categoryLabels: Record<string, string> = {
    main: "Main",
    explore: "Explore",
    manage: "Manage",
    work: "Work",
    achievements: "Achievements",
    insights: "Insights",
    account: "Account",
  }

  const categoryOrder = ["main", "explore", "manage", "work", "achievements", "insights", "account"]

  const handleToggleExpand = () => {
    setIsManuallyExpanded(!isManuallyExpanded)
    setIsExpanded(!isExpanded)
  }

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" })
  }

  // Determine sidebar state based on hover and manual expansion
  const shouldShowExpanded = isMobile ? isExpanded : isManuallyExpanded || isHovering

  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "80px" },
  }

  const textVariants = {
    expanded: { opacity: 1, width: "auto", display: "block" },
    collapsed: { opacity: 0, width: 0, display: "none" },
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-lg"
        >
          {isExpanded ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={shouldShowExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
        className="bg-card border-r border-border min-h-screen sticky top-0 flex flex-col overflow-hidden shadow-xl z-40"
      >
        {/* Top Section with Logo and User */}
        <div className="px-3 pt-4 pb-4 border-b border-border space-y-4">
          {/* Logo - Always visible but constrained */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-linear-to-r from-primary/10 to-primary/5 hover:bg-primary/15 transition-colors group ${
              !shouldShowExpanded ? "justify-center" : ""
            }`}
          >
            <div className="p-2 rounded-lg bg-primary text-primary-foreground group-hover:shadow-lg transition-shadow shrink-0">
              <Home size={20} />
            </div>
            <motion.div
              animate={shouldShowExpanded ? "expanded" : "collapsed"}
              variants={textVariants}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap overflow-hidden"
            >
              <p className="text-sm font-bold text-foreground">Inter2Earn</p>
              <p className="text-xs text-muted-foreground">Platform</p>
            </motion.div>
          </Link>

          {/* User Profile Section */}
          {clerkUser && userProfile && (
            <motion.div
              animate={shouldShowExpanded ? "expanded" : "collapsed"}
              variants={{
                expanded: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/50 transition-all group relative ${
                !shouldShowExpanded ? "justify-center" : ""
              }`}>
                <div className="shrink-0 relative">
                  {clerkUser.imageUrl ? (
                    <img
                      src={clerkUser.imageUrl}
                      alt={clerkUser.fullName || "User"}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/50 group-hover:border-primary transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-bold border border-primary/30">
                      {clerkUser.firstName?.charAt(0)}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card"></div>
                </div>

                <motion.div
                  animate={shouldShowExpanded ? "expanded" : "collapsed"}
                  variants={textVariants}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0 text-left whitespace-nowrap overflow-hidden"
                >
                  <p className="text-sm font-semibold text-foreground truncate">{clerkUser.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile?.role || "User"}</p>
                </motion.div>

                <motion.div
                  animate={shouldShowExpanded ? "expanded" : "collapsed"}
                  variants={textVariants}
                  transition={{ duration: 0.2 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <MoreHorizontal size={16} className="text-muted-foreground" />
                </motion.div>
              </button>
            </motion.div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          <AnimatePresence mode="wait">
            {categoryOrder.map((category) => {
              const items = groupedItems[category]
              if (!items || items.length === 0) return null

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {/* Category Label */}
                  <AnimatePresence>
                    {shouldShowExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-3">
                          {categoryLabels[category]}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Nav Items */}
                  {items.map((item, idx) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onMouseEnter={() => setHoveredItem(item.href)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative whitespace-nowrap ${
                            !shouldShowExpanded ? "justify-center" : ""
                          } ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : "text-foreground hover:bg-secondary/40"
                          }`}
                          title={!shouldShowExpanded ? item.label : undefined}
                        >
                          <div className={`shrink-0 transition-colors ${isActive ? "" : "group-hover:text-primary"}`}>
                            {item.icon}
                          </div>
                          <motion.span
                            animate={shouldShowExpanded ? "expanded" : "collapsed"}
                            variants={textVariants}
                            transition={{ duration: 0.2 }}
                            className="text-sm font-medium overflow-hidden"
                          >
                            {item.label}
                          </motion.span>

                          {shouldShowExpanded && isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 shrink-0"
                            >
                              <ChevronRight size={16} className="text-primary-foreground" />
                            </motion.div>
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border p-3 space-y-2">
          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            animate={shouldShowExpanded ? "expanded" : "collapsed"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              shouldShowExpanded
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                : "text-red-500 justify-center"
            }`}
            title={!shouldShowExpanded ? "Logout" : undefined}
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform shrink-0" />
            <motion.span
              animate={shouldShowExpanded ? "expanded" : "collapsed"}
              variants={textVariants}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              Logout
            </motion.span>
          </motion.button>

          {/* Collapse/Expand Toggle for Desktop */}
          {!isMobile && (
            <motion.button
              onClick={handleToggleExpand}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary/50 transition-all duration-200 text-sm justify-center"
              title={isManuallyExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isManuallyExpanded ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          )}
        </div>
      </motion.aside>
    </>
  )
}
