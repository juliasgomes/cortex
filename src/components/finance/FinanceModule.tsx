import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatDateBR } from '../../utils/dateUtils';
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from 'lucide-react';

export const FinanceModule: React.FC = () => {
  const {
    sessions,
    patients,
    financialMetrics,
    selectedMonth,
    setSelectedMonth,
    settings,
  } = useClinic();

  const isFinancialHidden = settings.privacyMode && (settings.privacyPreferences ? settings.privacyPreferences.hideFinancialValues : true);

  // Month navigation
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

  const formatMonthTitle = (monthStr: string) => {
    const [y, m] = monthStr.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    const formatted = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const [patientSearch, setPatientSearch] = useState('');
  const [cadenceFilter, setCadenceFilter] = useState<'all' | 'semanal' | 'quinzenal' | 'avulso'>('all');

  // Month's sessions
  const monthSessions = sessions.filter((s) => s.date.startsWith(selectedMonth));

  // Patient Revenue Aggregation for this month
  const patientBreakdown = patients
    .map((patient) => {
      const pMonthSessions = monthSessions.filter((s) => s.patientId === patient.id);
      const completed = pMonthSessions.filter((s) => s.status === 'realizado');
      const scheduled = pMonthSessions.filter((s) => s.status === 'agendado');
      const canceled = pMonthSessions.filter((s) => s.status === 'desmarcado');

      const confirmed = completed.reduce((acc, s) => acc + s.fee, 0);
      const projected = scheduled.reduce((acc, s) => acc + s.fee, 0);
      const lost = canceled.reduce((acc, s) => acc + s.fee, 0);

      return {
        patient,
        completedCount: completed.length,
        scheduledCount: scheduled.length,
        canceledCount: canceled.length,
        totalSessions: pMonthSessions.length,
        confirmed,
        projected,
        lost,
      };
    })
    .filter((p) => p.totalSessions > 0)
    .filter((p) => {
      const matchesSearch = p.patient.name.toLowerCase().includes(patientSearch.toLowerCase());
      const matchesCadence = cadenceFilter === 'all' || p.patient.cadence === cadenceFilter;
      return matchesSearch && matchesCadence;
    });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Horario', 'Paciente', 'Modalidade', 'Valor', 'Status'];
    const rows = monthSessions.map((s) => [
      s.date,
      s.time,
      `"${s.patientName}"`,
      s.modality,
      s.fee,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_financeiro_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const {
    confirmedRevenue,
    projectedRevenue,
    lossAmount,
    totalPotentialRevenue,
    completedCount,
    scheduledCount,
    canceledCount,
    realizationRate,
  } = financialMetrics;

  return (
    <div className="space-y-6">
      {/* Header and Month Controls */}
      <div className="bg-white border border-[#ece4f6] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#452267] tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#452267]" />
            Motor Financeiro do Consultório
          </h2>
          <p className="text-xs text-[#705e8b] mt-0.5">
            Cálculo reativo sincronizado com a agenda clínica e os honorários acordados por paciente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-[#faf5ec] p-1 rounded-2xl border border-[#e8dfd2]">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 rounded-xl text-[#665282] hover:bg-white hover:text-[#452267] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-[#452267] min-w-[130px] text-center">
              {formatMonthTitle(selectedMonth)}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 rounded-xl text-[#665282] hover:bg-white hover:text-[#452267] transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-[#faf5ec] hover:bg-[#f3ece0] text-[#452267] text-xs font-semibold rounded-xl border border-[#e8dfd2] transition-all flex items-center gap-1.5 cursor-pointer"
            title="Exportar planilha CSV do mês"
          >
            <Download className="w-3.5 h-3.5 text-[#452267]" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confirmed */}
        <div className="bg-white border border-[#ece4f6] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#047857] font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Receita Confirmada
            </span>
            <span className="text-[11px] font-mono tabular-nums bg-[#ecfdf5] px-1.5 py-0.5 rounded border border-[#a7f3d0]">
              {completedCount} realizadas
            </span>
          </div>
          <div className={`text-2xl font-extrabold font-mono tabular-nums text-[#065f46] mt-2 ${isFinancialHidden ? 'privacy-blur' : ''}`}>
            R$ {confirmedRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-[#059669] mt-1 block">
            Atendimentos já concluídos no mês
          </span>
        </div>

        {/* Projected */}
        <div className="bg-white dark:bg-[#1f1535] border border-[#ece4f6] dark:border-[#3d2b63] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#452267] dark:text-[#ded6f4] font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#452267]" />
              Receita Prevista
            </span>
            <span className="text-[11px] font-mono tabular-nums bg-[#faf5ec] dark:bg-[#251940] px-1.5 py-0.5 rounded border border-[#e8dfd2] dark:border-[#3d2b63]">
              {scheduledCount} agendadas
            </span>
          </div>
          <div className={`text-2xl font-extrabold font-mono tabular-nums text-[#452267] dark:text-white mt-2 ${isFinancialHidden ? 'privacy-blur' : ''}`}>
            R$ {projectedRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-[#705e8b] dark:text-slate-400 mt-1 block">
            Projeção até o fim de {formatMonthTitle(selectedMonth)}
          </span>
        </div>

        {/* Cancellation Losses */}
        <div className="bg-white dark:bg-[#1f1535] border border-[#ece4f6] dark:border-[#3d2b63] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#be123c] font-semibold">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Perdas por Cancelamento
            </span>
            <span className="text-[11px] font-mono tabular-nums bg-[#fff1f2] dark:bg-[#381622] px-1.5 py-0.5 rounded border border-[#fecdd3] dark:border-[#662038]">
              {canceledCount} faltas
            </span>
          </div>
          <div className={`text-2xl font-extrabold font-mono tabular-nums text-[#9f1239] dark:text-[#fb7185] mt-2 ${isFinancialHidden ? 'privacy-blur' : ''}`}>
            R$ {lossAmount.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-[#e11d48] mt-1 block">
            Subtraído da projeção do consultório
          </span>
        </div>

        {/* Total Active Potential */}
        <div className="bg-white dark:bg-[#1f1535] border border-[#ece4f6] dark:border-[#3d2b63] rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#452267] dark:text-[#ded6f4] font-semibold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#452267]" />
              Projeção Consolidada
            </span>
            <span className="text-[11px] font-mono tabular-nums bg-[#ded6f4]/50 dark:bg-[#342456] px-1.5 py-0.5 rounded border border-[#452267]">
              {realizationRate}% taxa
            </span>
          </div>
          <div className={`text-2xl font-extrabold font-mono tabular-nums text-[#452267] dark:text-white mt-2 ${isFinancialHidden ? 'privacy-blur' : ''}`}>
            R$ {totalPotentialRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-[#705e8b] dark:text-slate-400 mt-1 block">
            Confirmada + Prevista remanescente
          </span>
        </div>
      </div>

      {/* Breakdown per Patient Table (Direct Faturamento por Paciente) */}
      <div className="bg-white dark:bg-[#1f1535] border border-[#ece4f6] dark:border-[#3d2b63] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#f4edf8] dark:border-[#3d2b63]">
          <div>
            <h3 className="text-sm font-bold text-[#452267] dark:text-white">
              Faturamento por Paciente em {formatMonthTitle(selectedMonth)}
            </h3>
            <p className="text-xs text-[#705e8b] dark:text-slate-400 mt-0.5">
              Discriminado pelos valores acordados individualmente no cadastro clínico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search patient input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#452267] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Buscar paciente no faturamento..."
                className="pl-8 pr-3 py-1.5 bg-[#faf8fd] dark:bg-[#251940] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs text-[#452267] dark:text-white placeholder:text-[#452267] focus:outline-none w-56"
              />
            </div>

            {/* Cadence filter */}
            <div className="flex items-center bg-[#faf5ec] dark:bg-[#251940] p-1 rounded-xl border border-[#e8dfd2] dark:border-[#3d2b63] text-xs">
              <button
                onClick={() => setCadenceFilter('all')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  cadenceFilter === 'all' ? 'bg-white dark:bg-[#3d2b63] text-[#452267] dark:text-white shadow-2xs' : 'text-[#705e8b] dark:text-slate-400'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setCadenceFilter('semanal')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  cadenceFilter === 'semanal' ? 'bg-white dark:bg-[#3d2b63] text-[#452267] dark:text-white shadow-2xs' : 'text-[#705e8b] dark:text-slate-400'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setCadenceFilter('quinzenal')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  cadenceFilter === 'quinzenal' ? 'bg-white dark:bg-[#3d2b63] text-[#452267] dark:text-white shadow-2xs' : 'text-[#705e8b] dark:text-slate-400'
                }`}
              >
                Quinzenal
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#ece4f6] dark:border-[#3d2b63] text-[#705e8b] dark:text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Paciente</th>
                <th className="py-2.5 px-3 text-right">Valor da Sessão</th>
                <th className="py-2.5 px-3 text-center">Sessões Realizadas</th>
                <th className="py-2.5 px-3 text-center">Sessões Previstas</th>
                <th className="py-2.5 px-3 text-center">Cancelamentos</th>
                <th className="py-2.5 px-3 text-right">Faturamento Confirmado</th>
                <th className="py-2.5 px-3 text-right">Perda / Desmarcado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f0fb] dark:divide-[#2e204c]">
              {patientBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#705e8b] dark:text-slate-400">
                    Nenhum atendimento registrado no mês de {formatMonthTitle(selectedMonth)}.
                  </td>
                </tr>
              ) : (
                patientBreakdown.map((row) => (
                  <tr key={row.patient.id} className="hover:bg-[#faf8fe] dark:hover:bg-[#251940] transition-colors">
                    <td className="py-3 px-3">
                      <div className={`font-bold text-[#452267] dark:text-white ${settings.privacyMode && settings.privacyPreferences?.hidePatientNames ? 'privacy-blur' : ''}`}>
                        {row.patient.name}
                      </div>
                      <span className="text-[10px] text-[#705e8b] dark:text-slate-400 capitalize">
                        {row.patient.cadence} · {row.patient.preferredModality}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-semibold text-[#523e6d] dark:text-[#ded6f4] ${isFinancialHidden ? 'privacy-blur' : ''}`}>
                      R$ {row.patient.sessionFee.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#047857]">
                      {row.completedCount}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#452267] dark:text-slate-200">
                      {row.scheduledCount}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#be123c]">
                      {row.canceledCount}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-bold text-[#047857] ${isFinancialHidden ? 'privacy-blur' : ''}`}>
                      R$ {row.confirmed.toFixed(2).replace('.', ',')}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-bold text-[#be123c] ${isFinancialHidden ? 'privacy-blur' : ''}`}>
                      {row.lost > 0 ? `- R$ ${row.lost.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
