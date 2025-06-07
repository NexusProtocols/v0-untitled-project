import type React from "react"
import ClientLayout from "./ClientLayout"

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
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'