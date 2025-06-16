"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Lead, ApiResponse } from '@/lib/types'
import { 
  MessageSquare, 
  Download, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface BulkActionsProps {
  leads: Lead[]
  selectedLeads: string[]
  onSelectionChange: (leadIds: string[]) => void
  onLeadsUpdate: () => void
}

interface BulkGenerationProgress {
  total: number
  completed: number
  current: string
  results: { leadId: string; success: boolean; error?: string }[]
}

export function BulkActions({ 
  leads, 
  selectedLeads, 
  onSelectionChange,
  onLeadsUpdate
}: BulkActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [progress, setProgress] = useState<BulkGenerationProgress>({
    total: 0,
    completed: 0,
    current: '',
    results: []
  })

  const selectedLeadObjects = leads.filter(lead => selectedLeads.includes(lead.id))
  const hasSelection = selectedLeads.length > 0

  // Toggle all leads selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(leads.map(lead => lead.id))
    } else {
      onSelectionChange([])
    }
  }

  // Toggle individual lead selection
  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedLeads, leadId])
    } else {
      onSelectionChange(selectedLeads.filter(id => id !== leadId))
    }
  }

  // Bulk message generation
  const handleBulkGeneration = async () => {
    if (selectedLeads.length === 0) return

    setIsGenerating(true)
    setShowProgress(true)
    
    const totalLeads = selectedLeads.length
    const results: { leadId: string; success: boolean; error?: string }[] = []

    setProgress({
      total: totalLeads,
      completed: 0,
      current: '',
      results: []
    })

    for (let i = 0; i < selectedLeads.length; i++) {
      const leadId = selectedLeads[i]
      const lead = leads.find(l => l.id === leadId)
      
      if (!lead) continue

      // Update progress
      setProgress(prev => ({
        ...prev,
        current: lead.name,
        completed: i
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
            saveToDb: true
          }),
        })

        const result: ApiResponse = await response.json()

        if (result.success) {
          results.push({ leadId, success: true })
        } else {
          results.push({ leadId, success: false, error: result.error })
        }
      } catch (error) {
        results.push({ 
          leadId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }

      // Small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Final progress update
    setProgress(prev => ({
      ...prev,
      completed: totalLeads,
      current: '',
      results
    }))

    setIsGenerating(false)
    onLeadsUpdate()

    // Auto-close progress dialog after 3 seconds if all successful
    const allSuccessful = results.every(r => r.success)
    if (allSuccessful) {
      setTimeout(() => {
        setShowProgress(false)
        onSelectionChange([])
      }, 3000)
    }
  }

  // CSV Export
  const handleCSVExport = () => {
    const exportData = selectedLeadObjects.map(lead => ({
      Name: lead.name,
      Role: lead.role,
      Company: lead.company,
      'LinkedIn URL': lead.linkedin_url || '',
      Status: lead.status,
      'Created Date': new Date(lead.created_at).toLocaleDateString(),
      'Updated Date': new Date(lead.updated_at).toLocaleDateString()
    }))

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {})
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
                 headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const successfulGenerations = progress.results.filter(r => r.success).length
  const failedGenerations = progress.results.filter(r => !r.success).length

  return (
    <>
      {/* Selection Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bulk Actions</span>
            <Badge variant="outline">
              {selectedLeads.length} selected
            </Badge>
          </CardTitle>
          <CardDescription>
            Select leads to perform bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Select All */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedLeads.length === leads.length && leads.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({leads.length} leads)
              </label>
            </div>

            {/* Individual Lead Selection */}
            {leads.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {leads.map((lead) => (
                  <div 
                    key={lead.id}
                    className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                  >
                    <Checkbox
                      id={`lead-${lead.id}`}
                      checked={selectedLeads.includes(lead.id)}
                                             onCheckedChange={(checked: boolean) => handleSelectLead(lead.id, checked)}
                    />
                    <label 
                      htmlFor={`lead-${lead.id}`} 
                      className="text-sm flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-gray-500 text-xs">{lead.company}</div>
                    </label>
                    <Badge 
                      variant="outline" 
                      className={
                        lead.status === 'sent' ? 'bg-green-50 text-green-700' :
                        lead.status === 'approved' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-700'
                      }
                    >
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Bulk Action Buttons */}
            {hasSelection && (
              <div className="flex space-x-3 pt-4 border-t">
                <Dialog open={showProgress} onOpenChange={setShowProgress}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={handleBulkGeneration}
                      disabled={isGenerating}
                      className="flex items-center space-x-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      <span>
                        Generate Messages ({selectedLeads.length})
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Bulk Message Generation</DialogTitle>
                      <DialogDescription>
                        Generating AI messages for selected leads...
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress.completed}/{progress.total}</span>
                        </div>
                        <Progress 
                          value={(progress.completed / progress.total) * 100} 
                          className="h-2"
                        />
                      </div>
                      
                      {progress.current && (
                        <div className="text-sm text-gray-600">
                          Currently processing: <strong>{progress.current}</strong>
                        </div>
                      )}

                      {progress.results.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Success: {successfulGenerations}</span>
                            </div>
                            {failedGenerations > 0 && (
                              <div className="flex items-center space-x-1 text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                <span>Failed: {failedGenerations}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!isGenerating && progress.completed === progress.total && (
                        <div className="text-center">
                          <Button 
                            onClick={() => {
                              setShowProgress(false)
                              onSelectionChange([])
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

                <Button 
                  variant="outline"
                  onClick={handleCSVExport}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
} 