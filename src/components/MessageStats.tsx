import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageWithLead } from '@/lib/types'
import { Clock, CheckCircle, Send, MessageSquare } from 'lucide-react'

interface MessageStatsProps {
  messages: MessageWithLead[]
}

export function MessageStats({ messages }: MessageStatsProps) {
  const stats = {
    total: messages.length,
    draft: messages.filter(m => m.status === 'draft').length,
    approved: messages.filter(m => m.status === 'approved').length,
    sent: messages.filter(m => m.status === 'sent').length,
  }

  const statItems = [
    {
      label: 'Total Messages',
      value: stats.total,
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Draft',
      value: stats.draft,
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-gray-50 text-gray-700 border-gray-200'
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      label: 'Sent',
      value: stats.sent,
      icon: <Send className="w-4 h-4" />,
      color: 'bg-green-50 text-green-700 border-green-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <Card key={item.label} className={`border ${item.color}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.label}
            </CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            {stats.total > 0 && (
              <p className="text-xs text-muted-foreground">
                {Math.round((item.value / stats.total) * 100)}% of total
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 