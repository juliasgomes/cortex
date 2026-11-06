import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Clock,
  Video,
  MapPin,
  BookOpen,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface NextAppointmentWidgetProps {
  onOpenNewSession: () => void;
  onOpenReschedule: (sessionId: string) => void;
}

export const NextAppointmentWidget: React.FC<NextAppointmentWidgetProps> = ({
  onOpenNewSession,
  onOpenReschedule,
}) => {
  const {
    nextAppointment,
    openPatientRecord,
    updateSessionStatus,
    settings,
  } = useClinic();

  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isPast, setIsPast] = useState<boolean>(false);

  useEffect(() => {
    if (!nextAppointment) return;

    const calculateCountdown = () => {
      const now = new Date();
      const [year, month, day] = nextAppointment.date.split('-').map(Number);
      const [hours, minutes] = nextAppointment.time.split(':').map(Number);
      const sessionDate = new Date(year, month - 1, day, hours, minutes);

      const diffMs = sessionDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < -nextAppointment.duration) {
        setIsPast(true);
        setTimeRemaining('Sessão encerrada');
      } else if (diffMinutes < 0) {
        setIsPast(false);
        setTimeRemaining(`Em andamento (${Math.abs(diffMinutes)}m decorridos)`);
      } else if (diffMinutes < 60) {
        setIsPast(false);
        setTimeRemaining(`Em ${diffMinutes} min`);
      } else {
        const diffHours = Math.floor(diffMinutes / 60);
        const remMin = diffMinutes % 60;
        setIsPast(false);
        setTimeRemaining(`Em ${diffHours}h ${remMin > 0 ? `${remMin}m` : ''}`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 30000);
    return () => clearInterval(interval);
  }, [nextAppointment]);

  if (!nextAppointment) {
    return (
      <div className="bg-gradient-to-br from-white to-[#fbf8fe] border border-[#ece4f6] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#f2ebfc] text-[#7c3aed] flex items-center justify-center shrink-0">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#261047]">Sem atendimentos pendentes no momento</h2>
              <p className="text-xs text-[#705e8b] mt-0.5">
                Sua agenda imediata está livre. Aproveite para atualizar prontuários ou cadastrar novos pacientes.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenNewSession}
            className="px-4 py-2.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-[#7c3aed]/20 flex items-center gap-2 whitespace-nowrap"
          >
            <span>Agendar Novo Horário</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Format date nicely (e.g., "Hoje", "Amanhã" or full date)
  const formatFriendlyDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Hoje';
    if (dateStr === tomorrow) return 'Amanhã';

    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-white via-[#fcfbfe] to-[#f9f5fd] border border-[#e8dff4] rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(109,40,217,0.06)]">
      {/* Decorative calm background accent */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#f1e8fc]/40 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left column: Badge, Patient Info & Time */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar with status border */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#d8c7f5] shadow-sm bg-[#f2ecfa] flex items-center justify-center">
              {nextAppointment.patientAvatar ? (
                <img
                  src={nextAppointment.patientAvatar}
                  alt={nextAppointment.patientName}
                  className={`w-full h-full object-cover ${settings.privacyMode ? 'privacy-blur' : ''}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xl font-bold text-[#6d28d9]">
                  {nextAppointment.patientName.charAt(0)}
                </span>
              )}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-wider ${
                isPast
                  ? 'bg-amber-600'
                  : 'bg-emerald-600'
              }`}
            >
              {nextAppointment.status}
            </div>
          </div>

          <div>
            {/* Unboxed clean metadata kicker */}
            <div className="flex items-center gap-2 text-xs text-[#705e8b] font-medium mb-1">
              <span className="text-[#6d28d9] font-bold uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#7c3aed]" />
                Próximo Atendimento
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#3b1263]">
                {formatFriendlyDate(nextAppointment.date)} às {nextAppointment.time}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#6d28d9] font-bold bg-[#f1e8fc] px-2 py-0.5 rounded-md">
                {timeRemaining}
              </span>
            </div>

            {/* Patient Name with Privacy Mode support */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#230d41] tracking-tight">
              <span className={settings.privacyMode ? 'privacy-blur' : ''}>
                {nextAppointment.patientName}
              </span>
            </h2>

            {/* Session details row: Modality, Duration */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#665282]">
              {nextAppointment.modality === 'online' ? (
                <span className="flex items-center gap-1 font-medium text-[#059669]">
                  <Video className="w-3.5 h-3.5" />
                  Teleconsulta Online
                </span>
              ) : (
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-[#452267]" />
                  {nextAppointment.room || 'Consultório Presencial'}
                </span>
              )}

              <span aria-hidden="true" className="text-[#cbbedf]">·</span>

              <span className="text-[#705e8b]">Duração: {nextAppointment.duration} min</span>
            </div>
          </div>
        </div>

        {/* Right column: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#f0e8f8]">
          {/* Direct 1-Click CTA to Notion Notebook */}
          <button
            onClick={() => openPatientRecord(nextAppointment.patientId)}
            className="px-4 py-2.5 bg-[#29104d] hover:bg-[#3d1a6e] text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-[#29104d]/20 flex items-center gap-2 whitespace-nowrap"
            title="Abrir prontuário completo e caderno de evolução estilo Notion"
          >
            <BookOpen className="w-4 h-4 text-[#d8c7f5]" />
            <span>Abrir Prontuário & Caderno</span>
          </button>

          {/* Quick 1-Click Status Toggles */}
          <div className="flex items-center gap-1.5 bg-[#f6f0fd] p-1 rounded-xl border border-[#ece1f7]">
            <button
              onClick={() => updateSessionStatus(nextAppointment.id, 'realizado')}
              className="px-3 py-1.5 text-xs font-medium text-[#047857] hover:bg-white hover:shadow-xs rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
              title="Marcar como Concluído (Entra no faturamento confirmado)"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
              <span className="hidden sm:inline">Concluir</span>
            </button>

            <button
              onClick={() => onOpenReschedule(nextAppointment.id)}
              className="px-3 py-1.5 text-xs font-medium text-[#6d28d9] hover:bg-white hover:shadow-xs rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
              title="Reagendar sessão para outro dia ou horário"
            >
              <Clock className="w-3.5 h-3.5 text-[#7c3aed]" />
              <span className="hidden sm:inline">Remarcar</span>
            </button>

            <button
              onClick={() => updateSessionStatus(nextAppointment.id, 'desmarcado', 'Desmarcado pelo paciente')}
              className="px-3 py-1.5 text-xs font-medium text-[#be123c] hover:bg-white hover:shadow-xs rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="Desmarcar (Subtrai da receita e soma em perdas por cancelamento)"
            >
              <XCircle className="w-3.5 h-3.5 text-[#e11d48]" />
              <span className="hidden sm:inline">Desmarcar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
