import type { ReactNode } from "react"

import { css } from "../../styled-system/css"

type Props = {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  compact?: boolean
}

export const EmptyState = ({ title, description, action, compact = false }: Props) => (
  <div
    className={css({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "2",
      py: compact ? "4" : "10",
      px: "4",
      textAlign: "center",
      color: "fg.muted",
      borderRadius: "lg",
      border: compact ? "none" : "1px dashed",
      borderColor: "border.default",
      bg: compact ? "transparent" : "bg.subtle",
    })}
  >
    {title && <p className={css({ fontSize: "sm", color: "fg.default", fontWeight: 500 })}>{title}</p>}
    {description && <p className={css({ fontSize: "xs", color: "fg.muted", maxW: "sm" })}>{description}</p>}
    {action && <div className={css({ mt: "2" })}>{action}</div>}
  </div>
)
