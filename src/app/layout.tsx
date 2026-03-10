import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doctor360 - বাংলাদেশের সেরা অনলাইন স্বাস্থ্যসেবা প্ল্যাটফর্ম",
  description: "বাংলাদেশের শীর্ষস্থানীয় ডাক্তারদের সাথে সংযুক্ত হন। অ্যাপয়েন্টমেন্ট বুক করুন, মেডিকেল রেকর্ড অ্যাক্সেস করুন, প্রেসক্রিপশন পরিচালনা করুন এবং ভিডিও কনসাল্টেশন করুন।",
  keywords: ["Doctor360", "স্বাস্থ্যসেবা", "টেলিমেডিসিন", "মেডিকেল রেকর্ড", "অ্যাপয়েন্টমেন্ট", "ভিডিও কনসাল্টেশন", "অনলাইন ডাক্তার", "বাংলাদেশ", "হিন্দ শিলিগুড়ি", "বাংলা ফন্ট"],
  authors: [{ name: "Doctor360 Team" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Doctor360 - স্বাস্থ্যসেবা আপনার হাতের মুঠোয়",
    description: "বিশ্বস্ত স্বাস্থ্যসেবা, আপনার কাছে। যেকোনো সময় যেকোনো স্থান থেকে ডাক্তার দেখান।",
    url: "https://doctor360.com.bd",
    siteName: "Doctor360",
    type: "website",
    locale: "bn_BD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        {/* Primary Bengali font: Hind Siliguri for proper Bengali rendering */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Fallback fonts for better rendering */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'Geist', sans-serif" }}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
