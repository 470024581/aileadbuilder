"use client"

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageWithLead } from '@/lib/types'

const messageFormSchema = z.object({
  content: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
  status: z.enum(['draft', 'approved', 'sent'])
})

type MessageFormData = z.infer<typeof messageFormSchema>

interface MessageFormProps {
  message?: MessageWithLead
  onSubmit: (data: MessageFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function MessageForm({ message, onSubmit, onCancel, isLoading = false }: MessageFormProps) {
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: message?.content || '',
      status: message?.status || 'draft'
    }
  })

  // Reset form when message changes
  useEffect(() => {
    if (message) {
      form.reset({
        content: message.content,
        status: message.status
      })
    } else {
      form.reset({
        content: '',
        status: 'draft'
      })
    }
  }, [message, form])

  const handleSubmit = (data: MessageFormData) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          {message && (
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm font-medium">{message.lead.name}</div>
              <div className="text-xs text-gray-600">
                {message.lead.role} at {message.lead.company}
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Content</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter your LinkedIn message here..."
                    className="min-h-32 resize-none"
                  />
                </FormControl>
                <div className="text-xs text-gray-500">
                  {field.value?.length || 0}/2000 characters
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (message ? 'Update Message' : 'Save Message')}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
} 