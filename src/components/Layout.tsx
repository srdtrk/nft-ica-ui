import React from 'react'
import Navbar from './Navbar'

interface Props {
  children?: React.ReactNode
}

const Layout = (props: Props): JSX.Element => {
  return (
    <div>
      <Navbar />
      {props.children}
    </div>
  )
}

export default Layout
