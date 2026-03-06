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
  ChevronLeft,
  Plus,
  Bell,
  GraduationCap,
  Shield,
  TrendingUp,
  Zap,
  Star,
} from "lucide-react"

interface SidebarProps {
  role: "student" | "mentor" | "admin"
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string | number
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

// Role-specific theming
const ROLE_CONFIG = {
  student: {
    accent: "violet",
    label: "Student",
    icon: <GraduationCap size={14} />,
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    activeBg: "bg-violet-500/10",
    activeBorder: "border-l-violet-500",
    activeText: "text-violet-300",
    activeIcon: "text-violet-400",
    activeShadow: "shadow-violet-500/10",
    hoverBg: "hover:bg-violet-500/5",
    cta: "bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500",
    ctaLabel: "New Application",
    ctaHref: "/internships",
    glow: "bg-violet-500/5",
    ring: "ring-violet-500/40",
  },
  mentor: {
    accent: "emerald",
    label: "Mentor",
    icon: <Star size={14} />,
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    activeBg: "bg-emerald-500/10",
    activeBorder: "border-l-emerald-500",
    activeText: "text-emerald-300",
    activeIcon: "text-emerald-400",
    activeShadow: "shadow-emerald-500/10",
    hoverBg: "hover:bg-emerald-500/5",
    cta: "bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
    ctaLabel: "Post Internship",
    ctaHref: "/internships/manage",
    glow: "bg-emerald-500/5",
    ring: "ring-emerald-500/40",
  },
  admin: {
    accent: "fuchsia",
    label: "Admin",
    icon: <Shield size={14} />,
    badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
    activeBg: "bg-fuchsia-500/10",
    activeBorder: "border-l-fuchsia-500",
    activeText: "text-fuchsia-300",
    activeIcon: "text-fuchsia-400",
    activeShadow: "shadow-fuchsia-500/10",
    hoverBg: "hover:bg-fuchsia-500/5",
    cta: "bg-linear-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500",
    ctaLabel: "View Reports",
    ctaHref: "/admin/reports",
    glow: "bg-fuchsia-500/5",
    ring: "ring-fuchsia-500/40",
  },
} as const

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const { user: clerkUser } = useUser()
  const { signOut } = useClerk()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const config = ROLE_CONFIG[role]

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsMobileOpen(false)
      }
    }
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

  const getNavGroups = (): NavGroup[] => {
    switch (role) {
      case "student":
        return [
          {
            id: "main",
            label: "Overview",
            items: [
              { href: "/dashboard/student", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            ],
          },
          {
            id: "explore",
            label: "Explore",
            items: [
              { href: "/internships", label: "Browse Internships", icon: <Briefcase size={18} /> },
              { href: "/applications", label: "My Applications", icon: <FileText size={18} /> },
            ],
          },
          {
            id: "work",
            label: "Work",
            items: [
              { href: "/submissions", label: "Submissions", icon: <CheckCircle size={18} /> },
              { href: "/progress", label: "Track Progress", icon: <TrendingUp size={18} /> },
            ],
          },
          {
            id: "achievements",
            label: "Achievements",
            items: [
              { href: "/certificates", label: "Certificates", icon: <Award size={18} /> },
            ],
          },
          {
            id: "account",
            label: "Account",
            items: [
              { href: "/profile", label: "My Profile", icon: <User size={18} /> },
            ],
          },
        ]
      case "mentor":
        return [
          {
            id: "main",
            label: "Overview",
            items: [
              { href: "/dashboard/mentor", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            ],
          },
          {
            id: "manage",
            label: "Manage",
            items: [
              { href: "/internships/manage", label: "My Internships", icon: <Briefcase size={18} /> },
              { href: "/applicants", label: "Applicants", icon: <Users size={18} /> },
              { href: "/submissions/review", label: "Reviews", icon: <CheckCircle size={18} /> },
            ],
          },
          {
            id: "students",
            label: "Students",
            items: [
              { href: "/students", label: "My Students", icon: <BookOpen size={18} /> },
              { href: "/progress", label: "Student Progress", icon: <TrendingUp size={18} /> },
            ],
          },
          {
            id: "account",
            label: "Account",
            items: [
              { href: "/profile", label: "My Profile", icon: <User size={18} /> },
            ],
          },
        ]
      case "admin":
        return [
          {
            id: "main",
            label: "Overview",
            items: [
              { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
            ],
          },
          {
            id: "platform",
            label: "Platform",
            items: [
              { href: "/admin/users", label: "User Management", icon: <Users size={18} /> },
              { href: "/admin/internships", label: "Internships", icon: <Briefcase size={18} /> },
              { href: "/admin/applications", label: "Applications", icon: <FileText size={18} /> },
            ],
          },
          {
            id: "insights",
            label: "Insights",
            items: [
              { href: "/admin/reports", label: "Reports & Analytics", icon: <BarChart3 size={18} /> },
            ],
          },
          {
            id: "system",
            label: "System",
            items: [
              { href: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
            ],
          },
        ]
      default:
        return []
    }
  }

  const navGroups = getNavGroups()

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" })
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header: Logo + Collapse */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/6 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group min-w-0">
          <div className={`shrink-0 w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow`}>
            <Zap size={18} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold bg-linear-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent leading-tight">Upskillify</p>
              <p className="text-[10px] text-white/30 leading-tight tracking-wide">Internship Platform</p>
            </div>
          )}
        </Link>

        {/* Collapse toggle - desktop only */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/6 transition-all shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/6 transition-all"
            title="Expand sidebar"
          >
            <Menu size={16} />
          </button>
        )}
      </div>

      {/* CTA Quick Action */}
      {!isCollapsed && (
        <div className="px-3 pt-4 pb-2">
          <Link
            href={config.ctaHref}
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-200 ${config.cta}`}
          >
            <Plus size={16} />
            {config.ctaLabel}
          </Link>
        </div>
      )}
      {isCollapsed && (
        <div className="px-3 pt-4 pb-2">
          <Link
            href={config.ctaHref}
            className={`flex items-center justify-center w-9 h-9 mx-auto rounded-xl text-white shadow-lg transition-all duration-200 ${config.cta}`}
            title={config.ctaLabel}
          >
            <Plus size={16} />
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-none">
        {navGroups.map((group) => (
          <div key={group.id}>
            {/* Group label */}
            {!isCollapsed && (
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
            )}
            {isCollapsed && <div className="h-px bg-white/6 mb-2 mx-1" />}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      relative flex items-center gap-3 rounded-xl transition-all duration-150
                      ${isCollapsed ? "w-9 h-9 mx-auto justify-center" : "px-3 py-2.5"}
                      ${isActive
                        ? `${config.activeBg} ${config.activeText} border-l-2 ${config.activeBorder} shadow-sm ${config.activeShadow} pl-2.5`
                        : `text-white/55 border-l-2 border-l-transparent hover:text-white/90 hover:bg-white/5 ${isCollapsed ? "" : "pl-2.5"}`
                      }
                    `}
                  >
                    <span className={`shrink-0 transition-colors ${isActive ? config.activeIcon : ""}`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm font-medium leading-none flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${isActive ? config.badge : "bg-white/8 text-white/50 border-white/10"}`}>
                        {item.badge}
                      </span>
                    )}
                    {!isCollapsed && isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${config.activeIcon.replace("text-", "bg-")} shrink-0`} />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: User Card */}
      <div className="border-t border-white/6 p-3 space-y-1">
        {/* User info */}
        {clerkUser && (
          <div className={`flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/4 transition-colors group ${isCollapsed ? "justify-center" : ""}`}>
            <div className="relative shrink-0">
              {clerkUser.imageUrl ? (
                <img
                  src={clerkUser.imageUrl}
                  alt={clerkUser.fullName || "User"}
                  className={`rounded-full object-cover border-2 transition-all ${isCollapsed ? "w-8 h-8" : "w-9 h-9"} border-white/10 group-hover:ring-2 ${config.ring}`}
                />
              ) : (
                <div className={`rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold border border-violet-500/30 ${isCollapsed ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm"}`}>
                  {getInitials(clerkUser.fullName)}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#05040f]" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">{clerkUser.fullName || "User"}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${config.badge}`}>
                    {config.icon}
                    {config.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 group ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut size={16} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
          {!isCollapsed && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <motion.button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-linear-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed inset-y-0 left-0 w-72 z-50 bg-[#05040f] border-r border-white/6 shadow-2xl shadow-black/60 overflow-hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col min-h-screen sticky top-0 bg-[#05040f] border-r border-white/6 shadow-xl shadow-black/30 z-30 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>
    </>
  )
}

