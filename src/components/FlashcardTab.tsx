import React, { useState, useEffect, useCallback } from 'react';
import { VocabItem } from '../data/vocabData';
import { playSound, playPronunciation, Accent } from '../utils/audio';
import { FINN_AVATAR } from '../constants/mascot';
import { Volume2, Sparkles, ArrowLeft, ArrowRight, Check, X, RotateCw, BookmarkCheck, ExternalLink, BookA } from 'lucide-react';

interface FlashcardTabProps {
  vocabList: VocabItem[];
  masteredIds: Set<string>;
  accent: Accent;
  onToggleMastered: (id: string, isMastered: boolean) => void;
}

export const FlashcardTab: React.FC<FlashcardTabProps> = ({
  vocabList,
  masteredIds,
  accent,
  onToggleMastered,
}) => {
  const [filter, setFilter] = useState<'all' | 'mastered' | 'unmastered'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiMnemonicMap, setAiMnemonicMap] = useState<Record<string, string>>({});
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Filter items
  const filteredList = vocabList.filter((item) => {
    if (filter === 'mastered') return masteredIds.has(item.id);
    if (filter === 'unmastered') return !masteredIds.has(item.id);
    return true;
  });

  const total = filteredList.length;
  const currentItem = filteredList[currentIndex] || filteredList[0];

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    playSound('flip');
  }, []);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % total);
    playSound('click');
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    playSound('click');
  }, [total]);

  const handleMark = (isMastered: boolean) => {
    if (!currentItem) return;
    onToggleMastered(currentItem.id, isMastered);
    if (isMastered) {
      playSound('correct');
    } else {
      playSound('incorrect');
    }
    handleNext();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  // Pronounce automatically when moving to a new card
  useEffect(() => {
    if (currentItem) {
      playPronunciation(
        currentItem.word,
        accent,
        accent === 'uk' ? currentItem.audioUK : currentItem.audioUS
      );
    }
  }, [currentItem?.word, accent]);

  // Request AI Mnemonic
  const handleGenerateAIMnemonic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentItem) return;

    if (aiMnemonicMap[currentItem.id]) {
      // Already cached, just flip to reveal
      setIsFlipped(true);
      return;
    }

    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/gemini/mnemonic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: currentItem.word,
          meaning: currentItem.meaning,
        }),
      });
      const data = await response.json();
      if (data.result) {
        setAiMnemonicMap((prev) => ({
          ...prev,
          [currentItem.id]: data.result,
        }));
        setIsFlipped(true);
      }
    } catch (err) {
      console.error('Failed to get AI mnemonic', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col max-w-3xl mx-auto w-full">
      {/* Top Controls: Filter & Counter */}
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <div className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
          <span>Thẻ:</span>
          <span className="text-teal-700 font-extrabold text-base">
            {total > 0 ? currentIndex + 1 : 0}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500 font-medium">{total}</span>
          {currentItem && masteredIds.has(currentItem.id) && (
            <span className="ml-2 inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              <BookmarkCheck className="w-3 h-3 text-emerald-600" /> Đã thuộc
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setFilter('all'); setCurrentIndex(0); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-teal-800'
            }`}
          >
            Tất cả ({vocabList.length})
          </button>
          <button
            onClick={() => { setFilter('mastered'); setCurrentIndex(0); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'mastered' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'
            }`}
          >
            Đã thuộc ⭐ ({masteredIds.size})
          </button>
          <button
            onClick={() => { setFilter('unmastered'); setCurrentIndex(0); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'unmastered' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-800'
            }`}
          >
            Chưa nhớ ({vocabList.length - masteredIds.size})
          </button>
        </div>
      </div>

      {/* Main Flashcard Container */}
      {total === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center bg-white rounded-3xl p-10 border border-teal-100 text-center shadow-xs my-6">
          <p className="text-slate-500 font-medium mb-3">Không có từ nào trong danh mục này.</p>
          <button
            onClick={() => setFilter('all')}
            className="bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-teal-700 transition"
          >
            Quay lại tất cả từ vựng
          </button>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center my-2 sm:my-4">
          <div
            className="w-full max-w-xl h-[440px] sm:h-[450px] perspective-1000 cursor-pointer select-none"
            onClick={handleFlip}
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d shadow-xl rounded-3xl transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front Face (English) */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-teal-100 p-6 sm:p-7 flex flex-col justify-between backface-hidden shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">
                    {currentItem.type}
                  </span>

                  {/* Direct Link to Cambridge Dictionary */}
                  <a
                    href={currentItem.cambridgeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-700 bg-teal-50/80 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-xl transition shadow-2xs hover:scale-105"
                    title="Tra cứu từ này trên Từ điển Cambridge chính thức (dictionary.cambridge.org)"
                  >
                    <BookA className="w-3.5 h-3.5 text-teal-600" />
                    <span>Cambridge Dict ↗</span>
                  </a>
                </div>

                <div className="text-center my-auto space-y-4">
                  {/* Big English Word */}
                  <div>
                    <h3
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(
                          currentItem.word,
                          accent,
                          accent === 'uk' ? currentItem.audioUK : currentItem.audioUS
                        );
                      }}
                      className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight hover:text-teal-600 transition cursor-pointer"
                      title="Bấm để nghe phát âm"
                    >
                      {currentItem.word}
                    </h3>
                  </div>

                  {/* Cambridge Dictionary Dual Pronunciation Badge (UK & US) */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    {/* Cambridge UK Audio & IPA */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(currentItem.word, 'uk', currentItem.audioUK);
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50/90 hover:bg-blue-100 border border-blue-200 text-blue-950 font-bold transition shadow-2xs active:scale-95"
                      title="Nghe phát âm chuẩn Cambridge UK (Anh - Anh)"
                    >
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-black tracking-wider">
                        UK
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-mono text-xs sm:text-sm text-blue-900">
                        {currentItem.pronounceUK}
                      </span>
                    </button>

                    {/* Cambridge US Audio & IPA */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(currentItem.word, 'us', currentItem.audioUS);
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-50/90 hover:bg-rose-100 border border-rose-200 text-rose-950 font-bold transition shadow-2xs active:scale-95"
                      title="Nghe phát âm chuẩn Cambridge US (Anh - Mỹ)"
                    >
                      <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-black tracking-wider">
                        US
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                      <span className="font-mono text-xs sm:text-sm text-rose-900">
                        {currentItem.pronounceUS}
                      </span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 font-medium">
                    Phiên âm & âm thanh đồng bộ từ <span className="font-semibold text-teal-700">Cambridge Dictionary</span>
                  </p>
                </div>

                {/* Gemini AI Action */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> Phím Space để lật
                  </span>

                  <button
                    onClick={handleGenerateAIMnemonic}
                    disabled={isLoadingAi}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold px-4 py-2 rounded-2xl text-xs transition border border-teal-200 flex items-center space-x-2 shadow-2xs active:scale-95 disabled:opacity-60"
                  >
                    <img
                      src={FINN_AVATAR}
                      alt="FINN"
                      className="w-5 h-5 rounded-full object-cover border border-teal-300"
                    />
                    <Sparkles className={`w-3.5 h-3.5 text-teal-600 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    <span>
                      {isLoadingAi
                        ? 'FINN đang sáng tạo mẹo nhớ...'
                        : 'FINN: Gợi Nhớ Mẹo & Ví Dụ'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Back Face (Vietnamese & Details) */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-800 text-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between backface-hidden rotate-y-180 shadow-xl overflow-y-auto">
                <div className="flex justify-between items-center">
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    Nghĩa Tiếng Việt
                  </span>
                  
                  {/* Cambridge Link on Card Back */}
                  <a
                    href={currentItem.cambridgeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] text-teal-100 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-xl transition border border-white/20 font-bold"
                  >
                    <span>Xem trên Cambridge</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="text-center my-auto py-2">
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 text-white">
                    {currentItem.meaning}
                  </h3>

                  {currentItem.related && currentItem.related !== '--' && (
                    <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl text-xs text-teal-100 max-w-md mx-auto mb-3 border border-white/10">
                      <span className="font-semibold text-white">Từ loại liên quan:</span>{' '}
                      <span className="font-mono text-teal-200">{currentItem.related}</span>
                    </div>
                  )}

                  <div className="bg-white/15 backdrop-blur-xs p-3.5 rounded-2xl text-xs text-white max-w-md mx-auto border border-white/20 text-left space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <img
                        src={FINN_AVATAR}
                        alt="FINN"
                        className="w-5 h-5 rounded-full object-cover border border-amber-300 shadow-2xs"
                      />
                      <span>Mẹo Nhớ Của FINN:</span>
                    </div>
                    <p className="text-teal-50 text-[13px] leading-relaxed whitespace-pre-line">
                      {aiMnemonicMap[currentItem.id] || (
                        <span className="italic opacity-85">
                          Bấm nút &ldquo;FINN: Gợi Nhớ Mẹo & Ví Dụ&rdquo; ở mặt trước để FINN tạo liên tưởng âm thanh và ví dụ siêu nhớ nhé!
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-center text-xs text-teal-200">
                  Bạn đã thuộc từ này chưa? Hãy chọn đánh giá bên dưới.
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard Bottom Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 w-full max-w-xl">
            <button
              onClick={handlePrev}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition shadow-xs flex items-center justify-center space-x-2"
              title="Phím tắt: Mũi tên trái"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Từ trước</span>
            </button>

            <div className="flex gap-2 w-full sm:w-auto flex-1">
              <button
                onClick={() => handleMark(false)}
                className="flex-1 px-5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition shadow-xs flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>Chưa nhớ</span>
              </button>

              <button
                onClick={() => handleMark(true)}
                className="flex-1 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-200 flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Đã thuộc (+10đ)</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition shadow-xs flex items-center justify-center space-x-2"
              title="Phím tắt: Mũi tên phải"
            >
              <span>Từ tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
