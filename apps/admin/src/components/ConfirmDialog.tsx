import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react"

import { css } from "../../styled-system/css"
import { button } from "../../styled-system/recipes"

type ConfirmOptions = {
  title: ReactNode
  message?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type Resolver = (ok: boolean) => void

type ConfirmContextValue = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export const useConfirm = (): ConfirmContextValue => {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider")
  return ctx
}

type State =
  | { open: false }
  | {
      open: true
      opts: ConfirmOptions
      resolve: Resolver
    }

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<State>({ open: false })
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const messageId = useId()

  const confirm = useCallback<ConfirmContextValue>((opts) => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, opts, resolve })
    })
  }, [])

  const close = useCallback(
    (ok: boolean) => {
      if (!state.open) return
      state.resolve(ok)
      setState({ open: false })
    },
    [state],
  )

  useEffect(() => {
    if (!state.open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close(false)
      }
    }
    document.addEventListener("keydown", handler)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.querySelector<HTMLButtonElement>("[data-autofocus]")?.focus()
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = prevOverflow
    }
  }, [state.open, close])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div
          className={css({
            position: "fixed",
            inset: "0",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            px: "4",
            bg: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            animation: "fadeIn {durations.base} {easings.standard}",
          })}
          onClick={(e) => {
            if (e.target === e.currentTarget) close(false)
          }}
        >
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={state.opts.message ? messageId : undefined}
            className={css({
              width: "100%",
              maxW: "sm",
              bg: "bg.surface",
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: "xl",
              boxShadow: "lg",
              p: "5",
              display: "flex",
              flexDirection: "column",
              gap: "4",
              animation: "popIn {durations.base} {easings.emphasized}",
            })}
          >
            <div className={css({ display: "flex", flexDirection: "column", gap: "1.5" })}>
              <h2
                id={titleId}
                className={css({
                  fontSize: "md",
                  fontWeight: 600,
                  color: "fg.default",
                  letterSpacing: "-0.005em",
                })}
              >
                {state.opts.title}
              </h2>
              {state.opts.message && (
                <p id={messageId} className={css({ fontSize: "sm", color: "fg.muted", lineHeight: "1.5" })}>
                  {state.opts.message}
                </p>
              )}
            </div>
            <div
              className={css({
                display: "flex",
                gap: "2",
                justifyContent: "flex-end",
              })}
            >
              <button type="button" onClick={() => close(false)} className={button({ variant: "ghost", size: "sm" })}>
                {state.opts.cancelLabel ?? "キャンセル"}
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => close(true)}
                className={button({
                  variant: state.opts.danger ? "danger" : "solid",
                  size: "sm",
                })}
              >
                {state.opts.confirmLabel ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
