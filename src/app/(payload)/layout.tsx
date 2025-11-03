/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'
import '@payloadcms/next/css'
import config from '@payload-config'
import { Providers } from '@payloadcms/next/providers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Antimatter AI CMS',
  description: 'Content Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers config={config}>{children}</Providers>
      </body>
    </html>
  )
}




