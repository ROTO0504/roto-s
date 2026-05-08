import type { Bindings } from '../types'

export type StatsRow = { key: string; clicks: number }

async function runSQL<T = Record<string, unknown>>(env: Bindings, sql: string): Promise<T[]> {
  if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN) return []
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/analytics_engine/sql`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CF_API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sql,
    },
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: T[] }
  return json.data ?? []
}

function rangeToInterval(range: string): string {
  const m = /^(\d+)([dh])$/.exec(range)
  if (!m) return "INTERVAL '7' DAY"
  const n = m[1]
  const unit = m[2] === 'h' ? 'HOUR' : 'DAY'
  return `INTERVAL '${n}' ${unit}`
}

const DATASET = 'roto_s_clicks'

function escapeLiteral(s: string): string {
  return s.replaceAll("'", "''")
}

async function groupBy(env: Bindings, slug: string, range: string, blobIndex: number, alias: string): Promise<StatsRow[]> {
  const interval = rangeToInterval(range)
  const sql = `SELECT blob${blobIndex} AS ${alias}, SUM(_sample_interval) AS clicks
    FROM ${DATASET}
    WHERE index1 = '${escapeLiteral(slug)}' AND timestamp > NOW() - ${interval}
    GROUP BY ${alias}
    ORDER BY clicks DESC
    LIMIT 50`
  const rows = await runSQL<Record<string, string | number>>(env, sql)
  return rows.map((r) => ({ key: String(r[alias] ?? ''), clicks: Number(r.clicks ?? 0) }))
}

export async function statsByCountry(env: Bindings, slug: string, range: string): Promise<StatsRow[]> {
  return groupBy(env, slug, range, 1, 'country')
}
export async function statsByDevice(env: Bindings, slug: string, range: string): Promise<StatsRow[]> {
  return groupBy(env, slug, range, 4, 'device')
}
export async function statsByBrowser(env: Bindings, slug: string, range: string): Promise<StatsRow[]> {
  return groupBy(env, slug, range, 5, 'browser')
}
export async function statsByOs(env: Bindings, slug: string, range: string): Promise<StatsRow[]> {
  return groupBy(env, slug, range, 6, 'os')
}
export async function statsByReferer(env: Bindings, slug: string, range: string): Promise<StatsRow[]> {
  return groupBy(env, slug, range, 7, 'referer')
}
export async function statsByUtmSource(env: Bindings, slug: string, range: string): Promise<StatsRow[]> {
  return groupBy(env, slug, range, 9, 'utm_source')
}

export async function statsByDay(env: Bindings, slug: string, range: string): Promise<StatsRow[]> {
  const interval = rangeToInterval(range)
  const sql = `SELECT toStartOfDay(timestamp) AS day, SUM(_sample_interval) AS clicks
    FROM ${DATASET}
    WHERE index1 = '${escapeLiteral(slug)}' AND timestamp > NOW() - ${interval}
    GROUP BY day
    ORDER BY day ASC`
  const rows = await runSQL<{ day: string; clicks: number | string }>(env, sql)
  return rows.map((r) => ({ key: String(r.day), clicks: Number(r.clicks ?? 0) }))
}

export async function totalClicks(env: Bindings, slug: string, range: string): Promise<number> {
  const interval = rangeToInterval(range)
  const sql = `SELECT SUM(_sample_interval) AS clicks
    FROM ${DATASET}
    WHERE index1 = '${escapeLiteral(slug)}' AND timestamp > NOW() - ${interval}`
  const rows = await runSQL<{ clicks: number | string }>(env, sql)
  return Number(rows[0]?.clicks ?? 0)
}
