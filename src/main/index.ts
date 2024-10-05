import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { Socket } from 'net'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { Device, Discovery } from './pa2/discovery'
import { connect } from './pa2/socket'

function createWindow(): void {
  console.log('[main] createWindow')

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev) {
    mainWindow.webContents.openDevTools({ mode: 'right' })
  }

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const sendConnection = (connection: Device | null) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('connection', connection)
    }
  }

  const sendLine = (line: string) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('line', line)
    }
  }

  const discovery = new Discovery((devices) => {
    if (mainWindow.isDestroyed()) {
      return
    }

    mainWindow.webContents.send('discovery:devices', devices)
  })

  discovery.start()
  console.log('[main] started Discovery')

  let socket: Socket | null = null

  ipcMain.on('command', (_, message) => {
    if (mainWindow.isDestroyed()) {
      console.error('Main window is destroyed')
      return
    }

    if (!socket) {
      console.error('No socket - user requested:', message)
      return
    }

    if (socket?.destroyed) {
      console.error('Socket is destroyed')
      sendConnection(null)
      return
    }

    if (!socket.writable) {
      console.error('Socket is not writable')
      sendConnection(null)
      return
    }

    socket.write(message)
  })

  ipcMain.on('connect', async (_, device: Device) => {
    console.log('[main] user wanna connect to:', device)

    sendConnection(null)

    if (socket) {
      console.error('[main] a socket already exists, creating a new one')
      socket.destroy()
      socket = null
      // return
    }

    try {
      socket = await connect(device)

      console.log('[main] successfully connected+authed to device')

      sendConnection(device)

      const ping = setInterval(() => {
        sendConnection(device)
      }, 1000)

      const cleanup = () => {
        socket?.off('close', onClose)
        socket?.off('error', onError)
        socket?.off('data', onData)
        // socket?.destroy()
        // socket = null

        clearInterval(ping)

        ipcMain.off('disconnect', onDisconnect)
      }

      const onError = (err: unknown) => {
        cleanup()
        console.error('\n====\n====socket error:\n\n', err)
        sendConnection(null)
      }

      const onData = (chunk: Buffer) => {
        const data = chunk.toString()
        sendLine(data)
        // console.log(data)
      }

      const onClose = (error: unknown) => {
        cleanup()
        console.log('[main] socket close!', error)
        sendConnection(null)
      }

      const onDisconnect = () => {
        console.log('[main] user requested disconnect')

        if (socket) {
          console.log('[main] destroying existing socket')
          cleanup()
        }

        sendConnection(null)
      }

      socket.on('close', onClose)
      socket.on('error', onError)
      socket.on('data', onData)
      ipcMain.on('disconnect', onDisconnect)
    } catch (error) {
      console.error('Error connecting', error)
      sendConnection(null)
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  app.commandLine.appendSwitch('lang', 'en-US')

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
