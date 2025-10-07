import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClarityLab Portal - Modern Diagnostics Solutions',
  description: 'Investor-ready diagnostics/LIMS web app for labs that need a modern website with secure client portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
