import React, { useState } from 'react'
import { CosmosMsgBuilder } from './CosmosMsgBuilder' // Adjust the import path as needed
import type { CosmosMsgForEmpty } from '@/contracts/NftIcaCoordinator.types'
import type { TxResponse } from '@injectivelabs/sdk-ts'

interface IcaTxBuilderProps {
  broadcastTx: (msgs: CosmosMsgForEmpty[]) => Promise<TxResponse | undefined>
}

export const defaultNewMsg: CosmosMsgForEmpty = { gov: { vote: { proposal_id: 1, vote: 'yes' } } }

const IcaTxBuilder = ({ broadcastTx }: IcaTxBuilderProps): JSX.Element => {
  const [messages, setMessages] = useState<CosmosMsgForEmpty[]>([])

  const addNewMessage = (): void => {
    setMessages([...messages, defaultNewMsg]) // Add a new empty message object
  }

  const updateMessage = (index: number, updatedMessage: CosmosMsgForEmpty): void => {
    const newMessages = [...messages]
    newMessages[index] = updatedMessage
    setMessages(newMessages)
  }

  const deleteMessage = (index: number): void => {
    const newMessages = messages.filter((_, msgIndex) => msgIndex !== index)
    setMessages(newMessages)
  }

  const handleBroadcast = (): void => {
    void broadcastTx(messages).then(() => {
      setMessages([])
    })
  }

  return (
    <div>
      {/* Render each CosmosMsgBuilder */}
      {messages.map((_, index) => (
        <CosmosMsgBuilder key={index} index={index} setCosmosMsg={updateMessage} deleteCosmosMsg={deleteMessage} />
      ))}

      <button onClick={addNewMessage} className="mt-4 p-2 bg-blue-500 text-white rounded mr-4">
        Add Msg
      </button>

      <button onClick={handleBroadcast} className="mt-4 p-2 bg-green-500 text-white rounded">
        Broadcast
      </button>
    </div>
  )
}

export default IcaTxBuilder
