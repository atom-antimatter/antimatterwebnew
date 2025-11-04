'use client'

import React, { createContext, useContext } from 'react'
import type { Config } from 'payload'

const ConfigContext = createContext<{ config: Config } | undefined>(undefined)

export const usePayloadConfig = () => {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('usePayloadConfig must be used within ConfigProvider')
  return ctx
}

export function ConfigProvider({
  config,
  children,
}: {
  config: Config
  children: React.ReactNode
}) {
  return <ConfigContext.Provider value={{ config }}>{children}</ConfigContext.Provider>
}

