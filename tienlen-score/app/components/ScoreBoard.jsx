'use client';

const PLAYER_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-600', label: 'A' },
  { bg: 'bg-red-50',  border: 'border-red-300',  text: 'text-red-700',  badge: 'bg-red-600',  label: 'B' },
  { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', badge: 'bg-yellow-500', label: 'C' },
  { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-600', label: 'D' },
];

export default function ScoreBoard({ players, scores, roundCount }) {
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const isLeading = (s) => s === maxScore && roundCount > 0;
  const isLosing = (s) => s === minScore && roundCount > 0 && minScore < maxScore;

  // Sort order by score descending for display
  const ranked = [...scores]
    .map((s, i) => ({ i, s }))
    .sort((a, b) => b.s - a.s);

  const rankOf = (i) => ranked.findIndex((r) => r.i === i) + 1;

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Bảng Điểm</h2>
        {roundCount > 0 && (
          <span className="text-xs text-gray-400">Ván {roundCount}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {players.map((name, i) => {
          const c = PLAYER_COLORS[i];
          const leading = isLeading(scores[i]);
          const losing = isLosing(scores[i]);
          return (
            <div
              key={i}
              className={`player-card ${c.bg} border ${c.border} ${leading ? 'winner-glow ring-2 ring-yellow-300' : ''}`}
            >
              <div className="flex items-center gap-2 w-full">
                <span className={`w-7 h-7 rounded-full ${c.badge} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                  {c.label}
                </span>
                <span className="font-semibold text-gray-800 truncate flex-1 text-sm">{name}</span>
                {leading && <span className="text-base">👑</span>}
                {losing && roundCount > 0 && <span className="text-base">😰</span>}
              </div>

              <div className={`text-3xl font-black mt-1 ${scores[i] >= 0 ? c.text : 'text-red-500'}`}>
                {scores[i] >= 0 ? `+${scores[i]}` : scores[i]}
              </div>

              {roundCount > 0 && (
                <div className="text-xs text-gray-400">
                  #{rankOf(i)} · Avg {roundCount > 0 ? (scores[i] / roundCount).toFixed(1) : 0}/ván
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
