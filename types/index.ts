export type UserRole = "student" | "mentor" | "admin"

export interface UserProfile {
  id: string // Clerk user ID
  email: string
  full_name: string
  role: UserRole
  profile_image_url?: string
  bio?: string
  phone_number?: string
  location?: string
  skills: string[]
  created_at: string
  updated_at: string
}

export interface Internship {
  id: string
  title: string
  description: string
  company_name: string
  location: string
  salary_min?: number
  salary_max?: number
  duration_weeks?: number
  required_skills: string[]
  mentor_id: string
  status: "open" | "closed" | "filled"
  applications_count: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  internship_id: string
  student_id: string
  status: "pending" | "accepted" | "rejected" | "withdrawn"
  cover_letter?: string
  resume_url?: string
  rating?: number
  feedback?: string
  submitted_at: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  application_id: string
  title: string
  description: string
  project_url?: string
  github_url?: string
  submission_date: string
  status: "pending" | "approved" | "rejected" | "revision_needed"
  mentor_feedback?: string
  created_at: string
  updated_at: string
}

export interface ProgressEntry {
  id: string
  application_id: string
  week_number: number
  description: string
  attachments: string[]
  status: "ongoing" | "completed" | "pending_review"
  mentor_comment?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  application_id?: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  application_id: string
  reviewer_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
}

export interface Certificate {
  id: string
  student_id: string
  application_id: string
  title: string
  issued_at: string
  certificate_url?: string
  created_at: string
}
