import { Message, createMessageParser } from './parser'

const serializePath = (path: string[]) => {
  return `\\\\${path.join('\\')}`
}

const samePath = (a?: string[], b?: string[]) => {
  if (!a || !b) return false

  if (a.length !== b.length) return false

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }

  return true
}

export class Client {
  private messageListeners: Record<string, ((message: Message) => void)[]> = {}
  private parser: ReturnType<typeof createMessageParser>

  constructor() {
    this.parser = createMessageParser((message) => {
      // console.log(`< ${JSON.stringify(message)}`)
      this.emitMessage(message)
    })
  }

  parse(line: string) {
    // console.log(`> ${line}`)
    this.parser.push(line)
  }

  sub(path: string[], callback: (value?: string) => void) {
    this.write(`sub "${serializePath(path)}"\n`)

    const onSubr = (message: Message) => {
      if (samePath(message.path, path)) {
        callback(message.value)
      }
    }

    const onGet = (message: Message) => {
      if (samePath(message.path, path)) {
        callback(message.value)
      }
    }

    const onSet = (message: Message) => {
      if (samePath(message.path, path)) {
        callback(message.value)
      }
    }

    const onSetR = (message: Message) => {
      if (samePath(message.path, path)) {
        callback(message.value)
      }
    }

    // Catch every sub-r for this path
    this.addMessageListener('subr', onSubr)
    this.addMessageListener('set', onSet)
    this.addMessageListener('get', onGet)
    this.addMessageListener('setr', onSetR)

    // const response = await this.waitForNextMessage('ls', path)

    return () => {
      this.write(`unsub "${serializePath(path)}"\n`)
      this.removeMessageListener('subr', onSubr)
      this.removeMessageListener('set', onSet)
      this.removeMessageListener('get', onGet)
      this.removeMessageListener('setr', onSetR)
    }
  }

  async ls(path: string[]) {
    this.write(`ls "${serializePath(path)}"\n`)
    const response = await this.waitForNextMessage('ls', path)

    return response.children!
  }

  async get(path: string[]) {
    const cmd = `get "${serializePath(path)}"\n`
    this.write(cmd)
    const response = await this.waitForNextMessage('get', path)

    return response.value!
  }

  async asyncget(path: string[]) {
    const cmd = `asyncget "${serializePath(path)}"\n`
    this.write(cmd)
    const response = await this.waitForNextMessage('get', path)

    return response.value!
  }

  set(path: string[], value: string): void {
    this.write(`set "${serializePath(path)}" "${value}"\n`)
  }

  private write(cmd: string) {
    // Pretty console log
    // console.log(`> ${cmd}`)

    window.electron.ipcRenderer.send('command', cmd)
  }

  private waitForNextMessage(type: Message['type'], path: string[]) {
    return new Promise<Message>((resolve, reject) => {
      const onMessage = (message: Message) => {
        if (message.type === type && samePath(message.path, path)) {
          resolve(message)
          unregister()
        }
      }

      const onError = (message: Message) => {
        if (samePath(message.path, path)) {
          reject(message.value)
          unregister()
        }
      }

      const timeout = setTimeout(() => {
        reject('Timeout')
        unregister()
      }, 1000)

      const unregister = () => {
        this.removeMessageListener(type, onMessage)
        this.removeMessageListener('error', onError)
        clearTimeout(timeout)
      }

      this.addMessageListener(type, onMessage)
      this.addMessageListener('error', onError)
    })
  }

  private emitMessage(message: Message) {
    ;(this.messageListeners[message.type] ?? []).forEach((listener) => listener(message))
  }

  addMessageListener(type: Message['type'], callback: (message: Message) => void) {
    if (this.messageListeners[type] === undefined) {
      this.messageListeners[type] = []
    }

    this.messageListeners[type].push(callback)
  }

  removeMessageListener(type: Message['type'], callback: (message: Message) => void) {
    this.messageListeners[type] = this.messageListeners[type]?.filter(
      (listener) => listener !== callback
    )
  }
}
