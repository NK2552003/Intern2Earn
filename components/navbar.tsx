"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// Navbar only shows in specific layouts, main navigation moved to sidebar
export default function Navbar() {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith("/auth")

  // Return null to remove the navbar - sidebar handles navigation
  if (isAuthPage) {
    return null
  }

  return null
}
