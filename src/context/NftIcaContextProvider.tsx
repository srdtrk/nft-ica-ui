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
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useWalletStore } from './WalletContextProvider'
import type { QueryMsg as Cw721QueryMsg, TokensResponse } from '@/contracts/Cw721IcaExtension.types'
import type { ExecuteMsg as CoordinatorExecuteMsg } from '@/contracts/NftIcaCoordinator.types'

const NFT_ICA_CONTRACT_ADDRESS = 'inj1vtjjg7z2t5wspsa445w68xlf430eusw7ncyg3r'
const CW721_CONTRACT_ADDRESS = 'inj12xkc2ga54a6x02cdn0r5z8eyymy32fq330u788'

enum Status {
  Idle = 'idle',
  Loading = 'loading',
}

interface StoreState {
  userNftIds: string[]
  mint: (salt: string) => Promise<TxResponse | undefined>
  executeIcaMsg: (tokenId: string, msg: IcaExecuteMsg) => Promise<TxResponse | undefined>
  isLoading: boolean
}

const NftIcaContext = createContext<StoreState>({
  userNftIds: [],
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

export const useContractStore = (): StoreState => useContext(NftIcaContext)

interface Props {
  children?: React.ReactNode
}

const NftIcaContextProvider = (props: Props): JSX.Element => {
  const [userNftIds, setUserNftIds] = useState<string[]>([])
  const [status, setStatus] = useState<Status>(Status.Idle)
  const isLoading = status === Status.Loading
  const { injectiveAddress } = useWalletStore()

  useEffect(() => {
    void fetchNftIds()
  }, [])

  async function mint(salt: string | null): Promise<TxResponse | undefined> {
    const msg: CoordinatorExecuteMsg = {
      mint_ica: {
        salt,
      },
    }

    return await executeContract(NFT_ICA_CONTRACT_ADDRESS, msg)
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
    const msg: Cw721QueryMsg = {
      tokens: {
        owner: injectiveAddress,
      },
    }

    const response = await queryContract<TokensResponse>(CW721_CONTRACT_ADDRESS, msg)
    if (response !== undefined) {
      setUserNftIds(response.tokens)
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
        userNftIds,
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
