import React from 'react'

interface MintingListProps {
  mintingNfts: string[] // Assuming this is an array of NFT IDs
}

const MintingList: React.FC<MintingListProps> = ({ mintingNfts }) => {
  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg p-4 rounded-lg max-w-xs">
      <h4 className="font-bold text-lg mb-3">Minting NFTs...</h4>
      {mintingNfts.map((id, index) => (
        <div key={index} className="bg-gray-50 p-3 rounded-lg shadow mb-2 hover:bg-gray-100">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <div className="flex-1">
              <p className="text-sm">
                Creating ICA for <p className="inline font-bold">{id} </p>
              </p>
            </div>
          </div>
        </div>
      ))}
      <div className="text-xs text-gray-600 mt-2">
        <p>This process can take a few minutes.</p>
      </div>
    </div>
  )
}

export default MintingList
