import React from 'react'

import Layout from '@/components/Layout'
import WalletContextProvider from '@/context/WalletContextProvider'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App ({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <WalletContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WalletContextProvider>
  )
}
