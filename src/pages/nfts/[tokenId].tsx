import { useRouter } from 'next/router'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { toSvg } from 'jdenticon'
import NftIcaContextProvider, { useNftIcaStore } from '@/context/NftIcaContextProvider'
import type { CosmosMsgForEmpty, ExecuteMsg1 as IcaExecuteMsg } from '@/contracts/NftIcaCoordinator.types'
import type { TxResponse } from '@injectivelabs/sdk-ts'
import IcaTxBuilder from '@/components/IcaTxBuilder'

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

  const { executeIcaMsg } = useNftIcaStore()

  // Check if tokenId and icaAddress are valid strings
  if (typeof tokenId !== 'string' || typeof icaAddress !== 'string') {
    return <div>Invalid URL</div>
  }

  // Generate SVG string
  const svgString = toSvg(icaAddress, 140)

  // Function to navigate back to the NFTs list
  const goBack = (): void => {
    void router.push('/Nfts')
  }

  const broadcastIcaTx = async (messages: CosmosMsgForEmpty[]): Promise<TxResponse | undefined> => {
    const execMsg: IcaExecuteMsg = {
      send_cosmos_msgs: {
        messages,
      },
    }

    const resp = await executeIcaMsg(tokenId, execMsg)
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
      <div className="flex p-4">
        {/* Left Section: NFT Details */}
        <div className="flex-1 flex">
          <div className="flex-none" dangerouslySetInnerHTML={{ __html: svgString }} />
          <div>
            <h2 className="text-3xl font-bold">{tokenId}</h2>
            <p className="text-lg mt-2">
              <span className="font-bold text-xl">ICA Address:</span> {icaAddress}
            </p>
            <a
              href={`https://www.mintscan.io/cosmoshub-testnet/address/${icaAddress}`}
              className="text-blue-500 font-bold text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Mintscan
            </a>
          </div>
          {/* Additional details can be added here in the future */}
        </div>

        {/* Right Section: Placeholder for Interchain Transaction Component */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold">Interchain Transaction Builder</h2>
          <IcaTxBuilder broadcastTx={broadcastIcaTx} />
          {/* This section will be used for the interchain transaction component in the future */}
        </div>
      </div>
    </div>
  )
}

export default NftDetailPage
