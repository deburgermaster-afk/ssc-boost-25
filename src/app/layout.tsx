import type { Metadata, Viewport } from "next"
import { Hind_Siliguri } from "next/font/google"
import "./globals.css"

const hind = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "বাংলা ১ম পত্র — SSC 2025 MCQ",
  description: "SSC বাংলা ১ম পত্র: ৫০০ গুরুত্বপূর্ণ MCQ ও জ্ঞানমূলক-অনুধাবনমূলক প্রশ্ন",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body className={`${hind.variable} antialiased`}>{children}</body>
    </html>
  )
}
