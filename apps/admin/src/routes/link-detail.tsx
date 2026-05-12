import { useState } from "react"
import { useLoaderData, useRevalidator, useNavigate } from "react-router"

import { css } from "../../styled-system/css"
import { button, card, input } from "../../styled-system/recipes"
import { Badge } from "../components/Badge"
import { useConfirm } from "../components/ConfirmDialog"
import { Field } from "../components/Field"
import { Group } from "../components/Group"
import { PageHeader } from "../components/PageHeader"
import { Stat } from "../components/Stat"
import { useToast } from "../components/ToastProvider"
import { api, ApiError, type Stats } from "../lib/api"

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const

export const linkDetailLoader = async (slug: string) => api.get<Stats>(`/api/links/${slug}/stats?range=7d`)

export const LinkDetailPage = () => {
  const stats = useLoaderData() as Stats
  const revalidator = useRevalidator()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    url: stats.link.url,
    utm: Object.fromEntries(UTM_KEYS.map((k) => [k, stats.link[k] ?? ""])) as Record<string, string>,
  })

  const save = async () => {
    setBusy(true)
    try {
      const utm: Record<string, string> = {}
      for (const k of UTM_KEYS) utm[k] = form.utm[k]
      await api.patch(`/api/links/${stats.link.slug}`, { url: form.url, utm })
      toast.success("更新しました")
      setEditing(false)
      revalidator.revalidate()
    } catch (e) {
      toast.error(e instanceof ApiError ? `更新に失敗しました (${e.status})` : "更新に失敗しました")
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    const ok = await confirm({
      title: `/${stats.link.slug} を削除しますか？`,
      message: "このリンクと関連する統計は復元できません。",
      confirmLabel: "削除",
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/api/links/${stats.link.slug}`)
      toast.success("削除しました")
      navigate("/")
    } catch (e) {
      toast.error(e instanceof ApiError ? `削除に失敗しました (${e.status})` : "削除に失敗しました")
    }
  }

  const sparkline = stats.byDay.map((d) => d.clicks)

  return (
    <div>
      <PageHeader
        title={`/${stats.link.slug}`}
        description={`${stats.range} のクリック統計`}
        mono
        actions={
          <>
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
          </>
        }
      />

      <div
        className={css({
          display: "grid",
          gridTemplateColumns: {
            base: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: "3",
          mb: "6",
        })}
      >
        <Stat label={`Total (${stats.range})`} value={stats.total.toLocaleString()} sparkline={sparkline} />
        <Stat label="Lifetime" value={stats.link.clicks.toLocaleString()} />
        <Stat label="Range" value={stats.range} />
        <Stat
          label="Created"
          value={new Date(stats.link.created_at).toLocaleDateString()}
          hint={new Date(stats.link.created_at).toLocaleString()}
        />
      </div>

      <div className={card({ size: "lg" }) + " " + css({ mb: "6" })}>
        {editing ? (
          <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
            <Field label="Destination URL">
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className={input()} />
            </Field>
            <div
              className={css({
                display: "grid",
                gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)" },
                gap: "3",
              })}
            >
              {UTM_KEYS.map((k) => (
                <Field key={k} label={k} mono>
                  <input
                    value={form.utm[k]}
                    onChange={(e) => setForm({ ...form, utm: { ...form.utm, [k]: e.target.value } })}
                    className={input()}
                  />
                </Field>
              ))}
            </div>
            <div className={css({ display: "flex", gap: "2" })}>
              <button type="button" onClick={save} disabled={busy} className={button({ size: "sm" })}>
                {busy ? "..." : "Save"}
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
          <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
            <div>
              <p
                className={css({
                  fontSize: "xs",
                  color: "fg.muted",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  mb: "1",
                })}
              >
                Destination
              </p>
              <a
                href={stats.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  wordBreak: "break-all",
                  fontFamily: "mono",
                  fontSize: "sm",
                })}
              >
                {stats.link.url}
              </a>
            </div>
            {UTM_KEYS.some((k) => stats.link[k]) && (
              <div
                className={css({
                  display: "flex",
                  gap: "2",
                  flexWrap: "wrap",
                  pt: "2",
                  borderTop: "1px solid",
                  borderColor: "border.subtle",
                })}
              >
                {UTM_KEYS.map((k) =>
                  stats.link[k] ? (
                    <Badge key={k} tone="accent">
                      <span className={css({ color: "fg.subtle" })}>{k}=</span>
                      {stats.link[k]}
                    </Badge>
                  ) : null,
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className={css({
          display: "grid",
          gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)" },
          gap: "4",
        })}
      >
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
