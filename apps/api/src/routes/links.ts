import { Hono } from 'hono'
import type { Bindings, Link, Variables } from '../types'
import { requireSession } from '../lib/auth'
import { randomSlug, validateCustomSlug } from '../lib/slug'
import { validateDestinationUrl } from '../lib/validate'
import { UTM_KEYS } from '../lib/utm'
import * as ae from '../lib/ae'

export const linksRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()

linksRoute.use('*', requireSession)

type CreateBody = {
  url?: string
  slug?: string
  utm?: Partial<Record<(typeof UTM_KEYS)[number], string>>
}

linksRoute.post('/', async (c) => {
  const body = await c.req.json<CreateBody>().catch(() => ({} as CreateBody))
  const url = (body.url ?? '').trim()
  if (!url) return c.json({ error: 'url_required' }, 400)

  const selfHost = new URL(c.env.ORIGIN).host
  const v = validateDestinationUrl(url, selfHost)
  if (!v.ok) return c.json({ error: v.reason }, 400)

  const utm = body.utm ?? {}
  const utmValues = UTM_KEYS.map((k) => (utm[k] ?? '').toString().trim() || null)

  if (body.slug) {
    const sv = validateCustomSlug(body.slug)
    if (!sv.ok) return c.json({ error: sv.reason }, 400)
    const exists = await c.env.DB
      .prepare('SELECT slug FROM links WHERE slug = ?')
      .bind(body.slug)
      .first()
    if (exists) return c.json({ error: 'slug_taken' }, 409)
    await c.env.DB
      .prepare(
        `INSERT INTO links (slug, url, created_at, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(body.slug, v.url, Date.now(), ...utmValues)
      .run()
    return c.json({ slug: body.slug, shortUrl: `${c.env.ORIGIN}/${body.slug}` }, 201)
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = randomSlug()
    try {
      await c.env.DB
        .prepare(
          `INSERT INTO links (slug, url, created_at, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(slug, v.url, Date.now(), ...utmValues)
        .run()
      return c.json({ slug, shortUrl: `${c.env.ORIGIN}/${slug}` }, 201)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!/UNIQUE/i.test(msg)) throw e
    }
  }
  return c.json({ error: 'slug_collision' }, 500)
})

linksRoute.get('/', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM links ORDER BY created_at DESC LIMIT 200')
    .all<Link>()
  return c.json({ links: results ?? [] })
})

linksRoute.patch('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const body = await c.req.json<CreateBody>().catch(() => ({} as CreateBody))
  const sets: string[] = []
  const params: unknown[] = []

  if (typeof body.url === 'string') {
    const selfHost = new URL(c.env.ORIGIN).host
    const v = validateDestinationUrl(body.url, selfHost)
    if (!v.ok) return c.json({ error: v.reason }, 400)
    sets.push('url = ?')
    params.push(v.url)
  }
  if (body.utm) {
    for (const k of UTM_KEYS) {
      if (k in body.utm) {
        const val = (body.utm[k] ?? '').toString().trim()
        sets.push(`${k} = ?`)
        params.push(val || null)
      }
    }
  }
  if (sets.length === 0) return c.json({ error: 'no_fields' }, 400)
  params.push(slug)

  const result = await c.env.DB
    .prepare(`UPDATE links SET ${sets.join(', ')} WHERE slug = ?`)
    .bind(...params)
    .run()
  if (result.meta.changes === 0) return c.json({ error: 'not_found' }, 404)
  return c.json({ ok: true })
})

linksRoute.delete('/:slug', async (c) => {
  const slug = c.req.param('slug')
  const result = await c.env.DB.prepare('DELETE FROM links WHERE slug = ?').bind(slug).run()
  if (result.meta.changes === 0) return c.json({ error: 'not_found' }, 404)
  return c.json({ ok: true })
})

linksRoute.get('/:slug/stats', async (c) => {
  const slug = c.req.param('slug')
  const range = c.req.query('range') ?? '7d'
  const link = await c.env.DB
    .prepare('SELECT * FROM links WHERE slug = ?')
    .bind(slug)
    .first<Link>()
  if (!link) return c.json({ error: 'not_found' }, 404)

  const [total, byDay, byCountry, byDevice, byBrowser, byOs, byReferer, byUtmSource] = await Promise.all([
    ae.totalClicks(c.env, slug, range),
    ae.statsByDay(c.env, slug, range),
    ae.statsByCountry(c.env, slug, range),
    ae.statsByDevice(c.env, slug, range),
    ae.statsByBrowser(c.env, slug, range),
    ae.statsByOs(c.env, slug, range),
    ae.statsByReferer(c.env, slug, range),
    ae.statsByUtmSource(c.env, slug, range),
  ])

  return c.json({
    link,
    range,
    total,
    byDay,
    byCountry,
    byDevice,
    byBrowser,
    byOs,
    byReferer,
    byUtmSource,
  })
})
