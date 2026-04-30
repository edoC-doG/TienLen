'use client';

import { useState } from 'react';

const PLAYER_COLORS = ['text-blue-600', 'text-red-600', 'text-yellow-600', 'text-purple-600'];
const PLAYER_BG = ['bg-blue-50', 'bg-red-50', 'bg-yellow-50', 'bg-purple-50'];
const PLAYER_BORDER = ['border-blue-200', 'border-red-200', 'border-yellow-200', 'border-purple-200'];

export default function GameSetup({ initialPlayers, onStart }) {
  const [names, setNames] = useState(initialPlayers);

  const setName = (i, v) => setNames((n) => n.map((x, j) => (j === i ? v : x)));

  const handleStart = () => {
    const trimmed = names.map((n, i) => n.trim() || `Người ${i + 1}`);
    onStart(trimmed);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-green-800 to-green-900">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="text-6xl mb-3">🃏</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Tiến Lên - Minh Long</h1>
        <p className="text-green-300 mt-1">Tính Điểm Miền Nam</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-5 text-center">Nhập tên 4 người chơi</h2>

        <div className="space-y-3">
          {names.map((name, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${PLAYER_BG[i]} ${PLAYER_BORDER[i]}`}>
              <span className={`text-xl font-bold w-8 text-center ${PLAYER_COLORS[i]}`}>
                {['A', 'B', 'C', 'D'][i]}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(i, e.target.value)}
                placeholder={`Người chơi ${i + 1}`}
                maxLength={16}
                className="flex-1 bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="btn-primary w-full mt-6 text-lg"
        >
          Bắt Đầu Chơi 🎮
        </button>
      </div>

      <p className="text-green-400 text-sm mt-6 text-center">
        Dữ liệu lưu trên thiết bị của bạn
      </p>
    </div>
  );
}
