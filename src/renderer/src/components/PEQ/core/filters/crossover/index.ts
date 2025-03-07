import { BaseFilter, BaseFilterParams } from '../index'

interface CrossoverFilterParams extends BaseFilterParams {
  frequency: number
  sampleRate: number
}

export abstract class CrossoverFilter extends BaseFilter<CrossoverFilterParams> {
  protected lowPass: BaseFilter
  protected highPass: BaseFilter

  constructor(params: CrossoverFilterParams) {
    super(params)
    this.lowPass = this.createLowPass(params)
    this.highPass = this.createHighPass(params)
  }

  protected abstract createLowPass(params: CrossoverFilterParams): BaseFilter
  protected abstract createHighPass(params: CrossoverFilterParams): BaseFilter

  setFrequency(frequency: number) {
    super.setFrequency(frequency)
    this.lowPass.setFrequency(frequency)
    this.highPass.setFrequency(frequency)
  }

  public calculateCoefficients(): void {
    this.lowPass?.calculateCoefficients()
    this.highPass?.calculateCoefficients()
  }

  calculateLowPassResponse(frequency: number): number {
    return this.lowPass.calculateFrequencyResponse(frequency)
  }

  calculateHighPassResponse(frequency: number): number {
    return this.highPass.calculateFrequencyResponse(frequency)
  }
}

export class LR12Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass2({ ...params, Q: 0.5 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass2({ ...params, Q: 0.5 })
  }
}
export class LR24Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass4({ ...params, Q: 0.707 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass4({ ...params, Q: 0.707 })
  }
}

export class BW12Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass2({ ...params, Q: 0.707 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass2({ ...params, Q: 0.707 })
  }
}

export class BW24Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass4({ ...params, Q: 0.707 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass4({ ...params, Q: 0.707 })
  }
}

export class BW6Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass1({ ...params, Q: 0.707 })
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass1({ ...params, Q: 0.707 })
  }
}

export class BW18Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass3(params)
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass3(params)
  }
}

export class BW30Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass5(params)
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass5(params)
  }
}

export class BW36Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass6(params)
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass6(params)
  }
}

export class BW42Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass7(params)
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass7(params)
  }
}

export class BW48Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthLowPass8(params)
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new ButterworthHighPass8(params)
  }
}

export class LR36Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new LRLowPass6(params)
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new LRHighPass6(params)
  }
}

export class LR48Filter extends CrossoverFilter {
  protected createLowPass(params: CrossoverFilterParams): BaseFilter {
    return new LRLowPass8(params)
  }

  protected createHighPass(params: CrossoverFilterParams): BaseFilter {
    return new LRHighPass8(params)
  }
}

class ButterworthFilter extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  calculateCoefficients(): void {
    const { frequency, sampleRate, Q } = this.params
    const omega = (2 * Math.PI * frequency) / sampleRate
    const cosOmega = Math.cos(omega)
    const alpha = Math.sin(omega) / (2 * Q)

    this.calculateFilterCoefficients?.(cosOmega, alpha)

    // Normalize coefficients
    this.b0 /= this.a0
    this.b1 /= this.a0
    this.b2 /= this.a0
    this.a1 /= this.a0
    this.a2 /= this.a0
    this.a0 = 1
  }

  calculateFilterCoefficients(cosOmega: number, alpha: number): void {
    // To be implemented by subclasses
  }
}

class ButterworthLowPass2 extends ButterworthFilter {
  calculateFilterCoefficients(cosOmega: number, alpha: number): void {
    this.b0 = (1 - cosOmega) / 2
    this.b1 = 1 - cosOmega
    this.b2 = (1 - cosOmega) / 2
    this.a0 = 1 + alpha
    this.a1 = -2 * cosOmega
    this.a2 = 1 - alpha
  }
}

class ButterworthHighPass2 extends ButterworthFilter {
  calculateFilterCoefficients(cosOmega: number, alpha: number): void {
    this.b0 = (1 + cosOmega) / 2
    this.b1 = -(1 + cosOmega)
    this.b2 = (1 + cosOmega) / 2
    this.a0 = 1 + alpha
    this.a1 = -2 * cosOmega
    this.a2 = 1 - alpha
  }
}

class ButterworthLowPass4 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass2
  private stage2: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q: number }) {
    super(params)
    this.stage1 = new ButterworthLowPass2({ ...params, Q: 0.5412 }) // Correct Q values for 4th order
    this.stage2 = new ButterworthLowPass2({ ...params, Q: 1.3066 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    return response1 * response2
  }
}

class ButterworthHighPass4 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass2
  private stage2: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q: number }) {
    super(params)
    this.stage1 = new ButterworthHighPass2({ ...params, Q: 0.5412 }) // Correct Q values for 4th order
    this.stage2 = new ButterworthHighPass2({ ...params, Q: 1.3066 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    return response1 * response2
  }
}

class ButterworthLowPass1 extends ButterworthFilter {
  calculateFilterCoefficients(cosOmega: number, alpha: number): void {
    const b1 = 1 - cosOmega
    this.b0 = b1 / 2
    this.b1 = b1
    this.b2 = b1 / 2
    this.a0 = 1 + alpha
    this.a1 = -2 * cosOmega
    this.a2 = 1 - alpha
  }
}

class ButterworthHighPass1 extends ButterworthFilter {
  calculateFilterCoefficients(cosOmega: number, alpha: number): void {
    const b1 = 1 + cosOmega
    this.b0 = b1 / 2
    this.b1 = -b1
    this.b2 = b1 / 2
    this.a0 = 1 + alpha
    this.a1 = -2 * cosOmega
    this.a2 = 1 - alpha
  }
}

class ButterworthLowPass3 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass1
  private stage2: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthLowPass1({ ...params, Q: 0.707 })
    this.stage2 = new ButterworthLowPass2({ ...params, Q: 1.0 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    return response1 * response2
  }
}

class ButterworthHighPass3 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass1
  private stage2: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthHighPass1({ ...params, Q: 0.707 })
    this.stage2 = new ButterworthHighPass2({ ...params, Q: 1.0 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    return response1 * response2
  }
}

class ButterworthLowPass5 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass1
  private stage2: ButterworthLowPass2
  private stage3: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthLowPass1({ ...params, Q: 0.707 })
    this.stage2 = new ButterworthLowPass2({ ...params, Q: 0.618 })
    this.stage3 = new ButterworthLowPass2({ ...params, Q: 1.618 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3
  }
}

class ButterworthHighPass5 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass1
  private stage2: ButterworthHighPass2
  private stage3: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthHighPass1({ ...params, Q: 0.707 })
    this.stage2 = new ButterworthHighPass2({ ...params, Q: 0.618 })
    this.stage3 = new ButterworthHighPass2({ ...params, Q: 1.618 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3
  }
}

class ButterworthLowPass6 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass2
  private stage2: ButterworthLowPass2
  private stage3: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthLowPass2({ ...params, Q: 0.5176 })
    this.stage2 = new ButterworthLowPass2({ ...params, Q: 0.7071 })
    this.stage3 = new ButterworthLowPass2({ ...params, Q: 1.9319 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3
  }
}

class ButterworthHighPass6 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass2
  private stage2: ButterworthHighPass2
  private stage3: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthHighPass2({ ...params, Q: 0.5176 })
    this.stage2 = new ButterworthHighPass2({ ...params, Q: 0.7071 })
    this.stage3 = new ButterworthHighPass2({ ...params, Q: 1.9319 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3
  }
}

class ButterworthLowPass7 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass1
  private stage2: ButterworthLowPass2
  private stage3: ButterworthLowPass2
  private stage4: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthLowPass1({ ...params, Q: 0.707 })
    this.stage2 = new ButterworthLowPass2({ ...params, Q: 0.5559 })
    this.stage3 = new ButterworthLowPass2({ ...params, Q: 0.8019 })
    this.stage4 = new ButterworthLowPass2({ ...params, Q: 2.2472 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
    this.stage4?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    const response4 = this.stage4.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3 * response4
  }
}

class ButterworthHighPass7 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass1
  private stage2: ButterworthHighPass2
  private stage3: ButterworthHighPass2
  private stage4: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthHighPass1({ ...params, Q: 0.707 })
    this.stage2 = new ButterworthHighPass2({ ...params, Q: 0.5559 })
    this.stage3 = new ButterworthHighPass2({ ...params, Q: 0.8019 })
    this.stage4 = new ButterworthHighPass2({ ...params, Q: 2.2472 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
    this.stage4?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    const response4 = this.stage4.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3 * response4
  }
}

class ButterworthLowPass8 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass2
  private stage2: ButterworthLowPass2
  private stage3: ButterworthLowPass2
  private stage4: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthLowPass2({ ...params, Q: 0.5098 })
    this.stage2 = new ButterworthLowPass2({ ...params, Q: 0.6013 })
    this.stage3 = new ButterworthLowPass2({ ...params, Q: 0.8999 })
    this.stage4 = new ButterworthLowPass2({ ...params, Q: 2.5628 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
    this.stage4?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    const response4 = this.stage4.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3 * response4
  }
}

class ButterworthHighPass8 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass2
  private stage2: ButterworthHighPass2
  private stage3: ButterworthHighPass2
  private stage4: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthHighPass2({ ...params, Q: 0.5098 })
    this.stage2 = new ButterworthHighPass2({ ...params, Q: 0.6013 })
    this.stage3 = new ButterworthHighPass2({ ...params, Q: 0.8999 })
    this.stage4 = new ButterworthHighPass2({ ...params, Q: 2.5628 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
    this.stage4?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    const response4 = this.stage4.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3 * response4
  }
}

class LRLowPass6 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass2
  private stage2: ButterworthLowPass2
  private stage3: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthLowPass2({ ...params, Q: 0.5 })
    this.stage2 = new ButterworthLowPass2({ ...params, Q: 0.5 })
    this.stage3 = new ButterworthLowPass2({ ...params, Q: 0.5 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3
  }
}

class LRHighPass6 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass2
  private stage2: ButterworthHighPass2
  private stage3: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthHighPass2({ ...params, Q: 0.5 })
    this.stage2 = new ButterworthHighPass2({ ...params, Q: 0.5 })
    this.stage3 = new ButterworthHighPass2({ ...params, Q: 0.5 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3
  }
}

class LRLowPass8 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthLowPass2
  private stage2: ButterworthLowPass2
  private stage3: ButterworthLowPass2
  private stage4: ButterworthLowPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthLowPass2({ ...params, Q: 0.5 })
    this.stage2 = new ButterworthLowPass2({ ...params, Q: 0.5 })
    this.stage3 = new ButterworthLowPass2({ ...params, Q: 0.5 })
    this.stage4 = new ButterworthLowPass2({ ...params, Q: 0.5 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
    this.stage4?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    const response4 = this.stage4.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3 * response4
  }
}

class LRHighPass8 extends BaseFilter<CrossoverFilterParams & { Q: number }> {
  private stage1: ButterworthHighPass2
  private stage2: ButterworthHighPass2
  private stage3: ButterworthHighPass2
  private stage4: ButterworthHighPass2

  constructor(params: CrossoverFilterParams & { Q?: number }) {
    super(params as CrossoverFilterParams & { Q: number })
    this.stage1 = new ButterworthHighPass2({ ...params, Q: 0.5 })
    this.stage2 = new ButterworthHighPass2({ ...params, Q: 0.5 })
    this.stage3 = new ButterworthHighPass2({ ...params, Q: 0.5 })
    this.stage4 = new ButterworthHighPass2({ ...params, Q: 0.5 })
  }

  calculateCoefficients(): void {
    this.stage1?.calculateCoefficients()
    this.stage2?.calculateCoefficients()
    this.stage3?.calculateCoefficients()
    this.stage4?.calculateCoefficients()
  }

  calculateFrequencyResponse(frequency: number): number {
    const response1 = this.stage1.calculateFrequencyResponse(frequency)
    const response2 = this.stage2.calculateFrequencyResponse(frequency)
    const response3 = this.stage3.calculateFrequencyResponse(frequency)
    const response4 = this.stage4.calculateFrequencyResponse(frequency)
    return response1 * response2 * response3 * response4
  }
}
