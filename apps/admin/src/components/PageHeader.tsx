import type { ReactNode } from "react"

import { css } from "../../styled-system/css"

type Props = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  mono?: boolean
}

export const PageHeader = ({ title, description, actions, mono = false }: Props) => (
  <header
    className={css({
      display: "flex",
      flexDirection: { base: "column", sm: "row" },
      alignItems: { base: "flex-start", sm: "center" },
      justifyContent: "space-between",
      gap: "3",
      mb: "6",
    })}
  >
    <div className={css({ display: "flex", flexDirection: "column", gap: "1", minW: 0 })}>
      <h1
        className={css({
          fontSize: { base: "xl", sm: "2xl" },
          fontWeight: 600,
          letterSpacing: "-0.01em",
          fontFamily: mono ? "mono" : "sans",
          color: "fg.default",
          lineHeight: "1.2",
          overflow: "hidden",
          textOverflow: "ellipsis",
        })}
      >
        {title}
      </h1>
      {description && <p className={css({ fontSize: "sm", color: "fg.muted" })}>{description}</p>}
    </div>
    {actions && (
      <div className={css({ display: "flex", gap: "2", alignItems: "center", flexShrink: 0 })}>{actions}</div>
    )}
  </header>
)
