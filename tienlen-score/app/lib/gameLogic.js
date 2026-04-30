/**
 * Game logic for Tiến Lên Miền Nam scoring
 * Rank-based: 1st=+2, 2nd=+1, 3rd=-1, 4th=-2
 */

export const RANK_SCORES = [2, 1, -1, -2];
export const RANK_LABELS = ['Nhất', 'Nhì', 'Ba', 'Chót'];
export const RANK_ICONS  = ['🥇', '🥈', '🥉', '💀'];

// Điểm theo số người chơi thật (không nhốt):
// 4 người: +2,+1,−1,−2 | 3 người: +2,+1,−1 | 2 người: +2,−2 | 1 người: +2
const EFFECTIVE_SCORES = [[2], [2, -2], [2, 1, -1], [2, 1, -1, -2]];

/**
 * Calculate score deltas for a round.
 * @param {(number|null)[]} rankOrder - [p1stIdx, p2ndIdx, p3rdIdx, p4thIdx]
 * @param {Array<{cutter,victim,type}>} chatHeoEvents
 * @param {object} settings
 * @param {number[]} nhotPlayers   - player indices who were nhốt (chỉ tính tiền nhốt)
 * @param {number[]} denCaLangPlayers - player indices who pay everyone
 */
export function calculateDeltas(rankOrder, chatHeoEvents, settings, nhotPlayers = [], denCaLangPlayers = []) {
  const deltas = [0, 0, 0, 0];

  // Lọc người chơi thật (không nhốt) theo thứ tự rank
  const realPlayers = rankOrder.filter(p => p !== null && p !== undefined && !nhotPlayers.includes(p));
  const scores = EFFECTIVE_SCORES[realPlayers.length - 1] ?? [];

  for (let i = 0; i < realPlayers.length; i++) {
    deltas[realPlayers[i]] += scores[i];
  }

  // Nhốt: chỉ tính tiền nhốt, trả cho người nhất (người đầu tiên không nhốt)
  const firstPlace = realPlayers[0];
  if (firstPlace !== undefined) {
    for (const player of nhotPlayers) {
      deltas[player] -= settings.nhotPenalty;
      deltas[firstPlace] += settings.nhotPenalty;
    }
  }

  // Chặt heo: direct transfer from victim to cutter
  for (const event of chatHeoEvents) {
    const bonus = event.type === 'do' ? settings.chatHeoDo : settings.chatHeoDen;
    deltas[event.cutter] += bonus;
    deltas[event.victim] -= bonus;
  }

  // Đền cả làng: player pays settings.denCaLang to each of the other 3 players
  for (const player of denCaLangPlayers) {
    for (let i = 0; i < 4; i++) {
      if (i === player) continue;
      deltas[player] -= settings.denCaLang;
      deltas[i] += settings.denCaLang;
    }
  }

  return deltas;
}

/**
 * Describe a round in text (for history display)
 */
export function describeRound(round, players, settings) {
  const lines = [];

  const nhotSet = new Set(round.nhotPlayers ?? []);
  const realPlayers = (round.rankOrder ?? []).filter(p => p !== null && !nhotSet.has(p));
  const scores = EFFECTIVE_SCORES[realPlayers.length - 1] ?? [];

  for (let rank = 0; rank < 4; rank++) {
    const p = round.rankOrder[rank];
    if (p === null || p === undefined) continue;
    if (nhotSet.has(p)) {
      lines.push(`  🔒 ${players[p]} nhốt bài (−${round.settings?.nhotPenalty ?? '?'})`);
    } else {
      const ri = realPlayers.indexOf(p);
      const sc = scores[ri] ?? 0;
      lines.push(`  ${RANK_ICONS[rank]} ${players[p]}: ${sc > 0 ? '+' : ''}${sc}`);
    }
  }

  for (const p of (round.nhotPlayers ?? [])) {
    lines.push(`  🔒 ${players[p]} nhốt bài (-${settings.nhotPenalty} thêm)`);
  }

  for (const ev of (round.chatHeoEvents ?? [])) {
    const type = ev.type === 'do' ? 'heo đỏ' : 'heo đen';
    const bonus = ev.type === 'do' ? settings.chatHeoDo : settings.chatHeoDen;
    lines.push(`  🐷 ${players[ev.cutter]} chặt ${type} của ${players[ev.victim]} (+${bonus})`);
  }

  for (const idx of (round.denCaLangPlayers ?? [])) {
    lines.push(`  💸 ${players[idx]} đền cả làng (-${settings.denCaLang * 3})`);
  }

  return lines;
}

export const DEFAULT_SETTINGS = {
  nhotPenalty: 2,
  chatHeoDen: 3,
  chatHeoDo: 4,
  denCaLang: 3,
};

export const DEFAULT_PLAYERS = ['Người 1', 'Người 2', 'Người 3', 'Người 4'];
