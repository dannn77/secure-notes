import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiActivity, FiChevronsLeft, FiChevronsRight, FiUsers } from "react-icons/fi";
import Tooltip from "@mui/material/Tooltip";
import { useMyContext } from "../../store/ContextApi";

const items = [
  { to: "/admin/users", label: "All Users", icon: FiUsers },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: FiActivity },
];

const Sidebar = () => {
  const { openSidebar, setOpenSidebar } = useMyContext();

  const pathName = useLocation().pathname;

  return (
    <aside
      className={`fixed left-0 top-16 z-20 flex h-[calc(100vh-64px)] flex-col border-r border-slate-200 bg-white p-3 transition-all duration-150 ${
        openSidebar ? "w-60" : "w-16"
      }`}
    >
      <div
        className={`mb-4 flex items-center ${
          openSidebar ? "justify-between pl-3" : "justify-center"
        }`}
      >
        {openSidebar && (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Admin
          </span>
        )}
        <Tooltip title={openSidebar ? "Collapse" : "Expand"} placement="right">
          <button
            type="button"
            onClick={() => setOpenSidebar(!openSidebar)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            {openSidebar ? <FiChevronsLeft /> : <FiChevronsRight />}
          </button>
        </Tooltip>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathName.startsWith(to);
          return (
            <Tooltip key={to} title={openSidebar ? "" : label} placement="right">
              <Link
                to={to}
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="shrink-0 text-lg" />
                <span className={`whitespace-nowrap ${openSidebar ? "" : "hidden"}`}>
                  {label}
                </span>
              </Link>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
