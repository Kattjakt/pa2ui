import { useCallback, useEffect, useRef, useState } from 'react'
import { useClientContext } from '../client.context'

const useClient = () => {
  const context = useClientContext()

  return context.client
}

export const useAsyncGetTimer = (path: string[], intervalMs: number): string => {
  const client = useClient()
  const [value, setValue] = useState<string>()

  useEffect(() => {
    if (!client) {
      return
    }

    const timer = setInterval(() => {
      client.asyncget(path).then((value) => setValue(value))
    }, intervalMs)

    return () => {
      clearInterval(timer)
    }
  }, [client, ...path, intervalMs])

  return value ?? ''
}

export const useSubscribe = (path: string[]): string => {
  const client = useClient()
  const [value, setValue] = useState<string>()

  useEffect(() => {
    if (!client) {
      return
    }

    const unsubscribe = client.sub(path, setValue)

    return () => {
      unsubscribe()
    }
  }, [client, ...path])

  return value ?? ''
}

export const useLs = (path: string[]) => {
  const client = useClient()
  const [ls, setLs] = useState<{ key: string; value: string }[] | null>(null)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!client) {
      return
    }
    // setTimeout(() => {
    setLs(null)
    setError(null)

    client
      .ls(path)
      .then((ls) => setLs(ls))
      .catch((error) => setError(error))
    // }, 500)
  }, [client, ...path])

  return [ls, error] as const
}

export const useSyncedState = (path: string[]): [string, (value: string) => void] => {
  const client = useClient()
  const deviceValue = useSubscribe(path)
  const lastEmit = useRef<number>(0)
  const mostRecentEmittedValue = useRef<string>(deviceValue)
  const mostRecentRequestedValue = useRef<string>(deviceValue)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const set = useCallback(
    (param: string) => {
      if (!client) {
        return
      }

      mostRecentRequestedValue.current = param

      const msSinceLastEmit = performance.now() - lastEmit.current

      if (msSinceLastEmit < 50) {
        if (timer.current) {
          clearTimeout(timer.current)
        }

        timer.current = setTimeout(() => {
          if (mostRecentRequestedValue.current === mostRecentEmittedValue.current) {
            return
          }

          set(param)
        }, 50)

        return
      }

      if (timer.current) {
        clearTimeout(timer.current)
      }

      timer.current = null
      lastEmit.current = performance.now()

      client.set(path, param)

      mostRecentEmittedValue.current = param
    },
    [client, ...path]
  )

  return [deviceValue ?? '', set]
}

export const useSyncedStateWithTranslator = <T>(
  path: string[],
  translator: Translator<T>
): [T | null, (value: T) => void] => {
  const [value, setValue] = useSyncedState(path)

  return [value ? translator.from(value) : null, (value) => setValue(translator.to(value))]
}

type Translator<U> = {
  from: (value: string) => U | null
  to: (value: U) => string
}

export const translator = {
  // "On", "Off"
  boolean: {
    from: (value: string) => value === 'On',
    to: (value: boolean) => (value ? 'On' : 'Off')
  } satisfies Translator<boolean>,

  // "100", "100hz", "100Hz", "0.1kHz", "0.1khz"
  frequency: {
    from: (freq: string) => {
      if (freq === 'Out') {
        return null
      }

      const match = freq.match(/(\d+(\.\d+)?)([kK]?[hH]?[zZ]?)?/)
      if (!match) {
        return null
      }

      const value = parseFloat(match[1])
      const unit = match[3].toLowerCase()

      if (unit === 'hz') {
        return value
      }

      if (unit === 'khz') {
        return value * 1000
      }

      return value
    },
    to: (value) => value.toString()
  } satisfies Translator<number>,

  // "100%"
  percentage: {
    from: (percentage: string) => {
      const match = percentage.match(/(\d+(\.\d+)?)(%)/)

      if (!match) {
        return null
      }

      return parseFloat(match[1])
    },
    to: (value) => value.toString()
  } satisfies Translator<number>,

  // "-0.1dB" "10dB"
  gain: {
    from: (gain: string) => {
      const match = gain.match(/(-?\d+(\.\d+)?)([dD]?[bB]?)?/)

      if (!match) {
        return null
      }

      return parseFloat(match[1])
    },
    to: (value) => value.toString()
  } satisfies Translator<number>,

  // "1.25ms/1.41ft/0.43m"
  ms: {
    from: (delay: string) => {
      const match = delay.match(/(\d+(\.\d+)?)(ms)/)

      if (!match) {
        return null
      }

      return parseFloat(match[1])
    },
    to: (value) => value.toString()
  } satisfies Translator<number>,

  // "1.05", "-10"
  number: {
    from: (value: string) => parseFloat(value),
    to: (value) => value.toString()
  } satisfies Translator<number>
}
