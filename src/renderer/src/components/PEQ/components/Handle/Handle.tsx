import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp, getThirdOctaveBandFrequencyFromZeroOne, getZeroOneFromThirdOctaveBandFrequency, toLin, toLog10 } from '../../../../common'
import { usePEQ, usePEQFilter } from '../../peq.context'
import './Handle.scss'

interface Props {
  filterIndex: number
}

export const PEQHandle: React.FC<Props> = (props) => {
  const peq = usePEQ()
  const filter = usePEQFilter(props.filterIndex)

  const canvas = peq.frequencyResponseCanvasRef.current

  const ref = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState(false)
  const [xy, setXY] = useState<[number, number] | null>(null)
  const [optimisticXY, setOptimisticXY] = useState<[number, number] | null>(null)

  const update = useCallback(() => {
    if (!filter || !canvas) {
      return
    }

    if ('frequency' in filter) {
      const x = getZeroOneFromThirdOctaveBandFrequency(filter.frequency) * canvas.offsetWidth
      const y = canvas.offsetHeight - ((filter.gain + peq.decibelRange / 2) / peq.decibelRange) * canvas.offsetHeight
      setXY([x, y])
    }
  }, [filter, canvas, peq.sampleRate, peq.decibelRange])

  useEffect(() => {
    if (!canvas) {
      return
    }

    const observer = new ResizeObserver(() => {
      update()
    })

    observer.observe(canvas)

    return () => {
      observer.disconnect()
    }
  }, [canvas, update])

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!dragging) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      if (!canvas || !filter) {
        return
      }

      const canvasBounds = canvas.getBoundingClientRect()
      const pointerX = event.clientX - canvasBounds.left
      const pointerY = event.clientY - canvasBounds.top

      setOptimisticXY([pointerX, pointerY])

      const pointerFreq = getThirdOctaveBandFrequencyFromZeroOne(pointerX / canvasBounds.width)
      const relY = 1 - pointerY / canvasBounds.height
      const pointerGain = clamp(relY * peq.decibelRange - peq.decibelRange / 2, -peq.decibelRange / 2, peq.decibelRange / 2)

      peq.events.emit('filterChanged', {
        index: props.filterIndex,
        frequency: pointerFreq,
        gain: pointerGain
      })

      peq.actions.setFocusedFilter(filter)
    },
    [canvas, dragging, filter, props.filterIndex, peq.sampleRate, peq.decibelRange]
  )

  let pointerId = useRef<number | null>(null)

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault()

      const target = event.target as HTMLElement
      target.setPointerCapture(event.pointerId)
      pointerId.current = event.pointerId
      setDragging(true)

      peq.actions.setFocusedFilter(filter)
    },
    [dragging, peq]
  )

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault()
      const target = event.target as HTMLElement
      target.releasePointerCapture(event.pointerId)
      pointerId.current = null

      setDragging(false)
      setOptimisticXY(null)

      peq.actions.setFocusedFilter(null)
    },
    [peq]
  )

  // On wheel
  const onWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (!filter) {
        return
      }

      if ('Q' in filter) {
        const delta = event.deltaY / 2000
        const min = 0.1
        const max = 16
        const startValueLog = toLog10(filter.Q, min, max)
        const newValue = toLin(startValueLog + delta, min, max)
        const newQ = newValue

        peq.events.emit('filterChanged', {
          index: props.filterIndex,
          frequency: filter.frequency,
          gain: filter.gain,
          q: newQ
        })
      }

      if ('slope' in filter) {
        let delta = event.deltaY / 150

        let newSlope = filter.slope + delta

        peq.events.emit('filterChanged', {
          index: props.filterIndex,
          frequency: filter.frequency,
          gain: filter.gain,
          slope: newSlope
        })
      }
    },
    [filter, props.filterIndex]
  )

  useEffect(() => {
    const element = ref.current

    if (!element || !dragging) {
      return
    }

    element.addEventListener('wheel', onWheel)

    return () => {
      element.removeEventListener('wheel', onWheel)
    }
  }, [ref, onWheel, dragging])

  if (!xy || !filter) {
    return null
  }

  const [x, y] = optimisticXY || xy

  const gain = 'gain' in filter ? filter.gain : 0 // yuckkkkk
  const faded = Math.abs(gain) <= 0 && !dragging

  return (
    <div className="peq-handle" data-filter-index={props.filterIndex} data-dragging={dragging} data-faded={faded}>
      <div
        ref={ref}
        className="peq-handle__position"
        style={{ transform: `translate(${x}px, ${y}px)` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onDoubleClick={(event) => {
          console.log('double click', event)
        }}
      >
        <div className="peq-handle__identifier">{props.filterIndex + 1}</div>

        {dragging && 'frequency' in filter && (
          <div className="peq-handle__legend">
            <div className="peq-handle__frequency">
              {filter.frequency.toFixed(0)} <span>Hz</span>
            </div>
            <div className="peq-handle__gain">
              {filter.gain.toFixed(1)} <span>dB</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
