import { MatchCard } from "./match-card"

type Player = { name: string; seed?: number; score?: number }
type Match = { matchNumber: number; player1: Player; player2: Player; winner?: string }
type BracketData = Record<string, Match[]>

const CARD_WIDTH = 256; // w-64
const CARD_HEIGHT = 120; // min-h-[120px] from MatchCard
const COLUMN_GAP = 125; // Reduced space between card columns for lines (half of 250)
const LINE_SEGMENT_H = COLUMN_GAP / 2; // Half of the gap

// Calculate left positions for each column
const R1_LEFT = 0;
const QF_LEFT = CARD_WIDTH + COLUMN_GAP; // 256 + 125 = 381
const SF_LEFT = QF_LEFT + CARD_WIDTH + COLUMN_GAP; // 381 + 256 + 125 = 762
const F_LEFT = SF_LEFT + CARD_WIDTH + COLUMN_GAP; // 762 + 256 + 125 = 1143

// Calculate top positions for the center of each match card
// These are adjusted to provide more vertical spacing and fit within the larger container.
const getMatchCenterY = (roundIndex: number, matchIndex: number) => {
  // Base offset for top padding and vertical centering
  const baseOffset = 100; 

  if (roundIndex === 0) { // Round 1 (8 matches)
    return baseOffset + 60 + matchIndex * 250; // Spacing remains 250px between centers
  } else if (roundIndex === 1) { // Quarterfinals (4 matches)
    return baseOffset + 185 + matchIndex * 500; // 500px between centers
  } else if (roundIndex === 2) { // Semifinals (2 matches)
    return baseOffset + 435 + matchIndex * 1000; // 1000px between centers
  } else if (roundIndex === 3) { // Finals (1 match)
    return baseOffset + 935; // Single match, fixed center
  }
  return 0;
};

export function TournamentBracket({ data, onSetWinner }: { 
  data: BracketData
  onSetWinner?: (round: string, matchNumber: number, winner: string | null) => void
}) {
  const roundOrder = ["Round 1", "Quarterfinals", "Semifinals", "Finals"] as const
  const rounds = (roundOrder
    .filter((r) => data && data[r])
    .map((r) => [r, Array.isArray((data as any)[r]) ? (data as any)[r] : []])) as [string, Match[]][]

  // Calculate total width needed for the container
  const totalWidth = F_LEFT + CARD_WIDTH + 50; // Add some extra padding on the right

  // Calculate total height needed for the container based on the lowest match
  const r1Count = data?.["Round 1"]?.length ?? 0
  const lowestMatchCenterY = r1Count > 0 ? getMatchCenterY(0, r1Count - 1) : getMatchCenterY(3, 0)
  const totalHeight = lowestMatchCenterY + CARD_HEIGHT / 2 + 50; // Add some extra padding at the bottom
  const extraContainerHeight = 180;

  return (
    <div className="overflow-x-auto overflow-y-hidden">
      <div className="relative p-6 bg-transparent" style={{ minHeight: `${totalHeight + extraContainerHeight}px`, width: `${totalWidth}px` }}>
        {/* Render Match Card Columns and Titles with Absolute Positioning */}
        {(Array.isArray(rounds) ? rounds : []).map(([roundName, matches], roundIndex) => {
          const columnLeft = [R1_LEFT, QF_LEFT, SF_LEFT, F_LEFT][roundIndex];
          return (
            <div key={roundName}>
              <h3
                className="absolute text-lg font-serif tracking-wide text-slate-300 text-center"
                style={{
                  left: `${columnLeft}px`,
                  top: '0px', // Position title at the top of the bracket
                  width: `${CARD_WIDTH}px`,
                }}
              >
                {roundName}
              </h3>
              {(Array.isArray(matches) ? matches : []).map((match, index) => {
                const matchCenterY = getMatchCenterY(roundIndex, index);
                return (
                  <div
                    key={`${roundName}-${match.matchNumber}`}
                    className="absolute"
                    style={{
                      top: `${matchCenterY - CARD_HEIGHT / 2}px`, // Position card based on its center
                      left: `${columnLeft}px`,
                    }}
                  >
                    <MatchCard {...match} round={roundName} onSetWinner={onSetWinner} />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Render Lines */}
        {/* Lines from Round 1 to Quarterfinals */}
        {(Array.isArray(data["Round 1"]) ? data["Round 1"] : []).map((match, index) => {
          if (index % 2 !== 0) return null; // Only draw lines for the top match of each pair

          const topMatchCenterY = getMatchCenterY(0, index);
          const bottomMatchCenterY = getMatchCenterY(0, index + 1);
          const nextRoundMatchCenterY = getMatchCenterY(1, index / 2);

          const lineLeft = R1_LEFT + CARD_WIDTH;

          return (
            <div key={`r1-line-${index}`}>
              {/* Horizontal line from top match */}
              <div
                className="absolute bg-slate-300 h-px"
                style={{
                  top: `${topMatchCenterY}px`,
                  left: `${lineLeft}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
              {/* Horizontal line from bottom match */}
              <div
                className="absolute bg-slate-300 h-px"
                style={{
                  top: `${bottomMatchCenterY}px`,
                  left: `${lineLeft}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
              {/* Vertical line connecting pair */}
              <div
                className="absolute bg-slate-300 w-px"
                style={{
                  top: `${topMatchCenterY}px`,
                  left: `${lineLeft + LINE_SEGMENT_H}px`,
                  height: `${bottomMatchCenterY - topMatchCenterY}px`,
                }}
              ></div>
              {/* Horizontal line to next round */}
              <div
                className="absolute bg-slate-300 h-px"
                style={{
                  top: `${nextRoundMatchCenterY}px`,
                  left: `${lineLeft + LINE_SEGMENT_H}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
            </div>
          );
        })}

        {/* Lines from Quarterfinals to Semifinals */}
        {(Array.isArray(data["Quarterfinals"]) ? data["Quarterfinals"] : []).map((match, index) => {
          if (index % 2 !== 0) return null;

          const topMatchCenterY = getMatchCenterY(1, index);
          const bottomMatchCenterY = getMatchCenterY(1, index + 1);
          const nextRoundMatchCenterY = getMatchCenterY(2, index / 2);

          const lineLeft = QF_LEFT + CARD_WIDTH;

          return (
            <div key={`qf-line-${index}`}>
              {/* Horizontal line from top match */}
               <div
                 className="absolute bg-slate-300 h-px"
                style={{
                  top: `${topMatchCenterY}px`,
                  left: `${lineLeft}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
              {/* Horizontal line from bottom match */}
               <div
                 className="absolute bg-slate-300 h-px"
                style={{
                  top: `${bottomMatchCenterY}px`,
                  left: `${lineLeft}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
              {/* Vertical line connecting pair */}
               <div
                 className="absolute bg-slate-300 w-px"
                style={{
                  top: `${topMatchCenterY}px`,
                  left: `${lineLeft + LINE_SEGMENT_H}px`,
                  height: `${bottomMatchCenterY - topMatchCenterY}px`,
                }}
              ></div>
              {/* Horizontal line to next round */}
               <div
                 className="absolute bg-slate-300 h-px"
                style={{
                  top: `${nextRoundMatchCenterY}px`,
                  left: `${lineLeft + LINE_SEGMENT_H}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
            </div>
          );
        })}

        {/* Lines from Semifinals to Finals */}
        {(Array.isArray(data["Semifinals"]) ? data["Semifinals"] : []).map((match, index) => {
          if (index % 2 !== 0) return null;

          const topMatchCenterY = getMatchCenterY(2, index);
          const bottomMatchCenterY = getMatchCenterY(2, index + 1);
          const nextRoundMatchCenterY = getMatchCenterY(3, index / 2); // For Finals, index/2 will be 0

          const lineLeft = SF_LEFT + CARD_WIDTH;

          return (
            <div key={`sf-line-${index}`}>
              {/* Horizontal line from top match */}
               <div
                 className="absolute bg-slate-300 h-px"
                style={{
                  top: `${topMatchCenterY}px`,
                  left: `${lineLeft}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
              {/* Horizontal line from bottom match */}
               <div
                 className="absolute bg-slate-300 h-px"
                style={{
                  top: `${bottomMatchCenterY}px`,
                  left: `${lineLeft}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
              {/* Vertical line connecting pair */}
               <div
                 className="absolute bg-slate-300 w-px"
                style={{
                  top: `${topMatchCenterY}px`,
                  left: `${lineLeft + LINE_SEGMENT_H}px`,
                  height: `${bottomMatchCenterY - topMatchCenterY}px`,
                }}
              ></div>
              {/* Horizontal line to next round */}
               <div
                 className="absolute bg-slate-300 h-px"
                style={{
                  top: `${nextRoundMatchCenterY}px`,
                  left: `${lineLeft + LINE_SEGMENT_H}px`,
                  width: `${LINE_SEGMENT_H}px`,
                }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
