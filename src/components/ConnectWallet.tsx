import { useWalletStore } from '@/context/WalletContextProvider'
import React from 'react'

// interface Props {}

const ConnectWallet = (): JSX.Element => {
  const { connectWallet, injectiveAddress } = useWalletStore()

  const handleConnectWallet = (): void => {
    void connectWallet()
  }

  const btnText = (injectiveAddress !== '')
    ? `${injectiveAddress.slice(0, 5)}...${injectiveAddress.slice(-3)}`
    : 'Connect Wallet'
  return (
    <button
      onClick={handleConnectWallet}
      className='btn'
    >
      {btnText}
    </button>
  )
}

export default ConnectWallet
