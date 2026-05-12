export function validateDestinationUrl(
  input: string,
  selfHost: string,
): { ok: true; url: string } | { ok: false; reason: string } {
  let parsed: URL
  try {
    parsed = new URL(input)
  } catch {
    return { ok: false, reason: "invalid_url" }
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "unsupported_protocol" }
  }
  if (parsed.host === selfHost) {
    return { ok: false, reason: "self_host_loop" }
  }
  return { ok: true, url: parsed.toString() }
}
