"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import Sidebar from "@/components/sidebar"
import {
  Search,
  Users,
  UserCog,
  UserCheck,
  Trash2,
  MoreHorizontal,
  Filter,
  Calendar,
  Mail,
} from "lucide-react"

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

export default function UsersPage() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  useEffect(() => {
    const getData = async () => {
      if (!isLoaded) {
        return
      }

      if (!clerkUser) {
        router.push("/auth/login")
        return
      }

      const supabase = createClient()

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", clerkUser.id)
        .single()

      if (profileError || !profile || !profile.role) {
        router.replace("/onboarding")
        return
      }

      if (profile.role !== "admin") {
        router.replace("/dashboard/student")
        return
      }

      setUser(clerkUser)

      const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      setUsers(usersData || [])
      setFilteredUsers(usersData || [])
      setIsLoading(false)
    }

    getData()
  }, [router, isLoaded, clerkUser])

  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, roleFilter, users])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <UserCheck className="w-4 h-4" />
      case "mentor":
        return <UserCog className="w-4 h-4" />
      case "admin":
        return <Users className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "mentor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const userStats = [
    {
      label: "Total Users",
      value: users.length,
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-500",
    },
    {
      label: "Students",
      value: users.filter((u) => u.role === "student").length,
      icon: <UserCheck className="w-5 h-5" />,
      color: "bg-green-500",
    },
    {
      label: "Mentors",
      value: users.filter((u) => u.role === "mentor").length,
      icon: <UserCog className="w-5 h-5" />,
      color: "bg-purple-500",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role === "admin").length,
      icon: <Users className="w-5 h-5" />,
      color: "bg-orange-500",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar role="admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h1 className="text-4xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground mt-2">Manage all platform users, students, mentors, and admins</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {userStats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-2 rounded-lg text-white`}>{stat.icon}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-lg p-6 mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Filters</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Search Users</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by email or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Filter by Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="mentor">Mentors</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Users Table */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border bg-secondary">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, idx) => (
                          <motion.tr
                            key={u.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b border-border hover:bg-secondary transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                  {u.full_name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <span className="text-sm font-medium text-foreground">{u.full_name || "N/A"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                {u.email}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleColor(
                                  u.role,
                                )}`}
                              >
                                {getRoleIcon(u.role)}
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(u.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No users found matching your filters</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Results Count */}
            {filteredUsers.length > 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground mt-4"
              >
                Showing {filteredUsers.length} of {users.length} users
              </motion.p>
            )}
          </div>
      </main>
    </div>
  )
}
