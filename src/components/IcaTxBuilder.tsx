import React, { useEffect, useState } from 'react'
import { CosmosMsgBuilder } from './CosmosMsgBuilder' // Adjust the import path as needed
import type { CosmosMsgForEmpty } from '@/contracts/NftIcaCoordinator.types'
import type { TxResponse } from 'secretjs'

interface IcaTxBuilderProps {
  broadcastTx: (
    msgs: CosmosMsgForEmpty[],
    timeoutSeconds?: number,
    packetMemo?: string,
  ) => Promise<TxResponse | undefined>
}

export const defaultNewMsg: CosmosMsgForEmpty = { gov: { vote: { proposal_id: 1, vote: 'yes' } } }

const IcaTxBuilder = ({ broadcastTx }: IcaTxBuilderProps): JSX.Element => {
  const [messages, setMessages] = useState<CosmosMsgForEmpty[]>([])
  const [memo, setMemo] = useState<string>('')
  const [timeout, setTimeout] = useState<string>('')

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

  const handleTimeoutChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newTimeout = e.target.value
    if (newTimeout === '' || parseInt(newTimeout) >= 0) {
      setTimeout(newTimeout)
    }
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
    const timeoutSeconds = timeout === '' ? undefined : parseInt(timeout)
    void broadcastTx(messages, timeoutSeconds, memo).then(() => {
      setMessages([])
    }, alert)
  }

  return (
    <div className="bg-gray-50 p-4 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Atomic Interchain Transaction Builder</h2>

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

      <div className="flex justify-between mt-4">
        <button onClick={addNewMessage} className="p-2 bg-blue-500 text-white rounded mr-4 hover:bg-blue-600">
          Add Msg
        </button>

        <button
          onClick={handleBroadcast}
          className={`p-2 rounded mr-4 ${
            messages.length > 0
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 cursor-not-allowed text-gray-400'
          }`}
        >
          Broadcast
        </button>

        <input
          type="text"
          value={memo}
          onChange={(e) => {
            setMemo(e.target.value)
          }}
          placeholder="Memo"
          className="p-2 border border-gray-300 rounded mr-4 w-1/3"
        />

        <input
          type="text"
          value={timeout}
          onChange={handleTimeoutChange}
          placeholder="Optional Timeout (seconds)"
          className="p-2 border border-gray-300 rounded mr-4 w-1/3"
        />
      </div>
    </div>
  )
}

export default IcaTxBuilder
