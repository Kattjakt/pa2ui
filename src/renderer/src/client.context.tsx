import React, { PropsWithChildren, createContext, useContext, useEffect } from 'react'
import { Device } from './App'
import { Client } from './pa2/client'

interface Props {
  device: Device
}

interface Context {
  device: Device
  client: Client | null
}

const ClientContext = createContext<Context | undefined>(undefined)

export const useClientContext = (): Context => {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClientContext must be used within a MyContextProvider')
  }
  return context
}

export const ClientContextProvider: React.FC<PropsWithChildren<Props>> = (props) => {
  const [client, setClient] = React.useState<Client | null>(null)

  useEffect(() => {
    const client = new Client()

    const destroy = window.electron.ipcRenderer.on('line', (_, row) => {
      client.parse(row)
    })

    setClient(client)

    return () => {
      setClient(null)
      destroy()
    }
  }, [])

  return (
    <ClientContext.Provider
      value={{
        client: client,
        device: props.device
      }}
    >
      {props.children}
    </ClientContext.Provider>
  )
}
