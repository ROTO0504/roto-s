import { Hono } from 'hono'
import type { Bindings, Variables } from '../types'
import {
  buildAuthenticationOptions,
  buildRegistrationOptions,
  verifyAuthentication,
  verifyRegistration,
} from '../lib/passkey'
import {
  challengeCookieHeader,
  clearChallengeCookieHeader,
  clearSessionCookieHeader,
  readChallengeCookie,
  readSessionCookie,
  sessionCookieHeader,
  signChallengeToken,
  signSessionToken,
  verifyChallengeToken,
  verifySessionToken,
} from '../lib/session'
import { requireInviteToken, requireSession } from '../lib/auth'

export const authRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()

function isSecure(env: Bindings): boolean {
  return env.ORIGIN.startsWith('https://')
}

authRoute.get('/me', async (c) => {
  const token = readSessionCookie(c.req.header('cookie'))
  if (!token) return c.json({ ok: false }, 401)
  const ok = await verifySessionToken(c.env.SESSION_SECRET, token)
  return c.json({ ok }, ok ? 200 : 401)
})

authRoute.post('/logout', async (c) => {
  c.header('Set-Cookie', clearSessionCookieHeader(isSecure(c.env)))
  return c.json({ ok: true })
})

// 認証 ----------------------------------------------------
authRoute.post('/login/options', async (c) => {
  const opts = await buildAuthenticationOptions(c.env)
  const challengeToken = await signChallengeToken(c.env.SESSION_SECRET, opts.challenge, 'login')
  c.header('Set-Cookie', challengeCookieHeader(challengeToken, isSecure(c.env)))
  return c.json(opts)
})

authRoute.post('/login/verify', async (c) => {
  const challengeToken = readChallengeCookie(c.req.header('cookie'))
  if (!challengeToken) return c.json({ error: 'no_challenge' }, 400)
  const v = await verifyChallengeToken(c.env.SESSION_SECRET, challengeToken, 'login')
  if (!v.ok) return c.json({ error: 'invalid_challenge' }, 400)

  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'invalid_body' }, 400)

  const result = await verifyAuthentication(c.env, body, v.challenge)
  if (!result.ok) return c.json({ error: result.reason }, 401)

  const session = await signSessionToken(c.env.SESSION_SECRET)
  c.header('Set-Cookie', sessionCookieHeader(session, isSecure(c.env)), { append: true })
  c.header('Set-Cookie', clearChallengeCookieHeader(isSecure(c.env)), { append: true })
  return c.json({ ok: true })
})

// 登録 ----------------------------------------------------
// 既存セッション or INVITE_TOKEN のいずれかで許可
async function allowRegister(env: Bindings, cookieHeader: string | undefined, inviteHeader: string): Promise<boolean> {
  const token = readSessionCookie(cookieHeader)
  if (token && (await verifySessionToken(env.SESSION_SECRET, token))) return true
  const expected = env.INVITE_TOKEN
  if (!expected) return false
  if (inviteHeader.length !== expected.length) return false
  let acc = 0
  for (let i = 0; i < inviteHeader.length; i++) acc |= inviteHeader.charCodeAt(i) ^ expected.charCodeAt(i)
  return acc === 0
}

authRoute.post('/register/options', async (c) => {
  if (!(await allowRegister(c.env, c.req.header('cookie'), c.req.header('x-invite-token') ?? ''))) return c.json({ error: 'forbidden' }, 403)
  const opts = await buildRegistrationOptions(c.env)
  const challengeToken = await signChallengeToken(c.env.SESSION_SECRET, opts.challenge, 'register')
  c.header('Set-Cookie', challengeCookieHeader(challengeToken, isSecure(c.env)))
  return c.json(opts)
})

authRoute.post('/register/verify', async (c) => {
  if (!(await allowRegister(c.env, c.req.header('cookie'), c.req.header('x-invite-token') ?? ''))) return c.json({ error: 'forbidden' }, 403)
  const challengeToken = readChallengeCookie(c.req.header('cookie'))
  if (!challengeToken) return c.json({ error: 'no_challenge' }, 400)
  const v = await verifyChallengeToken(c.env.SESSION_SECRET, challengeToken, 'register')
  if (!v.ok) return c.json({ error: 'invalid_challenge' }, 400)

  const body = await c.req.json<{ response?: unknown; label?: string }>().catch(() => null)
  if (!body || !body.response) return c.json({ error: 'invalid_body' }, 400)

  const result = await verifyRegistration(c.env, body.response as never, v.challenge, body.label)
  if (!result.ok) return c.json({ error: result.reason }, 400)

  const session = await signSessionToken(c.env.SESSION_SECRET)
  c.header('Set-Cookie', sessionCookieHeader(session, isSecure(c.env)), { append: true })
  c.header('Set-Cookie', clearChallengeCookieHeader(isSecure(c.env)), { append: true })
  return c.json({ ok: true })
})

// パスキー管理 -------------------------------------------
const passkeysRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()
passkeysRoute.use('*', requireSession)

passkeysRoute.get('/', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT credential_id, label, created_at, last_used_at FROM passkeys ORDER BY created_at DESC')
    .all()
  return c.json({ passkeys: results ?? [] })
})

passkeysRoute.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const count = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM passkeys').first<{ n: number }>()
  if ((count?.n ?? 0) <= 1) return c.json({ error: 'last_passkey' }, 400)
  const result = await c.env.DB.prepare('DELETE FROM passkeys WHERE credential_id = ?').bind(id).run()
  if (result.meta.changes === 0) return c.json({ error: 'not_found' }, 404)
  return c.json({ ok: true })
})

authRoute.route('/passkeys', passkeysRoute)

// 初回ブートストラップ判定（パスキー0件のときだけ true）
authRoute.get('/bootstrap', async (c) => {
  const row = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM passkeys').first<{ n: number }>()
  const empty = (row?.n ?? 0) === 0
  return c.json({ empty, inviteEnabled: Boolean(c.env.INVITE_TOKEN) })
})

export const _requireInviteToken = requireInviteToken
