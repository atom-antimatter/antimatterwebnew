/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'
import '@payloadcms/next/css'

export const metadata: Metadata = {
  title: 'Antimatter AI CMS',
  description: 'Content Management System',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

