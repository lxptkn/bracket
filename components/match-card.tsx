import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Player {
  name: string
  seed?: number
  score?: number
}

interface MatchCardProps {
  player1: Player
  player2: Player
  winner?: string
  round: string
  matchNumber: number
}

export function MatchCard({ player1, player2, winner, round, matchNumber }: MatchCardProps) {
  return (
    <Card className="w-64 flex-shrink-0 bg-stone-900 text-stone-200 border-stone-700">
      <CardContent className="p-4 min-h-[120px] flex flex-col justify-center">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="text-xs border-stone-500 text-stone-300">
            {round}
          </Badge>
          <span className="text-xs text-stone-400">Match {matchNumber}</span>
        </div>
        
        <div className="space-y-2">
          <div className={`flex justify-between items-center p-2 ${
            winner === player1.name ? 'bg-emerald-900/30 border-l-4 border-emerald-500' : 'bg-stone-800'
          }`}>
            <div className="flex items-center gap-2">
              {player1.seed && (
                <span className="text-xs bg-stone-700 text-stone-200 px-1">{player1.seed}</span>
              )}
              <span className={`font-medium ${winner === player1.name ? 'text-emerald-300' : ''}`}>
                {player1.name}
              </span>
            </div>
            {player1.score !== undefined && (
              <span className="font-bold">{player1.score}</span>
            )}
          </div>
          
          <div className={`flex justify-between items-center p-2 ${
            winner === player2.name ? 'bg-emerald-900/30 border-l-4 border-emerald-500' : 'bg-stone-800'
          }`}>
            <div className="flex items-center gap-2">
              {player2.seed && (
                <span className="text-xs bg-stone-700 text-stone-200 px-1">{player2.seed}</span>
              )}
              <span className={`font-medium ${winner === player2.name ? 'text-emerald-300' : ''}`}>
                {player2.name}
              </span>
            </div>
            {player2.score !== undefined && (
              <span className="font-bold">{player2.score}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
