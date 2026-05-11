function WhyPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-8 shadow-glow backdrop-blur sm:px-8 lg:px-10">
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">Why Do You Need API Forge?</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Modern development requires testing, integration testing, and development against realistic APIs. But setting up mock servers, managing test data, and simulating failures is complex and time-consuming. API Forge eliminates that burden.
        </p>
      </section>

      {/* Main Problems Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">The Problem</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Third-Party API Delays',
              description: 'Your frontend team waits weeks for backend APIs to be ready before they can start building.',
            },
            {
              title: 'Testing Failure Scenarios',
              description: 'Testing error handling requires breaking real production systems or manually triggering failures—risky and time-consuming.',
            },
            {
              title: 'Integration Testing',
              description: 'Your CI/CD pipeline depends on external services that are slow, flaky, or expensive to use during development.',
            },
            {
              title: 'No Traffic Control',
              description: 'You can\'t simulate real-world conditions like latency, timeouts, or partial failures without affecting other teams.',
            },
            {
              title: 'Data Privacy & Compliance',
              description: 'Using production data in development violates GDPR, HIPAA, and other compliance regulations.',
            },
            {
              title: 'Expensive Infrastructure',
              description: 'Setting up mock servers, databases, and monitoring tools requires expensive infrastructure and DevOps expertise.',
            },
          ].map((problem, idx) => (
            <div key={idx} className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5">
              <h3 className="font-semibold text-rose-200">{problem.title}</h3>
              <p className="mt-2 text-sm leading-6 text-rose-100/80">{problem.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">How API Forge Solves This</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: '⚡ Ship Faster',
              description: 'Frontend teams don\'t wait. Create mocks instantly and start developing immediately while backend teams catch up.',
            },
            {
              title: '🔧 Test Failure Scenarios',
              description: 'Simulate timeouts, errors, rate limits, and connection failures—without touching production. Your team builds resilient code.',
            },
            {
              title: '✅ Parallel Development',
              description: 'Frontend, backend, and mobile teams work independently using the same mock API contracts. No coordination bottlenecks.',
            },
            {
              title: '📊 Realistic Testing',
              description: 'Add latency, inject random failures, and simulate real-world conditions. Test how your app behaves under stress.',
            },
            {
              title: '🔐 Privacy & Compliance',
              description: 'Use synthetic data instead of production data. Stay GDPR, HIPAA, and PCI-DSS compliant while testing.',
            },
            {
              title: '🚀 Zero Infrastructure',
              description: 'No servers to manage, no databases to provision. Deploy to Vercel or Render in minutes. API Forge handles the rest.',
            },
          ].map((solution, idx) => (
            <div key={idx} className="rounded-2xl border border-teal-400/20 bg-teal-400/10 p-5">
              <h3 className="font-semibold text-teal-200">{solution.title}</h3>
              <p className="mt-2 text-sm leading-6 text-teal-100/80">{solution.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Who Can Benefit?</h2>
        <div className="space-y-4">
          {[
            {
              role: 'Frontend Developers',
              benefits: [
                'Start building UI without waiting for backend APIs',
                'Test edge cases and error states independently',
                'Mock multiple API responses for the same endpoint',
                'Work offline using pre-configured mock responses',
              ],
            },
            {
              role: 'Backend Developers',
              benefits: [
                'Share API contracts as executable mocks before implementation',
                'Let frontend teams develop against your spec',
                'Iterate on API design without blocking others',
                'Provide realistic test data to integration tests',
              ],
            },
            {
              role: 'QA & Testing Teams',
              benefits: [
                'Test failure scenarios that are hard to trigger in production',
                'Simulate rate limits and throttling',
                'Verify timeout handling and retry logic',
                'Create repeatable, deterministic test environments',
              ],
            },
            {
              role: 'Mobile Developers',
              benefits: [
                'Test on real devices with mocked backend responses',
                'Verify handling of slow networks and timeouts',
                'Share mocks with other team members',
                'Work offline against pre-recorded responses',
              ],
            },
            {
              role: 'DevOps & Release Engineers',
              benefits: [
                'Mock external dependencies in CI/CD pipelines',
                'Run integration tests without external service dependencies',
                'Simulate failure scenarios in staging',
                'Share mock servers across teams securely',
              ],
            },
          ].map((useCase, idx) => (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-bold text-teal-300">{useCase.role}</h3>
              <ul className="mt-4 space-y-2">
                {useCase.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-3 text-slate-300">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-teal-400 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Real World Scenarios */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Real-World Scenarios</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              scenario: 'E-Commerce Checkout Flow',
              description: 'Mock payment gateway, shipping calculator, and inventory APIs to test checkout without hitting live services. Simulate payment failures and timeout scenarios.',
            },
            {
              scenario: 'Mobile App Development',
              description: 'Create mocks for user authentication, profile endpoints, and data APIs. Test on real devices before backend is ready. Simulate network latency and failures.',
            },
            {
              scenario: 'Third-Party Integrations',
              description: 'Mock Stripe, SendGrid, Twilio, or any external API. Test integration code without rate limits or costs. Share mocks with your team.',
            },
            {
              scenario: 'Load Testing',
              description: 'Create high-response-time mocks to test how your frontend handles slow backend responses. Verify loading states and timeout handling.',
            },
            {
              scenario: 'CI/CD Pipelines',
              description: 'Replace external dependencies with mocks in your test pipeline. Run tests in parallel without hitting rate limits. Make your pipeline deterministic.',
            },
            {
              scenario: 'API Contract Testing',
              description: 'Define API contracts as mocks. Share with frontend and backend teams. Everyone develops against the same contract.',
            },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
              <h3 className="font-semibold text-amber-200">{item.scenario}</h3>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Highlight */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-white">What Makes API Forge Unique?</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { feature: 'Zero Config', desc: 'Create mocks in seconds, no setup needed' },
            { feature: 'Realistic Failures', desc: 'Inject latency, errors, and rate limits' },
            { feature: 'Response Templates', desc: 'Dynamic responses using placeholders' },
            { feature: 'Real-Time Logs', desc: 'Monitor all incoming requests live' },
            { feature: 'Public Sharing', desc: 'Share mocks with your team or clients' },
            { feature: 'Analytics', desc: 'Track usage, response times, and status codes' },
            { feature: 'No Backend Code', desc: 'Define mocks via UI, no programming needed' },
            { feature: 'Fully Hosted', desc: 'Deploy to Vercel and Render in minutes' },
            { feature: 'Open Source', desc: 'Transparent, auditable, community-driven' },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-400/20 bg-slate-400/5 p-4 text-center">
              <p className="font-semibold text-teal-300">{item.feature}</p>
              <p className="mt-2 text-xs text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-[2rem] border border-teal-400/30 bg-teal-400/10 px-6 py-10 text-center shadow-glow">
        <h2 className="text-3xl font-bold text-white">Ready to Ship Faster?</h2>
        <p className="mt-4 text-slate-300">Start creating mocks and accelerate your development workflow today.</p>
        <div className="mt-8 flex flex-col gap-3 justify-center sm:flex-row">
          <a
            className="rounded-full bg-teal-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-300"
            href="/apis/new"
          >
            Create Your First Mock
          </a>
          <a
            className="rounded-full border border-teal-400/30 bg-teal-400/10 px-6 py-3 font-semibold text-teal-200 transition hover:bg-teal-400/20"
            href="/guide"
          >
            View Documentation
          </a>
        </div>
      </section>
    </div>
  )
}

export default WhyPage
