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
  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 px-5 py-5 shadow-glow backdrop-blur xl:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-teal-300/80">
                API Mock Simulator
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ship mock backends without touching production services.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                Manage dynamic endpoints, inject latency and failures, and exercise
                consumer integrations against realistic HTTP responses.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300 lg:min-w-[380px]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Backend</p>
                <p className="mt-1 break-all font-mono text-slate-100">http://localhost:5000</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Frontend</p>
                <p className="mt-1 break-all font-mono text-slate-100">http://localhost:5173</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">API Base</p>
                <p className="mt-1 break-all font-mono text-xs text-teal-300 sm:text-sm">
                  {getApiBaseUrl()}
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
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
          </nav>
        </header>

        <main className="flex-1 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
