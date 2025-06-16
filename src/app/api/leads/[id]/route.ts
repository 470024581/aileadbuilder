import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse, UpdateLeadData } from '@/lib/types'

// Get single lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching lead:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch lead' } as ApiResponse,
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' } as ApiResponse,
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

// Update lead logic (shared between PATCH and PUT)
async function updateLead(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateLeadData = await request.json()

    // LinkedIn URL validation
    if (body.linkedin_url && body.linkedin_url.trim() !== '') {
      const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
      if (!linkedinPattern.test(body.linkedin_url)) {
        return NextResponse.json(
          { success: false, error: 'Invalid LinkedIn URL format' } as ApiResponse,
          { status: 400 }
        )
      }
    }

    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update lead' } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Lead updated successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

// Update lead (PATCH method)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateLead(request, { params })
}

// Update lead (PUT method - alias for PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateLead(request, { params })
}

// Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // First delete associated messages
    await supabase
      .from('messages')
      .delete()
      .eq('lead_id', id)

    // Then delete the lead
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lead:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete lead' } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
} 