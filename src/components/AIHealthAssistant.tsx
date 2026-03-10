'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  MessageCircle, Send, Bot, User, Heart, AlertTriangle, 
  Hospital, Stethoscope, Clock, CheckCircle, ArrowRight,
  Sparkles, Phone, MapPin, Info, X, Minimize2, Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

type AssistantType = 'romjan' | 'fatimah'
type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'

interface Message {
  id: string
  sender: 'patient' | 'romjan' | 'fatimah' | 'system'
  message: string
  timestamp: Date
  type?: 'text' | 'symptom' | 'assessment' | 'recommendation' | 'options'
  options?: string[]
  metadata?: any
}

interface AssessmentResult {
  primarySymptom: string
  symptoms: string[]
  urgency: UrgencyLevel
  recommendation: string
  suggestedSpecialty?: string
  needsDoctor: boolean
  needsHospital: boolean
}

interface AIHealthAssistantProps {
  patientId: string
  patientName: string
  patientAge?: number
  onSessionComplete?: (sessionId: string, result: AssessmentResult) => void
  onEscalateToDoctor?: (sessionId: string, doctorId: string) => void
  onEscalateToHospital?: (sessionId: string) => void
  language?: 'bn' | 'en'
}

// ============================================================================
// ASSISTANT PERSONALITIES
// ============================================================================

const ASSISTANT_CONFIG = {
  romjan: {
    name: { bn: 'রমজান আলী', en: 'Romjan Ali' },
    nameFull: { bn: 'আমি রমজান আলী, আপনার AI স্বাস্থ্য সহকারী', en: "I'm Romjan Ali, your AI Health Assistant" },
    avatar: '/ai-assistants/romjan.png',
    fallback: 'RA',
    greeting: {
      bn: 'আসসালামু আলাইকুম! আমি রমজান আলী। আপনার স্বাস্থ্য সমস্যা নিয়ে আলোচনা করতে পারেন। আমি আপনাকে সঠিক ডাক্তার বা চিকিৎসা পরিষেবা খুঁজে পেতে সাহায্য করব।',
      en: "Assalamu Alaikum! I'm Romjan Ali. Feel free to discuss your health concerns. I'll help you find the right doctor or medical service."
    },
    personality: {
      bn: 'বন্ধুত্বপূর্ণ, ধৈর্যশীল, বিস্তারিত ব্যাখ্যা দেয়',
      en: 'Friendly, patient, provides detailed explanations'
    }
  },
  fatimah: {
    name: { bn: 'ফাতিমা রহমত', en: 'Fatimah Rahmat' },
    nameFull: { bn: 'আমি ফাতিমা রহমত, আপনার AI স্বাস্থ্য সহকারী', en: "I'm Fatimah Rahmat, your AI Health Assistant" },
    avatar: '/ai-assistants/fatimah.png',
    fallback: 'FR',
    greeting: {
      bn: 'আসসালামু আলাইকুম! আমি ফাতিমা রহমত। আপনার স্বাস্থ্য নিয়ে কোনো চিন্তা থাকলে নিশ্চিন্তে বলুন। আমি আপনাকে সেরা চিকিৎসা পরামর্শ দিতে সাহায্য করব।',
      en: "Assalamu Alaikum! I'm Fatimah Rahmat. Feel free to share any health concerns. I'll help you get the best medical guidance."
    },
    personality: {
      bn: 'মমতাশীল, যত্নবান, সহজ ভাষায় বোঝায়',
      en: 'Caring, attentive, explains in simple terms'
    }
  }
}

// ============================================================================
// SYMPTOM ASSESSMENT ENGINE
// ============================================================================

const SYMPTOM_CATEGORIES = {
  emergency: {
    symptoms: ['chest pain', 'difficulty breathing', 'severe bleeding', 'unconsciousness', 'stroke symptoms', 'severe allergic reaction', 'seizure', 'বুকে ব্যথা', 'শ্বাসকষ্ট', 'গুরুতর রক্তপাত', 'অজ্ঞান'],
    urgency: 'EMERGENCY' as UrgencyLevel,
    message: {
      bn: '⚠️ এটি জরুরি অবস্থা! অবিলম্বে নিকটতম হাসপাতালে যান বা ১০৬৬ নম্বরে কল করুন।',
      en: '⚠️ This is an emergency! Please go to the nearest hospital immediately or call 1066.'
    }
  },
  high: {
    symptoms: ['high fever', 'severe pain', 'vomiting blood', 'sudden vision loss', 'severe headache', 'high fever with rash', 'উচ্চ জ্বর', 'তীব্র ব্যথা', 'রক্ত বমি'],
    urgency: 'HIGH' as UrgencyLevel,
    message: {
      bn: 'আপনার অবস্থা গুরুত্বপূর্ণ। আজই ডাক্তারের পরামর্শ নিন।',
      en: 'Your condition is serious. Please consult a doctor today.'
    }
  },
  medium: {
    symptoms: ['persistent cough', 'moderate fever', 'stomach pain', 'skin rash', 'joint pain', 'persistent cough', 'জ্বর', 'পেট ব্যথা', 'গেঁটে বাত', 'ত্বকে ফুসকুড়ি'],
    urgency: 'MEDIUM' as UrgencyLevel,
    message: {
      bn: 'আপনার উপসর্গগুলি ডাক্তারের পরামর্শ প্রয়োজন। একটি অ্যাপয়েন্টমেন্ট নিন।',
      en: 'Your symptoms require doctor consultation. Please book an appointment.'
    }
  },
  low: {
    symptoms: ['mild cold', 'minor headache', 'fatigue', 'mild indigestion', 'slight fever', 'সামান্য সর্দি', 'মাথাব্যথা', 'ক্লান্তি'],
    urgency: 'LOW' as UrgencyLevel,
    message: {
      bn: 'আপনার উপসর্গ তুলনামূলকভাবে হালকা। প্রয়োজনে ডাক্তারের সাথে পরামর্শ করতে পারেন।',
      en: 'Your symptoms are relatively mild. You may consult a doctor if needed.'
    }
  }
}

const SPECIALTY_MAPPING: Record<string, string[]> = {
  'সাধারণ চিকিৎসা': ['fever', 'cold', 'cough', 'general health', 'জ্বর', 'সর্দি', 'কাশি'],
  'হৃদরোগ বিশেষজ্ঞ': ['chest pain', 'heart', 'palpitation', 'বুকে ব্যথা', 'হৃদযন্ত্র'],
  'স্নায়ু রোগ বিশেষজ্ঞ': ['headache', 'dizziness', 'numbness', 'মাথাব্যথা', 'ঝিনুনি'],
  'ত্বক রোগ বিশেষজ্ঞ': ['skin', 'rash', 'itching', 'ত্বক', 'ফুসকুড়ি', 'চুলকানি'],
  'গাইনি ও প্রসূতি': ['pregnancy', 'menstrual', 'female health', 'গর্ভাবস্থা', 'মাসিক'],
  'শিশু রোগ বিশেষজ্ঞ': ['child', 'baby', 'pediatric', 'শিশু', 'বাচ্চা'],
  'অর্থোপেডিক্স': ['bone', 'joint', 'fracture', 'হাড়', 'জয়েন্ট', 'ভাঙা'],
  'চক্ষু রোগ বিশেষজ্ঞ': ['eye', 'vision', 'চোখ', 'দৃষ্টি'],
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AIHealthAssistant({
  patientId,
  patientName,
  patientAge = 30,
  onSessionComplete,
  onEscalateToDoctor,
  onEscalateToHospital,
  language = 'bn'
}: AIHealthAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantType | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentStep, setCurrentStep] = useState<'select' | 'chat' | 'assessment' | 'result'>('select')
  const [sessionId, setSessionId] = useState<string>('')
  const [assessmentData, setAssessmentData] = useState<{
    symptoms: string[]
    duration: string
    severity: number
    additionalInfo: string[]
  }>({
    symptoms: [],
    duration: '',
    severity: 1,
    additionalInfo: []
  })
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = useCallback((key: string) => {
    const translations: Record<string, Record<string, string>> = {
      selectAssistant: { bn: 'আপনার সহকারী নির্বাচন করুন', en: 'Select Your Assistant' },
      type: { bn: 'আপনার সমস্যা লিখুন...', en: 'Type your concern...' },
      send: { bn: 'পাঠান', en: 'Send' },
      startAssessment: { bn: 'মূল্যায়ন শুরু করুন', en: 'Start Assessment' },
      bookDoctor: { bn: 'ডাক্তার বুক করুন', en: 'Book Doctor' },
      findHospital: { bn: 'হাসপাতাল খুঁজুন', en: 'Find Hospital' },
      endChat: { bn: 'চ্যাট শেষ করুন', en: 'End Chat' },
      newChat: { bn: 'নতুন চ্যাট', en: 'New Chat' },
      disclaimer: { 
        bn: '⚠️ আমি চিকিৎসা পেশাজীবী নই। আমি কখনো প্রেসক্রিপশন দিব না। আমি শুধুমাত্র আপনাকে সঠিক চিকিৎসা পরিষেবা খুঁজে পেতে সাহায্য করি।',
        en: '⚠️ I am not a medical professional. I will never provide prescriptions. I only help you find the right medical service.'
      }
    }
    return translations[key]?.[language] || key
  }, [language])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Generate session ID
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }, [])

  // Add message helper
  const addMessage = useCallback((sender: Message['sender'], message: string, type?: Message['type'], options?: string[], metadata?: any) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      sender,
      message,
      timestamp: new Date(),
      type,
      options,
      metadata
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage.id
  }, [])

  // Simulate AI response
  const generateAIResponse = useCallback(async (userMessage: string) => {
    setIsTyping(true)
    
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    const config = ASSISTANT_CONFIG[selectedAssistant!]
    
    // Analyze symptoms
    const lowerMessage = userMessage.toLowerCase()
    let urgency: UrgencyLevel = 'LOW'
    let matchedCategory: { category: string; symptoms: string[]; urgency: UrgencyLevel; message: { bn: string; en: string } } | null = null
    
    for (const [category, data] of Object.entries(SYMPTOM_CATEGORIES)) {
      for (const symptom of data.symptoms) {
        if (lowerMessage.includes(symptom.toLowerCase())) {
          urgency = data.urgency
          matchedCategory = { category, ...data }
          break
        }
      }
      if (matchedCategory) break
    }

    // Find suggested specialty
    let suggestedSpecialty = 'সাধারণ চিকিৎসা'
    for (const [specialty, keywords] of Object.entries(SPECIALTY_MAPPING)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          suggestedSpecialty = specialty
          break
        }
      }
    }

    // Generate response based on urgency and patient age
    const isElderly = patientAge >= 60
    const isYoung = patientAge < 25
    
    let response = ''
    
    if (matchedCategory && matchedCategory.urgency === 'EMERGENCY') {
      response = `${config.name[language]}: ${matchedCategory.message[language]}\n\n`
      response += language === 'bn' 
        ? `⚠️ অনুগ্রহ করে দেরি না করে চিকিৎসা নিন। আপনার জীবন মূল্যবান।`
        : `⚠️ Please seek medical attention immediately. Your life is precious.`
    } else if (matchedCategory && matchedCategory.urgency === 'HIGH') {
      response = `${config.name[language]}: ${matchedCategory.message[language]}\n\n`
      if (isElderly) {
        response += language === 'bn'
          ? `আপনার বয়স বিবেচনা করে, আমি পরামর্শ দিচ্ছি আজই একজন বিশেষজ্ঞ ডাক্তারের সাথে দেখা করুন।`
          : `Considering your age, I recommend seeing a specialist doctor today.`
      }
      response += language === 'bn'
        ? `\n\nআমি কি আপনাকে "${suggestedSpecialty}" বিশেষজ্ঞের সাথে সংযোগ করতে সাহায্য করতে পারি?`
        : `\n\nCan I help you connect with a "${suggestedSpecialty}" specialist?`
    } else {
      // Normal conversational response
      const responses = language === 'bn' ? [
        `আপনার বর্ণনা থেকে বুঝতে পারছি আপনি "${suggestedSpecialty}" বিশেষজ্ঞের পরামর্শ নিতে পারেন।`,
        `আমি আপনার উপসর্গ বুঝতে পেরেছি। আরও কিছু জানতে চান?`,
        `এই ধরনের সমস্যার জন্য "${suggestedSpecialty}" বিশেষজ্ঞের সাথে পরামর্শ করা ভালো।`
      ] : [
        `From your description, I understand you may benefit from consulting a "${suggestedSpecialty}" specialist.`,
        `I understand your symptoms. Would you like to know more?`,
        `For this type of issue, it's good to consult with a "${suggestedSpecialty}" specialist.`
      ]
      
      response = responses[Math.floor(Math.random() * responses.length)]
      
      if (isYoung) {
        response += language === 'bn'
          ? `\n\n😊 আপনি যদি আরও কিছু জানতে চান, নিশ্চিন্তে জিজ্ঞাসা করতে পারেন!`
          : `\n\n😊 If you have more questions, feel free to ask!`
      }
    }

    setIsTyping(false)
    addMessage(selectedAssistant!, response, 'text')
    
    // Update assessment data
    setAssessmentData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, userMessage]
    }))

    // Set assessment result
    setAssessmentResult({
      primarySymptom: userMessage,
      symptoms: [userMessage],
      urgency,
      recommendation: matchedCategory?.message[language] || (language === 'bn' ? 'ডাক্তারের সাথে পরামর্শ করুন' : 'Consult with a doctor'),
      suggestedSpecialty,
      needsDoctor: urgency !== 'EMERGENCY',
      needsHospital: urgency === 'EMERGENCY'
    })
  }, [selectedAssistant, language, patientAge, addMessage])

  // Handle assistant selection
  const handleSelectAssistant = (type: AssistantType) => {
    setSelectedAssistant(type)
    setCurrentStep('chat')
    const config = ASSISTANT_CONFIG[type]
    addMessage(type, config.greeting[language], 'text')
    
    // Add disclaimer
    setTimeout(() => {
      addMessage('system', t('disclaimer'), 'text')
    }, 500)
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    addMessage('patient', inputValue, 'text')
    setInputValue('')
    await generateAIResponse(inputValue)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle end chat
  const handleEndChat = async () => {
    if (assessmentResult && sessionId) {
      // Save to database via API
      try {
        await fetch('/api/ai-assistant/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            patientId,
            assistantType: selectedAssistant,
            messages,
            assessmentResult
          })
        })
      } catch (error) {
        console.error('Failed to save session:', error)
      }
      
      onSessionComplete?.(sessionId, assessmentResult)
    }
    
    setIsOpen(false)
    setMessages([])
    setSelectedAssistant(null)
    setCurrentStep('select')
    setAssessmentResult(null)
  }

  // Handle book doctor
  const handleBookDoctor = () => {
    if (assessmentResult && sessionId) {
      onEscalateToDoctor?.(sessionId, '')
    }
    setIsOpen(false)
  }

  // Handle find hospital
  const handleFindHospital = () => {
    if (assessmentResult && sessionId) {
      onEscalateToHospital?.(sessionId)
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full",
          "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg",
          "hover:shadow-xl hover:scale-105 transition-all duration-300",
          "animate-pulse hover:animate-none"
        )}
      >
        <Bot className="h-5 w-5" />
        <span className="font-medium">{language === 'bn' ? 'AI স্বাস্থ্য সহকারী' : 'AI Health Assistant'}</span>
      </button>

      {/* Chat Window */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={cn(
          "sm:max-w-[500px] h-[700px] flex flex-col p-0 gap-0",
          isMinimized && "h-auto"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              {selectedAssistant && (
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={ASSISTANT_CONFIG[selectedAssistant].avatar} />
                  <AvatarFallback className="bg-white text-emerald-600 font-bold">
                    {ASSISTANT_CONFIG[selectedAssistant].fallback}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h3 className="font-bold">
                  {selectedAssistant 
                    ? ASSISTANT_CONFIG[selectedAssistant].name[language]
                    : (language === 'bn' ? 'AI স্বাস্থ্য সহকারী' : 'AI Health Assistant')
                  }
                </h3>
                <p className="text-xs text-emerald-100">
                  {selectedAssistant 
                    ? ASSISTANT_CONFIG[selectedAssistant].nameFull[language]
                    : (language === 'bn' ? 'Doctor360' : 'Doctor360')
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {currentStep === 'select' && (
                  <div className="p-6 h-full flex flex-col items-center justify-center">
                    <h3 className="text-xl font-bold text-center mb-6">{t('selectAssistant')}</h3>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                      {/* Romjan Card */}
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all hover:border-emerald-500"
                        onClick={() => handleSelectAssistant('romjan')}
                      >
                        <CardContent className="p-4 text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-emerald-100">
                            <AvatarImage src="/ai-assistants/romjan.png" />
                            <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xl font-bold">RA</AvatarFallback>
                          </Avatar>
                          <h4 className="font-bold text-lg">{ASSISTANT_CONFIG.romjan.name[language]}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {language === 'bn' ? 'পুরুষ সহকারী' : 'Male Assistant'}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {language === 'bn' ? 'বন্ধুত্বপূর্ণ' : 'Friendly'}
                          </Badge>
                        </CardContent>
                      </Card>

                      {/* Fatimah Card */}
                      <Card 
                        className="cursor-pointer hover:shadow-lg transition-all hover:border-pink-500"
                        onClick={() => handleSelectAssistant('fatimah')}
                      >
                        <CardContent className="p-4 text-center">
                          <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-pink-100">
                            <AvatarImage src="/ai-assistants/fatimah.png" />
                            <AvatarFallback className="bg-pink-100 text-pink-600 text-xl font-bold">FR</AvatarFallback>
                          </Avatar>
                          <h4 className="font-bold text-lg">{ASSISTANT_CONFIG.fatimah.name[language]}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {language === 'bn' ? 'মহিলা সহকারী' : 'Female Assistant'}
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            {language === 'bn' ? 'যত্নবান' : 'Caring'}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {currentStep === 'chat' && (
                  <div className="h-full flex flex-col">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex gap-3",
                              msg.sender === 'patient' ? "justify-end" : "justify-start"
                            )}
                          >
                            {msg.sender !== 'patient' && msg.sender !== 'system' && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={ASSISTANT_CONFIG[msg.sender as AssistantType]?.avatar} />
                                <AvatarFallback className={cn(
                                  msg.sender === 'romjan' ? "bg-emerald-100 text-emerald-600" : "bg-pink-100 text-pink-600"
                                )}>
                                  {ASSISTANT_CONFIG[msg.sender as AssistantType]?.fallback}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-2",
                                msg.sender === 'patient' 
                                  ? "bg-emerald-500 text-white rounded-br-none"
                                  : msg.sender === 'system'
                                    ? "bg-amber-50 text-amber-800 border border-amber-200 text-sm"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                              )}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                              <p className="text-xs opacity-50 mt-1">
                                {msg.timestamp.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex gap-3 justify-start">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={cn(
                                selectedAssistant === 'romjan' ? "bg-emerald-100 text-emerald-600" : "bg-pink-100 text-pink-600"
                              )}>
                                {selectedAssistant === 'romjan' ? 'RA' : 'FR'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                              <div className="flex gap-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Assessment Result Actions */}
                    {assessmentResult && (
                      <div className="p-4 border-t bg-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                          {assessmentResult.urgency === 'EMERGENCY' && (
                            <Badge variant="destructive" className="animate-pulse">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {language === 'bn' ? 'জরুরি' : 'Emergency'}
                            </Badge>
                          )}
                          {assessmentResult.urgency === 'HIGH' && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {language === 'bn' ? 'গুরুত্বপূর্ণ' : 'Urgent'}
                            </Badge>
                          )}
                          {assessmentResult.urgency === 'MEDIUM' && (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              {language === 'bn' ? 'মধ্যম' : 'Moderate'}
                            </Badge>
                          )}
                          {assessmentResult.urgency === 'LOW' && (
                            <Badge variant="outline">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {language === 'bn' ? 'সাধারণ' : 'Normal'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {assessmentResult.needsHospital && (
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={handleFindHospital}
                            >
                              <Hospital className="h-4 w-4 mr-2" />
                              {t('findHospital')}
                            </Button>
                          )}
                          {assessmentResult.needsDoctor && (
                            <Button 
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                              onClick={handleBookDoctor}
                            >
                              <Stethoscope className="h-4 w-4 mr-2" />
                              {t('bookDoctor')}
                            </Button>
                          )}
                          <Button variant="outline" onClick={handleEndChat}>
                            {t('endChat')}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={t('type')}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AIHealthAssistant
