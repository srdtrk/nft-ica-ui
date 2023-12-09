import NftIcaContextProvider, { useNftIcaStore } from '@/context/NftIcaContextProvider'
// import React, { useEffect, useState } from 'react'

function NftsPage(): JSX.Element {
  return (
    <NftIcaContextProvider>
      <Nfts />
    </NftIcaContextProvider>
  )
}

function Nfts(): JSX.Element {
  const { userNftIds, mint } = useNftIcaStore()

  const handleMintNft = (): void => {
    // Implement the logic to mint NFT
    void mint('')
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Your NFTs</h2>
        <ul className="mb-6">
          {userNftIds.map((id, index) => (
            <li key={index} className="border-b py-2">
              NFT ID: {id}
            </li>
          ))}
        </ul>
        <button
          onClick={handleMintNft}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Mint NFT
        </button>
      </div>
    </div>
  )
}

export default NftsPage
