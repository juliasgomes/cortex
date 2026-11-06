import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatDateBR } from '../../utils/dateUtils';
import {
  CheckSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    sessions,
    patients,
    selectedMonth,
    setSelectedMonth,
    updateSessionStatus,
    openPatientRecord,
    settings,
  } = useClinic();

  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('all');

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

  // Month sessions
  const monthSessions = sessions.filter((s) => s.date.startsWith(selectedMonth));

  // Metrics
  const totalInMonth = monthSessions.length;
  const completedCount = monthSessions.filter((s) => s.status === 'realizado').length;
  const scheduledCount = monthSessions.filter((s) => s.status === 'agendado').length;
  const canceledCount = monthSessions.filter((s) => s.status === 'desmarcado').length;
  const totalConsidered = completedCount + canceledCount;
  const attendanceRate = totalConsidered > 0 ? Math.round((completedCount / totalConsidered) * 100) : 100;

  // Breakdown per patient
  const patientAttendance = patients.map((patient) => {
    const pSessions = monthSessions
      .filter((s) => s.patientId === patient.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    const pCompleted = pSessions.filter((s) => s.status === 'realizado').length;
    const pScheduled = pSessions.filter((s) => s.status === 'agendado').length;
    const pCanceled = pSessions.filter((s) => s.status === 'desmarcado').length;
    const pConsidered = pCompleted + pCanceled;
    const rate = pConsidered > 0 ? Math.round((pCompleted / pConsidered) * 100) : 100;

    return {
      patient,
      sessions: pSessions,
      completed: pCompleted,
      scheduled: pScheduled,
      canceled: pCanceled,
      total: pSessions.length,
      rate,
    };
  }).filter((item) => selectedPatientFilter === 'all' || item.patient.id === selectedPatientFilter);

  return (
    <div className="space-y-6">
      {/* Header and Month Controls */}
      <div className="bg-white border border-[#ece4f6] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#452267]" />
            Controle Mensal de Presenças
          </h2>
          <p className="text-xs text-[#705e8b] mt-0.5">
            Acompanhe a assiduidade dos atendimentos e altere o status de presença vinculado ao calendário.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-[#faf5ec] p-1 rounded-2xl border border-[#e8dfd2]">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1 rounded-xl text-[#665282] hover:bg-white hover:text-slate-800 transition-all"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 min-w-[130px] text-center">
              {formatMonthTitle(selectedMonth)}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1 rounded-xl text-[#665282] hover:bg-white hover:text-slate-800 transition-all"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#ece4f6] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-[#705e8b] uppercase">Total de Sessões</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-800 mt-1">
            {totalInMonth}
          </div>
          <span className="text-[10px] text-[#705e8b]">Programadas em {formatMonthTitle(selectedMonth)}</span>
        </div>

        <div className="bg-white border border-[#ece4f6] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-[#059669] uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Presenças
          </span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#047857] mt-1">
            {completedCount}
          </div>
          <span className="text-[10px] text-[#059669]">Atendimentos realizados</span>
        </div>

        <div className="bg-white border border-[#ece4f6] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-[#be123c] uppercase flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Faltas / Cancelados
          </span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#9f1239] mt-1">
            {canceledCount}
          </div>
          <span className="text-[10px] text-[#e11d48]">Desmarcados no mês</span>
        </div>

        <div className="bg-white border border-[#ece4f6] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-800 uppercase">Taxa de Presença</span>
          <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-800 mt-1">
            {attendanceRate}%
          </div>
          <span className="text-[10px] text-[#705e8b]">{scheduledCount} sessões pendentes</span>
        </div>
      </div>

      {/* Patient Attendance Cards */}
      <div className="space-y-4">
        {patientAttendance.length === 0 ? (
          <div className="bg-white border border-dashed border-[#ece4f6] rounded-3xl p-8 text-center text-xs text-[#705e8b]">
            Nenhum atendimento cadastrado para o mês de {formatMonthTitle(selectedMonth)}.
          </div>
        ) : (
          patientAttendance.map((item) => (
            <div
              key={item.patient.id}
              className="bg-white border border-[#ece4f6] rounded-3xl p-6 shadow-xs space-y-4"
            >
              {/* Header: Patient Name & Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f4edf8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#faf5ec] border border-[#e8dfd2] shrink-0 flex items-center justify-center font-bold text-slate-800">
                    {item.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3
                      onClick={() => openPatientRecord(item.patient.id)}
                      className={`font-bold text-base text-slate-800 hover:text-[#452267] cursor-pointer ${
                        settings.privacyMode ? 'privacy-blur' : ''
                      }`}
                    >
                      {item.patient.name}
                    </h3>
                    <div className="text-xs text-[#705e8b] flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{item.patient.cadence}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{item.patient.preferredModality}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#047857] font-semibold">
                    {item.completed} {item.completed === 1 ? 'presença' : 'presenças'}
                  </span>
                  <span aria-hidden="true" className="text-[#dcd3f2]">·</span>
                  <span className="text-[#be123c] font-semibold">
                    {item.canceled} {item.canceled === 1 ? 'falta' : 'faltas'}
                  </span>
                  <span aria-hidden="true" className="text-[#dcd3f2]">·</span>
                  <span className="text-[#6d28d9] font-semibold">
                    {item.scheduled} pendentes
                  </span>

                  <button
                    onClick={() => openPatientRecord(item.patient.id)}
                    className="ml-2 px-3 py-1.5 bg-[#faf5ec] hover:bg-[#f3ece0] border border-[#e8dfd2] text-slate-800 font-semibold rounded-xl transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#452267]" />
                    <span>Ver Prontuário</span>
                  </button>
                </div>
              </div>

              {/* Sessions List of this patient in this month */}
              <div className="divide-y divide-[#f7f2fb]">
                {item.sessions.length === 0 ? (
                  <p className="text-xs text-[#705e8b] py-2">
                    Sem atendimentos para este paciente no mês de {formatMonthTitle(selectedMonth)}.
                  </p>
                ) : (
                  item.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-800 min-w-[90px]">
                          {formatDateBR(session.date)}
                        </span>
                        <span className="font-mono text-[#705e8b]">{session.time}</span>
                        <span className="text-[#705e8b] capitalize">({session.modality})</span>
                      </div>

                      {/* 1-Click Status Toggles */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSessionStatus(session.id, 'realizado')}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                            session.status === 'realizado'
                              ? 'bg-[#059669] text-white shadow-xs'
                              : 'bg-white border border-[#a7f3d0] text-[#047857] hover:bg-[#ecfdf5]'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Presente</span>
                        </button>

                        <button
                          onClick={() => updateSessionStatus(session.id, 'agendado')}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                            session.status === 'agendado'
                              ? 'bg-[#452267] text-white shadow-xs'
                              : 'bg-white border border-[#ded6f4] text-slate-800 hover:bg-[#f8f5fc]'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Agendado</span>
                        </button>

                        <button
                          onClick={() => updateSessionStatus(session.id, 'desmarcado', 'Falta / Desmarcado')}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                            session.status === 'desmarcado'
                              ? 'bg-[#be123c] text-white shadow-xs'
                              : 'bg-white border border-[#fecdd3] text-[#be123c] hover:bg-[#fff1f2]'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Falta</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
