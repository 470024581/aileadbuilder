import { NextRequest, NextResponse } from 'next/server'
import { generateLinkedInMessage } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leadId, name, role, company, linkedinUrl, saveToDb = true } = body

    // Validate required fields
    if (!name || !role || !company) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, role, company'
      }, { status: 400 })
    }

    // Generate message using OpenAI
    const result = await generateLinkedInMessage({
      name,
      role,
      company,
      linkedinUrl
    })

    let savedMessage = null

    // Save to database if requested and leadId is provided
    if (saveToDb && leadId) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            lead_id: leadId,
            content: result.message,
            status: 'draft'  // New messages start as draft
          })
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
          console.error('Database save error:', error)
          // Continue without failing the entire request
        } else {
          // Transform data to include lead information properly
          savedMessage = {
            ...data,
            lead: Array.isArray(data.leads) ? data.leads[0] : data.leads
          }
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        // Continue without failing the entire request
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: result.message,
        tokensUsed: result.tokensUsed,
        model: result.model,
        savedToDb: !!savedMessage,
        messageId: savedMessage?.id
      }
    })

  } catch (error) {
    console.error('Message generation error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate message'
    }, { status: 500 })
  }
} 