import React from 'react';
import { Copy, Brain, Puzzle, Keyboard, Bot } from 'lucide-react';

export type TabType = 'flashcard' | 'quiz' | 'matching' | 'builder' | 'ai';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'flashcard' as TabType, label: '1. Thẻ 3D & FINN', icon: Copy, desc: 'Lật thẻ & Mẹo nhớ' },
    { id: 'quiz' as TabType, label: '2. Trắc Nghiệm FINN', icon: Brain, desc: 'Phản xạ song hướng' },
    { id: 'matching' as TabType, label: '3. Ghép Cặp Nhanh', icon: Puzzle, desc: 'Nối từ tính giờ' },
    { id: 'builder' as TabType, label: '4. Thử Thách Gõ', icon: Keyboard, desc: 'Gõ chuẩn chính tả' },
    { id: 'ai' as TabType, label: '5. Gia Sư FINN AI', icon: Bot, desc: 'Trò chuyện & Hỏi đáp' },
  ];

  return (
    <nav className="max-w-6xl mx-auto w-full px-4 mt-3 sm:mt-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white/75 p-1.5 rounded-2xl border border-teal-100 shadow-xs backdrop-blur-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`py-2.5 px-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex flex-col sm:flex-row items-center justify-center space-x-1 sm:space-x-1.5 text-center ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-200 scale-[1.01]'
                  : 'text-slate-600 hover:bg-teal-50 hover:text-teal-900'
              } ${tab.id === 'ai' ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              <Icon className={`w-4 h-4 mb-0.5 sm:mb-0 ${isActive ? 'text-white' : 'text-teal-600'}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
