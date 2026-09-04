import {
  Bell,
  FileWarning,
  FolderSearch,
  HeartHandshake,
  Home,
  LogOut,
  PackageSearch,
  Search,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: Home,
      },
    ],
  },
  {
    label: "Find Items",
    items: [
      {
        label: "Lost Items",
        path: "/lost-items",
        icon: PackageSearch,
      },
      {
        label: "Found Items",
        path: "/found-items",
        icon: FolderSearch,
      },
    ],
  },
  {
    label: "My Activity",
    items: [
      {
        label: "My Lost Items",
        path: "/my-lost-items",
        icon: PackageSearch,
      },
      {
        label: "My Found Items",
        path: "/my-found-items",
        icon: FolderSearch,
      },
      {
        label: "Matches",
        path: "/matches",
        icon: HeartHandshake,
      },
      {
        label: "Claims",
        path: "/claims",
        icon: ShieldCheck,
      },
      {
        label: "Notifications",
        path: "/notifications",
        icon: Bell,
      },
      {
        label: "Reports",
        path: "/reports",
        icon: FileWarning,
      },
    ],
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-5">
          <NavLink to="/dashboard" onClick={onClose}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Search size={18} strokeWidth={2.5} />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-slate-950">
                  FindIt
                </p>
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  Lost & Found
                </p>
              </div>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                {section.label}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            strokeWidth={isActive ? 2.3 : 2}
                            className={
                              isActive
                                ? "text-indigo-600"
                                : "text-slate-400 group-hover:text-slate-600"
                            }
                          />

                          <span>{item.label}</span>

                          {item.label === "Notifications" && (
                            <span className="ml-auto h-2 w-2 rounded-full bg-indigo-500" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin */}
          {user?.role === "ADMIN" && (
            <div className="mb-6">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Administration
              </p>

              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                <Settings size={18} />
                Admin Dashboard
              </NavLink>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-100 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
              navigate("/login", { replace: true });
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
