// https://www.earlevel.com/main/2016/09/29/cascading-filters/
// https://www.andyc.diy-audio-engineering.org/parametric-eq-parameters/index.html

const SAMPLE_RATE = 48_000

interface Coefficients {
  b0: number
  b1: number
  b2: number
  a1: number
  a2: number
  a0: number
}

interface Magnitude {
  getMagnitude(frequency: number): number
}

export type Filter = Butterworth | LinkwitzRiley | HighShelf | LowShelf | Bell

/**
 * BW6  = 2:nd order
 * BW12 = 4:th order
 * BW18 = 6:th order
 * BW24 = 8:th order
 * BW30 = 10:th order
 * BW36 = 12:th order
 * BW42 = 14:th order
 * BW48 = 16:th order
 */
export class Butterworth implements Magnitude {
  constructor(
    public type: 'lowpass' | 'highpass',
    public order: number,
    public f0: number
  ) {}

  getMagnitude(frequency: number): number {
    if (this.type === 'lowpass') {
      return 1 / Math.sqrt(1 + Math.pow(frequency / this.f0, 2 * this.order))
    }

    if (this.type === 'highpass') {
      return 1 / Math.sqrt(1 + Math.pow(this.f0 / frequency, 2 * this.order))
    }

    return 0
  }
}

/**
 * LR12 = 4:th order
 * LR24 = 8:th order
 * LR36 = 12:th order
 * LR48 = 16:th order
 */
export class LinkwitzRiley implements Magnitude {
  public filter: Butterworth

  constructor(
    public type: 'lowpass' | 'highpass',
    public order: number,
    public f0: number
  ) {
    this.filter = new Butterworth(this.type, this.order / 2, this.f0)
  }

  getMagnitude(frequency: number): number {
    return this.filter.getMagnitude(frequency) ** 2
  }
}

export class HighShelf implements Magnitude {
  private coefficients: Coefficients

  constructor(
    public frequency: number,
    public slope: number,
    public gain: number
  ) {
    const omega = (2 * Math.PI * this.frequency) / SAMPLE_RATE
    const A = Math.pow(10, this.gain / 40)
    const S = this.slope / 6

    const alpha = (Math.sin(omega) / 2) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2)
    const cosOmega = Math.cos(omega)
    const sqrtA = Math.sqrt(A)

    this.coefficients = {
      b0: A * (A + 1 + (A - 1) * cosOmega + 2 * sqrtA * alpha),
      b1: -2 * A * (A - 1 + (A + 1) * cosOmega),
      b2: A * (A + 1 + (A - 1) * cosOmega - 2 * sqrtA * alpha),
      a0: A + 1 - (A - 1) * cosOmega + 2 * sqrtA * alpha,
      a1: 2 * (A - 1 - (A + 1) * cosOmega),
      a2: A + 1 - (A - 1) * cosOmega - 2 * sqrtA * alpha
    }
  }

  getMagnitude(frequency: number): number {
    return calculateMagnitudeResponse(frequency, this.coefficients)
  }
}

export class LowShelf implements Magnitude {
  private coefficients: Coefficients

  constructor(
    public frequency: number,
    public slope: number,
    public gain: number
  ) {
    const omega = (2 * Math.PI * this.frequency) / SAMPLE_RATE
    const A = Math.pow(10, this.gain / 40)
    const S = this.slope / 6

    const alpha = (Math.sin(omega) / 2) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2)
    const cosOmega = Math.cos(omega)
    const sqrtA = Math.sqrt(A)

    this.coefficients = {
      b0: A * (A + 1 - (A - 1) * cosOmega + 2 * sqrtA * alpha),
      b1: 2 * A * (A - 1 - (A + 1) * cosOmega),
      b2: A * (A + 1 - (A - 1) * cosOmega - 2 * sqrtA * alpha),
      a0: A + 1 + (A - 1) * cosOmega + 2 * sqrtA * alpha,
      a1: -2 * (A - 1 + (A + 1) * cosOmega),
      a2: A + 1 + (A - 1) * cosOmega - 2 * sqrtA * alpha
    }
  }

  getMagnitude(frequency: number): number {
    return calculateMagnitudeResponse(frequency, this.coefficients)
  }
}

export class Bell implements Magnitude {
  private coefficients: Coefficients

  constructor(
    public frequency: number,
    public Q: number,
    public gain: number
  ) {
    const omega = (2 * Math.PI * this.frequency) / SAMPLE_RATE
    const alpha = Math.sin(omega) / (2 * this.Q)
    const A = Math.pow(10, this.gain / 40)

    this.coefficients = {
      b0: 1 + alpha * A,
      b1: -2 * Math.cos(omega),
      b2: 1 - alpha * A,
      a0: 1 + alpha / A,
      a1: -2 * Math.cos(omega),
      a2: 1 - alpha / A
    }
  }

  getMagnitude(frequency: number): number {
    return calculateMagnitudeResponse(frequency, this.coefficients)
  }
}

const calculateMagnitudeResponse = (frequency: number, coefficients: Coefficients): number => {
  const { b0, b1, b2, a1, a2, a0 } = coefficients

  const omega = (2 * Math.PI * frequency) / SAMPLE_RATE
  const cosOmega = Math.cos(omega)
  const sinOmega = Math.sin(omega)

  const numerator = Math.sqrt(Math.pow(b0 + b1 * cosOmega + b2 * Math.cos(2 * omega), 2) + Math.pow(b1 * sinOmega + b2 * Math.sin(2 * omega), 2))
  const denominator = Math.sqrt(Math.pow(a0 + a1 * cosOmega + a2 * Math.cos(2 * omega), 2) + Math.pow(a1 * sinOmega + a2 * Math.sin(2 * omega), 2))

  return numerator / denominator
}
