import type {Position} from "./types"

export class Grid<T> {
  public static readonly size = 7

  private data: T[]

  public static fromList<T>(list: Array<Position & {v: T}>) {
    const grid = new Grid<T>()
    for (const {y, x, v} of list) {
      grid.set({y, x}, v)
    }
    return grid
  }

  private constructor(data?: T[]) {
    this.data = data ?? []
  }

  public get({y, x}: Position): T | undefined {
    return this.data[y * Grid.size + x]
  }

  public set({y, x}: Position, value: T) {
    this.data[y * Grid.size + x] = value
  }

  public delete({y, x}: Position) {
    delete this.data[y * Grid.size + x]
  }

  public forEach(fn: (p: Position, value: T) => void) {
    for (let y = 0; y < Grid.size; y++) {
      for (let x = 0; x < Grid.size; x++) {
        const p = {y, x}
        const value = this.get(p)
        if (value !== undefined) fn(p, value)
      }
    }
  }

  public entries() {
    const entries: Array<[Position, T]> = []

    for (let i = 0; i < Grid.size * Grid.size; i++) {
      const value: T | undefined = this.data[i]
      if (value !== undefined) {
        const position: Position = {
          y: Math.floor(i / Grid.size),
          x: i % Grid.size,
        }
        entries.push([position, value])
      }
    }

    return entries
  }

  public clone() {
    return new Grid([...this.data])
  }
}
