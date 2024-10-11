import { useCallback, useEffect, useMemo, useState } from 'react'
import { getThirdOctaveBandFrequencyFromZeroOne, toDecibels } from '../../../common'
import { Filter } from '../core/filter'
import { usePEQ } from '../peq.context'

export const generateFrequencies = (count: number): Float32Array => {
  let frequencies = new Float32Array(count)

  for (let x = 0; x < count; x++) {
    frequencies[x] = getThirdOctaveBandFrequencyFromZeroOne(x / count)
  }

  return frequencies
}

const generateFrequencyResponse = (frequencies: Float32Array, filters: Filter[]): Float32Array => {
  const frequencyResponse = new Float32Array(frequencies.length)

  frequencyResponse.fill(1)

  for (let filter of filters) {
    for (let i = 0; i < frequencies.length; i++) {
      frequencyResponse[i] *= filter.getMagnitude(frequencies[i])
    }
  }

  return frequencyResponse
}

const useFrequencyResponse = (frequencies: Float32Array | null) => {
  const peq = usePEQ()

  return useMemo(() => {
    if (!frequencies) {
      return null
    }

    const filters = peq.filters.filter((filter) => filter !== null)

    if (peq.lpf) filters.push(peq.lpf)
    if (peq.hpf) filters.push(peq.hpf)

    return generateFrequencyResponse(frequencies, filters)
  }, [peq.filters, peq.lpf, peq.hpf, frequencies])
}

const drawFrequencyResponse = (context: CanvasRenderingContext2D, frequencyResponse: Float32Array, decibelRange: number) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)

  // const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  // const center = 0.5
  // gradient.addColorStop(0.25, 'rgba(255, 0, 0, 1)')
  // gradient.addColorStop(center - 0.1, 'rgba(255, 255, 255, 1)')
  // gradient.addColorStop(center, 'rgba(255, 255, 255, 0.3)')
  // gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')
  // ctx.strokeStyle = gradient
  context.strokeStyle = 'rgba(255, 255, 255, 1)'
  context.lineWidth = 2
  context.beginPath()

  let maxDb = decibelRange / 2
  let minDb = -maxDb

  for (let x = 0; x < frequencyResponse.length; x++) {
    let gain = frequencyResponse[x]
    let db = toDecibels(gain)
    let y = context.canvas.height - ((db - minDb) / (maxDb - minDb)) * context.canvas.height

    x === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
  }

  context.stroke()

  // Draw background if accent is set
  const accentHue = getComputedStyle(context.canvas).getPropertyValue('--accent-hue')
  if (accentHue) {
    context.lineTo(context.canvas.width, context.canvas.height)
    context.lineTo(0, context.canvas.height)
    context.closePath()
    context.fillStyle = `hsl(${accentHue}, 50%, 50%)`
    context.globalAlpha = 0.2
    context.fill()
    context.globalAlpha = 1
  }
}

export const PEQFrequencyResponse = () => {
  const peq = usePEQ()
  const [frequencies, setFrequencies] = useState<Float32Array | null>(null)
  const frequencyResponse = useFrequencyResponse(frequencies)

  const draw = useCallback(() => {
    const canvas = peq.frequencyResponseCanvasRef.current

    if (!canvas || !frequencyResponse) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) throw new Error('Could not get a canvas context!')

    drawFrequencyResponse(context, frequencyResponse, peq.decibelRange)
  }, [peq.frequencyResponseCanvasRef, peq.decibelRange, frequencyResponse])

  useEffect(() => {
    const canvas = peq.frequencyResponseCanvasRef.current

    if (!canvas) {
      return
    }

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio

    setFrequencies(generateFrequencies(canvas.width))

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio

      setFrequencies(generateFrequencies(canvas.width))
    })

    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [peq.frequencyResponseCanvasRef])

  useEffect(() => {
    requestAnimationFrame(() => draw())
  }, [draw])

  return <canvas ref={peq.frequencyResponseCanvasRef}></canvas>
}
