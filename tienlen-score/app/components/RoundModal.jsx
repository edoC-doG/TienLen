'use client';

import { useState } from 'react';
import { calculateDeltas, RANK_SCORES, RANK_LABELS, RANK_ICONS } from '../lib/gameLogic';

const PLAYER_COLORS = [
  { bg: 'bg-blue-100',   border: 'border-blue-400',   text: 'text-blue-700',   ring: 'ring-blue-400',   badge: 'bg-blue-600',   label: 'A' },
  { bg: 'bg-red-100',    border: 'border-red-400',    text: 'text-red-700',    ring: 'ring-red-400',    badge: 'bg-red-600',    label: 'B' },
  { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', ring: 'ring-yellow-400', badge: 'bg-yellow-500', label: 'C' },
  { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', ring: 'ring-purple-400', badge: 'bg-purple-600', label: 'D' },
];

export default function RoundModal({ players, settings, onConfirm, onClose }) {
  // rankOrder[0] = player idx of 1st, [1] = 2nd, etc. null = unassigned
  const [rankOrder, setRankOrder] = useState([null, null, null, null]);
  const [nhotPlayers, setNhotPlayers] = useState([]);
  const [chatHeoEvents, setChatHeoEvents] = useState([]);
  const [denCaLangPlayers, setDenCaLangPlayers] = useState([]);

  const assignedCount = rankOrder.filter((r) => r !== null).length;
  const allRanked = assignedCount === 4;

  const getPlayerRank = (playerIdx) => rankOrder.indexOf(playerIdx);

  const handleRankTap = (playerIdx) => {
    const currentRank = getPlayerRank(playerIdx);
    if (currentRank !== -1) {
      // Remove this player and compact
      const next = rankOrder.map((r) => (r === playerIdx ? null : r));
      const assigned = next.filter((r) => r !== null);
      while (assigned.length < 4) assigned.push(null);
      setRankOrder(assigned);
      setNhotPlayers((prev) => prev.filter((p) => p !== playerIdx));
    } else {
      const next = [...rankOrder];
      const emptyIdx = next.indexOf(null);
      if (emptyIdx === -1) return;
      next[emptyIdx] = playerIdx;
      // Auto-fill 4th if 3 assigned
      const unassigned = [0, 1, 2, 3].filter((i) => !next.includes(i));
      if (next.filter((r) => r !== null).length === 3 && unassigned.length === 1) {
        const lastEmpty = next.indexOf(null);
        next[lastEmpty] = unassigned[0];
      }
      setRankOrder(next);
    }
  };

  const toggleNhot = (playerIdx) =>
    setNhotPlayers((prev) =>
      prev.includes(playerIdx) ? prev.filter((x) => x !== playerIdx) : [...prev, playerIdx]
    );

  const toggleDenCaLang = (playerIdx) =>
    setDenCaLangPlayers((prev) =>
      prev.includes(playerIdx) ? prev.filter((x) => x !== playerIdx) : [...prev, playerIdx]
    );

  const setHeoCount = (n) => {
    setChatHeoEvents((events) => {
      if (n <= events.length) return events.slice(0, n);
      const next = [...events];
      while (next.length < n) {
        const cutter = rankOrder[0] ?? 0;
        const victim = [0, 1, 2, 3].find((i) => i !== cutter) ?? 1;
        next.push({ cutter, victim, type: 'den' });
      }
      return next;
    });
  };

  const removeHeoEvent = (idx) =>
    setChatHeoEvents((e) => e.filter((_, i) => i !== idx));

  const updateHeoEvent = (idx, key, val) =>
    setChatHeoEvents((e) =>
      e.map((ev, i) => (i === idx ? { ...ev, [key]: val } : ev))
    );

  const deltas = allRanked
    ? calculateDeltas(rankOrder, chatHeoEvents, settings, nhotPlayers, denCaLangPlayers)
    : null;

  const handleConfirm = () => {
    if (!allRanked) return;
    onConfirm({
      id: Date.now(),
      rankOrder: [...rankOrder],
      nhotPlayers: [...nhotPlayers],
      chatHeoEvents: [...chatHeoEvents],
      denCaLangPlayers: [...denCaLangPlayers],
      deltas,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h2 className="text-lg font-bold text-gray-800">Ghi Ván Mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">

          {/* RANK SELECTION */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Thứ tự kết thúc — bấm theo thứ tự
            </p>

            {/* Rank slots preview */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[0, 1, 2, 3].map((rank) => {
                const playerIdx = rankOrder[rank];
                const c = playerIdx !== null ? PLAYER_COLORS[playerIdx] : null;
                return (
                  <div key={rank} className={`rounded-xl border-2 p-2 text-center transition-all
                    ${playerIdx !== null
                      ? `${c.bg} ${c.border}`
                      : 'border-dashed border-gray-200 bg-gray-50'}`}
                  >
                    <div className="text-base">{RANK_ICONS[rank]}</div>
                    <div className="text-xs font-bold text-gray-500 mt-0.5">{RANK_LABELS[rank]}</div>
                    <div className={`text-xs font-bold mt-0.5 ${RANK_SCORES[rank] > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {RANK_SCORES[rank] > 0 ? `+${RANK_SCORES[rank]}` : RANK_SCORES[rank]}
                    </div>
                    {playerIdx !== null && (
                      <div className={`text-xs font-semibold truncate mt-1 ${c.text}`}>
                        {players[playerIdx]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Player buttons */}
            <div className="grid grid-cols-2 gap-2">
              {players.map((name, i) => {
                const rank = getPlayerRank(i);
                const assigned = rank !== -1;
                const c = PLAYER_COLORS[i];
                return (
                  <button
                    key={i}
                    onClick={() => handleRankTap(i)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-medium
                      ${assigned
                        ? `${c.bg} ${c.border} ${c.text} ring-2 ${c.ring} ring-offset-1`
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0
                      ${assigned ? c.badge : 'bg-gray-300'}`}>
                      {assigned ? rank + 1 : c.label}
                    </span>
                    <span className="truncate flex-1 text-left">{name}</span>
                    {assigned && (
                      <span className="ml-auto text-base">{RANK_ICONS[rank]}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* NHỐT — chỉ hiện sau khi assign đủ */}
          {allRanked && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                🔒 Nhốt bài <span className="text-gray-300 font-normal normal-case">(−{settings.nhotPenalty}đ thêm cho nhất)</span>
              </p>
              <div className="flex gap-2">
                {[1, 2, 3].map((rank) => {
                  const playerIdx = rankOrder[rank];
                  if (playerIdx === null) return null;
                  const c = PLAYER_COLORS[playerIdx];
                  const active = nhotPlayers.includes(playerIdx);
                  return (
                    <button
                      key={rank}
                      onClick={() => toggleNhot(playerIdx)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-0.5
                        ${active
                          ? `${c.bg} ${c.border} ${c.text}`
                          : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white ${active ? c.badge : 'bg-gray-300'}`}>
                        {PLAYER_COLORS[playerIdx].label}
                      </span>
                      <span className="text-xs font-medium truncate w-full text-center px-1">{players[playerIdx]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CHẶT HEO */}
          {allRanked && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                🐷 Chặt heo
              </p>
              <div className="flex gap-2 mb-3">
                {[0, 1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setHeoCount(n)}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 transition-all
                      ${chatHeoEvents.length === n
                        ? 'border-orange-400 bg-orange-100 text-orange-700'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                  >
                    {n === 0 ? 'Không' : n}
                  </button>
                ))}
              </div>

              {chatHeoEvents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1 text-xs text-gray-400">
                    <span className="flex-1 text-center">Người chặt</span>
                    <span className="w-4" />
                    <span className="flex-1 text-center">Heo của ai</span>
                    <span className="w-16 text-center">Loại</span>
                    <span className="w-5" />
                  </div>

                  {chatHeoEvents.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-2">
                      <div className="flex gap-1 flex-1 justify-center">
                        {players.map((_, i) => (
                          <button key={i} onClick={() => {
                            updateHeoEvent(idx, 'cutter', i);
                            if (ev.victim === i) {
                              const next = [0,1,2,3].find((x) => x !== i) ?? 1;
                              updateHeoEvent(idx, 'victim', next);
                            }
                          }}
                            className={`w-8 h-8 rounded-full text-xs font-bold text-white transition-all
                              ${ev.cutter === i ? PLAYER_COLORS[i].badge : 'bg-gray-300 hover:bg-gray-400'}`}>
                            {PLAYER_COLORS[i].label}
                          </button>
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm shrink-0">→</span>
                      <div className="flex gap-1 flex-1 justify-center">
                        {players.map((_, i) => (
                          <button key={i}
                            onClick={() => i !== ev.cutter && updateHeoEvent(idx, 'victim', i)}
                            disabled={i === ev.cutter}
                            className={`w-8 h-8 rounded-full text-xs font-bold text-white transition-all disabled:opacity-20
                              ${ev.victim === i ? PLAYER_COLORS[i].badge : 'bg-gray-300 hover:bg-gray-400'}`}>
                            {PLAYER_COLORS[i].label}
                          </button>
                        ))}
                      </div>
                      <div className="flex rounded-lg overflow-hidden border border-gray-200 shrink-0">
                        <button onClick={() => updateHeoEvent(idx, 'type', 'den')}
                          className={`w-8 h-8 flex items-center justify-center text-base ${ev.type === 'den' ? 'bg-gray-800' : 'bg-white hover:bg-gray-100'}`}>🖤</button>
                        <button onClick={() => updateHeoEvent(idx, 'type', 'do')}
                          className={`w-8 h-8 flex items-center justify-center text-base ${ev.type === 'do' ? 'bg-red-600' : 'bg-white hover:bg-gray-100'}`}>❤️</button>
                      </div>
                      <button onClick={() => removeHeoEvent(idx)} className="text-red-400 hover:text-red-600 text-base w-5 shrink-0 text-center">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ĐỀN CẢ LÀNG */}
          {allRanked && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                💸 Đền cả làng <span className="text-gray-300 font-normal normal-case">(−{(settings.denCaLang ?? 3) * 3}đ mỗi người)</span>
              </p>
              <div className="flex gap-2">
                {players.map((name, i) => {
                  const c = PLAYER_COLORS[i];
                  const active = denCaLangPlayers.includes(i);
                  return (
                    <button key={i} onClick={() => toggleDenCaLang(i)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center gap-0.5
                        ${active ? `${c.bg} ${c.border} ${c.text}` : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white ${active ? c.badge : 'bg-gray-300'}`}>
                        {c.label}
                      </span>
                      <span className="text-xs font-medium truncate w-full text-center px-1">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {allRanked && deltas && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-green-700 mb-3">Kết quả ván này</p>
              <div className="space-y-2">
                {rankOrder.map((playerIdx, rank) => {
                  if (playerIdx === null) return null;
                  const d = deltas[playerIdx];
                  const c = PLAYER_COLORS[playerIdx];
                  return (
                    <div key={rank} className="flex items-center gap-2">
                      <span className="text-base w-6 text-center">{RANK_ICONS[rank]}</span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${c.badge}`}>
                        {c.label}
                      </span>
                      <span className="flex-1 text-sm text-gray-700 truncate">{players[playerIdx]}</span>
                      <span className={`font-bold text-base ${d > 0 ? 'text-green-600' : d < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {d > 0 ? `+${d}` : d === 0 ? '0' : d}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0 sticky bottom-0 bg-white border-t border-gray-100">
          <button onClick={onClose} className="btn-ghost flex-1">Hủy</button>
          <button
            onClick={handleConfirm}
            disabled={!allRanked}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Xác Nhận ✓
          </button>
        </div>
      </div>
    </div>
  );
}
