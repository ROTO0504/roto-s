import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router"

import { css } from "../../styled-system/css"
import { button } from "../../styled-system/recipes"
import { ThemeToggle } from "../components/ThemeToggle"
import { api } from "../lib/api"

export const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname === "/login"

  const logout = async () => {
    await api.post("/api/auth/logout").catch(() => undefined)
    navigate("/login")
  }

  return (
    <div className={css({ minH: "100vh", color: "fg.default" })}>
      {!isLogin && (
        <header
          className={css({
            position: "sticky",
            top: "0",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "3",
            px: { base: "4", sm: "6" },
            h: "14",
            borderBottom: "1px solid",
            borderColor: "border.default",
            bg: { base: "rgba(10, 10, 11, 0.7)", _light: "rgba(255, 255, 255, 0.75)" },
            backdropFilter: "saturate(140%) blur(12px)",
          })}
        >
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              gap: { base: "4", sm: "6" },
              minW: 0,
            })}
          >
            <Link
              to="/"
              className={css({
                fontWeight: 600,
                fontSize: "sm",
                letterSpacing: "-0.01em",
                background: {
                  base: "linear-gradient(135deg, #f4f4f5 0%, #a5b4fc 120%)",
                  _light: "linear-gradient(135deg, #18181b 0%, #4f46e5 120%)",
                },
                backgroundClip: "text",
                color: "transparent",
                _hover: { color: "transparent" },
              })}
            >
              roto-s
            </Link>
            <nav
              className={css({
                display: "flex",
                gap: { base: "3", sm: "4" },
                fontSize: "sm",
                overflowX: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              })}
            >
              <NavTab to="/">リンク</NavTab>
              <NavTab to="/new">新規作成</NavTab>
              <NavTab to="/settings">設定</NavTab>
            </nav>
          </div>
          <div className={css({ display: "flex", alignItems: "center", gap: "2" })}>
            <ThemeToggle />
            <button type="button" onClick={logout} className={button({ variant: "ghost", size: "xs" })}>
              サインアウト
            </button>
          </div>
        </header>
      )}
      <main
        className={css({
          maxW: "5xl",
          mx: "auto",
          px: { base: "4", sm: "6" },
          py: { base: "6", sm: "8" },
        })}
      >
        <Outlet />
      </main>
    </div>
  )
}

const NavTab = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      css({
        position: "relative",
        py: "1",
        color: isActive ? "fg.default" : "fg.muted",
        fontWeight: isActive ? 500 : 400,
        transition: "color {durations.fast} {easings.standard}",
        _hover: { color: "fg.default" },
        _after: isActive
          ? {
              content: '""',
              position: "absolute",
              left: "0",
              right: "0",
              bottom: "-15px",
              h: "2px",
              bg: "accent.default",
              borderRadius: "full",
            }
          : {},
      })
    }
  >
    {children}
  </NavLink>
)
