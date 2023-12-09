import { useRouter } from 'next/router'
import React from 'react'

const NftDetailPage = (): JSX.Element => {
  const router = useRouter()
  const { tokenId } = router.query

  return (
    <div>
      <h1>NFT Detail Page</h1>
      <p>Token ID: {tokenId}</p>
      {/* More details about the NFT can be added here */}
    </div>
  )
}

export default NftDetailPage
