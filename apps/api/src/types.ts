export type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
  AE: AnalyticsEngineDataset
  SESSION_SECRET: string
  INVITE_TOKEN?: string
  RP_ID: string
  RP_NAME: string
  ORIGIN: string
  CF_ACCOUNT_ID?: string
  CF_API_TOKEN?: string
}

export type Variables = {
  authed: boolean
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
  expires_at: number | null
  password_hash: string | null
}

export type Passkey = {
  credential_id: string
  public_key: string
  counter: number
  transports: string | null
  label: string | null
  created_at: number
  last_used_at: number | null
}
