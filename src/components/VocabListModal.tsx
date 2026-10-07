import React, { useState } from 'react';
import { VocabItem } from '../data/vocabData';
import { playPronunciation } from '../utils/audio';
import { FINN_AVATAR } from '../constants/mascot';
import { X, Search, Volume2, Star, CheckCircle, ExternalLink, BookA } from 'lucide-react';

interface VocabListModalProps {
  vocabList: VocabItem[];
  masteredIds: Set<string>;
  onToggleMastered: (id: string, isMastered: boolean) => void;
  onClose: () => void;
}

export const VocabListModal: React.FC<VocabListModalProps> = ({
  vocabList,
  masteredIds,
  onToggleMastered,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = vocabList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.word.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q) ||
      item.pronounceUK.toLowerCase().includes(q) ||
      item.pronounceUS.toLowerCase().includes(q);

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'n' && item.type.includes('(n)')) ||
      (typeFilter === 'adj' && item.type.includes('(adj)')) ||
      (typeFilter === 'v' && item.type.includes('(v)')) ||
      (typeFilter === 'phrases' && item.type.includes('phrases'));

    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 max-h-[92vh] overflow-hidden shadow-2xl border border-teal-100 flex flex-col">
        {/* Header with Mascot & Cambridge Badge */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={FINN_AVATAR}
              alt="FINN"
              className="w-11 h-11 rounded-2xl object-cover border-2 border-teal-400 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-teal-950">
                  Từ Điển Unit 2 Cùng FINN
                </h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200">
                  Chuẩn Cambridge
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Tra cứu trọn bộ 41 từ vựng & cụm từ kèm phiên âm UK/US từ Cambridge Dictionary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo từ vựng, nghĩa tiếng Việt hoặc phiên âm IPA..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Tất cả (41)' },
              { id: 'n', label: 'Danh từ (n)' },
              { id: 'adj', label: 'Tính từ (adj)' },
              { id: 'v', label: 'Động từ (v)' },
              { id: 'phrases', label: 'Cụm từ' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  typeFilter === t.id
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table / List */}
        <div className="flex-grow overflow-y-auto border border-slate-100 rounded-2xl">
          <div className="divide-y divide-slate-100">
            {filtered.map((item, idx) => {
              const isMastered = masteredIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-3.5 hover:bg-teal-50/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-start sm:items-center space-x-3">
                    <span className="text-[11px] font-mono text-slate-400 w-5 text-right shrink-0 pt-0.5 sm:pt-0">
                      {idx + 1}
                    </span>
                    <div>
                      {/* Word Title & Type */}
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm sm:text-base text-teal-950">
                          {item.word}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {item.type}
                        </span>
                        {item.related && item.related !== '--' && (
                          <span className="text-[10px] text-teal-600 italic hidden md:inline">
                            (Liên quan: {item.related})
                          </span>
                        )}
                      </div>

                      {/* Cambridge UK & US Pronunciations */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {/* UK Pronunciation */}
                        <button
                          onClick={() => playPronunciation(item.word, 'uk', item.audioUK)}
                          className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold transition shadow-2xs"
                          title="Bấm nghe phát âm Cambridge UK"
                        >
                          <span className="bg-blue-600 text-white text-[9px] px-1 rounded font-black">
                            UK
                          </span>
                          <Volume2 className="w-3 h-3 text-blue-600" />
                          <span className="font-mono text-[11px]">{item.pronounceUK}</span>
                        </button>

                        {/* US Pronunciation */}
                        <button
                          onClick={() => playPronunciation(item.word, 'us', item.audioUS)}
                          className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-xs font-bold transition shadow-2xs"
                          title="Bấm nghe phát âm Cambridge US"
                        >
                          <span className="bg-rose-600 text-white text-[9px] px-1 rounded font-black">
                            US
                          </span>
                          <Volume2 className="w-3 h-3 text-rose-600" />
                          <span className="font-mono text-[11px]">{item.pronounceUS}</span>
                        </button>

                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-slate-700 font-semibold text-xs">
                          {item.meaning}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Cambridge Link & Mastered Toggle */}
                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    {/* Cambridge Official Dictionary Link */}
                    <a
                      href={item.cambridgeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-xl border border-teal-200 bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      title="Mở trang từ điển Cambridge chính thức trong tab mới"
                    >
                      <BookA className="w-3.5 h-3.5 text-teal-600" />
                      <span className="hidden md:inline">Cambridge</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>

                    {/* Mastered Toggle */}
                    <button
                      onClick={() => onToggleMastered(item.id, !isMastered)}
                      className={`p-1.5 px-2.5 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                        isMastered
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isMastered ? 'Bấm để hủy thuộc' : 'Bấm để đánh dấu đã thuộc'}
                    >
                      {isMastered ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">Đã thuộc</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Chưa thuộc</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                Không tìm thấy từ vựng nào khớp với bộ lọc tìm kiếm.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 mt-2 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">
            Hiển thị <b>{filtered.length}</b> / {vocabList.length} từ • Dữ liệu chuẩn{' '}
            <a
              href="https://dictionary.cambridge.org/vi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 font-bold hover:underline"
            >
              Cambridge Dictionary
            </a>
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
