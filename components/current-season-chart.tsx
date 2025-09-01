"use client"
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Current season two-month calendar chart.
 *
 * Renders two side-by-side calendar boxes per month that represent
 * tournament rounds for the active season. Month metadata is fetched
 * from `/api/seasons/[season]` and split into first/second halves.
 */

type MonthParts = { year: number; monthIndex: number } // monthIndex 0-11

/**
 * Parse a string in the form `YYYY-MM` into `{ year, monthIndex }`.
 * Returns `null` when the input is missing or invalid.
 */
function parseYYYYMM(input?: string): MonthParts | null {
  if (!input) return null
  const m = /(\d{4})-(\d{2})/.exec(input)
  if (!m) return null
  const year = Number(m[1])
  const monthIndex = Number(m[2]) - 1
  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return null
  return { year, monthIndex }
}

/**
 * Get the localized long month name for a zero-based month index (0-11).
 */
function monthName(monthIndex: number) {
  return new Date(2000, monthIndex, 1).toLocaleString(undefined, { month: 'long' })
}

/**
 * Split the days of a given month into two halves.
 *
 * Returns the first day Date of the month and two arrays containing
 * the day numbers for the first and second halves respectively.
 */
function splitMonthDays(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const mid = Math.ceil(daysInMonth / 2)
  const firstHalf = Array.from({ length: mid }, (_, i) => i + 1)
  const secondHalf = Array.from({ length: daysInMonth - mid }, (_, i) => mid + 1 + i)
  return { first, firstHalf, secondHalf }
}

/**
 * Calendar grid for a given month portion.
 *
 * - `title`: Month display name (not rendered inside the grid itself).
 * - `subtitle`: Label for the round/phase (e.g., "Round 1").
 * - `firstDay`: Date for the first day of the month (used to align weekdays).
 * - `days`: List of day numbers to render within this grid.
 */
function CalendarBox({ title, subtitle, firstDay, days }: { title: string; subtitle: string; firstDay: Date; days: number[] }) {
  // Week starts on Sunday per spec S M T W R F S
  const startWeekday = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1).getDay() // 0..6 Sun..Sat
  const cells: (number | null)[] = []
  // Pad leading empty cells so the 1st of the month aligns with the correct weekday
  for (let i = 0; i < startWeekday; i += 1) cells.push(null)
  // Append the provided day numbers to be rendered
  days.forEach((d) => cells.push(d))

  return (
    <div className="bg-slate-800 text-slate-200 p-3 border border-slate-700">
      <div className="text-center font-serif tracking-wide font-medium mb-2 text-slate-200 bg-slate-900 py-1 px-2 rounded">{subtitle}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={`${d}-${i}`} className="font-medium text-slate-500 py-1">{d}</div>
        ))}
        {(Array.isArray(cells) ? cells : []).map((d, i) => (
          <div key={i} className="py-1 text-slate-100">{d ?? ''}</div>
        ))}
      </div>
    </div>
  )
}

/**
 * Top-level component that renders the current season chart.
 *
 * When a `season` is provided, month metadata is fetched and transformed
 * into two months, each split into two calendar boxes that map to
 * tournament rounds.
 */
export function CurrentSeasonChart({ season }: { season: string | null }) {
  const [meta, setMeta] = useState<{ month1?: string; month2?: string }>({})

  useEffect(() => {
    // Fetch the selected season's month metadata when `season` changes
    if (!season) return
    fetch(`/api/seasons/${season}`).then((r) => r.json()).then(setMeta)
  }, [season])

  const content = useMemo(() => {
    // Derive calendar data from `meta`; stop early if data is incomplete/invalid
    const m1 = parseYYYYMM(meta.month1)
    const m2 = parseYYYYMM(meta.month2)
    if (!m1 || !m2) return null
    const s1 = splitMonthDays(m1.year, m1.monthIndex)
    const s2 = splitMonthDays(m2.year, m2.monthIndex)
    return { m1, m2, s1, s2 }
  }, [meta])

  // Do not render anything if there is no active season
  if (!season) return null
  if (!content) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-serif tracking-wide text-slate-100">Current Season</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Empty state prompting admins to configure months for the season */}
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



