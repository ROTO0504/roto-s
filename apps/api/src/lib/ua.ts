type UAInfo = { browser: string; os: string; device: "mobile" | "tablet" | "desktop" | "bot" }

export function parseUA(ua: string): UAInfo {
  if (!ua) return { browser: "", os: "", device: "desktop" }
  const lower = ua.toLowerCase()

  let device: UAInfo["device"] = "desktop"
  if (/bot|crawler|spider|crawling/.test(lower)) device = "bot"
  else if (/ipad|tablet/.test(lower)) device = "tablet"
  else if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(lower)) device = "mobile"

  let os = ""
  if (/iphone|ipad|ipod/.test(lower)) os = "iOS"
  else if (/android/.test(lower)) os = "Android"
  else if (/mac os x/.test(lower)) os = "macOS"
  else if (/windows/.test(lower)) os = "Windows"
  else if (/linux/.test(lower)) os = "Linux"

  let browser = ""
  if (/edg\//.test(lower)) browser = "Edge"
  else if (/chrome\//.test(lower) && !/chromium/.test(lower)) browser = "Chrome"
  else if (/firefox\//.test(lower)) browser = "Firefox"
  else if (/safari\//.test(lower) && !/chrome/.test(lower)) browser = "Safari"

  return { browser, os, device }
}
