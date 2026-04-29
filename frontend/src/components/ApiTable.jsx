import { buildMockUrl } from '../services/mockApi.js'

const methodStyles = {
  GET: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25',
  POST: 'bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/25',
  PUT: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/25',
  DELETE: 'bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/25',
}

function ApiTable({
  apis,
  loading,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate,
  onCopyUrl,
  onShare,
  onRevokeShare,
  onCopyPublicUrl,
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-glow">
        <div className="animate-pulse divide-y divide-white/8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid gap-4 px-5 py-5 md:grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr]">
              <div className="h-4 rounded-full bg-white/10" />
              <div className="h-4 rounded-full bg-white/10" />
              <div className="h-4 rounded-full bg-white/10" />
              <div className="h-4 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (apis.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/70 p-10 text-center shadow-glow">
        <p className="font-display text-2xl text-white">No mock APIs yet</p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
          Create your first mock endpoint to begin simulating latency, errors, and
          real HTTP responses.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-glow">
      <div className="hidden border-b border-white/10 px-5 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 md:grid md:grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr_1fr] md:gap-4">
        <span>Endpoint</span>
        <span>Method</span>
        <span>Status</span>
        <span>Active</span>
        <span>Actions</span>
      </div>

      <div className="divide-y divide-white/8">
        {apis.map((api) => (
          <div key={api.id} className="grid gap-4 px-5 py-5 md:grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr_1fr] md:items-center md:gap-4">
            <div>
              <p className="font-mono text-sm text-white">{api.endpoint}</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-500">
                {buildMockUrl(api.endpoint)}
              </p>
              {api.category ? (
                <p className="mt-2 inline-block rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300">{api.category}</p>
              ) : null}
              {api.public_url ? (
                <p className="mt-1 break-all font-mono text-[11px] text-teal-300">
                  Public: {api.public_url}
                </p>
              ) : null}
            </div>

            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${methodStyles[api.method] || 'bg-white/10 text-slate-200 ring-1 ring-white/10'}`}>
                {api.method}
              </span>
            </div>

            <div className="text-sm font-medium text-slate-200">{api.status_code}</div>

            <div>
              <span
                className={[
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1',
                  api.is_active
                    ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/25'
                    : 'bg-slate-500/15 text-slate-300 ring-slate-400/25',
                ].join(' ')}
              >
                {api.is_active ? 'On' : 'Off'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                type="button"
                onClick={() => onCopyUrl(api)}
              >
                Copy URL
              </button>
              {api.is_public ? (
                <button
                  className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-200 transition hover:bg-teal-400/20"
                  type="button"
                  onClick={() => onCopyPublicUrl(api)}
                >
                  Copy Public
                </button>
              ) : null}
              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                type="button"
                onClick={() => onToggle(api)}
              >
                Toggle
              </button>
              {api.is_public ? (
                <button
                  className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-400/20"
                  type="button"
                  onClick={() => onRevokeShare(api)}
                >
                  Revoke Public
                </button>
              ) : (
                <button
                  className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-200 transition hover:bg-teal-400/20"
                  type="button"
                  onClick={() => onShare(api)}
                >
                  Make Public
                </button>
              )}
              <button
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10"
                type="button"
                onClick={() => onDuplicate(api)}
              >
                Duplicate
              </button>
              <button
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                type="button"
                onClick={() => onEdit(api)}
              >
                Edit
              </button>
              <button
                className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/20"
                type="button"
                onClick={() => onDelete(api)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApiTable
