"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ModeratorsPanel({ season }: { season: string | null }) {
  const [mods, setMods] = useState<{ name: string }[]>([])

  useEffect(() => {
    if (!season) return
    fetch(`/api/admin/seasons/${season}/moderators`).then(r=>r.json()).then(setMods)
  }, [season])

  if (!season) return null

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-serif tracking-wide text-slate-100">Moderators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => {
            const mod = mods[i]
            return (
              <div key={i} className="h-16 border border-slate-700 bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-200">
                {mod ? mod.name : 'TBD'}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}



