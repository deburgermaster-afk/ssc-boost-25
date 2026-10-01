import type { Metadata, Viewport } from "next"
import { Hind_Siliguri } from "next/font/google"
import "katex/dist/katex.min.css"
import "./globals.css"

const hind = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "SSC 2025 — বাংলা ১ম পত্র ও সাধারণ গণিত MCQ",
  description: "SSC 2025: বাংলা ১ম পত্র ও সাধারণ গণিতের ৫০০টি করে গুরুত্বপূর্ণ MCQ, সৃজনশীল ও সমাধান",
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
