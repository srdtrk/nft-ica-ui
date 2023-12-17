import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { toSvg } from 'jdenticon'
import NftIcaContextProvider, { useNftIcaStore } from '@/context/NftIcaContextProvider'
import type { ChannelState, CosmosMsgForEmpty, ExecuteMsg1 as IcaExecuteMsg } from '@/contracts/NftIcaCoordinator.types'
import type { TxResponse } from '@injectivelabs/sdk-ts'
import IcaTxBuilder from '@/components/IcaTxBuilder'
import TransactionHistory from '@/components/TransactionHistory'
import { useNavbarContext } from '@/context/NavbarContext'

function NftDetailPage(): JSX.Element {
  return (
    <NftIcaContextProvider>
      <NftDetail />
    </NftIcaContextProvider>
  )
}

const NftDetail = (): JSX.Element => {
  const router = useRouter()
  const { tokenId, icaAddress } = router.query

  const [refreshTxHistory, setRefreshTxHistory] = useState(false)
  const [refreshChannelState, setRefreshChannelState] = useState(false)

  const { provideBackButton } = useNavbarContext()

  // Function to navigate back to the NFTs list
  const goBack = (): void => {
    void router.push('/')
  }

  useEffect(() => {
    provideBackButton(goBack)
  }, [])

  const { executeIcaMsg, transferNft } = useNftIcaStore()

  // Check if tokenId and icaAddress are valid strings
  if (typeof tokenId !== 'string' || typeof icaAddress !== 'string') {
    return <div>Invalid URL</div>
  }

  const handleTransferNft = async (tokenId: string, recipient: string): Promise<TxResponse | undefined> => {
    const resp = await transferNft(tokenId, recipient)

    if (resp !== undefined) {
      goBack()
    }

    return resp
  }

  const handleTimeoutCallback = (): void => {
    setRefreshChannelState(!refreshChannelState)
  }

  const broadcastIcaTx = async (
    messages: CosmosMsgForEmpty[],
    timeoutSeconds?: number,
    packetMemo?: string,
  ): Promise<TxResponse | undefined> => {
    const execMsg: IcaExecuteMsg = {
      send_cosmos_msgs: {
        messages,
        timeout_seconds: timeoutSeconds,
        packet_memo: packetMemo,
      },
    }

    const resp = await executeIcaMsg(tokenId, execMsg)

    setRefreshTxHistory(!refreshTxHistory)

    return resp
  }

  return (
    <div>
      {/* Main Content */}
      <div className="flex flex-wrap p-4">
        {/* Left Section: NFT Details */}
        <div className="basis-1/2">
          <TokenCard tokenId={tokenId} icaAddress={icaAddress} transferNft={handleTransferNft} callback={() => {}} />
          <ChannelStateBar tokenId={tokenId} />
          <TransactionHistory
            tokenId={tokenId}
            timeoutCallback={handleTimeoutCallback}
            refreshTrigger={refreshTxHistory}
            className="mt-5 w-5/6"
          />
        </div>

        {/* Right Section: Placeholder for Interchain Transaction Component */}
        <div className="basis-1/2">
          <IcaTxBuilder broadcastTx={broadcastIcaTx} />
          {/* This section will be used for the interchain transaction component in the future */}
        </div>
      </div>
    </div>
  )
}

interface TokenCardProps {
  tokenId: string
  transferNft: (tokenId: string, recipient: string) => Promise<TxResponse | undefined>
  callback: () => void
  icaAddress: string
}

const TokenCard = ({ tokenId, icaAddress, transferNft, callback }: TokenCardProps): JSX.Element => {
  // Generate SVG string
  const svgString = toSvg(icaAddress, 140)

  callback()

  return (
    <div className="flex-1 flex">
      <div className="flex bg-gray-50 p-4 rounded relative">
        <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-2sm px-2 py-1 rounded-bl-lg">
          cosmoshub-testnet
        </div>

        <div className="flex-none" dangerouslySetInnerHTML={{ __html: svgString }} />
        <div className="mt-2">
          <h2 className="text-2xl font-bold">
            Token ID: <span className="text-xl">{tokenId}</span>{' '}
          </h2>
          <p className="text-lg font-bold mt-2"> ICA Address:</p>
          <p className="text-2sm">{icaAddress}</p>
          <a
            href={`https://www.mintscan.io/cosmoshub-testnet/address/${icaAddress}`}
            className="text-blue-500 font-bold text-lg mt-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Mintscan
          </a>
          <TransferNft tokenId={tokenId} transferNft={transferNft} className="flex-none mt-5" />
        </div>
      </div>
    </div>
  )
}

interface TransferNftProps {
  tokenId: string
  transferNft: (tokenId: string, recipient: string) => Promise<TxResponse | undefined>
  className?: string
}

const TransferNft = ({ tokenId, transferNft, className }: TransferNftProps): JSX.Element => {
  const [recipient, setRecipient] = useState('')

  const handleTransfer = (): void => {
    if (recipient !== '') {
      void transferNft(tokenId, recipient).then(() => {
        setRecipient('')
      }, alert)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center">
        <input
          type="text"
          value={recipient}
          onChange={(e) => {
            setRecipient(e.target.value)
          }}
          placeholder="Recipient Address"
          className="p-2 w-96 border border-gray-300 rounded mr-2"
        />
        <button
          onClick={handleTransfer}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Transfer NFT
        </button>
      </div>
    </div>
  )
}

interface ChannelStateBarProps {
  tokenId: string
  refreshTrigger?: boolean
}

const ChannelStateBar = ({ tokenId, refreshTrigger }: ChannelStateBarProps): JSX.Element => {
  const [channelState, setChannelState] = useState<ChannelState | undefined>(undefined)
  const pendingIntervalIdRef = useRef<number | null>(null)

  const { getChannelState, executeIcaMsg } = useNftIcaStore()

  useEffect(fetchChannelState, [tokenId, refreshTrigger])

  const handleReopenChannel = (): void => {
    const execMsg: IcaExecuteMsg = {
      create_channel: {},
    }

    void executeIcaMsg(tokenId, execMsg).then(fetchChannelState, alert)
  }

  if (channelState === undefined) {
    return <div></div>
  }

  function startInterval(): void {
    if (pendingIntervalIdRef.current === null) {
      const intervalId = setInterval(fetchChannelState, 5000) as unknown as number
      pendingIntervalIdRef.current = intervalId
    }
  }

  function stopInterval(): void {
    if (pendingIntervalIdRef.current !== null) {
      clearInterval(pendingIntervalIdRef.current)
      pendingIntervalIdRef.current = null
    }
  }

  function fetchChannelState(): void {
    void getChannelState(tokenId).then((resp) => {
      setChannelState(resp)
      if (resp === undefined) {
        stopInterval()
      } else if (resp.status === 'open') {
        stopInterval()
      } else if (resp.status === 'pending') {
        startInterval()
      } else {
        stopInterval()
      }
    })
  }

  const channelStatus = channelState?.status

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open':
        return 'text-green-500'
      case 'closed':
        return 'text-red-500'
      case 'pending':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusDotColor = (status: string): string => {
    switch (status) {
      case 'open':
        return 'bg-green-500'
      case 'closed':
        return 'bg-red-500'
      case 'pending':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-3">Channel Status</h2>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg max-w-screen-sm">
        <div>
          <span className={`inline-block mr-2 ${getStatusDotColor(channelStatus)} h-2 w-2 rounded-full`}></span>
          <p className="inline-block">{channelStatus !== 'pending' ? channelState.channel_id : ''}</p>
        </div>
        <div className="flex text-sm">
          {channelStatus === 'pending' && (
            <div className="animate-spin rounded-full w-4 border-b-2 border-gray-900 mr-4"></div>
          )}
          <span className={`font-bold text-lg ${getStatusColor(channelStatus)}`}>
            {channelStatus.charAt(0).toUpperCase() + channelStatus.slice(1)}
          </span>
        </div>
        <button
          onClick={handleReopenChannel}
          className={`py-1 px-4 rounded ${
            channelStatus === 'open'
              ? 'bg-gray-300 cursor-not-allowed text-gray-400'
              : 'bg-blue-500 hover:bg-blue-700 text-white'
          }`}
          disabled={channelStatus === 'open'}
        >
          Reopen Channel
        </button>
      </div>
    </div>
  )
}

export default NftDetailPage
