import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import React, { useState } from 'react'
import type { Coin } from '@/contracts/NftIcaCoordinator.types'

export const defaultNewAmount: Coin = { denom: '', amount: '' }

interface AmountSelectorProps {
  index: number
  setAmount: (index: number, amount: Coin) => void
  onDelete: (index: number) => void
}

const AmountSelector = ({ index, setAmount, onDelete }: AmountSelectorProps): JSX.Element => {
  const [coin, setCoin] = useState<Coin>(defaultNewAmount)

  const handleAmountChange = (amount: string): void => {
    if (isNaN(Number(amount))) return

    const newCoin = { ...coin, amount }
    setCoin(newCoin)
    setAmount(index, newCoin)
  }

  const handleDenomChange = (denom: string): void => {
    console.log(denom)
    const newCoin = { ...coin, denom }
    setCoin(newCoin)
    setAmount(index, newCoin)
  }

  const deleteAmount = (): void => {
    onDelete(index)
  }

  return (
    <div className="flex items-center mb-2">
      <input
        type="text"
        value={coin.amount}
        className="p-2 border border-gray-300 rounded mr-2 bg-gray-50"
        placeholder="Amount"
        onChange={(e) => {
          handleAmountChange(e.target.value)
        }}
      />
      <input
        type="text"
        value={coin.denom}
        className="p-2 border border-gray-300 rounded mr-2 bg-gray-50"
        placeholder="Denom"
        onChange={(e) => {
          handleDenomChange(e.target.value)
        }}
      />
      <button onClick={deleteAmount} className="p-1 text-red-500">
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  )
}

export default AmountSelector
