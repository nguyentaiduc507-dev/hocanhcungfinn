import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { FINN_AVATAR } from '../constants/mascot';

interface StudyGuideModalProps {
  onClose: () => void;
}

export const StudyGuideModal: React.FC<StudyGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-teal-100 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <img
              src={FINN_AVATAR}
              alt="FINN"
              className="w-11 h-11 rounded-2xl object-cover border-2 border-teal-400 shadow-xs"
            />
            <div>
              <h3 className="font-black text-base sm:text-lg text-teal-950">
                Bí Kíp Học Từ Vựng Cùng FINN
              </h3>
              <p className="text-xs text-teal-600 font-semibold">
                Chuyên đề Unit 2: Healthy Living
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

        {/* Content Cards */}
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-1">
            <h4 className="font-black text-teal-950 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
                1
              </span>
              Học Mẹo Nhớ Cùng FINN (Mnemonic Engine)
            </h4>
            <p className="text-xs text-teal-800 leading-normal pl-7">
              Mỗi khi xem Flashcard, hãy bấm nút <b>&ldquo;FINN: Gợi Nhớ Mẹo & Ví Dụ&rdquo;</b>. FINN sẽ dùng AI sáng tạo liên tưởng âm thanh tương đồng, ngữ cảnh hài hước giúp bạn thuộc từ trong 5 giây mà nhớ sâu cả tháng!
            </p>
          </div>

          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-1">
            <h4 className="font-black text-teal-950 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
                2
              </span>
              Luyện Phát Âm To Rõ Theo FINN
            </h4>
            <p className="text-xs text-teal-800 leading-normal pl-7">
              Chạm vào bất kỳ từ tiếng Anh nào để nghe FINN phát âm chuẩn bản xứ. Hãy đọc to theo FINN 2-3 lần để khẩu hình miệng quen với các âm khó như <b>/θ/</b> trong <i>health</i>, hay <b>/tʃ/</b> trong <i>chapped</i>.
            </p>
          </div>

          <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-1">
            <h4 className="font-black text-teal-950 flex items-center gap-2">
              <span className="bg-teal-600 text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
                3
              </span>
              Chinh Phục 4 Cấp Độ Thử Thách
            </h4>
            <p className="text-xs text-teal-800 leading-normal pl-7">
              Bắt đầu với <b>Thẻ 3D</b> để nhận diện mặt chữ, chuyển sang <b>Trắc nghiệm</b> để rèn phản xạ, thi <b>Ghép cặp</b> để tăng tốc độ nối nghĩa, và hoàn thiện bằng <b>Thử thách gõ</b> để không bao giờ sai chính tả!
            </p>
          </div>

          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Mỗi ngày dành 10 - 15 phút học cùng FINN sẽ giúp bạn tự tin đạt điểm 10 trọn vẹn trong bài kiểm tra trên lớp!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-md shadow-teal-200 active:scale-95"
          >
            Đã hiểu, Cùng FINN học ngay!
          </button>
        </div>
      </div>
    </div>
  );
};
