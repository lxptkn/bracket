import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MatchCardProps {
  player1: { name: string; seed?: number; score?: number }
  player2: { name: string; seed?: number; score?: number }
  winner?: string
  round: string
  matchNumber: number
  onSetWinner?: (winner: string | null) => void
}

export function MatchCard({ player1, player2, winner, round, matchNumber, onSetWinner }: MatchCardProps) {
  const handlePlayerClick = (playerName: string) => {
    if (!onSetWinner) return;
    
    if (winner === playerName) {
      // Clicking the current winner clears it
      onSetWinner(null);
    } else {
      // Clicking a different player sets them as winner
      onSetWinner(playerName);
    }
  };

  return (
    <Card className="w-64 flex-shrink-0 bg-slate-900 text-slate-200 border-slate-700">
      <CardContent className="p-4 min-h-[120px] flex flex-col justify-center">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
            {round}
          </Badge>
          <span className="text-xs text-slate-400">Match {matchNumber}</span>
        </div>
        
        <div className="space-y-2">
          <div className={`flex justify-between items-center p-2 cursor-pointer transition-colors ${
            winner === player1.name ? 'bg-emerald-900/30 border-l-4 border-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
          }`} onClick={() => handlePlayerClick(player1.name)}>
            <div className="flex items-center gap-2">
              {player1.seed && (
                <span className="text-xs bg-slate-700 text-slate-200 px-1">{player1.seed}</span>
              )}
              <span className={`font-medium ${winner === player1.name ? 'text-emerald-300' : ''}`}>
                {player1.name}
              </span>
            </div>
            {player1.score !== undefined && (
              <span className="font-bold">{player1.score}</span>
            )}
          </div>
          
          <div className={`flex justify-between items-center p-2 cursor-pointer transition-colors ${
            winner === player2.name ? 'bg-emerald-900/30 border-l-4 border-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
          }`} onClick={() => handlePlayerClick(player2.name)}>
            <div className="flex items-center gap-2">
              {player2.seed && (
                <span className="text-xs bg-slate-700 text-slate-200 px-1">{player2.seed}</span>
              )}
              <span className={`font-medium ${winner === player2.name ? 'text-emerald-200' : ''}`}>
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
