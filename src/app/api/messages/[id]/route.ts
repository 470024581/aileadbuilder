import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/types'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Get single message
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        lead_id,
        content,
        status,
        generated_at,
        updated_at,
        leads:lead_id(id, name, role, company, linkedin_url, created_at, updated_at)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Message not found' } as ApiResponse,
          { status: 404 }
        )
      }
      console.error('Database query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch message' } as ApiResponse,
        { status: 500 }
      )
    }

    // Transform data to include lead information properly
    const transformedData = {
      ...data,
      lead: Array.isArray(data.leads) ? data.leads[0] : data.leads
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: 'Message fetched successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

// Update message (PATCH for partial updates)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const allowedFields = ['content', 'status'] as const
    const updateData: {
      content?: string
      status?: string
      updated_at?: string
    } = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' } as ApiResponse,
        { status: 400 }
      )
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    // Validate status if provided
    if (updateData.status && !['draft', 'approved', 'sent'].includes(updateData.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be draft, approved, or sent' } as ApiResponse,
        { status: 400 }
      )
    }

    // Trim content if provided
    if (updateData.content) {
      updateData.content = updateData.content.trim()
      if (!updateData.content) {
        return NextResponse.json(
          { success: false, error: 'Content cannot be empty' } as ApiResponse,
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        lead_id,
        content,
        status,
        generated_at,
        updated_at,
        leads:lead_id(id, name, role, company, linkedin_url, created_at, updated_at)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Message not found' } as ApiResponse,
          { status: 404 }
        )
      }
      console.error('Database update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update message' } as ApiResponse,
        { status: 500 }
      )
    }

    // Transform data to include lead information properly
    const transformedData = {
      ...data,
      lead: Array.isArray(data.leads) ? data.leads[0] : data.leads
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: 'Message updated successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

// Update entire message (PUT for full updates)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.content || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Content and status are required' } as ApiResponse,
        { status: 400 }
      )
    }

    // Validate status
    if (!['draft', 'approved', 'sent'].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be draft, approved, or sent' } as ApiResponse,
        { status: 400 }
      )
    }

    const updateData = {
      content: body.content.trim(),
      status: body.status,
      updated_at: new Date().toISOString()
    }

    if (!updateData.content) {
      return NextResponse.json(
        { success: false, error: 'Content cannot be empty' } as ApiResponse,
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        lead_id,
        content,
        status,
        generated_at,
        updated_at,
        leads:lead_id(id, name, role, company, linkedin_url, created_at, updated_at)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Message not found' } as ApiResponse,
          { status: 404 }
        )
      }
      console.error('Database update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update message' } as ApiResponse,
        { status: 500 }
      )
    }

    // Transform data to include lead information properly
    const transformedData = {
      ...data,
      lead: Array.isArray(data.leads) ? data.leads[0] : data.leads
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
      message: 'Message updated successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

// Delete message
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // First check if message exists
    const { data: existingMessage, error: fetchError } = await supabase
      .from('messages')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingMessage) {
      return NextResponse.json(
        { success: false, error: 'Message not found' } as ApiResponse,
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete message' } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Message deleted successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
} 