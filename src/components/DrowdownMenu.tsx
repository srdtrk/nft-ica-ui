import React, { useState } from 'react'

interface DropdownProps {
  options: string[]
  onSelect: (value: string) => void
}

const Dropdown = (props: DropdownProps): JSX.Element => {
  const [selectedOption, setSelectedOption] = useState(props.options[0])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedOption(event.target.value)
    props.onSelect(event.target.value)
  }

  return (
    <select className="p-2 border border-gray-300 rounded" value={selectedOption} onChange={handleChange}>
      {props.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default Dropdown
