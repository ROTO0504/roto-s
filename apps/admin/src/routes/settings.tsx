import { startRegistration } from "@simplewebauthn/browser"
import { useState } from "react"
import { useLoaderData, useRevalidator } from "react-router"

import { css } from "../../styled-system/css"
import { button, card, input } from "../../styled-system/recipes"
import { useConfirm } from "../components/ConfirmDialog"
import { EmptyState } from "../components/EmptyState"
import { Field } from "../components/Field"
import { PageHeader } from "../components/PageHeader"
import { useToast } from "../components/ToastProvider"
import { api, ApiError, type PasskeyRow } from "../lib/api"

export const settingsLoader = async () => {
  const r = await api.get<{ passkeys: PasskeyRow[] }>("/api/auth/passkeys")
  return r.passkeys
}

export const SettingsPage = () => {
  const passkeys = useLoaderData() as PasskeyRow[]
  const revalidator = useRevalidator()
  const toast = useToast()
  const confirm = useConfirm()
  const [label, setLabel] = useState("")
  const [busy, setBusy] = useState(false)

  const addPasskey = async () => {
    setBusy(true)
    try {
      const opts = await api.post<Parameters<typeof startRegistration>[0]["optionsJSON"]>("/api/auth/register/options")
      const cred = await startRegistration({ optionsJSON: opts })
      await api.post("/api/auth/register/verify", { response: cred, label: label || null })
      toast.success("パスキーを追加しました")
      setLabel("")
      revalidator.revalidate()
    } catch (e) {
      toast.error(e instanceof ApiError ? `追加に失敗しました (${e.status})` : (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string, label: string | null) => {
    const ok = await confirm({
      title: "パスキーを削除しますか？",
      message: `${label || "(no label)"} を削除します。このパスキーではサインインできなくなります。`,
      confirmLabel: "削除",
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/api/auth/passkeys/${encodeURIComponent(id)}`)
      toast.success("削除しました")
      revalidator.revalidate()
    } catch (e) {
      toast.error(e instanceof ApiError ? `削除に失敗しました (${e.status})` : (e as Error).message)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="パスキーの追加・削除を管理します" />

      <section
        className={card({ size: "lg" }) + " " + css({ mb: "6", display: "flex", flexDirection: "column", gap: "3" })}
      >
        <h2
          className={css({
            fontSize: "sm",
            fontWeight: 500,
            color: "fg.default",
            letterSpacing: "-0.005em",
          })}
        >
          パスキーを追加
        </h2>
        <div
          className={css({
            display: "flex",
            flexDirection: { base: "column", sm: "row" },
            gap: "2",
            alignItems: { base: "stretch", sm: "flex-end" },
          })}
        >
          <Field label="Device label">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="MacBook Touch ID"
              className={input()}
            />
          </Field>
          <button
            type="button"
            onClick={addPasskey}
            disabled={busy}
            className={button({ size: "md" }) + " " + css({ width: { base: "100%", sm: "auto" } })}
          >
            {busy ? "..." : "追加"}
          </button>
        </div>
      </section>

      <section className={card({ size: "lg" })}>
        <h2
          className={css({
            fontSize: "sm",
            fontWeight: 500,
            color: "fg.default",
            mb: "3",
            display: "flex",
            alignItems: "baseline",
            gap: "2",
          })}
        >
          登録済みパスキー
          <span className={css({ color: "fg.subtle", fontWeight: 400 })}>({passkeys.length})</span>
        </h2>
        {passkeys.length === 0 ? (
          <EmptyState compact description="登録なし" />
        ) : (
          <ul className={css({ display: "flex", flexDirection: "column", gap: "2" })}>
            {passkeys.map((p) => (
              <li
                key={p.credential_id}
                className={css({
                  display: "flex",
                  alignItems: { base: "flex-start", sm: "center" },
                  flexDirection: { base: "column", sm: "row" },
                  justifyContent: "space-between",
                  gap: "2",
                  bg: "bg.subtle",
                  border: "1px solid",
                  borderColor: "border.subtle",
                  borderRadius: "md",
                  p: "3",
                  transition: "border-color {durations.fast} {easings.standard}",
                  _hover: { borderColor: "border.default" },
                })}
              >
                <div className={css({ minW: 0 })}>
                  <p className={css({ fontSize: "sm", color: "fg.default", fontWeight: 500 })}>
                    {p.label || "(no label)"}
                  </p>
                  <p className={css({ fontSize: "xs", color: "fg.subtle", mt: "0.5" })}>
                    Added {new Date(p.created_at).toLocaleDateString()} ·{" "}
                    {p.last_used_at ? `Used ${new Date(p.last_used_at).toLocaleDateString()}` : "Never used"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.credential_id, p.label)}
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
