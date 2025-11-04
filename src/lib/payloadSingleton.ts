import { getPayload as getPayloadImport, Payload } from 'payload'
import config from '@payload-config'

let cachedPayload: Payload | null = null

export const getPayloadClient = async (): Promise<Payload> => {
  if (cachedPayload) {
    return cachedPayload
  }

  cachedPayload = await getPayloadImport({ config })
  return cachedPayload
}

