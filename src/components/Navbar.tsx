import React from 'react'
import ConnectWallet from './ConnectWallet'
import { useRouter } from 'next/router'
import { useNavbarContext } from '@/context/NavbarContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const debugMode = false

const Navbar = (): JSX.Element => {
  const router = useRouter()

  const navigateTo = (path: string): void => {
    void router.push(path)
  }

  const { showBackButton, backButtonAction } = useNavbarContext()

  return (
    <div className="bg-gray-100 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-2">
        <div className="flex">
          {showBackButton && (
            <button
              onClick={backButtonAction}
              className="absolute left-5 pt-0.5 text-gray-600 hover:text-gray-800 flex items-center"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span className="ml-2">Back</span>
            </button>
          )}
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
            <h2 className="font-semibold text-lg">Tokenized Interchain Accounts</h2>
          )}
        </div>
        <ConnectWallet />
      </div>
    </div>
  )
}

export default Navbar
