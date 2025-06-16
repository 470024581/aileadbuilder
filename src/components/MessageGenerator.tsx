"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Lead } from '@/lib/types'
import { 
  Wand2, 
  Copy, 
  RefreshCw, 
  Save, 
  Send,
  User,
  Building2,
  Briefcase
} from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

interface MessageGeneratorProps {
  lead: Lead
  initialMessage?: string
  onGenerate: (lead: Lead) => Promise<string>
  onSave?: (message: string) => Promise<void>
  onClose?: () => void
  isGenerating?: boolean
}

export function MessageGenerator({
  lead,
  initialMessage = '',
  onGenerate,
  onSave,
  onClose,
  isGenerating = false
}: MessageGeneratorProps) {
  const [message, setMessage] = useState(initialMessage)
  const [isEdited, setIsEdited] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleGenerate = async () => {
    try {
      const generatedMessage = await onGenerate(lead)
      setMessage(generatedMessage)
      setIsEdited(false)
    } catch (error) {
      console.error('Error generating message:', error)
    }
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)
    setIsEdited(true)
  }

  const handleCopy = async () => {
    if (message) {
      const success = await copyToClipboard(message)
      if (success) {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      }
    }
  }

  const handleSave = async () => {
    if (onSave && message) {
      setIsSaving(true)
      try {
        await onSave(message)
      } catch (error) {
        console.error('Error saving message:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            <span>AI Message Generator</span>
          </span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Generate personalized LinkedIn outreach message for {lead.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lead Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Lead Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{lead.name}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Role</div>
                <div className="font-medium">{lead.role}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="font-medium">{lead.company}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Generation Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">LinkedIn Message</h3>
            <div className="flex items-center space-x-2">
              {isEdited && (
                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                  Edited
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                <span>{isGenerating ? 'Generating...' : message ? 'Regenerate' : 'Generate Message'}</span>
              </Button>
            </div>
          </div>

          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Click 'Generate Message' button to have AI create a personalized LinkedIn message for you..."
              className="min-h-[120px] resize-none"
              disabled={isGenerating}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {message.length}/500
            </div>
          </div>

          {message && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
              </Button>
              {onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Usage Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">💡 Usage Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• AI generates personalized messages based on the lead&apos;s name, role, and company</li>
            <li>• You can edit the generated message to better match your style</li>
            <li>• Copy the message and paste it directly into LinkedIn</li>
            <li>• Save your final version for future reference</li>
          </ul>
        </div>

        {/* Example Message Template */}
        {!message && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Example Message Template</h4>
            <div className="text-sm text-gray-600 italic">
              &ldquo;Hello {lead.name}, I noticed you&apos;re working at {lead.company} as a {lead.role}.
              I&apos;m interested in your company&apos;s innovation in the industry, and I&apos;d like to discuss some insights with you...&rdquo;
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {message && (
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setMessage('')}
            >
              Clear Message
            </Button>
            <Button className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Ready to Send</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 