export type FilterChangeEvent = {
  index: number
  frequency: number
  gain: number
  q?: number
  slope?: number
}

export interface FilterEvents {
  filterChanged: (event: FilterChangeEvent) => void
}
