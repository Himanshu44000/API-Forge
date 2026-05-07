import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { getCallLogs, clearCallLogs } from '../services/mockApi.js'
import { joinMockRoom, leaveMockRoom, onCallLogCreated, offCallLogCreated } from '../services/socketService.js'

function CallLogsPanel({ mockId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 })
  const [selectedLog, setSelectedLog] = useState(null)

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getCallLogs(mockId, pagination.limit, pagination.offset)
      setLogs(result.data || [])
      setStats(result.stats)
      setPagination(result.pagination)
    } catch (error) {
      toast.error('Failed to load call logs')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [mockId, pagination.limit, pagination.offset])

  const handleNewCallLog = useCallback((callLog) => {
    setLogs((prevLogs) => [callLog, ...prevLogs])
    setPagination((prevPagination) => ({
      ...prevPagination,
      total: (prevPagination.total || 0) + 1,
    }))
    setStats((prevStats) => {
      if (!prevStats) {
        return prevStats
      }

      return {
        ...prevStats,
        total_calls: Number(prevStats.total_calls || 0) + 1,
        success_count: Number(prevStats.success_count || 0) + (Number(callLog.response_status) >= 200 && Number(callLog.response_status) < 400 ? 1 : 0),
        error_count: Number(prevStats.error_count || 0) + (Number(callLog.response_status) >= 400 ? 1 : 0),
      }
    })
  }, [])

  // Load logs when the selected mock or page changes
  useEffect(() => {
    if (mockId) {
      loadLogs()
    }
  }, [mockId, loadLogs])

  // Subscribe to real-time events - separate effect to avoid dependency loop
  useEffect(() => {
    if (mockId) {
      joinMockRoom(mockId)
      onCallLogCreated(handleNewCallLog)

      return () => {
        leaveMockRoom(mockId)
        offCallLogCreated(handleNewCallLog)
      }
    }
  }, [mockId, handleNewCallLog])

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure? This will delete all call logs for this mock.')) {
      return
    }

    try {
      await clearCallLogs(mockId)
      toast.success('Call logs cleared')
      setLogs([])
      setPagination({ total: 0, limit: 50, offset: 0 })
      setStats(null)
    } catch (error) {
      toast.error('Failed to clear call logs')
      console.error(error)
    }
  }

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString()
  }

  const formatJson = (obj) => {
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  const statusColor = (code) => {
    if (code >= 200 && code < 300) return 'text-green-400'
    if (code >= 300 && code < 400) return 'text-blue-400'
    if (code >= 400 && code < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Request History / Call Logs</h3>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs md:grid-cols-4">
          <div>
            <p className="text-slate-400">Total Calls</p>
            <p className="font-semibold text-white">{stats.total_calls}</p>
          </div>
          <div>
            <p className="text-slate-400">Avg Response</p>
            <p className="font-semibold text-white">{stats.avg_response_time_ms ? Math.round(stats.avg_response_time_ms) : 0}ms</p>
          </div>
          <div>
            <p className="text-slate-400">Success</p>
            <p className="font-semibold text-green-400">{stats.success_count || 0}</p>
          </div>
          <div>
            <p className="text-slate-400">Errors</p>
            <p className="font-semibold text-red-400">{stats.error_count || 0}</p>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-400">
          No call logs yet. Make a request to this mock to see logs here.
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">{formatTimestamp(log.created_at)}</p>
                    <p className="text-sm font-medium text-white">
                      {log.request_method} {log.request_path}
                    </p>
                  </div>
                  <div className={`text-right text-sm font-semibold ${statusColor(log.response_status)}`}>
                    {log.response_status}
                  </div>
                  <div className="ml-2 text-xs text-slate-400">{log.response_time_ms}ms</div>
                </div>

                {selectedLog?.id === log.id && (
                  <div className="mt-3 space-y-2 border-t border-white/10 pt-3 text-xs">
                    {log.request_query_params && Object.keys(log.request_query_params).length > 0 && (
                      <div>
                        <p className="font-semibold text-slate-300">Query Params:</p>
                        <pre className="overflow-x-auto rounded bg-slate-950 p-2 text-slate-300">
                          {formatJson(log.request_query_params)}
                        </pre>
                      </div>
                    )}

                    {log.request_body && (
                      <div>
                        <p className="font-semibold text-slate-300">Request Body:</p>
                        <pre className="overflow-x-auto rounded bg-slate-950 p-2 text-slate-300">
                          {typeof log.request_body === 'string' ? log.request_body : formatJson(log.request_body)}
                        </pre>
                      </div>
                    )}

                    {log.response_body && (
                      <div>
                        <p className="font-semibold text-slate-300">Response Body:</p>
                        <pre className="overflow-x-auto rounded bg-slate-950 p-2 text-slate-300">
                          {typeof log.response_body === 'string' ? log.response_body : formatJson(log.response_body)}
                        </pre>
                      </div>
                    )}

                    {log.request_headers && Object.keys(log.request_headers).length > 0 && (
                      <details>
                        <summary className="cursor-pointer font-semibold text-slate-300">Request Headers</summary>
                        <pre className="mt-1 overflow-x-auto rounded bg-slate-950 p-2 text-slate-300">
                          {formatJson(log.request_headers)}
                        </pre>
                      </details>
                    )}

                    {log.response_headers && Object.keys(log.response_headers).length > 0 && (
                      <details>
                        <summary className="cursor-pointer font-semibold text-slate-300">Response Headers</summary>
                        <pre className="mt-1 overflow-x-auto rounded bg-slate-950 p-2 text-slate-300">
                          {formatJson(log.response_headers)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-xs">
            <div className="text-slate-400">
              Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
              {pagination.total} calls
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
              <button
                onClick={handleClearLogs}
                className="rounded border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-rose-300 transition hover:bg-rose-400/20"
              >
                Clear All
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CallLogsPanel
