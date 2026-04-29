import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getWebhookCalls, clearWebhookCalls } from '../services/mockApi.js'

function WebhookCallsPanel({ mockId }) {
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 })
  const [selectedCall, setSelectedCall] = useState(null)

  const loadCalls = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getWebhookCalls(mockId, pagination.limit, pagination.offset)
      setCalls(result.data || [])
      setPagination(result.pagination || pagination)
    } catch (error) {
      toast.error('Failed to load webhook calls')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [mockId, pagination.limit, pagination.offset])

  useEffect(() => {
    if (mockId) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      loadCalls()
    }
  }, [mockId, loadCalls])

  const handleClear = async () => {
    if (!window.confirm('Delete all webhook call entries for this mock?')) return

    try {
      await clearWebhookCalls(mockId)
      toast.success('Webhook calls cleared')
      setCalls([])
      setPagination({ total: 0, limit: 20, offset: 0 })
    } catch (error) {
      toast.error('Failed to clear webhook calls')
      console.error(error)
    }
  }

  const formatTimestamp = (ts) => new Date(ts).toLocaleString()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Webhook Delivery Attempts</h3>
        <div className="flex gap-2">
          <button
            onClick={loadCalls}
            disabled={loading}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={handleClear}
            className="rounded border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-400/20"
          >
            Clear All
          </button>
        </div>
      </div>

      {calls.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-400">
          No webhook delivery attempts yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {calls.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCall(selectedCall?.id === c.id ? null : c)}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-slate-400">{formatTimestamp(c.created_at)}</p>
                  <p className="text-sm font-medium text-white">{c.webhook_url}</p>
                </div>
                <div className={`text-sm font-semibold ${c.success ? 'text-green-400' : 'text-rose-300'}`}>
                  {c.success ? 'Delivered' : 'Failed'}
                </div>
                <div className="ml-2 text-xs text-slate-400">{c.response_status ?? '-'}</div>
              </div>

              {selectedCall?.id === c.id && (
                <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs">
                  {c.request_body && (
                    <div>
                      <p className="font-semibold text-slate-300">Request Body:</p>
                      <pre className="overflow-x-auto rounded bg-slate-950 p-2 text-slate-300">
                        {typeof c.request_body === 'string' ? c.request_body : JSON.stringify(c.request_body, null, 2)}
                      </pre>
                    </div>
                  )}

                  {c.response_body && (
                    <div>
                      <p className="font-semibold text-slate-300">Response:</p>
                      <pre className="overflow-x-auto rounded bg-slate-950 p-2 text-slate-300">
                        {String(c.response_body)}
                      </pre>
                    </div>
                  )}

                  {c.error_message && (
                    <div>
                      <p className="font-semibold text-slate-300">Error:</p>
                      <pre className="overflow-x-auto rounded bg-slate-950 p-2 text-rose-300">
                        {String(c.error_message)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
            <div className="text-slate-400">
              Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) })}
                disabled={pagination.offset === 0}
                className="rounded border border-white/10 bg-white/5 px-2 py-1 transition hover:bg-white/10 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="rounded border border-white/10 bg-white/5 px-2 py-1 transition hover:bg-white/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WebhookCallsPanel
