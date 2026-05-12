import { Hono } from "hono"

import { parseUA } from "../lib/ua"
import { buildDestUrl } from "../lib/utm"
import type { Bindings, Link, Variables } from "../types"

export const redirectRoute = new Hono<{ Bindings: Bindings; Variables: Variables }>()

redirectRoute.get("/:slug", async (c) => {
  const slug = c.req.param("slug")
  const link = await c.env.DB.prepare("SELECT * FROM links WHERE slug = ?").bind(slug).first<Link>()
  if (!link) return c.notFound()

  if (link.expires_at && link.expires_at < Date.now()) return c.notFound()

  const reqUrl = new URL(c.req.url)
  const dest = buildDestUrl(link, reqUrl)
  const cf = (c.req.raw as Request & { cf?: IncomingRequestCfProperties }).cf
  const { browser, os, device } = parseUA(c.req.header("user-agent") ?? "")

  c.executionCtx.waitUntil(
    Promise.all([
      c.env.DB.prepare("UPDATE links SET clicks = clicks + 1 WHERE slug = ?").bind(slug).run(),
      Promise.resolve(
        c.env.AE.writeDataPoint({
          indexes: [slug],
          blobs: [
            cf?.country ?? "",
            (cf as { region?: string } | undefined)?.region ?? "",
            cf?.city ?? "",
            device,
            browser,
            os,
            c.req.header("referer") ?? "",
            (c.req.header("accept-language") ?? "").split(",")[0] ?? "",
            reqUrl.searchParams.get("utm_source") ?? link.utm_source ?? "",
            reqUrl.searchParams.get("utm_medium") ?? link.utm_medium ?? "",
            reqUrl.searchParams.get("utm_campaign") ?? link.utm_campaign ?? "",
            reqUrl.searchParams.get("utm_term") ?? link.utm_term ?? "",
            reqUrl.searchParams.get("utm_content") ?? link.utm_content ?? "",
          ],
        }),
      ),
    ]).then(() => undefined),
  )
  return c.redirect(dest, 301)
})
