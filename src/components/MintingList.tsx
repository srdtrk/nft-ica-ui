import React from 'react'

interface MintingListProps {
  mintingNfts: string[] // Assuming this is an array of NFT IDs
}

const MintingList: React.FC<MintingListProps> = ({ mintingNfts }) => {
  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg p-4 rounded-lg">
      <h4 className="font-bold text-lg">Minting NFTs...</h4>
      {mintingNfts.map((id, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span>Creating ICA for {id}</span>
        </div>
      ))}
    </div>
  )
}

export default MintingList
