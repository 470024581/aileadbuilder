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
import { Lead, LeadStatus } from '@/lib/types'
import { 
  MessageSquare, 
  ExternalLink,
  Clock,
  CheckCircle,
  Send,
  Edit,
  Trash2
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface KanbanBoardProps {
  leads: Lead[]
  onStatusChange: (id: string, status: LeadStatus) => void
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onGenerateMessage: (lead: Lead) => void
}

interface Column {
  id: LeadStatus
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

function SortableLeadCard({ 
  lead, 
  onEdit, 
  onDelete, 
  onGenerateMessage 
}: { 
  lead: Lead
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onGenerateMessage: (lead: Lead) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

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
              <CardTitle className="text-sm font-medium">{lead.name}</CardTitle>
              <CardDescription className="text-xs">
                {lead.role} at {lead.company}
              </CardDescription>
            </div>
            {lead.linkedin_url && (
              <a 
                href={lead.linkedin_url}
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
            {formatRelativeTime(lead.created_at)}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onGenerateMessage(lead)
                }}
                className="h-6 px-2 text-xs"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Message
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(lead)
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
                onDelete(lead.id)
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
  leads, 
  onEdit, 
  onDelete, 
  onGenerateMessage 
}: { 
  column: Column
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onDelete: (id: string) => void
  onGenerateMessage: (lead: Lead) => void
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
              {leads.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div 
            ref={setNodeRef}
            className="min-h-96"
          >
            <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {leads.map((lead) => (
                  <SortableLeadCard
                    key={lead.id}
                    lead={lead}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onGenerateMessage={onGenerateMessage}
                  />
                ))}
                {leads.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No leads in {column.title.toLowerCase()}
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

export function KanbanBoard({
  leads,
  onStatusChange,
  onEdit,
  onDelete,
  onGenerateMessage,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group leads by status
  const leadsByStatus = leads.reduce((acc, lead) => {
    if (!acc[lead.status]) {
      acc[lead.status] = []
    }
    acc[lead.status].push(lead)
    return acc
  }, {} as Record<LeadStatus, Lead[]>)

  // Find the active lead for drag overlay
  const activeLead = activeId ? leads.find(lead => lead.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeLeadId = active.id as string
    const overId = over.id as string

    // Find the active lead
    const activeLead = leads.find(lead => lead.id === activeLeadId)
    if (!activeLead) {
      setActiveId(null)
      return
    }

    // Determine target status
    let targetStatus: LeadStatus

    // Check if dropped directly on a column
    if (columns.some(col => col.id === overId)) {
      targetStatus = overId as LeadStatus
    } else {
      // If dropped on another lead, use that lead's status
      const targetLead = leads.find(lead => lead.id === overId)
      if (targetLead) {
        targetStatus = targetLead.status
      } else {
        setActiveId(null)
        return
      }
    }

    // Only update if status changed
    if (activeLead.status !== targetStatus) {
      onStatusChange(activeLeadId, targetStatus)
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
            leads={leadsByStatus[column.id] || []}
            onEdit={onEdit}
            onDelete={onDelete}
            onGenerateMessage={onGenerateMessage}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <Card className="cursor-grabbing shadow-lg rotate-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{activeLead.name}</CardTitle>
              <CardDescription className="text-xs">
                {activeLead.role} at {activeLead.company}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
} 