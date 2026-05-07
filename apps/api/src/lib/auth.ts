import type { MiddlewareHandler } from 'hono'
import type { Bindings, Variables } from '../types'
import { readSessionCookie, verifySessionToken } from './session'

export const requireSession: MiddlewareHandler<{ Bindings: Bindings; Variables: Variables }> = async (c, next) => {
  const token = readSessionCookie(c.req.header('cookie'))
  if (!token) return c.json({ error: 'unauthorized' }, 401)
  const ok = await verifySessionToken(c.env.SESSION_SECRET, token)
  if (!ok) return c.json({ error: 'unauthorized' }, 401)
  c.set('authed', true)
  await next()
}

export const requireInviteToken: MiddlewareHandler<{ Bindings: Bindings; Variables: Variables }> = async (c, next) => {
  const expected = c.env.INVITE_TOKEN
  if (!expected) return c.json({ error: 'invite_disabled' }, 403)
  const provided = c.req.header('x-invite-token') ?? ''
  if (provided.length !== expected.length) return c.json({ error: 'forbidden' }, 403)
  let acc = 0
  for (let i = 0; i < provided.length; i++) acc |= provided.charCodeAt(i) ^ expected.charCodeAt(i)
  if (acc !== 0) return c.json({ error: 'forbidden' }, 403)
  await next()
}
