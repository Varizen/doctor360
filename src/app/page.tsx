'use client'

import { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import {
  Stethoscope, Calendar, User, Users, FileText, Pill, CreditCard, Video, Shield, Clock,
  Star, CheckCircle, Phone, Mail, MapPin, Heart, Brain, Eye, Baby, Bone, Activity,
  LogIn, UserPlus, LogOut, Menu, X, ChevronRight, Play, Search, Filter, MoreVertical,
  MessageCircle, Send, VideoIcon, UserCheck, Building, TrendingUp,
  DollarSign, BarChart3, Settings, Bell, Home, ClipboardList, FileBadge, AlertCircle,
  Loader2, ArrowRight, Sparkles, Globe, Lock, Award, Briefcase, Languages, Facebook, Twitter, Instagram, Youtube, Linkedin,
  Plane, HeartPulse, UsersRound, StethoscopeIcon, MessageSquare, Bot, XCircle, Minimize2, Maximize2, Ambulance, UserRound, HandHeart, Microscope
} from 'lucide-react'

// Import new components
import { LoadingScreen } from '@/components/LoadingScreen'
import { AIHealthAssistant } from '@/components/AIHealthAssistant'

// ============================================================================
// LANGUAGE SYSTEM WITH LOCALSTORAGE
// ============================================================================

// primary Bangla font should use Hind Siliguri (see layout.tsx & globals.css)
// three codes: bn (বাংলা default), en (English), bm (additional option)

type Language = 'bn' | 'en' | 'bm'

interface Translations {
  [key: string]: { bn: string; en: string; bm?: string }
}

const translations: Translations = {
  // Brand
  brandName: { bn: 'Doctor360', en: 'Doctor360', bm: 'Doctor360' },
  tagline: { bn: 'আপনার স্বাস্থ্য, আমাদের অঙ্গীকার', en: 'Your Health, Our Commitment' },
  
  // Navigation
  dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  findDoctors: { bn: 'ডাক্তার খুঁজুন', en: 'Find Doctors' },
  appointments: { bn: 'অ্যাপয়েন্টমেন্ট', en: 'Appointments' },
  medicalRecords: { bn: 'মেডিকেল রেকর্ড', en: 'Medical Records' },
  prescriptions: { bn: 'প্রেসক্রিপশন', en: 'Prescriptions' },
  payments: { bn: 'পেমেন্ট', en: 'Payments' },
  patients: { bn: 'রোগী', en: 'Patients' },
  consultation: { bn: 'কনসাল্টেশন', en: 'Consultation' },
  users: { bn: 'ব্যবহারকারী', en: 'Users' },
  auditLogs: { bn: 'অডিট লগ', en: 'Audit Logs' },
  
  // Auth
  login: { bn: 'লগইন', en: 'Login' },
  register: { bn: 'নিবন্ধন', en: 'Register' },
  signIn: { bn: 'সাইন ইন', en: 'Sign In' },
  getStarted: { bn: 'শুরু করুন', en: 'Get Started' },
  welcomeBack: { bn: 'স্বাগতম', en: 'Welcome Back' },
  createAccount: { bn: 'অ্যাকাউন্ট তৈরি করুন', en: 'Create Account' },
  email: { bn: 'ইমেইল', en: 'Email' },
  password: { bn: 'পাসওয়ার্ড', en: 'Password' },
  name: { bn: 'নাম', en: 'Name' },
  phone: { bn: 'ফোন', en: 'Phone' },
  logout: { bn: 'লগআউট', en: 'Logout' },
  
  // Landing page
  features: { bn: 'বৈশিষ্ট্য', en: 'Features' },
  howItWorks: { bn: 'কিভাবে কাজ করে', en: 'How It Works' },
  pricing: { bn: 'মূল্য তালিকা', en: 'Pricing' },
  contact: { bn: 'যোগাযোগ', en: 'Contact' },
  
  // Hero
  heroTitle: { bn: 'আপনার স্বাস্থ্য, আমাদের অঙ্গীকার', en: 'Your Health, Our Commitment' },
  heroSubtitle: { bn: 'দেশের সেরা ডাক্তারদের সাথে সংযোগ করুন। অ্যাপয়েন্টমেন্ট বুক করুন, মেডিকেল রেকর্ড দেখুন, প্রেসক্রিপশন পরিচালনা করুন এবং ভিডিও কনসাল্টেশন করুন—সব এক প্ল্যাটফর্মে।', en: 'Connect with top healthcare professionals instantly. Book appointments, access medical records, manage prescriptions, and conduct video consultations—all in one powerful platform.' },
  startFreeTrial: { bn: 'ফ্রি শুরু করুন', en: 'Start Free' },
  watchDemo: { bn: 'ডেমো দেখুন', en: 'Watch Demo' },
  scheduleDemo: { bn: 'ডেমো শিডিউল করুন', en: 'Schedule Demo' },
  
  // Stats
  activePatients: { bn: 'সক্রিয় রোগী', en: 'Active Patients' },
  expertDoctors: { bn: 'বিশেষজ্ঞ ডাক্তার', en: 'Expert Doctors' },
  consultations: { bn: 'কনসাল্টেশন', en: 'Consultations' },
  userRating: { bn: 'ব্যবহারকারী রেটিং', en: 'User Rating' },
  
  // Features
  smartScheduling: { bn: 'স্মার্ট শিডিউলিং', en: 'Smart Scheduling' },
  smartSchedulingDesc: { bn: 'আপনার পছন্দের ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট বুক করুন। রিমাইন্ডার পান এবং আপনার সময়সূচী সহজেই পরিচালনা করুন।', en: 'Book appointments with your preferred doctors. Get reminders and manage your schedule effortlessly.' },
  videoConsultations: { bn: 'ভিডিও কনসাল্টেশন', en: 'Video Consultations' },
  videoConsultationsDesc: { bn: 'এন্ড-টু-এন্ড এনক্রিপশন সহ সুরক্ষিত এইচডি ভিডিও কলের মাধ্যমে যেকোনো জায়গা থেকে ডাক্তারদের সাথে সংযোগ করুন।', en: 'Connect with doctors from anywhere through secure HD video calls with end-to-end encryption.' },
  digitalHealthRecords: { bn: 'ডিজিটাল হেলথ রেকর্ড', en: 'Digital Health Records' },
  digitalHealthRecordsDesc: { bn: 'আপনার সম্পূর্ণ মেডিকেল ইতিহাস, পরীক্ষার ফলাফল এবং প্রেসক্রিপশন এক নিরাপদ জায়গায় অ্যাক্সেস করুন।', en: 'Access your complete medical history, test results, and prescriptions in one secure place.' },
  ePrescriptions: { bn: 'ই-প্রেসক্রিপশন', en: 'E-Prescriptions' },
  ePrescriptionsDesc: { bn: 'সরাসরি আপনার ফার্মেসিতে ডিজিটাল প্রেসক্রিপশন পান। ওষুধ এবং রিফিল সহজেই ট্র্যাক করুন।', en: 'Receive digital prescriptions directly to your pharmacy. Track medications and refills easily.' },
  securePayments: { bn: 'সুরক্ষিত পেমেন্ট', en: 'Secure Payments' },
  securePaymentsDesc: { bn: 'একাধিক পেমেন্ট অপশন সহ অনলাইনে কনসাল্টেশন পেমেন্ট করুন। স্বচ্ছ মূল্য, কোনো লুকানো ফি নেই।', en: 'Pay consultations online with multiple payment options. Transparent pricing, no hidden fees.' },
  privacySecurity: { bn: 'গোপনীয়তা ও নিরাপত্তা', en: 'Privacy & Security' },
  privacySecurityDesc: { bn: 'আপনার স্বাস্থ্য তথ্য এন্টারপ্রাইজ-গ্রেড নিরাপত্তা এবং পূর্ণ সরকারি অনুমোদন সহ সুরক্ষিত।', en: 'Your health data is protected with enterprise-grade security and full regulatory compliance.' },
  elderHealthcare: { bn: 'প্রবীণ স্বাস্থ্যসেবা', en: 'Elder Healthcare' },
  elderHealthcareDesc: { bn: 'বয়স্কদের জন্য বিশেষায়িত স্বাস্থ্যসেবা। হোম কেয়ার, নার্সিং সার্ভিস এবং নিয়মিত স্বাস্থ্য পরীক্ষা।', en: 'Specialized healthcare for seniors. Home care, nursing services, and regular health checkups.' },
  nurseService: { bn: 'নার্স সার্ভিস', en: 'Nurse Service' },
  nurseServiceDesc: { bn: 'দক্ষ ও অভিজ্ঞ নার্সদের দ্বারা হোম নার্সিং সেবা। ইনজেকশন, ড্রেসিং, পোস্ট-অপারেটিভ কেয়ার।', en: 'Home nursing services by skilled and experienced nurses. Injections, dressing, post-operative care.' },
  emergencyAirAmbulance: { bn: 'ইমার্জেন্সি এয়ার অ্যাম্বুলেন্স', en: 'Emergency Air Ambulance' },
  emergencyAirAmbulanceDesc: { bn: 'জরুরি পরিস্থিতিতে এয়ার অ্যাম্বুলেন্স সুবিধা। দ্রুত এয়ারলিফট এবং হাসপাতাল স্থানান্তর।', en: 'Air ambulance service in emergencies. Rapid airlift and hospital transfer.' },
  foreignSpecialist: { bn: 'বিদেশি বিশেষজ্ঞ কনসাল্টেশন', en: 'Foreign Specialist Consultation' },
  foreignSpecialistDesc: { bn: 'বিশ্বের সেরা বিশেষজ্ঞদের সাথে অনলাইন কনসাল্টেশন। USA, UK, ভারতের শীর্ষ ডাক্তারদের মতামত।', en: 'Online consultation with world\'s best specialists. Opinions from top doctors in USA, UK, India.' },
  
  // Pricing
  basic: { bn: 'বেসিক', en: 'Basic' },
  professional: { bn: 'প্রফেশনাল', en: 'Professional' },
  enterprise: { bn: 'এন্টারপ্রাইজ', en: 'Enterprise' },
  free: { bn: 'ফ্রি', en: 'Free' },
  perMonth: { bn: '/মাস', en: '/month' },
  perYear: { bn: '/বছর', en: '/year' },
  custom: { bn: 'কাস্টম', en: 'Custom' },
  mostPopular: { bn: 'সবচেয়ে জনপ্রিয়', en: 'Most Popular' },
  contactSales: { bn: 'সেলস টিমের সাথে যোগাযোগ করুন', en: 'Contact Sales' },
  
  // Trust
  hipaaCompliant: { bn: 'স্বাস্থ্য মন্ত্রণালয় অনুমোদিত', en: 'Ministry Approved' },
  encryption: { bn: '২৫৬-বিট এনক্রিপশন', en: '256-bit Encryption' },
  isoCertified: { bn: 'আইএসও ২৭০০১', en: 'ISO 27001' },
  uptime: { bn: '৯৯.৯% আপটাইম', en: '99.9% Uptime' },
  trustedBy: { bn: 'স্বাস্থ্যসেবা নেতাদের বিশ্বস্ততা অর্জিত', en: 'Trusted by Healthcare Leaders' },
  
  // Footer
  product: { bn: 'প্রোডাক্ট', en: 'Product' },
  company: { bn: 'কোম্পানি', en: 'Company' },
  legal: { bn: 'আইনি', en: 'Legal' },
  support: { bn: 'সাপোর্ট', en: 'Support' },
  services: { bn: 'সেবাসমূহ', en: 'Services' },
  forPatients: { bn: 'রোগীদের জন্য', en: 'For Patients' },
  forDoctors: { bn: 'ডাক্তারদের জন্য', en: 'For Doctors' },
  privacyPolicy: { bn: 'গোপনীয়তা নীতি', en: 'Privacy Policy' },
  termsOfService: { bn: 'সেবার শর্তাবলী', en: 'Terms of Service' },
  aboutUs: { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
  careers: { bn: 'ক্যারিয়ার', en: 'Careers' },
  blog: { bn: 'ব্লগ', en: 'Blog' },
  api: { bn: 'এপিআই', en: 'API' },
  security: { bn: 'নিরাপত্তা', en: 'Security' },
  helpCenter: { bn: 'হেল্প সেন্টার', en: 'Help Center' },
  paymentMethods: { bn: 'পেমেন্ট পদ্ধতি', en: 'Payment Methods' },
  copyright: { bn: 'সর্বস্বত্ব সংরক্ষিত।', en: 'All rights reserved.' },
  
  // Doctor Dashboard
  todayAppointments: { bn: 'আজকের অ্যাপয়েন্টমেন্ট', en: "Today's Appointments" },
  pendingAppointments: { bn: 'অপেক্ষমান অ্যাপয়েন্টমেন্ট', en: 'Pending Appointments' },
  completedConsultations: { bn: 'সম্পন্ন কনসাল্টেশন', en: 'Completed Consultations' },
  totalPatients: { bn: 'মোট রোগী', en: 'Total Patients' },
  startConsultation: { bn: 'কনসাল্টেশন শুরু করুন', en: 'Start Consultation' },
  createEMR: { bn: 'ইএমআর তৈরি করুন', en: 'Create EMR' },
  writePrescription: { bn: 'প্রেসক্রিপশন লিখুন', en: 'Write Prescription' },
  markComplete: { bn: 'সম্পন্ন করুন', en: 'Mark Complete' },
  
  // Patient Portal
  upcomingAppointments: { bn: 'আসন্ন অ্যাপয়েন্টমেন্ট', en: 'Upcoming Appointments' },
  recentRecords: { bn: 'সাম্প্রতিক রেকর্ড', en: 'Recent Records' },
  bookAppointment: { bn: 'অ্যাপয়েন্টমেন্ট বুক করুন', en: 'Book Appointment' },
  viewDetails: { bn: 'বিস্তারিত দেখুন', en: 'View Details' },
  payNow: { bn: 'এখনই পেমেন্ট করুন', en: 'Pay Now' },
  joinSession: { bn: 'সেশনে যোগ দিন', en: 'Join Session' },
  cancelAppointment: { bn: 'অ্যাপয়েন্টমেন্ট বাতিল করুন', en: 'Cancel Appointment' },
  cancel: { bn: 'বাতিল', en: 'Cancel' },
  submit: { bn: 'জমা দিন', en: 'Submit' },
  
  // Status
  confirmed: { bn: 'নিশ্চিত', en: 'Confirmed' },
  pending: { bn: 'অপেক্ষমান', en: 'Pending' },
  completed: { bn: 'সম্পন্ন', en: 'Completed' },
  cancelled: { bn: 'বাতিল', en: 'Cancelled' },
  inConsultation: { bn: 'কনসাল্টেশনে', en: 'In Consultation' },
  pendingPayment: { bn: 'পেমেন্ট অপেক্ষমান', en: 'Pending Payment' },
  paid: { bn: 'পরিশোধিত', en: 'Paid' },
  refunded: { bn: 'ফেরত', en: 'Refunded' },
  draft: { bn: 'খসড়া', en: 'Draft' },
  
  // Admin
  totalUsers: { bn: 'মোট ব্যবহারকারী', en: 'Total Users' },
  totalDoctors: { bn: 'মোট ডাক্তার', en: 'Total Doctors' },
  totalRevenue: { bn: 'মোট রেভিনিউ', en: 'Total Revenue' },
  
  // Misc
  search: { bn: 'খুঁজুন...', en: 'Search...' },
  filter: { bn: 'ফিল্টার', en: 'Filter' },
  all: { bn: 'সকল', en: 'All' },
  viewAll: { bn: 'সব দেখুন', en: 'View All' },
  noData: { bn: 'কোনো তথ্য নেই', en: 'No data available' },
  loading: { bn: 'লোড হচ্ছে...', en: 'Loading...' },
  error: { bn: 'ত্রুটি হয়েছে', en: 'Error occurred' },
  success: { bn: 'সফল', en: 'Success' },
  consultationFee: { bn: 'কনসাল্টেশন ফি', en: 'Consultation Fee' },
  featuredDoctors: { bn: 'বিশিষ্ট ডাক্তারগণ', en: 'Featured Doctors' },
  bookNow: { bn: 'এখনই বুক করুন', en: 'Book Now' },
  viewProfile: { bn: 'প্রোফাইল দেখুন', en: 'View Profile' },
  yearsExperience: { bn: 'বছরের অভিজ্ঞতা', en: 'Years Experience' },
  available: { bn: 'উপলব্ধ', en: 'Available' },
  offline: { bn: 'অফলাইন', en: 'Offline' },
  
  // Bangla numerals and currency
  taka: { bn: 'টাকা', en: 'Tk' },
  
  // Chat
  howCanIHelp: { bn: 'আপনাকে কীভাবে সাহায্য করতে পারি?', en: 'How may I help you?' },
  chatWithUs: { bn: 'আমাদের সাথে চ্যাট করুন', en: 'Chat with us' },
  typeMessage: { bn: 'আপনার মেসেজ লিখুন...', en: 'Type your message...' },
  aiAssistant: { bn: 'AI সহায়ক', en: 'AI Assistant' },
}

// Language Context with localStorage
const LanguageContext = createContext<{
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}>({
  lang: 'bn',
  setLang: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('bn')
  
  useEffect(() => {
    const savedLang = localStorage.getItem('doctor360-lang')
    if (savedLang === 'bn' || savedLang === 'en' || savedLang === 'bm') {
      setLangState(savedLang as Language)
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('doctor360-lang', lang)
  }, [lang])
  
  const setLang = (newLang: Language) => {
    setLangState(newLang)
  }
  
  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) return key
    // If current lang is 'bm' and it's missing, fallback to 'bn'
    if (lang === 'bm' && !translation.bm) return translation.bn
    return translation[lang as keyof typeof translation] || translation['bn']
  }
  
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const banglaNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

const toBanglaNumerals = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (d) => banglaNumerals[parseInt(d)])
}

const formatDate = (date: string | Date, lang: Language = 'bn') => {
  if (lang === 'bn') {
    return new Date(date).toLocaleDateString('bn-BD', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (date: string | Date, lang: Language = 'bn') => {
  if (lang === 'bn') {
    return new Date(date).toLocaleTimeString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount: number, lang: Language = 'bn') => {
  if (lang === 'bn') {
    return `৳${toBanglaNumerals(amount.toLocaleString())}`
  }
  return `৳${amount.toLocaleString()}`
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    IN_CONSULTATION: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PAID: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
    FAILED: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string, t: (key: string) => string) => {
  const statusMap: Record<string, string> = {
    DRAFT: t('draft'),
    PENDING_PAYMENT: t('pendingPayment'),
    CONFIRMED: t('confirmed'),
    IN_CONSULTATION: t('inConsultation'),
    COMPLETED: t('completed'),
    CANCELLED: t('cancelled'),
    PAID: t('paid'),
    PENDING: t('pending'),
    REFUNDED: t('refunded'),
    FAILED: t('error')
  }
  return statusMap[status] || status
}

// ============================================================================
// API FETCHER
// ============================================================================

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'An error occurred')
  }
  return data
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Doctor360() {
  return (
    <LanguageProvider>
      <Doctor360Content />
    </LanguageProvider>
  )
}

function Doctor360Content() {
  const { user, loading, login, register, logout } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  // Loading screen handler
  const handleLoadComplete = () => {
    setShowLoadingScreen(false)
  }

  if (showLoadingScreen) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} minDuration={2500} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="text-center">
          <Image src="/logo.png" alt="Doctor360" width={80} height={80} className="mx-auto mb-4" />
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <LandingPage
          onLoginClick={() => setShowLoginModal(true)}
          onRegisterClick={() => setShowRegisterModal(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} onSwitchToRegister={() => { setShowLoginModal(false); setShowRegisterModal(true) }} />
        <RegisterModal open={showRegisterModal} onOpenChange={setShowRegisterModal} onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true) }} />
        
        {/* AI Health Assistant for non-logged in users */}
        <AIHealthAssistant
          patientId="guest"
          patientName="Guest"
          language={lang}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Doctor360" width={40} height={40} className="rounded-lg" />
              <div>
                <span className="text-xl font-bold text-gray-900">Doctor360</span>
                <span className="hidden sm:inline text-xs text-gray-500 ml-2">{t('tagline')}</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {user.role === 'PATIENT' && (
                <>
                  <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
                    <Home className="h-4 w-4 mr-2" /> {t('dashboard')}
                  </NavButton>
                  <NavButton active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')}>
                    <Users className="h-4 w-4 mr-2" /> {t('findDoctors')}
                  </NavButton>
                  <NavButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
                    <Calendar className="h-4 w-4 mr-2" /> {t('appointments')}
                  </NavButton>
                  <NavButton active={activeTab === 'emr'} onClick={() => setActiveTab('emr')}>
                    <FileText className="h-4 w-4 mr-2" /> {t('medicalRecords')}
                  </NavButton>
                  <NavButton active={activeTab === 'prescriptions'} onClick={() => setActiveTab('prescriptions')}>
                    <Pill className="h-4 w-4 mr-2" /> {t('prescriptions')}
                  </NavButton>
                  <NavButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
                    <CreditCard className="h-4 w-4 mr-2" /> {t('payments')}
                  </NavButton>
                </>
              )}
              {user.role === 'DOCTOR' && (
                <>
                  <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
                    <Home className="h-4 w-4 mr-2" /> {t('dashboard')}
                  </NavButton>
                  <NavButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>
                    <Calendar className="h-4 w-4 mr-2" /> {t('appointments')}
                  </NavButton>
                  <NavButton active={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>
                    <Users className="h-4 w-4 mr-2" /> {t('patients')}
                  </NavButton>
                  <NavButton active={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')}>
                    <Video className="h-4 w-4 mr-2" /> {t('consultation')}
                  </NavButton>
                </>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
                    <Home className="h-4 w-4 mr-2" /> {t('dashboard')}
                  </NavButton>
                  <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
                    <Users className="h-4 w-4 mr-2" /> {t('users')}
                  </NavButton>
                  <NavButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>
                    <ClipboardList className="h-4 w-4 mr-2" /> {t('auditLogs')}
                  </NavButton>
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    {lang === 'bn' ? 'বাংলা' : lang === 'en' ? 'EN' : 'BM'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLang('bn')} className={lang === 'bn' ? 'bg-emerald-50' : ''}>
                    বাংলা
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang('en')} className={lang === 'en' ? 'bg-emerald-50' : ''}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang('bm')} className={lang === 'bm' ? 'bg-emerald-50' : ''}>
                    BM
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || ''} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className="w-fit mt-1">{user.role}</Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b px-4 py-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {user.role === 'PATIENT' && (
            <>
              <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>{t('dashboard')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'doctors'} onClick={() => setActiveTab('doctors')}>{t('findDoctors')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>{t('appointments')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'emr'} onClick={() => setActiveTab('emr')}>{t('medicalRecords')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>{t('payments')}</MobileNavButton>
            </>
          )}
          {user.role === 'DOCTOR' && (
            <>
              <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>{t('dashboard')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'appointments'} onClick={() => setActiveTab('appointments')}>{t('appointments')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'patients'} onClick={() => setActiveTab('patients')}>{t('patients')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'consultation'} onClick={() => setActiveTab('consultation')}>{t('consultation')}</MobileNavButton>
            </>
          )}
          {user.role === 'ADMIN' && (
            <>
              <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>{t('dashboard')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>{t('users')}</MobileNavButton>
              <MobileNavButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')}>{t('auditLogs')}</MobileNavButton>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user.role === 'PATIENT' && <PatientPortal activeTab={activeTab} setActiveTab={setActiveTab} />}
        {user.role === 'DOCTOR' && <DoctorDashboard activeTab={activeTab} setActiveTab={setActiveTab} />}
        {user.role === 'ADMIN' && <AdminPanel activeTab={activeTab} />}
      </main>
      
      {/* AI Health Assistant - Romjan Ali & Fatimah Rahmat */}
      <AIHealthAssistant
        patientId={user.id}
        patientName={user.name}
        patientAge={35}
        language={lang}
        onSessionComplete={(sessionId, result) => {
          console.log('AI Session completed:', sessionId, result)
        }}
        onEscalateToDoctor={(sessionId, doctorId) => {
          console.log('Escalating to doctor:', sessionId, doctorId)
          setActiveTab('appointments')
        }}
        onEscalateToHospital={(sessionId) => {
          console.log('Emergency - finding hospital:', sessionId)
        }}
      />
    </div>
  )
}

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

function NavButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function MobileNavButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-emerald-500 text-white'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {children}
    </button>
  )
}

// ============================================================================
// AI CHAT WIDGET
// ============================================================================

function ChatWidget() {
  const { t, lang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: lang === 'bn' ? 'আসসালামু আলাইকুম! আমি ডক্টর বট, আপনার স্বাস্থ্য সহায়ক। আজ আপনাকে কীভাবে সাহায্য করতে পারি?' : 'Hello! I am Doctor Bot, your health assistant. How may I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetcher<{ reply: string }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-10)
        })
      })
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: lang === 'bn' ? 'দুঃখিত, সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' : 'Sorry, there was an error. Please try again later.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className={`fixed z-50 bg-white shadow-2xl rounded-2xl overflow-hidden transition-all ${
      isMinimized 
        ? 'bottom-6 right-6 w-72 h-14' 
        : 'bottom-6 right-6 w-96 h-[500px]'
    } flex flex-col border`}>
      {/* Header */}
      <div className="bg-emerald-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-medium">{t('aiAssistant')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/20 rounded">
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-md' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-bl-md">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t('typeMessage')}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={isLoading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {lang === 'bn' ? '⚠️ এটি সাধারণ তথ্য, প্রেসক্রিপশন নয়। ডাক্তারের পরামর্শ নিন।' : '⚠️ General info only, not prescriptions. Consult a doctor.'}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================================
// LANDING PAGE
// ============================================================================

function LandingPage({
  onLoginClick,
  onRegisterClick,
  mobileMenuOpen,
  setMobileMenuOpen
}: {
  onLoginClick: () => void
  onRegisterClick: () => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}) {
  const { t, lang, setLang } = useLanguage()
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)

  useEffect(() => {
    loadFeaturedDoctors()
  }, [])

  const loadFeaturedDoctors = async () => {
    try {
      const res = await fetcher<{ doctors: Doctor[] }>('/api/doctors')
      setFeaturedDoctors(res.doctors.slice(0, 8))
    } catch (error) {
      console.error('Error loading doctors:', error)
    } finally {
      setLoadingDoctors(false)
    }
  }

  // Feature cards data with new additions
  const featureCards = [
    { icon: Calendar, title: t('smartScheduling'), description: t('smartSchedulingDesc'), color: 'emerald', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
    { icon: Video, title: t('videoConsultations'), description: t('videoConsultationsDesc'), color: 'blue', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80' },
    { icon: FileText, title: t('digitalHealthRecords'), description: t('digitalHealthRecordsDesc'), color: 'purple', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80' },
    { icon: Pill, title: t('ePrescriptions'), description: t('ePrescriptionsDesc'), color: 'pink', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80' },
    { icon: HandHeart, title: t('elderHealthcare'), description: t('elderHealthcareDesc'), color: 'orange', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&q=80' },
    { icon: UserRound, title: t('nurseService'), description: t('nurseServiceDesc'), color: 'teal', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80' },
    { icon: Plane, title: t('emergencyAirAmbulance'), description: t('emergencyAirAmbulanceDesc'), color: 'red', image: 'https://images.unsplash.com/photo-1543158266-0066955047b1?w=400&q=80' },
    { icon: Microscope, title: t('foreignSpecialist'), description: t('foreignSpecialistDesc'), color: 'indigo', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80' },
    { icon: CreditCard, title: t('securePayments'), description: t('securePaymentsDesc'), color: 'yellow', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80' },
    { icon: Shield, title: t('privacySecurity'), description: t('privacySecurityDesc'), color: 'slate', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80' },
  ]

  // Pricing packages (updated names)
  const pricingPackages = [
    {
      name: lang === 'bn' ? 'বেসিক' : 'Basic',
      nameBn: 'বেসিক',
      price: 0,
      description: lang === 'bn' ? 'শুরু করার জন্য উপযুক্ত' : 'Perfect for getting started',
      features: [
        lang === 'bn' ? 'অ্যাপয়েন্টমেন্ট বুকিং' : 'Appointment booking',
        lang === 'bn' ? 'ভিডিও কনসাল্টেশন (৫/মাস)' : 'Video consultations (5/month)',
        lang === 'bn' ? 'বেসিক হেলথ রেকর্ড' : 'Basic health records',
        lang === 'bn' ? 'ইমেইল সাপোর্ট' : 'Email support',
      ],
      cta: t('getStarted'),
      popular: false
    },
    {
      name: lang === 'bn' ? 'প্রিমিয়াম' : 'Premium',
      nameBn: 'প্রিমিয়াম',
      price: 299,
      description: lang === 'bn' ? 'ব্যক্তিগত ব্যবহারের জন্য' : 'For personal use',
      features: [
        lang === 'bn' ? 'সব বেসিক সুবিধা' : 'All Basic features',
        lang === 'bn' ? 'আনলিমিটেড ভিডিও কনসাল্ট' : 'Unlimited video consults',
        lang === 'bn' ? 'অ্যাডভান্সড হেলথ অ্যানালিটিক্স' : 'Advanced health analytics',
        lang === 'bn' ? 'ই-প্রেসক্রিপশন' : 'E-prescriptions',
        lang === 'bn' ? '২৪/৭ ফোন সাপোর্ট' : '24/7 phone support',
        lang === 'bn' ? 'পরিবারের সদস্য (৩ জন)' : 'Family members (3)',
      ],
      cta: t('startFreeTrial'),
      popular: true
    },
    {
      name: lang === 'bn' ? 'ফ্যামিলি' : 'Family',
      nameBn: 'ফ্যামিলি',
      price: 499,
      description: lang === 'bn' ? 'পরিবারের জন্য সেরা' : 'Best for families',
      features: [
        lang === 'bn' ? 'সব প্রিমিয়াম সুবিধা' : 'All Premium features',
        lang === 'bn' ? 'পরিবারের সদস্য (৬ জন)' : 'Family members (6)',
        lang === 'bn' ? 'প্রায়োরিটি শিডিউলিং' : 'Priority scheduling',
        lang === 'bn' ? 'হোম নার্সিং ছাড়' : 'Home nursing discount',
        lang === 'bn' ? 'ল্যাব টেস্ট ছাড় (২০%)' : 'Lab test discount (20%)',
        lang === 'bn' ? 'ডেডিকেটেড কেয়ার ম্যানেজার' : 'Dedicated care manager',
      ],
      cta: lang === 'bn' ? 'এখনই শুরু করুন' : 'Start Now',
      popular: false
    },
    {
      name: lang === 'bn' ? 'এন্টারপ্রাইজ' : 'Enterprise',
      nameBn: 'এন্টারপ্রাইজ',
      price: null,
      description: lang === 'bn' ? 'প্রতিষ্ঠানের জন্য' : 'For organizations',
      features: [
        lang === 'bn' ? 'সব ফ্যামিলি সুবিধা' : 'All Family features',
        lang === 'bn' ? 'আনলিমিটেড সদস্য' : 'Unlimited members',
        lang === 'bn' ? 'কাস্টম ইন্টিগ্রেশন' : 'Custom integrations',
        lang === 'bn' ? 'ডেডিকেটেড অ্যাকাউন্ট ম্যানেজার' : 'Dedicated account manager',
        lang === 'bn' ? 'অ্যাডভান্সড অ্যানালিটিক্স' : 'Advanced analytics',
        lang === 'bn' ? 'হোয়াইট-লেবেল অপশন' : 'White-label options',
      ],
      cta: t('contactSales'),
      popular: false
    },
  ]

  // Trust/Achievement badges
  const achievements = [
    { icon: Shield, label: t('hipaaCompliant'), description: lang === 'bn' ? 'স্বাস্থ্য মন্ত্রণালয় অনুমোদিত' : 'Ministry of Health Approved' },
    { icon: Lock, label: t('encryption'), description: lang === 'bn' ? 'সামরিক গ্রেড নিরাপত্তা' : 'Military-grade security' },
    { icon: Award, label: t('isoCertified'), description: lang === 'bn' ? 'আইএসও সার্টিফাইড' : 'ISO Certified' },
    { icon: Globe, label: t('uptime'), description: lang === 'bn' ? 'এন্টারপ্রাইজ নির্ভরযোগ্যতা' : 'Enterprise reliability' },
    { icon: Users, label: lang === 'bn' ? '১০,০০০+ রোগী' : '10,000+ Patients', description: lang === 'bn' ? 'সক্রিয় ব্যবহারকারী' : 'Active users' },
    { icon: Stethoscope, label: lang === 'bn' ? '৫০০+ ডাক্তার' : '500+ Doctors', description: lang === 'bn' ? 'বিশেষজ্ঞ চিকিৎসক' : 'Specialist physicians' },
    { icon: Award, label: lang === 'bn' ? 'BAPI সদস্য' : 'BAPI Member', description: lang === 'bn' ? 'বাংলাদেশ এসোসিয়েশন অফ ফিজিশিয়ান্স' : 'Bangladesh Association of Physicians' },
    { icon: Star, label: lang === 'bn' ? '৪.৯ রেটিং' : '4.9 Rating', description: lang === 'bn' ? 'ব্যবহারকারী সন্তুষ্টি' : 'User satisfaction' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Doctor360" width={40} height={40} className="rounded-lg" />
              <div>
                <span className="text-xl font-bold text-gray-900">Doctor360</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">{t('features')}</a>
              <a href="#featured-doctors" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">{t('featuredDoctors')}</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">{t('howItWorks')}</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">{t('pricing')}</a>
              <a href="#contact" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">{t('contact')}</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    {lang === 'bn' ? 'বাংলা' : 'EN'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLang('bn')}>বাংলা</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLang('en')}>English</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" onClick={onLoginClick}>
                <LogIn className="h-4 w-4 mr-2" />
                {t('signIn')}
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={onRegisterClick}>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('getStarted')}
              </Button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b px-4 py-4 space-y-4">
            <nav className="space-y-2">
              <a href="#features" className="block py-2 text-gray-600">{t('features')}</a>
              <a href="#featured-doctors" className="block py-2 text-gray-600">{t('featuredDoctors')}</a>
              <a href="#how-it-works" className="block py-2 text-gray-600">{t('howItWorks')}</a>
              <a href="#pricing" className="block py-2 text-gray-600">{t('pricing')}</a>
              <a href="#contact" className="block py-2 text-gray-600">{t('contact')}</a>
            </nav>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}>
                {lang === 'bn' ? 'EN' : 'বাংলা'}
              </Button>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Button variant="outline" onClick={onLoginClick} className="w-full">{t('signIn')}</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full" onClick={onRegisterClick}>{t('getStarted')}</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section with HD Image */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80" 
            alt="Healthcare" 
            fill 
            className="object-cover opacity-10"
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <Sparkles className="h-3 w-3 mr-1" />
                {lang === 'bn' ? 'বাংলাদেশের #১ স্বাস্থ্যসেবা প্ল্যাটফর্ম' : "Bangladesh's #1 Healthcare Platform"}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                {t('heroSubtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8" onClick={onRegisterClick}>
                  {t('startFreeTrial')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Play className="mr-2 h-5 w-5" />
                  {t('watchDemo')}
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">{t('hipaaCompliant')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">{t('encryption')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600">২৪/৭ {lang === 'bn' ? 'সেবা' : 'Support'}</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 border overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80" 
                  alt="Doctor consultation" 
                  width={600} 
                  height={300} 
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{lang === 'bn' ? '১০,০০০+' : '10,000+'}</div>
                      <div className="text-sm text-gray-500">{t('activePatients')}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{lang === 'bn' ? '৫০০+' : '500+'}</div>
                      <div className="text-sm text-gray-500">{t('expertDoctors')}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{lang === 'bn' ? '৫০,০০০+' : '50,000+'}</div>
                      <div className="text-sm text-gray-500">{t('consultations')}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{lang === 'bn' ? '৪.৯' : '4.9'}</div>
                      <div className="text-sm text-gray-500">{t('userRating')}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section - Carousel */}
      <section id="featured-doctors" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700">{t('featuredDoctors')}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {lang === 'bn' ? 'আমাদের বিশিষ্ট ডাক্তারগণ' : 'Our Featured Doctors'}
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              {lang === 'bn' 
                ? 'বাংলাদেশের সেরা বিশেষজ্ঞ ডাক্তারদের সাথে সংযোগ করুন এবং উন্নত স্বাস্থ্যসেবা নিন।'
                : "Connect with Bangladesh's top specialist doctors and receive quality healthcare."}
            </p>
            {/* Doctor Count Badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
              <Stethoscope className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-gray-900">
                {lang === 'bn' ? `${toBanglaNumerals(featuredDoctors.length)}+ ডাক্তার নিবন্ধিত` : `${featuredDoctors.length}+ Doctors Registered`}
              </span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                {lang === 'bn' ? '২৫০০+ শীঘ্রই যোগ দিচ্ছে' : '2500+ Joining Soon'}
              </Badge>
            </div>
          </div>

          {loadingDoctors ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <>
              {/* Carousel Container */}
              <div className="relative">
                {/* Navigation Arrows */}
                <button
                  onClick={() => {
                    const container = document.getElementById('doctors-carousel')
                    if (container) container.scrollBy({ left: -320, behavior: 'smooth' })
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-50 transition-colors border border-gray-200"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600 rotate-180" />
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('doctors-carousel')
                    if (container) container.scrollBy({ left: 320, behavior: 'smooth' })
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-50 transition-colors border border-gray-200"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>

                {/* Doctors Carousel */}
                <div
                  id="doctors-carousel"
                  className="flex gap-6 overflow-x-auto pb-4 px-2 scroll-smooth scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {featuredDoctors.map((doctor, index) => (
                    <Card 
                      key={doctor.id} 
                      className="flex-shrink-0 w-72 overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg"
                    >
                      {/* Photo Frame with Template */}
                      <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-32 h-40">
                            {/* Photo Frame Template */}
                            <Image
                              src="/template_photoframe.png"
                              alt="Frame"
                              fill
                              className="object-contain absolute inset-0 z-10"
                            />
                            {/* Doctor Photo */}
                            <Avatar className="w-28 h-28 absolute top-6 left-1/2 -translate-x-1/2 border-4 border-white shadow-lg z-0">
                              <AvatarImage src={doctor.user.image || ''} className="object-cover" />
                              <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-600">
                                {doctor.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        {/* Specialty Badge */}
                        <div className="absolute top-2 right-2 z-20">
                          <Badge className="bg-white/90 text-emerald-700 text-xs">
                            {doctor.specialization}
                          </Badge>
                        </div>
                        {/* Availability Indicator */}
                        <div className="absolute top-2 left-2 z-20">
                          <div className={`w-3 h-3 rounded-full ${doctor.isAvailable ? 'bg-green-400' : 'bg-gray-400'} ring-2 ring-white`} />
                        </div>
                      </div>
                      
                      <CardContent className="pt-4 pb-5 text-center">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{doctor.user.name}</h3>
                        <p className="text-emerald-600 text-sm font-medium mt-1">{doctor.specialization}</p>
                        
                        {/* Hospital/Position */}
                        {doctor.bio && (
                          <p className="text-gray-500 text-xs mt-2 line-clamp-2">{doctor.bio.substring(0, 60)}...</p>
                        )}
                        
                        {/* Stats Row */}
                        <div className="flex justify-center gap-4 mt-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{lang === 'bn' ? toBanglaNumerals(doctor.experience) : doctor.experience} {lang === 'bn' ? 'বছর' : 'yrs'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{lang === 'bn' ? '৪.৯' : '4.9'}</span>
                          </div>
                        </div>
                        
                        {/* Fee and Availability */}
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Badge className={doctor.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                            {doctor.isAvailable ? (lang === 'bn' ? 'উপলব্ধ' : 'Available') : (lang === 'bn' ? 'অফলাইন' : 'Offline')}
                          </Badge>
                          <span className="font-bold text-emerald-600">{formatCurrency(doctor.consultationFee, lang)}</span>
                        </div>
                        
                        <Button 
                          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 group-hover:shadow-md transition-shadow" 
                          onClick={onRegisterClick}
                        >
                          {t('bookNow')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* View All Card */}
                  <Card className="flex-shrink-0 w-72 overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-dashed border-emerald-300 bg-emerald-50/50 flex items-center justify-center min-h-[400px]">
                    <CardContent className="text-center p-6">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {lang === 'bn' ? 'সকল ডাক্তার দেখুন' : 'View All Doctors'}
                      </h3>
                      <p className="text-gray-500 text-sm mt-2">
                        {lang === 'bn' ? `${toBanglaNumerals(featuredDoctors.length)}+ ডাক্তার উপলব্ধ` : `${featuredDoctors.length}+ doctors available`}
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                        onClick={onRegisterClick}
                      >
                        {lang === 'bn' ? 'সকল দেখুন' : 'See All'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2, 3, 4].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-emerald-300 hover:bg-emerald-500 cursor-pointer transition-colors"
                    onClick={() => {
                      const container = document.getElementById('doctors-carousel')
                      if (container) container.scrollBy({ left: i * 320, behavior: 'smooth' })
                    }}
                  />
                ))}
              </div>

              {/* Specialty Quick Filters */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  { bn: 'সাধারণ চিকিৎসা', en: 'General', icon: Stethoscope },
                  { bn: 'হৃদরোগ', en: 'Cardiology', icon: Heart },
                  { bn: 'শিশু রোগ', en: 'Pediatrics', icon: Baby },
                  { bn: 'ত্বক রোগ', en: 'Dermatology', icon: Activity },
                  { bn: 'স্নায়ু রোগ', en: 'Neurology', icon: Brain },
                  { bn: 'গাইনি', en: 'Gynecology', icon: HeartPulse },
                  { bn: 'অর্থোপেডিক্স', en: 'Orthopedics', icon: Bone },
                  { bn: 'চক্ষু রোগ', en: 'Ophthalmology', icon: Eye },
                ].map((spec, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400"
                    onClick={onRegisterClick}
                  >
                    <spec.icon className="h-4 w-4 mr-1 text-emerald-600" />
                    {lang === 'bn' ? spec.bn : spec.en}
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section - Updated with new features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700">{t('features')}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {lang === 'bn' ? 'আধুনিক স্বাস্থ্যসেবার জন্য যা যা প্রয়োজন' : 'Everything You Need for Modern Healthcare'}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {lang === 'bn'
                ? 'রোগী, ডাক্তার এবং স্বাস্থ্যসেবা প্রশাসকদের জন্য শক্তিশালী টুলস—সব এক সমন্বিত প্ল্যাটফর্মে।'
                : 'Powerful tools for patients, doctors, and healthcare administrators—all in one integrated platform.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {featureCards.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                <div className="h-32 relative overflow-hidden">
                  <Image 
                    src={feature.image} 
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700">{t('howItWorks')}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {lang === 'bn' ? 'উন্নত স্বাস্থ্যের জন্য সহজ পদ্ধতি' : 'Simple Steps to Better Health'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">{lang === 'bn' ? 'মিনিটের মধ্যে শুরু করুন আমাদের সহজ প্ল্যাটফর্মে।' : 'Get started in minutes with our intuitive platform.'}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: lang === 'bn' ? 'অ্যাকাউন্ট তৈরি' : 'Create Account', description: lang === 'bn' ? 'ইমেইল দিয়ে সেকেন্ডে সাইন আপ করুন। পরিচয় নিরাপদে যাচাই করুন।' : 'Sign up in seconds with your email. Verify your identity securely.', icon: User },
              { step: '02', title: lang === 'bn' ? 'ডাক্তার খুঁজুন' : 'Find Your Doctor', description: lang === 'bn' ? 'বিশেষজ্ঞদের ব্রাউজ করুন, রিভিউ পড়ুন, এবং আপনার জন্য সঠিক ডাক্তার বেছে নিন।' : 'Browse specialists, read reviews, and choose the right doctor for you.', icon: Search },
              { step: '03', title: lang === 'bn' ? 'অ্যাপয়েন্টমেন্ট বুক' : 'Book Appointment', description: lang === 'bn' ? 'সুবিধাজনক সময় নির্বাচন করুন। নিরাপদে অনলাইনে পেমেন্ট করুন।' : 'Select a convenient time slot. Pay securely online.', icon: Calendar },
              { step: '04', title: lang === 'bn' ? 'সেবা নিন' : 'Get Care', description: lang === 'bn' ? 'ব্যক্তিগতভাবে দেখা করুন বা ভিডিওতে সংযুক্ত হন। তাৎক্ষণিক প্রেসক্রিপশন পান।' : 'Visit in person or connect via video. Receive prescriptions instantly.', icon: Heart },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-emerald-100">{item.step}</div>
                <div className="mt-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-emerald-200 to-transparent -translate-x-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Updated packages */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700">{t('pricing')}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {lang === 'bn' ? 'আপনার প্রয়োজন অনুযায়ী প্যাকেজ' : 'Plans for Every Need'}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {lang === 'bn' ? 'আপনার স্বাস্থ্যসেবার প্রয়োজনীয়তা অনুযায়ী নমনীয় মূল্য।' : 'Flexible pricing that scales with your healthcare needs.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPackages.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-emerald-500 shadow-xl' : 'border shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white">{t('mostPopular')}</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price === null ? (lang === 'bn' ? 'কাস্টম' : 'Custom') : plan.price === 0 ? (lang === 'bn' ? 'ফ্রি' : 'Free') : formatCurrency(plan.price)}
                    {plan.price !== null && plan.price > 0 && <span className="text-base font-normal text-gray-500">{t('perMonth')}</span>}
                  </div>
                  <ul className="mt-4 space-y-2 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={onRegisterClick}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section - Updated with more achievements */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{t('trustedBy')}</h2>
          <p className="mt-4 text-lg text-emerald-100">
            {lang === 'bn' ? 'আমাদের প্ল্যাটফর্ম সর্বোচ্চ নিরাপত্তা এবং কমপ্লায়েন্স মান পূরণ করে।' : 'Our platform meets the highest standards of security and compliance.'}
          </p>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((item, index) => (
              <div key={index} className="text-white">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="text-base font-semibold">{item.label}</div>
                <div className="text-sm text-emerald-200">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {lang === 'bn' ? 'আজই শুরু করুন আপনার স্বাস্থ্যসেবা যাত্রা!' : 'Ready to Transform Your Healthcare Experience?'}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {lang === 'bn' ? 'Doctor360-এ বিশ্বাস রাখেন এমন হাজার হাজার রোগী এবং ডাক্তারদের সাথে যোগ দিন।' : 'Join thousands of patients and doctors who trust Doctor360.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" onClick={onRegisterClick}>
              {t('getStarted')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Phone className="mr-2 h-5 w-5" />
              {t('scheduleDemo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Tall 6-Column Black Footer with updated contact info */}
      <footer className="bg-black text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-10 mb-16">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <Image src="/logo.png" alt="Doctor360" width={48} height={48} className="rounded-lg" />
                <span className="text-xl font-bold">Doctor360</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">{t('tagline')}</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-semibold mb-6 text-emerald-400 text-lg">{t('company')}</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('aboutUs')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('careers')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('blog')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'সংবাদ' : 'Press'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'অংশীদারিত্ব' : 'Partners'}</a></li>
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h4 className="font-semibold mb-6 text-emerald-400 text-lg">{t('services')}</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'অনলাইন কনসাল্টেশন' : 'Online Consultation'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'হোম স্বাস্থ্য সেবা' : 'Home Healthcare'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'ল্যাব টেস্ট' : 'Lab Tests'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'ই-প্রেসক্রিপশন' : 'E-Prescriptions'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'জরুরি সেবা' : 'Emergency Care'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'প্রবীণ সেবা' : 'Elder Care'}</a></li>
              </ul>
            </div>

            {/* For Patients Column */}
            <div>
              <h4 className="font-semibold mb-6 text-emerald-400 text-lg">{t('forPatients')}</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('findDoctors')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('bookAppointment')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('medicalRecords')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('prescriptions')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'স্বাস্থ্য টিপস' : 'Health Tips'}</a></li>
              </ul>
            </div>

            {/* For Doctors Column */}
            <div>
              <h4 className="font-semibold mb-6 text-emerald-400 text-lg">{t('forDoctors')}</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'যোগদান করুন' : 'Join as Doctor'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'প্রোফাইল সেটআপ' : 'Profile Setup'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'কনসাল্টেশন টুলস' : 'Consultation Tools'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'পেমেন্ট অপশন' : 'Payment Options'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'ডক্টর গাইড' : 'Doctor Guide'}</a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-semibold mb-6 text-emerald-400 text-lg">{t('support')}</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'এফএকিউ' : 'FAQ'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('contact')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{lang === 'bn' ? 'হটলাইন' : 'Hotline'}</a></li>
              </ul>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-gray-800 pt-10 mb-10">
            <div className="flex flex-wrap gap-6 justify-center">
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('termsOfService')}</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{lang === 'bn' ? 'কুকি নীতি' : 'Cookie Policy'}</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{lang === 'bn' ? 'ডিসক্লেমার' : 'Disclaimer'}</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('security')}</a>
              <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('api')}</a>
            </div>
          </div>

          {/* Contact Info - Updated with new address */}
          <div className="border-t border-gray-800 pt-10 mb-10">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 justify-center">
                <MapPin className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">STFL House, 173 E Ullon W Rampura, Dhaka 1217</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Phone className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">+৮৮০ ১৭XX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Mail className="h-5 w-5 text-emerald-400" />
                <span className="text-gray-400 text-sm">hi@doctor360.online</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-gray-800 pt-10 mb-10">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <span className="text-sm text-gray-400">{t('paymentMethods')}:</span>
              <div className="flex gap-3">
                <Badge variant="outline" className="border-pink-500 text-pink-400 hover:bg-pink-500/10">বিকাশ</Badge>
                <Badge variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">নগদ</Badge>
                <Badge variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">রকেট</Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">Visa</Badge>
                <Badge variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">Mastercard</Badge>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {lang === 'bn' ? toBanglaNumerals(2026) : '2026'} Doctor360. {t('copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// AUTH MODALS
// ============================================================================

function LoginModal({ open, onOpenChange, onSwitchToRegister }: { open: boolean; onOpenChange: (open: boolean) => void; onSwitchToRegister: () => void }) {
  const { login } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      onOpenChange(false)
      setEmail('')
      setPassword('')
    } else {
      setError(result.error || (t('error')))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('welcomeBack')}</DialogTitle>
          <DialogDescription>{lang === 'bn' ? 'আপনার Doctor360 অ্যাকাউন্টে সাইন ইন করুন' : 'Sign in to your Doctor360 account'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
            {t('signIn')}
          </Button>
          <p className="text-sm text-center text-gray-500">
            {lang === 'bn' ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
            <button type="button" onClick={onSwitchToRegister} className="text-emerald-600 hover:underline font-medium">
              {t('register')}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RegisterModal({ open, onOpenChange, onSwitchToLogin }: { open: boolean; onOpenChange: (open: boolean) => void; onSwitchToLogin: () => void }) {
  const { register } = useAuth()
  const { t, lang } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await register({ email, password, name, phone })
    setLoading(false)
    if (result.success) {
      onOpenChange(false)
      setName('')
      setEmail('')
      setPassword('')
      setPhone('')
    } else {
      setError(result.error || t('error'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('createAccount')}</DialogTitle>
          <DialogDescription>{lang === 'bn' ? 'Doctor360-এ নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create a new account on Doctor360'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            {t('register')}
          </Button>
          <p className="text-sm text-center text-gray-500">
            {lang === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
            <button type="button" onClick={onSwitchToLogin} className="text-emerald-600 hover:underline font-medium">
              {t('signIn')}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// PATIENT PORTAL
// ============================================================================

function PatientPortal({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { t, lang } = useLanguage()
  const [stats, setStats] = useState<any>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [emrNotes, setEmrNotes] = useState<EMRNote[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [statsRes, doctorsRes, appointmentsRes, emrRes, prescriptionsRes, paymentsRes] = await Promise.all([
        fetcher<{ stats: any }>('/api/dashboard'),
        fetcher<{ doctors: Doctor[] }>('/api/doctors'),
        fetcher<{ appointments: Appointment[] }>('/api/appointments'),
        fetcher<{ emrNotes: EMRNote[] }>('/api/emr'),
        fetcher<{ prescriptions: Prescription[] }>('/api/prescriptions'),
        fetcher<{ payments: Payment[] }>('/api/payments'),
      ])
      setStats(statsRes.stats)
      setDoctors(doctorsRes.doctors)
      setAppointments(appointmentsRes.appointments)
      setEmrNotes(emrRes.emrNotes)
      setPrescriptions(prescriptionsRes.prescriptions)
      setPayments(paymentsRes.payments)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const payNow = async (appointmentId: string) => {
    try {
      await fetcher('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ appointmentId }),
      })
      loadDashboardData()
    } catch (error) {
      console.error('Payment error:', error)
    }
  }

  const cancelAppointment = async (id: string) => {
    try {
      await fetcher(`/api/appointments/${id}`, { method: 'DELETE' })
      loadDashboardData()
    } catch (error) {
      console.error('Cancel error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const filteredAppointments = statusFilter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === statusFilter)

  return (
    <div>
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.totalAppointments || 0) : stats?.totalAppointments || 0}</div>
                    <div className="text-sm text-gray-500">{t('appointments')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.upcomingAppointments?.length || 0) : stats?.upcomingAppointments?.length || 0}</div>
                    <div className="text-sm text-gray-500">{t('upcomingAppointments')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.completedAppointments || 0) : stats?.completedAppointments || 0}</div>
                    <div className="text-sm text-gray-500">{t('completed')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.pendingPayments || 0) : stats?.pendingPayments || 0}</div>
                    <div className="text-sm text-gray-500">{t('pendingPayment')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>{t('upcomingAppointments')}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.upcomingAppointments?.length > 0 ? (
                <div className="space-y-4">
                  {stats.upcomingAppointments.map((apt: any) => (
                    <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={apt.doctor?.user?.image} />
                          <AvatarFallback>{apt.doctor?.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{apt.doctor?.user?.name}</div>
                          <div className="text-sm text-gray-500">{apt.doctor?.specialization}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatDate(apt.date, lang)}</div>
                        <div className="text-sm text-gray-500">{formatTime(apt.date, lang)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">{t('noData')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t('findDoctors')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={doctor.user.image || ''} />
                      <AvatarFallback className="text-xl">{doctor.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{doctor.user.name}</h3>
                      <p className="text-emerald-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{doctor.experience} {lang === 'bn' ? 'বছরের অভিজ্ঞতা' : 'yrs exp'}</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(doctor.consultationFee, lang)}</span>
                  </div>
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setActiveTab('appointments')}>
                    {t('bookAppointment')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t('appointments')}</h2>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="CONFIRMED">{t('confirmed')}</SelectItem>
                <SelectItem value="PENDING_PAYMENT">{t('pendingPayment')}</SelectItem>
                <SelectItem value="COMPLETED">{t('completed')}</SelectItem>
                <SelectItem value="CANCELLED">{t('cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={apt.doctor?.user?.image} />
                        <AvatarFallback>{apt.doctor?.user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{apt.doctor?.user?.name}</div>
                        <div className="text-sm text-gray-500">{apt.doctor?.specialization}</div>
                        <div className="text-sm text-gray-500">{formatDate(apt.date, lang)} - {formatTime(apt.date, lang)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(apt.status)}>{getStatusText(apt.status, t)}</Badge>
                      {apt.status === 'PENDING_PAYMENT' && apt.payment && (
                        <Button size="sm" onClick={() => payNow(apt.id)}>{t('payNow')} {formatCurrency(apt.payment.amount, lang)}</Button>
                      )}
                      {apt.status === 'CONFIRMED' && apt.type === 'VIDEO_CONSULTATION' && (
                        <Button size="sm" variant="outline">{t('joinSession')}</Button>
                      )}
                      {(apt.status === 'CONFIRMED' || apt.status === 'PENDING_PAYMENT') && (
                        <Button size="sm" variant="destructive" onClick={() => cancelAppointment(apt.id)}>{t('cancel')}</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'emr' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('medicalRecords')}</h2>
          <div className="space-y-4">
            {emrNotes.map((emr) => (
              <Card key={emr.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{emr.diagnosis || (lang === 'bn' ? 'চিকিৎসা রেকর্ড' : 'Medical Record')}</CardTitle>
                      <CardDescription>{formatDate(emr.createdAt, lang)} - {emr.doctor?.user?.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {emr.chiefComplaint && (
                      <div><span className="font-medium">{lang === 'bn' ? 'প্রধান সমস্যা:' : 'Chief Complaint:'}</span> {emr.chiefComplaint}</div>
                    )}
                    {emr.diagnosis && (
                      <div><span className="font-medium">{lang === 'bn' ? 'নির্ণয়:' : 'Diagnosis:'}</span> {emr.diagnosis}</div>
                    )}
                    {emr.treatment && (
                      <div><span className="font-medium">{lang === 'bn' ? 'চিকিৎসা:' : 'Treatment:'}</span> {emr.treatment}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('prescriptions')}</h2>
          <div className="space-y-4">
            {prescriptions.map((rx) => {
              const meds = typeof rx.medications === 'string' ? JSON.parse(rx.medications) : rx.medications
              return (
                <Card key={rx.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{lang === 'bn' ? 'প্রেসক্রিপশন' : 'Prescription'}</CardTitle>
                    <CardDescription>{formatDate(rx.createdAt, lang)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.isArray(meds) && meds.map((med: any, i: number) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">{med.name} - {med.dosage}</div>
                          <div className="text-sm text-gray-600">{med.frequency} - {med.duration}</div>
                          {med.notes && <div className="text-sm text-gray-500">{med.notes}</div>}
                        </div>
                      ))}
                    </div>
                    {rx.instructions && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                        <span className="font-medium">{lang === 'bn' ? 'নির্দেশনা:' : 'Instructions:'}</span> {rx.instructions}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('payments')}</h2>
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{payment.appointment?.doctor?.user?.name}</div>
                      <div className="text-sm text-gray-500">{formatDate(payment.createdAt, lang)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(payment.amount, lang)}</div>
                      <Badge className={getStatusColor(payment.status)}>{getStatusText(payment.status, t)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// DOCTOR DASHBOARD
// ============================================================================

function DoctorDashboard({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const { t, lang } = useLanguage()
  const [stats, setStats] = useState<any>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, appointmentsRes] = await Promise.all([
        fetcher<{ stats: any }>('/api/dashboard'),
        fetcher<{ appointments: Appointment[] }>('/api/appointments'),
      ])
      setStats(statsRes.stats)
      setAppointments(appointmentsRes.appointments)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetcher(`/api/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      loadData()
    } catch (error) {
      console.error('Error updating:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeTab === 'dashboard' && (
        <>
          <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.todayAppointments || 0) : stats?.todayAppointments || 0}</div>
                    <div className="text-sm text-gray-500">{t('todayAppointments')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.pendingAppointments || 0) : stats?.pendingAppointments || 0}</div>
                    <div className="text-sm text-gray-500">{t('pendingAppointments')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.completedConsultations || 0) : stats?.completedConsultations || 0}</div>
                    <div className="text-sm text-gray-500">{t('completedConsultations')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.totalPatients || 0) : stats?.totalPatients || 0}</div>
                    <div className="text-sm text-gray-500">{t('totalPatients')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Queue */}
          <Card>
            <CardHeader>
              <CardTitle>{t('todayAppointments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.filter(a => a.status === 'CONFIRMED').slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={apt.patient?.image} />
                        <AvatarFallback>{apt.patient?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{apt.patient?.name}</div>
                        <div className="text-sm text-gray-500">{formatTime(apt.date, lang)}</div>
                      </div>
                    </div>
                    <Button onClick={() => updateStatus(apt.id, 'IN_CONSULTATION')}>{t('startConsultation')}</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('appointments')}</h2>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{apt.patient?.name}</div>
                      <div className="text-sm text-gray-500">{formatDate(apt.date, lang)} - {formatTime(apt.date, lang)}</div>
                      <div className="text-sm text-gray-500">{apt.reason}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(apt.status)}>{getStatusText(apt.status, t)}</Badge>
                      {apt.status === 'CONFIRMED' && (
                        <Button size="sm" onClick={() => updateStatus(apt.id, 'IN_CONSULTATION')}>{t('startConsultation')}</Button>
                      )}
                      {apt.status === 'IN_CONSULTATION' && (
                        <Button size="sm" onClick={() => updateStatus(apt.id, 'COMPLETED')}>{t('markComplete')}</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('patients')}</h2>
          <p className="text-gray-500">{lang === 'bn' ? 'আপনার রোগীদের তালিকা এখানে দেখা যাবে।' : 'Your patient list will appear here.'}</p>
        </div>
      )}

      {activeTab === 'consultation' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('consultation')}</h2>
          <Card className="p-8">
            <div className="text-center">
              <Video className="h-16 w-16 mx-auto text-emerald-600 mb-4" />
              <p className="text-gray-500">{lang === 'bn' ? 'কোনো সক্রিয় কনসাল্টেশন নেই' : 'No active consultation'}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// ADMIN PANEL
// ============================================================================

function AdminPanel({ activeTab }: { activeTab: string }) {
  const { t, lang } = useLanguage()
  const [stats, setStats] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetcher<{ stats: any }>('/api/dashboard'),
        fetcher<{ logs: AuditLog[] }>('/api/audit-logs'),
      ])
      setStats(statsRes.stats)
      setAuditLogs(logsRes.logs)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeTab === 'dashboard' && (
        <>
          <h2 className="text-2xl font-bold">{t('dashboard')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.totalUsers || 0) : stats?.totalUsers || 0}</div>
                    <div className="text-sm text-gray-500">{t('totalUsers')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.totalDoctors || 0) : stats?.totalDoctors || 0}</div>
                    <div className="text-sm text-gray-500">{t('totalDoctors')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{lang === 'bn' ? toBanglaNumerals(stats?.totalAppointments || 0) : stats?.totalAppointments || 0}</div>
                    <div className="text-sm text-gray-500">{t('appointments')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0, lang)}</div>
                    <div className="text-sm text-gray-500">{t('totalRevenue')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('users')}</h2>
          <p className="text-gray-500">{lang === 'bn' ? 'সিস্টেমের সকল ব্যবহারকারীর তালিকা' : 'List of all system users'}</p>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('auditLogs')}</h2>
          <Card>
            <CardContent className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{lang === 'bn' ? 'অ্যাকশন' : 'Action'}</TableHead>
                    <TableHead>{lang === 'bn' ? 'ব্যবহারকারী' : 'User'}</TableHead>
                    <TableHead>{lang === 'bn' ? 'এন্টিটি' : 'Entity'}</TableHead>
                    <TableHead>{lang === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell><Badge>{log.action}</Badge></TableCell>
                      <TableCell>{log.user?.name || '-'}</TableCell>
                      <TableCell>{log.entityType || '-'}</TableCell>
                      <TableCell>{formatDate(log.createdAt, lang)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// TYPES
// ============================================================================

interface Doctor {
  id: string
  phone: string | null
  specialization: string
  licenseNumber: string
  education: string | null
  experience: number
  consultationFee: number
  bio: string | null
  isVerified: boolean
  isAvailable: boolean
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

interface Appointment {
  id: string
  date: string
  duration: number
  type: 'IN_PERSON' | 'VIDEO_CONSULTATION' | 'PHONE_CONSULTATION'
  status: 'DRAFT' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED'
  reason: string | null
  notes: string | null
  sessionToken: string | null
  patient?: {
    id: string
    name: string
    email: string
    image: string | null
    patientProfile?: {
      phone: string | null
      bloodType: string | null
      dateOfBirth: string | null
    }
  }
  doctor?: {
    id: string
    specialization: string
    user: {
      id: string
      name: string
      email: string
      image: string | null
    }
  }
  payment?: {
    id: string
    amount: number
    status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  }
  emrNote?: EMRNote
  prescription?: Prescription
}

interface EMRNote {
  id: string
  chiefComplaint: string | null
  presentIllness: string | null
  diagnosis: string | null
  treatment: string | null
  notes: string | null
  vitalSigns: string | null
  createdAt: string
  doctor?: {
    user: {
      name: string
    }
  }
}

interface Prescription {
  id: string
  medications: string | { name: string; dosage: string; frequency: string; duration: string; notes?: string }[]
  instructions: string | null
  validUntil: string | null
  createdAt: string
  appointment?: {
    doctor: {
      user: {
        name: string
      }
    }
  }
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  paymentMethod: string | null
  transactionId: string | null
  createdAt: string
  appointment?: {
    doctor: {
      user: {
        name: string
      }
    }
  }
}

interface AuditLog {
  id: string
  action: string
  entityType: string | null
  entityId: string | null
  details: string | null
  createdAt: string
  user?: {
    name: string
    email: string
    role: string
  }
}

let lang: Language = 'bn' // Default for module-level access
