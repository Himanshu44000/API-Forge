import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Field from '../components/Field.jsx'
import { getApiBaseUrl } from '../services/api.js'

const DEFAULT_URL = `${getApiBaseUrl()}/mock/users`
const METHODS = ['GET', 'POST', 'PUT', 'DELETE']

function TesterPage() {
  const [requestUrl, setRequestUrl] = useState(DEFAULT_URL)
  const [method, setMethod] = useState('GET')
  const [requestBodyText, setRequestBodyText] = useState('{}')
  const [loading, setLoading] = useState(false)
  const [statusCode, setStatusCode] = useState('')
  const [responseTime, setResponseTime] = useState('')
  const [responseBody, setResponseBody] = useState(null)
  const [responseHeaders, setResponseHeaders] = useState([])
  const [responseError, setResponseError] = useState('')
  const [bodyError, setBodyError] = useState('')

  const prettyBody = useMemo(() => {
    if (responseBody === null) {
      return ''
    }

    if (typeof responseBody === 'string') {
      return responseBody
    }

    return JSON.stringify(responseBody, null, 2)
  }, [responseBody])

  const sendRequest = async (event) => {
    event.preventDefault()

    let requestBody = undefined
    const isBodyMethod = ['POST', 'PUT'].includes(method)

    if (isBodyMethod) {
      try {
        requestBody = requestBodyText.trim() ? JSON.parse(requestBodyText) : {}
        setBodyError('')
      } catch {
        setBodyError('Request body must be valid JSON')
        toast.error('Invalid JSON in request body')
        return
      }
    }

    try {
      setLoading(true)
      setResponseError('')
      setResponseBody(null)
      setResponseHeaders([])
      setStatusCode('')
      setResponseTime('')

      const fetchOptions = {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }

      if (requestBody !== undefined) {
        fetchOptions.body = JSON.stringify(requestBody)
      }

      const startedAt = performance.now()
      const response = await fetch(requestUrl, fetchOptions)
      const elapsed = Math.round(performance.now() - startedAt)
      const text = await response.text()
      const headersList = Array.from(response.headers.entries()).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))

      let parsedBody = text
      try {
        parsedBody = text ? JSON.parse(text) : null
      } catch {
        parsedBody = text
      }

      setStatusCode(String(response.status))
      setResponseTime(`${elapsed} ms`)
      setResponseHeaders(headersList)
      setResponseBody(parsedBody)

      if (!response.ok) {
        setResponseError(typeof parsedBody === 'string' ? parsedBody : parsedBody?.message || 'Request failed')
      } else {
        toast.success('Request completed')
      }
    } catch (requestError) {
      setResponseError(requestError?.message || 'Unable to send request')
      toast.error('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <form className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur lg:p-8" onSubmit={sendRequest}>
        <p className="text-xs uppercase tracking-[0.32em] text-teal-300/80">API Tester</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Call a mock endpoint</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Send a live request to the generated backend route and inspect the status code,
          body, and timing.
        </p>

        <div className="mt-8 space-y-5">
          <Field label="URL" hint="Full mock URL">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
              value={requestUrl}
              onChange={(event) => setRequestUrl(event.target.value)}
            />
          </Field>

          <Field label="Method">
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/60"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              {METHODS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          {['POST', 'PUT'].includes(method) ? (
            <Field label="Request Body" hint="JSON format" error={bodyError}>
              <textarea
                className="min-h-[200px] w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400/60"
                placeholder='{"key": "value"}'
                value={requestBodyText}
                onChange={(event) => setRequestBodyText(event.target.value)}
              />
            </Field>
          ) : null}
        </div>

        <button
          className="mt-8 inline-flex items-center justify-center rounded-full bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading || !requestUrl.trim()}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur lg:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-teal-300/80">Response</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">Result details</h2>
          </div>

          <div className="grid gap-2 text-sm text-slate-300 sm:text-right">
            <p>
              <span className="text-slate-500">Status:</span> {statusCode || '—'}
            </p>
            <p>
              <span className="text-slate-500">Time:</span> {responseTime || '—'}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/80 p-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Response Headers</p>
              <p className="text-xs text-slate-500">Headers returned by the mock response</p>
            </div>

            {responseHeaders.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {responseHeaders.map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-mono text-teal-300">{key}</span>
                    <span className="break-all font-mono text-slate-200">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                No response headers were returned yet. Add custom headers in the editor to see them here.
              </p>
            )}
          </div>

          {responseError ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
              {responseError}
            </div>
          ) : null}

          <pre className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-black/30 p-4 font-mono text-sm text-slate-100">
            {prettyBody || 'Send a request to inspect the mock response here.'}
          </pre>
        </div>
      </section>
    </div>
  )
}

export default TesterPage
