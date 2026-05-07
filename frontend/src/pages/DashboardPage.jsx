import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ApiTable from '../components/ApiTable.jsx'
import Sparkline from '../components/Sparkline.jsx'
import DashboardCharts from '../components/DashboardCharts.jsx'
import { useMockApis } from '../hooks/useMockApis.js'
import {
  buildMockUrl,
  deleteMockApi,
  duplicateMockApi,
  revokeMockApiShare,
  shareMockApi,
  toggleMockApi,
  exportMocks,
  importMocks,
} from '../services/mockApi.js'

function DashboardPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [method, setMethod] = useState('')
  const [active, setActive] = useState('all')
  const [sharing, setSharing] = useState('all')
  const [category, setCategory] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const { apis, loading, error, refresh } = useMockApis({ search, method, active, sharing, category })

  const [analytics, setAnalytics] = useState(null)
  const [mockSeries, setMockSeries] = useState({})

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const overview = await import('../services/mockApi.js').then((m) => m.getAnalyticsOverview())
        if (!mounted) return
        setAnalytics(overview)

        // fetch timeseries for top 3 mocks
        const top = overview.topMocks || []
        const toFetch = top.slice(0, 3)
        const series = {}
        await Promise.all(
          toFetch.map(async (t) => {
            const res = await import('../services/mockApi.js').then((m) => m.getMockTimeseries(t.id))
            series[t.id] = res.data.map((r) => r.count)
          })
        )
        if (mounted) setMockSeries(series)
      } catch (err) {
        // ignore analytics errors for now
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const total = apis.length
    const activeCount = apis.filter((item) => item.is_active).length
    const averageDelay = total
      ? Math.round(apis.reduce((sum, item) => sum + Number(item.delay || 0), 0) / total)
      : 0

    return { total, activeCount, averageDelay }
  }, [apis])

  const categories = useMemo(() => {
    const set = new Set()
    apis.forEach((a) => {
      if (a.category && String(a.category).trim()) set.add(String(a.category).trim())
    })
    return Array.from(set).sort()
  }, [apis])

  const copyUrl = async (api) => {
    try {
      await navigator.clipboard.writeText(buildMockUrl(api.endpoint))
      toast.success('Mock URL copied')
    } catch {
      toast.error('Clipboard access was blocked')
    }
  }

  const handleDelete = async (api) => {
    const confirmed = window.confirm(`Delete mock API ${api.endpoint}?`)

    if (!confirmed) {
      return
    }

    try {
      setActionLoadingId(api.id)
      await deleteMockApi(api.id)
      toast.success('Mock API deleted')
      refresh()
    } catch (deleteError) {
      toast.error(deleteError?.response?.data?.message || 'Failed to delete API')
    } finally {
      setActionLoadingId('')
    }
  }

  const handleToggle = async (api) => {
    try {
      setActionLoadingId(api.id)
      await toggleMockApi(api.id)
      toast.success(api.is_active ? 'Mock API disabled' : 'Mock API enabled')
      refresh()
    } catch (toggleError) {
      toast.error(toggleError?.response?.data?.message || 'Failed to update API status')
    } finally {
      setActionLoadingId('')
    }
  }

  const handleDuplicate = async (api) => {
    try {
      setActionLoadingId(api.id)
      await duplicateMockApi(api.id)
      toast.success('Mock API duplicated')
      refresh()
    } catch (duplicateError) {
      toast.error(duplicateError?.response?.data?.message || 'Failed to duplicate API')
    } finally {
      setActionLoadingId('')
    }
  }

  const handleShare = async (api) => {
    try {
      setActionLoadingId(api.id)
      const result = await shareMockApi(api.id)
      const publicUrl = result?.data?.public_url

      if (publicUrl) {
        await navigator.clipboard.writeText(publicUrl)
      }

      toast.success('Public URL generated and copied')
      refresh()
    } catch (shareError) {
      toast.error(shareError?.response?.data?.message || 'Failed to generate public URL')
    } finally {
      setActionLoadingId('')
    }
  }

  const handleCopyPublicUrl = async (api) => {
    if (!api.public_url) {
      toast.error('Generate a public URL first')
      return
    }

    try {
      await navigator.clipboard.writeText(api.public_url)
      toast.success('Public URL copied')
    } catch {
      toast.error('Clipboard access was blocked')
    }
  }

  const handleRevokeShare = async (api) => {
    try {
      setActionLoadingId(api.id)
      await revokeMockApiShare(api.id)
      toast.success('Public URL revoked')
      refresh()
    } catch (revokeError) {
      toast.error(revokeError?.response?.data?.message || 'Failed to revoke public URL')
    } finally {
      setActionLoadingId('')
    }
  }

  const handleEdit = (api) => {
    navigate(`/apis/${api.id}`)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const result = await exportMocks()

      // Create JSON file download
      const dataStr = JSON.stringify(result.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `mocks-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Exported ${result.count} mock(s)`)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to export mocks')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setIsImporting(true)
      const fileContent = await file.text()
      const parsedData = JSON.parse(fileContent)

      // Handle both direct array or data property
      const mocksToImport = Array.isArray(parsedData) ? parsedData : parsedData.data

      if (!Array.isArray(mocksToImport)) {
        throw new Error('Invalid import format: must contain array of mocks')
      }

      const result = await importMocks(mocksToImport)

      if (result.summary.failed > 0) {
        toast.error(
          `Imported ${result.summary.successful}/${result.summary.total} mocks. ${result.summary.failed} failed.`
        )
      } else {
        toast.success(`Successfully imported ${result.summary.successful} mock(s)`)
      }

      refresh()
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON file format')
      } else {
        toast.error(error?.message || 'Failed to import mocks')
      }
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total APIs', value: stats.total },
          { label: 'Active APIs', value: stats.activeCount },
          { label: 'Average delay', value: `${stats.averageDelay} ms` },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{card.label}</p>
            <p className="mt-4 font-display text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </section>

      {analytics ? <DashboardCharts analytics={analytics} mockSeries={mockSeries} /> : null}

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-teal-300/80">Management</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">Mock APIs</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Search, update, duplicate, or disable endpoints from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
              to="/apis/new"
            >
              Create API
            </Link>
            <Link
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              to="/tester"
            >
              Open Tester
            </Link>
            <button
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-50"
              onClick={handleExport}
              disabled={isExporting || stats.total === 0}
              title={stats.total === 0 ? 'No mocks to export' : 'Download all mocks as JSON'}
            >
              {isExporting ? 'Exporting...' : 'Export All'}
            </button>
            <label className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
              <span>{isImporting ? 'Importing...' : 'Import Mocks'}</span>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr]">
          <input
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            placeholder="Search by endpoint, method, or response"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/60"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          >
            <option value="">All methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <select
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/60"
            value={active}
            onChange={(event) => setActive(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="true">Active only</option>
            <option value="false">Disabled only</option>
          </select>

          <select
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/60"
            value={sharing}
            onChange={(event) => setSharing(event.target.value)}
          >
            <option value="all">All sharing</option>
            <option value="public">Public only</option>
            <option value="private">Private only</option>
          </select>
          <select
            className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/60"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <ApiTable
        apis={apis}
        loading={loading}
        onCopyUrl={copyUrl}
        onCopyPublicUrl={handleCopyPublicUrl}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onEdit={handleEdit}
        onRevokeShare={handleRevokeShare}
        onShare={handleShare}
        onToggle={handleToggle}
      />

      {actionLoadingId ? (
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Working on {actionLoadingId}
        </p>
      ) : null}
    </div>
  )
}

export default DashboardPage
