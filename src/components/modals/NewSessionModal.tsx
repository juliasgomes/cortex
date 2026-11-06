import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ModalityType, SessionEvent } from '../../types/clinic';
import { formatDateBR } from '../../utils/dateUtils';
import { X, Calendar, Clock, DollarSign, Video, MapPin, AlertTriangle, Plus } from 'lucide-react';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
  initialPatientId?: string;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialTime,
  initialPatientId,
}) => {
  const { patients, addSession, checkSlotConflict, settings } = useClinic();

  const [patientId, setPatientId] = useState<string>(initialPatientId || (patients[0]?.id || ''));
  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(initialTime || '14:00');
  const [duration, setDuration] = useState<number>(settings.defaultSessionDuration || 50);
  const [fee, setFee] = useState<number>(240);
  const [modality, setModality] = useState<ModalityType>('presencial');
  const [room, setRoom] = useState<string>('Consultório Principal');
  const [meetLink, setMeetLink] = useState<string>('https://meet.google.com/psi-sala-online');
  const [notes, setNotes] = useState<string>('');
  const [conflict, setConflict] = useState<SessionEvent | null>(null);

  // Sync fee and modality when patient changes
  useEffect(() => {
    const selected = patients.find((p) => p.id === patientId);
    if (selected) {
      setFee(selected.sessionFee);
      setModality(selected.preferredModality);
    }
  }, [patientId, patients]);

  // Check collision reactively
  useEffect(() => {
    if (date && time) {
      const foundConflict = checkSlotConflict(date, time, duration);
      setConflict(foundConflict);
    }
  }, [date, time, duration, checkSlotConflict]);

  const [formError, setFormError] = useState<string | null>(null);

  // Reset initial values on open
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (initialDate) setDate(initialDate);
      if (initialTime) setTime(initialTime);
      if (initialPatientId) setPatientId(initialPatientId);
    }
  }, [isOpen, initialDate, initialTime, initialPatientId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPatient = patients.find((p) => p.id === patientId);
    if (!selectedPatient) {
      setFormError('Selecione um paciente para o atendimento.');
      return;
    }

    addSession({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientAvatar: selectedPatient.avatar,
      date,
      time,
      duration,
      fee: Number(fee),
      status: 'agendado',
      modality,
      room: modality === 'presencial' ? room : undefined,
      meetLink: modality === 'online' ? meetLink : undefined,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#ece4f6] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#faf8fd] border-b border-[#ece4f6] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#230d41]">
              Agendar Novo Atendimento Clínico
            </h3>
            <p className="text-xs text-[#705e8b]">
              O valor da sessão é preenchido automaticamente com base no acordo do paciente.
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
          {/* Conflict Alert Banner */}
          {conflict && (
            <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded-xl text-[#9f1239] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#e11d48] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Bloqueio / Conflito de Horário Detectado:</strong>
                <span>
                  O paciente <strong>{conflict.patientName}</strong> já possui sessão agendada neste horário ({conflict.time} - {conflict.duration} min).
                </span>
              </div>
            </div>
          )}

          {/* Patient Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
              Paciente
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-semibold text-[#230d41] focus:outline-none focus:border-[#7c3aed]"
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Acordo: R$ {p.sessionFee},00 · {p.preferredModality})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
                Data do Atendimento
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#452267]"
                required
              />
              <span className="text-[10px] text-[#705e8b] mt-0.5 block">
                Formato: {formatDateBR(date)}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
                Horário (Início)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-medium text-[#230d41] focus:outline-none focus:border-[#7c3aed]"
                required
              />
            </div>
          </div>

          {/* Fee & Duration Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
                Honorário da Sessão (R$)
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-mono font-bold text-[#047857] focus:outline-none focus:border-[#7c3aed]"
                min={0}
                step={10}
                required
              />
              <span className="text-[10px] text-[#705e8b] mt-0.5 block">
                Entra na projeção de receita estimada do mês.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
                Duração (Minutos)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-medium text-[#230d41] focus:outline-none focus:border-[#7c3aed]"
              >
                <option value={45}>45 minutos</option>
                <option value={50}>50 minutos (Padrão)</option>
                <option value={60}>60 minutos (1 hora)</option>
                <option value={80}>80 minutos (Casal / Família)</option>
              </select>
            </div>
          </div>

          {/* Modality Segmented */}
          <div>
            <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
              Modalidade
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModality('presencial')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  modality === 'presencial'
                    ? 'bg-[#f4effc] border-[#7c3aed] text-[#4c1d95] shadow-2xs'
                    : 'bg-[#faf8fd] border-[#ece4f6] text-[#705e8b]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Presencial</span>
              </button>

              <button
                type="button"
                onClick={() => setModality('online')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  modality === 'online'
                    ? 'bg-[#ecfdf5] border-[#10b981] text-[#065f46] shadow-2xs'
                    : 'bg-[#faf8fd] border-[#ece4f6] text-[#705e8b]'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Teleconsulta Online</span>
              </button>
            </div>
          </div>

          {/* Room or Link */}
          {modality === 'presencial' ? (
            <div>
              <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
                Sala / Consultório
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ex: Consultório 2 - Jardim"
                className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs text-[#230d41] focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
                Link de Videochamada (Google Meet)
              </label>
              <input
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs text-[#230d41] focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-[#29104d] uppercase mb-1">
              Observações Pré-Sessão (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pauta da sessão, retorno de tarefas ou combinados anteriores..."
              className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs text-[#230d41] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>

          {/* Modal Footer */}
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
              className="px-5 py-2.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-[#7c3aed]/25 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Confirmar Agendamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
