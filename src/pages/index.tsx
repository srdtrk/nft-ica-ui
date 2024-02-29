import NftIcaContextProvider, { useNftIcaStore } from '@/context/NftIcaContextProvider'
import NftCard from '@/components/NftCard'
import MintingList from '@/components/MintingList'
import { useSecretjsContextStore } from '@/context/SecretjsContext'
import { useEffect } from 'react'
import { useNavbarContext } from '@/context/NavbarContext'
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
  const { secretAddress } = useSecretjsContextStore()

  const { hideBackButton } = useNavbarContext()
  useEffect(() => {
    hideBackButton()
  }, [])

  const handleMintNft = (): void => {
    void mint()
  }

  if (secretAddress === '') {
    return (
      <div className="flex justify-center items-center h-96">
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
    <div className="relative p-6 pb-20">
      {/* Added pb-20 to give space for the fixed bar */}
      {userNfts === null ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : userNfts.length === 0 ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">You do not have any Interchain Account NFTs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {userNfts.map((info, index) => (
            <NftCard key={index} id={info.nft_id} icaAddress={info.ica_address} />
          ))}
        </div>
      )}
      {userWaitingNftIds.length > 0 && <MintingList mintingNfts={userWaitingNftIds.map((nft) => nft.token_id)} />}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md justify-center flex">
        <button
          onClick={handleMintNft}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Mint an Interchain Account NFT
        </button>
      </div>
    </div>
  )
}

export default NftsPage
