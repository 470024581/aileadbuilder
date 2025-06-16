import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GenerateMessageParams {
  name: string
  role: string
  company: string
  linkedinUrl?: string
}

export interface GenerateMessageResponse {
  message: string
  tokensUsed?: number
  model?: string
}

// Generate personalized LinkedIn message using OpenAI
export async function generateLinkedInMessage({
  name,
  role,
  company,
  linkedinUrl
}: GenerateMessageParams): Promise<GenerateMessageResponse> {
  try {
    const prompt = `You are a professional business development expert. Create a personalized LinkedIn connection request message for the following lead:

Name: ${name}
Role: ${role}
Company: ${company}
${linkedinUrl ? `LinkedIn Profile: ${linkedinUrl}` : ''}

Requirements:
1. Keep the message under 300 characters (LinkedIn limit)
2. Be professional but friendly
3. Mention something specific about their role or company
4. Include a clear reason for connecting
5. End with a call to action
6. Do not use overly salesy language
7. Make it sound natural and genuine

Generate only the message content, without any additional text or formatting.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional business development expert who creates personalized, effective LinkedIn connection messages.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    // Add delay to avoid API rate limits
    await new Promise(resolve => setTimeout(resolve, 100))

    const message = completion.choices[0]?.message?.content?.trim() || ''
    
    if (!message) {
      throw new Error('No message generated from OpenAI')
    }

    return {
      message,
      tokensUsed: completion.usage?.total_tokens,
      model: completion.model
    }

  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    if (error instanceof Error) {
      throw new Error(`Failed to generate message: ${error.message}`)
    }
    
    throw new Error('Failed to generate message: Unknown error')
  }
}

// Alternative message templates for fallback
export const fallbackMessages = [
  "Hi {name}, I noticed your work at {company} as {role}. I'd love to connect and learn more about your experience in the industry. Looking forward to connecting!",
  "Hello {name}, Your role as {role} at {company} caught my attention. I'd be interested in connecting to discuss industry trends and potential collaboration opportunities.",
  "Hi {name}, I came across your profile and was impressed by your work at {company}. As someone in the {role} space, I'd value connecting with you to share insights.",
]

// Generate message using fallback templates
export function generateFallbackMessage(params: GenerateMessageParams): string {
  const template = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
  
  return template
    .replace('{name}', params.name)
    .replace('{role}', params.role)
    .replace('{company}', params.company)
}

export async function generateBulkMessages(
  leads: Array<{ name: string; role: string; company: string }>
): Promise<Array<{ lead: typeof leads[0]; message: string }>> {
  const results = []
  
  for (const lead of leads) {
    try {
      const response = await generateLinkedInMessage(lead)
      results.push({ lead, message: response.message })
      // Add delay to avoid API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Failed to generate message for ${lead.name}:`, error)
      results.push({ 
        lead, 
        message: `Sorry, failed to generate message for ${lead.name}` 
      })
    }
  }
  
  return results
} 