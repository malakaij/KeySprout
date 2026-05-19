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
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No data yet. Complete some lessons to see your progress!
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="wpm" stroke="#10b981" tick={{ fontSize: 12 }} label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 12 }} />
        <YAxis yAxisId="acc" orientation="right" stroke="#3b82f6" tick={{ fontSize: 12 }} domain={[0, 100]} label={{ value: 'Acc%', angle: 90, position: 'insideRight', fill: '#3b82f6', fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
        />
        <Legend />
        <Line
          yAxisId="wpm"
          type="monotone"
          dataKey="wpm"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981', r: 3 }}
          name="WPM"
        />
        <Line
          yAxisId="acc"
          type="monotone"
          dataKey="accuracy"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 3 }}
          name="Accuracy %"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
