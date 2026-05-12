import { useGSAP } from "@gsap/react"
import { useRef, useState } from "react"
import { useNavigate } from "react-router"

import { css } from "../../styled-system/css"
import { button, card, input } from "../../styled-system/recipes"
import { Field } from "../components/Field"
import { PageHeader } from "../components/PageHeader"
import { useToast } from "../components/ToastProvider"
import { fadeIn } from "../lib/animations"
import { api, ApiError } from "../lib/api"

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const

export const NewPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const formRef = useRef<HTMLDivElement>(null)
  const [showUtm, setShowUtm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<{ slug: string; shortUrl: string } | null>(null)
  const [form, setForm] = useState<{ url: string; slug: string; utm: Record<string, string> }>({
    url: "",
    slug: "",
    utm: { utm_source: "", utm_medium: "", utm_campaign: "", utm_term: "", utm_content: "" },
  })

  useGSAP(
    () => {
      if (formRef.current) fadeIn(formRef.current)
    },
    { scope: formRef },
  )

  const submit = async () => {
    setBusy(true)
    setError("")
    try {
      const utm = Object.fromEntries(UTM_KEYS.map((k) => [k, form.utm[k]]).filter(([, v]) => v))
      const payload = {
        url: form.url,
        slug: form.slug || undefined,
        utm: Object.keys(utm).length > 0 ? utm : undefined,
      }
      const res = await api.post<{ slug: string; shortUrl: string }>("/api/links", payload)
      setCreated(res)
      toast.success("リンクを作成しました")
    } catch (e) {
      const msg = e instanceof ApiError ? `${e.status}: ${e.body}` : (e as Error).message
      setError(msg)
      toast.error("作成に失敗しました")
    } finally {
      setBusy(false)
    }
  }

  const copyShort = async () => {
    if (!created) return
    await navigator.clipboard.writeText(created.shortUrl)
    toast.success("コピーしました")
  }

  return (
    <div>
      <PageHeader title="New link" description="目的地 URL を指定して短縮リンクを作成します" />
      <div
        ref={formRef}
        className={card({ size: "lg" }) + " " + css({ display: "flex", flexDirection: "column", gap: "4" })}
      >
        <Field label="Destination URL *">
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://example.com/long/path"
            className={input()}
            type="url"
          />
        </Field>
        <Field label="Custom slug (optional)" hint="未指定の場合は自動生成されます">
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="my-link"
            className={input()}
          />
        </Field>

        <button
          type="button"
          onClick={() => setShowUtm((s) => !s)}
          className={button({ variant: "ghost", size: "sm" }) + " " + css({ alignSelf: "flex-start" })}
          aria-expanded={showUtm}
        >
          {showUtm ? "− UTM parameters を閉じる" : "+ UTM parameters を追加"}
        </button>
        {showUtm && (
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)" },
              gap: "3",
              p: "3",
              bg: "bg.subtle",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "border.subtle",
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
        )}

        <div
          className={css({
            display: "flex",
            flexDirection: { base: "column-reverse", sm: "row" },
            gap: "2",
            mt: "2",
          })}
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className={button({ variant: "ghost" }) + " " + css({ width: { base: "100%", sm: "auto" } })}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={busy || !form.url}
            className={button() + " " + css({ width: { base: "100%", sm: "auto" } })}
          >
            {busy ? "作成中..." : "Create"}
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className={css({
              color: "danger.default",
              bg: "danger.subtle",
              border: "1px solid",
              borderColor: "danger.border",
              borderRadius: "md",
              px: "3",
              py: "2",
              fontSize: "xs",
            })}
          >
            {error}
          </p>
        )}
      </div>

      {created && (
        <div
          className={css({
            mt: "4",
            display: "flex",
            flexDirection: { base: "column", sm: "row" },
            alignItems: { base: "flex-start", sm: "center" },
            gap: "3",
            bg: "bg.surfaceRaised",
            border: "1px solid",
            borderColor: "accent.border",
            borderRadius: "lg",
            p: "4",
            boxShadow: "glow",
          })}
        >
          <div className={css({ flex: 1, minW: 0 })}>
            <p className={css({ fontSize: "xs", color: "fg.muted", mb: "1" })}>作成済み</p>
            <p
              className={css({
                fontFamily: "mono",
                color: "accent.default",
                fontSize: "sm",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              })}
            >
              {created.shortUrl}
            </p>
          </div>
          <div className={css({ display: "flex", gap: "2" })}>
            <button type="button" onClick={copyShort} className={button({ size: "sm", variant: "outline" })}>
              Copy
            </button>
            <button type="button" onClick={() => navigate("/")} className={button({ size: "sm" })}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
