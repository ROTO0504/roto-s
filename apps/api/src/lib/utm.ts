import type { Link } from '../types'

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
export type UtmKey = (typeof UTM_KEYS)[number]

export function buildDestUrl(link: Link, reqUrl: URL): string {
  const dest = new URL(link.url)
  for (const k of UTM_KEYS) {
    const fromQuery = reqUrl.searchParams.get(k)
    const fromStored = link[k]
    const v = fromQuery ?? fromStored
    if (v) dest.searchParams.set(k, v)
  }
  return dest.toString()
}

export function pickUtmFromRequest(link: Link, reqUrl: URL): Record<UtmKey, string> {
  const out = {} as Record<UtmKey, string>
  for (const k of UTM_KEYS) {
    out[k] = reqUrl.searchParams.get(k) ?? link[k] ?? ''
  }
  return out
}
