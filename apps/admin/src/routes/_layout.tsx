import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router"
import { css } from "../../styled-system/css"
import { api } from "../lib/api"

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isLogin = location.pathname === "/login"

  async function logout() {
    await api.post("/api/auth/logout").catch(() => undefined)
    navigate("/login")
  }

  return (
    <div className={css({ minH: "100vh", bg: "gray.950" })}>
      {!isLogin && (
        <header
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: "6",
            h: "14",
            borderBottom: "1px solid",
            borderColor: "gray.800",
            bg: "gray.950",
          })}
        >
          <div className={css({ display: "flex", alignItems: "center", gap: "6" })}>
            <Link to="/" className={css({ fontWeight: 600, color: "gray.100", fontSize: "sm" })}>
              roto-s
            </Link>
            <nav className={css({ display: "flex", gap: "4", fontSize: "sm" })}>
              <NavTab to="/">Links</NavTab>
              <NavTab to="/new">New</NavTab>
              <NavTab to="/settings">Settings</NavTab>
            </nav>
          </div>
          <button
            type="button"
            onClick={logout}
            className={css({
              fontSize: "xs",
              color: "gray.400",
              bg: "transparent",
              border: "none",
              cursor: "pointer",
              _hover: { color: "gray.100" },
            })}
          >
            Sign out
          </button>
        </header>
      )}
      <main className={css({ maxW: "5xl", mx: "auto", px: "6", py: "8" })}>
        <Outlet />
      </main>
    </div>
  )
}

function NavTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        css({
          color: isActive ? "gray.100" : "gray.400",
          _hover: { color: "gray.100" },
        })
      }
    >
      {children}
    </NavLink>
  )
}
