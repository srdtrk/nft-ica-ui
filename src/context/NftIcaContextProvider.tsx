import { chainGrpcWasmApi, msgBroadcastClient } from '@/services/services'
import type { ExecuteMsg as IcaExecuteMsg } from '@/contracts/CwIcaController.types'
// import { getAddresses } from '@/services/wallet'
import {
  MsgExecuteContractCompat,
  type TxResponse,
  // fromBase64,
  // getInjectiveAddress,
  toBase64,
} from '@injectivelabs/sdk-ts'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useWalletStore } from './WalletContextProvider'
import type { QueryMsg as Cw721QueryMsg, TokensResponse } from '@/contracts/Cw721IcaExtension.types'
import type {
  ArrayOfQueueItem,
  ExecuteMsg as CoordinatorExecuteMsg,
  QueryMsg as CoordinatorQueryMsg,
  GetIcaAddressesResponse,
  NftIcaPair,
  QueueItem,
} from '@/contracts/NftIcaCoordinator.types'

// const NFT_ICA_CONTRACT_ADDRESS = 'inj10qs4c3qz4skqj2cj8t8qnkdgeut0r6ue5wfkjp'
// const CW721_CONTRACT_ADDRESS = 'inj1zv7v087ueyslm856vmcds9zpydutwhz50sllhn'
const NFT_ICA_CONTRACT_ADDRESS = 'inj1t6kw77tc5vagcyatl0gd02veqae9ydeaq0s0qm'
const CW721_CONTRACT_ADDRESS = 'inj1t5vs28cd3e5r0flwd3d8hlj7ypkk8x0rjajt6q'

enum Status {
  Idle = 'idle',
  Loading = 'loading',
}

interface StoreState {
  userNfts: NftIcaPair[]
  userWaitingNftIds: QueueItem[]
  mint: () => Promise<TxResponse | undefined>
  executeIcaMsg: (tokenId: string, msg: IcaExecuteMsg) => Promise<TxResponse | undefined>
  isLoading: boolean
}

const NftIcaContext = createContext<StoreState>({
  userNfts: [],
  userWaitingNftIds: [],
  mint: async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as TxResponse
  },
  executeIcaMsg: async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as TxResponse
  },
  isLoading: false,
})

export const useNftIcaStore = (): StoreState => useContext(NftIcaContext)

interface Props {
  children?: React.ReactNode
}

const NftIcaContextProvider = (props: Props): JSX.Element => {
  const [userNfts, setUserNfts] = useState<NftIcaPair[]>([])
  const [userWaitingNftIds, setUserWaitingNftIds] = useState<QueueItem[]>([])
  const waitlistIntervalIdRef = useRef<number | null>(null)
  const [status, setStatus] = useState<Status>(Status.Idle)
  const isLoading = status === Status.Loading
  const { injectiveAddress } = useWalletStore()

  useEffect(() => {
    if (injectiveAddress !== '') {
      void fetchNftIds().then(fetchWaitingNftIds)
    }
  }, [injectiveAddress])

  async function mint(): Promise<TxResponse | undefined> {
    // Generate a number between 1000000000000000 and 9999999999999999
    const randomNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000)
    // Salt matters for instantiate2 to generate a unique contract address, but this is not supported in injective yet
    // so the salt will be ignored by the contract. We can still provide it for future compatibility.
    const msg: CoordinatorExecuteMsg = {
      mint_ica: {
        salt: randomNumber.toString(),
      },
    }

    const resp = await executeContract(NFT_ICA_CONTRACT_ADDRESS, msg)
    void fetchWaitingNftIds()
    return resp
  }

  async function executeIcaMsg(tokenId: string, msg: IcaExecuteMsg): Promise<TxResponse | undefined> {
    const executeMsg = {
      execute_ica_msg: {
        token_id: tokenId,
        msg,
      },
    }

    return await executeContract(NFT_ICA_CONTRACT_ADDRESS, executeMsg)
  }

  async function fetchNftIds(): Promise<void> {
    if (injectiveAddress === '') {
      stopInterval()
      console.log('fetchNftIds: No Wallet Connected')
      alert('No Wallet Connected')
      return
    }

    const msg: Cw721QueryMsg = {
      tokens: {
        owner: injectiveAddress,
      },
    }

    const response = await queryContract<TokensResponse>(CW721_CONTRACT_ADDRESS, msg)
    if (response !== undefined) {
      const msg: CoordinatorQueryMsg = {
        get_ica_addresses: {
          token_ids: response.tokens,
        },
      }

      const resp = await queryContract<GetIcaAddressesResponse>(NFT_ICA_CONTRACT_ADDRESS, msg)
      if (resp !== undefined) {
        setUserNfts(resp?.pairs)
      }
    }
  }

  async function fetchWaitingNftIds(): Promise<void> {
    if (injectiveAddress === '') {
      stopInterval()
      alert('No Wallet Connected')
      return
    }

    const msg: CoordinatorQueryMsg = {
      get_mint_queue: {},
    }

    let response = await queryContract<ArrayOfQueueItem>(NFT_ICA_CONTRACT_ADDRESS, msg)
    if (response !== undefined) {
      response = response?.filter((item) => item.owner === injectiveAddress)
      if (response !== userWaitingNftIds) {
        void fetchNftIds()
      }
      setUserWaitingNftIds(response)
      if (response.length === 0) {
        stopInterval()
      } else {
        startInterval()
      }
    }
  }

  function startInterval(): void {
    if (waitlistIntervalIdRef.current === null) {
      const intervalId = setInterval(() => {
        void fetchWaitingNftIds()
      }, 5000) as unknown as number
      console.log('startInterval: ', intervalId)
      waitlistIntervalIdRef.current = intervalId
    }
  }

  function stopInterval(): void {
    if (waitlistIntervalIdRef.current !== null) {
      clearInterval(waitlistIntervalIdRef.current)
      console.log('stopInterval: ', waitlistIntervalIdRef.current)
      waitlistIntervalIdRef.current = null
    }
  }

  async function queryContract<T>(contractAddress: string, msg: Record<string, any>): Promise<T | undefined> {
    setStatus(Status.Loading)
    try {
      const response = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64(msg))

      // return Buffer.from(response.data).toString('utf8')
      return JSON.parse(Buffer.from(response.data).toString('utf8')) as T
    } catch (e) {
      alert(e)
    } finally {
      setStatus(Status.Idle)
    }
  }

  async function executeContract(contractAddress: string, msg: Record<string, any>): Promise<TxResponse | undefined> {
    if (injectiveAddress === '') {
      alert('No Wallet Connected')
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {} as TxResponse
    }

    setStatus(Status.Loading)

    try {
      const execMsg = MsgExecuteContractCompat.fromJSON({
        contractAddress,
        sender: injectiveAddress,
        msg,
      })

      const resp = await msgBroadcastClient.broadcast({
        msgs: execMsg,
        injectiveAddress,
      })

      return resp
    } catch (e) {
      alert(e)
    } finally {
      setStatus(Status.Idle)
    }
  }

  return (
    <NftIcaContext.Provider
      value={{
        userNfts,
        userWaitingNftIds,
        mint,
        executeIcaMsg,
        isLoading,
      }}
    >
      {props.children}
    </NftIcaContext.Provider>
  )
}

export default NftIcaContextProvider
