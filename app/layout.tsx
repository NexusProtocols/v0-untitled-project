import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/components/auth-provider"
import { BanNotification } from "@/components/ban-notification"
import CookieConsent from "@/components/cookie-consent"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NEXUS",
  description: "Roblox Cheating Platform!",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check if the current path is a gateway path
  const isGatewayPath = typeof window !== "undefined" ? window.location.pathname.startsWith("/gateway/") : false

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#050505] text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              {/* Header is not rendered on gateway pages */}
              {!isGatewayPath && <Header />}
              <BanNotification />
              <main className="flex-1">{children}</main>
              {/* Footer is not rendered on gateway pages */}
              {!isGatewayPath && <Footer />}
            </div>
            <CookieConsent />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
