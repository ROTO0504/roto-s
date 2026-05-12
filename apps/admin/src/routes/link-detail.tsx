import { useState } from "react"
import { useLoaderData, useRevalidator, useNavigate } from "react-router"
import { css } from "../../styled-system/css"
import { button, card, input } from "../../styled-system/recipes"
import { api, type Stats, type StatsRow } from "../lib/api"

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const

export async function linkDetailLoader(slug: string) {
  return await api.get<Stats>(`/api/links/${slug}/stats?range=7d`)
}

export function LinkDetailPage() {
  const stats = useLoaderData() as Stats
  const revalidator = useRevalidator()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    url: stats.link.url,
    utm: Object.fromEntries(UTM_KEYS.map((k) => [k, stats.link[k] ?? ""])) as Record<string, string>,
  })

  async function save() {
    const utm: Record<string, string> = {}
    for (const k of UTM_KEYS) utm[k] = form.utm[k]
    await api.patch(`/api/links/${stats.link.slug}`, { url: form.url, utm })
    setEditing(false)
    revalidator.revalidate()
  }

  async function remove() {
    if (!confirm(`Delete /${stats.link.slug}?`)) return
    await api.delete(`/api/links/${stats.link.slug}`)
    navigate("/")
  }

  return (
    <div>
      <header className={css({ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: "6" })}>
        <h1 className={css({ fontSize: "2xl", fontWeight: 600, fontFamily: "monospace" })}>/{stats.link.slug}</h1>
        <div className={css({ display: "flex", gap: "2" })}>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={button({ size: "sm", variant: "outline" })}
            >
              Edit
            </button>
          )}
          <button type="button" onClick={remove} className={button({ size: "sm", variant: "danger" })}>
            Delete
          </button>
        </div>
      </header>

      <div className={css({ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "3", mb: "6" })}>
        <Stat label="Total (range)" value={stats.total} />
        <Stat label="Lifetime" value={stats.link.clicks} />
        <Stat label="Range" value={stats.range} />
        <Stat label="Created" value={new Date(stats.link.created_at).toLocaleDateString()} />
      </div>

      <div className={card() + " " + css({ mb: "6" })}>
        {editing ? (
          <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
            <Field label="Destination URL">
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={input()} />
            </Field>
            <div className={css({ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "3" })}>
              {UTM_KEYS.map((k) => (
                <Field key={k} label={k}>
                  <input
                    value={form.utm[k]}
                    onChange={(e) => setForm({ ...form, utm: { ...form.utm, [k]: e.target.value } })}
                    className={input()}
                  />
                </Field>
              ))}
            </div>
            <div className={css({ display: "flex", gap: "2" })}>
              <button type="button" onClick={save} className={button({ size: "sm" })}>
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className={button({ size: "sm", variant: "ghost" })}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className={css({ fontSize: "xs", color: "gray.400", mb: "1" })}>Destination</p>
            <a
              href={stats.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={css({ wordBreak: "break-all" })}
            >
              {stats.link.url}
            </a>
            {UTM_KEYS.some((k) => stats.link[k]) && (
              <div className={css({ mt: "4", display: "flex", gap: "3", flexWrap: "wrap", fontSize: "xs" })}>
                {UTM_KEYS.map((k) =>
                  stats.link[k] ? (
                    <span
                      key={k}
                      className={css({
                        bg: "gray.800",
                        color: "gray.300",
                        px: "2",
                        py: "1",
                        borderRadius: "sm",
                        fontFamily: "monospace",
                      })}
                    >
                      {k}={stats.link[k]}
                    </span>
                  ) : null,
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={css({ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4" })}>
        <Group title="By day" rows={stats.byDay} />
        <Group title="By country" rows={stats.byCountry} />
        <Group title="By device" rows={stats.byDevice} />
        <Group title="By browser" rows={stats.byBrowser} />
        <Group title="By OS" rows={stats.byOs} />
        <Group title="By referer" rows={stats.byReferer} />
        <Group title="By utm_source" rows={stats.byUtmSource} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className={css({
        bg: "gray.900",
        border: "1px solid",
        borderColor: "gray.800",
        borderRadius: "lg",
        p: "4",
      })}
    >
      <p className={css({ fontSize: "xs", color: "gray.400", mb: "1" })}>{label}</p>
      <p className={css({ fontSize: "xl", fontWeight: 600, fontVariantNumeric: "tabular-nums" })}>{value}</p>
    </div>
  )
}

function Group({ title, rows }: { title: string; rows: StatsRow[] }) {
  return (
    <div className={card()}>
      <h3 className={css({ fontSize: "sm", fontWeight: 500, color: "gray.300", mb: "3" })}>{title}</h3>
      {rows.length === 0 ? (
        <p className={css({ fontSize: "xs", color: "gray.500" })}>データなし</p>
      ) : (
        <ul className={css({ display: "flex", flexDirection: "column", gap: "1" })}>
          {rows.slice(0, 8).map((r) => (
            <li
              key={r.key}
              className={css({
                display: "flex",
                justifyContent: "space-between",
                fontSize: "sm",
                color: "gray.300",
                fontVariantNumeric: "tabular-nums",
              })}
            >
              <span
                className={css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxW: "60%" })}
              >
                {r.key || "—"}
              </span>
              <span>{r.clicks}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={css({ display: "block" })}>
      <span className={css({ display: "block", fontSize: "xs", color: "gray.400", mb: "1" })}>{label}</span>
      {children}
    </label>
  )
}
