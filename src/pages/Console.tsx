import Dropdown from '@/components/DrowdownMenu'
import ContractContextProvider, { useContractStore } from '@/context/ContractContextProvider'
import React, { useState } from 'react'

enum ConsoleOptions {
  StoreCode = 'StoreCode',
  Instantiate = 'Instantiate',
  Execute = 'Execute',
  Query = 'Query',
}

const options = [ConsoleOptions.StoreCode, ConsoleOptions.Instantiate, ConsoleOptions.Execute, ConsoleOptions.Query]

interface State {
  inputValue: string
  selectedOption: ConsoleOptions
}

const initialState: State = {
  inputValue: '',
  selectedOption: ConsoleOptions.StoreCode,
}

const ConsolePage = (): JSX.Element => {
  return (
    <ContractContextProvider>
      <Console />
    </ContractContextProvider>
  )
}

const Console = (): JSX.Element => {
  const [state, setState] = useState<State>(initialState)
  const [outputValue, setOutputValue] = useState('')
  const {
    wasmFile,
    setWasmFile,
    codeId,
    setCodeId,
    contractAddress,
    setContractAddress,
    isLoading,
    uploadCode,
    instantiateContract,
    executeContract,
    queryContract,
  } = useContractStore()

  const handleSelectOption = (value: string): void => {
    setState((prevState) => ({
      ...prevState,
      selectedOption: value as ConsoleOptions,
    }))
  }
  const handleInputValueChange = (value: string): void => {
    setState((prevState) => ({
      ...prevState,
      inputValue: value,
    }))
  }
  const handleContractOrCodeIdChange = (value: string): void => {
    if (state.selectedOption === ConsoleOptions.Instantiate) {
      const parsedValue = parseInt(value)
      if (!isNaN(parsedValue)) {
        setCodeId(parsedValue)
      }
    } else {
      setContractAddress(value)
    }
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files !== null ? event.target.files[0] : null

    if (file !== null) {
      readFileAsUint8Array(file)
        .then((uint8Array) => {
          // Use the uint8Array for further processing
          setWasmFile(uint8Array)
        })
        .catch((error) => {
          console.error('Error reading file:', error)
          // Handle the error appropriately
        })
    }
  }
  const handleStoreCode = async (): Promise<void> => {
    console.log('DEBUG2')
    const txResponse = await uploadCode()
    if (txResponse !== undefined) {
      setOutputValue(JSON.stringify(txResponse, null, 2))
    }
  }
  const handleQuery = async (): Promise<void> => {
    const txResponse = await queryContract(JSON.parse(state.inputValue))
    if (txResponse !== undefined) {
      setOutputValue(JSON.stringify(txResponse, null, 2))
    }
  }
  const handleSubmit = (): void => {
    if (state.selectedOption === ConsoleOptions.StoreCode) {
      void handleStoreCode()
    } else if (state.selectedOption === ConsoleOptions.Instantiate) {
      // handleInstantiate()
    } else if (state.selectedOption === ConsoleOptions.Execute) {
      // handleExecute()
    } else if (state.selectedOption === ConsoleOptions.Query) {
      void handleQuery()
    }
  }

  const renderInputArea = (): JSX.Element => {
    if (state.selectedOption === ConsoleOptions.StoreCode) {
      return (
        <div className="mb-4">
          <label htmlFor="wasm-file" className="block mb-2 text-sm font-bold text-gray-700">
            Upload .wasm file
          </label>
          <input
            id="wasm-file"
            type="file"
            accept=".wasm"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
          />
        </div>
      )
    } else {
      const placeholder =
        state.selectedOption === ConsoleOptions.Instantiate ? 'Enter code id' : 'Enter contract address'
      const value =
        state.selectedOption === ConsoleOptions.Instantiate ? (codeId !== 0 ? codeId?.toString() : '') : contractAddress
      return (
        <div className="mb-4">
          <input
            type="text"
            className="p-4 border border-gray-300 rounded w-full"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              handleContractOrCodeIdChange(e.target.value)
            }}
          />
          <textarea
            value={state.inputValue}
            onChange={(e) => {
              handleInputValueChange(e.target.value)
            }}
            placeholder="Enter JSON message to send to the contract"
            className="p-4 border border-gray-300 rounded w-full"
            rows={8}
          ></textarea>
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Dropdown Selector Row */}
      <div className="mb-4">
        <Dropdown options={options} onSelect={handleSelectOption} />
      </div>
      {/* Input Area - Conditional Rendering */}
      {renderInputArea()}
      {/* Submit Button Row */}
      <div className="mb-4">
        <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Submit
        </button>
      </div>
      {/* Output Row */}
      {outputValue !== '' && (
        <div className="w-full p-4 border border-gray-300 rounded mt-4 bg-black text-white">{outputValue}</div>
      )}
    </div>
  )
}

export default ConsolePage

async function readFileAsUint8Array(file: File): Promise<Uint8Array> {
  console.log('DEBUG')
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const result = event.target?.result
      if (result instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(result)
        resolve(uint8Array)
      } else {
        reject(new Error('Read result is not an ArrayBuffer'))
      }
    }

    reader.onerror = (event) => {
      reject(event.target?.error)
    }

    reader.readAsArrayBuffer(file)
  })
}
