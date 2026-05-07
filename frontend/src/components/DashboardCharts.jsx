import React from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const StatusDoughnut = ({ statusDistribution = [] }) => {
  const labels = statusDistribution.map((s) => String(s.status))
  const data = statusDistribution.map((s) => s.count)

  const colors = ['#10b981', '#f59e0b', '#ef4444', '#60a5fa', '#a78bfa']

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Doughnut
        data={{ labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length) }] }}
        options={{
          maintainAspectRatio: true,
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 12 }, color: '#94a3b8' } } },
        }}
      />
    </div>
  )
}

const TopMocksBar = ({ topMocks = [] }) => {
  const visibleMocks = topMocks.filter((m) => Number(m.calls || 0) > 0)
  const hiddenMocks = topMocks.filter((m) => Number(m.calls || 0) <= 0)
  const labels = visibleMocks.map((m) => m.endpoint || `id:${m.id}`)
  const data = visibleMocks.map((m) => Number(m.calls || 0))

  return (
    <div className="space-y-3">
      <div style={{ height: '220px' }}>
        <Bar
          data={{ labels, datasets: [{ label: 'Calls', data, backgroundColor: '#06b6d4', borderRadius: 10, barThickness: 14 }] }}
          options={{
            indexAxis: 'y',
            maintainAspectRatio: false,
            layout: { padding: { left: 8, right: 16, top: 8, bottom: 8 } },
            plugins: { legend: { display: false } },
            scales: {
              x: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.08)' }, ticks: { color: '#94a3b8' } },
              y: {
                ticks: {
                  color: '#94a3b8',
                  autoSkip: false,
                  font: { size: 12, weight: '500' },
                },
                grid: { display: false },
              },
            },
          }}
        />
      </div>

      {hiddenMocks.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          {hiddenMocks.map((mock) => (
            <span key={mock.id} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
              {mock.endpoint || `id:${mock.id}`}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const DashboardCharts = ({ analytics = {}, mockSeries = {} }) => {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase text-slate-400">Status Distribution</p>
        <div className="mt-3 h-64">
          <StatusDoughnut statusDistribution={analytics.statusDistribution || []} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
        <p className="text-xs uppercase text-slate-400">Top Mocks</p>
        <div className="mt-3 overflow-x-auto">
          <TopMocksBar topMocks={analytics.topMocks || []} />
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts
