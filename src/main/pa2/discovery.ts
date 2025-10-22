import udp from 'dgram'
import os from 'os'

export type Device = {
  ip: string
  port: number
  lastSeen: number
}

type Callback = (devices: Device[]) => void

const DBX_UDP_PORT = 19272
const CLIENT_UDP_PORT = 0 // Leave it to OS

const getBroadcastAddresses = (): string[] => {
  const interfaces = os.networkInterfaces()
  const addrs: string[] = []

  for (const name in interfaces) {
    const iface = interfaces[name]
    if (!iface) continue

    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal && !addr.address.startsWith('169.254.')) {
        const ip = addr.address.split('.').map(Number)
        const netmask = addr.netmask.split('.').map(Number)
        const broadcast = ip.map((byte, i) => byte | (~netmask[i] & 255)).join('.')
        addrs.push(broadcast)
      }
    }
  }

  if (addrs.length === 0) {
    return ['255.255.255.255']
  }

  return addrs
}
const BROADCAST_PACKET = `
  delay 100
  get \\\\Node\\AT\\Class_Name
  get \\\\Node\\AT\\Instance_Name
  get \\\\Node\\AT\\Software_Version
  get \\\\Storage\\Presets\\SV\\CurrentPreset"
  `

export class Discovery {
  private server?: udp.Socket
  private devices: Device[] = []

  constructor(private callback: Callback) {}

  start(): void {
    if (this.server) {
      console.log('Already started')
      return
    }

    const server = udp.createSocket('udp4')

    server.on('listening', () => {
      const { address, port } = server.address()
      console.log('Discovery (UDP Server) listening on ' + address + ':' + port)

      server.on('message', this.onMessage)
      server.setBroadcast(true)

      const timer = setInterval(() => {

        for (const ip of getBroadcastAddresses()) {
          server.send(Buffer.from(BROADCAST_PACKET), DBX_UDP_PORT, ip)
        }

        this.devices = this.devices.filter((device) => {
          if (Date.now() - device.lastSeen > 5000) {
            return false
          }

          return true
        })

        this.callback(this.devices)
        // clearInterval(timer) // TEMP TEMP MTEP
      }, 1000)

      server.once('close', () => {
        clearInterval(timer)
      })
    })

    server.bind(CLIENT_UDP_PORT)

    this.server = server
  }

  stop(): void {
    console.log('Stopping discovery')

    this.server?.close()
    this.server = undefined

    this.devices = []
    this.callback(this.devices)
  }

  private onMessage = (_: Buffer, info: udp.RemoteInfo): void => {
    // console.log('Received %d bytes from %s:%d\n', msg.length, info.address, info.port)
    // msg
    //   .toString()
    //   .split('\n')
    //   .forEach((line) => console.log(line))

    const device = this.devices.find((device) => device.ip === info.address)

    if (device) {
      device.lastSeen = Date.now()
    } else {
      this.devices.push({
        ip: info.address,
        port: info.port,
        lastSeen: Date.now()
      })
    }

    this.callback(this.devices)
  }
}
