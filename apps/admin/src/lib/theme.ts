export type Theme = "light" | "dark" | "system"
export type Resolved = "light" | "dark"

const KEY = "roto-s.theme"

export const getStoredTheme = (): Theme => {
  const v = localStorage.getItem(KEY)
  return v === "light" || v === "dark" || v === "system" ? v : "system"
}

export const resolveTheme = (t: Theme): Resolved =>
  t === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : t

export const applyTheme = (t: Theme) => {
  document.documentElement.setAttribute("data-theme", resolveTheme(t))
}

export const setTheme = (t: Theme) => {
  localStorage.setItem(KEY, t)
  applyTheme(t)
}
