import React from 'react'
import { toSvg } from 'jdenticon'

interface NftCardProps {
  id: string
  icaAddress: string
}

const NftCard: React.FC<NftCardProps> = ({ id, icaAddress }) => {
  const svgString = toSvg(icaAddress, 100) // Generate SVG string

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
      <div className="w-full" dangerouslySetInnerHTML={{ __html: svgString }} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">NFT ID: {id}</div>
        <p className="text-gray-700 text-base">ICA Address: {icaAddress}</p>
      </div>
    </div>
  )
}

export default NftCard
