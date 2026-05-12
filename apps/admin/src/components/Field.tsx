import type { ReactNode } from "react"

import { css } from "../../styled-system/css"
import { field } from "../../styled-system/recipes"

type Props = {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
  mono?: boolean
}

export const Field = ({ label, hint, error, children, mono = false }: Props) => (
  <label className={field()}>
    <span
      className={css({
        fontSize: "xs",
        color: "fg.muted",
        fontWeight: 500,
        letterSpacing: "0.02em",
        textTransform: mono ? "none" : "none",
        fontFamily: mono ? "mono" : "sans",
      })}
    >
      {label}
    </span>
    {children}
    {hint && !error && <span className={css({ fontSize: "xs", color: "fg.subtle" })}>{hint}</span>}
    {error && <span className={css({ fontSize: "xs", color: "danger.default" })}>{error}</span>}
  </label>
)
