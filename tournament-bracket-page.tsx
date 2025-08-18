"use client"
import { TournamentBracket } from "./components/tournament-bracket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar, Users } from 'lucide-react'
import { CurrentSeasonChart } from '@/components/current-season-chart'
import { ModeratorsPanel } from '@/components/moderators-panel'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function TournamentBracketPage() {
  const { data: session } = useSession()
  const [seasons, setSeasons] = useState<string[]>([])
  const [season, setSeason] = useState<string | null>(null)
  const [data, setData] = useState<any>({})

  useEffect(() => {
    fetch('/api/seasons').then(r=>r.json()).then((s:string[])=>{ setSeasons(s); setSeason(s[0] ?? null) })
  }, [])
  useEffect(() => {
    if (season) fetch(`/api/seasons/${season}/bracket`).then(r=>r.json()).then(setData)
  }, [season])

  return (
    <div className="min-h-screen bg-slate-800 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-slate-300" />
              <div>
                <h1 className="text-3xl font-serif tracking-wide text-slate-100">Bracket</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session && (
                              <Button variant="outline" size="sm" className="border-slate-600 text-slate-200" onClick={() => window.location.assign('/admin')}>
                Admin
              </Button>
              )}
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-200" onClick={() => (session ? signOut() : signIn())}>
                {session ? 'Sign out' : 'Admin Sign in'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Controls, Current Season, Bracket, Moderators */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Season Select + Current Season Chart */}
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm text-slate-300">Season:</span>
            <Select value={season ?? ''} onValueChange={(v)=>setSeason(v)}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-slate-200">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                {seasons.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <CurrentSeasonChart season={season} />
          </div>
        </div>

        {/* Bracket without container card */}
        <div className="w-full flex justify-center">
          <TournamentBracket data={data} />
        </div>

        <div className="mt-6 max-w-7xl mx-auto">
          <ModeratorsPanel season={season} />
        </div>

        {/* Legend */}
        <div className="max-w-7xl mx-auto">
          <Card className="mt-6 bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-serif tracking-wide text-slate-200">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-900/30 border-l-4 border-emerald-500"></div>
                  <span className="text-slate-300">Winner</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-800"></div>
                  <span className="text-slate-300">Eliminated</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
