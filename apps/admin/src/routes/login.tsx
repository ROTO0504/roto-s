import { useGSAP } from "@gsap/react"
import { startAuthentication, startRegistration } from "@simplewebauthn/browser"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"

import { css } from "../../styled-system/css"
import { button, card, input } from "../../styled-system/recipes"
import { Field } from "../components/Field"
import { useToast } from "../components/ToastProvider"
import { fadeIn } from "../lib/animations"
import { api } from "../lib/api"

type Mode = "login" | "register"

export const LoginPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
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

  const doLogin = async () => {
    setBusy(true)
    setError("")
    try {
      const opts = await api.post<Parameters<typeof startAuthentication>[0]["optionsJSON"]>("/api/auth/login/options")
      const cred = await startAuthentication({ optionsJSON: opts })
      await api.post("/api/auth/login/verify", cred)
      toast.success("サインインしました")
      navigate("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "login_failed")
    } finally {
      setBusy(false)
    }
  }

  const doRegister = async () => {
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
      toast.success("パスキーを登録しました")
      navigate("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "register_failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={css({
        minH: "calc(100vh - 4rem)",
        display: "grid",
        placeItems: "center",
        py: "12",
        position: "relative",
      })}
    >
      <div
        aria-hidden="true"
        className={css({
          position: "absolute",
          inset: "0",
          pointerEvents: "none",
          backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(99, 102, 241, 0.15), transparent 70%)",
        })}
      />
      <div
        ref={cardRef}
        className={
          card({ variant: "raised", size: "lg" }) +
          " " +
          css({
            position: "relative",
            width: "sm",
            maxW: "calc(100vw - 32px)",
            boxShadow: "glow",
            display: "flex",
            flexDirection: "column",
            gap: "5",
          })
        }
      >
        <div className={css({ display: "flex", flexDirection: "column", gap: "1" })}>
          <h1
            className={css({
              fontSize: "xl",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              background: "linear-gradient(135deg, #f4f4f5 0%, #a5b4fc 120%)",
              backgroundClip: "text",
              color: "transparent",
            })}
          >
            roto-s
          </h1>
          <p className={css({ fontSize: "xs", color: "fg.muted" })}>
            {mode === "login" ? "パスキーでサインイン" : "初回パスキー登録"}
          </p>
        </div>

        <div className={css({ display: "flex", flexDirection: "column", gap: "3" })}>
          {mode === "register" && bootstrap?.inviteEnabled && (
            <Field label="Invite token">
              <input
                type="password"
                autoComplete="off"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                className={input()}
                placeholder="wrangler secret put INVITE_TOKEN の値"
              />
            </Field>
          )}
          {mode === "register" && (
            <Field label="Device label">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={input()}
                placeholder="MacBook Touch ID"
              />
            </Field>
          )}
        </div>

        <button
          type="button"
          onClick={mode === "login" ? doLogin : doRegister}
          disabled={busy}
          className={button({ variant: "solid", size: "md", isFullWidth: true })}
        >
          {busy ? "..." : mode === "login" ? "Sign in with passkey" : "Register passkey"}
        </button>

        {bootstrap && !bootstrap.empty && (
          <button
            type="button"
            onClick={() => setMode((m) => (m === "login" ? "register" : "login"))}
            className={button({ variant: "ghost", size: "sm", isFullWidth: true })}
          >
            {mode === "login" ? "+ Register a new device" : "← Back to sign in"}
          </button>
        )}

        {error && (
          <p
            role="alert"
            className={css({
              fontSize: "xs",
              color: "danger.default",
              bg: "danger.subtle",
              border: "1px solid",
              borderColor: "danger.border",
              borderRadius: "md",
              px: "3",
              py: "2",
            })}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
