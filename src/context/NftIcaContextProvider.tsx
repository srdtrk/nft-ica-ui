import type { ExecuteMsg as IcaExecuteMsg } from '@/contracts/CwIcaController.types'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useSecretjsContextStore } from '@/context/SecretjsContext'
import type {
  QueryMsg as Snip721QueryMsg,
  ExecuteMsg as Snip721ExecuteMsg,
  QueryAnswer,
} from '@/contracts/Snip721.types'
import type {
  ArrayOfQueueItem,
  ChannelState,
  ExecuteMsg as CoordinatorExecuteMsg,
  QueryMsg as CoordinatorQueryMsg,
  GetIcaAddressesResponse,
  GetTransactionHistoryResponse,
  NftIcaPair,
  QueueItem,
} from '@/contracts/NftIcaCoordinator.types'
import type { TxResponse } from 'secretjs'

const NFT_ICA_CONTRACT_ADDRESS = 'secret1m4c74ptw6k3tz5mp7k3jpqkgdcsg3k6ztcll3j'
const NFT_ICA_CODE_HASH = '18033e8600ee524198184d8b8ffaa43dd23582a723b95ff545726af2f178c69a'
const SNIP721_CONTRACT_ADDRESS = 'secret1e62wz6q0ku9yg4q8e5gpwc2mt9tf4vzsdvms97'
const SNIP721_CODE_HASH = '773c39a4b75d87c4d04b6cfe16d32cd5136271447e231b342f7467177c363ca8'

enum Status {
  Idle = 'idle',
  Loading = 'loading',
}

interface StoreState {
  userNfts: NftIcaPair[] | null
  userWaitingNftIds: QueueItem[]
  mint: () => Promise<TxResponse | undefined>
  executeIcaMsg: (tokenId: string, msg: IcaExecuteMsg) => Promise<TxResponse | undefined>
  transferNft: (tokenId: string, recepient: string) => Promise<TxResponse | undefined>
  getTxHistory: (
    tokenId: string,
    page?: number,
    pageSize?: number,
  ) => Promise<GetTransactionHistoryResponse | undefined>
  getChannelState: (tokenId: string) => Promise<ChannelState | undefined>
  isLoading: boolean
}

const NftIcaContext = createContext<StoreState>({
  userNfts: null,
  userWaitingNftIds: [],
  mint: async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as TxResponse
  },
  executeIcaMsg: async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as TxResponse
  },
  transferNft: async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as TxResponse
  },
  getTxHistory: async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as GetTransactionHistoryResponse
  },
  getChannelState: async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as ChannelState
  },
  isLoading: false,
})

export const useNftIcaStore = (): StoreState => useContext(NftIcaContext)

interface Props {
  children?: React.ReactNode
}

const NftIcaContextProvider = (props: Props): JSX.Element => {
  const [userNfts, setUserNfts] = useState<NftIcaPair[] | null>(null)
  const [userWaitingNftIds, setUserWaitingNftIds] = useState<QueueItem[]>([])
  const waitlistIntervalIdRef = useRef<number | null>(null)
  const [status, setStatus] = useState<Status>(Status.Idle)
  const isLoading = status === Status.Loading
  const { secretjs, secretAddress } = useSecretjsContextStore()

  useEffect(() => {
    if (secretAddress !== '') {
      void fetchNftIds().then(fetchWaitingNftIds)
    }
  }, [secretAddress])

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

    const resp = await executeContract(NFT_ICA_CONTRACT_ADDRESS, NFT_ICA_CODE_HASH, msg)
    void fetchWaitingNftIds()
    return resp
  }

  async function getTxHistory(
    tokenId: string,
    page?: number,
    pageSize?: number,
  ): Promise<GetTransactionHistoryResponse | undefined> {
    const msg: CoordinatorQueryMsg = {
      get_transaction_history: {
        token_id: tokenId,
        page,
        page_size: pageSize,
      },
    }

    return await queryContract<CoordinatorQueryMsg, GetTransactionHistoryResponse>(
      NFT_ICA_CONTRACT_ADDRESS,
      NFT_ICA_CODE_HASH,
      msg,
    )
  }

  async function getChannelState(tokenId: string): Promise<ChannelState | undefined> {
    const msg: CoordinatorQueryMsg = {
      get_channel_state: {
        token_id: tokenId,
      },
    }

    return await queryContract<CoordinatorQueryMsg, ChannelState>(NFT_ICA_CONTRACT_ADDRESS, NFT_ICA_CODE_HASH, msg)
  }

  async function executeIcaMsg(tokenId: string, msg: IcaExecuteMsg): Promise<TxResponse | undefined> {
    const executeMsg: CoordinatorExecuteMsg = {
      execute_ica_msg: {
        token_id: tokenId,
        msg,
      },
    }

    return await executeContract(NFT_ICA_CONTRACT_ADDRESS, NFT_ICA_CODE_HASH, executeMsg)
  }

  async function transferNft(tokenId: string, recipient: string): Promise<TxResponse | undefined> {
    const executeMsg: Snip721ExecuteMsg = {
      transfer_nft: {
        recipient,
        token_id: tokenId,
      },
    }

    return await executeContract(SNIP721_CONTRACT_ADDRESS, SNIP721_CODE_HASH, executeMsg)
  }

  async function fetchNftIds(): Promise<void> {
    if (secretAddress === '') {
      stopInterval()
      alert('No Wallet Connected')
      return
    }

    const msg: Snip721QueryMsg = {
      tokens: {
        owner: secretAddress,
      },
    }

    const response = await queryContract<Snip721QueryMsg, QueryAnswer>(SNIP721_CONTRACT_ADDRESS, SNIP721_CODE_HASH, msg)

    interface TokenListVariant {
      token_list: {
        tokens: string[]
        [k: string]: unknown
      }
    }

    // Type guard function
    function isTokenListVariant(queryAnswer: QueryAnswer): queryAnswer is TokenListVariant {
      // Check if the 'token_list' property exists and is an object
      return (
        typeof queryAnswer === 'object' &&
        queryAnswer !== null &&
        'token_list' in queryAnswer &&
        // Further validate that 'tokens' is an array
        Array.isArray((queryAnswer as TokenListVariant).token_list.tokens)
      )
    }

    if (response !== undefined) {
      if (!isTokenListVariant(response)) {
        alert('Error fetching NFTs')
        return
      }
      const msg: CoordinatorQueryMsg = {
        get_ica_addresses: {
          token_ids: response.token_list.tokens,
        },
      }

      const resp = await queryContract<CoordinatorQueryMsg, GetIcaAddressesResponse>(
        NFT_ICA_CONTRACT_ADDRESS,
        NFT_ICA_CODE_HASH,
        msg,
      )
      if (resp !== undefined) {
        setUserNfts(resp?.pairs)
      }
    }
  }

  async function fetchWaitingNftIds(): Promise<void> {
    if (secretAddress === '') {
      stopInterval()
      alert('No Wallet Connected')
      return
    }

    const msg: CoordinatorQueryMsg = {
      get_mint_queue: {},
    }

    let response = await queryContract<CoordinatorQueryMsg, ArrayOfQueueItem>(
      NFT_ICA_CONTRACT_ADDRESS,
      NFT_ICA_CODE_HASH,
      msg,
    )
    if (response !== undefined) {
      response = response?.filter((item) => item.owner === secretAddress)
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
      waitlistIntervalIdRef.current = intervalId
    }
  }

  function stopInterval(): void {
    if (waitlistIntervalIdRef.current !== null) {
      clearInterval(waitlistIntervalIdRef.current)
      waitlistIntervalIdRef.current = null
    }
  }

  async function queryContract<T extends object, R>(
    contractAddress: string,
    codeHash: string,
    msg: T,
  ): Promise<R | undefined> {
    setStatus(Status.Loading)
    try {
      const response = await secretjs?.query.compute.queryContract<T, R>({
        contract_address: contractAddress,
        code_hash: codeHash,
        query: msg,
      })

      return response
    } catch (e) {
      alert(e)
    } finally {
      setStatus(Status.Idle)
    }
  }

  async function executeContract<T extends object>(
    contractAddress: string,
    codeHash: string,
    msg: T,
    gasLimit?: number,
  ): Promise<TxResponse | undefined> {
    if (secretAddress === '') {
      alert('No Wallet Connected')
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {} as TxResponse
    }

    setStatus(Status.Loading)

    gasLimit = gasLimit ?? 500_000

    try {
      const resp = await secretjs?.tx.compute.executeContract(
        {
          sender: secretAddress,
          contract_address: contractAddress,
          code_hash: codeHash,
          sent_funds: [],
          msg,
        },
        {
          gasLimit,
        },
      )

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
        transferNft,
        getTxHistory,
        getChannelState,
        isLoading,
      }}
    >
      {props.children}
    </NftIcaContext.Provider>
  )
}

export default NftIcaContextProvider
