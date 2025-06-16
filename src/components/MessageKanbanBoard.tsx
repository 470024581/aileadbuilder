"use client"

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import {
  useDroppable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageWithLead, MessageStatus } from '@/lib/types'
import { 
  ExternalLink,
  Clock,
  CheckCircle,
  Send,
  Edit,
  Trash2,
  RotateCcw,
  Loader2
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface MessageKanbanBoardProps {
  messages: MessageWithLead[]
  onStatusChange: (id: string, status: MessageStatus) => void
  onEdit: (message: MessageWithLead) => void
  onDelete: (id: string) => void
  onRegenerateMessage: (message: MessageWithLead) => void
  regeneratingMessageId?: string | null
}

interface Column {
  id: MessageStatus
  title: string
  icon: React.ReactNode
  color: string
}

const columns: Column[] = [
  {
    id: 'draft',
    title: 'Draft',
    icon: <Clock className="w-4 h-4" />,
    color: 'bg-gray-50 border-gray-200'
  },
  {
    id: 'approved',
    title: 'Approved',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'sent',
    title: 'Sent',
    icon: <Send className="w-4 h-4" />,
    color: 'bg-green-50 border-green-200'
  }
]

function SortableMessageCard({ 
  message, 
  onEdit, 
  onDelete, 
  onRegenerateMessage,
  regeneratingMessageId
}: { 
  message: MessageWithLead
  onEdit: (message: MessageWithLead) => void
  onDelete: (id: string) => void
  onRegenerateMessage: (message: MessageWithLead) => void
  regeneratingMessageId?: string | null
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: message.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium">{message.lead.name}</CardTitle>
              <CardDescription className="text-xs">
                {message.lead.role} at {message.lead.company}
              </CardDescription>
            </div>
            {message.lead.linkedin_url && (
              <a 
                href={message.lead.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-gray-500 mb-2">
            {formatRelativeTime(message.generated_at)}
          </div>
          
          {/* Message preview */}
          <div className="text-xs text-gray-700 mb-3 p-2 bg-gray-50 rounded max-h-20 overflow-hidden">
            {message.content}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRegenerateMessage(message)
                }}
                disabled={regeneratingMessageId === message.id}
                className="h-6 px-2 text-xs"
              >
                {regeneratingMessageId === message.id ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Regenerate
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(message)
                }}
                className="h-6 px-2 text-xs"
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(message.id)
              }}
              className="h-6 px-1 text-xs text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DroppableColumn({ 
  column, 
  messages, 
  onEdit, 
  onDelete, 
  onRegenerateMessage,
  regeneratingMessageId
}: { 
  column: Column
  messages: MessageWithLead[]
  onEdit: (message: MessageWithLead) => void
  onDelete: (id: string) => void
  onRegenerateMessage: (message: MessageWithLead) => void
  regeneratingMessageId?: string | null
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex-1 min-w-80">
      <Card className={`h-full ${column.color}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            {column.icon}
            <span>{column.title}</span>
            <Badge variant="secondary" className="text-xs">
              {messages.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div 
            ref={setNodeRef}
            className="min-h-96"
          >
            <SortableContext items={messages.map(message => message.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {messages.map((message) => (
                  <SortableMessageCard
                    key={message.id}
                    message={message}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRegenerateMessage={onRegenerateMessage}
                    regeneratingMessageId={regeneratingMessageId}
                  />
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No messages in {column.title.toLowerCase()}
                  </div>
                )}
              </div>
            </SortableContext>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function MessageKanbanBoard({
  messages,
  onStatusChange,
  onEdit,
  onDelete,
  onRegenerateMessage,
  regeneratingMessageId,
}: MessageKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group messages by status
  const messagesByStatus = messages.reduce((acc, message) => {
    if (!acc[message.status]) {
      acc[message.status] = []
    }
    acc[message.status].push(message)
    return acc
  }, {} as Record<MessageStatus, MessageWithLead[]>)

  // Find the active message for drag overlay
  const activeMessage = activeId ? messages.find(message => message.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeMessageId = active.id as string
    const overId = over.id as string

    // Find the active message
    const activeMessage = messages.find(message => message.id === activeMessageId)
    if (!activeMessage) {
      setActiveId(null)
      return
    }

    // Determine target status
    let targetStatus: MessageStatus

    // Check if dropped directly on a column
    if (columns.some(col => col.id === overId)) {
      targetStatus = overId as MessageStatus
    } else {
      // If dropped on another message, use that message's status
      const targetMessage = messages.find(message => message.id === overId)
      if (targetMessage) {
        targetStatus = targetMessage.status
      } else {
        setActiveId(null)
        return
      }
    }

    // Only update if status changed
    if (activeMessage.status !== targetStatus) {
      onStatusChange(activeMessageId, targetStatus)
    }

    setActiveId(null)
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex space-x-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            messages={messagesByStatus[column.id] || []}
            onEdit={onEdit}
            onDelete={onDelete}
            onRegenerateMessage={onRegenerateMessage}
            regeneratingMessageId={regeneratingMessageId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeMessage ? (
          <Card className="cursor-grabbing shadow-lg rotate-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{activeMessage.lead.name}</CardTitle>
              <CardDescription className="text-xs">
                {activeMessage.lead.role} at {activeMessage.lead.company}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
} 