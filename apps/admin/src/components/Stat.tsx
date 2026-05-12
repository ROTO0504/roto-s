import type { ReactNode } from "react"

import { css } from "../../styled-system/css"

import { Sparkline } from "./Sparkline"

type Props = {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  sparkline?: number[]
}

export const Stat = ({ label, value, hint, sparkline }: Props) => (
  <div
    className={css({
      position: "relative",
      bg: "bg.surface",
      border: "1px solid",
      borderColor: "border.default",
      borderRadius: "lg",
      p: "4",
      display: "flex",
      flexDirection: "column",
      gap: "1",
      transition:
        "border-color {durations.fast} {easings.standard}, background-color {durations.fast} {easings.standard}",
      _hover: { borderColor: "border.strong", bg: "bg.surfaceRaised" },
      overflow: "hidden",
    })}
  >
    <p
      className={css({
        fontSize: "xs",
        color: "fg.muted",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      })}
    >
      {label}
    </p>
    <p
      className={css({
        fontSize: { base: "xl", sm: "2xl" },
        fontWeight: 600,
        fontVariantNumeric: "tabular-nums",
        color: "fg.default",
        letterSpacing: "-0.02em",
        lineHeight: "1.1",
      })}
    >
      {value}
    </p>
    {hint && <p className={css({ fontSize: "xs", color: "fg.subtle" })}>{hint}</p>}
    {sparkline && sparkline.length > 0 && (
      <div
        className={css({
          mt: "auto",
          pt: "2",
          ml: "-1",
          mr: "-1",
          mb: "-1",
        })}
      >
        <Sparkline points={sparkline} width={140} height={36} ariaLabel="トレンド" />
      </div>
    )}
  </div>
)
