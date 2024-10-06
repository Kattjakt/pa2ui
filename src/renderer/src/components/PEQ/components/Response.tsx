import { useCallback, useEffect, useMemo, useState } from 'react'
import { getThirdOctaveBandFrequencyFromZeroOne, toDecibels } from '../../../common'
import { BaseFilter } from '../core/filters'
import { CrossoverFilter } from '../core/filters/crossover'
import { usePEQ } from '../peq.context'

export const generateFrequencies = (count: number): Float32Array => {
  let frequencies = new Float32Array(count)

  for (let x = 0; x < count; x++) {
    frequencies[x] = getThirdOctaveBandFrequencyFromZeroOne(x / count)
  }

  return frequencies
}

const generateFrequencyResponse = (
  frequencies: Float32Array,
  filters: BaseFilter[],
  lpf: CrossoverFilter | null,
  hpf: CrossoverFilter | null
): Float32Array => {
  const frequencyResponse = new Float32Array(frequencies.length)

  frequencyResponse.fill(1)

  for (let filter of filters) {
    if (!filter) {
      continue
    }

    for (let i = 0; i < frequencies.length; i++) {
      frequencyResponse[i] *= filter.calculateFrequencyResponse(frequencies[i])
    }
  }

  if (lpf) {
    for (let i = 0; i < frequencies.length; i++) {
      frequencyResponse[i] *= lpf.calculateLowPassResponse(frequencies[i])
    }
  }

  if (hpf) {
    for (let i = 0; i < frequencies.length; i++) {
      frequencyResponse[i] *= hpf.calculateHighPassResponse(frequencies[i])
    }
  }

  return frequencyResponse
}

export const PEQFrequencyResponse = () => {
  const peq = usePEQ()
  const [frequencies, setFrequencies] = useState<Float32Array | null>(null)

  const frequencyResponse = useMemo(() => {
    if (!frequencies) {
      return null
    }

    const filters = peq.filters.filter((filter) => filter !== null)

    return generateFrequencyResponse(frequencies, filters, peq.lpf, peq.hpf)
  }, [peq.filters, peq.lpf, peq.hpf, frequencies])

  const draw = useCallback(() => {
    const canvas = peq.frequencyResponseCanvasRef.current

    if (!canvas || !frequencyResponse) {
      return
    }

    let ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Could not get a canvas context!')

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    // const center = 0.5
    // gradient.addColorStop(0.25, 'rgba(255, 0, 0, 1)')
    // gradient.addColorStop(center - 0.1, 'rgba(255, 255, 255, 1)')
    // gradient.addColorStop(center, 'rgba(255, 255, 255, 0.3)')
    // gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')
    // ctx.strokeStyle = gradient
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
    ctx.lineWidth = 2
    ctx.beginPath()

    let maxDb = peq.decibelRange / 2
    let minDb = -maxDb

    for (let x = 0; x < frequencyResponse.length; x++) {
      let gain = frequencyResponse[x]
      let db = toDecibels(gain)
      let y = canvas.height - ((db - minDb) / (maxDb - minDb)) * canvas.height

      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }

    ctx.stroke()

    // Draw background if accent is set
    let accent_hue = getComputedStyle(canvas).getPropertyValue('--accent-hue')

    if (accent_hue) {
      // Add a color to the space below the curve
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.closePath()
      ctx.fillStyle = `hsl(${accent_hue}, 50%, 50%)`
      ctx.globalAlpha = 0.2
      ctx.fill()
      ctx.globalAlpha = 1
    }
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
    if (!frequencyResponse) {
      return
    }

    requestAnimationFrame(() => draw())
    // draw()
  }, [frequencyResponse, draw])

  return <canvas ref={peq.frequencyResponseCanvasRef}></canvas>
}
