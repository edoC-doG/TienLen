'use client';

import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import GameSetup from './components/GameSetup';
import ScoreBoard from './components/ScoreBoard';
import RoundModal from './components/RoundModal';
import History from './components/History';
import Settings from './components/Settings';

const TABS = [
  { id: 'game',     label: 'Ván Đấu', icon: '🎮' },
  { id: 'history',  label: 'Lịch Sử', icon: '📜' },
  { id: 'settings', label: 'Cài Đặt', icon: '⚙️' },
];

export default function Page() {
  const {
    state, hydrated,
    startGame, addRound, undoLastRound,
    updatePlayers, updateSettings,
    resetGame, fullReset,
  } = useGameState();

  const [activeTab, setActiveTab] = useState('game');
  const [showRoundModal, setShowRoundModal] = useState(false);

  // Show loading skeleton until localStorage is hydrated
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-4xl animate-pulse">🃏</div>
      </div>
    );
  }

  // Show setup screen if not started
  if (state.phase === 'setup') {
    return (
      <GameSetup
        initialPlayers={state.players}
        onStart={startGame}
      />
    );
  }

  const handleRoundConfirm = (round) => {
    addRound(round);
    setShowRoundModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Top header */}
      <header className="bg-green-700 text-white px-4 pt-4 pb-0 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            🃏 Tiến Lên - Minh Long
          </h1>
          <span className="text-green-200 text-sm">{state.rounds.length} ván</span>
        </div>

        {/* Tab bar */}
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-green-300 hover:text-green-100'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-28">
        {activeTab === 'game' && (
          <div>
            <ScoreBoard
              players={state.players}
              scores={state.scores}
              roundCount={state.rounds.length}
            />

            {/* Last round summary */}
            {state.rounds.length > 0 && (() => {
              const last = state.rounds[state.rounds.length - 1];
              const ICONS = ['🥇', '🥈', '🥉', '💀'];
              return (
                <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ván vừa rồi</p>
                  <div className="space-y-1">
                    {(last.rankOrder ?? []).map((playerIdx, rank) => {
                      if (playerIdx === null || playerIdx === undefined) return null;
                      const d = last.deltas[playerIdx];
                      return (
                        <div key={rank} className="flex items-center gap-2 text-sm">
                          <span>{ICONS[rank]}</span>
                          <span className="flex-1 text-gray-700">{state.players[playerIdx]}</span>
                          <span className={`font-bold ${d > 0 ? 'text-green-600' : d < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {d > 0 ? `+${d}` : d}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Empty state */}
            {state.rounds.length === 0 && (
              <div className="mx-4 mt-3 bg-white rounded-2xl border border-dashed border-gray-300 p-6 text-center text-gray-400">
                <div className="text-4xl mb-2">🎴</div>
                <p className="font-medium">Bắt đầu ván đầu tiên!</p>
                <p className="text-sm mt-1">Nhấn nút bên dưới để ghi kết quả</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <History
            rounds={state.rounds}
            players={state.players}
            settings={state.settings}
            onUndo={undoLastRound}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            players={state.players}
            settings={state.settings}
            onUpdatePlayers={updatePlayers}
            onUpdateSettings={updateSettings}
            onResetGame={resetGame}
            onFullReset={fullReset}
          />
        )}
      </main>

      {/* Floating action button */}
      {activeTab === 'game' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 pb-6 pt-2 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent pointer-events-none">
          <button
            onClick={() => setShowRoundModal(true)}
            className="pointer-events-auto w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-300 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-2xl">+</span>
            Kết Thúc Ván
          </button>
        </div>
      )}

      {/* Round modal */}
      {showRoundModal && (
        <RoundModal
          players={state.players}
          settings={state.settings}
          onConfirm={handleRoundConfirm}
          onClose={() => setShowRoundModal(false)}
        />
      )}
    </div>
  );
}
