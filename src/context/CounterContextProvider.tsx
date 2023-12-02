import { COUNTER_CONTRACT_ADDRESS } from '@/services/constants'
import { chainGrpcWasmApi, msgBroadcastClient } from '@/services/services'
// import { getAddresses } from '@/services/wallet'
import {
  MsgExecuteContractCompat,
  // fromBase64,
  // getInjectiveAddress,
  toBase64
} from '@injectivelabs/sdk-ts'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWalletStore } from './WalletContextProvider'

enum Status {
  Idle = 'idle',
  Loading = 'loading',
}

interface StoreState {
  count: number
  isLoading: boolean
  incrementCount: () => Promise<void>
  setContractCounter: (number: string) => Promise<void>
}

const CounterContext = createContext<StoreState>({
  count: 0,
  isLoading: true,
  incrementCount: async () => {},
  setContractCounter: async (_number) => {}
})

export const useCounterStore = (): StoreState => useContext(CounterContext)

interface Props {
  children?: React.ReactNode
}

const CounterContextProvider = (props: Props): JSX.Element => {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState<Status>(Status.Idle)
  const isLoading = status === Status.Loading
  const { injectiveAddress } = useWalletStore()

  useEffect(() => {
    void fetchCount()
  }, [])

  async function fetchCount (): Promise<void> {
    try {
      const response = (await chainGrpcWasmApi.fetchSmartContractState(
        COUNTER_CONTRACT_ADDRESS,
        toBase64({ get_count: {} })
      )) as { data: Uint8Array }

      const { count } = JSON.parse(new TextDecoder('utf-8').decode(response.data)) as { count: number }
      setCount(count)
    } catch (e) {
      alert(e)
    }
  }

  async function incrementCount (): Promise<void> {
    if (injectiveAddress === '') {
      alert('No Wallet Connected')
      return
    }

    setStatus(Status.Loading)

    try {
      const msg = MsgExecuteContractCompat.fromJSON({
        contractAddress: COUNTER_CONTRACT_ADDRESS,
        sender: injectiveAddress,
        msg: {
          increment: {}
        }
      })

      await msgBroadcastClient.broadcast({
        msgs: msg,
        injectiveAddress
      })
      void fetchCount()
    } catch (e) {
      alert(e)
    } finally {
      setStatus(Status.Idle)
    }
  }

  async function setContractCounter (number: string): Promise<void> {
    if (injectiveAddress === '') {
      alert('No Wallet Connected')
      return
    }

    if (Number(number) > 100 || Number(number) < -100) {
      alert('Number must we within -100 and 100')
      return
    }

    setStatus(Status.Loading)

    try {
      const msg = MsgExecuteContractCompat.fromJSON({
        contractAddress: COUNTER_CONTRACT_ADDRESS,
        sender: injectiveAddress,
        msg: {
          reset: {
            count: parseInt(number, 10)
          }
        }
      })

      await msgBroadcastClient.broadcast({
        msgs: msg,
        injectiveAddress
      })

      void fetchCount()
    } catch (e) {
      alert(e)
    } finally {
      setStatus(Status.Idle)
    }
  }

  return (
    <CounterContext.Provider
      value={{
        count,
        isLoading,
        incrementCount,
        setContractCounter
      }}
    >
      {props.children}
    </CounterContext.Provider>
  )
}

export default CounterContextProvider
