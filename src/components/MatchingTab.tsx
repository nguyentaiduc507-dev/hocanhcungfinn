import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VocabItem } from '../data/vocabData';
import { playSound, playPronunciation } from '../utils/audio';
import { FINN_AVATAR } from '../constants/mascot';
import { RotateCcw, Clock, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MatchingCard {
  uniqueId: string;
  pairId: string;
  text: string;
  type: 'word' | 'meaning';
  wordAudio?: string;
  isMatched: boolean;
}

interface MatchingTabProps {
  vocabList: VocabItem[];
  onAddScore: (points: number) => void;
  onIncrementStreak: () => void;
}

export const MatchingTab: React.FC<MatchingTabProps> = ({
  vocabList,
  onAddScore,
  onIncrementStreak,
}) => {
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MatchingCard[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startNewGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Pick 6 random vocab items
    const subset = [...vocabList].sort(() => 0.5 - Math.random()).slice(0, 6);
    const newCards: MatchingCard[] = [];

    subset.forEach((item, idx) => {
      newCards.push({
        uniqueId: `word-${item.id}-${idx}`,
        pairId: item.id,
        text: item.word,
        type: 'word',
        wordAudio: item.word,
        isMatched: false,
      });
      newCards.push({
        uniqueId: `meaning-${item.id}-${idx}`,
        pairId: item.id,
        text: item.meaning,
        type: 'meaning',
        isMatched: false,
      });
    });

    // Shuffle cards
    newCards.sort(() => 0.5 - Math.random());

    setCards(newCards);
    setSelectedCards([]);
    setMatchedCount(0);
    setSeconds(0);
    setIsCompleted(false);
    setIsGameActive(true);

    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, [vocabList]);

  useEffect(() => {
    startNewGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startNewGame]);

  const handleCardClick = (card: MatchingCard) => {
    if (card.isMatched || selectedCards.length >= 2) return;
    if (selectedCards.length === 1 && selectedCards[0].uniqueId === card.uniqueId) return;

    if (card.type === 'word' && card.wordAudio) {
      playPronunciation(card.wordAudio);
    }
    playSound('click');

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;

      // Check match: must have same pairId and different types
      if (first.pairId === second.pairId && first.type !== second.type) {
        setTimeout(() => {
          playSound('correct');
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === first.pairId ? { ...c, isMatched: true } : c
            )
          );
          setSelectedCards([]);
          const nextMatched = matchedCount + 1;
          setMatchedCount(nextMatched);

          if (nextMatched === 6) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsGameActive(false);
            setIsCompleted(true);
            playSound('complete');
            onAddScore(50);
            onIncrementStreak();
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

            setBestTime((prev) => (prev === null || seconds < prev ? seconds : prev));
          }
        }, 300);
      } else {
        setTimeout(() => {
          playSound('incorrect');
          setTimeout(() => {
            setSelectedCards([]);
          }, 350);
        }, 300);
      }
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center max-w-4xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-sm w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 border-b border-slate-100 pb-4 gap-2">
          <div className="flex items-center space-x-3">
            <img
              src={FINN_AVATAR}
              alt="FINN"
              className="w-10 h-10 rounded-2xl object-cover border-2 border-teal-400 shadow-2xs"
            />
            <div>
              <span className="text-[11px] font-black text-teal-600 uppercase tracking-wider block mb-0.5">
                Ghép Cặp Từ Vựng Cùng FINN
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Nối từ tiếng Anh với nghĩa tiếng Việt tương ứng
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center space-x-1.5 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-900 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Thời gian:</span>
              <span className="font-mono text-teal-700 font-extrabold text-sm">
                {formatTime(seconds)}
              </span>
            </div>

            {bestTime !== null && (
              <div className="hidden sm:flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-800">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span>Kỷ lục: {formatTime(bestTime)}</span>
              </div>
            )}

            <button
              onClick={startNewGame}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-2xs flex items-center space-x-1 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Chơi Vòng Mới</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Bấm chọn 1 thẻ tiếng Anh và 1 thẻ tiếng Việt. Chạm vào thẻ tiếng Anh sẽ nghe phát âm trực tiếp!</span>
        </p>

        {/* 12 Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {cards.map((card) => {
            const isSelected = selectedCards.some((c) => c.uniqueId === card.uniqueId);
            const isCardMatched = card.isMatched;

            let cardStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50/70";

            if (isCardMatched) {
              cardStyle = "bg-emerald-500 border-emerald-600 text-white font-extrabold opacity-75 cursor-not-allowed shadow-inner scale-[0.98]";
            } else if (isSelected) {
              cardStyle = "bg-teal-100 border-teal-500 text-teal-950 font-black shadow-md ring-2 ring-teal-300 scale-[1.02]";
            }

            return (
              <button
                key={card.uniqueId}
                disabled={isCardMatched}
                onClick={() => handleCardClick(card)}
                className={`p-3.5 rounded-2xl border-2 font-semibold text-xs sm:text-sm transition-all duration-200 h-24 sm:h-28 flex flex-col items-center justify-center text-center cursor-pointer select-none ${cardStyle}`}
              >
                <span className="line-clamp-2">{card.text}</span>
                {card.type === 'word' && !isCardMatched && (
                  <span className="text-[10px] text-teal-600 font-mono mt-1 opacity-70">
                    (English)
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Round Complete Banner */}
        {isCompleted && (
          <div className="text-center py-6 px-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-3">
            <h4 className="text-xl sm:text-2xl font-black text-teal-950">
              🎉 Xuất sắc! Bạn đã ghép đúng toàn bộ 6 cặp từ vựng!
            </h4>
            <p className="text-teal-800 text-xs sm:text-sm font-medium">
              Thời gian hoàn thành: <b>{formatTime(seconds)}</b> • Bạn nhận được <b>+50 điểm</b> thưởng!
            </p>
            <div className="flex justify-center gap-3 pt-1">
              <button
                onClick={startNewGame}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md shadow-teal-200 active:scale-95"
              >
                Tiếp Tục Chơi Vòng Khác
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
