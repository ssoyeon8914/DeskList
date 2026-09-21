import { Link, NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/calendar", label: "달력" },
  { to: "/todos", label: "할일" },
  { to: "/mandalart", label: "만다라트" },
  { to: "/settings", label: "설정" },
] as const;

export function Layout() {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" to="/calendar">
            Desk<span>List</span>
          </Link>
          <nav className="nav" aria-label="주요">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </>
  );
}
