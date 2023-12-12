import type { CosmosMsgForEmpty, VoteOption } from '@/contracts/NftIcaCoordinator.types'
import React, { useState } from 'react'
import Dropdown from './DrowdownMenu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { defaultNewMsg } from './IcaTxBuilder'

interface CosmosMsgBuilderProps {
  index: number
  setCosmosMsg: (index: number, message: CosmosMsgForEmpty) => void
  deleteCosmosMsg: (index: number) => void
}

enum MessageType {
  Vote = 'Vote',
  Delegate = 'Delegate',
  Undelegate = 'Undelegate',
  Redelegate = 'Redelegate',
  Send = 'Send',
}

export interface State {
  messageType: MessageType
}

const initialState: State = {
  messageType: MessageType.Vote,
}

export function CosmosMsgBuilder({ index, setCosmosMsg, deleteCosmosMsg }: CosmosMsgBuilderProps): JSX.Element {
  const [state, setState] = useState(initialState)

  const messageTypes: MessageType[] = Object.values(MessageType)

  const handleMessageTypeChange = (messageType: string): void => {
    switch (messageType) {
      case MessageType.Vote:
        setMsg(defaultNewMsg)
        break
      // Add cases for other message types here...
      default:
        break
    }
    setState({ ...state, messageType: messageType as MessageType })
  }

  const deleteMsg = (): void => {
    deleteCosmosMsg(index)
  }

  const setMsg = (message: CosmosMsgForEmpty): void => {
    setCosmosMsg(index, message)
  }

  // Render the appropriate message builder based on the message type
  const renderMessageBuilder = (): JSX.Element | null => {
    switch (state.messageType) {
      case MessageType.Vote:
        return <VoteMsgBuilder setMsg={setMsg} />
      // Add cases for other message types here...
      default:
        return null
    }
  }

  return (
    <div className="relative p-4 border border-gray-300 rounded">
      {/* Close (X) Button */}
      <button
        onClick={deleteMsg}
        className="absolute top-0 right-0 p-2 text-lg font-bold text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>

      <div className="mb-4">
        <label htmlFor="messageType" className="block text-sm font-medium text-gray-700">
          Message Type
        </label>
        <Dropdown options={messageTypes} onSelect={handleMessageTypeChange} />
      </div>

      {renderMessageBuilder()}
    </div>
  )
}

interface BuilderProps {
  setMsg: (message: CosmosMsgForEmpty) => void
}

const VoteMsgBuilder = ({ setMsg }: BuilderProps): JSX.Element => {
  const [proposalId, setProposalId] = useState<number>(1)
  const [vote, setVote] = useState<VoteOption>('yes')

  const handleProposalIdChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const proposalId = parseInt(event.target.value, 10)
    setProposalId(proposalId)
    setMsg({ gov: { vote: { proposal_id: proposalId, vote } } })
  }

  const handleVoteSelect = (selectedVote: string): void => {
    const vote = selectedVote as VoteOption
    setVote(vote)
    setMsg({ gov: { vote: { proposal_id: proposalId, vote } } })
  }

  return (
    <div className="p-4 border border-gray-300 rounded">
      <div className="mb-4">
        <label htmlFor="proposalId" className="block text-sm font-medium text-gray-700">
          Proposal ID
        </label>
        <input
          type="number"
          id="proposalId"
          value={proposalId}
          onChange={handleProposalIdChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="voteOption" className="block text-sm font-medium text-gray-700">
          Vote Option
        </label>
        <Dropdown options={['yes', 'no', 'abstain', 'no_with_veto']} onSelect={handleVoteSelect} />
      </div>
    </div>
  )
}
