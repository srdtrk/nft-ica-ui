import React from 'react'

import Layout from '@/components/Layout'
import { SecretjsContextProvider } from '@/context/SecretjsContext'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { NavbarProvider } from '@/context/NavbarContext'

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <NavbarProvider>
      <SecretjsContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SecretjsContextProvider>
    </NavbarProvider>
  )
}
