import { useCallback, useEffect, useRef, useState } from 'react'
import { useClientContext } from '../client.context'
import { Adapter } from './adapter'

const DEBOUNCE_MS = 50

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

const useSubscribe = (path: string[]): string => {
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
  const [entries, setEntries] = useState<{ key: string; value: string }[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!client) {
      return
    }

    setEntries(null)
    setError(null)

    client
      .ls(path)
      .then((ls) => setEntries(ls))
      .catch((error) => setError(error))
  }, [client, ...path])

  return [entries, error] as const
}

const useSyncedState = (path: string[]): [string, (value: string) => void] => {
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

      if (msSinceLastEmit < DEBOUNCE_MS) {
        if (timer.current) {
          clearTimeout(timer.current)
        }

        timer.current = setTimeout(() => {
          if (mostRecentRequestedValue.current === mostRecentEmittedValue.current) {
            return
          }

          set(param)
        }, DEBOUNCE_MS)

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

  return [deviceValue, set]
}

export function useDspState<T = string>(path: string[], adapter?: Adapter<T>): [T | null, (value: T) => void] {
  const [rawValue, setRawValue] = useSyncedState(path)

  if (!adapter) {
    return [rawValue as T, setRawValue as (value: T) => void]
  }

  const adaptedValue = rawValue ? adapter.from(rawValue) : null

  const setValue = (value: T) => {
    setRawValue(adapter.to(value))
  }

  return [adaptedValue, setValue]
}
