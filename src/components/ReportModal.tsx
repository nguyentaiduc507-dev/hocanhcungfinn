import React, { useState } from 'react';
import { X, Copy, Check, Award, Flame, Star, BookMarked, Sparkles } from 'lucide-react';
import { FINN_AVATAR } from '../constants/mascot';

interface ReportModalProps {
  score: number;
  streak: number;
  masteredCount: number;
  totalVocab: number;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  score,
  streak,
  masteredCount,
  totalVocab,
  onClose,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const nameDisplay = studentName.trim() || '[Chưa nhập tên]';
  const classDisplay = studentClass.trim() || '[Chưa nhập lớp]';
  const masteryPercentage = Math.round((masteredCount / totalVocab) * 100);

  const reportText = `📋 BÁO CÁO HỌC TIẾNG ANH CÙNG FINN (UNIT 2: HEALTHY LIVING)
🦊 Bạn đồng hành: FINN AI Mascot
👤 Học sinh: ${nameDisplay}
🏫 Lớp / Nhóm: ${classDisplay}
⭐ Tổng điểm tích lũy: ${score} điểm
🔥 Chuỗi đúng cao nhất: ${streak}
📚 Số từ vựng đã thuộc: ${masteredCount} / ${totalVocab} từ (${masteryPercentage}%)
🏆 Xếp loại: ${masteryPercentage >= 80 ? 'Xuất Sắc (Master)' : masteryPercentage >= 50 ? 'Khá Giỏi (Achiever)' : 'Chăm Chỉ (Learner)'}
✨ Lời khen từ FINN: "Rất tự hào về bạn! Hãy tiếp tục duy trì thói quen học tiếng Anh mỗi ngày nhé!"
📅 Thời gian báo cáo: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

  const handleCopy = () => {
    if (!studentName.trim()) {
      alert('Vui lòng nhập Họ và tên của bạn trước khi sao chép báo cáo kết quả!');
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      });
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = reportText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl border border-teal-100 space-y-4">
        {/* Header with FINN Avatar */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <img
              src={FINN_AVATAR}
              alt="FINN"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-400 shadow-xs"
            />
            <div>
              <h3 className="font-black text-base sm:text-lg text-teal-950">
                Phiếu Báo Cáo Học Tập Cùng FINN
              </h3>
              <p className="text-[11px] text-teal-600 font-extrabold flex items-center gap-1">
                <span>Unit 2: Healthy Living</span>
                <span className="text-amber-500">★ Chứng nhận</span>
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

        {/* Input Fields */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Nhập tên của bạn để FINN tạo phiếu tổng kết nộp bài gửi cho giáo viên hoặc chia sẻ vào nhóm lớp:
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên học sinh <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lớp / Nhóm học tập:
            </label>
            <input
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="Ví dụ: Lớp 10A1 hoặc Nhóm 2"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-teal-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Thành tích của bạn:</span>
            </h4>
            <span className="text-[11px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {masteryPercentage >= 80 ? 'Xuất Sắc 🏆' : masteryPercentage >= 50 ? 'Khá Giỏi ⭐' : 'Chăm Chỉ 💪'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-3 rounded-xl border border-teal-100 flex items-center space-x-2.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Tổng điểm</span>
                <span className="text-teal-950 font-black text-sm">{score} điểm</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-teal-100 flex items-center space-x-2.5">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Chuỗi streak</span>
                <span className="text-amber-600 font-black text-sm">{streak}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-teal-100 flex items-center space-x-2.5">
              <BookMarked className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Đã thuộc</span>
                <span className="text-emerald-700 font-black text-sm">
                  {masteredCount} / {totalVocab} từ
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-teal-100 flex items-center space-x-2.5">
              <Award className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Tỷ lệ thuộc</span>
                <span className="text-teal-800 font-black text-sm">{masteryPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Text Preview Box */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 whitespace-pre-line select-all">
          {reportText}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={handleCopy}
            className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md shadow-teal-200 flex items-center justify-center space-x-1.5"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Đã sao chép vào bộ nhớ tạm!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao chép kết quả gửi Zalo / Messenger</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
