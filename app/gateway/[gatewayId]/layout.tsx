import type { ReactNode } from "react"

interface GatewayLayoutProps {
  children: ReactNode
}

export default function GatewayLayout({ children }: GatewayLayoutProps) {
  return (
    <div className="gateway-page">
      {/* No header or footer in gateway pages */}
      {children}
    </div>
  )
}
