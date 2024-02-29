import { createContext, useState } from 'react'
import { SecretNetworkClient } from 'secretjs'

const SECRET_CHAIN_ID = 'pulsar-3'
const SECRET_LCD = 'https://api.pulsar3.scrttestnet.com'

interface StoreState {
  secretjs: SecretNetworkClient | null
  setSecretjs: (secretjs: SecretNetworkClient) => void
  secretAddress: string
  setSecretAddress: (secretAddress: string) => void
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const SecretjsContext = createContext<StoreState>({
  secretjs: null,
  setSecretjs: () => {},
  secretAddress: '',
  setSecretAddress: () => {},
  connectWallet: async () => {},
  disconnectWallet: () => {},
})

interface Props {
  children?: React.ReactNode
}

const SecretjsContextProvider = (props: Props): JSX.Element => {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null)
  const [secretAddress, setSecretAddress] = useState('')

  async function setupKeplr(): Promise<void> {
    const sleep = async (ms: number): Promise<null> => await new Promise((resolve) => setTimeout(resolve, ms))

    while (
      window.keplr === undefined ||
      window.getEnigmaUtils === undefined ||
      window.getOfflineSignerOnlyAmino === undefined
    ) {
      await sleep(50)
    }

    await window.keplr.enable(SECRET_CHAIN_ID)
    window.keplr.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        disableBalanceCheck: true,
      },
    }

    const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(SECRET_CHAIN_ID)
    const accounts = await keplrOfflineSigner.getAccounts()

    const secretAddress = accounts[0].address

    const secretjs = new SecretNetworkClient({
      url: SECRET_LCD,
      chainId: SECRET_CHAIN_ID,
      wallet: keplrOfflineSigner,
      walletAddress: secretAddress,
      encryptionUtils: window.getEnigmaUtils(SECRET_CHAIN_ID),
    })

    setSecretAddress(secretAddress)
    setSecretjs(secretjs)
  }

  async function connectWallet(): Promise<void> {
    try {
      if (window.keplr === undefined) {
        console.log('install keplr!')
      } else {
        await setupKeplr()
        localStorage.setItem('keplrAutoConnect', 'true')
        console.log(secretAddress)
      }
    } catch (error) {
      alert('An error occurred while connecting to the wallet. Please try again.')
    }
  }

  function disconnectWallet(): void {
    // reset secretjs and secretAddress
    setSecretAddress('')
    setSecretjs(null)

    // disable auto connect
    localStorage.setItem('keplrAutoConnect', 'false')

    // console.log for success
    console.log('Wallet disconnected!')
  }

  return (
    <SecretjsContext.Provider
      value={{
        secretjs,
        setSecretjs,
        secretAddress,
        setSecretAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {props.children}
    </SecretjsContext.Provider>
  )
}

export { SecretjsContext, SecretjsContextProvider }
