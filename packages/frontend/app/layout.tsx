import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AssistantProvider } from "@/components/assistant-ui/assistant-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "AI Agent",
  description: "AI Assistant",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AssistantProvider>
          {children}
        </AssistantProvider>
      </body>
    </html>
  )
}
