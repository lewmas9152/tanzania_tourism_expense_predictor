import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tanzania Tourism Cost Estimator',
  description: 'ML-powered prediction of your Tanzania travel expenditure',
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
