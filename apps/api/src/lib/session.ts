import { bytesToBase64Url, base64UrlToBytes } from "./base64"

const SESSION_COOKIE = "roto_s_session"
const CHALLENGE_COOKIE = "roto_s_challenge"
const SESSION_TTL_SEC = 60 * 60 * 24 * 7
const CHALLENGE_TTL_SEC = 60 * 5

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  return bytesToBase64Url(new Uint8Array(sig))
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let acc = 0
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return acc === 0
}

export async function signSessionToken(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ exp })))
  const sig = await hmac(secret, payload)
  return `${payload}.${sig}`
}

export async function verifySessionToken(secret: string, token: string): Promise<boolean> {
  const dot = token.indexOf(".")
  if (dot < 0) return false
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = await hmac(secret, payload)
  if (!timingSafeEqual(sig, expected)) return false
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)))
    return typeof json.exp === "number" && json.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function sessionCookieHeader(token: string, secure: boolean): string {
  const parts = [`${SESSION_COOKIE}=${token}`, "HttpOnly", "Path=/", "SameSite=Lax", `Max-Age=${SESSION_TTL_SEC}`]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export function clearSessionCookieHeader(secure: boolean): string {
  const parts = [`${SESSION_COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export function readSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=")
    if (k === SESSION_COOKIE) return rest.join("=")
  }
  return null
}

export async function signChallengeToken(
  secret: string,
  challenge: string,
  kind: "register" | "login",
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + CHALLENGE_TTL_SEC
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ challenge, kind, exp })))
  const sig = await hmac(secret, payload)
  return `${payload}.${sig}`
}

export async function verifyChallengeToken(
  secret: string,
  token: string,
  kind: "register" | "login",
): Promise<{ ok: true; challenge: string } | { ok: false }> {
  const dot = token.indexOf(".")
  if (dot < 0) return { ok: false }
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = await hmac(secret, payload)
  if (!timingSafeEqual(sig, expected)) return { ok: false }
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload)))
    if (json.kind !== kind) return { ok: false }
    if (typeof json.exp !== "number" || json.exp <= Math.floor(Date.now() / 1000)) return { ok: false }
    return { ok: true, challenge: String(json.challenge) }
  } catch {
    return { ok: false }
  }
}

export function challengeCookieHeader(token: string, secure: boolean): string {
  const parts = [`${CHALLENGE_COOKIE}=${token}`, "HttpOnly", "Path=/", "SameSite=Lax", `Max-Age=${CHALLENGE_TTL_SEC}`]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export function clearChallengeCookieHeader(secure: boolean): string {
  const parts = [`${CHALLENGE_COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export function readChallengeCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=")
    if (k === CHALLENGE_COOKIE) return rest.join("=")
  }
  return null
}
