/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { segments: string[] }
type Search = { [key: string]: string | string[] }

export const generateMetadata = async ({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}): Promise<Metadata> => {
  return generatePageMetadata({ config, params, searchParams })
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  return RootPage({ config, params, searchParams, importMap })
}




