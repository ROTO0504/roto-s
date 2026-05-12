import { useGSAP } from "@gsap/react"
import { useRef, useState } from "react"
import { Link, useLoaderData, useRevalidator } from "react-router"

import { css } from "../../styled-system/css"
import { button } from "../../styled-system/recipes"
import { useConfirm } from "../components/ConfirmDialog"
import { EmptyState } from "../components/EmptyState"
import { PageHeader } from "../components/PageHeader"
import { useToast } from "../components/ToastProvider"
import { popCheck, staggerRows } from "../lib/animations"
import { api, ApiError, type Link as LinkRow } from "../lib/api"

export const indexLoader = async () => {
  const data = await api.get<{ links: LinkRow[] }>("/api/links")
  return data.links
}

export const IndexPage = () => {
  const links = useLoaderData() as LinkRow[]
  const revalidator = useRevalidator()
  const toast = useToast()
  const confirm = useConfirm()
  const tableRef = useRef<HTMLTableSectionElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const checkRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const tableRows = tableRef.current?.querySelectorAll("tr")
      const cardRows = cardsRef.current?.querySelectorAll("[data-row]")
      const rows = (tableRows && tableRows.length > 0 ? tableRows : cardRows) ?? []
      if (rows.length > 0) staggerRows(rows)
    },
    { dependencies: [links.length] },
  )

  const copyShort = async (slug: string) => {
    const url = `${window.location.origin}/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(slug)
    toast.success(`${url} をコピーしました`)
    setTimeout(() => setCopied(null), 1200)
    if (checkRef.current) popCheck(checkRef.current)
  }

  const remove = async (slug: string) => {
    const ok = await confirm({
      title: `/${slug} を削除しますか？`,
      message: "このリンクと関連するクリック統計は削除できません。",
      confirmLabel: "削除",
      danger: true,
    })
    if (!ok) return
    try {
      await api.delete(`/api/links/${slug}`)
      toast.success("削除しました")
      revalidator.revalidate()
    } catch (e) {
      toast.error(e instanceof ApiError ? `削除に失敗しました (${e.status})` : "削除に失敗しました")
    }
  }

  return (
    <div>
      <PageHeader
        title="Links"
        description={links.length > 0 ? `${links.length} 件のリンク` : undefined}
        actions={
          <Link to="/new" className={button({ size: "sm" })}>
            <span aria-hidden>+</span> New
          </Link>
        }
      />

      {links.length === 0 ? (
        <EmptyState
          title="まだリンクがありません"
          description="+ New ボタンから最初のリンクを作成してください。"
          action={
            <Link to="/new" className={button({ size: "sm" })}>
              + New
            </Link>
          }
        />
      ) : (
        <>
          <div
            className={css({
              display: { base: "none", md: "block" },
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: "lg",
              overflow: "hidden",
              bg: "bg.surface",
            })}
          >
            <table className={css({ width: "100%", borderCollapse: "collapse", fontSize: "sm" })}>
              <thead>
                <tr
                  className={css({
                    bg: "bg.subtle",
                    color: "fg.muted",
                    textAlign: "left",
                    borderBottom: "1px solid",
                    borderColor: "border.default",
                  })}
                >
                  <th
                    className={css({
                      p: "3",
                      fontWeight: 500,
                      fontSize: "xs",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    })}
                  >
                    Slug
                  </th>
                  <th
                    className={css({
                      p: "3",
                      fontWeight: 500,
                      fontSize: "xs",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    })}
                  >
                    Destination
                  </th>
                  <th
                    className={css({
                      p: "3",
                      fontWeight: 500,
                      fontSize: "xs",
                      textAlign: "right",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    })}
                  >
                    Clicks
                  </th>
                  <th className={css({ p: "3" })}></th>
                </tr>
              </thead>
              <tbody ref={tableRef}>
                {links.map((l) => (
                  <tr
                    key={l.slug}
                    className={css({
                      borderTop: "1px solid",
                      borderColor: "border.subtle",
                      transition: "background-color {durations.fast} {easings.standard}",
                      _hover: { bg: "bg.surfaceRaised" },
                    })}
                  >
                    <td className={css({ p: "3", fontFamily: "mono" })}>
                      <Link
                        to={`/links/${l.slug}`}
                        className={css({ color: "accent.default", _hover: { color: "accent.400" } })}
                      >
                        /{l.slug}
                      </Link>
                    </td>
                    <td
                      className={css({
                        p: "3",
                        color: "fg.muted",
                        maxW: "md",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      })}
                    >
                      {l.url}
                    </td>
                    <td
                      className={css({
                        p: "3",
                        textAlign: "right",
                        color: "fg.default",
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 500,
                      })}
                    >
                      {l.clicks.toLocaleString()}
                    </td>
                    <td className={css({ p: "3" })}>
                      <div className={css({ display: "flex", gap: "1", justifyContent: "flex-end" })}>
                        <button
                          type="button"
                          onClick={() => copyShort(l.slug)}
                          className={button({ variant: "ghost", size: "sm" })}
                        >
                          {copied === l.slug ? (
                            <span ref={checkRef} className={css({ color: "success.default" })}>
                              ✓ Copied
                            </span>
                          ) : (
                            "Copy"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(l.slug)}
                          className={button({ variant: "danger", size: "sm" })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            ref={cardsRef}
            className={css({
              display: { base: "flex", md: "none" },
              flexDirection: "column",
              gap: "2",
            })}
          >
            {links.map((l) => (
              <div
                key={l.slug}
                data-row
                className={css({
                  bg: "bg.surface",
                  border: "1px solid",
                  borderColor: "border.default",
                  borderRadius: "lg",
                  p: "3",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2",
                })}
              >
                <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "baseline" })}>
                  <Link
                    to={`/links/${l.slug}`}
                    className={css({ fontFamily: "mono", color: "accent.default", fontSize: "sm" })}
                  >
                    /{l.slug}
                  </Link>
                  <span
                    className={css({
                      fontVariantNumeric: "tabular-nums",
                      fontSize: "sm",
                      color: "fg.default",
                      fontWeight: 500,
                    })}
                  >
                    {l.clicks.toLocaleString()}
                  </span>
                </div>
                <p
                  className={css({
                    fontSize: "xs",
                    color: "fg.muted",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  })}
                >
                  {l.url}
                </p>
                <div className={css({ display: "flex", gap: "1" })}>
                  <button
                    type="button"
                    onClick={() => copyShort(l.slug)}
                    className={button({ variant: "ghost", size: "xs" })}
                  >
                    {copied === l.slug ? "✓ Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(l.slug)}
                    className={button({ variant: "danger", size: "xs" })}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
