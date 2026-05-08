import { useRef, useState } from 'react'
import { Link, useLoaderData, useRevalidator } from 'react-router'
import { useGSAP } from '@gsap/react'
import { css } from '../../styled-system/css'
import { button } from '../../styled-system/recipes'
import { api, type Link as LinkRow } from '../lib/api'
import { popCheck, staggerRows } from '../lib/animations'

export async function indexLoader() {
  const data = await api.get<{ links: LinkRow[] }>('/api/links')
  return data.links
}

export function IndexPage() {
  const links = useLoaderData() as LinkRow[]
  const revalidator = useRevalidator()
  const tableRef = useRef<HTMLTableSectionElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const checkRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const rows = tableRef.current?.querySelectorAll('tr')
    if (rows && rows.length > 0) staggerRows(rows)
  }, { scope: tableRef, dependencies: [links.length] })

  async function copyShort(slug: string) {
    const url = `${window.location.origin}/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(slug)
    setTimeout(() => setCopied(null), 1200)
    if (checkRef.current) popCheck(checkRef.current)
  }

  async function remove(slug: string) {
    if (!confirm(`Delete /${slug}?`)) return
    await api.delete(`/api/links/${slug}`)
    revalidator.revalidate()
  }

  return (
    <div>
      <header className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6' })}>
        <h1 className={css({ fontSize: '2xl', fontWeight: 600 })}>Links</h1>
        <Link to="/new" className={button({ size: 'sm' })}>+ New</Link>
      </header>

      {links.length === 0 ? (
        <p className={css({ color: 'gray.400', fontSize: 'sm' })}>まだリンクがありません。+ New から作成してください。</p>
      ) : (
        <div
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            borderRadius: 'lg',
            overflow: 'hidden',
          })}
        >
          <table className={css({ width: '100%', borderCollapse: 'collapse', fontSize: 'sm' })}>
            <thead>
              <tr className={css({ bg: 'gray.900', color: 'gray.400', textAlign: 'left' })}>
                <th className={css({ p: '3', fontWeight: 500, fontSize: 'xs' })}>SLUG</th>
                <th className={css({ p: '3', fontWeight: 500, fontSize: 'xs' })}>DESTINATION</th>
                <th className={css({ p: '3', fontWeight: 500, fontSize: 'xs', textAlign: 'right' })}>CLICKS</th>
                <th className={css({ p: '3' })}></th>
              </tr>
            </thead>
            <tbody ref={tableRef}>
              {links.map((l) => (
                <tr
                  key={l.slug}
                  className={css({
                    borderTop: '1px solid',
                    borderColor: 'gray.800',
                    _hover: { bg: 'gray.900' },
                  })}
                >
                  <td className={css({ p: '3', fontFamily: 'monospace' })}>
                    <Link to={`/links/${l.slug}`} className={css({ color: 'accent.400' })}>
                      /{l.slug}
                    </Link>
                  </td>
                  <td
                    className={css({
                      p: '3',
                      color: 'gray.300',
                      maxW: 'md',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {l.url}
                  </td>
                  <td className={css({ p: '3', textAlign: 'right', color: 'gray.400', fontVariantNumeric: 'tabular-nums' })}>
                    {l.clicks}
                  </td>
                  <td className={css({ p: '3', textAlign: 'right', display: 'flex', gap: '2', justifyContent: 'flex-end' })}>
                    <button
                      type="button"
                      onClick={() => copyShort(l.slug)}
                      className={button({ variant: 'ghost', size: 'sm' })}
                    >
                      {copied === l.slug ? (
                        <span ref={checkRef} className={css({ color: 'accent.400' })}>✓</span>
                      ) : (
                        'Copy'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(l.slug)}
                      className={button({ variant: 'danger', size: 'sm' })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
