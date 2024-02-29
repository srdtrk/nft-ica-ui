import { useSecretjsContextStore } from '@/context/SecretjsContext'
import React from 'react'

// interface Props {}

const ConnectWallet = (): JSX.Element => {
  const { connectWallet, secretAddress } = useSecretjsContextStore()

  const handleConnectWallet = (): void => {
    void connectWallet()
  }

  const btnText = secretAddress !== '' ? `${secretAddress.slice(0, 5)}...${secretAddress.slice(-3)}` : 'Connect Wallet'
  return (
    <button onClick={handleConnectWallet} className="btn">
      {btnText}
    </button>
  )
}

export default ConnectWallet
