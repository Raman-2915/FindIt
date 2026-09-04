import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Search,
    title: "Smart matching",
    description:
      "FindIt compares item details to help connect lost belongings with matching found reports.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & trusted",
    description:
      "Built with authentication, claims, reports and controlled access to keep the process secure.",
  },
  {
    icon: Bell,
    title: "Instant updates",
    description:
      "Get notified when a potential match is found or when your claim receives an update.",
  },
];

const steps = [
  {
    number: "01",
    title: "Report an item",
    description:
      "Tell the community what you lost or what you found with a few simple details.",
  },
  {
    number: "02",
    title: "Find potential matches",
    description:
      "FindIt analyzes category, location, date and item descriptions to surface relevant matches.",
  },
  {
    number: "03",
    title: "Reconnect",
    description:
      "Review the match, submit a claim and take the next step toward getting the item back.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Search size={19} strokeWidth={2.5} />
            </div>

            <span className="text-xl font-bold tracking-tight">FindIt</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how-it-works" className="transition hover:text-slate-900">
              How it works
            </a>

            <a href="#features" className="transition hover:text-slate-900">
              Features
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950 sm:block"
            >
              Log in
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-180px] h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
            <div className="absolute right-[-100px] top-40 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-28">
            {/* Hero content */}
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-700">
                <Sparkles size={15} />A smarter way to find lost belongings
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">
                Lost something?
                <br />
                <span className="text-indigo-600">Let's find it.</span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                FindIt connects people who have lost belongings with people who
                have found them. Report, discover matches and reconnect with
                what matters.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Report an item
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <Link
                  to="/found-items"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Browse found items
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Easy reporting
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Smart matching
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Secure claims
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-4 rounded-[2rem] bg-indigo-100/60 blur-2xl" />

              <div className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Potential matches
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Based on your lost item
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                    3 matches
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="flex gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                        🎧
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Wireless headphones
                            </h3>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={12} />
                              University Campus
                            </p>
                          </div>

                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                            94%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                        🎒
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Black backpack
                            </h3>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={12} />
                              Main Library
                            </p>
                          </div>

                          <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                            78%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                        🪪
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              Student ID card
                            </h3>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={12} />
                              Student Center
                            </p>
                          </div>

                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            71%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-xs font-medium text-slate-500">
                    Matching powered by multiple signals
                  </span>
                  <ChevronRight size={15} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
            <div className="px-6 py-8 text-center">
              <p className="text-2xl font-bold tracking-tight">24/7</p>
              <p className="mt-1 text-sm text-slate-500">Always available</p>
            </div>

            <div className="px-6 py-8 text-center">
              <p className="text-2xl font-bold tracking-tight">Smart</p>
              <p className="mt-1 text-sm text-slate-500">Match detection</p>
            </div>

            <div className="px-6 py-8 text-center">
              <p className="text-2xl font-bold tracking-tight">Secure</p>
              <p className="mt-1 text-sm text-slate-500">Claim workflow</p>
            </div>

            <div className="px-6 py-8 text-center">
              <p className="text-2xl font-bold tracking-tight">Simple</p>
              <p className="mt-1 text-sm text-slate-500">Reporting process</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                How it works
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                From lost to found, simply.
              </h2>

              <p className="mt-4 text-slate-600">
                A straightforward process designed to make reconnecting with
                your belongings easier.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <span className="text-sm font-bold text-indigo-600">
                    {step.number}
                  </span>

                  <h3 className="mt-5 text-xl font-bold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">
                  Built for finding
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  More than a lost & found board.
                </h2>

                <p className="mt-5 max-w-lg leading-7 text-slate-600">
                  FindIt brings reporting, intelligent matching, claims and
                  notifications into one simple platform.
                </p>

                <Link
                  to="/register"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Start using FindIt
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                        <Icon size={21} />
                      </div>

                      <h3 className="mt-5 font-bold text-slate-950">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Community section */}
        <section className="bg-slate-950 py-24 text-white">
          <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Users size={25} />
            </div>

            <h2 className="mt-7 text-3xl font-bold tracking-tight sm:text-4xl">
              Sometimes finding something starts with someone else.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
              Whether you've lost your phone, found a wallet or simply want to
              help someone in your community, FindIt makes the process easier.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Create your account
              </Link>

              <Link
                to="/found-items"
                className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse found items
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Search size={14} />
            </div>
            FindIt
          </div>

          <p>Helping people reconnect with what matters.</p>

          <p>© {new Date().getFullYear()} FindIt</p>
        </div>
      </footer>
    </div>
  );
}
