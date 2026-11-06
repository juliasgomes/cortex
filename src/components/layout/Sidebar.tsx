import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { AppTab } from '../../types/clinic';
import { CortexLogo } from '../common/CortexLogo';
import {
  Home,
  Calendar,
  Users,
  ListTodo,
  Wallet,
  Settings,
  ShieldCheck,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sessions,
    tasks,
    patients,
  } = useClinic();

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessionsCount = sessions.filter((s) => s.date === todayStr && s.status !== 'desmarcado').length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  const menuItems: {
    id: AppTab;
    label: string;
    sublabel?: string;
    icon: React.ElementType;
    badge?: number | string;
  }[] = [
    {
      id: 'home',
      label: 'Início',
      sublabel: 'Painel do Dia',
      icon: Home,
    },
    {
      id: 'calendar',
      label: 'Agenda Clínica',
      sublabel: 'Horários & Grade',
      icon: Calendar,
      badge: todaySessionsCount > 0 ? todaySessionsCount : undefined,
    },
    {
      id: 'patients',
      label: 'Prontuários & Cadernos',
      sublabel: 'Fichas de Pacientes',
      icon: Users,
      badge: patients.length > 0 ? patients.length : undefined,
    },
    {
      id: 'tasks',
      label: 'Minhas Tarefas',
      sublabel: 'Afazeres da Rotina',
      icon: ListTodo,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'documents',
      label: 'Documentos',
      sublabel: 'Modelos & Contratos',
      icon: FolderOpen,
    },
    {
      id: 'finance',
      label: 'Motor Financeiro',
      sublabel: 'Repasses & Faturamento',
      icon: Wallet,
    },
    {
      id: 'settings',
      label: 'Consultório & Ajustes',
      sublabel: 'Configurações & Sigilo',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-full flex flex-col gap-3 self-start sticky top-20 text-white select-none">
      {/* Official Centered Logo at the top of the Sidebar */}
      <div className="flex justify-center items-center pb-3 pt-1 border-b border-white/10 mb-1">
        <button
          onClick={() => setActiveTab('home')}
          className="cursor-pointer transition-transform active:scale-95 text-center flex justify-center"
          title="Início Cortex"
        >
          <CortexLogo size="md" variant="light" showWordmark={true} />
        </button>
      </div>

      {/* Navigation Items Aligned Vertically Inside the Solid Purple Column */}
      <div className="space-y-1">
        <div className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#ded6f4]/75">
          Navegação Principal
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer text-left btn-interactive ${
                isActive
                  ? 'bg-white text-[#452267] shadow-lg shadow-black/15 font-bold scale-[1.01]'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#452267]/10 text-[#452267]'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block truncate leading-tight">{item.label}</span>
                  {item.sublabel && (
                    <span
                      className={`text-[10px] block truncate leading-tight ${
                        isActive ? 'text-[#452267]/75 font-medium' : 'text-[#ded6f4]/70 font-normal'
                      }`}
                    >
                      {item.sublabel}
                    </span>
                  )}
                </div>
              </div>

              {item.badge !== undefined ? (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-[#452267] text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-[#452267] opacity-80' : 'text-white/50 opacity-40'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Security and Trust Card - Harmonized Inside the Solid Purple Column (No Jarring White Box) */}
      <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10 space-y-1.5 text-white/90 mt-2">
        <div className="flex items-center gap-2 text-white font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Proteção &amp; Sigilo Clínico</span>
        </div>
        <div className="space-y-1 text-[11px] text-[#ded6f4] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>Criptografia 256-bit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>Conforme CFP e LGPD</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
