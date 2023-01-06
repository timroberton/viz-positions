export function vizAssert(condition: any, errMessage?: string): void {
  if (!condition) {
    throw new Error(errMessage || "Should not be possible");
  }
}

export function sum(arr: number[]): number {
  return arr.reduce((prev: number, v: number) => prev + v, 0);
}

export function sumWith<T>(arr: T[], func: (v: T) => number): number {
  return arr.reduce((prev: number, v: T) => prev + func(v), 0);
}
