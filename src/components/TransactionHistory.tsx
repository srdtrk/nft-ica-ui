import React, { useState, useEffect, useRef } from 'react'
import { useNftIcaStore } from '@/context/NftIcaContextProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faTimesCircle,
  faCheckCircle,
  faHourglassEnd,
} from '@fortawesome/free-solid-svg-icons'
import type { TransactionMsgType, TransactionRecord, TransactionStatus } from '@/contracts/NftIcaCoordinator.types'

interface TransactionHistoryProps {
  tokenId: string
  timeoutCallback?: () => void
  refreshTrigger?: boolean
  className?: string
}

const TransactionHistory = ({
  tokenId,
  className,
  refreshTrigger,
  timeoutCallback,
}: TransactionHistoryProps): JSX.Element => {
  const pageSize = 8

  const { getTxHistory } = useNftIcaStore()
  const [currentPage, setCurrentPage] = useState(0)
  const [maxPage, setMaxPage] = useState(0)
  const [transactions, setTransactions] = useState<TransactionRecord[] | null>(null)
  const pendingIntervalIdRef = useRef<number | null>(null)

  useEffect(fetchTxHistory, [tokenId, currentPage, refreshTrigger])

  function fetchTxHistory(): void {
    void getTxHistory(tokenId, currentPage, pageSize).then((response) => {
      if (response !== undefined) {
        setTransactions(response.records)
        const maxPage = Math.ceil(response.total / pageSize) - 1
        setMaxPage(maxPage)

        const isPending = response.records.some((tx) => tx.status === 'pending')
        if (isPending) {
          startInterval()
        } else {
          stopInterval()
        }

        if (response.records.length > 0 && response.records[0].status === 'timeout') {
          if (timeoutCallback !== undefined) {
            timeoutCallback()
          }
        }
      }
    })
  }

  function startInterval(): void {
    if (pendingIntervalIdRef.current === null) {
      const intervalId = setInterval(fetchTxHistory, 5000) as unknown as number
      pendingIntervalIdRef.current = intervalId
    }
  }

  function stopInterval(): void {
    if (pendingIntervalIdRef.current !== null) {
      clearInterval(pendingIntervalIdRef.current)
      pendingIntervalIdRef.current = null
    }
  }

  const goToNextPage = (): void => {
    setCurrentPage(currentPage + 1)
  }
  const goToPreviousPage = (): void => {
    setCurrentPage(currentPage - 1)
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Interchain Transaction History</h2>
      {transactions === null ? (
        <div className="flex justify-center items-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex justify-center items-center">
          <p className="text-gray-500">You have not made any interchain transactions yet.</p>
        </div>
      ) : (
        <div className="my-4">
          {transactions.map((record) => (
            <TransactionRecordCard key={record.block_height} record={record} />
          ))}
        </div>
      )}
      <div className="flex justify-between items-center">
        <button onClick={goToPreviousPage} disabled={currentPage <= 0}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <span>
          Page {currentPage + 1} / {maxPage + 1}
        </span>
        <button onClick={goToNextPage} disabled={currentPage >= maxPage}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  )
}

interface TransactionRecordCardProps {
  record: TransactionRecord
}

const getStatusIcon = (status: TransactionStatus): JSX.Element | null => {
  switch (status) {
    case 'pending':
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
    case 'completed':
      return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
    case 'failed':
      return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
    case 'timeout':
      return <FontAwesomeIcon icon={faHourglassEnd} className="text-red-500" />
    default:
      return null
  }
}

const getMessageType = (msgType: TransactionMsgType): string => {
  switch (msgType) {
    case 'ibc':
      return 'IBC Transfer'
    case 'send':
      return 'Send'
    case 'vote':
      return 'Vote'
    case 'delegate':
      return 'Delegate'
    case 'undelegate':
      return 'Undelegate'
    case 'redelegate':
      return 'Redelegate'
    case 'multi_msg':
      return 'MultiMsg'
    case 'distribution':
      return 'Distribution'
    case 'wasm':
      return 'Wasm'
    case 'custom':
      return 'Custom'
    case 'stargate':
      return 'Stargate'
    case 'empty':
      return 'Empty'
    default:
      return 'Unknown'
  }
}

const TransactionRecordCard = ({ record }: TransactionRecordCardProps): JSX.Element => {
  const timestampInMilliseconds = record.timestamp / 1000000

  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow mb-2">
      <div className="flex items-center w-1/3">
        <div className="w-6 mr-2">{getStatusIcon(record.status)}</div>
        <div className="truncate">{getMessageType(record.msg_type)}</div>
      </div>
      <div className="w-1/3 text-center">Block: {record.block_height}</div>
      <div className="w-1/3 text-right">{new Date(timestampInMilliseconds).toLocaleString()}</div>
    </div>
  )
}

export default TransactionHistory
