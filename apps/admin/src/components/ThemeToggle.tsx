import { useEffect, useState } from "react"

import { css } from "../../styled-system/css"
import { iconButton } from "../../styled-system/recipes"
import { applyTheme, getStoredTheme, setTheme, type Theme } from "../lib/theme"

const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" }
const LABEL: Record<Theme, string> = { system: "システム", light: "ライト", dark: "ダーク" }
const ICON: Record<Theme, string> = { system: "🖥", light: "☀", dark: "🌙" }

export const ThemeToggle = () => {
  const [theme, setLocal] = useState<Theme>("system")

  useEffect(() => {
    const t = getStoredTheme()
    setLocal(t)
    applyTheme(t)
    const mq = window.matchMedia("(prefers-color-scheme: light)")
    const onChange = () => {
      if (getStoredTheme() === "system") applyTheme("system")
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const cycle = () => {
    const next = NEXT[theme]
    setTheme(next)
    setLocal(next)
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className={iconButton({ size: "sm" })}
      aria-label={`テーマ切替（現在: ${LABEL[theme]}）`}
      title={`テーマ: ${LABEL[theme]}`}
    >
      <span className={css({ fontSize: "sm", lineHeight: 1 })} aria-hidden>
        {ICON[theme]}
      </span>
    </button>
  )
}
