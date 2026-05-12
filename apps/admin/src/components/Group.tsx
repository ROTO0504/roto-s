import { css } from "../../styled-system/css"
import { card } from "../../styled-system/recipes"
import type { StatsRow } from "../lib/api"

import { EmptyState } from "./EmptyState"
import { MiniBars } from "./MiniBars"

type Props = {
  title: string
  rows: StatsRow[]
  limit?: number
  unit?: string
}

export const Group = ({ title, rows, limit = 8, unit }: Props) => {
  const display = rows.slice(0, limit)
  const max = rows.reduce((m, r) => Math.max(m, r.clicks), 0)

  return (
    <div className={card({ size: "md" })}>
      <header
        className={css({
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          mb: "3",
        })}
      >
        <h3
          className={css({
            fontSize: "sm",
            fontWeight: 500,
            color: "fg.default",
            letterSpacing: "-0.005em",
          })}
        >
          {title}
        </h3>
        {rows.length > limit && (
          <span className={css({ fontSize: "xs", color: "fg.subtle" })}>
            top {limit} / {rows.length}
          </span>
        )}
      </header>

      {display.length === 0 ? (
        <EmptyState compact description="データなし" />
      ) : (
        <ul className={css({ display: "flex", flexDirection: "column", gap: "2" })}>
          {display.map((r) => (
            <li
              key={r.key}
              className={css({
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(40px, 1fr) auto",
                alignItems: "center",
                gap: "3",
                fontSize: "sm",
                color: "fg.muted",
              })}
            >
              <span
                className={css({
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "fg.default",
                  fontFamily: r.key && (r.key.startsWith("/") || r.key.startsWith("http")) ? "mono" : "sans",
                  fontSize: "xs",
                })}
              >
                {r.key || "—"}
              </span>
              <MiniBars value={r.clicks} max={max} ariaLabel={`${r.key} ${r.clicks}`} />
              <span
                className={css({
                  fontVariantNumeric: "tabular-nums",
                  color: "fg.default",
                  fontSize: "xs",
                  textAlign: "right",
                  minW: "8",
                })}
              >
                {r.clicks.toLocaleString()}
                {unit && <span className={css({ color: "fg.subtle", ml: "0.5" })}>{unit}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
