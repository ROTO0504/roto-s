import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

import { css } from "../../styled-system/css"

type Tone = "success" | "error" | "info"

type Toast = {
  id: number
  tone: Tone
  message: ReactNode
}

type ToastApi = {
  success: (message: ReactNode) => void
  error: (message: ReactNode) => void
  info: (message: ReactNode) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const TOAST_DURATION = 3200

let counter = 0

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((tone: Tone, message: ReactNode) => {
    const id = ++counter
    setToasts((prev) => [...prev, { id, tone, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION)
  }, [])

  const api: ToastApi = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className={css({
          position: "fixed",
          bottom: { base: "4", sm: "6" },
          right: { base: "4", sm: "6" },
          left: { base: "4", sm: "auto" },
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          gap: "2",
          pointerEvents: "none",
        })}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => setToasts((p) => p.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) => {
  const accentBorder =
    toast.tone === "success" ? "success.default" : toast.tone === "error" ? "danger.default" : "accent.default"
  const icon = toast.tone === "success" ? "✓" : toast.tone === "error" ? "!" : "i"
  const iconColor =
    toast.tone === "success" ? "success.default" : toast.tone === "error" ? "danger.default" : "accent.default"

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      onClick={onDismiss}
      className={css({
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: "3",
        minW: { base: "auto", sm: "72" },
        maxW: "sm",
        bg: "bg.surfaceRaised",
        border: "1px solid",
        borderColor: "border.default",
        borderLeftWidth: "3px",
        borderLeftColor: accentBorder,
        borderRadius: "lg",
        boxShadow: "lg",
        px: "4",
        py: "3",
        fontSize: "sm",
        color: "fg.default",
        cursor: "pointer",
        animation: "slideUp {durations.base} {easings.emphasized}",
      })}
    >
      <span
        className={css({
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          w: "5",
          h: "5",
          borderRadius: "full",
          fontSize: "xs",
          fontWeight: 700,
          flexShrink: 0,
          bg: "bg.canvas",
          color: iconColor,
          border: "1px solid currentColor",
        })}
      >
        {icon}
      </span>
      <span className={css({ flex: 1, lineHeight: "1.4" })}>{toast.message}</span>
    </div>
  )
}
