import { useEffect, useState } from 'react'
import { getThirdOctaveBandFrequencyFromZeroOne } from '../../../../common'
import { usePEQ } from '../../peq.context'
import './Legend.scss'

export const PEQLegend = () => {
  const peq = usePEQ()
  const [frequency, setFrequency] = useState<number | null>(null)

  // Track mouse X and convert to Hz
  const onMousemove = (event: MouseEvent) => {
    const canvas = peq.frequencyResponseCanvasRef.current

    if (!canvas) {
      return
    }

    const canvasBounds = canvas.getBoundingClientRect()
    const pointerX = event.clientX - canvasBounds.left
    const pointerFreq = getThirdOctaveBandFrequencyFromZeroOne(pointerX / canvasBounds.width)

    setFrequency(pointerFreq)
  }

  const onMouseLeave = () => {
    setFrequency(null)
  }

  useEffect(() => {
    const canvas = peq.frequencyResponseCanvasRef.current

    if (canvas) {
      canvas.addEventListener('mousemove', onMousemove)
      canvas.addEventListener('mouseleave', onMouseLeave)

      return () => {
        canvas.removeEventListener('mousemove', onMousemove)
        canvas.removeEventListener('mouseleave', onMouseLeave)
      }
    }

    return
  }, [peq.frequencyResponseCanvasRef])

  if (!frequency) {
    return null
  }

  return (
    <div className="peq-legend">
      <div className="peq-legend__content">
        <div className="peq-legend__frequency">
          {frequency.toFixed(0)}

          <span className="peq-legend__unit">Hz</span>
        </div>
      </div>
    </div>
  )
}
