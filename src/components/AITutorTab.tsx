import React, { useState, useRef, useEffect } from 'react';
import { User, Send, Trash2, Sparkles, Copy, Check, MessageSquareHeart } from 'lucide-react';
import { FINN_AVATAR } from '../constants/mascot';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export const AITutorTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        'Xin chào bạn! Mình là **FINN** 🦊, người bạn đồng hành AI của bạn trong chương trình **Unit 2: Healthy Living**.\n\nBạn có thể hỏi FINN bất cứ điều gì: giải nghĩa từ vựng, mẹo nhớ lâu, cách phát âm, đặt câu ví dụ thực tế hoặc đố vui tiếng Anh nhé!',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      const data = await res.json();
      const aiReply = data.reply || 'FINN đang gặp chút sự cố kết nối, bạn thử hỏi lại FINN câu khác nhé!';

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'model',
          content: aiReply,
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'model',
          content: 'FINN bị gián đoạn mạng một xíu, bạn bấm gửi lại giúp FINN nhé!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-new',
        role: 'model',
        content:
          'FINN đã dọn sạch đoạn chat rồi nè! 🦊 Giờ bạn muốn FINN giải thích từ nào trong Unit 2: Healthy Living?',
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const quickPrompts = [
    { label: '☀️ FINN so sánh Suncream vs Sunburn', prompt: 'FINN ơi, hãy so sánh và tạo ví dụ với suncream và sunburn trong Unit 2 nhé.' },
    { label: '🏃‍♂️ FINN chỉ mẹo "keep fit"', prompt: 'FINN ơi, các thói quen lành mạnh nào giúp keep fit? Cho ví dụ tiếng Anh nhé.' },
    { label: '🥗 Phân biệt Diet & Vegetarian', prompt: 'FINN giúp mình phân biệt diet, be on a diet và vegetarian với!' },
    { label: '🎮 FINN đố mình 1 câu tiếng Anh', prompt: 'FINN ơi, hãy đố mình 1 câu tiếng Anh về chủ đề Healthy Living để mình đoán nào!' },
  ];

  return (
    <div className="flex-grow flex flex-col justify-center items-center max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-teal-100 shadow-sm w-full flex flex-col h-[650px]">
        {/* Header with Mascot */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={FINN_AVATAR}
              alt="FINN"
              className="w-11 h-11 rounded-2xl object-cover border-2 border-teal-400 shadow-xs"
            />
            <div>
              <span className="text-[11px] font-black text-teal-600 uppercase tracking-wider block">
                Gia Sư AI Thông Minh
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-1.5">
                <span>Trò Chuyện Cùng FINN</span>
                <span className="text-sm">🦊</span>
              </h3>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition flex items-center space-x-1 hover:bg-slate-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Message List */}
        <div className="flex-grow overflow-y-auto space-y-3.5 pr-2 mb-3">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <img
                    src={FINN_AVATAR}
                    alt="FINN"
                    className="w-8 h-8 rounded-full object-cover border border-teal-300 shadow-2xs mt-0.5 shrink-0"
                  />
                )}

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] relative group ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-none shadow-xs font-medium'
                      : 'bg-teal-50/85 border border-teal-100 text-slate-800 rounded-tl-none whitespace-pre-line shadow-2xs'
                  }`}
                >
                  {!isUser && (
                    <span className="text-[10px] font-black text-teal-700 block mb-1">
                      FINN 🦊
                    </span>
                  )}
                  <p>{msg.content}</p>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="absolute bottom-2 right-2 p-1 rounded-md bg-white/80 hover:bg-white text-slate-500 hover:text-teal-700 transition opacity-0 group-hover:opacity-100 shadow-2xs"
                      title="Sao chép câu trả lời của FINN"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-2.5">
              <img
                src={FINN_AVATAR}
                alt="FINN"
                className="w-8 h-8 rounded-full object-cover border border-teal-300 shadow-2xs animate-pulse"
              />
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl rounded-tl-none text-teal-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
                <span>FINN đang suy nghĩ và gõ câu trả lời cho bạn nè...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="bg-slate-50 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-200 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1"
            >
              <MessageSquareHeart className="w-3 h-3 text-teal-600" />
              <span>{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Hỏi FINN bất kỳ câu hỏi nào về từ vựng Unit 2..."
            className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-xs sm:text-sm transition font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm transition shadow-md shadow-teal-200 flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>Gửi</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
