import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SessionStatus } from '../../types/clinic';
import { formatDateBR } from '../../utils/dateUtils';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Video,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
} from 'lucide-react';

interface DailyTimelineProps {
  onOpenNewSessionWithTime: (date: string, time: string) => void;
  onOpenReschedule: (sessionId: string) => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  onOpenNewSessionWithTime,
  onOpenReschedule,
}) => {
  const {
    sessions,
    updateSessionStatus,
    openPatientRecord,
    settings,
  } = useClinic();

  const [currentDate, setCurrentDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const navigateDay = (offsetDays: number) => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offsetDays);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const daySessions = sessions
    .filter((s) => s.date === currentDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Date Header info
  const dateObj = new Date(currentDate + 'T12:00:00');
  const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  const formattedBR = formatDateBR(currentDate);

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case 'realizado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-[#059669]" />
            Concluído
          </span>
        );
      case 'agendado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-[#faf5ec] border border-[#e8dfd2] px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-[#452267]" />
            Confirmado
          </span>
        );
      case 'desmarcado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#be123c] bg-[#fff1f2] border border-[#fecdd3] px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3 text-[#e11d48]" />
            Cancelado
          </span>
        );
      case 'remarcado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b45309] bg-[#fffbeb] border border-[#fde68a] px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-[#d97706]" />
            Remarcado
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-[#ece4f6] rounded-3xl p-6 shadow-xs">
      {/* Header and Day Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f3edf8]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              Linha do Tempo Diária
            </h3>
            <span className="text-[11px] font-semibold text-[#665282] bg-[#faf5ec] border border-[#e8dfd2] px-2 py-0.5 rounded-lg">
              {daySessions.length} {daySessions.length === 1 ? 'atendimento' : 'atendimentos'}
            </span>
          </div>
          <p className="text-xs text-[#705e8b] mt-0.5 capitalize">
            {weekday} · {formattedBR}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={setToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-[#faf5ec] hover:bg-[#f3ece0] border border-[#e8dfd2] rounded-xl transition-all"
          >
            Hoje
          </button>
          <div className="flex items-center bg-[#faf5ec] p-1 rounded-2xl border border-[#e8dfd2]">
            <button
              onClick={() => navigateDay(-1)}
              className="p-1 rounded-xl text-[#665282] hover:bg-white hover:text-slate-800 transition-all"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
              className="px-2 py-0.5 text-xs font-bold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer"
            />
            <button
              onClick={() => navigateDay(1)}
              className="p-1 rounded-xl text-[#665282] hover:bg-white hover:text-slate-800 transition-all"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Timeline List without money figures or lunch banner */}
      <div className="space-y-3 mt-4">
        {daySessions.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-[#e6dcf3] rounded-3xl bg-[#fdfcff]">
            <Calendar className="w-8 h-8 text-[#b5a3d4] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Nenhum atendimento agendado para este dia</h4>
            <p className="text-xs text-[#786694] max-w-sm mx-auto mt-1 mb-4">
              Clique abaixo para agendar um atendimento nesta data.
            </p>
            <button
              onClick={() => onOpenNewSessionWithTime(currentDate, '10:00')}
              className="px-4 py-2 bg-[#452267] hover:opacity-90 text-white text-xs font-semibold rounded-2xl transition-all shadow-xs flex items-center gap-1.5 mx-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#ded6f4]" />
              <span>Agendar Atendimento</span>
            </button>
          </div>
        ) : (
          daySessions.map((session) => {
            const isCompleted = session.status === 'realizado';
            const isCanceled = session.status === 'desmarcado';

            return (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-[#fcfdfd] border-[#d1fae5]/80'
                    : isCanceled
                    ? 'bg-[#fffcfc] border-[#fee2e2]/80 opacity-75'
                    : 'bg-[#faf8fd] border-[#eee8f7] hover:border-[#ded6f4]'
                }`}
              >
                {/* Left: Time & Patient */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="text-center min-w-[60px] p-2 bg-white rounded-xl border border-[#ece4f6] shadow-2xs">
                    <span className="block text-sm font-extrabold font-mono tabular-nums text-slate-800">
                      {session.time}
                    </span>
                    <span className="block text-[10px] text-[#705e8b]">
                      {session.duration} min
                    </span>
                  </div>

                  {/* Avatar & Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#faf5ec] border border-[#e8dfd2] shrink-0 flex items-center justify-center font-bold text-slate-800">
                      {session.patientAvatar ? (
                        <img
                          src={session.patientAvatar}
                          alt={session.patientName}
                          className={`w-full h-full object-cover ${settings.privacyMode ? 'privacy-blur' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{session.patientName.charAt(0)}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => openPatientRecord(session.patientId)}
                          className={`text-sm font-bold text-slate-800 hover:text-[#452267] cursor-pointer transition-colors ${
                            settings.privacyMode ? 'privacy-blur' : ''
                          }`}
                        >
                          {session.patientName}
                        </h4>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#705e8b]">
                        {session.modality === 'online' ? (
                          <span className="flex items-center gap-1 text-[#059669]">
                            <Video className="w-3 h-3" />
                            Teleconsulta
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-800">
                            <MapPin className="w-3 h-3 text-[#452267]" />
                            {session.room || 'Presencial'}
                          </span>
                        )}

                        {isCanceled && session.cancellationReason && (
                          <>
                            <span aria-hidden="true" className="text-[#ded6f4]">·</span>
                            <span className="text-[#be123c] italic text-[11px]">
                              {session.cancellationReason}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: 1-Click Status buttons */}
                <div className="flex items-center flex-wrap gap-1.5 self-end md:self-center shrink-0">
                  <button
                    onClick={() => openPatientRecord(session.patientId)}
                    className="p-2 text-slate-800 hover:bg-[#faf5ec] rounded-xl transition-all text-xs font-semibold flex items-center gap-1"
                    title="Abrir caderno de anotações"
                  >
                    <BookOpen className="w-4 h-4 text-[#452267]" />
                    <span className="hidden sm:inline">Caderno</span>
                  </button>

                  <div className="h-4 w-[1px] bg-[#ece4f6] mx-1 hidden sm:block" />

                  <button
                    onClick={() => updateSessionStatus(session.id, 'realizado')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                      session.status === 'realizado'
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'bg-white border border-[#a7f3d0] text-[#047857] hover:bg-[#ecfdf5]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concluído</span>
                  </button>

                  <button
                    onClick={() => updateSessionStatus(session.id, 'agendado')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                      session.status === 'agendado'
                        ? 'bg-[#452267] text-white shadow-xs'
                        : 'bg-white border border-[#ded6f4] text-slate-800 hover:bg-[#faf8fd]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Confirmado</span>
                  </button>

                  <button
                    onClick={() => onOpenReschedule(session.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#ece4f6] text-slate-800 hover:bg-[#faf5ec] rounded-xl transition-all"
                  >
                    Remarcar
                  </button>

                  <button
                    onClick={() => updateSessionStatus(session.id, 'desmarcado', 'Desmarcado')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                      session.status === 'desmarcado'
                        ? 'bg-[#be123c] text-white shadow-xs'
                        : 'bg-white border border-[#fecdd3] text-[#be123c] hover:bg-[#fff1f2]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Desmarcar</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
