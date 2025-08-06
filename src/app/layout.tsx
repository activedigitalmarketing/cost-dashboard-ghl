import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cost Dashboard GHL',
  description: 'Upload and analyze your cost data with beautiful visualizations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  )
}