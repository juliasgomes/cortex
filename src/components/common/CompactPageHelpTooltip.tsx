import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { HelpCircle, X, Check, Lightbulb } from 'lucide-react';

interface ScreenExplanation {
  title: string;
  tips: string[];
}

const SCREEN_EXPLANATIONS: Record<string, ScreenExplanation> = {
  home: {
    title: 'Visão Geral & Próximos Atendimentos',
    tips: [
      'Veja seu próximo atendimento com contagem de horário e acesso direto ao caderno.',
      'Acompanhe a agenda de hoje ao lado e marque presenças com 1 clique.',
      'Gerencie suas tarefas e pendências gerais no checklist profissional.',
    ],
  },
  calendar: {
    title: 'Agenda Clínica Semanal & Mensal',
    tips: [
      'Arraste e solte (drag & drop) atendimentos para alterar dia ou horário.',
      'Clique em qualquer sessão para abrir detalhes, ver o paciente ou excluir.',
      'No celular, use os botões de dia da semana no topo para ver os horários sem cortes.',
    ],
  },
  patients: {
    title: 'Prontuários, Cadernos & Documentos',
    tips: [
      'Abra a ficha do paciente para acessar sessões, histórico de saúde e documentos.',
      'No caderno de anotações, use a caneta digital (stylus no celular), ditado por voz e IA para ortografia.',
      'As notas ficam em blocos compactos para preservar o sigilo das informações.',
    ],
  },
  finance: {
    title: 'Motor Financeiro do Consultório',
    tips: [
      'Valores calculados em tempo real de acordo com o status marcado na agenda.',
      'Sessões concluídas somam em faturamento recebido; cancelamentos subtraem.',
      'A tabela discrimina o faturamento e previsões individuais de cada paciente.',
    ],
  },
  settings: {
    title: 'Consultório, Horários & Backup',
    tips: [
      'Altere seus horários de trabalho para ajustar as linhas da agenda semanal.',
      'Altere seu PIN de 4 dígitos para o Modo Sigilo (Ocultar dados sensíveis).',
      'Exporte backup em arquivo JSON ou conecte sua conta Google.',
    ],
  },
};

export const CompactPageHelpTooltip: React.FC = () => {
  const { isHelpOpen, setIsHelpOpen, activeTab } = useClinic();

  if (!isHelpOpen) return null;

  const currentInfo = SCREEN_EXPLANATIONS[activeTab] || SCREEN_EXPLANATIONS.home;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-white rounded-2xl border border-[#ded6f4] shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#f0e8f8]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#faf5ec] border border-[#e8dfd2] flex items-center justify-center text-slate-800">
            <Lightbulb className="w-4 h-4 text-[#452267]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#452267] block">
              Dica desta tela
            </span>
            <h4 className="font-bold text-xs text-slate-800">
              {currentInfo.title}
            </h4>
          </div>
        </div>

        <button
          onClick={() => setIsHelpOpen(false)}
          className="p-1 text-[#8675a3] hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Fechar explicação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <ul className="py-3 space-y-2">
        {currentInfo.tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-[#523e6d] leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-[#452267] shrink-0 mt-1.5" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      <div className="pt-2 border-t border-[#f0e8f8] flex justify-end">
        <button
          onClick={() => setIsHelpOpen(false)}
          className="px-3 py-1 bg-[#452267] hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 text-[#ded6f4]" />
          <span>Entendi</span>
        </button>
      </div>
    </div>
  );
};
