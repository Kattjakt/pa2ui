import { useCallback, useEffect, useState } from 'react'
import { ClientContextProvider } from './client.context'
import { Compressor } from './components/Compressor'
import { Overview } from './components/Overview'
import { PEQ } from './components/PEQ/PEQ'
import { RtaControls } from './components/RTA'
import { SignalGenerator } from './components/SignalGenerator'
import { SubharmonicSynth } from './components/SubharmonicSynth'
import { Crossover } from './components/crossover/Crossover'

export type Device = {
  ip: string
  port: number
  lastSeen: number
}

const useDiscovery = (): Device[] => {
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {
    window.electron.ipcRenderer.send('discovery:start')

    const destroy = window.electron.ipcRenderer.on('discovery:devices', (_, devices) => {
      setDevices(devices)
    })

    return (): void => {
      window.electron.ipcRenderer.send('discovery:stop')
      destroy()
    }
  }, [])

  return devices
}

const useConnection = () => {
  const [device, setDevice] = useState<Device | null>(null)

  useEffect(() => {
    const destroy = window.electron.ipcRenderer.on('connection', (_, device) => {
      setDevice(device)
    })

    return () => {
      destroy()
    }
  }, [setDevice])

  const connect = useCallback((device: Device) => {
    window.electron.ipcRenderer.send('connect', device)
  }, [])

  const disconnect = useCallback(() => {
    setDevice(null)

    window.electron.ipcRenderer.send('disconnect')
  }, [setDevice])

  return [device, connect, disconnect] as const
}

function App(): JSX.Element {
  const availableDevices = useDiscovery()
  const [device, connect, disconnect] = useConnection()

  const [rtaEnabled, setRtaEnabled] = useState(false)

  return (
    <>
      <header className="discovery">
        <ul className="discovery__devices">
          {availableDevices.map((availableDevice) => (
            <li key={availableDevice.ip} style={{ display: 'flex', gap: '1rem' }}>
              {availableDevice.ip}:{availableDevice.port}
              {availableDevice.ip === device?.ip ? (
                <button onClick={() => disconnect()}>disconnect</button>
              ) : (
                <button onClick={() => connect(availableDevice)}>connect</button>
              )}
            </li>
          ))}
        </ul>
      </header>

      {device && (
        <ClientContextProvider device={device}>
          <div className="main">
            <Overview />

            <div className="main__top">
              <div className="main__side">
                <SubharmonicSynth />
                <Compressor />
              </div>

              <PEQ rta={rtaEnabled} path={['Preset', 'RoomEQ', 'SV']}>
                <details
                  style={{
                    position: 'absolute',
                    right: 0,
                    padding: '0.2rem 0.5rem',
                    background: '#343434'
                  }}
                >
                  <summary style={{ textAlign: 'right' }}>RTA</summary>

                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={rtaEnabled}
                        onChange={(event) => setRtaEnabled(event.target.checked)}
                      />
                      Enabled
                    </label>

                    <RtaControls />
                    <SignalGenerator />
                  </div>
                </details>
              </PEQ>
            </div>

            <div className="main__bottom">
              <Crossover />
            </div>
          </div>
        </ClientContextProvider>
      )}
    </>
  )
}

export default App
