'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'

interface AttemptData {
  date: string
  wpm: number
  accuracy: number
}

interface ProgressChartProps {
  attempts: AttemptData[]
}

export function ProgressChart({ attempts }: ProgressChartProps) {
  const data = attempts.map((a) => ({
    date: format(new Date(a.date), 'MMM d'),
    wpm: Math.round(a.wpm),
    accuracy: typeof a.accuracy === 'number' && a.accuracy <= 1
      ? Math.round(a.accuracy * 100)
      : Math.round(a.accuracy),
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-ink/40 text-sm font-body">
        No data yet. Complete some lessons to see your progress!
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e18" />
        <XAxis dataKey="date" stroke="#1a1a2e60" tick={{ fontSize: 12, fontFamily: 'Nunito' }} />
        <YAxis yAxisId="wpm" stroke="#4dd4ac" tick={{ fontSize: 12, fontFamily: 'Nunito' }} label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: '#4dd4ac', fontSize: 12 }} />
        <YAxis yAxisId="acc" orientation="right" stroke="#4ea8de" tick={{ fontSize: 12, fontFamily: 'Nunito' }} domain={[0, 100]} label={{ value: 'Acc%', angle: 90, position: 'insideRight', fill: '#4ea8de', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff6e3',
            border: '3px solid #1a1a2e',
            borderRadius: '12px',
            color: '#1a1a2e',
            fontFamily: 'Nunito',
            boxShadow: '4px 4px 0 #1a1a2e',
          }}
        />
        <Legend wrapperStyle={{ fontFamily: 'Nunito', fontSize: 12 }} />
        <Line
          yAxisId="wpm"
          type="monotone"
          dataKey="wpm"
          stroke="#4dd4ac"
          strokeWidth={2.5}
          dot={{ fill: '#4dd4ac', r: 4, stroke: '#1a1a2e', strokeWidth: 2 }}
          name="WPM"
        />
        <Line
          yAxisId="acc"
          type="monotone"
          dataKey="accuracy"
          stroke="#4ea8de"
          strokeWidth={2.5}
          dot={{ fill: '#4ea8de', r: 4, stroke: '#1a1a2e', strokeWidth: 2 }}
          name="Accuracy %"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
