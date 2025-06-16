"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, MessageSquare, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { Lead, MessageWithLead, MessageStatus, ApiResponse, LeadFormData } from '@/lib/types'
import { LeadForm } from '@/components/LeadForm'
import { MessageForm } from '@/components/MessageForm'
import { MessageKanbanBoard } from '@/components/MessageKanbanBoard'
import { useToast } from '@/components/ui/toast'
import { Progress } from '@/components/ui/progress'


export default function LeadsPage() {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<MessageWithLead[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [editingMessage, setEditingMessage] = useState<MessageWithLead | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [generatingLeadId, setGeneratingLeadId] = useState<string | null>(null)
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [showLeadDeleteConfirm, setShowLeadDeleteConfirm] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    current: number
    total: number
    currentLead: string
    results: Array<{ leadName: string; success: boolean; error?: string }>
  }>({
    current: 0,
    total: 0,
    currentLead: '',
    results: []
  })

  // Load messages with lead info
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/messages')
      const data: ApiResponse<MessageWithLead[]> = await response.json()
      
      if (data.success && data.data) {
        setMessages(data.data)
      } else {
        setError(data.error || 'Failed to load messages')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load leads for the add form
  const loadLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/leads')
      const data: ApiResponse<Lead[]> = await response.json()
      
      if (data.success && data.data) {
        setLeads(data.data)
      }
    } catch (err) {
      console.error('Failed to load leads:', err)
    }
  }, [])

  useEffect(() => {
    loadMessages()
    loadLeads()
  }, [loadMessages, loadLeads])

  // Handle lead creation/update
  const handleLeadSave = async (leadData: LeadFormData) => {
    try {
      const isEditing = editingLead !== null
      const url = isEditing ? `/api/leads/${editingLead.id}` : '/api/leads'
      const method = isEditing ? 'PUT' : 'POST'

      // Store original state for potential rollback
      const originalLeads = leads

      if (isEditing) {
        // Optimistic update for editing
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === editingLead.id 
              ? { 
                  ...lead, 
                  ...leadData, 
                  linkedin_url: leadData.linkedin_url || null,
                  updated_at: new Date().toISOString() 
                }
              : lead
          )
        )
      } else {
        // Optimistic update for adding
        const tempId = 'temp_' + Date.now()
        const tempLead: Lead = {
          id: tempId,
          ...leadData,
          linkedin_url: leadData.linkedin_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setLeads(prevLeads => [tempLead, ...prevLeads])
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      })

      const result: ApiResponse<Lead> = await response.json()

      if (result.success && result.data) {
        if (isEditing) {
          // Update with real data from server
          setLeads(prevLeads => 
            prevLeads.map(lead => 
              lead.id === editingLead.id ? result.data! : lead
            )
          )
          
          // Update messages that reference this lead
          setMessages(prevMessages =>
            prevMessages.map(message =>
              message.lead_id === editingLead.id
                ? { ...message, lead: result.data! }
                : message
            )
          )
        } else {
          // Replace temp lead with real lead from server
          setLeads(prevLeads => 
            prevLeads.map(lead => 
              lead.id.startsWith('temp_') ? result.data! : lead
            )
          )
        }
        setShowAddForm(false)
        setEditingLead(null)
      } else {
        // Revert optimistic update on error
        setLeads(originalLeads)
        setError(result.error || 'Failed to save lead')
      }
    } catch (err) {
      // Revert optimistic update on network error
      const isEditing = editingLead !== null
      if (isEditing && editingLead) {
        setLeads(prevLeads => 
          prevLeads.map(lead => 
            lead.id === editingLead.id ? editingLead : lead
          )
        )
      } else {
        setLeads(prevLeads => 
          prevLeads.filter(lead => !lead.id.startsWith('temp_'))
        )
      }
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Handle message status change (drag and drop)
  const handleMessageStatusChange = async (id: string, status: MessageStatus) => {
    const message = messages.find(m => m.id === id)
    if (!message) return

    const originalStatus = message.status

    try {
      // Optimistic update
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === id ? { ...msg, status, updated_at: new Date().toISOString() } : msg
        )
      )

      const response = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result: ApiResponse<MessageWithLead> = await response.json()

      if (result.success && result.data) {
        // Update with server response
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === id ? result.data! : msg
          )
        )
      } else {
        // Revert on error
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === id ? { ...msg, status: originalStatus } : msg
          )
        )
        setError(result.error || 'Failed to update message status')
      }
    } catch (err) {
      // Revert on network error
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === id ? { ...msg, status: originalStatus } : msg
        )
      )
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Handle message editing
  const handleMessageEdit = (message: MessageWithLead) => {
    setEditingMessage(message)
    setShowMessageForm(true)
  }

  // Handle message save
  const handleMessageSave = async (formData: { content: string; status: MessageStatus }) => {
    if (!editingMessage) return

    const originalMessage = editingMessage

    try {
      // Optimistic update
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === editingMessage.id 
            ? { ...msg, ...formData, updated_at: new Date().toISOString() }
            : msg
        )
      )

      const response = await fetch(`/api/messages/${editingMessage.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result: ApiResponse<MessageWithLead> = await response.json()

      if (result.success && result.data) {
        // Update with server response
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === editingMessage.id ? result.data! : msg
          )
        )
        setShowMessageForm(false)
        setEditingMessage(null)
      } else {
        // Revert on error
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === editingMessage.id ? originalMessage : msg
          )
        )
        setError(result.error || 'Failed to update message')
      }
    } catch (err) {
      // Revert on network error
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === editingMessage.id ? originalMessage : msg
        )
      )
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  // Handle message deletion request
  const handleMessageDelete = (id: string) => {
    setMessageToDelete(id)
    setShowDeleteConfirm(true)
  }

  // Confirm message deletion
  const confirmMessageDelete = async () => {
    if (!messageToDelete) return

    const messageData = messages.find(message => message.id === messageToDelete)
    if (!messageData) return

    try {
      // Optimistic update - remove message immediately
      setMessages(prevMessages => prevMessages.filter(message => message.id !== messageToDelete))

      const response = await fetch(`/api/messages/${messageToDelete}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (!result.success) {
        // Revert optimistic update on error
        setMessages(prevMessages => {
          const newMessages = [...prevMessages]
          // Find the correct position to restore the message (by generated_at)
          const insertIndex = newMessages.findIndex(message => 
            new Date(message.generated_at) < new Date(messageData.generated_at)
          )
          if (insertIndex === -1) {
            newMessages.push(messageData)
          } else {
            newMessages.splice(insertIndex, 0, messageData)
          }
          return newMessages
        })
        addToast({
          type: 'error',
          title: 'Delete Failed',
          description: result.error || 'Failed to delete message'
        })
      } else {
        addToast({
          type: 'success',
          title: 'Message Deleted',
          description: 'Message has been successfully deleted.'
        })
      }
    } catch (err) {
      // Revert optimistic update on network error
      setMessages(prevMessages => {
        const newMessages = [...prevMessages]
        const insertIndex = newMessages.findIndex(message => 
          new Date(message.generated_at) < new Date(messageData.generated_at)
        )
        if (insertIndex === -1) {
          newMessages.push(messageData)
        } else {
          newMessages.splice(insertIndex, 0, messageData)
        }
        return newMessages
      })
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    } finally {
      setShowDeleteConfirm(false)
      setMessageToDelete(null)
    }
  }

  // Handle lead editing
  const handleLeadEdit = (lead: Lead) => {
    setEditingLead(lead)
    setShowAddForm(true)
  }

  // Handle lead deletion request
  const handleLeadDelete = (id: string) => {
    setLeadToDelete(id)
    setShowLeadDeleteConfirm(true)
  }

  // Confirm lead deletion
  const confirmLeadDelete = async () => {
    if (!leadToDelete) return

    const leadData = leads.find(lead => lead.id === leadToDelete)
    if (!leadData) return

    try {
      // Optimistic update - remove lead immediately
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadToDelete))
      // Also remove related messages
      setMessages(prevMessages => prevMessages.filter(message => message.lead_id !== leadToDelete))

      const response = await fetch(`/api/leads/${leadToDelete}`, {
        method: 'DELETE',
      })

      const result: ApiResponse = await response.json()

      if (!result.success) {
        // Revert optimistic update on error
        setLeads(prevLeads => {
          const newLeads = [...prevLeads]
          // Find the correct position to restore the lead (by created_at)
          const insertIndex = newLeads.findIndex(lead => 
            new Date(lead.created_at) < new Date(leadData.created_at)
          )
          if (insertIndex === -1) {
            newLeads.push(leadData)
          } else {
            newLeads.splice(insertIndex, 0, leadData)
          }
          return newLeads
        })
        // Reload messages to restore related messages
        loadMessages()
        addToast({
          type: 'error',
          title: 'Delete Failed',
          description: result.error || 'Failed to delete lead'
        })
      } else {
        // Remove from selected leads if it was selected
        setSelectedLeads(prevSelected => prevSelected.filter(id => id !== leadToDelete))
        addToast({
          type: 'success',
          title: 'Lead Deleted',
          description: 'Lead and all related messages have been successfully deleted.'
        })
      }
    } catch (err) {
      // Revert optimistic update on network error
      setLeads(prevLeads => {
        const newLeads = [...prevLeads]
        const insertIndex = newLeads.findIndex(lead => 
          new Date(lead.created_at) < new Date(leadData.created_at)
        )
        if (insertIndex === -1) {
          newLeads.push(leadData)
        } else {
          newLeads.splice(insertIndex, 0, leadData)
        }
        return newLeads
      })
      // Reload messages to restore related messages
      loadMessages()
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'An error occurred'
      })
    } finally {
      setShowLeadDeleteConfirm(false)
      setLeadToDelete(null)
    }
  }

  // Handle message regeneration
  const handleRegenerateMessage = async (message: MessageWithLead) => {
    setRegeneratingMessageId(message.id)
    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: message.lead_id,
          name: message.lead.name,
          role: message.lead.role,
          company: message.lead.company,
          linkedinUrl: message.lead.linkedin_url,
          saveToDb: false // We'll update the existing message instead
        }),
      })

      const result = await response.json()

      if (result.success && result.data?.message) {
        // Update the existing message with new content
        const updatedMessage = {
          ...message,
          content: result.data.message,
          updated_at: new Date().toISOString()
        }

        // Optimistic update
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === message.id ? updatedMessage : msg
          )
        )

        // Save to database
        const saveResponse = await fetch(`/api/messages/${message.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: result.data.message }),
        })

        const saveResult: ApiResponse<MessageWithLead> = await saveResponse.json()

        if (saveResult.success && saveResult.data) {
          // Update with server response
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === message.id ? saveResult.data! : msg
            )
          )
        }

        addToast({
          type: 'success',
          title: 'New Message Generated!',
          description: result.data.message,
          duration: 6000
        })
      } else {
        setError(result.error || 'Failed to generate message')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate message')
    } finally {
      setRegeneratingMessageId(null)
    }
  }

  // Handle lead generation with message
  const handleGenerateMessage = async (lead: Lead) => {
    setGeneratingLeadId(lead.id)
    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          name: lead.name,
          role: lead.role,
          company: lead.company,
          linkedinUrl: lead.linkedin_url,
          saveToDb: true
        }),
      })

      const result = await response.json()

      if (result.success && result.data?.savedToDb && result.data?.messageId) {
        // Reload messages to get the new one
        loadMessages()
        addToast({
          type: 'success',
          title: 'Message Generated Successfully!',
          description: result.data.message,
          duration: 6000
        })
      } else {
        setError(result.error || 'Failed to generate message')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate message')
    } finally {
      setGeneratingLeadId(null)
    }
  }

  // Handle bulk message generation
  const handleBulkGenerateMessages = async () => {
    if (selectedLeads.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Leads Selected',
        description: 'Please select at least one lead to generate messages.'
      })
      return
    }

    const selectedLeadData = leads.filter(lead => selectedLeads.includes(lead.id))
    
    // Initialize progress state
    setProgress({
      current: 0,
      total: selectedLeadData.length,
      currentLead: '',
      results: []
    })
    setIsGenerating(true)
    setShowProgress(true)

    try {
      for (let i = 0; i < selectedLeadData.length; i++) {
        const lead = selectedLeadData[i]
        
        // Update current progress
        setProgress(prev => ({
          ...prev,
          current: i + 1,
          currentLead: lead.name
        }))

        try {
          const response = await fetch('/api/generate-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              leadId: lead.id,
              name: lead.name,
              role: lead.role,
              company: lead.company,
              linkedinUrl: lead.linkedin_url,
              saveToDb: true
            }),
          })

          const result = await response.json()

          // Add result to progress
          setProgress(prev => ({
            ...prev,
            results: [...prev.results, {
              leadName: lead.name,
              success: result.success && result.data?.savedToDb,
              error: result.success ? undefined : (result.error || 'Generation failed')
            }]
          }))

        } catch (err) {
          // Add error result to progress
          setProgress(prev => ({
            ...prev,
            results: [...prev.results, {
              leadName: lead.name,
              success: false,
              error: err instanceof Error ? err.message : 'Network error'
            }]
          }))
        }
      }

      // Reload messages to get the new ones
      loadMessages()
      
      // Show final results
      const successCount = progress.results.filter(r => r.success).length
      const failureCount = progress.results.filter(r => !r.success).length
      
      // Only show toast if there were failures, progress dialog already shows results
      if (failureCount > 0) {
        addToast({
          type: failureCount === progress.results.length ? 'error' : 'warning',
          title: 'Bulk Generation Completed',
          description: `Success: ${successCount}, Failed: ${failureCount}`,
          duration: 5000
        })
      }

    } finally {
      setIsGenerating(false)
      // Don't close progress dialog automatically, let user close it
    }
  }

  // Handle bulk CSV export
  const handleBulkExportCSV = () => {
    if (selectedLeads.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Leads Selected',
        description: 'Please select at least one lead to export.'
      })
      return
    }

    const selectedLeadData = leads.filter(lead => selectedLeads.includes(lead.id))
    
    // Prepare CSV data
    const csvData = selectedLeadData.map(lead => {
      const leadMessages = messages.filter(message => message.lead_id === lead.id)
      
      return {
        'Lead Name': lead.name,
        'Role': lead.role,
        'Company': lead.company,
        'LinkedIn URL': lead.linkedin_url || '',
        'Created At': new Date(lead.created_at).toLocaleDateString(),
        'Message Count': leadMessages.length,
        'Messages': leadMessages.map((msg, index) => 
          `Message ${index + 1} (${msg.status}): ${msg.content}`
        ).join(' | '),
        'Latest Message Status': leadMessages.length > 0 
          ? leadMessages.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())[0].status
          : 'No messages'
      }
    })

    // Convert to CSV format
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => 
          `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    addToast({
      type: 'success',
      title: 'Export Successful',
      description: `Exported ${selectedLeads.length} lead(s) to CSV file.`
    })
    
    setSelectedLeads([])
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
        </div>
        
        <div className="flex space-x-2">
          {/* Bulk Actions */}
          <Button
            variant="outline"
            onClick={handleBulkGenerateMessages}
            disabled={loading || selectedLeads.length === 0}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Generate Messages {selectedLeads.length > 0 ? `(${selectedLeads.length})` : ''}
          </Button>
          <Button
            variant="outline"
            onClick={handleBulkExportCSV}
            disabled={selectedLeads.length === 0}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV {selectedLeads.length > 0 ? `(${selectedLeads.length})` : ''}
          </Button>
          
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingLead(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingLead ? 'Edit Lead' : 'Add New Lead'}
                </DialogTitle>
                <DialogDescription>
                  {editingLead 
                    ? 'Update the lead information below.' 
                    : 'Add a new lead to generate LinkedIn messages for.'}
                </DialogDescription>
              </DialogHeader>
              <LeadForm
                initialData={editingLead || undefined}
                onSubmit={handleLeadSave}
                onCancel={() => {
                  setShowAddForm(false)
                  setEditingLead(null)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Show all leads as a table */}
          {leads.length > 0 && (
            <div className="mb-8">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === leads.length && leads.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads(leads.map(lead => lead.id))
                            } else {
                              setSelectedLeads([])
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">LinkedIn</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Messages</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {leads.map(lead => {
                      const leadMessages = messages.filter(message => message.lead_id === lead.id)
                      return (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLeads([...selectedLeads, lead.id])
                                } else {
                                  setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {lead.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {lead.role}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {lead.company}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {lead.linkedin_url ? (
                              <a 
                                href={lead.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <span className="mr-1">Profile</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              <span className="text-gray-400">No URL</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {leadMessages.length > 0 ? (
                              <span className="text-green-600">{leadMessages.length} message{leadMessages.length > 1 ? 's' : ''}</span>
                            ) : (
                              <span className="text-gray-400">No messages</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleGenerateMessage(lead)}
                                disabled={generatingLeadId === lead.id}
                                className="text-xs"
                              >
                                {generatingLeadId === lead.id ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                )}
                                {generatingLeadId === lead.id ? 'Generating...' : 'Generate'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleLeadEdit(lead)}
                                className="text-xs"
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleLeadDelete(lead.id)}
                                className="text-xs text-red-600 hover:text-red-800 hover:border-red-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <MessageKanbanBoard
            messages={messages}
            onStatusChange={handleMessageStatusChange}
            onEdit={handleMessageEdit}
            onDelete={handleMessageDelete}
            onRegenerateMessage={handleRegenerateMessage}
            regeneratingMessageId={regeneratingMessageId}
          />

          {/* Message Edit Dialog */}
          <Dialog open={showMessageForm} onOpenChange={setShowMessageForm}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Message</DialogTitle>
                <DialogDescription>
                  Edit the LinkedIn message content and status.
                </DialogDescription>
              </DialogHeader>
              <MessageForm
                message={editingMessage || undefined}
                onSubmit={handleMessageSave}
                onCancel={() => {
                  setShowMessageForm(false)
                  setEditingMessage(null)
                }}
              />
            </DialogContent>
          </Dialog>

          {/* Progress Dialog for Bulk Generation */}
          <Dialog open={showProgress} onOpenChange={(open) => {
            if (!isGenerating) {
              setShowProgress(open)
              if (!open) {
                setSelectedLeads([])
              }
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generating Messages</DialogTitle>
                <DialogDescription>
                  {isGenerating 
                    ? `Processing ${progress.current} of ${progress.total} leads...`
                    : `Completed ${progress.total} lead${progress.total > 1 ? 's' : ''}`
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress.current}/{progress.total}</span>
                  </div>
                  <Progress 
                    value={(progress.current / Math.max(progress.total, 1)) * 100} 
                    className="w-full"
                  />
                </div>

                {/* Current Lead */}
                {isGenerating && progress.currentLead && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Currently processing:</span> {progress.currentLead}
                  </div>
                )}

                {/* Results */}
                {progress.results.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <div className="text-sm font-medium">Results:</div>
                    {progress.results.map((result, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="flex-1">{result.leadName}</span>
                        {!result.success && result.error && (
                          <span className="text-xs text-red-600 truncate max-w-32" title={result.error}>
                            {result.error}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Loading Indicator */}
                {isGenerating && (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Generating messages...</span>
                  </div>
                )}

                {/* Close Button */}
                {!isGenerating && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => {
                        setShowProgress(false)
                        setSelectedLeads([])
                      }}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Message Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this message? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
                             <div className="flex justify-end space-x-2 mt-4">
                 <Button 
                   variant="outline" 
                   onClick={() => {
                     setShowDeleteConfirm(false)
                     setMessageToDelete(null)
                   }}
                 >
                   Cancel
                 </Button>
                 <Button 
                   variant="destructive"
                   onClick={confirmMessageDelete}
                 >
                   Delete
                 </Button>
               </div>
            </DialogContent>
          </Dialog>

          {/* Lead Delete Confirmation Dialog */}
          <Dialog open={showLeadDeleteConfirm} onOpenChange={setShowLeadDeleteConfirm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Delete Lead</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this lead? This will also delete all related messages. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowLeadDeleteConfirm(false)
                    setLeadToDelete(null)
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={confirmLeadDelete}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
} 