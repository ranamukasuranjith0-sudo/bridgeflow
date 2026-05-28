export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'manager' | 'entreprise'
  name: string | null
  created_at: string
}

export interface Candidate {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  role_function: string | null
  tjm: number | null
  location: string | null
  availability: string | null
  legal_status: string | null
  mobility: string | null
  experience_summary: string | null
  sectors: string[] | null
  cv_url: string | null
  status: 'pending' | 'validated' | 'rejected'
  created_at: string
}

export interface Company {
  id: string
  user_id: string | null
  company_name: string
  contact_name: string | null
  email: string
  phone: string | null
  size: string | null
  role_needed: string | null
  duration: string | null
  budget_tjm: number | null
  location: string | null
  start_date: string | null
  context: string | null
  required_skills: string[] | null
  status: 'pending' | 'active' | 'closed'
  created_at: string
}

export interface Mission {
  id: string
  company_id: string | null
  title: string
  role: string | null
  location: string | null
  tjm: number | null
  duration: string | null
  urgency: string | null
  tags: string[] | null
  summary: string | null
  context: string | null
  initials: string | null
  color: string | null
  status: 'active' | 'closed' | 'paused'
  created_at: string
}

export interface Like {
  id: string
  user_id: string
  target_id: string
  target_type: 'mission' | 'candidate'
  created_at: string
}

export interface Match {
  id: string
  candidate_id: string | null
  company_id: string | null
  mission_id: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  calendly_sent: boolean
  created_at: string
}

export interface Interview {
  id: string
  type: 'qualification_candidate' | 'qualification_company' | 'match'
  participant_name: string
  role: string | null
  interview_date: string | null
  interview_time: string | null
  duration: string
  format: string | null
  tjm: string | null
  location: string | null
  notes: string | null
  status: 'todo' | 'confirmed' | 'pending'
  created_at: string
}
