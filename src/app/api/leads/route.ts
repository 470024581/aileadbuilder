import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateLeadData, ApiResponse } from '@/lib/types'

// Get all leads (without status filtering since status moved to messages)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('page_size') || '20')
    const search = searchParams.get('search')

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    // Search functionality
    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,role.ilike.%${search}%`)
    }

    // Pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    query = query.range(start, end)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leads' } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      },
      message: 'Leads fetched successfully'
    } as ApiResponse)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

// Create new lead
export async function POST(request: NextRequest) {
  try {
    const body: CreateLeadData = await request.json()

    // Basic validation
    if (!body.name || !body.role || !body.company) {
      return NextResponse.json(
        { success: false, error: 'Name, role, and company are required fields' } as ApiResponse,
        { status: 400 }
      )
    }

    // LinkedIn URL validation
    if (body.linkedin_url && !isValidLinkedInUrl(body.linkedin_url)) {
      return NextResponse.json(
        { success: false, error: 'Invalid LinkedIn URL format' } as ApiResponse,
        { status: 400 }
      )
    }

    const leadData = {
      name: body.name.trim(),
      role: body.role.trim(),
      company: body.company.trim(),
      linkedin_url: body.linkedin_url?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create lead' } as ApiResponse,
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Lead created successfully'
    } as ApiResponse, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' } as ApiResponse,
      { status: 500 }
    )
  }
}

// LinkedIn URL validation function
function isValidLinkedInUrl(url: string): boolean {
  const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
  return linkedinPattern.test(url)
} 