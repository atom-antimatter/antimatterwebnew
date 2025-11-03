/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { segments: string[] }
type Search = { [key: string]: string | string[] }
type Props = { params: Promise<Params>; searchParams: Promise<Search> }

export const generateMetadata = ({ params, searchParams }: Props): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

export default async function Page({ params, searchParams }: Props) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams])
  return RootPage({ config, params: resolvedParams, searchParams: resolvedSearchParams, importMap })
}




