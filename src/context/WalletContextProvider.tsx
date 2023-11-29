import { getAddresses } from '@/services/wallet'
import { getInjectiveAddress } from '@injectivelabs/sdk-ts'
import React, { createContext, useContext, useState } from 'react'

interface StoreState {
  injectiveAddress: string
  ethereumAddress: string
  connectWallet: () => Promise<void>
}

const WalletContext = createContext<StoreState>({
  ethereumAddress: '',
  injectiveAddress: '',
  connectWallet: async () => {}
})

export const useWalletStore = (): StoreState => useContext(WalletContext)

interface Props {
  children?: React.ReactNode
}

const WalletContextProvider = (props: Props): JSX.Element => {
  const [ethereumAddress, setEthereumAddress] = useState('')
  const [injectiveAddress, setInjectiveAddress] = useState('')

  async function connectWallet (): Promise<void> {
    const [address] = await getAddresses()
    setEthereumAddress(address)
    setInjectiveAddress(getInjectiveAddress(address))
  }

  return (
    <WalletContext.Provider
      value={{
        ethereumAddress,
        injectiveAddress,
        connectWallet
      }}
    >
      {props.children}
    </WalletContext.Provider>
  )
}

export default WalletContextProvider
