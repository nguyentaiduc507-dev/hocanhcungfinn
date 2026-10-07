import React, { useState, useEffect, useCallback } from 'react';
import { VocabItem } from '../data/vocabData';
import { playSound, playPronunciation } from '../utils/audio';
import { FINN_AVATAR } from '../constants/mascot';
import { Volume2, Sparkles, RotateCcw, CheckCircle2, XCircle, ArrowRight, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  word: string;
  meaning: string;
  pronounce: string;
  type: string;
  direction: 'en-to-vi' | 'vi-to-en';
  questionPrompt: string;
  correctAnswer: string;
  options: string[];
}

interface AIQuizData {
  question: string;
  translation: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizTabProps {
  vocabList: VocabItem[];
  onAddScore: (points: number) => void;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
  onOpenReport: () => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  vocabList,
  onAddScore,
  onIncrementStreak,
  onResetStreak,
  onOpenReport,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerConfirmed, setIsAnswerConfirmed] = useState(false);
  const [score, setQuizScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // AI Quiz state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiQuizData, setAiQuizData] = useState<AIQuizData | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSelectedOption, setAiSelectedOption] = useState<string | null>(null);
  const [aiSubmitted, setAiSubmitted] = useState(false);

  // Initialize standard quiz
  const generateQuestions = useCallback(() => {
    const shuffled = [...vocabList].sort(() => 0.5 - Math.random()).slice(0, 10);
    const generated: QuizQuestion[] = shuffled.map((item) => {
      const direction: 'en-to-vi' | 'vi-to-en' = Math.random() < 0.5 ? 'en-to-vi' : 'vi-to-en';
      let correctAnswer = '';
      let options: string[] = [];

      if (direction === 'en-to-vi') {
        correctAnswer = item.meaning;
        options = [correctAnswer];
        while (options.length < 4) {
          const randomItem = vocabList[Math.floor(Math.random() * vocabList.length)];
          if (!options.includes(randomItem.meaning)) {
            options.push(randomItem.meaning);
          }
        }
      } else {
        correctAnswer = item.word;
        options = [correctAnswer];
        while (options.length < 4) {
          const randomItem = vocabList[Math.floor(Math.random() * vocabList.length)];
          if (!options.includes(randomItem.word)) {
            options.push(randomItem.word);
          }
        }
      }

      options.sort(() => 0.5 - Math.random());

      return {
        id: item.id,
        word: item.word,
        meaning: item.meaning,
        pronounce: item.pronounce,
        type: item.type,
        direction,
        questionPrompt:
          direction === 'en-to-vi'
            ? 'Chọn nghĩa tiếng Việt chính xác cho từ vựng sau:'
            : 'Chọn từ vựng tiếng Anh tương ứng với nghĩa sau:',
        correctAnswer,
        options,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerConfirmed(false);
    setQuizScore(0);
    setIsCompleted(false);
  }, [vocabList]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const currentQ = questions[currentIndex];

  // Auto pronounce English word when question is shown
  useEffect(() => {
    if (currentQ && currentQ.direction === 'en-to-vi') {
      playPronunciation(currentQ.word);
    }
  }, [currentQ]);

  const handleSelectOption = (option: string) => {
    if (isAnswerConfirmed) return;
    setSelectedOption(option);
    playSound('click');
    if (currentQ.direction === 'vi-to-en') {
      playPronunciation(option);
    }
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || isAnswerConfirmed || !currentQ) return;
    setIsAnswerConfirmed(true);

    const isCorrect = selectedOption === currentQ.correctAnswer;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      onAddScore(10);
      onIncrementStreak();
      playSound('correct');
    } else {
      onResetStreak();
      playSound('incorrect');
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerConfirmed(false);
    } else {
      setIsCompleted(true);
      playSound('complete');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  // Generate AI Quiz modal
  const handleOpenAIQuiz = async () => {
    setAiModalOpen(true);
    setAiLoading(true);
    setAiQuizData(null);
    setAiSelectedOption(null);
    setAiSubmitted(false);

    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.quiz) {
        setAiQuizData(data.quiz);
      }
    } catch (err) {
      console.error('Error fetching AI quiz:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCheckAIAnswer = (optLetter: string) => {
    if (aiSubmitted || !aiQuizData) return;
    setAiSelectedOption(optLetter);
    setAiSubmitted(true);
    const cleanCorrect = aiQuizData.correctAnswer.trim().toUpperCase();
    const isCorrect = optLetter === cleanCorrect;
    if (isCorrect) {
      onAddScore(20);
      onIncrementStreak();
      playSound('correct');
      confetti({ particleCount: 50, spread: 45 });
    } else {
      playSound('incorrect');
    }
  };

  return (
    <div className="flex-grow flex flex-col justify-center items-center max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-sm w-full">
        {/* Quiz Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 border-b border-slate-100 pb-4 gap-2">
          <div>
            <span className="text-[11px] font-extrabold text-teal-600 uppercase tracking-wider block mb-0.5">
              Thử Thách Trắc Nghiệm Song Hướng
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              {isCompleted ? 'Tổng Kết Kết Quả' : `Câu hỏi ${currentIndex + 1} / ${questions.length}`}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenAIQuiz}
              className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs active:scale-95"
            >
              <img src={FINN_AVATAR} alt="FINN" className="w-4 h-4 rounded-full object-cover" />
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>FINN Ra Đề Nâng Cao</span>
            </button>
            <span className="bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full text-xs font-bold">
              Đúng: {score}/{questions.length}
            </span>
          </div>
        </div>

        {/* Quiz Body */}
        {!isCompleted && currentQ && (
          <div>
            {/* Question Display Card */}
            <div className="mb-6 bg-teal-50/70 p-4 sm:p-5 rounded-2xl border border-teal-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-700 font-bold uppercase tracking-wider mb-1.5">
                  {currentQ.questionPrompt}
                </p>
                <div className="flex items-center space-x-3">
                  <h4
                    onClick={() => {
                      if (currentQ.direction === 'en-to-vi') {
                        playPronunciation(currentQ.word);
                      }
                    }}
                    className={`text-2xl sm:text-3xl font-black text-teal-950 ${
                      currentQ.direction === 'en-to-vi' ? 'cursor-pointer hover:text-teal-700' : ''
                    }`}
                    title={currentQ.direction === 'en-to-vi' ? 'Bấm để nghe phát âm' : ''}
                  >
                    {currentQ.direction === 'en-to-vi' ? currentQ.word : currentQ.meaning}
                  </h4>
                  {currentQ.direction === 'en-to-vi' && (
                    <button
                      onClick={() => playPronunciation(currentQ.word)}
                      className="w-8 h-8 rounded-full bg-teal-200/80 hover:bg-teal-300 text-teal-800 flex items-center justify-center transition shadow-2xs"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4 text-teal-800" />
                    </button>
                  )}
                </div>
                {currentQ.direction === 'en-to-vi' && (
                  <p className="text-teal-600 font-mono text-xs sm:text-sm mt-1">
                    {currentQ.pronounce} • {currentQ.type}
                  </p>
                )}
              </div>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;
                
                let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300";
                
                if (isAnswerConfirmed) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-100 border-emerald-500 text-emerald-950 font-extrabold shadow-sm";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-100 border-rose-500 text-rose-950 font-bold";
                  } else {
                    btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-teal-50 border-teal-500 text-teal-950 font-black shadow-sm ring-2 ring-teal-200";
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerConfirmed}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left p-4 rounded-2xl border-2 font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {currentQ.direction === 'vi-to-en' && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPronunciation(opt);
                        }}
                        className="p-1 text-teal-500 hover:text-teal-700 hover:scale-125 transition shrink-0"
                        title="Bấm nghe phát âm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            {isAnswerConfirmed && (
              <div
                className={`p-4 rounded-2xl mb-5 text-xs sm:text-sm font-semibold flex items-center gap-3 ${
                  selectedOption === currentQ.correctAnswer
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
                  {selectedOption === currentQ.correctAnswer ? (
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>FINN: Xuất sắc bạn ơi! Trả lời chuẩn xác (+10đ). Cùng FINN giữ vững phong độ nhé! 🔥</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-0.5">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>FINN: Chưa chính xác rồi nè! Đừng nản, nhớ từ này nhé:</span>
                      </div>
                      <span className="text-slate-800">
                        Đáp án đúng là: <b className="text-teal-900 font-extrabold text-sm">{currentQ.correctAnswer}</b>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2">
              {!isAnswerConfirmed ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={!selectedOption}
                  className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm ${
                    selectedOption
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200 cursor-pointer active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Xác nhận đáp án
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="ml-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition shadow-md shadow-teal-200 flex items-center space-x-1.5 active:scale-95"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? 'Câu hỏi tiếp theo' : 'Xem Kết Quả'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Completion Screen */}
        {isCompleted && (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
              <Award className="w-10 h-10 text-teal-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Hoàn Thành Bài Trắc Nghiệm!</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Bạn đã trả lời chính xác <span className="text-teal-700 font-extrabold text-base">{score}</span> /{' '}
              {questions.length} câu hỏi.
            </p>
            <div className="inline-block bg-teal-50 border border-teal-200 px-4 py-2 rounded-2xl text-teal-800 font-bold text-xs">
              🌟 Tỷ lệ chính xác: {Math.round((score / questions.length) * 100)}%
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={generateQuestions}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition shadow-md shadow-teal-200 flex items-center space-x-1.5 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi Lại Vòng Mới</span>
              </button>
              <button
                onClick={onOpenReport}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition shadow-md flex items-center space-x-1.5 active:scale-95"
              >
                <span>Nộp Báo Cáo Điểm</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Quiz Question Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-teal-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <img
                  src={FINN_AVATAR}
                  alt="FINN"
                  className="w-10 h-10 rounded-2xl object-cover border-2 border-teal-400 shadow-2xs"
                />
                <div>
                  <span className="text-[11px] font-black text-teal-600 uppercase">Thử Thách Nâng Cao Cùng FINN</span>
                  <h4 className="font-extrabold text-base text-slate-800">Trắc Nghiệm Ngữ Cảnh Thông Minh</h4>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            {aiLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 font-semibold">Gemini AI đang soạn thảo câu hỏi ngữ cảnh Unit 2...</p>
              </div>
            ) : aiQuizData ? (
              <div className="space-y-4">
                <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-1.5">
                  <p className="text-slate-800 font-extrabold text-sm sm:text-base leading-snug">
                    {aiQuizData.question}
                  </p>
                  <p className="text-slate-500 text-xs italic">
                    {aiQuizData.translation}
                  </p>
                </div>

                <div className="space-y-2">
                  {aiQuizData.options.map((opt, idx) => {
                    const letter = opt.trim().substring(0, 1).toUpperCase();
                    const isSelected = aiSelectedOption === letter;
                    const isCorrect = letter === aiQuizData.correctAnswer.trim().toUpperCase();

                    let optClass = "border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-800";
                    if (aiSubmitted) {
                      if (isCorrect) {
                        optClass = "border-emerald-500 bg-emerald-100 text-emerald-950 font-bold";
                      } else if (isSelected) {
                        optClass = "border-rose-500 bg-rose-100 text-rose-950 font-bold";
                      } else {
                        optClass = "border-slate-200 bg-slate-50 text-slate-400 opacity-50";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={aiSubmitted}
                        onClick={() => handleCheckAIAnswer(letter)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 font-semibold text-xs sm:text-sm transition flex items-center justify-between ${optClass}`}
                      >
                        <span>{opt}</span>
                        {aiSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {aiSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {aiSubmitted && (
                  <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 space-y-1 text-xs">
                    <span className="font-bold text-teal-900 block flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Giải thích từ AI:
                    </span>
                    <p className="text-teal-800 leading-relaxed">{aiQuizData.explanation}</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={handleOpenAIQuiz}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-4 py-2 rounded-xl text-xs transition border border-teal-200"
                  >
                    Tạo câu hỏi khác
                  </button>
                  <button
                    onClick={() => setAiModalOpen(false)}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                  >
                    Đã hoàn thành
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-500 text-center">Không thể tải câu hỏi AI. Vui lòng thử lại sau.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
