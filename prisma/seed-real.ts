import { PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Type for doctor with profile
type DoctorWithProfile = User & {
  doctorProfile: {
    id: string
    specialization: string
    consultationFee: number
    experience: number
    bio: string | null
    isAvailable: boolean
  } | null
}

// Specialty mapping from CSV to our system
const specialtyMapping: Record<string, string> = {
  'লিভার বিশেষজ্ঞ': 'লিভার বিশেষজ্ঞ',
  'মেডিসিন বিশেষজ্ঞ': 'সাধারণ চিকিৎসা',
  'নবজাতক ও শিশু বিশেষজ্ঞ': 'শিশু রোগ বিশেষজ্ঞ',
  'নিউরোলজি বিশেষজ্ঞ': 'স্নায়ু রোগ বিশেষজ্ঞ',
  'অর্থোপেডিক বিশেষজ্ঞ': 'অর্থোপেডিক্স',
  'মনোরোগ বিশেষজ্ঞ': 'মানসিক রোগ বিশেষজ্ঞ',
  'ত্বক, চর্ম ও যৌন রোগ বিশেষজ্ঞ': 'ত্বক রোগ বিশেষজ্ঞ',
  'নাক কান ও গলা রোগ বিশেষজ্ঞ': 'ইএনটি',
  'দাঁতের ডাক্তার': 'ডেন্টাল',
  'রক্তরোগ বিশেষজ্ঞ': 'হেমাটোলজি',
  'ব্রেস্ট সার্জন বিশেষজ্ঞ': 'সার্জন',
  'জেনারেল সার্জন': 'সার্জন',
  'ক্যান্সার সার্জন': 'অনকোলজি',
  'গাইনী ও প্রসূতি বিশেষজ্ঞ': 'গাইনি ও প্রসূতি',
  'বাত ব্যাথা বিশেষজ্ঞ': 'রিউমাটোলজি',
  'ইউরোলজি বিশেষজ্ঞ': 'ইউরোলজি',
  'বক্ষব্যাধি বিশেষজ্ঞ': 'চেস্ট মেডিসিন',
  'ভাস্কুলার সার্জন': 'ভাস্কুলার সার্জন',
  'কার্ডিয়াক সার্জন': 'হৃদরোগ বিশেষজ্ঞ',
  'অ্যানেস্থেসিওলজিস্ট': 'অ্যানেস্থেসিয়া',
  'কোলোরেক্টাল সার্জন': 'সার্জন',
}

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
  { name: 'ডেন্টাল', description: 'দাঁত এবং মুখের স্বাস্থ্য', icon: 'tooth' },
  { name: 'সার্জন', description: 'সাধারণ এবং বিশেষায়িত সার্জারি', icon: 'scissors' },
  { name: 'হেমাটোলজি', description: 'রক্ত রোগ বিশেষজ্ঞ', icon: 'droplet' },
  { name: 'অনকোলজি', description: 'ক্যান্সার চিকিৎসা', icon: 'ribbon' },
  { name: 'রিউমাটোলজি', description: 'বাত এবং জয়েন্টের রোগ', icon: 'activity' },
  { name: 'ইউরোলজি', description: 'মূত্রনালী এবং প্রস্রাব সংক্রান্ত রোগ', icon: 'kidney' },
  { name: 'চেস্ট মেডিসিন', description: 'বুক এবং শ্বাসতন্ত্রের রোগ', icon: 'wind' },
  { name: 'ভাস্কুলার সার্জন', description: 'রক্তনালী সার্জারি', icon: 'heart-pulse' },
  { name: 'অ্যানেস্থেসিয়া', description: 'অবেদন এবং ব্যথা ব্যবস্থাপনা', icon: 'syringe' },
  { name: 'লিভার বিশেষজ্ঞ', description: 'যকৃত এবং পিত্তথলির রোগ', icon: 'liver' },
]

interface DoctorCSV {
  name: string
  degrees: string
  position: string
  hospital: string
  specialty: string
  location: string
  profile_url: string
  hospital_url: string
  photo_url: string
  photo_path: string
}

function parseCSV(content: string): DoctorCSV[] {
  const lines = content.split('\n')
  const headers = lines[0].split(',')
  const doctors: DoctorCSV[] = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    // Handle CSV with quoted fields
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    if (values.length >= 10) {
      doctors.push({
        name: values[0] || '',
        degrees: values[1] || '',
        position: values[2] || '',
        hospital: values[3] || '',
        specialty: values[4] || '',
        location: values[5] || '',
        profile_url: values[6] || '',
        hospital_url: values[7] || '',
        photo_url: values[8] || '',
        photo_path: values[9] || '',
      })
    }
  }
  
  return doctors
}

async function main() {
  console.log('🌱 ডাটাবেস সীড শুরু হচ্ছে...')

  // Clean existing data
  console.log('🧹 পুরাতন ডাটা মুছে ফেলা হচ্ছে...')
  await prisma.aIChatMessage.deleteMany()
  await prisma.aIChatSession.deleteMany()
  await prisma.centralArchive.deleteMany()
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
      image: '/template_photoframe.png',
    },
  })

  // Read doctors from CSV
  console.log('👨‍⚕️ ডাক্তারদের তথ্য পড়া হচ্ছে...')
  const csvPath = path.join(__dirname, '../../data/doctors_dhaka.csv')
  let doctorsData: DoctorCSV[] = []
  
  try {
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    doctorsData = parseCSV(csvContent)
    console.log(`📊 ${doctorsData.length} জন ডাক্তার পাওয়া গেছে`)
  } catch (error) {
    console.log('⚠️ CSV ফাইল পাওয়া যায়নি, ডিফল্ট ডাক্তার ব্যবহার করা হচ্ছে')
  }

  // Create Doctor Users from CSV
  console.log('👨‍⚕️ ডাক্তারদের প্রোফাইল তৈরি হচ্ছে...')
  
  const doctorPromises: Promise<DoctorWithProfile>[] = []
  const usedEmails = new Set<string>()
  
  for (let i = 0; i < Math.min(doctorsData.length, 50); i++) {
    const doctor = doctorsData[i]
    if (!doctor.name || !doctor.specialty) continue
    
    // Generate unique email
    const emailBase = doctor.name
      .replace(/^(ডা\.|অধ্যাপক ডা\.|প্রফেসর ডা\.|ডা\.\s*)/i, '')
      .replace(/\s+/g, '.')
      .replace(/[()]/g, '')
      .toLowerCase()
      .substring(0, 30)
    
    const email = `${emailBase}@doctor360.online`.replace(/\.\./g, '.')
    
    if (usedEmails.has(email)) continue
    usedEmails.add(email)
    
    // Map specialty
    const mappedSpecialty = specialtyMapping[doctor.specialty] || doctor.specialty || 'সাধারণ চিকিৎসা'
    
    // Photo path - use local path
    const photoPath = doctor.photo_path ? `/doctors/${path.basename(doctor.photo_path)}` : '/template_photoframe.png'
    
    // Generate license number
    const licenseNumber = `BMC-${2020 + (i % 6)}-${String(i + 1).padStart(3, '0')}`
    
    // Generate consultation fee based on position
    let consultationFee = 800
    if (doctor.position.includes('অধ্যাপক') || doctor.position.includes('Professor')) {
      consultationFee = 1500
    } else if (doctor.position.includes('সহযোগী') || doctor.position.includes('Associate')) {
      consultationFee = 1200
    } else if (doctor.position.includes('সিনিয়র') || doctor.position.includes('Senior')) {
      consultationFee = 1000
    }
    
    // Generate experience years
    const experience = 10 + Math.floor(Math.random() * 20)
    
    // Generate available days
    const availableDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার']
      .filter(() => Math.random() > 0.3)
    
    doctorPromises.push(
      prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: doctor.name,
          role: 'DOCTOR',
          emailVerified: new Date(),
          image: photoPath,
          doctorProfile: {
            create: {
              phone: `+880-1${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}-${Math.floor(100000 + Math.random() * 900000)}`,
              specialization: mappedSpecialty,
              licenseNumber,
              education: doctor.degrees || 'MBBS',
              experience,
              consultationFee,
              bio: `${doctor.position || 'ডাক্তার'} - ${doctor.hospital || 'বাংলাদেশ'}। ${doctor.specialty} বিশেষজ্ঞ।`,
              availableDays: JSON.stringify(availableDays),
              availableHours: JSON.stringify({ start: '০৯:০০', end: '১৭:০০' }),
              isVerified: true,
              isAvailable: true,
            },
          },
        },
        include: { doctorProfile: true },
      }) as Promise<DoctorWithProfile>
    )
  }

  // If no doctors from CSV, create default doctors
  if (doctorPromises.length === 0) {
    const defaultDoctors = [
      {
        email: 'dr.fatema@doctor360.online',
        name: 'ডা. ফাতেমা আক্তার',
        specialization: 'সাধারণ চিকিৎসা',
        education: 'ঢাকা মেডিকেল কলেজ, ঢাকা বিশ্ববিদ্যালয়',
        experience: 12,
        consultationFee: 800,
        bio: '১২ বছরের অভিজ্ঞতা সম্পন্ন সাধারণ চিকিৎসক।',
      },
      {
        email: 'dr.kamal@doctor360.online',
        name: 'ডা. মোহাম্মদ কামাল হোসেন',
        specialization: 'হৃদরোগ বিশেষজ্ঞ',
        education: 'বঙ্গবন্ধু মেডিকেল বিশ্ববিদ্যালয়, ঢাকা',
        experience: 18,
        consultationFee: 1500,
        bio: 'এশিয়া হার্ট সোসাইটির সদস্য। ইন্টারভেনশনাল কার্ডিওলজিতে বিশেষ প্রশিক্ষণপ্রাপ্ত।',
      },
      {
        email: 'dr.nusrat@doctor360.online',
        name: 'ডা. নুসরাত জাহান',
        specialization: 'শিশু রোগ বিশেষজ্ঞ',
        education: 'স্যার সলিমুল্লা মেডিকেল কলেজ, ঢাকা',
        experience: 8,
        consultationFee: 700,
        bio: 'শিশুদের স্বাস্থ্য সেবায় নিবেদিত।',
      },
    ]
    
    for (const doc of defaultDoctors) {
      doctorPromises.push(
        prisma.user.create({
          data: {
            email: doc.email,
            password: hashedPassword,
            name: doc.name,
            role: 'DOCTOR',
            emailVerified: new Date(),
            image: '/template_photoframe.png',
            doctorProfile: {
              create: {
                phone: `+880-1${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)}-${Math.floor(100000 + Math.random() * 900000)}`,
                specialization: doc.specialization,
                licenseNumber: `BMC-2018-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`,
                education: doc.education,
                experience: doc.experience,
                consultationFee: doc.consultationFee,
                bio: doc.bio,
                availableDays: JSON.stringify(['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার']),
                availableHours: JSON.stringify({ start: '০৯:০০', end: '১৭:০০' }),
                isVerified: true,
                isAvailable: true,
              },
            },
          },
          include: { doctorProfile: true },
        }) as Promise<DoctorWithProfile>
      )
    }
  }

  const doctors = await Promise.all(doctorPromises) as DoctorWithProfile[]
  console.log(`✅ ${doctors.length} জন ডাক্তার তৈরি হয়েছে`)

  // Create Patient Users
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
            phone: '+880-1711-111111',
            dateOfBirth: new Date('1985-05-15'),
            gender: 'পুরুষ',
            bloodType: 'B+',
            address: 'ঢাকা, বাংলাদেশ',
            emergencyContact: '+880-1711-222222',
            medicalHistory: JSON.stringify({ allergies: ['পেনিসিলিন'], conditions: ['ডায়াবেটিস'] }),
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'karim@doctor360.online',
        password: hashedPassword,
        name: 'করিম উদ্দিন',
        role: 'PATIENT',
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        patientProfile: {
          create: {
            phone: '+880-1812-222222',
            dateOfBirth: new Date('1990-08-20'),
            gender: 'পুরুষ',
            bloodType: 'O+',
            address: 'চট্টগ্রাম, বাংলাদেশ',
            emergencyContact: '+880-1812-333333',
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'salma@doctor360.online',
        password: hashedPassword,
        name: 'সালমা বেগম',
        role: 'PATIENT',
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
        patientProfile: {
          create: {
            phone: '+880-1913-333333',
            dateOfBirth: new Date('1995-03-10'),
            gender: 'মহিলা',
            bloodType: 'A+',
            address: 'সিলেট, বাংলাদেশ',
            emergencyContact: '+880-1913-444444',
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'jamal@doctor360.online',
        password: hashedPassword,
        name: 'জামাল হোসেন',
        role: 'PATIENT',
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
        patientProfile: {
          create: {
            phone: '+880-1614-444444',
            dateOfBirth: new Date('1988-11-25'),
            gender: 'পুরুষ',
            bloodType: 'AB+',
            address: 'রাজশাহী, বাংলাদেশ',
            emergencyContact: '+880-1614-555555',
          },
        },
      },
      include: { patientProfile: true },
    }),
    prisma.user.create({
      data: {
        email: 'nasreen@doctor360.online',
        password: hashedPassword,
        name: 'নাসরিন আক্তার',
        role: 'PATIENT',
        emailVerified: new Date(),
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
        patientProfile: {
          create: {
            phone: '+880-1515-555555',
            dateOfBirth: new Date('1992-07-08'),
            gender: 'মহিলা',
            bloodType: 'B-',
            address: 'খুলনা, বাংলাদেশ',
            emergencyContact: '+880-1515-666666',
          },
        },
      },
      include: { patientProfile: true },
    }),
  ])

  // Create Appointments
  console.log('📅 অ্যাপয়েন্টমেন্ট তৈরি হচ্ছে...')
  
  // Get first doctor with valid profile
  const firstDoctor = doctors.find(d => d.doctorProfile)
  const secondDoctor = doctors.find((d, i) => i > 0 && d.doctorProfile)
  const thirdDoctor = doctors.find((d, i) => i > 1 && d.doctorProfile)
  
  if (!firstDoctor?.doctorProfile) {
    console.log('⚠️ No valid doctor found, skipping appointments')
    return
  }
  
  const appointments = await Promise.all([
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        doctorId: firstDoctor.doctorProfile.id,
        date: new Date(Date.now() + 86400000), // Tomorrow
        duration: 30,
        type: 'IN_PERSON',
        status: 'CONFIRMED',
        reason: 'সাধারণ চেকআপ',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        doctorId: secondDoctor?.doctorProfile?.id || firstDoctor.doctorProfile.id,
        date: new Date(Date.now() + 172800000), // Day after tomorrow
        duration: 30,
        type: 'VIDEO_CONSULTATION',
        status: 'PENDING_PAYMENT',
        reason: 'হার্টের সমস্যা',
      },
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[2].id,
        doctorId: thirdDoctor?.doctorProfile?.id || firstDoctor.doctorProfile.id,
        date: new Date(Date.now() + 259200000), // 3 days from now
        duration: 30,
        type: 'IN_PERSON',
        status: 'CONFIRMED',
        reason: 'শিশুর টিকাদান',
      },
    }),
  ])

  // Create Audit Logs
  console.log('📝 অডিট লগ তৈরি হচ্ছে...')
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: admin.id,
        details: JSON.stringify({ ip: '127.0.0.1', userAgent: 'Chrome/120.0' }),
      },
      {
        userId: firstDoctor.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: firstDoctor.id,
        details: JSON.stringify({ ip: '127.0.0.1', userAgent: 'Firefox/121.0' }),
      },
    ],
  })

  console.log('✅ সীড সফলভাবে সম্পন্ন হয়েছে!')

  console.log('\n📋 ডেমো ক্রেডেনশিয়াল:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('অ্যাডমিন:   admin@doctor360.online / admin123')
  console.log(`ডাক্তার:    ${firstDoctor.email} / admin123`)
  console.log(`রোগী:      ${patients[0].email} / admin123`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ সীড ত্রুটি:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })