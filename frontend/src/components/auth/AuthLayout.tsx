import { Search, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left branding panel */}
        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative flex w-full flex-col justify-between p-12 xl:p-16">
            <Link to="/" className="flex items-center gap-2.5 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
                <Search size={20} strokeWidth={2.5} />
              </div>

              <span className="text-xl font-bold tracking-tight">FindIt</span>
            </Link>

            <div className="max-w-lg">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-indigo-300">
                <Sparkles size={22} />
              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Lost something?
                <br />
                Someone may have found it.
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                FindIt brings lost and found reports together and helps people
                discover potential matches.
              </p>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck size={18} className="text-emerald-400" />
                Secure account and claim process
              </div>
            </div>

            <p className="text-sm text-slate-500">
              FindIt · Reconnect with what matters.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Search size={18} />
                </div>

                <span className="text-xl font-bold">FindIt</span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                {title}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
