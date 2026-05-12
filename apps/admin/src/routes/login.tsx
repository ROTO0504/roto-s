import { useGSAP } from "@gsap/react"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"

import { css } from "../../styled-system/css"
import { button, card, input } from "../../styled-system/recipes"
import { fadeIn } from "../lib/animations"
import { api } from "../lib/api"

type Mode = "login" | "register"

export function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>("login")
  const [inviteToken, setInviteToken] = useState("")
  const [label, setLabel] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [bootstrap, setBootstrap] = useState<{ empty: boolean; inviteEnabled: boolean } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api
      .get<{ empty: boolean; inviteEnabled: boolean }>("/api/auth/bootstrap")
      .then((r) => {
        setBootstrap(r)
        if (r.empty) setMode("register")
      })
      .catch(() => undefined)
  }, [])

  useGSAP(
    () => {
      if (cardRef.current) fadeIn(cardRef.current)
    },
    { scope: cardRef },
  )

  async function doLogin() {
    setBusy(true)
    setError("")
    try {
      const opts = await api.post<Parameters<typeof startAuthentication>[0]["optionsJSON"]>("/api/auth/login/options")
      const cred = await startAuthentication({ optionsJSON: opts })
      await api.post("/api/auth/login/verify", cred)
      navigate("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "login_failed")
    } finally {
      setBusy(false)
    }
  }

  async function doRegister() {
    setBusy(true)
    setError("")
    try {
      const headers = inviteToken ? { "X-Invite-Token": inviteToken } : undefined
      const opts = await api.post<Parameters<typeof startRegistration>[0]["optionsJSON"]>(
        "/api/auth/register/options",
        undefined,
        headers,
      )
      const cred = await startRegistration({ optionsJSON: opts })
      await api.post("/api/auth/register/verify", { response: cred, label: label || null }, headers)
      navigate("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "register_failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={css({ minH: "calc(100vh - 4rem)", display: "grid", placeItems: "center", py: "12" })}>
      <div ref={cardRef} className={card() + " " + css({ width: "sm", maxW: "90vw" })}>
        <h1 className={css({ fontSize: "lg", fontWeight: 600, mb: "1" })}>roto-s</h1>
        <p className={css({ fontSize: "xs", color: "gray.400", mb: "6" })}>
          {mode === "login" ? "パスキーでサインイン" : "初回パスキー登録"}
        </p>

        {mode === "register" && bootstrap?.inviteEnabled && (
          <label className={css({ display: "block", mb: "4" })}>
            <span className={css({ display: "block", fontSize: "xs", color: "gray.400", mb: "1" })}>Invite token</span>
            <input
              type="password"
              autoComplete="off"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              className={input()}
              placeholder="wrangler secret put INVITE_TOKEN の値"
            />
          </label>
        )}
        {mode === "register" && (
          <label className={css({ display: "block", mb: "4" })}>
            <span className={css({ display: "block", fontSize: "xs", color: "gray.400", mb: "1" })}>Device label</span>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={input()}
              placeholder="MacBook Touch ID"
            />
          </label>
        )}

        <button
          type="button"
          onClick={mode === "login" ? doLogin : doRegister}
          disabled={busy}
          className={button({ size: "md", variant: "solid" }) + " " + css({ width: "100%" })}
        >
          {busy ? "..." : mode === "login" ? "Sign in with passkey" : "Register passkey"}
        </button>

        {bootstrap && !bootstrap.empty && (
          <button
            type="button"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
            className={button({ variant: "ghost", size: "sm" }) + " " + css({ width: "100%", mt: "3", fontSize: "xs" })}
          >
            {mode === "login" ? "+ Register a new device" : "← Back to sign in"}
          </button>
        )}

        {error && <p className={css({ mt: "4", fontSize: "xs", color: "red.400" })}>{error}</p>}
      </div>
    </div>
  )
}
