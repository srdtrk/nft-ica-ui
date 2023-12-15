import React from 'react'

import Layout from '@/components/Layout'
import WalletContextProvider from '@/context/WalletContextProvider'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { NavbarProvider } from '@/context/NavbarContext'

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <NavbarProvider>
      <WalletContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WalletContextProvider>
    </NavbarProvider>
  )
}
