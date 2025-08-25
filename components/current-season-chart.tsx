"use client"
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MonthParts = { year: number; monthIndex: number } // monthIndex 0-11

function parseYYYYMM(input?: string): MonthParts | null {
  if (!input) return null
  const m = /(\d{4})-(\d{2})/.exec(input)
  if (!m) return null
  const year = Number(m[1])
  const monthIndex = Number(m[2]) - 1
  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return null
  return { year, monthIndex }
}

function monthName(monthIndex: number) {
  return new Date(2000, monthIndex, 1).toLocaleString(undefined, { month: 'long' })
}

function splitMonthDays(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const mid = Math.ceil(daysInMonth / 2)
  const firstHalf = Array.from({ length: mid }, (_, i) => i + 1)
  const secondHalf = Array.from({ length: daysInMonth - mid }, (_, i) => mid + 1 + i)
  return { first, firstHalf, secondHalf }
}

function CalendarBox({ title, subtitle, firstDay, days }: { title: string; subtitle: string; firstDay: Date; days: number[] }) {
  // Week starts on Sunday per spec S M T W R F S
  const startWeekday = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1).getDay() // 0..6 Sun..Sat
  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i += 1) cells.push(null)
  days.forEach((d) => cells.push(d))

  return (
    <div className="bg-slate-800 text-slate-200 p-3 border border-slate-700">
      <div className="text-center font-serif tracking-wide font-medium mb-2 text-slate-200">{subtitle}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={`${d}-${i}`} className="font-medium text-slate-300">{d}</div>
        ))}
        {(Array.isArray(cells) ? cells : []).map((d, i) => (
          <div key={i} className="py-1 text-slate-100">{d ?? ''}</div>
        ))}
      </div>
    </div>
  )
}

export function CurrentSeasonChart({ season }: { season: string | null }) {
  const [meta, setMeta] = useState<{ month1?: string; month2?: string }>({})

  useEffect(() => {
    if (!season) return
    fetch(`/api/seasons/${season}`).then((r) => r.json()).then(setMeta)
  }, [season])

  const content = useMemo(() => {
    const m1 = parseYYYYMM(meta.month1)
    const m2 = parseYYYYMM(meta.month2)
    if (!m1 || !m2) return null
    const s1 = splitMonthDays(m1.year, m1.monthIndex)
    const s2 = splitMonthDays(m2.year, m2.monthIndex)
    return { m1, m2, s1, s2 }
  }, [meta])

  if (!season) return null
  if (!content) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-serif tracking-wide text-slate-100">Current Season</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-slate-400">Set two months for this season in the admin panel to display the chart.</div>
        </CardContent>
      </Card>
    )
  }

  const { m1, m2, s1, s2 } = content

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-serif tracking-wide text-slate-100">Current Season</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Month 1 Column */}
          <div className="bg-slate-800 border border-slate-700 p-3">
            <div className="text-center font-serif tracking-wide font-semibold mb-3 text-slate-100">{monthName(m1.monthIndex)}</div>
            <div className="space-y-4">
              <CalendarBox
                title={monthName(m1.monthIndex)}
                subtitle="Round 1"
                firstDay={s1.first}
                days={s1.firstHalf}
              />
              <CalendarBox
                title={monthName(m1.monthIndex)}
                subtitle="Quarterfinals"
                firstDay={s1.first}
                days={s1.secondHalf}
              />
            </div>
          </div>
          {/* Month 2 Column */}
          <div className="bg-slate-800 border border-slate-700 p-3">
            <div className="text-center font-serif tracking-wide font-semibold mb-3 text-slate-100">{monthName(m2.monthIndex)}</div>
            <div className="space-y-4">
              <CalendarBox
                title={monthName(m2.monthIndex)}
                subtitle="Semi Finals"
                firstDay={s2.first}
                days={s2.firstHalf}
              />
              <CalendarBox
                title={monthName(m2.monthIndex)}
                subtitle="Finals"
                firstDay={s2.first}
                days={s2.secondHalf}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



