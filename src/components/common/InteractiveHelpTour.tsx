import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Users,
  Wallet,
  Settings as SettingsIcon,
  Home,
  ListTodo,
  Sparkles,
  FolderOpen,
} from 'lucide-react';

interface TourStep {
  id: string;
  tabId: 'home' | 'calendar' | 'patients' | 'tasks' | 'documents' | 'finance' | 'settings';
  targetTitle: string;
  title: string;
  description: string;
  tips: string[];
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-home',
    tabId: 'home',
    targetTitle: '1. Início & Visão Geral',
    title: 'Painel Inicial e Próximo Atendimento',
    description:
      'Veja o status do seu dia, atalho para o próximo paciente agendado com ações rápidas de conclusão (✓), link direto para WhatsApp e encaminhamento para a ficha clínica.',
    tips: [
      'Clique em "Avisos de Sessão" para notificações nativas antes das sessões.',
      'Lista rápida de tarefas da rotina sem sobrecarga visual.',
    ],
    icon: Home,
  },
  {
    id: 'step-calendar',
    tabId: 'calendar',
    targetTitle: '2. Agenda Clínica & Horários',
    title: 'Grade Semanal, Mensal & Bloqueio',
    description:
      'Gerencie sua semana completa. Você pode arrastar atendimentos (drag & drop) e usar "Bloquear Horário" para intervalos como almoço ou reuniões.',
    tips: [
      'Bloqueie horários com justificativa rápida.',
      'Frequência semanal replica automaticamente os atendimentos até o final do próximo ano.',
    ],
    icon: Calendar,
  },
  {
    id: 'step-patients',
    tabId: 'patients',
    targetTitle: '3. Prontuários & Cadernos',
    title: 'Fichas Clínicas e Caderno de Sessões',
    description:
      'Caderno completo com estilo Microsoft Word no computador e Goodnotes no tablet/celular com suporte a caneta stylus, gravação de notas de áudio e auto-save.',
    tips: [
      'Filtros estilo loja virtual (frequência, status, modalidade).',
      'Gere Declarações, Encaminhamentos, Atestados e Contratos em PDF com 1 clique.',
    ],
    icon: Users,
  },
  {
    id: 'step-tasks',
    tabId: 'tasks',
    targetTitle: '4. Minhas Tarefas Dedicadas',
    title: 'Gestão de Pendências e Rotina Pessoal',
    description:
      'Página exclusiva para organizar afazeres clínicos, acadêmicos, administrativos e pessoais com prazos e status.',
    tips: [
      'A criação de novas tarefas ocorre exclusivamente nesta tela dedicada.',
      'Marque concluído com 1 toque no checkbox.',
    ],
    icon: ListTodo,
  },
  {
    id: 'step-documents',
    tabId: 'documents',
    targetTitle: '5. Documentos & Modelos Oficiais',
    title: 'Modelos CFP, Atestados e Contratos',
    description:
      'Organização em pastas para gerenciar Declarações, Atestados, Encaminhamentos e Contratos com exportação em PDF formatado.',
    tips: [
      'Modelos elaborados conforme Resoluções CFP 06/2019 e 11/2018.',
      'Gere e imprima com timbre e dados do paciente instantaneamente.',
    ],
    icon: FolderOpen,
  },
  {
    id: 'step-finance',
    tabId: 'finance',
    targetTitle: '6. Motor Financeiro Reativo',
    title: 'Honorários 100% Sincronizados',
    description:
      'Calcula automaticamente o faturamento de acordo com as presenças confirmadas na agenda, com busca individual de pacientes e exportação em CSV.',
    tips: [
      'Busque pacientes específicos na tabela de faturamento.',
      'Valores de faltas/cancelamentos são deduzidos automaticamente.',
    ],
    icon: Wallet,
  },
  {
    id: 'step-settings',
    tabId: 'settings',
    targetTitle: '7. Consultório, Suporte & Sigilo',
    title: 'Personalização, Senha PIN e Suporte',
    description:
      'Configure seu CRP, foto de perfil, canais de suporte técnico, e personalize exatamente o que deseja ocultar no Modo Sigilo com proteção por PIN.',
    tips: [
      'Bloqueio automático após 5 ou 10 minutos de inatividade.',
      'Backup seguro do histórico em JSON e PDF.',
    ],
    icon: SettingsIcon,
  },
];

export const InteractiveHelpTour: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen, setActiveTab } = useClinic();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isHelpOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const Icon = currentStep.icon;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;
  const isFirst = currentStepIndex === 0;

  const handleClose = () => {
    setIsHelpOpen(false);
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setActiveTab(TOUR_STEPS[nextIndex].tabId);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setActiveTab(TOUR_STEPS[prevIndex].tabId);
    }
  };

  return (
    /*
      Tour Interativo:
      - SEM BLUR (desfoque) no fundo da tela (interface permanece visível com destaque de luz/spotlight)
      - UM ÚNICO balão explicativo ancorado sem sobreposição de cards duplicados
    */
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-end sm:justify-center p-4 sm:p-6 bg-black/25">
      {/* Anchored explanatory spotlight card */}
      <div className="pointer-events-auto relative w-full max-w-lg bg-[#FFFFFF] dark:bg-[#351a50] rounded-3xl border-2 border-[#452267] shadow-2xl overflow-hidden flex flex-col animate-fade-slide-up">
        {/* Step indicator header */}
        <div className="px-5 py-3.5 bg-[#FAF6F0] dark:bg-[#25103b] border-b border-[#452267]/10 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#452267] text-white flex items-center justify-center shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#452267] dark:text-[#ded6f4] tracking-wider block">
                Tour Guiado Cortex · {currentStepIndex + 1} de {TOUR_STEPS.length}
              </span>
              <h3 className="font-bold text-xs text-slate-800 dark:text-white">
                {currentStep.targetTitle}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-[#452267] dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Fechar guia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#452267] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#452267] dark:text-white">
                {currentStep.title}
              </h4>
              <p className="text-xs text-[#665282] dark:text-slate-300 leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/10 dark:border-white/10 rounded-2xl p-3.5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#452267] dark:text-[#ded6f4] block">
              Destaques desta seção:
            </span>
            <ul className="space-y-1">
              {currentStep.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#452267] dark:bg-[#ded6f4] shrink-0 mt-1.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {TOUR_STEPS.map((s, idx) => {
              const active = idx === currentStepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setActiveTab(s.tabId);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    active ? 'w-6 bg-[#452267]' : 'w-2 bg-[#452267]/25'
                  }`}
                  title={s.title}
                />
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FAF6F0] dark:bg-[#25103b] border-t border-[#452267]/10 dark:border-white/10 flex items-center justify-between shrink-0">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-slate-500 hover:text-[#452267] cursor-pointer"
          >
            Encerrar Tour
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className="px-3 py-1.5 text-xs font-semibold text-[#452267] dark:text-white bg-white dark:bg-[#351a50] hover:bg-[#ede5d8] disabled:opacity-30 rounded-xl transition-all border border-[#452267]/15 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-sm btn-interactive flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLast ? 'Concluir' : 'Próximo'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
