import NftIcaContextProvider, { useNftIcaStore } from '@/context/NftIcaContextProvider'
import NftCard from '@/components/NftCard'
import MintingList from '@/components/MintingList'
// import React, { useEffect, useState } from 'react'

function NftsPage(): JSX.Element {
  return (
    <NftIcaContextProvider>
      <Nfts />
    </NftIcaContextProvider>
  )
}

function Nfts(): JSX.Element {
  const { userNftIds, userWaitingNftIds, mint } = useNftIcaStore()

  const handleMintNft = (): void => {
    // Implement the logic to mint NFT
    void mint()
  }

  return (
    <div className="p-6">
      {userWaitingNftIds.length > 0 && <MintingList mintingNfts={userWaitingNftIds.map((nft) => nft.token_id)} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {userNftIds.map((id, index) => (
          <NftCard key={index} id={id} icaAddress={id} /> // Update the image URL path as needed
        ))}
      </div>
      <button onClick={handleMintNft} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Mint NFT
      </button>
    </div>
  )
}

export default NftsPage
