import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { toSvg } from 'jdenticon'
import NftIcaContextProvider, { useNftIcaStore } from '@/context/NftIcaContextProvider'
import type { CosmosMsgForEmpty, ExecuteMsg1 as IcaExecuteMsg } from '@/contracts/NftIcaCoordinator.types'
import type { TxResponse } from '@injectivelabs/sdk-ts'
import IcaTxBuilder from '@/components/IcaTxBuilder'
import TransactionHistory from '@/components/TransactionHistory'

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

  const { executeIcaMsg } = useNftIcaStore()

  // Check if tokenId and icaAddress are valid strings
  if (typeof tokenId !== 'string' || typeof icaAddress !== 'string') {
    return <div>Invalid URL</div>
  }

  // Function to navigate back to the NFTs list
  const goBack = (): void => {
    void router.push('/')
  }

  const broadcastIcaTx = async (messages: CosmosMsgForEmpty[]): Promise<TxResponse | undefined> => {
    const execMsg: IcaExecuteMsg = {
      send_cosmos_msgs: {
        messages,
      },
    }

    const resp = await executeIcaMsg(tokenId, execMsg)

    setRefreshTxHistory(!refreshTxHistory)

    return resp
  }

  return (
    <div>
      {/* Navigation Bar */}
      <div className="bg-gray-100 p-4 shadow-md flex items-center">
        <button onClick={goBack} className="text-gray-600 hover:text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faArrowLeft} />
          <span className="ml-2">Back</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-wrap p-4">
        {/* Left Section: NFT Details */}
        <div className="basis-1/2">
          <TokenCard tokenId={tokenId} icaAddress={icaAddress} />
          <TransactionHistory tokenId={tokenId} refreshTrigger={refreshTxHistory} className="mt-5 w-5/6" />
        </div>

        {/* Right Section: Placeholder for Interchain Transaction Component */}
        <div className="basis-1/2">
          <h2 className="text-3xl font-bold">Interchain Transaction Builder</h2>
          <IcaTxBuilder broadcastTx={broadcastIcaTx} />
          {/* This section will be used for the interchain transaction component in the future */}
        </div>
      </div>
    </div>
  )
}

interface TokenCardProps {
  tokenId: string
  icaAddress: string
}

const TokenCard = ({ tokenId, icaAddress }: TokenCardProps): JSX.Element => {
  // Generate SVG string
  const svgString = toSvg(icaAddress, 140)

  return (
    <div className="flex-1 flex">
      <div className="flex bg-gray-50 p-4 rounded">
        <div className="flex-none" dangerouslySetInnerHTML={{ __html: svgString }} />
        <div className="mt-2">
          <h2 className="text-3xl font-bold">
            Token ID: <span className="text-2xl">{tokenId}</span>{' '}
          </h2>
          <p className="text-xl font-bold"> ICA Address:</p>
          <p className="text-lg">{icaAddress}</p>
          <a
            href={`https://www.mintscan.io/cosmoshub-testnet/address/${icaAddress}`}
            className="text-blue-500 font-bold text-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Mintscan
          </a>
        </div>
      </div>
    </div>
  )
}

export default NftDetailPage
