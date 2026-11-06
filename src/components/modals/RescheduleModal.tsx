import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatDateBR } from '../../utils/dateUtils';
import { X, Calendar, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface RescheduleModalProps {
  sessionId: string | null;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  sessionId,
  onClose,
}) => {
  const { sessions, rescheduleSession, checkSlotConflict } = useClinic();

  const session = sessions.find((s) => s.id === sessionId);

  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setNewDate(session.date);
      setNewTime(session.time);
    }
  }, [session]);

  useEffect(() => {
    if (session && newDate && newTime) {
      const conflict = checkSlotConflict(newDate, newTime, session.duration, session.id);
      if (conflict) {
        setConflictWarning(`Atenção: Horário conflitante com o atendimento de ${conflict.patientName} (${conflict.time}).`);
      } else {
        setConflictWarning(null);
      }
    }
  }, [newDate, newTime, session, checkSlotConflict]);

  if (!sessionId || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) return;

    rescheduleSession(session.id, newDate, newTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#ece4f6] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-[#faf8fd] border-b border-[#ece4f6] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#230d41]">
              Remarcar Atendimento Clínico
            </h3>
            <p className="text-xs text-[#705e8b]">
              Ao remarcar, a sessão retorna à receita prevista do mês correspondente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8675a3] hover:text-[#230d41] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Current appointment info */}
          <div className="p-3 bg-[#faf8fd] rounded-xl border border-[#ece4f6]">
            <span className="block text-[11px] text-[#705e8b] font-medium">Paciente</span>
            <span className="text-sm font-bold text-[#230d41]">{session.patientName}</span>
            <div className="flex items-center gap-2 text-xs text-[#523e6d] mt-1">
              <span>Agendamento anterior: {formatDateBR(session.date)} às {session.time}</span>
            </div>
          </div>

          {conflictWarning && (
            <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded-xl text-[#9f1239] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#e11d48] shrink-0 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}

          {/* New Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase mb-1">
                Nova Data (dd-mm-aaaa)
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#452267]"
                required
              />
              <span className="text-[10px] text-[#705e8b] mt-0.5 block">
                Formato: {formatDateBR(newDate)}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
                Novo Horário
              </label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-semibold text-[#230d41] focus:outline-none focus:border-[#7c3aed]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ece4f6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#705e8b] hover:text-[#230d41] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Confirmar Remarcação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
