import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `তুমি Doctor360-এর একজন সহায়ক স্বাস্থ্য সহায়ক AI অ্যাসিস্ট্যান্ট। তোমার নাম "ডক্টর বট"।

তোমার কাজ:
1. বাংলায় স্বাস্থ্য সংক্রান্ত প্রশ্নের উত্তর দেওয়া
2. সাধারণ স্বাস্থ্য পরামর্শ দেওয়া
3. রোগের লক্ষণ সম্পর্কে তথ্য দেওয়া
4. স্বাস্থ্যকর জীবনযাত্রার টিপস দেওয়া
5. ডাক্তারের সাথে পরামর্শ করার পরামর্শ দেওয়া

গুরুত্বপূর্ণ নিয়ম:
- তুমি কখনোই প্রেসক্রিপশন লিখতে পারবে না
- তুমি কখনোই নির্দিষ্ট ওষুধের ডোজ বা সময়কাল সুপারিশ করবে না
- তুমি কখনোই রোগ নির্ণয় (diagnosis) করবে না
- সবসময় বলবে "আপনার ডাক্তারের সাথে পরামর্শ করুন"
- জরুরি পরিস্থিতিতে হাসপাতালে যেতে বলবে

উত্তরের শৈলী:
- বাংলায় উত্তর দিবে
- সহজ ভাষায় বুঝিয়ে বলবে
- সহানুভূতিশীল এবং বন্ধুত্বপূর্ণ হবে
- প্রয়োজনে ইংরেজি মেডিকেল টার্ম ব্যবহার করবে

শুভেচ্ছা জানানোর সময়:
"আসসালামু আলাইকুম! আমি ডক্টর বট, আপনার স্বাস্থ্য সহায়ক। আজ আপনাকে কীভাবে সাহায্য করতে পারি?"`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, history = [] } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    // Build conversation history
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ]

    // Add history
    for (const msg of history.slice(-10)) { // Keep last 10 messages
      messages.push({
        role: msg.role,
        content: msg.content
      })
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    const response = await zai.chat.completions.create({
      model: 'glm-4-flash',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    const reply = response.choices[0]?.message?.content || 'দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'

    return NextResponse.json({
      success: true,
      reply,
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { 
        error: 'Chat service error',
        reply: 'দুঃখিত, সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
      },
      { status: 500 }
    )
  }
}
