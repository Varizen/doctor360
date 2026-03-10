import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const specialties = [
  { name: 'সাধারণ চিকিৎসা', description: 'প্রাথমিক স্বাস্থ্য সেবা এবং সাধারণ চিকিৎসা', icon: 'stethoscope' },
  { name: 'হৃদরোগ বিশেষজ্ঞ', description: 'হৃদযন্ত্র এবং রক্তসংবহন তন্ত্র', icon: 'heart' },
  { name: 'ত্বক রোগ বিশেষজ্ঞ', description: 'ত্বক, চুল এবং নখের সমস্যা', icon: 'scan' },
  { name: 'শিশু রোগ বিশেষজ্ঞ', description: 'শিশুদের চিকিৎসা সেবা', icon: 'baby' },
  { name: 'অর্থোপেডিক্স', description: 'হাড়, জয়েন্ট এবং পেশী', icon: 'bone' },
  { name: 'স্নায়ু রোগ বিশেষজ্ঞ', description: 'মস্তিষ্ক এবং স্নায়ুতন্ত্র', icon: 'brain' },
  { name: 'মানসিক রোগ বিশেষজ্ঞ', description: 'মানসিক স্বাস্থ্য এবং আচরণগত সমস্যা', icon: 'brain-circuit' },
  { name: 'গাইনি ও প্রসূতি', description: 'নারীদের স্বাস্থ্য সেবা', icon: 'heart-pulse' },
  { name: 'চক্ষু রোগ বিশেষজ্ঞ', description: 'চোখের চিকিৎসা এবং দৃষ্টি', icon: 'eye' },
  { name: 'ইএনটি', description: 'কান, নাক এবং গলা বিশেষজ্ঞ', icon: 'ear' },
]

// Real Bangladeshi Doctor Photos from Unsplash (South Asian professionals)
const doctorPhotos = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80', // Female doctor 1
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80', // Female doctor 2
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80', // Male doctor 1
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80', // Male doctor 2
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80', // Male doctor 3
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80', // Female doctor 3
  'https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=400&q=80', // Male doctor 4
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&q=80', // Female doctor 4
]

async function main() {
  console.log('🌱 ডাটাবেস সীড শুরু হচ্ছে...')

  // Clean existing data
  console.log('🧹 পুরাতন ডাটা মুছে ফেলা হচ্ছে...')
  await prisma.auditLog.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.eMRNote.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.patientProfile.deleteMany()
  await prisma.doctorProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.specialty.deleteMany()

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create specialties
  console.log('📋 বিশেষজ্ঞতা তৈরি হচ্ছে...')
  for (const specialty of specialties) {
    await prisma.specialty.create({ data: specialty })
  }

  // Create Admin User
  console.log('👤 অ্যাডমিন তৈরি হচ্ছে...')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@doctor360.online',
      password: hashedPassword,
      name: 'মোঃ রফিকুল ইসলাম',
      role: 'ADMIN',
      emailVerified: new Date(),
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    },
  })

  // Create Doctor Users (Bangladeshi Names with different photos)
  console.log('👨‍⚕️ ডাক্তারদের প্রোফাইল তৈরি হচ্ছে...')
  const doctors = await Promise.all([
    prisma.user.create({
      data: {
        email: 'dr.fatema@doctor360.online',
        password: hashedPassword,
        name: 'ডা. ফাতেমা আক্তার',
        role: 'DOCTOR',
        emailVerified: new Date(),
        image: doctorPhotos[0],
        doctorProfile: {
          create: {
            phone: '+880-1711-123456',
            specialization: 'সাধারণ চিকিৎসা',
            licenseNumber: 'BMC-2018-001',
            education: 'ঢাকা মেডিকেল কলেজ, ঢাকা বিশ্ববিদ্যালয়',
            experience: 12,
            consultationFee: 800,
            bio: '১২ বছরের অভিজ্ঞতা সম্পন্ন সাধারণ চিকিৎসক। প্রতিরোধমূলক স্বাস্থ্যসেবা, ডায়াবেটিস ও উচ্চ রক্তচাপ ব্যবস্থাপনায় বিশেষজ্ঞ।',
            availableDays: JSON.stringify(['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার']),
            availableHours: JSON.stringify({ start: '০৯:০০', end: '১৭:০০' }),
            isVerified: true,
            isAvailable: true,
          },
        },
      },
      include: { doctorProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.kamal@doctor360.online',
        password: hashedPassword,
        name: 'ডা. মোহাম্মদ কামাল হোসেন',
        role: 'DOCTOR',
        emailVerified: new Date(),
        image: doctorPhotos[2],
        doctorProfile: {
          create: {
            phone: '+880-1812-234567',
            specialization: 'হৃদরোগ বিশেষজ্ঞ',
            licenseNumber: 'BMC-2012-042',
            education: 'বঙ্গবন্ধু মেডিকেল বিশ্ববিদ্যালয়, ঢাকা',
            experience: 18,
            consultationFee: 1500,
            bio: 'এশিয়া হার্ট সোসাইটির সদস্য। ইন্টারভেনশনাল কার্ডিওলজিতে বিশেষ প্রশিক্ষণপ্রাপ্ত। হার্টের জটিল রোগ নির্ণয়ে দক্ষ।',
            availableDays: JSON.stringify(['সোমবার', 'বুধবার', 'শুক্রবার']),
            availableHours: JSON.stringify({ start: '১০:০০', end: '১৬:০০' }),
            isVerified: true,
            isAvailable: true,
          },
        },
      },
      include: { doctorProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.nusrat@doctor360.online',
        password: hashedPassword,
        name: 'ডা. নুসরাত জাহান',
        role: 'DOCTOR',
        emailVerified: new Date(),
        image: doctorPhotos[1],
        doctorProfile: {
          create: {
            phone: '+880-1913-345678',
            specialization: 'শিশু রোগ বিশেষজ্ঞ',
            licenseNumber: 'BMC-2019-089',
            education: 'স্যার সলিমুল্লা মেডিকেল কলেজ, ঢাকা',
            experience: 8,
            consultationFee: 700,
            bio: 'শিশুদের স্বাস্থ্য সেবায় নিবেদিত। নবজাতক থেকে কিশোর-কিশোরীদের সকল স্বাস্থ্য সমস্যায় বিশেষজ্ঞ।',
            availableDays: JSON.stringify(['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বৃহস্পতিবার']),
            availableHours: JSON.stringify({ start: '০৮:০০', end: '১৫:০০' }),
            isVerified: true,
            isAvailable: true,
          },
        },
      },
      include: { doctorProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.rashid@doctor360.online',
        password: hashedPassword,
        name: 'ডা. আব্দুর রশিদ আহমেদ',
        role: 'DOCTOR',
        emailVerified: new Date(),
        image: doctorPhotos[3],
        doctorProfile: {
          create: {
            phone: '+880-1614-456789',
            specialization: 'ত্বক রোগ বিশেষজ্ঞ',
            licenseNumber: 'BMC-2015-156',
            education: 'চট্টগ্রাম মেডিকেল কলেজ, চট্টগ্রাম',
            experience: 10,
            consultationFee: 1000,
            bio: 'ত্বকের সকল সমস্যায় বিশেষজ্ঞ। কসমেটিক ডার্মাটোলজি, একজিমা, এলার্জি চিকিৎসায় দক্ষ।',
            availableDays: JSON.stringify(['মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার']),
            availableHours: JSON.stringify({ start: '০৯:০০', end: '১৭:০০' }),
            isVerified: true,
            isAvailable: true,
          },
        },
      },
      include: { doctorProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.sharmin@doctor360.online',
        password: hashedPassword,
        name: 'ডা. শারমিন সুলতানা',
        role: 'DOCTOR',
        emailVerified: new Date(),
        image: doctorPhotos[5],
        doctorProfile: {
          create: {
            phone: '+880-1515-567890',
            specialization: 'গাইনি ও প্রসূতি',
            licenseNumber: 'BMC-2014-203',
            education: 'ঢাকা মেডিকেল কলেজ, ঢাকা বিশ্ববিদ্যালয়',
            experience: 11,
            consultationFee: 1200,
            bio: 'নারীদের স্বাস্থ্য সেবায় অভিজ্ঞ। গর্ভাবস্থা, প্রসূতি সেবা ও ইনফার্টিলিটি চিকিৎসায় বিশেষজ্ঞ।',
            availableDays: JSON.stringify(['রবিবার', 'সোমবার', 'মঙ্গলবার', 'শুক্রবার']),
            availableHours: JSON.stringify({ start: '১০:০০', end: '১৮:০০' }),
            isVerified: true,
            isAvailable: true,
          },
        },
      },
      include: { doctorProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.anis@doctor360.online',
        password: hashedPassword,
        name: 'ডা. আনিসুর রহমান',
        role: 'DOCTOR',
        emailVerified: new Date(),
        image: doctorPhotos[4],
        doctorProfile: {
          create: {
            phone: '+880-1816-678901',
            specialization: 'অর্থোপেডিক্স',
            licenseNumber: 'BMC-2013-287',
            education: 'ন্যাশনাল ইনস্টিটিউট অফ অর্থোপেডিক্স, ঢাকা',
            experience: 14,
            consultationFee: 1200,
            bio: 'অস্থি ও জয়েন্ট সার্জারিতে বিশেষজ্ঞ। স্পোর্টস মেডিসিন, জয়েন্ট রিপ্লেসমেন্ট সার্জারিতে দক্ষ।',
            availableDays: JSON.stringify(['সোমবার', 'মঙ্গলবার', 'বৃহস্পতিবার', 'শুক্রবার']),
            availableHours: JSON.stringify({ start: '০৯:০০', end: '১৬:০০' }),
            isVerified: true,
            isAvailable: true,
          },
        },
      },
      include: { doctorProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.tahmina@doctor360.online',
        password: hashedPassword,
        name: 'ডা. তাহমিনা বেগম',
        role: 'DOCTOR',
        emailVerified: new Date(),
        image: doctorPhotos[6],
        doctorProfile: {
          create: {
            phone: '+880-1917-789012',
            specialization: 'চক্ষু রোগ বিশেষজ্ঞ',
            licenseNumber: 'BMC-2017-312',
            education: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
            experience: 9,
            consultationFee: 900,
            bio: 'চোখের সকল সমস্যায় বিশেষজ্ঞ। ক্যাটারাক্ট সার্জারি, ল্যাসিক ও গ্লুকোমা চিকিৎসায় দক্ষ।',
            availableDays: JSON.stringify(['রবিবার', 'সোমবার', 'বুধবার', 'বৃহস্পতিবার']),
            availableHours: JSON.stringify({ start: '১০:০০', end: '১৭:০০' }),
            isVerified: true,
            isAvailable: true,
          },
        },
      },
      include: { doctorProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'dr.habib@doctor360.online',
        password: hashedPassword,
        name: 'ডা. হাবিবুর রহমান',
        role: 'DOCTOR',
        emailVerified: new Date(),
        image: doctorPhotos[7],
        doctorProfile: {
          create: {
            phone: '+880-1718-890123',
            specialization: 'স্নায়ু রোগ বিশেষজ্ঞ',
            licenseNumber: 'BMC-2011-398',
            education: 'ঢাকা মেডিকেল কলেজ, যুক্তরাজ্য প্রশিক্ষণ',
            experience: 16,
            consultationFee: 1500,
            bio: 'মস্তিষ্ক ও স্নায়ুতন্ত্রের রোগে বিশেষজ্ঞ। স্ট্রোক, মাইগ্রেন, এপিলেপসি চিকিৎসায় অভিজ্ঞ।',
            availableDays: JSON.stringify(['সোমবার', 'মঙ্গলবার', 'বৃহস্পতিবার']),
            availableHours: JSON.stringify({ start: '১১:০০', end: '১৮:০০' }),
            isVerified: true,
            isAvailable: true,
          },
        },
      },
      include: { doctorProfile: true },
    }),
  ])

  // Create Patient Users (Bangladeshi Names)
  console.log('🏥 রোগীদের প্রোফাইল তৈরি হচ্ছে...')
  const patients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'rahim@doctor360.online',
        password: hashedPassword,
        name: 'আব্দুর রহিম',
        role: 'PATIENT',
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
        patientProfile: {
          create: {
            phone: '+880-1811-111111',
            dateOfBirth: new Date('1985-03-15'),
            gender: 'পুরুষ',
            bloodType: 'O+',
            address: '১২৩, মতিঝিল, ঢাকা-১০০০',
            emergencyContact: 'ফাতেমা বেগম, +880-1811-222222',
            medicalHistory: JSON.stringify({
              allergies: ['পেনিসিলিন'],
              conditions: ['উচ্চ রক্তচাপ'],
              medications: ['এমলোডিপাইন ৫মিলিগ্রাম'],
            }),
            insuranceProvider: 'জীবন বীমা কর্পোরেশন',
            insuranceNumber: 'JBC-12345678',
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'karima@doctor360.online',
        password: hashedPassword,
        name: 'করিমা খাতুন',
        role: 'PATIENT',
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
        patientProfile: {
          create: {
            phone: '+880-1922-222222',
            dateOfBirth: new Date('1990-07-22'),
            gender: 'মহিলা',
            bloodType: 'A+',
            address: '৪৫, ধানমন্ডি, ঢাকা-১২০৫',
            emergencyContact: 'মোহাম্মদ করিম, +880-1922-333333',
            medicalHistory: JSON.stringify({
              allergies: [],
              conditions: ['এজমা'],
              medications: ['সালবিউটামল ইনহেলার'],
            }),
            insuranceProvider: 'সাধারণ বীমা কোম্পানি',
            insuranceNumber: 'SGIC-87654321',
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'alam@doctor360.online',
        password: hashedPassword,
        name: 'মোঃ আলমগীর হোসেন',
        role: 'PATIENT',
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        patientProfile: {
          create: {
            phone: '+880-1933-333333',
            dateOfBirth: new Date('1978-11-08'),
            gender: 'পুরুষ',
            bloodType: 'B+',
            address: '৭৮, উত্তরা, ঢাকা-১২৩০',
            emergencyContact: 'রোকেয়া বেগম, +880-1933-444444',
            medicalHistory: JSON.stringify({
              allergies: ['সালফা ড্রাগ', 'ল্যাটেক্স'],
              conditions: ['টাইপ-২ ডায়াবেটিস', 'উচ্চ কোলেস্টেরল'],
              medications: ['মেটফরমিন ৫০০মিলিগ্রাম', 'অ্যাটোরভাস্ট্যাটিন ২০মিলিগ্রাম'],
            }),
            insuranceProvider: 'প্রগতি বীমা লিমিটেড',
            insuranceNumber: 'PBL-11223344',
          },
        },
      },
      include: { patientProfile: true },
    }),
  ])

  // Create sample appointments
  console.log('📅 অ্যাপয়েন্টমেন্ট তৈরি হচ্ছে...')
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(14, 0, 0, 0)

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(11, 0, 0, 0)

  // Confirmed appointment for tomorrow
  const appointment1 = await prisma.appointment.create({
    data: {
      patientId: patients[0].id,
      doctorId: doctors[0].doctorProfile!.id,
      date: tomorrow,
      duration: 30,
      type: 'IN_PERSON',
      status: 'CONFIRMED',
      reason: 'বার্ষিক স্বাস্থ্য পরীক্ষা এবং রক্তচাপ পর্যালোচনা',
      sessionToken: `session-${Date.now()}-1`,
    },
  })

  // Pending payment appointment
  const appointment2 = await prisma.appointment.create({
    data: {
      patientId: patients[1].id,
      doctorId: doctors[1].doctorProfile!.id,
      date: nextWeek,
      duration: 45,
      type: 'VIDEO_CONSULTATION',
      status: 'PENDING_PAYMENT',
      reason: 'হৃদয় স্বাস্থ্য মূল্যায়ন ফলো-আপ',
    },
  })

  // Completed appointment with EMR and prescription
  const appointment3 = await prisma.appointment.create({
    data: {
      patientId: patients[0].id,
      doctorId: doctors[0].doctorProfile!.id,
      date: yesterday,
      duration: 30,
      type: 'IN_PERSON',
      status: 'COMPLETED',
      reason: 'সর্দি-কাশি এবং জ্বর',
    },
  })

  // Create EMR note for completed appointment
  await prisma.eMRNote.create({
    data: {
      appointmentId: appointment3.id,
      patientId: patients[0].id,
      doctorId: doctors[0].doctorProfile!.id,
      chiefComplaint: '৩ দিন ধরে সর্দি-কাশি এবং জ্বর',
      presentIllness: 'রোগী জানিয়েছে সর্দি, গলা ব্যথা, হালকা জ্বর (৯৯.৫°F), এবং দুর্বলতা। লক্ষণ ৩ দিন আগে শুরু হয়েছে। কাশি বা শ্বাসকষ্ট নেই।',
      diagnosis: 'তীব্র ভাইরাল ঊর্ধ্ব শ্বাসনালীর সংক্রমণ (সাধারণ সর্দি)',
      treatment: 'বিশ্রাম, পর্যাপ্ত পানি পান এবং প্রয়োজনে ওভার-দ্য-কাউন্টার সর্দি ওষুধ সেবন',
      notes: 'রোগীকে পরামর্শ দেওয়া হয়েছে লক্ষণ খারাপ হলে বা ১০ দিনের বেশি স্থায়ী হলে ফিরে আসতে। ব্যাকটেরিয়াল সংক্রমণের সন্দেহ নেই, অ্যান্টিবায়োটিক প্রয়োজন নেই।',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      vitalSigns: JSON.stringify({
        temperature: '৯৯.৫°F',
        bloodPressure: '১২০/৮০',
        pulse: '৭২',
        weight: '৭৫ কেজি',
      }),
    },
  })

  // Create prescription for completed appointment
  await prisma.prescription.create({
    data: {
      appointmentId: appointment3.id,
      patientId: patients[0].id,
      medications: JSON.stringify([
        {
          name: 'প্যারাসিটামল',
          dosage: '৫০০মিলিগ্রাম',
          frequency: 'প্রতি ৪-৬ ঘণ্টা পর পর প্রয়োজনে',
          duration: '৫ দিন',
          notes: 'জ্বর এবং শরীর ব্যথার জন্য',
        },
        {
          name: 'সিউডোএফেড্রিন',
          dosage: '১০মিলিগ্রাম',
          frequency: 'প্রতি ৪ ঘণ্টা পর',
          duration: '৫ দিন',
          notes: 'নাক বন্ধের জন্য',
        },
      ]),
      instructions: 'ওষুধ নির্দেশমতো সেবন করুন। পর্যাপ্ত পানি পান করুন। পর্যাপ্ত বিশ্রাম নিন। ওষুধ সেবনকালে অ্যালকোহল পরিহার করুন।',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Create payment for completed appointment
  await prisma.payment.create({
    data: {
      appointmentId: appointment3.id,
      patientId: patients[0].id,
      amount: 800,
      currency: 'BDT',
      status: 'PAID',
      paymentMethod: 'বিকাশ',
      transactionId: `BKS-${Date.now()}`,
      paidAt: yesterday,
    },
  })

  // Create pending payment
  await prisma.payment.create({
    data: {
      appointmentId: appointment2.id,
      patientId: patients[1].id,
      amount: 1500,
      currency: 'BDT',
      status: 'PENDING',
    },
  })

  // Create audit logs
  console.log('📝 অডিট লগ তৈরি হচ্ছে...')
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: admin.id,
        details: JSON.stringify({ message: 'অ্যাডমিন অ্যাকাউন্ট তৈরি' }),
      },
      {
        userId: patients[0].id,
        action: 'APPOINTMENT_CREATED',
        entityType: 'Appointment',
        entityId: appointment1.id,
        details: JSON.stringify({ doctorId: doctors[0].doctorProfile!.id, date: tomorrow }),
      },
      {
        userId: patients[0].id,
        action: 'APPOINTMENT_CREATED',
        entityType: 'Appointment',
        entityId: appointment3.id,
        details: JSON.stringify({ doctorId: doctors[0].doctorProfile!.id, date: yesterday }),
      },
      {
        userId: doctors[0].id,
        action: 'EMR_CREATED',
        entityType: 'EMRNote',
        details: JSON.stringify({ appointmentId: appointment3.id, patientId: patients[0].id }),
      },
      {
        userId: doctors[0].id,
        action: 'PRESCRIPTION_CREATED',
        entityType: 'Prescription',
        details: JSON.stringify({ appointmentId: appointment3.id, patientId: patients[0].id }),
      },
      {
        userId: patients[0].id,
        action: 'PAYMENT_CREATED',
        entityType: 'Payment',
        entityId: appointment3.id,
        details: JSON.stringify({ amount: 800, status: 'PAID' }),
      },
    ],
  })

  console.log('✅ সীড সফলভাবে সম্পন্ন হয়েছে!')
  console.log('\n📋 ডেমো ক্রেডেনশিয়াল:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('অ্যাডমিন:   admin@doctor360.online / admin123')
  console.log('ডাক্তার:    dr.fatema@doctor360.online / admin123')
  console.log('রোগী:      rahim@doctor360.online / admin123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ সীড ব্যর্থ:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
