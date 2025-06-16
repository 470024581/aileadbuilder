// Lead related types (without status)
export interface Lead {
  id: string
  name: string
  role: string
  company: string
  linkedin_url: string | null
  created_at: string
  updated_at: string
}

export interface CreateLeadData {
  name: string
  role: string
  company: string
  linkedin_url?: string | null
}

export interface UpdateLeadData {
  name?: string
  role?: string
  company?: string
  linkedin_url?: string | null
}

// Message related types (with status, without edited)
export type MessageStatus = 'draft' | 'approved' | 'sent'

export interface Message {
  id: string
  lead_id: string
  content: string
  status: MessageStatus
  generated_at: string
  updated_at: string
  // Include lead info for easier display
  lead?: Lead
}

export interface CreateMessageData {
  lead_id: string
  content: string
  status?: MessageStatus
}

export interface UpdateMessageData {
  content?: string
  status?: MessageStatus
}

// Message with lead info for Kanban display
export interface MessageWithLead extends Message {
  lead: Lead
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form related types
export interface LeadFormData {
  name: string
  role: string
  company: string
  linkedin_url?: string
}

export interface MessageFormData {
  content: string
  status?: MessageStatus
}

// Statistics types (now based on messages)
export interface MessageStats {
  total: number
  draft: number
  approved: number
  sent: number
}

// Search and filter types
export interface MessageFilters {
  status?: MessageStatus
  search?: string
  company?: string
  leadName?: string
}

export interface LeadFilters {
  search?: string
  company?: string
}

// Sort types
export type SortField = 'name' | 'company' | 'role' | 'created_at' | 'updated_at' | 'generated_at'
export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  order: SortOrder
}

// Pagination types
export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

// Component Props types
export interface MessageCardProps {
  message: MessageWithLead
  onEdit: (message: MessageWithLead) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: MessageStatus) => void
  onRegenerateMessage: (message: MessageWithLead) => void
}

export interface LeadCardProps {
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onGenerateMessage: (lead: Lead) => void
}

export interface MessageListProps {
  messages: MessageWithLead[]
  isLoading?: boolean
  onEdit: (message: MessageWithLead) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: MessageStatus) => void
  onRegenerateMessage: (message: MessageWithLead) => void
}

// Legacy type aliases for backward compatibility
export type LeadStatus = MessageStatus

// Error types
export interface AppError {
  code: string
  message: string
  details?: unknown
} 