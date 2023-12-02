import CounterContextProvider, { useCounterStore } from '@/context/CounterContextProvider'
import React, { useEffect, useState } from 'react'

function HomePage(): JSX.Element {
  return (
    <CounterContextProvider>
      <Home />
    </CounterContextProvider>
  )
}

function Home(): JSX.Element {
  const [inputCount, setInputCount] = useState('0')
  const { count, isLoading, incrementCount, setContractCounter } = useCounterStore()
  useEffect(() => {
    setInputCount(count.toString())
  }, [count])

  function handleSetCount(): void {
    void setContractCounter(inputCount)
  }

  function handleIncrementCount(): void {
    void incrementCount()
  }

  return (
    <div className="flex justify-center pt-20">
      <div className="bg-white rounded-lg p-5 text-center">
        <div>
          <h1>The Count is</h1>
          <p>{isLoading ? 'loading...' : count}</p>
        </div>
        <div>
          <button onClick={handleIncrementCount} className="btn w-full" disabled={isLoading}>
            +
          </button>
          <div className="py-2 flex gap-2">
            <input
              type="number"
              value={inputCount}
              step={1}
              onChange={(e) => {
                setInputCount(e.target.value)
              }}
              className="border rounded-lg p-2"
            />
            <button onClick={handleSetCount} className="btn" disabled={isLoading}>
              Set Count
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
