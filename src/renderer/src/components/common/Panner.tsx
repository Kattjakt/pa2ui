import {
  DetailedHTMLProps,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { clamp } from '../../common'

type InputProps = DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

type Props = Omit<InputProps, 'ref' | 'onChange' | 'value'> & {
  strategy: Strategy
  value: number | null
  onChange: (value: number) => void
}

type Strategy = 'linear' | 'logarithmic'

type XY = {
  x: number
  y: number
}

type Intent = 'uncertain' | 'drag' | 'select'

// If x delta is larger than y, we're probably trying to select the content instead of dragging
const getIntent = (origin: XY, event: PointerEvent): Intent => {
  const yDelta = -(event.clientY - origin.y)
  const xDelta = -(event.clientX - origin.x)
  const distanceFromOrigin = Math.sqrt(xDelta ** 2 + yDelta ** 2)

  if (distanceFromOrigin < 5) {
    return 'uncertain'
  }

  if (Math.abs(yDelta) > Math.abs(xDelta)) {
    return 'drag'
  }

  return 'select'
}

const getInputPreferredDecimals = (element?: HTMLInputElement) => {
  return (element?.step ?? '1').toString().split('.')[1]?.length || 0
}

const useHasPointerLock = (ref: React.MutableRefObject<HTMLInputElement | null>) => {
  const [hasPointerLock, setHasPointerLock] = useState(false)

  const onPointerLockChange = useCallback(() => {
    setHasPointerLock(document.pointerLockElement === ref.current)
  }, [])

  useEffect(() => {
    document.addEventListener('pointerlockchange', onPointerLockChange)

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange)
    }
  }, [])

  return hasPointerLock
}

const useIsFocused = (ref: React.MutableRefObject<HTMLInputElement | null>) => {
  const [isFocused, setIsFocused] = useState(false)

  const onFocus = useCallback(() => setIsFocused(true), [])
  const onBlur = useCallback(() => setIsFocused(false), [])

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    element.addEventListener('focus', onFocus)
    element.addEventListener('blur', onBlur)

    return () => {
      element.removeEventListener('focus', onFocus)
      element.removeEventListener('blur', onBlur)
    }
  }, [ref])

  return isFocused
}

export const Panner = forwardRef<HTMLInputElement, Props>((props, forwardedRef) => {
  const { strategy, ...inputProps } = props

  const ref = useRef<HTMLInputElement | null>(null)
  useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement)

  const [pointerDownOrigin, setPointerDownOrigin] = useState<XY | null>(null)
  const [dragging, setDragging] = useState(false)

  const hasPointerLock = useHasPointerLock(ref)

  const focused = useIsFocused(ref)

  const [temporaryValue, setTemporaryValue] = useState<string | null>(null)

  useEffect(() => {
    if (!focused) {
      setTemporaryValue(null)
    }
  }, [focused])

  const onGlobalPointerMove = useCallback(
    (event: PointerEvent) => {
      const element = ref.current

      if (!element || !dragging) {
        return
      }

      const min = parseFloat(element.min ?? '-Infinity')
      const max = parseFloat(element.max ?? 'Infinity')
      const step = parseFloat(element.step ?? '1')
      const range = max - min
      const sensitivity = 3
      const pixelsPerFullRange = 1000 * sensitivity

      let value = parseFloat(element.value)

      if (isNaN(value)) {
        console.log(value, element.value)
        return
      }

      if (strategy === 'linear') {
        const valueChangePerPixel = range / pixelsPerFullRange
        value += -event.movementY * valueChangePerPixel
      }

      if (strategy === 'logarithmic') {
        const logMin = Math.log(min)
        const logMax = Math.log(max)
        const logRange = logMax - logMin
        const logValue = Math.log(value)

        const logChangePerPixel = logRange / pixelsPerFullRange
        const newLogValue = logValue + -event.movementY * logChangePerPixel
        value = Math.exp(newLogValue)
      }

      value = clamp(value, min, max)
      value = Math.round(value / step) * step

      const decimals = getInputPreferredDecimals(element)
      const nextValue = value.toFixed(decimals)

      setTemporaryValue(nextValue)

      props.onChange(+nextValue)
    },
    [dragging, props.onChange]
  )

  useEffect(() => {
    if (!hasPointerLock) {
      return
    }

    document.addEventListener('pointermove', onGlobalPointerMove)

    return () => {
      document.removeEventListener('pointermove', onGlobalPointerMove)
    }
  }, [hasPointerLock, onGlobalPointerMove])

  const onPointerDown = useCallback((event: PointerEvent) => {
    console.log('pointer down')

    const element = event.target as HTMLInputElement

    element.setPointerCapture(event.pointerId)

    setPointerDownOrigin({
      x: event.clientX,
      y: event.clientY
    })
  }, [])

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const element = event.target as HTMLInputElement

      if (pointerDownOrigin && !dragging) {
        const intent = getIntent(pointerDownOrigin, event)

        if (intent === 'select') {
          console.log('Selection detected, aborting')
          setPointerDownOrigin(null)
          setDragging(false)
          return
        }

        if (intent === 'drag') {
          element.requestPointerLock({ unadjustedMovement: true }).then(() => setDragging(true))
          return
        }
      }
    },
    [pointerDownOrigin, dragging]
  )

  const onPointerUp = useCallback((event: PointerEvent) => {
    const target = event.target as HTMLInputElement

    console.log('pointer up')

    setPointerDownOrigin(null)
    setDragging(false)
    document.exitPointerLock()
    target.releasePointerCapture(event.pointerId)
  }, [])

  const onGotPointerCapture = useCallback(() => {
    console.log('got pointer capture')
  }, [])

  const onLostPointerCapture = useCallback((event: PointerEvent) => {
    console.log('lost pointer capture')

    // setPointerDownOrigin(null)
    // setDragging(false)
    // document.exitPointerLock()
  }, [])

  const onDragStart = useCallback((event: DragEvent) => {
    event.preventDefault()
  }, [])

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerUp)

    element.addEventListener('gotpointercapture', onGotPointerCapture)
    element.addEventListener('lostpointercapture', onLostPointerCapture)

    element.addEventListener('dragstart', onDragStart)

    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', onPointerUp)

      element.removeEventListener('gotpointercapture', onGotPointerCapture)
      element.removeEventListener('lostpointercapture', onLostPointerCapture)

      element.removeEventListener('dragstart', onDragStart)
    }
  }, [
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onGotPointerCapture,
    onLostPointerCapture,
    onDragStart
  ])

  useEffect(() => {
    // Set attribute
    const element = ref.current

    if (!element) {
      return
    }

    if (dragging) {
      // setTemporaryValue(formatValue(props.value))
      element.setAttribute('dragging', '')
    } else {
      element.removeAttribute('dragging')
    }
  }, [dragging])

  const formatValue = (value: number) => {
    const element = ref.current

    if (!element) {
      return `${value}`
    }

    return value.toFixed(getInputPreferredDecimals(element))
  }

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (focused) {
        setTemporaryValue(event.target.value)
        return
      }

      props.onChange(event.target.valueAsNumber)
    },
    [focused, dragging, props.onChange]
  )

  const onBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (temporaryValue !== null) {
        setTemporaryValue(null)
        props.onChange(parseFloat(temporaryValue))
      }
    },
    [temporaryValue, props.onChange]
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const keys = ['ArrowUp', 'ArrowDown', 'Enter']
      if (keys.includes(event.key)) {
        // ref.current?.blur()

        if (temporaryValue) {
          props.onChange(parseFloat(temporaryValue))

          setTimeout(() => ref.current?.select(), 0)
        }
      }
    },
    [ref, temporaryValue]
  )

  const value = temporaryValue ?? (props.value === null ? null : formatValue(props.value))

  return (
    <input
      {...inputProps}
      ref={ref}
      type="number"
      disabled={props.disabled || props.value === null}
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  )
})
