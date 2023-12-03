import { chainGrpcWasmApi, msgBroadcastClient } from '@/services/services'
// import { getAddresses } from '@/services/wallet'
import {
  MsgExecuteContractCompat,
  MsgInstantiateContract,
  MsgStoreCode,
  type TxResponse,
  // fromBase64,
  // getInjectiveAddress,
  toBase64,
} from '@injectivelabs/sdk-ts'
import React, { createContext, useContext, useState } from 'react'
import { useWalletStore } from './WalletContextProvider'

enum Status {
  Idle = 'idle',
  Loading = 'loading',
}

interface StoreState {
  wasmFile: Uint8Array | null
  setWasmFile: (file: Uint8Array | null) => void
  codeId: number | null
  setCodeId: (codeId: number | null) => void
  contractAddress: string
  setContractAddress: (contractAddress: string) => void
  isLoading: boolean
  uploadCode: () => Promise<TxResponse | undefined>
  instantiateContract: (msg: JSON) => Promise<TxResponse | undefined>
  executeContract: (msg: JSON) => Promise<TxResponse | undefined>
  /**
   * @returns base64 encoded bytes encoded by the contract
   */
  queryContract: (msg: JSON) => Promise<string | undefined>
}

const ContractContext = createContext<StoreState>({
  wasmFile: null,
  setWasmFile: () => {},
  codeId: null,
  setCodeId: () => {},
  contractAddress: '',
  setContractAddress: () => {},
  isLoading: false,
  uploadCode: async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as TxResponse
  },
  instantiateContract: async (_msg) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as TxResponse
  },
  executeContract: async (_msg) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {} as TxResponse
  },
  queryContract: async (_msg) => {
    return ''
  },
})

export const useContractStore = (): StoreState => useContext(ContractContext)

interface Props {
  children?: React.ReactNode
}

const ContractContextProvider = (props: Props): JSX.Element => {
  const [wasmFile, setWasmFile] = useState<Uint8Array | null>(null)
  const [codeId, setCodeId] = useState<number | null>(null)
  const [contractAddress, setContractAddress] = useState('')
  const [status, setStatus] = useState<Status>(Status.Idle)
  const isLoading = status === Status.Loading
  const { injectiveAddress } = useWalletStore()

  async function queryContract(msg: JSON): Promise<string | undefined> {
    setStatus(Status.Loading)
    try {
      const response = await chainGrpcWasmApi.fetchSmartContractState(contractAddress, toBase64(msg))

      return toBase64(response.data)
    } catch (e) {
      alert(e)
    } finally {
      setStatus(Status.Idle)
    }
  }

  async function uploadCode(): Promise<TxResponse | undefined> {
    if (injectiveAddress === '') {
      alert('No Wallet Connected')
      return
    }

    if (wasmFile === null) {
      alert('No wasm file selected')
      return
    }

    setStatus(Status.Loading)

    try {
      console.log('uploadCode')
      const execMsg = MsgStoreCode.fromJSON({
        sender: injectiveAddress,
        wasmBytes: wasmFile,
      })

      const resp = await msgBroadcastClient.broadcast({
        msgs: execMsg,
        injectiveAddress,
      })

      console.log('uploadCode2')
      setWasmFile(null)

      return resp
    } catch (e) {
      alert(e)
    } finally {
      setStatus(Status.Idle)
    }
  }

  async function executeContract(msg: JSON): Promise<TxResponse | undefined> {
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

  async function instantiateContract(msg: JSON): Promise<TxResponse | undefined> {
    if (injectiveAddress === '') {
      alert('No Wallet Connected')
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {} as TxResponse
    }

    if (codeId === null) {
      alert('No Code ID selected')
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {} as TxResponse
    }

    setStatus(Status.Loading)

    try {
      const instantiateMsg = MsgInstantiateContract.fromJSON({
        sender: injectiveAddress,
        admin: '',
        codeId,
        label: '',
        msg,
      })

      const resp = await msgBroadcastClient.broadcast({
        msgs: instantiateMsg,
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
    <ContractContext.Provider
      value={{
        wasmFile,
        setWasmFile,
        codeId,
        setCodeId,
        contractAddress,
        setContractAddress,
        isLoading,
        uploadCode,
        instantiateContract,
        executeContract,
        queryContract,
      }}
    >
      {props.children}
    </ContractContext.Provider>
  )
}

export default ContractContextProvider
