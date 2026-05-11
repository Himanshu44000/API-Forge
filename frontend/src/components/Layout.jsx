import { NavLink, Outlet } from 'react-router-dom'
import { getApiBaseUrl } from '../services/api.js'

const navLinkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-white/12 text-white shadow-glow ring-1 ring-white/10'
      : 'text-slate-300 hover:bg-white/6 hover:text-white',
  ].join(' ')

function Layout() {
  const apiBaseUrl = getApiBaseUrl()
  const isLocalhost = apiBaseUrl?.includes('localhost')
  const frontendUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <nav className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 px-4 py-4 shadow-glow backdrop-blur sm:px-5 xl:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <img
                alt="API Forge logo"
                className="h-11 w-11 rounded-2xl border border-white/10 bg-slate-950/60 object-cover shadow-lg"
                src="/logo.png"
              />
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-teal-300/80">
                  API Forge
                </p>
                <p className="text-xs text-slate-400">Mock APIs, traffic simulation, and analytics</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:flex-1 lg:px-6">
              <NavLink className={navLinkClass} to="/dashboard">
                Dashboard
              </NavLink>
              <NavLink className={navLinkClass} to="/guide">
                Guide
              </NavLink>
              <NavLink className={navLinkClass} to="/apis/new">
                Create API
              </NavLink>
              <NavLink className={navLinkClass} to="/tester">
                API Tester
              </NavLink>
            </div>

            <div className="hidden lg:block lg:w-[180px]" />
          </div>
        </nav>

        <header className="rounded-[2rem] border border-white/10 bg-white/5 px-5 py-5 shadow-glow backdrop-blur xl:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ship mock backends without touching production services.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                Manage dynamic endpoints, inject latency and failures, and exercise
                consumer integrations against realistic HTTP responses.
              </p>
            </div>

            {isLocalhost ? (
              <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300 lg:min-w-[380px]">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Backend</p>
                  <p className="mt-1 break-all font-mono text-slate-100">http://localhost:5000</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Frontend</p>
                  <p className="mt-1 break-all font-mono text-slate-100">http://localhost:5173</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">API Base</p>
                  <p className="mt-1 break-all font-mono text-xs text-teal-300 sm:text-sm">
                    {apiBaseUrl}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300 lg:min-w-[380px]">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-teal-400">Deployment Info</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-100 sm:text-sm">
                    Frontend: {frontendUrl}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Backend</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-100 sm:text-sm">
                    {apiBaseUrl}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">API Base</p>
                  <p className="mt-1 break-all font-mono text-xs text-teal-300 sm:text-sm">
                    {apiBaseUrl}
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
