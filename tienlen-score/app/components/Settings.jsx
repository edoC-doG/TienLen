'use client';

import { useState } from 'react';

const PLAYER_COLORS = [
  { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   label: 'A' },
  { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    label: 'B' },
  { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'C' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', label: 'D' },
];

function NumberStepper({ value, onChange, min = 1, max = 99, label, sub }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-gray-800">{label}</p>
        {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-lg flex items-center justify-center"
        >−</button>
        <span className="w-8 text-center font-bold text-gray-800">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-lg flex items-center justify-center"
        >+</button>
      </div>
    </div>
  );
}

export default function Settings({ players, settings, onUpdatePlayers, onUpdateSettings, onResetGame, onFullReset }) {
  const [localPlayers, setLocalPlayers] = useState(players);
  const [localSettings, setLocalSettings] = useState(settings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFullResetConfirm, setShowFullResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const setPlayerName = (i, v) =>
    setLocalPlayers((p) => p.map((x, j) => (j === i ? v : x)));

  const setSetting = (key, val) =>
    setLocalSettings((s) => ({ ...s, [key]: val }));

  const handleSave = () => {
    onUpdatePlayers(localPlayers.map((n, i) => n.trim() || `Người ${i + 1}`));
    onUpdateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="p-4 pb-28 space-y-4">
      {/* Player names */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-3">👤 Tên người chơi</h3>
        <div className="space-y-2">
          {localPlayers.map((name, i) => {
            const c = PLAYER_COLORS[i];
            return (
              <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border ${c.bg} ${c.border}`}>
                <span className={`font-bold ${c.text} w-5`}>{c.label}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setPlayerName(i, e.target.value)}
                  placeholder={`Người chơi ${i + 1}`}
                  maxLength={16}
                  className="flex-1 bg-transparent outline-none text-gray-800 font-medium"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules / Bonuses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-1">📋 Thưởng phạt thêm</h3>
        <div className="divide-y divide-gray-100">
          <NumberStepper
            value={localSettings.nhotPenalty ?? 2}
            onChange={(v) => setSetting('nhotPenalty', v)}
            label="🔒 Nhốt bài (điểm phạt thêm)"
            sub="Trả thêm cho người nhất"
            min={1} max={20}
          />
          <NumberStepper
            value={localSettings.chatHeoDen ?? 3}
            onChange={(v) => setSetting('chatHeoDen', v)}
            label="🖤 Chặt heo đen"
            min={1} max={20}
          />
          <NumberStepper
            value={localSettings.chatHeoDo ?? 4}
            onChange={(v) => setSetting('chatHeoDo', v)}
            label="❤️ Chặt heo đỏ"
            min={1} max={20}
          />
          <NumberStepper
            value={localSettings.denCaLang ?? 3}
            onChange={(v) => setSetting('denCaLang', v)}
            label="💸 Đền cả làng (mỗi người)"
            min={1} max={20}
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`btn-primary w-full text-base ${saved ? 'bg-green-700' : ''}`}
      >
        {saved ? '✓ Đã lưu!' : 'Lưu Cài Đặt'}
      </button>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4 space-y-3">
        <h3 className="font-semibold text-red-600 mb-1">⚠️ Vùng nguy hiểm</h3>

        {!showResetConfirm ? (
          <button onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 font-medium">
            Chơi lại từ đầu (giữ tên)
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-600 text-center font-medium">Xóa tất cả điểm số và lịch sử?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowResetConfirm(false)} className="btn-ghost flex-1">Hủy</button>
              <button onClick={() => { onResetGame(); setShowResetConfirm(false); }} className="btn-danger flex-1">Xác nhận</button>
            </div>
          </div>
        )}

        {!showFullResetConfirm ? (
          <button onClick={() => setShowFullResetConfirm(true)}
            className="w-full py-2.5 rounded-xl border-2 border-red-500 text-red-700 hover:bg-red-50 font-medium">
            Reset toàn bộ (xóa tên + điểm)
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-700 text-center font-medium">Reset hoàn toàn ứng dụng?</p>
            <div className="flex gap-2">
              <button onClick={() => setShowFullResetConfirm(false)} className="btn-ghost flex-1">Hủy</button>
              <button onClick={() => { onFullReset(); setShowFullResetConfirm(false); }} className="btn-danger flex-1">Reset!</button>
            </div>
          </div>
        )}
      </div>

      {/* Rules guide */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-3">📖 Hướng dẫn tính điểm</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex gap-2"><span>🥇</span><span><b>Nhất</b>: +2 điểm</span></div>
          <div className="flex gap-2"><span>🥈</span><span><b>Nhì</b>: +1 điểm</span></div>
          <div className="flex gap-2"><span>🥉</span><span><b>Ba</b>: −1 điểm</span></div>
          <div className="flex gap-2"><span>💀</span><span><b>Chót</b>: −2 điểm</span></div>
          <div className="flex gap-2"><span>🔒</span><span><b>Nhốt bài</b>: trả thêm {settings.nhotPenalty ?? 2}đ cho người nhất</span></div>
          <div className="flex gap-2"><span>🖤</span><span><b>Heo đen</b> (2♠, 2♣): người bị chặt trả {settings.chatHeoDen ?? 3}đ cho người chặt</span></div>
          <div className="flex gap-2"><span>❤️</span><span><b>Heo đỏ</b> (2♥, 2♦): người bị chặt trả {settings.chatHeoDo ?? 4}đ cho người chặt</span></div>
          <div className="flex gap-2"><span>💸</span><span><b>Đền cả làng</b>: trả {settings.denCaLang ?? 3}đ cho mỗi người còn lại</span></div>
        </div>
      </div>
    </div>
  );
}
