"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LeadForm } from '@/components/LeadForm'
import { CreateLeadData, ApiResponse } from '@/lib/types'
import { useToast } from '@/components/ui/toast'

export default function NewLeadPage() {
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: CreateLeadData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        // Successfully created, redirect to leads list page
        router.push('/leads')
        router.refresh()
      } else {
        addToast({
          type: 'error',
          title: 'Creation Failed',
          description: result.error || 'Failed to create lead'
        })
      }
    } catch (error) {
      console.error('Error creating lead:', error)
      addToast({
        type: 'error',
        title: 'Creation Failed',
        description: 'Creation failed, please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Add New Lead</h1>
        <p className="text-gray-600">
          Fill in the lead&apos;s basic information, and we&apos;ll generate personalized LinkedIn messages for you
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
        <LeadForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitText="Add Lead"
        />
      </div>
    </div>
  )
} 