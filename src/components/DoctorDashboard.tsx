'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  Users, Calendar, Clock, Activity, Heart, Brain, Eye, Baby, Bone,
  Stethoscope, Video, Phone, Mail, MapPin, FileText, Pill, TrendingUp,
  AlertTriangle, CheckCircle, XCircle, MessageCircle, Bot, Sparkles,
  DollarSign, BarChart3, Star, Award, Briefcase, Clock3, UserCheck,
  Building, ChevronRight, Search, Filter, Download, Printer, Send
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

interface PatientInfo {
  id: string
  name: string
  email: string
  phone?: string
  image?: string
  age: number
  gender: string
  bloodType?: string
  address?: string
  medicalHistory?: string
  insuranceProvider?: string
  lastVisit?: Date
  totalVisits: number
  upcomingAppointment?: Date
  riskLevel: 'low' | 'medium' | 'high'
  chronicConditions: string[]
  allergies: string[]
  currentMedications: string[]
}

interface AIChatSummary {
  id: string
  date: Date
  assistantType: 'ROMJAN' | 'FATIMAH'
  primarySymptom: string
  urgencyLevel: string
  summary: string
  messages: { sender: string; message: string; timestamp: Date }[]
}

interface DoctorDashboardProps {
  doctorId: string
  doctorName: string
  specialization: string
  language?: 'bn' | 'en'
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PATIENTS: PatientInfo[] = [
  {
    id: '1',
    name: 'রহিম উদ্দিন',
    email: 'rahim@doctor360.online',
    phone: '+880-1711-123456',
    age: 45,
    gender: 'পুরুষ',
    bloodType: 'B+',
    address: 'ঢাকা, বাংলাদেশ',
    lastVisit: new Date('2026-02-15'),
    totalVisits: 5,
    riskLevel: 'medium',
    chronicConditions: ['ডায়াবেটিস', 'উচ্চ রক্তচাপ'],
    allergies: ['পেনিসিলিন'],
    currentMedications: ['মেটফর্মিন ৫০০মিগ্রা', 'এমলোডিপিন ৫মিগ্রা']
  },
  {
    id: '2',
    name: 'ফাতেমা বেগম',
    email: 'fatema@doctor360.online',
    phone: '+880-1812-234567',
    age: 32,
    gender: 'মহিলা',
    bloodType: 'O+',
    address: 'চট্টগ্রাম, বাংলাদেশ',
    lastVisit: new Date('2026-03-01'),
    totalVisits: 3,
    riskLevel: 'low',
    chronicConditions: [],
    allergies: [],
    currentMedications: []
  },
  {
    id: '3',
    name: 'করিম সাহেব',
    email: 'karim@doctor360.online',
    phone: '+880-1913-345678',
    age: 68,
    gender: 'পুরুষ',
    bloodType: 'A+',
    address: 'সিলেট, বাংলাদেশ',
    lastVisit: new Date('2026-03-05'),
    totalVisits: 12,
    riskLevel: 'high',
    chronicConditions: ['হৃদরোগ', 'ডায়াবেটিস', 'কিডনি সমস্যা'],
    allergies: ['সালফা', 'এএসএ'],
    currentMedications: ['অ্যাসপিরিন', 'মেটোপ্রোলল', 'ইনসুলিন']
  }
]

const MOCK_AI_CHATS: AIChatSummary[] = [
  {
    id: 'chat_1',
    date: new Date('2026-03-09T10:30:00'),
    assistantType: 'FATIMAH',
    primarySymptom: 'বুকে ব্যথা এবং শ্বাসকষ্ট',
    urgencyLevel: 'HIGH',
    summary: 'রোগী ৩ দিন ধরে বুকে ব্যথা ও শ্বাসকষ্টে ভুগছেন। পরিস্থিতি গুরুত্বপূর্ণ।',
    messages: [
      { sender: 'patient', message: 'আমার বুকে ব্যথা হচ্ছে', timestamp: new Date('2026-03-09T10:30:00') },
      { sender: 'fatimah', message: 'বুকে ব্যথার ধরন কেমন? কতক্ষণ ধরে হচ্ছে?', timestamp: new Date('2026-03-09T10:31:00') },
      { sender: 'patient', message: '৩ দিন ধরে, বাম পাশে চাপ দিয়ে ব্যথা', timestamp: new Date('2026-03-09T10:32:00') },
    ]
  },
  {
    id: 'chat_2',
    date: new Date('2026-03-09T09:15:00'),
    assistantType: 'ROMJAN',
    primarySymptom: 'জ্বর এবং সর্দি',
    urgencyLevel: 'LOW',
    summary: 'রোগী ২ দিন ধরে জ্বর ও সর্দিতে ভুগছেন। সাধারণ ভাইরাল সংক্রমণ হতে পারে।',
    messages: [
      { sender: 'patient', message: 'আমার জ্বর হয়েছে', timestamp: new Date('2026-03-09T09:15:00') },
      { sender: 'romjan', message: 'জ্বর কত ডিগ্রি? অন্য কোনো উপসর্গ আছে?', timestamp: new Date('2026-03-09T09:16:00') },
    ]
  }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DoctorDashboard({
  doctorId,
  doctorName,
  specialization,
  language = 'bn'
}: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null)
  const [selectedChat, setSelectedChat] = useState<AIChatSummary | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [patients] = useState(MOCK_PATIENTS)
  const [aiChats] = useState(MOCK_AI_CHATS)

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      overview: { bn: 'সারসংক্ষেপ', en: 'Overview' },
      patients: { bn: 'রোগীগণ', en: 'Patients' },
      appointments: { bn: 'অ্যাপয়েন্টমেন্ট', en: 'Appointments' },
      aiChats: { bn: 'AI চ্যাট লগ', en: 'AI Chat Logs' },
      analytics: { bn: 'বিশ্লেষণ', en: 'Analytics' },
      todayAppointments: { bn: 'আজকের অ্যাপয়েন্টমেন্ট', en: "Today's Appointments" },
      totalPatients: { bn: 'মোট রোগী', en: 'Total Patients' },
      pendingReviews: { bn: 'অপেক্ষমান পর্যালোচনা', en: 'Pending Reviews' },
      monthlyRevenue: { bn: 'মাসিক আয়', en: 'Monthly Revenue' },
      recentPatients: { bn: 'সাম্প্রতিক রোগী', en: 'Recent Patients' },
      highRiskPatients: { bn: 'উচ্চ ঝুঁকিপূর্ণ রোগী', en: 'High Risk Patients' },
      aiAssistantLogs: { bn: 'AI সহকারী লগ', en: 'AI Assistant Logs' },
      viewDetails: { bn: 'বিস্তারিত দেখুন', en: 'View Details' },
      startConsultation: { bn: 'কনসাল্টেশন শুরু করুন', en: 'Start Consultation' },
      viewChatLog: { bn: 'চ্যাট লগ দেখুন', en: 'View Chat Log' },
      patientProfile: { bn: 'রোগী প্রোফাইল', en: 'Patient Profile' },
      medicalHistory: { bn: 'চিকিৎসা ইতিহাস', en: 'Medical History' },
      chronicConditions: { bn: 'দীর্ঘমেয়াদী রোগ', en: 'Chronic Conditions' },
      allergies: { bn: 'এলার্জি', en: 'Allergies' },
      currentMedications: { bn: 'বর্তমান ওষুধ', en: 'Current Medications' },
      lastVisit: { bn: 'শেষ ভিজিট', en: 'Last Visit' },
      totalVisits: { bn: 'মোট ভিজিট', en: 'Total Visits' },
      riskLevel: { bn: 'ঝুঁকি স্তর', en: 'Risk Level' },
      low: { bn: 'নিম্ন', en: 'Low' },
      medium: { bn: 'মধ্যম', en: 'Medium' },
      high: { bn: 'উচ্চ', en: 'High' },
      searchPatients: { bn: 'রোগী খুঁজুন...', en: 'Search patients...' },
      exportData: { bn: 'ডেটা এক্সপোর্ট', en: 'Export Data' },
      printReport: { bn: 'রিপোর্ট প্রিন্ট', en: 'Print Report' },
      sendMessage: { bn: 'মেসেজ পাঠান', en: 'Send Message' },
      bookAppointment: { bn: 'অ্যাপয়েন্টমেন্ট বুক করুন', en: 'Book Appointment' },
      reviewAndCorrect: { bn: 'পর্যালোচনা ও সংশোধন', en: 'Review & Correct' },
      forwardToSpecialist: { bn: 'বিশেষজ্ঞের কাছে পাঠান', en: 'Forward to Specialist' },
    }
    return translations[key]?.[language] || key
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      default: return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      default: return 'outline'
    }
  }

  // Stats
  const stats = {
    todayAppointments: 8,
    totalPatients: patients.length,
    pendingReviews: aiChats.filter(c => c.urgencyLevel === 'HIGH').length,
    monthlyRevenue: 125000
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">{t('todayAppointments')}</p>
                <p className="text-3xl font-bold">{stats.todayAppointments}</p>
              </div>
              <Calendar className="h-10 w-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">{t('totalPatients')}</p>
                <p className="text-3xl font-bold">{stats.totalPatients}</p>
              </div>
              <Users className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">{t('pendingReviews')}</p>
                <p className="text-3xl font-bold">{stats.pendingReviews}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">{t('monthlyRevenue')}</p>
                <p className="text-3xl font-bold">৳{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="patients">{t('patients')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('appointments')}</TabsTrigger>
          <TabsTrigger value="aiChats">{t('aiChats')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                  {t('recentPatients')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-100 text-emerald-600">
                              {patient.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-gray-500">{patient.age} বছর • {patient.gender}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getRiskColor(patient.riskLevel)}>
                            {t(patient.riskLevel)}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* High Risk Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  {t('highRiskPatients')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {patients.filter(p => p.riskLevel === 'high').map((patient) => (
                      <div
                        key={patient.id}
                        className="p-4 rounded-lg border border-red-200 bg-red-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-red-100 text-red-600">
                                {patient.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{patient.name}</span>
                          </div>
                          <Badge variant="destructive">{t('high')}</Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>দীর্ঘমেয়াদী রোগ:</strong> {patient.chronicConditions.join(', ')}</p>
                          <p><strong>এলার্জি:</strong> {patient.allergies.join(', ') || 'কোনোটি নেই'}</p>
                          <p><strong>বর্তমান ওষুধ:</strong> {patient.currentMedications.length}টি</p>
                        </div>
                        <Button size="sm" className="mt-2 w-full" variant="destructive">
                          {t('startConsultation')}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* AI Chat Logs Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                {t('aiAssistantLogs')}
              </CardTitle>
              <CardDescription>
                রমজান আলী এবং ফাতিমা রহমতের মাধ্যমে সংগৃহীত রোগীদের তথ্য
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>সহকারী</TableHead>
                    <TableHead>প্রধান উপসর্গ</TableHead>
                    <TableHead>জরুরিতা</TableHead>
                    <TableHead>সারসংক্ষেপ</TableHead>
                    <TableHead>ক্রিয়া</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiChats.map((chat) => (
                    <TableRow key={chat.id}>
                      <TableCell className="text-sm">
                        {chat.date.toLocaleDateString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className={cn(
                              chat.assistantType === 'ROMJAN' 
                                ? "bg-emerald-100 text-emerald-600" 
                                : "bg-pink-100 text-pink-600"
                            )}>
                              {chat.assistantType === 'ROMJAN' ? 'RA' : 'FR'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {chat.assistantType === 'ROMJAN' ? 'রমজান' : 'ফাতিমা'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {chat.primarySymptom}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getUrgencyColor(chat.urgencyLevel) as any}>
                          {chat.urgencyLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-sm text-gray-600">
                        {chat.summary}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedChat(chat)}
                          >
                            {t('viewChatLog')}
                          </Button>
                          <Button size="sm">
                            {t('reviewAndCorrect')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('searchPatients')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t('exportData')}
              </Button>
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                {t('printReport')}
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>রোগী</TableHead>
                    <TableHead>বয়স/লিঙ্গ</TableHead>
                    <TableHead>রক্তের গ্রুপ</TableHead>
                    <TableHead>দীর্ঘমেয়াদী রোগ</TableHead>
                    <TableHead>এলার্জি</TableHead>
                    <TableHead>ঝুঁকি</TableHead>
                    <TableHead>শেষ ভিজিট</TableHead>
                    <TableHead>ক্রিয়া</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((patient) => (
                    <TableRow key={patient.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-100 text-emerald-600">
                              {patient.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-xs text-gray-500">{patient.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{patient.age} / {patient.gender}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.bloodType || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {patient.chronicConditions.map((c, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {patient.allergies.map((a, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {a}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">কোনোটি নেই</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(patient.riskLevel)}>
                          {t(patient.riskLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {patient.lastVisit?.toLocaleDateString('bn-BD')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Chats Tab */}
        <TabsContent value="aiChats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI সহকারী চ্যাট লগ</CardTitle>
              <CardDescription>
                রমজান আলী এবং ফাতিমা রহমতের মাধ্যমে সংগৃহীত সকল রোগী তথ্য
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {aiChats.map((chat) => (
                    <Card key={chat.id} className="overflow-hidden">
                      <div className={cn(
                        "h-1",
                        chat.urgencyLevel === 'EMERGENCY' ? "bg-red-500" :
                        chat.urgencyLevel === 'HIGH' ? "bg-orange-500" :
                        chat.urgencyLevel === 'MEDIUM' ? "bg-amber-500" : "bg-green-500"
                      )} />
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className={cn(
                              "h-10 w-10",
                              chat.assistantType === 'ROMJAN' 
                                ? "bg-emerald-100" 
                                : "bg-pink-100"
                            )}>
                              <AvatarFallback className={cn(
                                chat.assistantType === 'ROMJAN' 
                                  ? "text-emerald-600" 
                                  : "text-pink-600"
                              )}>
                                {chat.assistantType === 'ROMJAN' ? 'RA' : 'FR'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {chat.assistantType === 'ROMJAN' ? 'রমজান আলী' : 'ফাতিমা রহমত'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {chat.date.toLocaleString('bn-BD')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={getUrgencyColor(chat.urgencyLevel) as any}>
                            {chat.urgencyLevel}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <p><strong>প্রধান উপসর্গ:</strong> {chat.primarySymptom}</p>
                          <p><strong>সারসংক্ষেপ:</strong> {chat.summary}</p>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">চ্যাট বিবরণ:</p>
                          <ScrollArea className="h-[150px] bg-gray-50 rounded-lg p-3">
                            {chat.messages.map((msg, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "mb-2 p-2 rounded-lg text-sm",
                                  msg.sender === 'patient' 
                                    ? "bg-blue-100 ml-8" 
                                    : msg.sender === 'romjan'
                                      ? "bg-emerald-100 mr-8"
                                      : "bg-pink-100 mr-8"
                                )}
                              >
                                <p className="text-xs text-gray-500 mb-1">
                                  {msg.sender === 'patient' ? 'রোগী' : 
                                   msg.sender === 'romjan' ? 'রমজান' : 'ফাতিমা'}
                                </p>
                                <p>{msg.message}</p>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {t('reviewAndCorrect')}
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Send className="h-4 w-4 mr-2" />
                            {t('forwardToSpecialist')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>মাসিক রোগী পরিসংখ্যান</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  <BarChart3 className="h-16 w-16" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI সহকারী ব্যবহার</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>রমজান আলী</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-32" />
                      <span className="text-sm text-gray-500">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ফাতিমা রহমত</span>
                    <div className="flex items-center gap-2">
                      <Progress value={35} className="w-32" />
                      <span className="text-sm text-gray-500">35%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Patient Detail Modal */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle>{t('patientProfile')}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Patient Header */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 text-2xl">
                      {selectedPatient.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                    <p className="text-gray-500">{selectedPatient.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{selectedPatient.age} বছর</span>
                      <span>•</span>
                      <span>{selectedPatient.gender}</span>
                      <span>•</span>
                      <Badge variant="outline">{selectedPatient.bloodType}</Badge>
                    </div>
                  </div>
                  <Badge className={getRiskColor(selectedPatient.riskLevel)}>
                    ঝুঁকি: {t(selectedPatient.riskLevel)}
                  </Badge>
                </div>

                {/* Medical Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        {t('chronicConditions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPatient.chronicConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.chronicConditions.map((c, i) => (
                            <Badge key={i} variant="secondary">{c}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">কোনোটি নেই</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        {t('allergies')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPatient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.allergies.map((a, i) => (
                            <Badge key={i} variant="destructive">{a}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">কোনোটি নেই</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Pill className="h-4 w-4 text-blue-500" />
                        {t('currentMedications')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPatient.currentMedications.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedPatient.currentMedications.map((m, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50">
                              {m}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">কোনোটি নেই</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Visit Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Calendar className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                      <p className="text-2xl font-bold">{selectedPatient.totalVisits}</p>
                      <p className="text-sm text-gray-500">{t('totalVisits')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                      <p className="text-sm font-medium">
                        {selectedPatient.lastVisit?.toLocaleDateString('bn-BD')}
                      </p>
                      <p className="text-sm text-gray-500">{t('lastVisit')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Phone className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                      <p className="text-sm font-medium">{selectedPatient.phone}</p>
                      <p className="text-sm text-gray-500">ফোন</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    {t('startConsultation')}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {t('sendMessage')}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('bookAppointment')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Log Modal */}
      <Dialog open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          {selectedChat && (
            <>
              <DialogHeader>
                <DialogTitle>চ্যাট লগ বিস্তারিত</DialogTitle>
                <DialogDescription>
                  {selectedChat.date.toLocaleString('bn-BD')}
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="h-[400px] p-4 bg-gray-50 rounded-lg">
                {selectedChat.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "mb-3 p-3 rounded-lg",
                      msg.sender === 'patient' 
                        ? "bg-blue-100 ml-8" 
                        : msg.sender === 'romjan'
                          ? "bg-emerald-100 mr-8"
                          : "bg-pink-100 mr-8"
                    )}
                  >
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      {msg.sender === 'patient' ? '👤 রোগী' : 
                       msg.sender === 'romjan' ? '🤖 রমজান আলী' : '🤖 ফাতিমা রহমত'}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {msg.timestamp.toLocaleTimeString('bn-BD')}
                    </p>
                  </div>
                ))}
              </ScrollArea>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  অনুমোদন করুন
                </Button>
                <Button variant="outline" className="flex-1">
                  সংশোধন করুন
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DoctorDashboard
