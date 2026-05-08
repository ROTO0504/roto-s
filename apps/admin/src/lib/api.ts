async function request<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text)
  }
  return (await res.json()) as T
}

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API ${status}`)
  }
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) => request<T>('POST', path, body, headers),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}

export type Link = {
  slug: string
  url: string
  created_at: number
  clicks: number
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
}

export type StatsRow = { key: string; clicks: number }

export type Stats = {
  link: Link
  range: string
  total: number
  byDay: StatsRow[]
  byCountry: StatsRow[]
  byDevice: StatsRow[]
  byBrowser: StatsRow[]
  byOs: StatsRow[]
  byReferer: StatsRow[]
  byUtmSource: StatsRow[]
}

export type PasskeyRow = {
  credential_id: string
  label: string | null
  created_at: number
  last_used_at: number | null
}
