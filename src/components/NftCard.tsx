import React from 'react'
import { toSvg } from 'jdenticon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'

interface NftCardProps {
  id: string
  icaAddress: string
}

const NftCard: React.FC<NftCardProps> = ({ id, icaAddress }) => {
  const router = useRouter()
  const svgString = toSvg(icaAddress, 100) // Generate SVG string

  const handleClick = (): void => {
    void router.push(`nfts/${id}?icaAddress=${encodeURIComponent(icaAddress)}`)
  }

  // Handle "Enter" key to make it accessible via keyboard
  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      handleClick()
    }
  }

  return (
    <div
      className="max-w-sm rounded overflow-hidden shadow-lg bg-white hover:bg-gray-100 relative"
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      role="button" // Role added for accessibility
      tabIndex={0} // Makes the div focusable
      aria-label={`NFT Card for ${id}`} // Aria-label for screen readers
    >
      <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-bl-lg">
        cosmoshub-testnet
      </div>

      <div className="w-full" dangerouslySetInnerHTML={{ __html: svgString }} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">NFT ID: {id}</div>
        <p className="text-gray-700 text-base">ICA Address:</p>
        <p className="text-gray-700 text-sm break-words">
          {icaAddress}
          <a
            href={`https://www.mintscan.io/cosmoshub-testnet/address/${icaAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-2" />
          </a>
        </p>
      </div>
    </div>
  )
}

export default NftCard
