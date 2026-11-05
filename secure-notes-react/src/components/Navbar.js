import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { useMyContext } from "../store/ContextApi";
import { Brand } from "./Logo";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathName = useLocation().pathname;
  const navigate = useNavigate();

  const { token, setToken, setCurrentUser, isAdmin, setIsAdmin } =
    useMyContext();

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("JWT_TOKEN");
    localStorage.removeItem("USER");
    localStorage.removeItem("CSRF_TOKEN");
    localStorage.removeItem("IS_ADMIN");
    setToken(null);
    setCurrentUser(null);
    setIsAdmin(false);
    closeMenu();
    navigate("/login");
  };

  const links = [
    ...(token
      ? [
          { to: "/notes", label: "My Notes" },
          { to: "/create-note", label: "Create Note" },
        ]
      : []),
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
    ...(token ? [{ to: "/profile", label: "Profile" }] : []),
    ...(token && isAdmin
      ? [{ to: "/admin/users", label: "Admin", match: "/admin" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" onClick={closeMenu} aria-label="SecureNotes home">
          <Brand />
        </Link>

        <ul
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute left-0 top-16 w-full flex-col gap-1 border-b border-slate-200 bg-white px-4 py-4 shadow-sm lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          {links.map(({ to, label, match }) => {
            const active =
              pathName === to || (match && pathName.startsWith(match));
            return (
              <li key={to}>
                <Link
                  to={to}
                  onClick={closeMenu}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}

          <li className="mt-2 flex gap-2 lg:ml-3 lg:mt-0">
            {token ? (
              <button
                onClick={handleLogout}
                className="btn btn-secondary w-full py-2 lg:w-auto"
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="btn btn-secondary flex-1 py-2 lg:flex-none"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="btn btn-primary flex-1 py-2 lg:flex-none"
                >
                  Sign up
                </Link>
              </>
            )}
          </li>
        </ul>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          {menuOpen ? (
            <RxCross2 className="text-xl" />
          ) : (
            <IoMenu className="text-xl" />
          )}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
