import { css } from "../../styled-system/css"

type Props = {
  value: number
  max: number
  ariaLabel?: string
}

export const MiniBars = ({ value, max, ariaLabel }: Props) => {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      className={css({
        position: "relative",
        flex: 1,
        h: "1.5",
        bg: "border.subtle",
        borderRadius: "full",
        overflow: "hidden",
        minW: "12",
      })}
    >
      <div
        className={css({
          position: "absolute",
          inset: "0",
          width: "var(--ratio)",
          bgGradient: "linear",
          background: "linear-gradient(90deg, rgba(99, 102, 241, 0.45), rgba(129, 140, 248, 0.85))",
          borderRadius: "full",
          transition: "width {durations.base} {easings.standard}",
        })}
        style={{ ["--ratio" as string]: `${(ratio * 100).toFixed(1)}%` }}
      />
    </div>
  )
}
