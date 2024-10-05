import udp from 'dgram'

export type Device = {
  ip: string
  port: number
  lastSeen: number
}

type Callback = (devices: Device[]) => void

const DBX_UDP_PORT = 19272
const CLIENT_UDP_PORT = 52990

const BROADCAST_IP = '192.168.1.255'
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
        server.send(Buffer.from(BROADCAST_PACKET), DBX_UDP_PORT, BROADCAST_IP)

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
