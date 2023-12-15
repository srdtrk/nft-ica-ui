import React from 'react'
import ConnectWallet from './ConnectWallet'
import { useRouter } from 'next/router'

const debugMode = false

const Navbar = (): JSX.Element => {
  const router = useRouter()

  const navigateTo = (path: string): void => {
    void router.push(path)
  }

  return (
    <div className="bg-gray-100 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-2">
        {debugMode ? (
          <div>
            <button
              onClick={() => {
                navigateTo('/')
              }}
              className="font-bold py-2 px-4 rounded mx-1 border-solid border-2 border-black hover:border-gray-500 hover:bg-gray-200 hover:text-gray-500"
            >
              NFT ICA App
            </button>
            <button
              onClick={() => {
                navigateTo('/Console')
              }}
              className="font-bold py-2 px-4 rounded mx-1 border-solid border-2 border-black hover:border-gray-500 hover:bg-gray-200 hover:text-gray-500"
            >
              Console
            </button>
          </div>
        ) : (
          <h2 className="font-semibold text-lg">Interchain Account NFTs</h2>
        )}
        <ConnectWallet />
      </div>
    </div>
  )
}

export default Navbar
