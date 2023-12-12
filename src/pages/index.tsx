import NftIcaContextProvider, { useNftIcaStore } from '@/context/NftIcaContextProvider'
import NftCard from '@/components/NftCard'
import MintingList from '@/components/MintingList'
import { useWalletStore } from '@/context/WalletContextProvider'
// import React, { useEffect, useState } from 'react'

function NftsPage(): JSX.Element {
  return (
    <NftIcaContextProvider>
      <Nfts />
    </NftIcaContextProvider>
  )
}

function Nfts(): JSX.Element {
  const { userNfts, userWaitingNftIds, mint } = useNftIcaStore()
  const { injectiveAddress } = useWalletStore()

  const handleMintNft = (): void => {
    void mint()
  }

  if (injectiveAddress === '') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
          <div>
            <div className="text-xl font-medium text-black">Wallet Connection Needed</div>
            <p className="text-gray-500">Please connect your wallet to proceed.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {userWaitingNftIds.length > 0 && <MintingList mintingNfts={userWaitingNftIds.map((nft) => nft.token_id)} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {userNfts.map((info, index) => (
          <NftCard key={index} id={info.nft_id} icaAddress={info.ica_address} /> // Update the image URL path as needed
        ))}
      </div>
      <button onClick={handleMintNft} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Mint NFT
      </button>
    </div>
  )
}

export default NftsPage
