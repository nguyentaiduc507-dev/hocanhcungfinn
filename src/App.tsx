import { useState, useEffect } from 'react';
import { vocabData } from './data/vocabData';
import { setSoundEnabled, isSoundEnabled, Accent, getSelectedAccent, setSelectedAccent } from './utils/audio';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { FlashcardTab } from './components/FlashcardTab';
import { QuizTab } from './components/QuizTab';
import { MatchingTab } from './components/MatchingTab';
import { BuilderTab } from './components/BuilderTab';
import { AITutorTab } from './components/AITutorTab';
import { ReportModal } from './components/ReportModal';
import { StudyGuideModal } from './components/StudyGuideModal';
import { VocabListModal } from './components/VocabListModal';
import { FinnMascot } from './components/FinnMascot';
import { Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('flashcard');
  const [score, setScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('unit2_vocab_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('unit2_vocab_streak');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('unit2_vocab_mastered');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [accent, setAccent] = useState<Accent>(() => getSelectedAccent());

  // Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showStudyGuideModal, setShowStudyGuideModal] = useState(false);
  const [showVocabListModal, setShowVocabListModal] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('unit2_vocab_score', score.toString());
      localStorage.setItem('unit2_vocab_streak', streak.toString());
      localStorage.setItem('unit2_vocab_mastered', JSON.stringify(Array.from(masteredIds)));
    } catch {
      // ignore in restricted environments
    }
  }, [score, streak, masteredIds]);

  const handleToggleAccent = (newAccent: Accent) => {
    setAccent(newAccent);
    setSelectedAccent(newAccent);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const handleAddScore = (points: number) => {
    setScore((prev) => prev + points);
  };

  const handleIncrementStreak = () => {
    setStreak((prev) => prev + 1);
  };

  const handleResetStreak = () => {
    setStreak(0);
  };

  const handleToggleMastered = (id: string, isMastered: boolean) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (isMastered) {
        next.add(id);
        setScore((s) => s + 10);
        setStreak((st) => st + 1);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 min-h-screen text-slate-800 flex flex-col font-sans selection:bg-teal-200 selection:text-teal-900">
      {/* Top Header */}
      <Header
        score={score}
        streak={streak}
        soundEnabled={soundOn}
        accent={accent}
        onToggleAccent={handleToggleAccent}
        onToggleSound={handleToggleSound}
        onOpenReport={() => setShowReportModal(true)}
        onOpenStudyGuide={() => setShowStudyGuideModal(true)}
        onOpenVocabList={() => setShowVocabListModal(true)}
      />

      {/* Main Tab Navigation */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 py-4 sm:py-6 flex-grow flex flex-col">
        {/* Banner with FINN & Cambridge TTS Hint */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 rounded-3xl p-4 sm:p-5 text-white mb-5 shadow-lg shadow-teal-900/15 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 border border-teal-600/30">
          <div className="flex items-center space-x-3.5 text-center md:text-left">
            <div className="hidden sm:block shrink-0">
              <FinnMascot mood="waving" size="md" className="ring-2 ring-white/50" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="bg-amber-400 text-teal-950 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-teal-950" /> Chuẩn Cambridge Dictionary
                </span>
                <h2 className="font-black text-sm sm:text-base tracking-tight text-white">
                  Phát âm chuẩn từ điển Cambridge với 2 giọng Anh - Anh (UK) & Anh - Mỹ (US)!
                </h2>
              </div>
              <p className="text-teal-100 text-xs sm:text-sm">
                FINN đồng bộ phiên âm IPA và audio từ <b>Cambridge Dictionary</b> cùng <b>Gemini AI Mnemonic</b> giúp bạn làm chủ 41 từ vựng Unit 2!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStudyGuideModal(true)}
            className="bg-white text-teal-950 hover:bg-amber-50 font-black px-4 py-2.5 rounded-2xl text-xs transition-all shadow-md whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>Bí Kíp Cùng FINN</span>
          </button>
        </div>

        {/* Tab 1: Flashcard */}
        {currentTab === 'flashcard' && (
          <FlashcardTab
            vocabList={vocabData}
            masteredIds={masteredIds}
            accent={accent}
            onToggleMastered={handleToggleMastered}
          />
        )}

        {/* Tab 2: Quiz */}
        {currentTab === 'quiz' && (
          <QuizTab
            vocabList={vocabData}
            onAddScore={handleAddScore}
            onIncrementStreak={handleIncrementStreak}
            onResetStreak={handleResetStreak}
            onOpenReport={() => setShowReportModal(true)}
          />
        )}

        {/* Tab 3: Matching Game */}
        {currentTab === 'matching' && (
          <MatchingTab
            vocabList={vocabData}
            onAddScore={handleAddScore}
            onIncrementStreak={handleIncrementStreak}
          />
        )}

        {/* Tab 4: Typing / Builder Challenge */}
        {currentTab === 'builder' && (
          <BuilderTab
            vocabList={vocabData}
            onAddScore={handleAddScore}
            onIncrementStreak={handleIncrementStreak}
            onResetStreak={handleResetStreak}
          />
        )}

        {/* Tab 5: AI Tutor */}
        {currentTab === 'ai' && <AITutorTab />}
      </main>

      {/* Modals */}
      {showReportModal && (
        <ReportModal
          score={score}
          streak={streak}
          masteredCount={masteredIds.size}
          totalVocab={vocabData.length}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showStudyGuideModal && (
        <StudyGuideModal onClose={() => setShowStudyGuideModal(false)} />
      )}

      {showVocabListModal && (
        <VocabListModal
          vocabList={vocabData}
          masteredIds={masteredIds}
          onToggleMastered={handleToggleMastered}
          onClose={() => setShowVocabListModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white/70 border-t border-teal-100 py-3.5 text-center text-xs text-slate-500 mt-auto">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <span>Học Tiếng Anh Cùng FINN</span>
          <span>•</span>
          <span>Unit 2: Healthy Living</span>
          <span>•</span>
          <span className="text-teal-700 font-bold">Người Bạn Đồng Hành AI Thông Minh</span>
        </p>
      </footer>
    </div>
  );
}
