"use client"

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LeadFormData, Lead } from '@/lib/types'
import { isValidLinkedInUrl } from '@/lib/utils'

// Form validation schema
const leadFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  role: z.string().min(1, 'Role is required').max(100, 'Role must be less than 100 characters'),
  company: z.string().min(1, 'Company is required').max(100, 'Company name must be less than 100 characters'),
  linkedin_url: z.string().optional().refine(
    (url) => !url || isValidLinkedInUrl(url),
    { message: 'Invalid LinkedIn URL format' }
  )
})

interface LeadFormProps {
  initialData?: Lead
  onSubmit: (data: LeadFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  submitText?: string
}

export function LeadForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  submitText = 'Save'
}: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      role: initialData?.role || '',
      company: initialData?.company || '',
      linkedin_url: initialData?.linkedin_url || ''
    }
  })

  const onFormSubmit = async (data: LeadFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          {initialData ? 'Edit Lead' : 'Add Lead'}
        </h2>
        <p className="text-sm text-gray-500">
          {initialData ? 'Update lead information' : 'Fill in the basic information for the lead'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="Enter contact name"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            placeholder="e.g., Marketing Director, Technical Manager"
            {...register('role')}
            className={errors.role ? 'border-red-500' : ''}
          />
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* Company */}
        <div className="space-y-2">
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            placeholder="Enter company name"
            {...register('company')}
            className={errors.company ? 'border-red-500' : ''}
          />
          {errors.company && (
            <p className="text-sm text-red-500">{errors.company.message}</p>
          )}
        </div>

        {/* LinkedIn URL */}
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
          <Input
            id="linkedin_url"
            placeholder="https://linkedin.com/in/username"
            {...register('linkedin_url')}
            className={errors.linkedin_url ? 'border-red-500' : ''}
          />
          {errors.linkedin_url && (
            <p className="text-sm text-red-500">{errors.linkedin_url.message}</p>
          )}
          <p className="text-sm text-gray-500">
            Optional, format: https://linkedin.com/in/username
          </p>
        </div>

        {/* Button group */}
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1"
          >
            {isSubmitting || isLoading ? 'Saving...' : submitText}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
} 