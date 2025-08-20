'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [seasons, setSeasons] = useState<string[]>([])
  const [newSeason, setNewSeason] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [participants, setParticipants] = useState<{ name: string; seed?: number }[]>([])
  const [globalParticipants, setGlobalParticipants] = useState<{ name: string; seed?: number }[]>([])
  const [bracketRefresh, setBracketRefresh] = useState(0)
  const [month1, setMonth1] = useState('') // YYYY-MM
  const [month2, setMonth2] = useState('') // YYYY-MM
  const [globalModerators, setGlobalModerators] = useState<{ name: string }[]>([])
  const [seasonModerators, setSeasonModerators] = useState<{ name: string }[]>([])
  const [newModeratorName, setNewModeratorName] = useState('')
  const [newParticipantName, setNewParticipantName] = useState('')
  const [newParticipantSeed, setNewParticipantSeed] = useState('')

  useEffect(() => {
    fetch('/api/seasons')
      .then((r) => r.json())
      .then((s) => {
        const arr = Array.isArray(s) ? s : []
        setSeasons(arr)
        setSelectedSeason(arr[0] ?? '')
      })
      .catch((error) => { 
        console.error('Error fetching seasons:', error)
        setSeasons([]) 
      })
    fetch('/api/admin/participants')
      .then((r)=>r.json())
      .then((list)=> setGlobalParticipants(Array.isArray(list) ? list : []))
      .catch((error)=> { 
        console.error('Error fetching participants:', error)
        setGlobalParticipants([]) 
      })
    fetch('/api/admin/moderators')
      .then((r)=>r.json())
      .then((list)=> setGlobalModerators(Array.isArray(list) ? list : []))
      .catch((error)=> { 
        console.error('Error fetching moderators:', error)
        setGlobalModerators([]) 
      })
  }, [])

  useEffect(() => {
    if (!selectedSeason) return
    fetch(`/api/admin/seasons/${selectedSeason}/participants`)
      .then((r)=>r.json())
      .then((list)=> setParticipants(Array.isArray(list) ? list : []))
      .catch((error)=> { 
        console.error('Error fetching season participants:', error)
        setParticipants([]) 
      })
    fetch(`/api/seasons/${selectedSeason}`)
      .then(r=>r.json())
      .then((meta)=>{ setMonth1(meta?.month1 ?? ''); setMonth2(meta?.month2 ?? '') })
      .catch((error)=> { 
        console.error('Error fetching season metadata:', error)
        setMonth1(''); setMonth2('') 
      })
    fetch(`/api/admin/seasons/${selectedSeason}/moderators`)
      .then(r=>r.json())
      .then((list)=> setSeasonModerators(Array.isArray(list) ? list : []))
      .catch((error)=> { 
        console.error('Error fetching season moderators:', error)
        setSeasonModerators([]) 
      })
  }, [selectedSeason])

  const availableToAdd = useMemo(() => {
    const currentNames = new Set(participants.map(p=>p.name.toLowerCase()))
    return [...globalParticipants].filter(p=>!currentNames.has(p.name.toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name))
  }, [participants, globalParticipants])

  if (status === 'loading') return null
  if (!session) return (
    <div className="min-h-screen bg-slate-800 text-slate-200 p-6">
      <button
        className="border border-slate-700 bg-slate-900 text-slate-200 px-4 py-2"
        onClick={() => signIn()}
      >
        Sign in as Admin
      </button>
    </div>
  )

  const createSeason = async () => {
    if (!newSeason) return
    await fetch('/api/admin/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ season: newSeason }),
    })
    setNewSeason('')
    const updated = await fetch('/api/seasons').then((r) => r.json())
    setSeasons(updated)
  }

  return (
    <div className="min-h-screen bg-slate-800 text-slate-200">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-end gap-3">
        <button
          className="border border-slate-700 bg-slate-900 text-slate-200 px-3 py-1"
          onClick={() => window.location.assign('/')}
        >
          Back to Main Page
        </button>
        <button
          className="border border-slate-700 bg-slate-900 text-slate-200 px-3 py-1"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
      <div className="bg-slate-900 border border-slate-700 p-4">
        <h2 className="text-xl font-semibold mb-2">Seasons</h2>
        <div className="flex gap-2 items-center mb-4">
          <input
            className="border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1"
            placeholder="Add new season (e.g. 2024 or June 2025)"
            value={newSeason}
            onChange={(e) => setNewSeason(e.target.value)}
          />
          <button className="border border-slate-700 bg-slate-900 text-slate-200 px-3 py-1" onClick={createSeason}>Add</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {(Array.isArray(seasons) ? seasons : []).map((s) => (
            <div key={s} className="flex items-center justify-between border border-slate-700 bg-slate-800 px-3 py-2">
              <span className="truncate pr-2">{s}</span>
              <div className="flex items-center gap-2">
                <button
                  title="Edit this season"
                  className="border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1"
                  onClick={() => setSelectedSeason(s)}
                >
                  Edit
                </button>
                <button
                  title="Delete this season"
                  className="border border-red-700 bg-red-900 text-red-100 px-2 py-1"
                  onClick={async () => {
                    if (!confirm(`Delete season "${s}"? This removes it from the list but keeps its files.`)) return
                    await fetch('/api/admin/seasons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ season: s }) })
                    const updated = await fetch('/api/seasons').then((r) => r.json())
                    setSeasons(updated)
                    if (selectedSeason === s) setSelectedSeason(updated[0] ?? '')
                  }}
                >
                  -
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSeason && (
        <MonthSelectors
          seasons={seasons}
          selectedSeason={selectedSeason}
          onChangeSeason={(s)=> setSelectedSeason(s)}
          season={selectedSeason}
          month1={month1}
          month2={month2}
          onChange={(m1, m2) => { setMonth1(m1); setMonth2(m2) }}
        />
      )}

      {selectedSeason && (
        <div className="space-y-4 bg-slate-900 border border-slate-700 p-4">
          <h2 className="text-xl font-semibold">Participants</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <input className="border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1" placeholder="Add new global participant" value={newParticipantName} onChange={(e)=>setNewParticipantName(e.target.value)} />
            <input className="border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1 w-28" placeholder="Seed (opt)" value={newParticipantSeed} onChange={(e)=>setNewParticipantSeed(e.target.value)} />
            <button className="border border-slate-700 bg-slate-900 text-slate-200 px-3 py-1" onClick={async ()=>{
              if (!newParticipantName) return
              await fetch('/api/admin/participants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newParticipantName, seed: newParticipantSeed ? Number(newParticipantSeed) : undefined }) })
              setNewParticipantName(''); setNewParticipantSeed('')
              const globals = await fetch('/api/admin/participants').then(r=>r.json())
              setGlobalParticipants(globals)
            }}>Add to Global List</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-700 bg-slate-900 p-3">
              <div className="font-semibold mb-2">Global Participants</div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(availableToAdd) ? availableToAdd : []).map((p)=> (
                  <span key={p.name} className="inline-flex items-center gap-1 bg-slate-800 text-slate-200 px-3 py-1 text-sm border border-slate-700">
                    <span>{p.name}</span>
                    <button title="Add to this season" className="w-6 h-6 inline-flex items-center justify-center bg-emerald-700 text-white border border-emerald-600" onClick={async ()=>{
                      await fetch(`/api/admin/seasons/${selectedSeason}/participants`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: p.name }) })
                      const list = await fetch(`/api/admin/seasons/${selectedSeason}/participants`).then(r=>r.json())
                      setParticipants(list)
                      setBracketRefresh((x)=>x+1)
                    }}>+</button>
                  </span>
                ))}
                {availableToAdd.length === 0 && (
                  <span className="text-sm text-slate-400">All global participants are already in this season.</span>
                )}
              </div>
            </div>

            <div className="border border-slate-700 bg-slate-900 p-3">
              <div className="font-semibold mb-2">Season Participants ({selectedSeason})</div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(participants) ? participants.sort((a,b)=>a.name.localeCompare(b.name)) : []).map((p)=> (
                  <span key={p.name} className="inline-flex items-center gap-1 bg-slate-800 text-slate-200 px-3 py-1 text-sm border border-slate-700">
                    <span>{p.name}</span>
                    <button title="Remove from this season" className="w-6 h-6 inline-flex items-center justify-center bg-red-700 text-white border border-red-600" onClick={async ()=>{
                      await fetch(`/api/admin/seasons/${selectedSeason}/participants`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: p.name }) })
                      const list = await fetch(`/api/admin/seasons/${selectedSeason}/participants`).then(r=>r.json())
                      setParticipants(list)
                      setBracketRefresh((x)=>x+1)
                    }}>-</button>
                  </span>
                ))}
                {participants.length === 0 && (
                  <span className="text-sm text-slate-400">No participants in this season yet.</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <button className="border border-slate-700 bg-slate-900 text-slate-200 px-3 py-1" onClick={async ()=>{
              await fetch(`/api/admin/seasons/${selectedSeason}/participants`, { method: 'PUT' })
              alert('Bracket regenerated from current season participants order.')
            }}>Regenerate Bracket from Current Order</button>
          </div>
        </div>
      )}

      {selectedSeason && (
        <div className="space-y-4 bg-slate-900 border border-slate-700 p-4">
          <h2 className="text-xl font-semibold">Moderators</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <input className="border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1" placeholder="Add new global moderator" value={newModeratorName} onChange={(e)=>setNewModeratorName(e.target.value)} />
            <button className="border border-slate-700 bg-slate-900 text-slate-200 px-3 py-1" onClick={async ()=>{
              if (!newModeratorName) return
              await fetch('/api/admin/moderators', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newModeratorName }) })
              setNewModeratorName('')
              const list = await fetch('/api/admin/moderators').then(r=>r.json())
              setGlobalModerators(list)
            }}>Add to Global List</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-700 bg-slate-900 p-3">
              <div className="font-semibold mb-2">Global Moderators</div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(globalModerators) ? globalModerators
                  .filter(m => !(Array.isArray(seasonModerators) ? seasonModerators : []).some(s => s.name.toLowerCase() === m.name.toLowerCase()))
                  : []).map((m)=> (
                  <span key={m.name} className="inline-flex items-center gap-1 bg-slate-800 text-slate-200 px-3 py-1 text-sm border border-slate-700">
                    <span>{m.name}</span>
                    <button title="Add to this season" className="w-6 h-6 inline-flex items-center justify-center bg-emerald-700 text-white border border-emerald-600" onClick={async ()=>{
                      await fetch(`/api/admin/seasons/${selectedSeason}/moderators`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: m.name }) })
                      const list = await fetch(`/api/admin/seasons/${selectedSeason}/moderators`).then(r=>r.json())
                      setSeasonModerators(list)
                    }} disabled={seasonModerators.length >= 8}>+</button>
                  </span>
                ))}
                {seasonModerators.length >= 8 && (
                  <span className="text-sm text-amber-400">Maximum of 8 moderators reached for this season.</span>
                )}
              </div>
            </div>

            <div className="border border-slate-700 bg-slate-900 p-3">
              <div className="font-semibold mb-2">Season Moderators ({selectedSeason})</div>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(seasonModerators) ? seasonModerators : []).map((m)=> (
                  <span key={m.name} className="inline-flex items-center gap-1 bg-slate-800 text-slate-200 px-3 py-1 text-sm border border-slate-700">
                    <span>{m.name}</span>
                    <button title="Remove from this season" className="w-6 h-6 inline-flex items-center justify-center bg-red-700 text-white border border-red-600" onClick={async ()=>{
                      await fetch(`/api/admin/seasons/${selectedSeason}/moderators`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: m.name }) })
                      const list = await fetch(`/api/admin/seasons/${selectedSeason}/moderators`).then(r=>r.json())
                      setSeasonModerators(list)
                    }}>-</button>
                  </span>
                ))}
                {seasonModerators.length === 0 && (
                  <span className="text-sm text-slate-400">No moderators in this season yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSeason && (
        <div className="bg-slate-900 border border-slate-700 p-4">
          <RoundWinnersManager season={selectedSeason} refreshSignal={bracketRefresh} />
        </div>
      )}
      </div>
    </div>
  )
}

function RoundWinnersManager({ season, refreshSignal }: { season: string; refreshSignal?: number }) {
  const [bracket, setBracket] = useState<Record<string, { matchNumber: number; player1: { name: string }; player2: { name: string }; winner?: string }[]>>({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await fetch(`/api/seasons/${season}/bracket`).then((r) => r.json())
    setBracket(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [season, refreshSignal])

  const setWinner = async (round: string, matchNumber: number, winner: string | null) => {
    // Convert round name to round number
    const roundNumber = round === 'Round 1' ? 1 : 
                       round === 'Quarterfinals' ? 2 : 
                       round === 'Semifinals' ? 3 : 
                       round === 'Finals' ? 4 : 1;
    
    await fetch(`/api/admin/seasons/${season}/matches`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round: roundNumber, matchNumber, winner }),
    })
    await load()
  }

  if (loading) return null

  const rounds = ['Round 1', 'Quarterfinals', 'Semifinals', 'Finals']

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Set Winners</h2>
      {(Array.isArray(rounds) ? rounds : []).map((round) => (
        <div key={round} className="border border-slate-700 bg-slate-900 p-3">
          <div className="font-semibold mb-2 text-slate-100">{round}</div>
          <div className="space-y-2">
            {(Array.isArray(bracket[round]) ? bracket[round] : []).map((m) => (
              <div key={`${round}-${m.matchNumber}`} className="flex items-center gap-2">
                <span className="w-20 text-sm text-slate-400">Match {m.matchNumber}</span>
                <button
                  disabled={!m.player1?.name}
                  className={`border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1 ${m.winner === m.player1?.name ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300' : ''} ${!m.player1?.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => m.player1?.name && setWinner(round, m.matchNumber, m.winner === m.player1.name ? null : m.player1.name)}
                >
                  {m.player1?.name || 'TBD'}
                </button>
                <span className="text-xs text-gray-500">vs</span>
                <button
                  disabled={!m.player2?.name}
                  className={`border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1 ${m.winner === m.player2?.name ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300' : ''} ${!m.player2?.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => m.player2?.name && setWinner(round, m.matchNumber, m.winner === m.player2.name ? null : m.player2.name)}
                >
                  {m.player2?.name || 'TBD'}
                </button>
                {m.winner && <span className="ml-2 text-emerald-300 text-sm">Winner: {m.winner}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MonthSelectors({ seasons, selectedSeason, onChangeSeason, season, month1, month2, onChange }: { seasons: string[]; selectedSeason: string; onChangeSeason: (s: string)=>void; season: string; month1: string; month2: string; onChange: (m1: string, m2: string) => void }) {
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Build dropdown options: months Jan..Dec, years: from 1990 to current year + 1
  const now = new Date()
  const currentYear = now.getFullYear()
  const years = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => 1990 + i)
  const months = Array.from({ length: 12 }, (_, i) => ({ index: i, name: new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' }) }))

  const parse = (v: string) => {
    const m = /(\d{4})-(\d{2})/.exec(v)
    if (!m) return { y: currentYear, m: 0 }
    return { y: Number(m[1]), m: Number(m[2]) - 1 }
  }
  const f = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, '0')}`

  const a = parse(month1)
  const b = parse(month2)

  return (
    <div className="space-y-3 bg-slate-900 border border-slate-700 p-4">
      <h3 className="font-semibold">Current Season</h3>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Editing:</label>
        <select className="border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1" value={selectedSeason} onChange={(e)=> onChangeSeason(e.target.value)}>
          {(Array.isArray(seasons) ? seasons : []).map((s)=> (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Month</label>
        <select className="border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1" value={a.m} onChange={(e)=> onChange(f(a.y, Number(e.target.value)), f(a.y + (Number(e.target.value) === 11 ? 1 : 0), (Number(e.target.value) + 1) % 12))}>
          {(Array.isArray(months) ? months : []).map((m)=> (<option key={m.index} value={m.index}>{m.name}</option>))}
        </select>
        <select className="border border-slate-700 bg-slate-900 text-slate-200 px-2 py-1" value={a.y} onChange={(e)=> onChange(f(Number(e.target.value), a.m), f(Number(e.target.value) + (a.m === 11 ? 1 : 0), (a.m + 1) % 12))}>
          {(Array.isArray(years) ? years : []).map((y)=> (<option key={y} value={y}>{y}</option>))}
        </select>

        <div className="flex items-center gap-2">
          <button className="border border-slate-700 bg-slate-900 text-slate-200 px-3 py-1 hover:bg-slate-800 hover:border-slate-600 transition-colors" onClick={async ()=>{
            await fetch(`/api/admin/seasons`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ season, month1, month2 }) })
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000) // Hide after 3 seconds
          }}>Save</button>
          {showSuccess && (
            <div 
              className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full animate-in fade-in-0 zoom-in-95 duration-200"
              role="status"
              aria-label="Season month saved successfully"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-500">Pick the first month; the second is auto-set to the next month.</div>
    </div>
  )
}


