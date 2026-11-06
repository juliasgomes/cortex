import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Home,
  Calendar,
  Users,
  ListTodo,
  Settings,
} from 'lucide-react';
import { AppTab } from '../../types/clinic';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useClinic();

  const tabs: { id: AppTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'patients', label: 'Prontuários', icon: Users },
    { id: 'tasks', label: 'Tarefas', icon: ListTodo },
    { id: 'settings', label: 'Outros', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] dark:bg-[#351a50] border-t border-[#452267]/15 dark:border-white/10 md:hidden px-3 py-1.5 shadow-lg safe-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#452267] dark:text-[#ded6f4] font-bold'
                  : 'text-[#8675a3] dark:text-slate-400 hover:text-[#452267]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[#FAF6F0] dark:bg-[#25103b]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#452267] dark:text-[#ded6f4]' : ''}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
