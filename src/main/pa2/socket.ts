/* eslint-disable @typescript-eslint/explicit-function-return-type */
import net from 'net'
import { Device } from './discovery'

// type LineCallback = (line: string) => void

export const connect = async (
  device: Device,
  username = 'administrator',
  password = 'administrator'
) => {
  const socket = await new Promise<net.Socket>((resolve, reject) => {
    const socket = new net.Socket()

    const removeListeners = () => {
      socket.off('error', onError)
      socket.off('data', onData)
    }

    const onError = (err) => {
      console.error('Socket connect error:', err)
      removeListeners()
      reject(err)
    }

    const onData = (buffer: Buffer) => {
      const text = buffer.toString().trim()

      if (text.startsWith('connect logged in')) {
        removeListeners()
        resolve(socket)
      }

      if (text.startsWith('error could not connect')) {
        removeListeners()
        reject(text)
      }
    }

    socket.connect(device.port, device.ip, () => {
      console.log('Connected! Authenticating...')

      socket.on('data', onData)
      socket.on('error', onError)

      socket.write(`connect ${username} "${password}"\n`)
      // resolve(socket)
    })
  })

  return socket
}
