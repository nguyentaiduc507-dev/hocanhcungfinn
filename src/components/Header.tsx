import React from 'react';
import { Flame, Star, ClipboardCheck, BookOpen, Volume2, VolumeX, ListOrdered } from 'lucide-react';
import { FINN_AVATAR } from '../constants/mascot';
import { Accent } from '../utils/audio';

interface HeaderProps {
  score: number;
  streak: number;
  soundEnabled: boolean;
  accent: Accent;
  onToggleAccent: (accent: Accent) => void;
  onToggleSound: () => void;
  onOpenReport: () => void;
  onOpenStudyGuide: () => void;
  onOpenVocabList: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  streak,
  soundEnabled,
  accent,
  onToggleAccent,
  onToggleSound,
  onOpenReport,
  onOpenStudyGuide,
  onOpenVocabList,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-teal-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex flex-wrap justify-between items-center gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={FINN_AVATAR}
              alt="Mascot FINN"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl object-cover border-2 border-teal-400 shadow-md shadow-teal-100 hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-teal-950 font-black text-[9px] px-1 rounded-full border border-white">
              AI
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-lg text-teal-950 tracking-tight flex items-center gap-1.5">
                <span>Học Tiếng Anh Cùng FINN</span>
                <span className="text-amber-500">✨</span>
              </h1>
              <span className="hidden md:inline-block bg-teal-100 text-teal-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                Unit 2: Healthy Living
              </span>
            </div>
            <p className="text-xs text-teal-600 font-medium">
              41 Từ vựng • Chuẩn Từ điển Cambridge UK & US • Cùng FINN Tiến Bộ Mỗi Ngày
            </p>
          </div>
        </div>

        {/* Controls & Metrics */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Cambridge Accent Toggle Pill */}
          <div
            className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold"
            title="Chọn giọng phát âm chuẩn Cambridge (Anh - Anh hoặc Anh - Mỹ)"
          >
            <button
              onClick={() => onToggleAccent('uk')}
              className={`px-2 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                accent === 'uk'
                  ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-blue-700'
              }`}
              title="Phát âm Cambridge UK (Anh - Anh)"
            >
              <span>🇬🇧</span>
              <span>UK</span>
            </button>
            <button
              onClick={() => onToggleAccent('us')}
              className={`px-2 py-1 rounded-lg transition flex items-center gap-1 text-[11px] ${
                accent === 'us'
                  ? 'bg-rose-600 text-white shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
              title="Phát âm Cambridge US (Anh - Mỹ)"
            >
              <span>🇺🇸</span>
              <span>US</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
            className="p-1.5 rounded-xl border border-teal-100 bg-teal-50/70 hover:bg-teal-100 text-teal-700 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Quick vocab list lookup */}
          <button
            onClick={onOpenVocabList}
            className="bg-white hover:bg-teal-50 border border-teal-200 text-teal-800 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            title="Xem danh sách từ vựng & phiên âm Cambridge"
          >
            <ListOrdered className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Từ Điển (41)</span>
          </button>

          {/* Study tips */}
          <button
            onClick={onOpenStudyGuide}
            className="bg-white hover:bg-teal-50 border border-teal-200 text-teal-800 px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
            title="Bí kíp học từ vựng cùng FINN"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Bí Kíp FINN</span>
          </button>

          {/* Streak Counter */}
          <div className="bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full flex items-center space-x-1 text-amber-900 text-xs font-black shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
            <span>Chuỗi: {streak}</span>
          </div>

          {/* Score Counter */}
          <div className="bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-teal-950 text-xs font-black shadow-2xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{score} điểm</span>
          </div>

          {/* Report / Submit */}
          <button
            onClick={onOpenReport}
            className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-md shadow-teal-200 flex items-center space-x-1.5"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Báo Cáo Điểm</span>
          </button>
        </div>
      </div>
    </header>
  );
};
