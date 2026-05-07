function Section({ title, children }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur lg:p-8">
      <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">{children}</div>
    </section>
  )
}

function GuidePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur lg:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-teal-300/80">Guide</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">Complete User Guide</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Learn how to create mock endpoints, test them locally, simulate delays and errors, use advanced request matching,
          share URLs publicly, and set custom response headers. Everything you need to know about the API Mock Simulator.
        </p>
      </section>

      <div className="grid gap-6">
        {/* ===== 1. Getting Started ===== */}
        <Section title="1. Getting Started - Create Your First Mock">
          <div>
            <p className="font-semibold text-white">Step-by-step:</p>
            <ol className="mt-3 space-y-2 pl-4">
              <li>1. Click <span className="font-semibold text-teal-300">Create API</span> in the top navigation</li>
              <li>2. Choose an <span className="font-semibold text-teal-300">Endpoint</span> (e.g., <span className="font-mono text-slate-200">/users</span>)</li>
              <li>3. Select an HTTP <span className="font-semibold text-teal-300">Method</span> (GET, POST, PUT, or DELETE)</li>
              <li>4. Enter your <span className="font-semibold text-teal-300">JSON Response</span></li>
              <li>5. Set <span className="font-semibold text-teal-300">Status Code</span> (default 200)</li>
              <li>6. Click <span className="font-semibold text-teal-300">Save API</span></li>
            </ol>
          </div>
          <div className="mt-4 rounded-2xl border border-teal-400/20 bg-teal-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-teal-300">URL Mapping Explained</p>
            <p className="mt-2">
              Your endpoint gets served at <span className="font-mono text-teal-300">/mock</span> + endpoint.
            </p>
            <p className="mt-1">
              If endpoint is <span className="font-mono text-teal-300">/users</span> → request URL is
              <span className="font-mono text-teal-300"> /mock/users</span>
            </p>
            <p className="mt-1">
              If endpoint is <span className="font-mono text-teal-300">/api/v1/users</span> → request URL is
              <span className="font-mono text-teal-300"> /mock/api/v1/users</span>
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Example Response JSON</p>
            <pre className="mt-2 overflow-auto rounded bg-black/50 p-3 text-xs font-mono text-teal-300">
{`{
  "success": true,
  "data": [
    {"id": 1, "name": "John", "email": "john@test.com"},
    {"id": 2, "name": "Jane", "email": "jane@test.com"}
  ],
  "total": 2
}`}
            </pre>
          </div>
        </Section>

        {/* ===== 2. Test Your Mock ===== */}
        <Section title="2. Test Your Mock with the Built-in Tester">
          <p>
            The <span className="font-semibold text-white">API Tester</span> lets you send live requests to your mocks
            without leaving the app.
          </p>
          <div className="mt-3 space-y-2">
            <p><span className="font-semibold text-teal-300">URL</span> - Full mock URL (e.g., <span className="font-mono">http://localhost:5000/mock/users</span>)</p>
            <p><span className="font-semibold text-teal-300">Method</span> - GET, POST, PUT, or DELETE</p>
            <p><span className="font-semibold text-teal-300">Request Body</span> - (For POST/PUT) JSON data to send</p>
            <p><span className="font-semibold text-teal-300">Response</span> - Status code, response time, body, and headers</p>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Testing a POST request with body</p>
            <pre className="mt-2 overflow-auto rounded bg-black/50 p-3 text-xs font-mono text-teal-300">
{`POST: http://localhost:5000/mock/users/login
Body: {"email": "user@test.com", "password": "pass123"}

Response:
Status: 200
Time: 24 ms
Headers: [see below]
Body: {"success": true, "token": "abc123xyz"}`}
            </pre>
          </div>
        </Section>

        {/* ===== 3. Simulate Real-World Behavior ===== */}
        <Section title="3. Simulate Real-World Behavior - Delays, Errors & Traffic Limits">
          <p>Make your mocks behave like real APIs by adding latency, random failures, and request caps.</p>
          <div className="mt-3 space-y-3">
            <div>
              <p className="font-semibold text-teal-300">Delay (milliseconds)</p>
              <p className="text-xs text-slate-400">0-86,400,000 ms (up to 24 hours)</p>
              <p className="mt-1">
                Use to simulate network latency. Example: <span className="font-mono text-slate-200">2000</span> = 2-second delay
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Error Rate (0-100%)</p>
              <p className="text-xs text-slate-400">Percentage chance to return 500 error</p>
              <p className="mt-1">
                Perfect for testing retry logic. Example: <span className="font-mono text-slate-200">30</span> = 30% chance of error
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Traffic Limit</p>
              <p className="text-xs text-slate-400">Fixed window rate limit per mock</p>
              <p className="mt-1">
                Example: <span className="font-mono text-slate-200">5 requests / 60000 ms</span> returns <span className="font-mono text-slate-200">429 Too Many Requests</span> after the 5th call within a minute.
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-amber-300">Use Case: Test Timeout Handling</p>
            <p className="mt-2">
              Set delay to 5000 ms (5 seconds). In your app, set HTTP timeout to 3 seconds. Your code should catch
              the timeout error gracefully.
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-red-300">Use Case: Test Rate-Limit Handling</p>
            <p className="mt-2">
              Set the traffic limit to 3 requests per 60000 ms. Send 4 requests quickly. The first 3 should succeed and the 4th should return <span className="font-mono text-slate-200">429</span>.
            </p>
          </div>
        </Section>

        {/* ===== 4. Request-Based Responses ===== */}
        <Section title="4. Advanced: Request-Based Response Rules">
          <p>
            Return <span className="font-semibold text-white">different responses</span> based on what the client sends.
            Perfect for testing login flows, permissions, filtering, and error scenarios.
          </p>
          <div className="mt-3 space-y-2">
            <p><span className="font-semibold text-teal-300">Source</span> - Where to check data: body, query, or headers</p>
            <p><span className="font-semibold text-teal-300">Field</span> - The field name (supports nested like <span className="font-mono">user.email</span>)</p>
            <p><span className="font-semibold text-teal-300">Operator</span> - equals, notEquals, contains, startsWith, endsWith, exists</p>
            <p><span className="font-semibold text-teal-300">Value</span> - What to match against</p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm">
            <p className="font-semibold text-white">Real Example: Login API</p>
            <pre className="mt-2 overflow-auto rounded bg-black/50 p-3 text-xs font-mono text-teal-300">
{`[
  {
    "when": {
      "source": "body",
      "field": "email",
      "operator": "equals",
      "value": "admin@test.com"
    },
    "status_code": 200,
    "response": {
      "success": true,
      "role": "admin",
      "token": "admin_token_xyz"
    }
  },
  {
    "when": {
      "source": "body",
      "field": "email",
      "operator": "notEquals",
      "value": "admin@test.com"
    },
    "status_code": 401,
    "response": {
      "success": false,
      "error": "Invalid credentials"
    }
  }
]`}
            </pre>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-cyan-300">More Examples</p>
            <p className="mt-2">
              <span className="font-semibold">Query Parameter:</span> Check <span className="font-mono">source: "query"</span>,
              field <span className="font-mono">role</span>, operator <span className="font-mono">equals</span>, value
              <span className="font-mono">admin</span>
            </p>
            <p className="mt-2">
              <span className="font-semibold">Request Header:</span> Check <span className="font-mono">source: "headers"</span>,
              field <span className="font-mono">authorization</span>, operator <span className="font-mono">startsWith</span>,
              value <span className="font-mono">Bearer</span>
            </p>
            <p className="mt-2">
              <span className="font-semibold">Nested Body Field:</span> Field <span className="font-mono">user.profile.role</span>
              to check deep nested properties
            </p>
          </div>
        </Section>

        {/* ===== 5. Response Headers ===== */}
        <Section title="5. Custom Response Headers">
          <p>
            Response headers are HTTP metadata (not the body) that your client code can read. Use them for versioning,
            caching, rate limiting, request IDs, auth metadata, and more.
          </p>
          <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm">
            <p className="font-semibold text-white">Common Headers</p>
            <pre className="mt-2 overflow-auto rounded bg-black/50 p-3 text-xs font-mono text-teal-300">
{`{
  "X-API-Version": "2.0",
  "X-RateLimit-Limit": "1000",
  "X-RateLimit-Remaining": "999",
  "X-Request-ID": "req-12345-abc",
  "Cache-Control": "no-cache",
  "Content-Type": "application/json"
}`}
            </pre>
          </div>
          <div className="mt-4 rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-purple-300">How to View Headers in the Tester</p>
            <ol className="mt-2 space-y-1 pl-4 list-decimal">
              <li>Add headers to your mock in the editor (JSON format)</li>
              <li>Save the mock</li>
              <li>Go to API Tester and send a request</li>
              <li>Scroll down to <span className="font-semibold text-white">Response Headers</span> section</li>
              <li>See all headers returned by the mock</li>
            </ol>
          </div>
        </Section>

        {/* ===== 6. Webhooks - Outbound Calls ===== */}
        <Section title="6. Webhooks - Trigger Outbound HTTP Calls">
          <p>
            Webhooks are HTTP calls that your mock makes to OTHER services when someone calls your mock. Perfect for
            testing code that listens for callbacks or webhook events.
          </p>
          <div className="mt-3 space-y-2">
            <p><span className="font-semibold text-teal-300">What happens:</span> Client calls your mock → Your mock responds immediately → Your mock ALSO calls webhook URLs in the background</p>
            <p><span className="font-semibold text-teal-300">Response time:</span> Webhook calls don't block or slow down the mock response (async/non-blocking)</p>
            <p><span className="font-semibold text-teal-300">Webhook payload:</span> Includes event type, timestamp, mock endpoint, original request, and mock response</p>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm">
            <p className="font-semibold text-white">Real-world Example: Payment Processing</p>
            <p className="mt-2 text-slate-300">
              <span className="font-semibold text-white">1.</span> Your app calls <span className="font-mono text-teal-300">POST /mock/payment/charge</span>
            </p>
            <p className="mt-1 text-slate-300">
              <span className="font-semibold text-white">2.</span> Mock immediately returns <span className="font-mono">{"{"} "success": true {"}"}</span>
            </p>
            <p className="mt-1 text-slate-300">
              <span className="font-semibold text-white">3.</span> At the same time, mock POSTs to <span className="font-mono text-teal-300">https://your-app.com/webhooks/payment-completed</span>
            </p>
            <p className="mt-1 text-slate-300">
              <span className="font-semibold text-white">4.</span> Your app receives the webhook and processes the payment confirmation
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-purple-300">How to Set Up Webhooks</p>
            <ol className="mt-2 space-y-1 pl-4 list-decimal">
              <li>Open your mock in the editor</li>
              <li>Scroll to <span className="font-semibold text-white">Webhook URLs</span> section</li>
              <li>Enter one URL per line (example: <span className="font-mono">https://your-app.com/webhook</span>)</li>
              <li>Save the mock</li>
              <li>Test the mock in the Tester. The webhook URL will be called in the background</li>
              <li>Webhook logs will be available on the mock details page</li>
            </ol>
          </div>
        </Section>

        {/* ===== 7. Call Logs / Request History ===== */}
        <Section title="7. Call Logs - Monitor Request History">
          <p>
            Every time someone calls your mock, the request and response are automatically logged. Use these logs to
            debug integrations, verify request payloads, and analyze response times.
          </p>
          <div className="mt-3 space-y-2">
            <p>
              <span className="font-semibold text-teal-300">Where to Find Logs:</span> Open any mock in the editor.
              Scroll to the bottom to see the <span className="font-semibold text-white">Request History / Call Logs</span> section
            </p>
            <p>
              <span className="font-semibold text-teal-300">What Gets Logged:</span> Method, endpoint, query parameters,
              request body, response status, response body, response headers, and response time in milliseconds
            </p>
            <p>
              <span className="font-semibold text-teal-300">Stats at a Glance:</span> Total calls, average response time,
              success count, and error count for each mock
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-blue-300">How to Use Call Logs</p>
            <ol className="mt-2 space-y-1 pl-4 list-decimal">
              <li>Make a request to your mock using the Tester or from your app code</li>
              <li>Open the mock editor and scroll to <span className="font-semibold text-white">Request History</span></li>
              <li>Each call appears as a log entry with timestamp, method, endpoint, status, and response time</li>
              <li>Click a log entry to expand and see full request/response details</li>
              <li>Use <span className="font-semibold text-white">Refresh</span> to reload the latest logs</li>
              <li>Use <span className="font-semibold text-white">Clear All</span> to delete all logs for this mock</li>
            </ol>
          </div>
          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-cyan-300">What You Can Inspect in Each Log</p>
            <div className="mt-2 space-y-1 text-xs">
              <p><span className="font-semibold text-white">Query Params:</span> URL parameters sent with the request (e.g., ?search=users)</p>
              <p><span className="font-semibold text-white">Request Body:</span> JSON data sent in POST/PUT requests</p>
              <p><span className="font-semibold text-white">Response Body:</span> The JSON response returned by your mock</p>
              <p><span className="font-semibold text-white">Request Headers:</span> HTTP headers like Content-Type, Authorization, User-Agent</p>
              <p><span className="font-semibold text-white">Response Headers:</span> Custom headers added by your mock configuration</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-amber-300">Debugging Tips</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc text-xs">
              <li><span className="font-semibold text-white">Check Status Codes:</span> Green (2xx) = success, Red (4xx/5xx) = error</li>
              <li><span className="font-semibold text-white">Analyze Response Times:</span> Compare avg response time to your delay setting</li>
              <li><span className="font-semibold text-white">Verify Payloads:</span> Expand a log and check if request body matches expectations</li>
              <li><span className="font-semibold text-white">Monitor Headers:</span> Verify your custom response headers are being sent</li>
              <li><span className="font-semibold text-white">Pagination:</span> Logs show 50 at a time. Use Next/Previous to browse history</li>
            </ul>
          </div>
        </Section>

        {/* ===== 8. Public URLs ===== */}
        <Section title="8. Share Your Mocks Publicly">
          <p>
            Create shareable URLs for your mocks that work outside your local network. Perfect for demos, team
            collaboration, and testing integrations.
          </p>
          <div className="mt-3 space-y-2">
            <p>
              <span className="font-semibold text-teal-300">Make Public:</span> Click the
              <span className="font-semibold text-white"> Make Public</span> button on any mock
            </p>
            <p>
              <span className="font-semibold text-teal-300">Share URL:</span> Copy and share the generated URL with anyone
            </p>
            <p>
              <span className="font-semibold text-teal-300">Revoke Access:</span> Click
              <span className="font-semibold text-white"> Revoke Public</span> to disable the link instantly
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-green-400/20 bg-green-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-green-300">Public URL Example</p>
            <p className="mt-2 break-all font-mono text-xs text-teal-300">http://localhost:5000/public/mock/a1b2c3d4e5f6g7h8</p>
            <p className="mt-2 text-xs">
              The token is unique and hard to guess. Anyone with the URL can call your mock. Revoking it returns a 404.
            </p>
          </div>
        </Section>

        {/* ===== 9. Dashboard Tips ===== */}
        <Section title="9. Dashboard - Manage All Your Mocks">
          <p>The dashboard shows all your mocks in one place with useful filters and actions.</p>
          <div className="mt-3 space-y-2">
            <p><span className="font-semibold text-teal-300">Search:</span> Filter by endpoint name, method, or response content</p>
            <p><span className="font-semibold text-teal-300">Filter by Method:</span> Show only GET, POST, PUT, or DELETE mocks</p>
            <p><span className="font-semibold text-teal-300">Filter by Status:</span> Show active or disabled mocks</p>
            <p><span className="font-semibold text-teal-300">Filter by Sharing:</span> Show public or private mocks</p>
            <p><span className="font-semibold text-teal-300">Filter by Category:</span> Group and filter mocks using the optional Category field in the editor</p>
            <p><span className="font-semibold text-teal-300">Duplicate:</span> Clone a mock to create similar endpoints faster</p>
            <p><span className="font-semibold text-teal-300">Edit:</span> Modify any mock configuration</p>
            <p><span className="font-semibold text-teal-300">Delete:</span> Remove mocks you no longer need</p>
          </div>
        </Section>

        {/* ===== 10. Export & Import ===== */}
        <Section title="10. Export & Import - Backup and Share Mock Configurations">
          <p>
            Export all your mocks as JSON to backup your setup or share with teammates. Import JSON files to quickly
            restore or duplicate mocks across different instances of the app.
          </p>
          <div className="mt-3 space-y-2">
            <p>
              <span className="font-semibold text-teal-300">Export All:</span> Click the
              <span className="font-semibold text-white"> Export All</span> button in the dashboard. Your browser will
              download a JSON file containing all mocks with their full configuration.
            </p>
            <p>
              <span className="font-semibold text-teal-300">Import Mocks:</span> Click the
              <span className="font-semibold text-white"> Import Mocks</span> button and select a JSON file. All mocks
              in the file will be created in your app.
            </p>
            <p>
              <span className="font-semibold text-teal-300">File Format:</span> Exported JSON includes endpoint, method,
              response, request rules, response headers, webhooks, status code, delay, error rate, and active status.
            </p>
          </div>
          <div className="mt-4 rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-indigo-300">Use Cases for Export/Import</p>
            <div className="mt-2 space-y-1 text-xs">
              <p><span className="font-semibold text-white">Backup:</span> Export mocks regularly as backup before major changes</p>
              <p><span className="font-semibold text-white">Team Sharing:</span> Export your mocks and share the JSON with teammates</p>
              <p><span className="font-semibold text-white">Migration:</span> Export from one instance and import to another instance or server</p>
              <p><span className="font-semibold text-white">Version Control:</span> Commit exported JSON to git for tracking changes</p>
              <p><span className="font-semibold text-white">Template Reuse:</span> Create a base set of mocks, export once, import many times</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-pink-400/20 bg-pink-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-pink-300">Export/Import Workflow Example</p>
            <ol className="mt-2 space-y-1 pl-4 list-decimal text-xs">
              <li>Create 10 mocks for your API (users, products, payments, etc.)</li>
              <li>Click <span className="font-semibold text-white">Export All</span> on dashboard → downloads <span className="font-mono">mocks-2026-04-29.json</span></li>
              <li>Share the JSON file with your team via email or commit to git</li>
              <li>Team member clicks <span className="font-semibold text-white">Import Mocks</span> and selects your JSON file</li>
              <li>All 10 mocks are instantly created in their local app with same configuration</li>
              <li>Everyone is working with identical mock data → consistent testing!</li>
            </ol>
          </div>
          <div className="mt-4 rounded-2xl border border-orange-400/20 bg-orange-400/10 p-4 text-sm text-slate-200">
            <p className="font-semibold text-orange-300">Important Notes</p>
            <ul className="mt-2 space-y-1 pl-4 list-disc text-xs">
              <li><span className="font-semibold text-white">Duplicates:</span> If a mock with the same endpoint+method exists, import will fail for that mock</li>
              <li><span className="font-semibold text-white">IDs:</span> Imported mocks get new IDs. Webhooks and logs are not exported</li>
              <li><span className="font-semibold text-white">Filename Format:</span> Exported files use <span className="font-mono">mocks-YYYY-MM-DD.json</span> naming</li>
              <li><span className="font-semibold text-white">Partial Import:</span> If some mocks fail to import, others will still be created. Check error messages.</li>
            </ul>
          </div>
        </Section>

        {/* ===== 11. Tips & Tricks ===== */}
        <Section title="11. Tips & Tricks for Power Users">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-teal-300">Tip 1: Test Error Scenarios</p>
              <p className="mt-1">Set error rate to 100% to simulate an endpoint that's always failing. Use with delay to test client retry logic.</p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Tip 2: Multiple Response Paths</p>
              <p className="mt-1">Create request rules that match different user roles, so one endpoint returns admin data for admin users and regular data for regular users.</p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Tip 3: Use Realistic Delays</p>
              <p className="mt-1">Network calls typically take 50-200 ms. Set delays to match real-world expectations so your app can be tested properly.</p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Tip 4: Monitor Response Headers</p>
              <p className="mt-1">Your client code might check headers like X-RateLimit-Remaining. Add those headers to your mock so you can test that logic.</p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Tip 5: Structure Endpoints Logically</p>
              <p className="mt-1">Use paths like <span className="font-mono">/api/v1/users</span>, <span className="font-mono">/api/v1/products</span> to organize mocks by feature and API version.</p>
            </div>
          </div>
        </Section>

        {/* ===== 12. Common Questions ===== */}
        <Section title="12. Frequently Asked Questions">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-teal-300">Q: Why is my endpoint at /mock/api/... instead of just /api/...?</p>
              <p className="mt-1">
                A: The app routes all mocks through <span className="font-mono">/mock</span> to separate them from the
                management API. Your endpoint is appended after /mock. This keeps mocks isolated.
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Q: Can I use the same endpoint with multiple methods?</p>
              <p className="mt-1">
                A: Yes! <span className="font-mono">GET /users</span> and <span className="font-mono">POST /users</span>
                are two separate mocks. The app matches both endpoint AND method.
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Q: How do request rules work if multiple rules match?</p>
              <p className="mt-1">
                A: The <span className="font-semibold text-white">first matching rule</span> is used. Order matters! Put
                more specific rules before general ones.
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Q: Will headers show in the tester?</p>
              <p className="mt-1">
                A: Yes. After saving a mock with headers, go to Tester, send a request, and scroll to Response Headers
                section to see them.
              </p>
            </div>
            <div>
              <p className="font-semibold text-teal-300">Q: Can I temporarily disable a mock without deleting it?</p>
              <p className="mt-1">
                A: Yes! Click the toggle button to disable a mock. Disabled mocks won't respond to requests but stay
                in your dashboard.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

export default GuidePage
