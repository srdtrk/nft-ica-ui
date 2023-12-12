import React from 'react'
import ConnectWallet from './ConnectWallet'
import { useRouter } from 'next/router'

const Navbar = (): JSX.Element => {
  const router = useRouter()

  const navigateTo = (path: string): void => {
    void router.push(path)
  }

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto flex justify-between items-center p-2">
        <div>
          <button
            onClick={() => {
              navigateTo('/')
            }}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mx-1"
          >
            NFT ICA App
          </button>
          <button
            onClick={() => {
              navigateTo('/Console')
            }}
            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded mx-1"
          >
            Console
          </button>
        </div>
        <ConnectWallet />
      </div>
    </div>
  )
}

export default Navbar
