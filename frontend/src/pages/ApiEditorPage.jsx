import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Field from '../components/Field.jsx'
import CallLogsPanel from '../components/CallLogsPanel.jsx'
import WebhookCallsPanel from '../components/WebhookCallsPanel.jsx'
import { buildMockUrl, createMockApi, getMockApi, updateMockApi } from '../services/mockApi.js'

const DEFAULT_FORM = {
  endpoint: '/users',
  method: 'GET',
  responseText: JSON.stringify({ message: 'Success', data: [] }, null, 2),
  requestRulesText: '[]',
  responseHeadersText: '{}',
  webhookUrlsText: '',
  category: '',
  status_code: '200',
  delay: '0',
  error_rate: '0',
  is_active: true,
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE']

function ApiEditorPage({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [jsonError, setJsonError] = useState('')
  const [rulesError, setRulesError] = useState('')
  const [headersError, setHeadersError] = useState('')
  const [webhookUrlsError, setWebhookUrlsError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadApi = async () => {
      if (mode !== 'edit') {
        return
      }

      try {
        setLoading(true)
        const result = await getMockApi(id)
        const mockApi = result.data

        if (!cancelled) {
          setForm({
            endpoint: mockApi.endpoint,
            method: mockApi.method,
            responseText: JSON.stringify(mockApi.response, null, 2),
            requestRulesText: JSON.stringify(mockApi.request_rules ?? [], null, 2),
            responseHeadersText: JSON.stringify(mockApi.response_headers ?? {}, null, 2),
            webhookUrlsText: (mockApi.webhook_urls ?? []).join('\n'),
            category: mockApi.category ?? '',
            status_code: String(mockApi.status_code),
            delay: String(mockApi.delay),
            error_rate: String(mockApi.error_rate),
            is_active: Boolean(mockApi.is_active),
          })
        }
      } catch (loadError) {
        toast.error(loadError?.response?.data?.message || 'Unable to load this API')
        navigate('/dashboard', { replace: true })
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadApi()

    return () => {
      cancelled = true
    }
  }, [id, mode, navigate])

  const previewUrl = useMemo(() => buildMockUrl(form.endpoint), [form.endpoint])

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))

    if (field === 'responseText') {
      try {
        JSON.parse(value)
        setJsonError('')
      } catch {
        setJsonError('Response must be valid JSON')
      }
    }

    if (field === 'requestRulesText') {
      try {
        const parsedRules = JSON.parse(value)

        if (!Array.isArray(parsedRules)) {
          setRulesError('Request rules must be a JSON array')
        } else {
          setRulesError('')
        }
      } catch {
        setRulesError('Request rules must be valid JSON')
      }
    }

    if (field === 'responseHeadersText') {
      try {
        const parsedHeaders = JSON.parse(value)

        if (typeof parsedHeaders !== 'object' || Array.isArray(parsedHeaders)) {
          setHeadersError('Response headers must be a JSON object')
        } else {
          setHeadersError('')
        }
      } catch {
        setHeadersError('Response headers must be valid JSON')
      }
    }

    if (field === 'webhookUrlsText') {
      const urls = value
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url)

      try {
        urls.forEach((url) => {
          new URL(url)
        })
        setWebhookUrlsError('')
      } catch {
        setWebhookUrlsError('Each webhook URL must be a valid HTTP/HTTPS URL')
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    let parsedResponse
    let parsedRequestRules
    let parsedResponseHeaders

    try {
      parsedResponse = JSON.parse(form.responseText)
      setJsonError('')
    } catch {
      setJsonError('Response must be valid JSON')
      toast.error('Please fix the JSON response before saving')
      return
    }

    try {
      parsedRequestRules = form.requestRulesText.trim() ? JSON.parse(form.requestRulesText) : []

      if (!Array.isArray(parsedRequestRules)) {
        throw new Error('Request rules must be a JSON array')
      }

      setRulesError('')
    } catch {
      setRulesError('Request rules must be valid JSON array')
      toast.error('Please fix the request rules before saving')
      return
    }

    try {
      parsedResponseHeaders = form.responseHeadersText.trim() ? JSON.parse(form.responseHeadersText) : {}

      if (typeof parsedResponseHeaders !== 'object' || Array.isArray(parsedResponseHeaders)) {
        throw new Error('Response headers must be a JSON object')
      }

      setHeadersError('')
    } catch {
      setHeadersError('Response headers must be valid JSON object')
      toast.error('Please fix the response headers before saving')
      return
    }

    let parsedWebhookUrls

    try {
      parsedWebhookUrls = form.webhookUrlsText
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url)

      parsedWebhookUrls.forEach((url) => {
        new URL(url)
      })

      setWebhookUrlsError('')
    } catch {
      setWebhookUrlsError('Each webhook URL must be a valid HTTP/HTTPS URL')
      toast.error('Please fix the webhook URLs before saving')
      return
    }

    try {
      setSaving(true)

      const payload = {
        endpoint: form.endpoint,
        method: form.method,
        response: parsedResponse,
        request_rules: parsedRequestRules,
        response_headers: parsedResponseHeaders,
        webhook_urls: parsedWebhookUrls,
        category: form.category ?? '',
        status_code: Number(form.status_code),
        delay: Number(form.delay),
        error_rate: Number(form.error_rate),
        is_active: form.is_active,
      }

      if (mode === 'edit') {
        await updateMockApi(id, payload)
        toast.success('Mock API updated')
      } else {
        await createMockApi(payload)
        toast.success('Mock API created')
      }

      navigate('/dashboard')
    } catch (saveError) {
      toast.error(saveError?.response?.data?.message || 'Failed to save API')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center shadow-glow">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-300/20 border-t-teal-300" />
        <p className="mt-4 text-sm text-slate-300">Loading API configuration...</p>
      </div>
    )
  }

  return (
    <>
      <form className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur lg:p-8" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-teal-300/80">
            {mode === 'edit' ? 'Edit' : 'Create'} API
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">
            {mode === 'edit' ? 'Update mock endpoint' : 'Define a new mock endpoint'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Configure the route, method, response payload, status code, and fault simulation behavior.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mock URL preview</p>
          <p className="mt-2 break-all font-mono text-xs text-teal-300">{previewUrl}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Field label="Endpoint" hint="Must start with /" error={!form.endpoint.startsWith('/') ? 'Endpoint must start with /' : ''}>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            placeholder="/users"
            value={form.endpoint}
            onChange={(event) => setField('endpoint', event.target.value)}
          />
        </Field>

        <Field label="Method" hint="Allowed: GET, POST, PUT, DELETE">
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/60"
            value={form.method}
            onChange={(event) => setField('method', event.target.value)}
          >
            {METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category" hint="Optional grouping label">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            placeholder="e.g. Orders, Users, Payments"
            value={form.category}
            onChange={(event) => setField('category', event.target.value)}
          />
        </Field>

        <Field label="Status code" hint="100-599">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            type="number"
            min="100"
            max="599"
            value={form.status_code}
            onChange={(event) => setField('status_code', event.target.value)}
          />
        </Field>

        <Field label="Delay" hint="Milliseconds">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            type="number"
            min="0"
            value={form.delay}
            onChange={(event) => setField('delay', event.target.value)}
          />
        </Field>

        <Field label="Error rate" hint="0-100%">
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            type="number"
            min="0"
            max="100"
            value={form.error_rate}
            onChange={(event) => setField('error_rate', event.target.value)}
          />
        </Field>

        <Field label="Active status" hint="Enable or disable the endpoint">
          <button
            className={[
              'w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition',
              form.is_active
                ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
                : 'border-white/10 bg-slate-950/80 text-slate-300',
            ].join(' ')}
            type="button"
            onClick={() => setField('is_active', !form.is_active)}
          >
            {form.is_active ? 'Enabled' : 'Disabled'}
          </button>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="JSON Response" hint="Valid JSON required" error={jsonError}>
          <textarea
            className="min-h-[240px] w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            placeholder='{"name":"Aman"}'
            value={form.responseText}
            onChange={(event) => setField('responseText', event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          label="Request-Based Response Rules"
          hint="JSON array of rules"
          error={rulesError}
        >
          <textarea
            className="min-h-[220px] w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            placeholder='[{"when":{"source":"body","field":"email","operator":"equals","value":"test@test.com"},"status_code":200,"response":{"success":true}}]'
            value={form.requestRulesText}
            onChange={(event) => setField('requestRulesText', event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          label="Response Headers"
          hint="JSON object of custom headers"
          error={headersError}
        >
          <textarea
            className="min-h-[180px] w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            placeholder='{"X-Custom-Header":"value","X-API-Version":"1.0"}'
            value={form.responseHeadersText}
            onChange={(event) => setField('responseHeadersText', event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          label="Webhook URLs (Optional)"
          hint="One URL per line. Webhooks POST to these URLs when mock is called"
          error={webhookUrlsError}
        >
          <textarea
            className="min-h-[140px] w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
            placeholder="https://your-app.com/webhooks/order-created&#10;https://logs.example.com/webhook"
            value={form.webhookUrlsText}
            onChange={(event) => setField('webhookUrlsText', event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-300">
        <p className="font-semibold text-white">Route mapping tip</p>
        <p className="mt-2">
          The final mock URL is always <span className="font-mono text-teal-300">/mock</span> + your endpoint.
          If your endpoint is <span className="font-mono text-teal-300">/users</span>, the request URL becomes
          <span className="font-mono text-teal-300"> /mock/users</span>. If you enter
          <span className="font-mono text-teal-300"> /api/users</span>, the request URL becomes
          <span className="font-mono text-teal-300"> /mock/api/users</span>.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center justify-center rounded-full bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={saving || Boolean(jsonError) || Boolean(rulesError) || Boolean(headersError) || Boolean(webhookUrlsError)}
        >
          {saving ? 'Saving...' : 'Save API'}
        </button>
        <button
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          type="button"
          onClick={() => navigate('/dashboard')}
        >
          Cancel
        </button>
      </div>
    </form>

    {mode === 'edit' && id && (
      <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur lg:p-8">
        <div className="space-y-6">
          <CallLogsPanel mockId={id} />
          <WebhookCallsPanel mockId={id} />
        </div>
      </div>
    )}
    </>
  )
}

export default ApiEditorPage
