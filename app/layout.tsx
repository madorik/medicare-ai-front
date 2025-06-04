import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MediCare AI',
  description: 'Created with 민균',
  generator: 'mgjeong',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
