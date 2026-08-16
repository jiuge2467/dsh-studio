/**
 * @module dsh-mascot-pet/invariant
 * @description Invariant helpers and assertion utilities for dsh-mascot-pet.
 */

export function invariant(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ? `[dsh-mascot-pet] Invariant failed: ${message}` : '[dsh-mascot-pet] Invariant failed')
  }
}

export function assertNever(value: never, message = `Unhandled discriminant: ${String(value)}`): never {
  throw new Error(`[dsh-mascot-pet] ${message}`)
}
