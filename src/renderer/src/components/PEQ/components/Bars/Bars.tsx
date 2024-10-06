import { useEffect, useState } from 'react'
import { getZeroOneFromThirdOctaveBandFrequency } from '../../../../common'
import { RtaBar, useRtaBars } from '../../../RTA'
import { usePEQ } from '../../peq.context'
import './Bars.scss'

interface Props {
  // bars: Array<{ frequency: number; gain: number }>
}

const alpha = 0.05

const useAveragedRtaBars = () => {
  const rtaBars = useRtaBars()

  const [averagedBars, setAveragedBars] = useState<RtaBar[]>([])

  useEffect(() => {
    setAveragedBars((prevBars) => {
      if (!rtaBars.length) {
        return prevBars
      }

      if (rtaBars.some((bar) => isNaN(bar.gain))) {
        return prevBars
      }

      const newBars = rtaBars.map((bar, index) => {
        if (!prevBars[index]) {
          return bar
        }

        return {
          frequency: bar.frequency,
          gain: prevBars[index].gain * (1 - alpha) + bar.gain * alpha
        }
      })

      return newBars
    })
  }, [rtaBars])

  return averagedBars
}

const getZeroOneFromDb = (db: number, dbMin: number, dbMax: number) => {
  return (db - dbMin) / (dbMax - dbMin)
}

export const PEQBars = (props: Props) => {
  const peq = usePEQ()
  const rtaBars = useAveragedRtaBars()

  const frequencyToX = (frequency: number) => {
    const canvas = peq.frequencyResponseCanvasRef.current

    if (!canvas) return null

    let canvasBounds = canvas.getBoundingClientRect()

    return getZeroOneFromThirdOctaveBandFrequency(frequency) * canvasBounds.width
  }

  const averageGain = rtaBars.reduce((acc, bar) => acc + bar.gain, 0) / rtaBars.length

  const gainToY = (gain: number) => {
    const canvas = peq.frequencyResponseCanvasRef.current

    if (!canvas) return null

    let canvasBounds = canvas.getBoundingClientRect()

    return getZeroOneFromDb(averageGain - gain, -peq.decibelRange / 2, peq.decibelRange / 2) * canvasBounds.height
  }

  return (
    <div className="peq-bars">
      {rtaBars.map((bar, index) => (
        <div
          key={index}
          className="peq-bar"
          style={
            {
              '--x': frequencyToX(bar.frequency) + 'px',
              '--y': gainToY(bar.gain) + 'px'
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
