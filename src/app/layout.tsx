import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Intervo — AI-Powered Voice Mock Interview Platform",
  description: "Experience realistic, adaptive voice-based mock interviews that simulate real-world hiring assessments.",
  keywords: ["AI interview", "mock interview", "voice mock interview", "interview prep", "SaaS"],
  authors: [{ name: "Intervo Team" }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <TooltipProvider>
          {children}
          <Toaster closeButton theme="dark" position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  )
}
