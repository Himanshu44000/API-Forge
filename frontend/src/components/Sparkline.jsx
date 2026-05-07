import React from 'react'

const Sparkline = ({ data = [], width = 160, height = 40, stroke = '#34d399' }) => {
  if (!data || data.length === 0) {
    return <svg width={width} height={height} />
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const stepX = width / (data.length - 1 || 1)

  const points = data
    .map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} />
    </svg>
  )
}

export default Sparkline
