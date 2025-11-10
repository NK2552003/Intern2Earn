# Sidebar Component - Developer Documentation

## Component Overview

The redesigned `Sidebar` component is a ChatGPT-style navigation sidebar with categorized items, smooth animations, and responsive behavior.

## File Location
```
/components/sidebar.tsx
```

## Props

### SidebarProps
```tsx
interface SidebarProps {
  role: "student" | "mentor" | "admin"
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `role` | `"student" \| "mentor" \| "admin"` | Yes | User role that determines which navigation items are displayed |

## State Management

### Internal State
```tsx
const [isExpanded, setIsExpanded] = useState(true)
const [userProfile, setUserProfile] = useState<any>(null)
const [isMobile, setIsMobile] = useState(false)
const [hoveredItem, setHoveredItem] = useState<string | null>(null)
```

| State | Type | Purpose |
|-------|------|---------|
| `isExpanded` | `boolean` | Controls sidebar expand/collapse state |
| `userProfile` | `object \| null` | Stores user profile data from Supabase |
| `isMobile` | `boolean` | Tracks if viewport is mobile-sized |
| `hoveredItem` | `string \| null` | Tracks which item is currently hovered (future use) |

## Data Structures

### NavItem Interface
```tsx
interface NavItem {
  href: string           // Route path
  label: string          // Display label
  icon: React.ReactNode  // Lucide icon component
  category?: string      // Category for grouping (optional)
}
```

### Categories Supported
```tsx
"main"         // Main dashboard and overview
"explore"      // Browse and discovery (students)
"manage"       // Administrative functions (mentors/admin)
"work"         // Active tasks and submissions (students)
"achievements" // Certificates and accomplishments
"insights"     // Analytics and reporting (admin)
"account"      // User profile and settings
```

## Navigation Items by Role

### Student Role Navigation
```tsx
[
  { href: "/dashboard/student", label: "Dashboard", icon: <LayoutDashboard />, category: "main" },
  { href: "/internships", label: "Browse Internships", icon: <Briefcase />, category: "explore" },
  { href: "/applications", label: "My Applications", icon: <FileText />, category: "explore" },
  { href: "/submissions", label: "Submissions", icon: <CheckCircle />, category: "work" },
  { href: "/progress", label: "Track Progress", icon: <Clock />, category: "work" },
  { href: "/certificates", label: "Certificates", icon: <Award />, category: "achievements" },
  { href: "/profile", label: "Profile", icon: <User />, category: "account" },
]
```

### Mentor Role Navigation
```tsx
[
  { href: "/dashboard/mentor", label: "Dashboard", icon: <LayoutDashboard />, category: "main" },
  { href: "/internships/manage", label: "My Internships", icon: <Briefcase />, category: "manage" },
  { href: "/applicants", label: "Applicants", icon: <Users />, category: "manage" },
  { href: "/submissions/review", label: "Reviews", icon: <CheckCircle />, category: "manage" },
  { href: "/students", label: "My Students", icon: <BookOpen />, category: "manage" },
  { href: "/profile", label: "Profile", icon: <User />, category: "account" },
]
```

### Admin Role Navigation
```tsx
[
  { href: "/dashboard/admin", label: "Dashboard", icon: <LayoutDashboard />, category: "main" },
  { href: "/admin/users", label: "User Management", icon: <Users />, category: "manage" },
  { href: "/admin/internships", label: "Internships", icon: <Briefcase />, category: "manage" },
  { href: "/admin/applications", label: "Applications", icon: <FileText />, category: "manage" },
  { href: "/admin/reports", label: "Reports & Analytics", icon: <BarChart3 />, category: "insights" },
  { href: "/admin/settings", label: "Settings", icon: <Settings />, category: "account" },
]
```

## Hooks Used

### usePathname()
```tsx
const pathname = usePathname()
```
- Provided by Next.js
- Gets current route path
- Used to determine active navigation item

### useUser()
```tsx
const { user: clerkUser } = useUser()
```
- Provided by Clerk authentication
- Gets authenticated user info
- Used for profile display

### useClerk()
```tsx
const { signOut } = useClerk()
```
- Provided by Clerk authentication
- Used for logout functionality

### createClient()
```tsx
const supabase = createClient()
```
- Supabase client for data fetching
- Used to fetch user profile from database

## Effects

### Mobile Detection Effect
```tsx
useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
    setIsExpanded(window.innerWidth >= 768)
  }
  checkMobile()
  window.addEventListener("resize", checkMobile)
  return () => window.removeEventListener("resize", checkMobile)
}, [])
```
- Detects viewport size on mount and resize
- Auto-collapses on mobile
- Cleans up event listener on unmount

### Profile Fetching Effect
```tsx
useEffect(() => {
  const getProfile = async () => {
    if (!clerkUser) return
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", clerkUser.id)
        .single()
      setUserProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }
  getProfile()
}, [clerkUser])
```
- Fetches user profile on mount or clerkUser change
- Handles errors gracefully
- Only runs when clerkUser exists

## Key Functions

### getNavItems()
```tsx
const getNavItems = (): NavItem[] => {
  switch (role) {
    case "student": // ... student items
    case "mentor": // ... mentor items
    case "admin": // ... admin items
    default: return []
  }
}
```
Returns navigation items array based on user role

### handleLogout()
```tsx
const handleLogout = async () => {
  await signOut({ redirectUrl: "/" })
}
```
Signs out user and redirects to home page

## Animation Variants

### sidebarVariants
```tsx
const sidebarVariants = {
  expanded: { width: "280px" },
  collapsed: { width: "80px" },
}
```
Controls sidebar width on expand/collapse

### itemVariants
```tsx
const itemVariants = {
  expanded: { opacity: 1, width: "auto", marginLeft: "0px" },
  collapsed: { opacity: 0, width: "0px", marginLeft: "-10px" },
}
```
Controls text visibility and width when sidebar state changes

## CSS Classes

### Sidebar Container
```tsx
className="bg-card border-r border-border min-h-screen sticky top-0 flex flex-col overflow-hidden shadow-xl"
```
- Full height sticky sidebar
- Card background color
- Right border
- Shadow for depth
- Flex column layout

### Logo Section
```tsx
className="flex items-center gap-3 px-3 py-2 rounded-xl bg-linear-to-r from-primary/10 to-primary/5 hover:bg-primary/15 transition-colors group"
```
- Gradient background
- Rounded corners (xl)
- Hover color transition
- Group for children styling

### Navigation Items
```tsx
className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
  isActive
    ? "bg-primary text-primary-foreground shadow-lg"
    : "text-foreground hover:bg-secondary/40"
}`}
```
- Conditional styling for active state
- 200ms transitions
- Group styling for hover effects
- Relative positioning for chevron indicator

### User Profile
```tsx
className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/50 transition-all group relative"
```
- Rounded pill-like shape
- Hover background
- Relative for online indicator

## Responsive Behavior

### Desktop (md and above)
- Sidebar visible by default
- Full text labels visible
- Collapse button available
- Hover effects enabled

### Mobile (below md)
- Mobile toggle button visible
- Sidebar collapsed by default (via CSS)
- Toggle button fixed to top-left
- Auto-collapse on navigation

## Performance Optimizations

1. **Memoization**: Category grouping computed once per render
2. **Event Delegation**: Single resize listener with cleanup
3. **Lazy Effects**: useEffect cleanup prevents memory leaks
4. **Framer Motion**: GPU-accelerated transforms
5. **CSS Transitions**: Hardware-accelerated properties only

## Accessibility Features

- **Keyboard Navigation**: Link components natively support keyboard navigation
- **Title Attributes**: Collapsed items have titles for tooltips
- **Semantic HTML**: Proper heading hierarchy
- **Color Contrast**: Meets WCAG standards
- **ARIA Roles**: Implicit through semantic elements

## Integration Points

### Required Packages
```json
{
  "framer-motion": "^10.x",
  "@clerk/nextjs": "^latest",
  "@supabase/supabase-js": "^latest",
  "lucide-react": "^latest",
  "next": "^16.0.0"
}
```

### Environment Variables
None required specifically for Sidebar, but depends on:
- Clerk authentication setup
- Supabase client configuration

### Layout Integration
Sidebar is typically used with a layout wrapper:
```tsx
<div className="flex h-screen bg-background">
  <Sidebar role={userRole} />
  <main className="flex-1 overflow-auto">
    {children}
  </main>
</div>
```

## Customization Guide

### Changing Logo
```tsx
// In Logo Section, modify:
<Home size={20} />  // Change icon
"Inter2Earn"        // Change text
"Platform"          // Change subtitle
```

### Adding New Navigation Item
```tsx
// In getNavItems() switch case:
{
  href: "/new-page",
  label: "New Item",
  icon: <NewIcon size={20} />,
  category: "main"
}
```

### Adding New Category
1. Add category key to NavItem definition
2. Update categoryLabels object
3. Update categoryOrder array
4. Assign items to new category

### Changing Colors
All colors use Tailwind CSS classes:
- `bg-primary` → Primary brand color
- `bg-secondary` → Secondary background
- `text-foreground` → Main text color
- `text-muted-foreground` → Secondary text color

### Adjusting Animation Speed
```tsx
transition={{ duration: 0.3, ease: "easeInOut" }}  // Change 0.3 to desired duration
```

## Debugging Tips

### Sidebar Not Showing Items
- Check user role is correctly passed
- Verify Supabase profile exists
- Check browser console for errors

### Animation Not Smooth
- Verify Framer Motion is installed
- Check GPU acceleration in DevTools
- Look for layout thrashing in React DevTools Profiler

### Mobile Behavior Issues
- Test window resize events
- Check media query at 768px
- Verify mobile toggle button z-index (z-50)

### Dark Mode Not Working
- Ensure theme provider is configured
- Check dark: prefix in Tailwind CSS
- Verify CSS variables are set

## Version History

### v2.0 (Current)
- ChatGPT-style redesign
- Categorized navigation
- Enhanced animations
- Online status indicator
- Better mobile support
- Improved accessibility

### v1.0 (Previous)
- Basic collapsible sidebar
- Simple navigation
- Profile section
- Logout button

---

**Last Updated**: 2025-11-10
**Maintained By**: Development Team
