export type Adapter<U> = {
  from: (value: string) => U | null
  to: (value: U) => string
}

// "On", "Off"
export const Boolean: Adapter<boolean> = {
  from: (value: string) => value === 'On',
  to: (value: boolean) => (value ? 'On' : 'Off')
}

// "100", "100hz", "100Hz", "0.1kHz", "0.1khz"
export const Frequency: Adapter<number> = {
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
}

// "100%"
export const Percentage: Adapter<number> = {
  from: (percentage: string) => {
    const match = percentage.match(/(\d+(\.\d+)?)(%)/)

    if (!match) {
      return null
    }

    return parseFloat(match[1])
  },
  to: (value) => value.toString()
}

// "-0.1dB" "10dB"
export const Decibel: Adapter<number> = {
  from: (gain: string) => {
    const match = gain.match(/(-?\d+(\.\d+)?)([dD]?[bB]?)?/)

    if (!match) {
      return null
    }

    return parseFloat(match[1])
  },
  to: (value) => value.toString()
}

// "1.25ms/1.41ft/0.43m"
export const Delay: Adapter<number> = {
  from: (delay: string) => {
    const match = delay.match(/(\d+(\.\d+)?)(ms)/)

    if (!match) {
      return null
    }

    return parseFloat(match[1])
  },
  to: (value) => {
    return `${value}ms`
  }
}

// "1.05", "-10"
export const Number: Adapter<number> = {
  from: (value: string) => parseFloat(value),
  to: (value) => value.toString()
}
