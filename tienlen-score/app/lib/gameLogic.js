/**
 * Game logic for Tiến Lên Miền Nam scoring
 * Rank-based: 1st=+2, 2nd=+1, 3rd=-1, 4th=-2
 */

export const RANK_SCORES = [2, 1, -1, -2];
export const RANK_LABELS = ['Nhất', 'Nhì', 'Ba', 'Chót'];
export const RANK_ICONS  = ['🥇', '🥈', '🥉', '💀'];

/**
 * Calculate score deltas for a round.
 * @param {(number|null)[]} rankOrder - [p1stIdx, p2ndIdx, p3rdIdx, p4thIdx]
 * @param {Array<{cutter,victim,type}>} chatHeoEvents
 * @param {object} settings
 * @param {number[]} nhotPlayers   - player indices who were nhốt (extra penalty to 1st)
 * @param {number[]} denCaLangPlayers - player indices who pay everyone
 */
export function calculateDeltas(rankOrder, chatHeoEvents, settings, nhotPlayers = [], denCaLangPlayers = []) {
  const deltas = [0, 0, 0, 0];

  // Base rank scores
  for (let rank = 0; rank < 4; rank++) {
    const player = rankOrder[rank];
    if (player !== null && player !== undefined) {
      deltas[player] += RANK_SCORES[rank];
    }
  }

  // Nhốt: extra penalty paid to 1st place
  const firstPlace = rankOrder[0];
  if (firstPlace !== null && firstPlace !== undefined) {
    for (const player of nhotPlayers) {
      if (player !== firstPlace) {
        deltas[player] -= settings.nhotPenalty;
        deltas[firstPlace] += settings.nhotPenalty;
      }
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

  for (let rank = 0; rank < 4; rank++) {
    const p = round.rankOrder[rank];
    if (p !== null && p !== undefined) {
      lines.push(`  ${RANK_ICONS[rank]} ${RANK_LABELS[rank]}: ${players[p]} (${RANK_SCORES[rank] > 0 ? '+' : ''}${RANK_SCORES[rank]})`);
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
