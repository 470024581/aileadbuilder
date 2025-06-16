import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse, CreateMessageData } from '@/lib/types'

// Get messages list with lead info (for Kanban display)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const leadId = searchParams.get('lead_id')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '50')

    const selectClause = `
      id,
      lead_id,
      content,
      status,
      generated_at,
      updated_at,
      leads:lead_id(id, name, role, company, linkedin_url, created_at, updated_at)
    `

    let query = supabase
      .from('messages')
      .select(selectClause)
      .order('generated_at', { ascending: false })

    // Filter by lead
    if (leadId) {
      query = query.eq('lead_id', leadId)
    }

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Search functionality (search in message content)
    if (search) {
      query = query.ilike('content', `%${search}%`)
    }

    // Pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    query = query.range(start, end)

    const { data, error, count } = await query

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' } as ApiResponse,
        { status: 500 }
      )
    }

    // Transform data to include lead information properly
    const transformedData = data ? 
      data.map((item) => ({
        ...item,
        lead: Array.isArray(item.leads) ? item.leads[0] : item.leads
      })) : []

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      },
      message: 'Messages fetched successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

// Create new message
export async function POST(request: NextRequest) {
  try {
    const body: CreateMessageData = await request.json()

    // Basic validation
    if (!body.lead_id || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Lead ID and content are required' } as ApiResponse,
        { status: 400 }
      )
    }

    // Verify lead exists
    const { data: leadExists } = await supabase
      .from('leads')
      .select('id')
      .eq('id', body.lead_id)
      .single()

    if (!leadExists) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' } as ApiResponse,
        { status: 404 }
      )
    }

    const messageData = {
      lead_id: body.lead_id,
      content: body.content.trim(),
      status: body.status || 'draft',
      generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
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
      console.error('Error creating message:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create message' } as ApiResponse,
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
      message: 'Message created successfully'
    } as ApiResponse, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
} 