import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export const FinancialMotorCard: React.FC = () => {
  const { financialMetrics, selectedMonth, setSelectedMonth } = useClinic();
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'projected' | 'loss'>('all');

  // Month navigation helper
  const navigateMonth = (direction: -1 | 1) => {
    const [yStr, mStr] = selectedMonth.split('-');
    let year = parseInt(yStr, 10);
    let month = parseInt(mStr, 10) + direction;

    if (month > 12) {
      month = 1;
      year += 1;
    } else if (month < 1) {
      month = 12;
      year -= 1;
    }

    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  // Format month name in Portuguese
  const formatMonthTitle = (monthStr: string) => {
    const [y, m] = monthStr.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    const formatted = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const {
    confirmedRevenue,
    projectedRevenue,
    lossAmount,
    totalPotentialRevenue,
    completedCount,
    scheduledCount,
    canceledCount,
    totalSessions,
    realizationRate,
  } = financialMetrics;

  const totalConsideredRevenue = confirmedRevenue + projectedRevenue + lossAmount;
  const confirmedPct = totalConsideredRevenue > 0 ? (confirmedRevenue / totalConsideredRevenue) * 100 : 0;
  const projectedPct = totalConsideredRevenue > 0 ? (projectedRevenue / totalConsideredRevenue) * 100 : 0;
  const lossPct = totalConsideredRevenue > 0 ? (lossAmount / totalConsideredRevenue) * 100 : 0;

  return (
    <div className="bg-white border border-[#ece4f6] rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(109,40,217,0.05)]">
      {/* Header with Title and Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f3edf8]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#230d41] tracking-tight">
              Motor Financeiro Clínico
            </h3>
            <span className="text-[11px] font-semibold text-[#6d28d9] bg-[#f1e8fc] px-2 py-0.5 rounded-md">
              Reativo em Tempo Real
            </span>
          </div>
          <p className="text-xs text-[#705e8b] mt-0.5">
            Sincronizado automaticamente aos status da agenda e valores acordados por paciente.
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#f8f5fc] p-1 rounded-xl border border-[#ece4f6]">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded-lg text-[#6b5887] hover:bg-white hover:text-[#230d41] hover:shadow-xs transition-all"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-bold text-[#2d1250] min-w-[120px] text-center">
            {formatMonthTitle(selectedMonth)}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 rounded-lg text-[#6b5887] hover:bg-white hover:text-[#230d41] hover:shadow-xs transition-all"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {/* 1. Receita Confirmada */}
        <div
          onClick={() => setActiveTab('confirmed')}
          className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
            activeTab === 'confirmed'
              ? 'bg-[#ecfdf5] border-[#a7f3d0] ring-2 ring-[#059669]/20'
              : 'bg-[#faf8fd] border-[#eee8f6] hover:border-[#a7f3d0] hover:bg-[#f6fcf8]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#047857] font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Receita Confirmada
            </span>
            <span className="text-[11px] font-mono tabular-nums bg-white px-1.5 py-0.5 rounded border border-[#a7f3d0]">
              {completedCount} {completedCount === 1 ? 'sessão' : 'sessões'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#065f46] font-mono tabular-nums mt-1">
            R$ {confirmedRevenue.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-[#059669] mt-1">
            Sessões já realizadas e computadas
          </p>
        </div>

        {/* 2. Receita Prevista */}
        <div
          onClick={() => setActiveTab('projected')}
          className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
            activeTab === 'projected'
              ? 'bg-[#f5f3ff] border-[#ddd6fe] ring-2 ring-[#7c3aed]/20'
              : 'bg-[#faf8fd] border-[#eee8f6] hover:border-[#ddd6fe] hover:bg-[#f9f7ff]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#6d28d9] font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Receita Prevista
            </span>
            <span className="text-[11px] font-mono tabular-nums bg-white px-1.5 py-0.5 rounded border border-[#ddd6fe]">
              {scheduledCount} {scheduledCount === 1 ? 'pendente' : 'pendentes'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#5b21b6] font-mono tabular-nums mt-1">
            R$ {projectedRevenue.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-[#7c3aed] mt-1">
            Sessões agendadas até o fim do mês
          </p>
        </div>

        {/* 3. Perdas por Cancelamento */}
        <div
          onClick={() => setActiveTab('loss')}
          className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
            activeTab === 'loss'
              ? 'bg-[#fff1f2] border-[#fecdd3] ring-2 ring-[#e11d48]/20'
              : 'bg-[#faf8fd] border-[#eee8f6] hover:border-[#fecdd3] hover:bg-[#fff7f8]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#be123c] font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Perdas por Cancelamento
            </span>
            <span className="text-[11px] font-mono tabular-nums bg-white px-1.5 py-0.5 rounded border border-[#fecdd3]">
              {canceledCount} {canceledCount === 1 ? 'falta' : 'faltas'}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#9f1239] font-mono tabular-nums mt-1">
            R$ {lossAmount.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-[#e11d48] mt-1">
            Subtraído da projeção em tempo real
          </p>
        </div>

        {/* 4. Projeção Total Ativa */}
        <div
          onClick={() => setActiveTab('all')}
          className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
            activeTab === 'all'
              ? 'bg-[#f4effc] border-[#c4b5fd] ring-2 ring-[#6d28d9]/20'
              : 'bg-[#faf8fd] border-[#eee8f6] hover:border-[#c4b5fd]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#4c1d95] font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Projeção Ativa do Mês
            </span>
            <span className="text-[11px] font-mono tabular-nums bg-white px-1.5 py-0.5 rounded border border-[#c4b5fd]">
              {realizationRate}% realizada
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#2e1065] font-mono tabular-nums mt-1">
            R$ {totalPotentialRevenue.toFixed(2).replace('.', ',')}
          </div>
          <p className="text-[11px] text-[#6d28d9] mt-1">
            Confirmada + Prevista remanescente
          </p>
        </div>
      </div>

      {/* Visual Composition Progress Bar */}
      <div className="mt-5 pt-4 border-t border-[#f4edf8]">
        <div className="flex items-center justify-between text-xs text-[#705e8b] font-medium mb-2">
          <span>Distribuição Financeira do Mês ({totalSessions} sessões cadastradas)</span>
          <span className="text-xs text-[#523e6d]">
            Taxa de comparecimento:{' '}
            <strong className="font-mono tabular-nums text-[#047857]">{realizationRate}%</strong>
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 bg-[#ede7f6] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${confirmedPct}%` }}
            className="h-full bg-[#10b981] transition-all duration-300"
            title={`Confirmada: ${confirmedPct.toFixed(1)}%`}
          />
          <div
            style={{ width: `${projectedPct}%` }}
            className="h-full bg-[#8b5cf6] transition-all duration-300"
            title={`Prevista: ${projectedPct.toFixed(1)}%`}
          />
          <div
            style={{ width: `${lossPct}%` }}
            className="h-full bg-[#f43f5e] transition-all duration-300"
            title={`Cancelada/Perda: ${lossPct.toFixed(1)}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-[#523e6d]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
            <span>Confirmado ({completedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
            <span>Previsto ({scheduledCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
            <span>Desmarcado ({canceledCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
