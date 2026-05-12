import { useGSAP } from "@gsap/react"
import { useRef, useState } from "react"
import { useNavigate } from "react-router"

import { css } from "../../styled-system/css"
import { button, card, input } from "../../styled-system/recipes"
import { fadeIn, slideToast } from "../lib/animations"
import { api, ApiError } from "../lib/api"

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const

export function NewPage() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLDivElement>(null)
  const toastRef = useRef<HTMLDivElement>(null)
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

  useGSAP(
    () => {
      if (created && toastRef.current) slideToast(toastRef.current)
    },
    { dependencies: [created?.slug] },
  )

  async function submit() {
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
    } catch (e) {
      setError(e instanceof ApiError ? `${e.status}: ${e.body}` : (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function copyShort() {
    if (!created) return
    await navigator.clipboard.writeText(created.shortUrl)
  }

  return (
    <div>
      <h1 className={css({ fontSize: "2xl", fontWeight: 600, mb: "6" })}>New link</h1>
      <div ref={formRef} className={card() + " " + css({ display: "flex", flexDirection: "column", gap: "4" })}>
        <Field label="Destination URL *">
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://example.com/long/path"
            className={input()}
            type="url"
          />
        </Field>
        <Field label="Custom slug (optional)">
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
        >
          {showUtm ? "−" : "+"} UTM parameters
        </button>
        {showUtm && (
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
        )}

        <div className={css({ display: "flex", gap: "3", mt: "2" })}>
          <button type="button" onClick={submit} disabled={busy} className={button()}>
            {busy ? "..." : "Create"}
          </button>
          <button type="button" onClick={() => navigate("/")} className={button({ variant: "ghost" })}>
            Cancel
          </button>
        </div>
        {error && <p className={css({ color: "red.400", fontSize: "xs" })}>{error}</p>}
      </div>

      {created && (
        <div
          ref={toastRef}
          className={css({
            position: "fixed",
            bottom: "6",
            right: "6",
            bg: "gray.900",
            border: "1px solid",
            borderColor: "accent.500",
            borderRadius: "lg",
            p: "4",
            display: "flex",
            gap: "3",
            alignItems: "center",
            fontSize: "sm",
          })}
        >
          <span className={css({ fontFamily: "monospace", color: "accent.400" })}>{created.shortUrl}</span>
          <button type="button" onClick={copyShort} className={button({ size: "sm", variant: "outline" })}>
            Copy
          </button>
          <button type="button" onClick={() => navigate("/")} className={button({ size: "sm" })}>
            Done
          </button>
        </div>
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
