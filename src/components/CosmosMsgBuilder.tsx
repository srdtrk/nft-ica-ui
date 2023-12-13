import type { Coin, CosmosMsgForEmpty, VoteOption } from '@/contracts/NftIcaCoordinator.types'
import React, { useState } from 'react'
import Dropdown from './DrowdownMenu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { defaultNewMsg } from './IcaTxBuilder'
import AmountSelector, { defaultNewAmount } from './AmountSelector'

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

const defaultSendMsg: CosmosMsgForEmpty = { bank: { send: { amount: [], to_address: '' } } }
const defaultDelegateMsg: CosmosMsgForEmpty = {
  staking: { delegate: { amount: { denom: '', amount: '' }, validator: '' } },
}
const defaultUndelegateMsg: CosmosMsgForEmpty = {
  staking: { undelegate: { amount: { denom: '', amount: '' }, validator: '' } },
}

export function CosmosMsgBuilder({ index, setCosmosMsg, deleteCosmosMsg }: CosmosMsgBuilderProps): JSX.Element {
  const [state, setState] = useState(initialState)

  const messageTypes: MessageType[] = Object.values(MessageType)

  const handleMessageTypeChange = (messageType: string): void => {
    switch (messageType) {
      case MessageType.Vote:
        setMsg(defaultNewMsg)
        break
      case MessageType.Send:
        setMsg(defaultSendMsg)
        break
      case MessageType.Delegate:
        setMsg(defaultDelegateMsg)
        break
      case MessageType.Undelegate:
        setMsg(defaultUndelegateMsg)
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
      case MessageType.Send:
        return <SendMsgBuilder setMsg={setMsg} />
      case MessageType.Delegate:
        return <DelegateMsgBuilder setMsg={setMsg} />
      case MessageType.Undelegate:
        return <UndelegateMsgBuilder setMsg={setMsg} />
      default:
        return null
    }
  }

  return (
    <div className="bg-gray-100 relative p-4 border border-gray-300 rounded">
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
          className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm bg-gray-50"
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

interface SendMsgBuilderProps {
  setMsg: (message: CosmosMsgForEmpty) => void
}

const SendMsgBuilder = ({ setMsg }: SendMsgBuilderProps): JSX.Element => {
  const [amounts, setAmounts] = useState<Coin[]>([])
  const [toAddress, setToAddress] = useState<string>('')

  const addAmount = (): void => {
    setAmounts([...amounts, defaultNewAmount])
  }

  const deleteAmount = (index: number): void => {
    const newAmounts = amounts.filter((_, i) => i !== index)
    setAmounts(newAmounts)
  }

  const setAmount = (index: number, amount: Coin): void => {
    const newAmounts = [...amounts]
    newAmounts[index] = amount
    setAmounts(newAmounts)
    setMsg({ bank: { send: { amount: newAmounts, to_address: toAddress } } })
  }

  const handleToAddressChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setToAddress(event.target.value)
    setMsg({ bank: { send: { amount: amounts, to_address: event.target.value } } })
  }

  return (
    <div className="p-4 border border-gray-300 rounded">
      {amounts.map((_, index) => (
        <AmountSelector key={index} index={index} setAmount={setAmount} onDelete={deleteAmount} />
      ))}
      <button onClick={addAmount} className="mt-2 p-2 bg-blue-500 text-white rounded">
        Add Amount
      </button>

      <div className="mt-4">
        <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700">
          To Address
        </label>
        <input
          type="text"
          id="toAddress"
          value={toAddress}
          onChange={handleToAddressChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm bg-gray-50"
        />
      </div>
    </div>
  )
}

interface DelegateMsgBuilderProps {
  setMsg: (message: CosmosMsgForEmpty) => void
}

const DelegateMsgBuilder = ({ setMsg }: DelegateMsgBuilderProps): JSX.Element => {
  const [amount, setAmount] = useState<Coin>({ denom: '', amount: '' })
  const [validator, setValidator] = useState<string>('')

  const handleAmountChange = (_: number, newAmount: Coin): void => {
    setAmount(newAmount)
    setMsg({ staking: { delegate: { amount: newAmount, validator } } })
  }

  const handleValidatorChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValidator = event.target.value
    setValidator(newValidator)
    setMsg({ staking: { delegate: { amount, validator: newValidator } } })
  }

  return (
    <div className="p-4 border border-gray-300 rounded">
      <AmountSelector
        index={0}
        setAmount={handleAmountChange}
        onDelete={() => {}} // No delete functionality needed here
      />
      <div className="mt-4">
        <label htmlFor="validator" className="block text-sm font-medium text-gray-700">
          Validator
        </label>
        <input
          type="text"
          id="validator"
          value={validator}
          onChange={handleValidatorChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm bg-gray-50"
        />
      </div>
    </div>
  )
}

interface UndelegateMsgBuilderProps {
  setMsg: (message: CosmosMsgForEmpty) => void
}

const UndelegateMsgBuilder = ({ setMsg }: UndelegateMsgBuilderProps): JSX.Element => {
  const [amount, setAmount] = useState<Coin>({ denom: '', amount: '' })
  const [validator, setValidator] = useState<string>('')

  const handleAmountChange = (_: number, newAmount: Coin): void => {
    setAmount(newAmount)
    setMsg({ staking: { undelegate: { amount: newAmount, validator } } })
  }

  const handleValidatorChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValidator = event.target.value
    setValidator(newValidator)
    setMsg({ staking: { undelegate: { amount, validator: newValidator } } })
  }

  return (
    <div className="p-4 border border-gray-300 rounded">
      <AmountSelector
        index={0}
        setAmount={handleAmountChange}
        onDelete={() => {}} // No delete functionality needed here
      />
      <div className="mt-4">
        <label htmlFor="validator" className="block text-sm font-medium text-gray-700">
          Validator
        </label>
        <input
          type="text"
          id="validator"
          value={validator}
          onChange={handleValidatorChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm bg-gray-50"
        />
      </div>
    </div>
  )
}
