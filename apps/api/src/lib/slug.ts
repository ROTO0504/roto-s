import { customAlphabet } from 'nanoid'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const generate = customAlphabet(ALPHABET, 6)

const SLUG_RE = /^[A-Za-z0-9_-]{1,32}$/
const RESERVED = new Set(['api', 'health', 'admin', 'assets', 'login', 'logout'])

export function randomSlug(): string {
  return generate()
}

export function validateCustomSlug(slug: string): { ok: true } | { ok: false; reason: string } {
  if (!SLUG_RE.test(slug)) return { ok: false, reason: 'invalid_format' }
  if (RESERVED.has(slug.toLowerCase())) return { ok: false, reason: 'reserved' }
  return { ok: true }
}
