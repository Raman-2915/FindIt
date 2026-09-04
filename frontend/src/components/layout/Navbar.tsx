import { Bell, Menu, Search, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps { onMenuClick: () => void; }

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = user?.name?.split(" ")[0] || "there";
  const [query, setQuery] = useState(new URLSearchParams(location.search).get("q") || "");

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();

    if (!value) {
      navigate("/lost-items");
      return;
    }

    // The item list pages perform the general frontend search across the
    // fields currently returned by the backend list APIs.
    navigate(`/lost-items?q=${encodeURIComponent(value)}`);
  }

  return (
    <header className="sticky top-0 z-30 h-18 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuClick} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden" aria-label="Open menu"><Menu size={21}/></button>
          <form onSubmit={handleSearch} className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 sm:flex">
            <Search size={16} className="text-slate-400"/>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items..." aria-label="Search items" className="w-44 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 lg:w-64"/>
            <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:block">Enter</kbd>
          </form>
          <p className="text-sm font-medium text-slate-500 sm:hidden">Hi, {firstName}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/notifications" className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Notifications"><Bell size={19}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-indigo-600"/></Link>
          <div className="hidden h-7 w-px bg-slate-200 sm:block"/>
          <Link to="/profile" className="flex items-center gap-2.5 rounded-xl p-1.5 pr-2 transition hover:bg-slate-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{user?.name?.charAt(0).toUpperCase() || <UserRound size={17}/>}</div>
            <div className="hidden text-left sm:block"><p className="max-w-28 truncate text-sm font-semibold text-slate-800">{user?.name || "User"}</p><p className="text-[11px] text-slate-400">{user?.role === "ADMIN" ? "Administrator" : "Member"}</p></div>
          </Link>
        </div>
      </div>
    </header>
  );
}
