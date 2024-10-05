export function toLog10(lin: number, minLin: number, maxLin: number) {
  let minLog = Math.log10(minLin)
  let maxLog = Math.log10(maxLin)
  return (Math.log10(clamp(lin, minLin, maxLin)) - minLog) / (maxLog - minLog)
}

export function toLin(log: number, minLin: number, maxLin: number) {
  let minLog = Math.log10(minLin)
  let maxLog = Math.log10(maxLin)
  return clamp(Math.pow(10, log * (maxLog - minLog) + minLog), minLin, maxLin)
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

export const toDecibels = (gain: number) => 20 * Math.log10(gain)

export const generateOctaveBandFrequencies = (): number[] => {
  const baseFrequency = 1000
  const octaves = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4]
  return octaves.map((octave) => baseFrequency * Math.pow(2, octave))
}

export const getThirdOctaveBandFrequencyFromZeroOne = (x: number): number => {
  const left = 17
  const right = 13
  const total = right + left

  // yields about [19.68 ... 20158], close enough!
  return 1000 * Math.pow(2, (x * total - left) / 3)
}

export const getZeroOneFromThirdOctaveBandFrequency = (freq: number): number => {
  const left = 17
  const right = 13
  const total = right + left

  return (Math.log2(freq / 1000) * 3 + left) / total
}
