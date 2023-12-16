import React, { useEffect, useState } from 'react'
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

  // Add a new message on component mount
  useEffect(() => {
    addNewMessage()
  }, [])

  const handleBroadcast = (): void => {
    if (messages.length === 0) {
      alert('No messages to broadcast')
      return
    }
    void broadcastTx(messages).then(() => {
      setMessages([])
    }, alert)
  }

  return (
    <div className="bg-gray-50 p-4 shadow rounded-lg">
      <h2 className="text-3xl font-bold mb-4">Atomic Interchain Transaction Builder</h2>

      {/* Scrollable Container for Messages */}
      <div className="overflow-auto mb-4 border border-gray-300 rounded bg-zinc-200" style={{ height: '75vh' }}>
        {messages.length > 0 ? (
          messages.map((_, index) => (
            <div key={index} className="p-2 pr-3 pl-3 rounded">
              <CosmosMsgBuilder index={index} setCosmosMsg={updateMessage} deleteCosmosMsg={deleteMessage} />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No messages added.</p>
        )}
      </div>

      <div className="flex justify-start">
        <button onClick={addNewMessage} className="p-2 bg-blue-500 text-white rounded mr-4">
          Add Msg
        </button>

        <button onClick={handleBroadcast} className="p-2 bg-green-500 text-white rounded">
          Broadcast
        </button>
      </div>
    </div>
  )
}

export default IcaTxBuilder
