import { useState } from "react"
import { useLoaderData, useRevalidator } from "react-router"
import { startRegistration } from "@simplewebauthn/browser"
import { css } from "../../styled-system/css"
import { button, card, input } from "../../styled-system/recipes"
import { api, type PasskeyRow } from "../lib/api"

export async function settingsLoader() {
  const r = await api.get<{ passkeys: PasskeyRow[] }>("/api/auth/passkeys")
  return r.passkeys
}

export function SettingsPage() {
  const passkeys = useLoaderData() as PasskeyRow[]
  const revalidator = useRevalidator()
  const [label, setLabel] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function addPasskey() {
    setBusy(true)
    setError("")
    try {
      const opts = await api.post<Parameters<typeof startRegistration>[0]["optionsJSON"]>("/api/auth/register/options")
      const cred = await startRegistration({ optionsJSON: opts })
      await api.post("/api/auth/register/verify", { response: cred, label: label || null })
      setLabel("")
      revalidator.revalidate()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this passkey?")) return
    try {
      await api.delete(`/api/auth/passkeys/${encodeURIComponent(id)}`)
      revalidator.revalidate()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div>
      <h1 className={css({ fontSize: "2xl", fontWeight: 600, mb: "6" })}>Settings</h1>

      <section className={card() + " " + css({ mb: "6" })}>
        <h2 className={css({ fontSize: "sm", fontWeight: 500, color: "gray.300", mb: "3" })}>Add passkey</h2>
        <div className={css({ display: "flex", gap: "2" })}>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Device label"
            className={input()}
          />
          <button type="button" onClick={addPasskey} disabled={busy} className={button({ size: "md" })}>
            {busy ? "..." : "Add"}
          </button>
        </div>
        {error && <p className={css({ mt: "2", fontSize: "xs", color: "red.400" })}>{error}</p>}
      </section>

      <section className={card()}>
        <h2 className={css({ fontSize: "sm", fontWeight: 500, color: "gray.300", mb: "3" })}>
          Registered passkeys ({passkeys.length})
        </h2>
        {passkeys.length === 0 ? (
          <p className={css({ fontSize: "xs", color: "gray.500" })}>登録なし</p>
        ) : (
          <ul className={css({ display: "flex", flexDirection: "column", gap: "2" })}>
            {passkeys.map((p) => (
              <li
                key={p.credential_id}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bg: "gray.950",
                  border: "1px solid",
                  borderColor: "gray.800",
                  borderRadius: "md",
                  p: "3",
                })}
              >
                <div>
                  <p className={css({ fontSize: "sm" })}>{p.label || "(no label)"}</p>
                  <p className={css({ fontSize: "xs", color: "gray.500" })}>
                    Added {new Date(p.created_at).toLocaleDateString()} ·{" "}
                    {p.last_used_at ? `Used ${new Date(p.last_used_at).toLocaleDateString()}` : "Never used"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.credential_id)}
                  className={button({ variant: "danger", size: "sm" })}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
