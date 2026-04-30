'use client';

import { RANK_ICONS, RANK_LABELS, RANK_SCORES } from '../lib/gameLogic';

const PLAYER_COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-700',   badge: 'bg-blue-600',    label: 'A' },
  { bg: 'bg-red-100',    text: 'text-red-700',     badge: 'bg-red-600',     label: 'B' },
  { bg: 'bg-yellow-100', text: 'text-yellow-700',  badge: 'bg-yellow-500',  label: 'C' },
  { bg: 'bg-purple-100', text: 'text-purple-700',  badge: 'bg-purple-600',  label: 'D' },
];

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  } catch { return ''; }
}

export default function History({ rounds, players, settings, onUndo }) {
  if (rounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="text-5xl mb-4">📜</div>
        <p className="font-medium">Chưa có ván nào</p>
        <p className="text-sm mt-1">Kết thúc ván đầu tiên để xem lịch sử</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Lịch Sử ({rounds.length} ván)
        </h2>
        <button onClick={onUndo} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
          ↩ Hủy ván cuối
        </button>
      </div>

      {[...rounds].reverse().map((round, idx) => {
        const vanNum = rounds.length - idx;
        const firstPlayerIdx = round.rankOrder?.[0];
        const wc = firstPlayerIdx !== null && firstPlayerIdx !== undefined
          ? PLAYER_COLORS[firstPlayerIdx]
          : PLAYER_COLORS[0];

        return (
          <div key={round.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-2.5 ${wc.bg}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">VÁN {vanNum}</span>
                <span className="text-gray-300">·</span>
                {firstPlayerIdx !== null && firstPlayerIdx !== undefined && (
                  <span className={`font-semibold ${wc.text} flex items-center gap-1`}>
                    🥇 {players[firstPlayerIdx]}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(round.timestamp)} {formatTime(round.timestamp)}
              </span>
            </div>

            {/* Body: rank order + deltas */}
            <div className="px-4 py-3 space-y-1.5">
              {(round.rankOrder ?? []).map((playerIdx, rank) => {
                if (playerIdx === null || playerIdx === undefined) return null;
                const d = round.deltas[playerIdx];
                const c = PLAYER_COLORS[playerIdx];
                const isNhot = (round.nhotPlayers ?? []).includes(playerIdx);
                return (
                  <div key={rank} className="flex items-center gap-2">
                    <span className="text-sm w-5 text-center">{RANK_ICONS[rank]}</span>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${c.badge}`}>
                      {c.label}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{players[playerIdx]}</span>
                    {isNhot && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">Nhốt</span>
                    )}
                    <span className={`font-bold text-sm w-14 text-right ${d > 0 ? 'text-green-600' : d < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {d > 0 ? `+${d}` : d === 0 ? '—' : d}
                    </span>
                  </div>
                );
              })}

              {/* Extra events */}
              {((round.chatHeoEvents?.length > 0) || (round.denCaLangPlayers?.length > 0)) && (
                <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                  {(round.chatHeoEvents ?? []).map((ev, i) => {
                    const bonus = ev.type === 'do' ? settings.chatHeoDo : settings.chatHeoDen;
                    return (
                      <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
                        <span>{ev.type === 'do' ? '❤️' : '🖤'}</span>
                        <span className="font-medium text-gray-700">{players[ev.cutter]}</span>
                        <span>chặt heo {ev.type === 'do' ? 'đỏ' : 'đen'} của</span>
                        <span className="font-medium text-gray-700">{players[ev.victim]}</span>
                        <span className="ml-auto text-green-600 font-semibold">+{bonus}</span>
                      </div>
                    );
                  })}
                  {(round.denCaLangPlayers ?? []).map((pIdx, i) => (
                    <div key={`den-${i}`} className="flex items-center gap-1 text-xs text-gray-500">
                      <span>💸</span>
                      <span className="font-medium text-gray-700">{players[pIdx]}</span>
                      <span>đền cả làng</span>
                      <span className="ml-auto text-red-500 font-semibold">−{(settings.denCaLang ?? 3) * 3}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
