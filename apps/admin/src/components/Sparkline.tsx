import { css } from "../../styled-system/css"

type Props = {
  points: number[]
  width?: number
  height?: number
  strokeWidth?: number
  ariaLabel?: string
}

export const Sparkline = ({ points, width = 120, height = 32, strokeWidth = 1.5, ariaLabel }: Props) => {
  if (points.length === 0) {
    return <div className={css({ width: `${width}px`, height: `${height}px` })} aria-hidden="true" />
  }

  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = max - min || 1
  const stepX = points.length > 1 ? width / (points.length - 1) : 0
  const pad = strokeWidth

  const coords = points.map((v, i) => {
    const x = points.length === 1 ? width / 2 : i * stepX
    const y = pad + (height - pad * 2) * (1 - (v - min) / range)
    return [x, y] as const
  })

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ")
  const area =
    `M0,${height} ` + coords.map(([x, y]) => `L${x.toFixed(2)},${y.toFixed(2)}`).join(" ") + ` L${width},${height} Z`

  const gradId = `spark-grad-${points.length}-${points[0]}-${points[points.length - 1]}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className={css({ display: "block" })}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke="rgb(129, 140, 248)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
