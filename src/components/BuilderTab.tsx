import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VocabItem } from '../data/vocabData';
import { playSound, playPronunciation } from '../utils/audio';
import { FINN_AVATAR } from '../constants/mascot';
import { Volume2, Award, RotateCcw, ArrowRight, CheckCircle2, XCircle, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuilderTabProps {
  vocabList: VocabItem[];
  onAddScore: (points: number) => void;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
}

export const BuilderTab: React.FC<BuilderTabProps> = ({
  vocabList,
  onAddScore,
  onIncrementStreak,
  onResetStreak,
}) => {
  const [list, setList] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const startNewChallenge = useCallback(() => {
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random()).slice(0, 10);
    setList(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setIsChecked(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setIsCompleted(false);
    setHintUsed(false);
  }, [vocabList]);

  useEffect(() => {
    startNewChallenge();
  }, [startNewChallenge]);

  const currentItem = list[currentIndex];

  useEffect(() => {
    if (!isChecked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, isChecked]);

  const handleCheck = () => {
    if (!userInput.trim() || isChecked || !currentItem) return;

    const trimmed = userInput.trim().toLowerCase();
    const target = currentItem.word.toLowerCase();
    const correct = trimmed === target;

    setIsChecked(true);
    setIsCorrect(correct);
    playPronunciation(currentItem.word);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      onAddScore(hintUsed ? 5 : 10);
      onIncrementStreak();
      playSound('correct');
    } else {
      onResetStreak();
      playSound('incorrect');
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < list.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput('');
      setIsChecked(false);
      setIsCorrect(false);
      setHintUsed(false);
    } else {
      setIsCompleted(true);
      playSound('complete');
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  const handleHint = () => {
    if (!currentItem || hintUsed) return;
    setHintUsed(true);
    // Fill first character
    const firstLetter = currentItem.word.charAt(0);
    setUserInput(firstLetter);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-sm w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <img
              src={FINN_AVATAR}
              alt="FINN"
              className="w-10 h-10 rounded-2xl object-cover border-2 border-teal-400 shadow-2xs"
            />
            <div>
              <span className="text-[11px] font-black text-teal-600 uppercase tracking-wider block mb-0.5">
                Thử Thách Gõ Cùng FINN
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                Gõ đúng từng chữ cái tiếng Anh
              </h3>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-600 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
            Chính xác: <span className="text-teal-700 font-extrabold text-sm">{correctCount}</span>/{list.length}
          </div>
        </div>

        {!isCompleted && currentItem ? (
          <div className="space-y-6">
            {/* Clue Prompt Card */}
            <div className="bg-teal-50/70 p-6 rounded-2xl border border-teal-100 text-center relative">
              <button
                onClick={() => playPronunciation(currentItem.word)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-teal-200/80 hover:bg-teal-300 text-teal-800 flex items-center justify-center transition shadow-2xs"
                title="Nghe phát âm từ này"
              >
                <Volume2 className="w-4 h-4 text-teal-800" />
              </button>

              <p className="text-xs text-teal-700 font-bold uppercase tracking-wider mb-2">
                Nghĩa tiếng Việt:
              </p>
              <h4 className="text-2xl sm:text-3xl font-black text-teal-950 mb-3">
                {currentItem.meaning}
              </h4>
              <div className="inline-block bg-white px-3.5 py-1.5 rounded-full text-xs text-slate-500 font-mono border border-teal-200">
                Loại từ: <span className="font-bold text-teal-700">{currentItem.type}</span> • Phiên âm:{' '}
                <span className="font-bold text-teal-700">{currentItem.pronounce}</span>
              </div>
            </div>

            {/* Typing Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Nhập từ tiếng Anh tương ứng:
                </label>
                {!isChecked && !hintUsed && (
                  <button
                    onClick={handleHint}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Gợi ý chữ cái đầu
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  disabled={isChecked}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (!isChecked) handleCheck();
                      else handleNext();
                    }
                  }}
                  autoComplete="off"
                  placeholder="Gõ từ tiếng Anh vào đây rồi nhấn Enter..."
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 font-bold text-base transition disabled:bg-slate-100"
                />

                {!isChecked ? (
                  <button
                    onClick={handleCheck}
                    disabled={!userInput.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition shadow-md shadow-teal-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
                  >
                    Kiểm tra
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition shadow-md shadow-teal-200 whitespace-nowrap active:scale-95 flex items-center gap-1"
                  >
                    <span>Tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Feedback alert */}
            {isChecked && (
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-3 ${
                  isCorrect
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                    : 'bg-rose-50 text-rose-950 border border-rose-200'
                }`}
              >
                <img
                  src={FINN_AVATAR}
                  alt="FINN"
                  className="w-8 h-8 rounded-full object-cover border border-teal-300 shadow-2xs shrink-0"
                />
                <div>
                  {isCorrect ? (
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>FINN: Đỉnh của chóp! Bạn nhớ chính xác 100% từng chữ cái rồi đó! 👏</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-0.5">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>FINN: Chưa trúng rồi nè, đừng buồn nhé:</span>
                      </div>
                      <span className="text-slate-800">
                        Từ đúng là: <b className="font-black text-sm text-teal-900">{currentItem.word}</b>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold pt-1">
              <span>Tiến độ: {currentIndex + 1} / {list.length}</span>
              <span>Mẹo: Nhấn Enter để kiểm tra và chuyển tiếp</span>
            </div>
          </div>
        ) : null}

        {/* Challenge Complete */}
        {isCompleted && (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <Award className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Hoàn Thành Thử Thách Gõ!</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Bạn đã gõ đúng <span className="text-teal-700 font-extrabold text-base">{correctCount}</span> /{' '}
              {list.length} từ vựng Unit 2.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={startNewChallenge}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition shadow-md shadow-teal-200 flex items-center space-x-1.5 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Thử Thách</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
