// "100", "100hz", "100Hz", "0.1kHz", "0.1khz"
export const parseFrequencyString = (freq: string) => {
  if (freq === 'Out') {
    return null
  }

  const match = freq.match(/(\d+(\.\d+)?)([kK]?[hH]?[zZ]?)?/)
  if (!match) {
    return null
  }

  // Convert to Hz
  const value = parseFloat(match[1])
  const unit = match[3].toLowerCase()
  if (unit === 'hz') {
    return value
  } else if (unit === 'khz') {
    return value * 1000
  }

  return value
}

export const parsePercentage = (percentage: string) => {
  const match = percentage.match(/(\d+(\.\d+)?)(%)/)

  if (!match) {
    return null
  }

  return parseFloat(match[1])
}

// "-0.1dB" "10dB"
export const parseGainString = (gain: string) => {
  const match = gain.match(/(-?\d+(\.\d+)?)([dD]?[bB]?)?/)

  if (!match) {
    return null
  }

  return parseFloat(match[1])
}

// "1.25ms/1.41ft/0.43m"
export const parseDelayString = (delay: string) => {
  const match = delay.match(/(\d+(\.\d+)?)(ms)/)

  if (!match) {
    return null
  }

  return parseFloat(match[1])
}
