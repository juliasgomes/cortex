import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SessionEvent, SessionStatus, ModalityType } from '../../types/clinic';
import { formatDateBR } from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  BookOpen,
  Trash2,
  X,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';

interface CalendarViewProps {
  onOpenNewSessionWithTime: (date: string, time: string) => void;
  onOpenReschedule: (sessionId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenNewSessionWithTime,
}) => {
  const {
    sessions,
    settings,
    updateSessionStatus,
    updateSessionDetails,
    deleteSession,
    openPatientRecord,
    blockedSlots,
    addBlockedSlot,
    deleteBlockedSlot,
  } = useClinic();

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');

  // Selected session for Google Calendar-style popup card
  const [activeSessionCard, setActiveSessionCard] = useState<SessionEvent | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Blocked slots modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockDate, setBlockDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [blockTimeStart, setBlockTimeStart] = useState<string>('12:00');
  const [blockTimeEnd, setBlockTimeEnd] = useState<string>('13:00');
  const [blockReason, setBlockReason] = useState<string>('Intervalo de Almoço');

  // Mobile selected day index (0 = Monday, 5 = Saturday)
  const [mobileSelectedDayIndex, setMobileSelectedDayIndex] = useState<number>(() => {
    const today = new Date().getDay();
    // In JS: 0 = Sun, 1 = Mon ... 6 = Sat
    if (today === 0) return 0;
    return Math.min(today - 1, 5);
  });

  // Drag & drop state
  const [draggedSessionId, setDraggedSessionId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const toDateStr = (d: Date) => d.toISOString().split('T')[0];

  // Week calculation (Monday - Saturday)
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    const days: Date[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const navigate = (direction: -1 | 1) => {
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setMonth(next.getMonth() + direction);
    }
    setCurrentDate(next);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    const today = new Date().getDay();
    setMobileSelectedDayIndex(today === 0 ? 0 : Math.min(today - 1, 5));
  };

  // Generate hourly slots based on psychologist configured working hours in Settings
  const timeSlots = useMemo(() => {
    const [startH] = (settings.workStart || '08:00').split(':').map(Number);
    const [endH] = (settings.workEnd || '19:00').split(':').map(Number);
    const slots: string[] = [];
    for (let h = startH; h < endH; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    return slots;
  }, [settings.workStart, settings.workEnd]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (statusFilter === 'all') return sessions;
    return sessions.filter((s) => s.status === statusFilter);
  }, [sessions, statusFilter]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, sessionId: string) => {
    e.dataTransfer.setData('text/plain', sessionId);
    setDraggedSessionId(sessionId);
  };

  const handleDragEnd = () => {
    setDraggedSessionId(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, slotKey: string) => {
    e.preventDefault();
    setDragOverSlot(slotKey);
  };

  const handleDrop = (e: React.DragEvent, targetDate: string, targetTime: string) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData('text/plain') || draggedSessionId;
    if (!sessionId) return;

    updateSessionDetails(sessionId, {
      date: targetDate,
      time: targetTime,
    });

    setDraggedSessionId(null);
    setDragOverSlot(null);
  };

  // Card Popup Save
  const handleSaveActiveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionCard) return;

    updateSessionDetails(activeSessionCard.id, {
      date: activeSessionCard.date,
      time: activeSessionCard.time,
      status: activeSessionCard.status,
      modality: activeSessionCard.modality,
      notes: activeSessionCard.notes,
    });

    setActiveSessionCard(null);
    setIsConfirmingDelete(false);
  };

  // Delete card handler without window.confirm!
  const handleDeleteActiveCardConfirmed = () => {
    if (!activeSessionCard) return;
    deleteSession(activeSessionCard.id);
    setActiveSessionCard(null);
    setIsConfirmingDelete(false);
  };

  // Month Grid Calculation
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      cells.push({ dateStr: toDateStr(prevDate), dayNumber: d, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      cells.push({ dateStr: toDateStr(curDate), dayNumber: d, isCurrentMonth: true });
    }

    const totalCells = Math.ceil(cells.length / 7) * 7;
    let nextDay = 1;
    while (cells.length < totalCells) {
      const nextDate = new Date(year, month + 1, nextDay);
      cells.push({ dateStr: toDateStr(nextDate), dayNumber: nextDay, isCurrentMonth: false });
      nextDay++;
    }

    return cells;
  }, [currentDate]);

  // Mobile selected day object
  const mobileSelectedDay = weekDays[mobileSelectedDayIndex] || weekDays[0];
  const mobileSelectedDateStr = toDateStr(mobileSelectedDay);
  const mobileDaySessions = filteredSessions
    .filter((s) => s.date === mobileSelectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="bg-white border border-[#ece4f6] rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#faf5ec] text-[#452267] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#452267] tracking-tight">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
            </h2>
            <p className="text-xs text-[#705e8b]">
              Expediente: {settings.workStart} às {settings.workEnd}
            </p>
          </div>
        </div>

        {/* View mode & Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center bg-[#faf5ec] p-1 rounded-2xl border border-[#e8dfd2] text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-[#452267] shadow-2xs' : 'text-[#705e8b]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('agendado')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === 'agendado' ? 'bg-white text-[#452267] shadow-2xs' : 'text-[#705e8b]'
              }`}
            >
              Agendados
            </button>
            <button
              onClick={() => setStatusFilter('realizado')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === 'realizado' ? 'bg-white text-[#047857] shadow-2xs' : 'text-[#705e8b]'
              }`}
            >
              Realizados
            </button>
            <button
              onClick={() => setStatusFilter('desmarcado')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                statusFilter === 'desmarcado' ? 'bg-white text-[#be123c] shadow-2xs' : 'text-[#705e8b]'
              }`}
            >
              Cancelados
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#faf5ec] p-1 rounded-2xl border border-[#e8dfd2] text-xs">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-[#452267] text-white shadow-xs' : 'text-[#705e8b]'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-[#452267] text-white shadow-xs' : 'text-[#705e8b]'
              }`}
            >
              Mensal
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold text-[#452267] bg-[#faf5ec] hover:bg-[#f3ece0] border border-[#e8dfd2] rounded-xl transition-all cursor-pointer"
          >
            Hoje
          </button>

          <button
            onClick={() => setIsBlockModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-[#452267] dark:text-[#ded6f4] bg-[#f5effc] dark:bg-[#322055] hover:bg-[#ede3f8] border border-[#ded6f4] dark:border-[#4d377d] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Bloquear horário (ex: almoço, supervisão)"
          >
            <Lock className="w-3.5 h-3.5 text-[#452267]" />
            <span className="hidden sm:inline">Bloquear Horário</span>
          </button>

          <div className="flex items-center bg-[#faf5ec] p-1 rounded-2xl border border-[#e8dfd2]">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-xl text-[#665282] hover:bg-white hover:text-[#452267] transition-all cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="p-1 rounded-xl text-[#665282] hover:bg-white hover:text-[#452267] transition-all cursor-pointer"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE ADAPTIVE VIEW (Telas menores < md) */}
      <div className="md:hidden space-y-4">
        {/* Mobile Weekday Selector Tabs */}
        <div className="grid grid-cols-6 gap-1 bg-white p-1.5 rounded-2xl border border-[#ece4f6]">
          {weekDays.map((d, index) => {
            const isSelected = index === mobileSelectedDayIndex;
            const dStr = toDateStr(d);
            const isToday = dStr === toDateStr(new Date());
            const dayName = d.toLocaleDateString('pt-BR', { weekday: 'narrow' });
            const dayNum = d.getDate();

            return (
              <button
                key={dStr}
                onClick={() => setMobileSelectedDayIndex(index)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#452267] text-white shadow-xs'
                    : isToday
                    ? 'bg-[#faf5ec] text-[#452267] font-bold border border-[#e8dfd2]'
                    : 'text-[#705e8b] hover:bg-[#faf8fd]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold">{dayName}</span>
                <span className="text-xs font-mono font-extrabold mt-0.5">{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Header */}
        <div className="bg-white border border-[#ece4f6] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#452267] block">
              {mobileSelectedDay.toLocaleDateString('pt-BR', { weekday: 'long' })}
            </span>
            <h3 className="font-extrabold text-base text-[#452267]">
              {formatDateBR(mobileSelectedDateStr)}
            </h3>
          </div>

          <button
            onClick={() => onOpenNewSessionWithTime(mobileSelectedDateStr, '09:00')}
            className="px-3 py-1.5 bg-[#452267] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#ded6f4]" />
            <span>Agendar</span>
          </button>
        </div>

        {/* Mobile Day Sessions List */}
        <div className="space-y-3">
          {mobileDaySessions.length === 0 ? (
            <div className="bg-white border border-dashed border-[#ece4f6] rounded-2xl p-8 text-center text-xs text-[#705e8b]">
              <Clock className="w-6 h-6 text-[#ded6f4] mx-auto mb-2" />
              Nenhum atendimento para este dia.
            </div>
          ) : (
            mobileDaySessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionCard(session);
                  setIsConfirmingDelete(false);
                }}
                className={`bg-white border rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer transition-all ${
                  session.status === 'realizado'
                    ? 'border-[#a7f3d0] bg-[#fafdfb]'
                    : session.status === 'desmarcado'
                    ? 'border-[#fecdd3] bg-[#fffbfb] opacity-80'
                    : 'border-[#ded6f4] hover:border-[#452267]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#452267] bg-[#faf5ec] px-2 py-0.5 rounded-lg border border-[#e8dfd2]">
                    {session.time}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      session.status === 'realizado'
                        ? 'bg-[#ecfdf5] text-[#047857]'
                        : session.status === 'desmarcado'
                        ? 'bg-[#fff1f2] text-[#be123c]'
                        : 'bg-[#faf5ec] text-[#452267]'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-[#452267]">
                    {session.patientName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#705e8b] mt-1">
                    <span className="capitalize">{session.modality}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#047857] font-mono font-semibold">
                      R$ {session.fee.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f7f2fb] text-[11px] text-[#452267] font-semibold">
                  <span>Toque para ver detalhes ou editar</span>
                  <span className="text-[#452267]">Abrir &rarr;</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DESKTOP WEEK VIEW (Telas >= md com cards espaçosos e legíveis) */}
      {viewMode === 'week' && (
        <div className="hidden md:block bg-white border border-[#ece4f6] rounded-3xl shadow-xs overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-[#ece4f6] bg-[#faf8fd] text-xs">
            <div className="p-3 text-center text-[#705e8b] font-medium border-r border-[#ece4f6] flex items-center justify-center">
              Horário
            </div>
            {weekDays.map((d) => {
              const dStr = toDateStr(d);
              const isToday = dStr === toDateStr(new Date());
              const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
              const formattedBR = formatDateBR(dStr);

              return (
                <div
                  key={dStr}
                  className={`p-3 text-center border-r border-[#ece4f6] last:border-r-0 ${
                    isToday ? 'bg-[#f5effc]' : ''
                  }`}
                >
                  <span className="block text-[11px] uppercase font-bold text-[#705e8b]">
                    {dayName}
                  </span>
                  <span
                    className={`inline-block mt-0.5 text-xs font-extrabold font-mono tabular-nums px-2.5 py-0.5 rounded-lg ${
                      isToday ? 'bg-[#452267] text-white shadow-xs' : 'text-[#452267]'
                    }`}
                  >
                    {formattedBR.substring(0, 5)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time Slots Grid (Larger slots for clear reading) */}
          <div className="divide-y divide-[#f2ecf8] max-h-[720px] overflow-y-auto">
            {timeSlots.map((slotTime) => (
              <div key={slotTime} className="grid grid-cols-7 min-h-[96px]">
                {/* Time Column */}
                <div className="p-2.5 text-center text-xs font-mono font-bold text-[#705e8b] bg-[#faf8fd] border-r border-[#ece4f6] flex items-center justify-center">
                  <span>{slotTime}</span>
                </div>

                {/* Day Columns */}
                {weekDays.map((d) => {
                  const dateStr = toDateStr(d);
                  const slotKey = `${dateStr}_${slotTime}`;
                  const slotSessions = filteredSessions.filter(
                    (s) => s.date === dateStr && s.time.startsWith(slotTime.substring(0, 2))
                  );
                  const slotBlocks = (blockedSlots || []).filter(
                    (b) => b.date === dateStr && b.timeStart.startsWith(slotTime.substring(0, 2))
                  );
                  const isHoveredSlot = dragOverSlot === slotKey;

                  return (
                    <div
                      key={dateStr}
                      onDragOver={(e) => handleDragOver(e, slotKey)}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={(e) => handleDrop(e, dateStr, slotTime)}
                      className={`p-1.5 border-r border-[#ece4f6] last:border-r-0 relative group transition-colors ${
                        isHoveredSlot ? 'bg-[#ded6f4]/30 ring-2 ring-[#452267] ring-inset' : 'hover:bg-[#faf7fe]'
                      }`}
                    >
                      {slotBlocks.length > 0 && (
                        <div className="space-y-1 mb-1">
                          {slotBlocks.map((blk) => (
                            <div
                              key={blk.id}
                              className="p-1.5 rounded-xl border border-dashed border-[#ded6f4] dark:border-[#4d377d] bg-[#f8f5fc] dark:bg-[#251940] text-[#452267] dark:text-[#ded6f4] text-xs flex items-center justify-between"
                            >
                              <div className="flex items-center gap-1 truncate">
                                <Lock className="w-3 h-3 text-[#452267] shrink-0" />
                                <span className="font-bold text-[10px] truncate">{blk.reason}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBlockedSlot(blk.id);
                                }}
                                className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer shrink-0"
                                title="Desbloquear horário"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {slotSessions.length > 0 ? (
                        <div className="space-y-1.5 h-full">
                          {slotSessions.map((session) => {
                            const isCompleted = session.status === 'realizado';
                            const isCanceled = session.status === 'desmarcado';

                            return (
                              <div
                                key={session.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, session.id)}
                                onDragEnd={handleDragEnd}
                                onClick={() => {
                                  setActiveSessionCard(session);
                                  setIsConfirmingDelete(false);
                                }}
                                className={`p-2 rounded-xl border text-xs cursor-grab active:cursor-grabbing transition-all shadow-2xs select-none overflow-hidden ${
                                  isCompleted
                                    ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                                    : isCanceled
                                    ? 'bg-[#fff1f2] border-[#fecdd3] text-[#9f1239] opacity-75'
                                    : 'bg-white border-[#ded6f4] text-[#452267] hover:border-[#452267]'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold gap-1">
                                  <span className={`font-bold text-[11px] text-[#452267] truncate ${settings.privacyMode ? 'privacy-blur' : ''}`}>
                                    {session.patientName}
                                  </span>
                                  <span className="font-mono tabular-nums text-[10px] shrink-0 font-bold text-[#705e8b]">
                                    {session.time}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between mt-1 text-[9px] text-[#705e8b] opacity-80">
                                  <span className="capitalize truncate max-w-[65px]">{session.modality}</span>
                                  <span className="capitalize font-semibold">{session.status}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenNewSessionWithTime(dateStr, slotTime)}
                          className="w-full h-full opacity-0 group-hover:opacity-100 transition-opacity border border-dashed border-[#cbbedf] rounded-2xl flex items-center justify-center text-xs text-[#452267] font-medium bg-[#fcfaff] cursor-pointer"
                          title="Agendar neste horário"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Agendar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTH VIEW (Desktop & Tablet) */}
      {viewMode === 'month' && (
        <div className="bg-white border border-[#ece4f6] rounded-3xl shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#ece4f6] bg-[#faf8fd] text-xs font-bold text-[#705e8b] text-center">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="py-2.5 border-r border-[#ece4f6] last:border-r-0">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-[#ece4f6]">
            {monthData.map((cell) => {
              const isToday = cell.dateStr === toDateStr(new Date());
              const daySessions = filteredSessions.filter((s) => s.date === cell.dateStr);

              return (
                <div
                  key={cell.dateStr}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-[#faf8fd]' : 'bg-[#faf9fc]/70 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isToday ? 'bg-[#452267] text-white shadow-2xs' : 'text-[#452267]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {daySessions.length > 0 && (
                      <span className="text-[10px] font-semibold text-[#452267] bg-[#faf5ec] px-1.5 py-0.5 rounded">
                        {daySessions.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1.5 flex-1">
                    {daySessions.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setActiveSessionCard(s);
                          setIsConfirmingDelete(false);
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer font-medium ${
                          s.status === 'realizado'
                            ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                            : s.status === 'desmarcado'
                            ? 'bg-[#fff1f2] text-[#9f1239] line-through border border-[#fecdd3]'
                            : 'bg-[#faf5ec] text-[#452267] border border-[#ded6f4]'
                        }`}
                        title={`${s.time} - ${s.patientName}`}
                      >
                        <span className="font-mono font-bold mr-1">{s.time}</span>
                        <span>{s.patientName}</span>
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <span className="text-[10px] text-[#705e8b] font-medium block">
                        +{daySessions.length - 3} mais
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end pt-1 border-t border-[#f4edf8] text-[10px]">
                    <button
                      onClick={() => onOpenNewSessionWithTime(cell.dateStr, '09:00')}
                      className="text-[#452267] hover:text-[#452267] p-0.5 cursor-pointer"
                      title="Agendar neste dia"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GOOGLE CALENDAR-STYLE POPUP CARD MODAL */}
      {activeSessionCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#ece4f6] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-[#faf8fd] border-b border-[#ece4f6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#452267]" />
                <h3 className="font-bold text-sm text-[#452267]">
                  Detalhes do Atendimento
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveSessionCard(null);
                  setIsConfirmingDelete(false);
                }}
                className="p-1 text-[#8675a3] hover:text-[#452267] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-app Deletion Confirmation Banner (Replaces window.confirm) */}
            {isConfirmingDelete ? (
              <div className="p-6 space-y-4 text-xs bg-[#fff5f5] border-b border-[#fed7d7]">
                <div className="flex items-center gap-2 text-[#be123c] font-bold">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Confirmar exclusão deste agendamento?</span>
                </div>
                <p className="text-[#9f1239] leading-relaxed">
                  Esta ação removerá a sessão de <strong>{activeSessionCard.patientName}</strong> do calendário e atualizará os cálculos do motor financeiro.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1.5 bg-white border border-[#e8dfd2] text-[#452267] rounded-xl font-semibold cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteActiveCardConfirmed}
                    className="px-4 py-1.5 bg-[#be123c] hover:bg-[#9f1239] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Sim, Excluir Agora
                  </button>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSaveActiveCard} className="p-6 space-y-4 text-xs">
              {/* Patient link to Record */}
              <div className="p-3.5 bg-[#faf5ec] rounded-2xl border border-[#e8dfd2] flex items-center justify-between">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#705e8b]">
                    Paciente
                  </span>
                  <span className="text-base font-bold text-[#452267]">
                    {activeSessionCard.patientName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    openPatientRecord(activeSessionCard.patientId);
                    setActiveSessionCard(null);
                  }}
                  className="px-3 py-1.5 bg-[#452267] hover:opacity-90 text-white font-semibold rounded-xl transition-all flex items-center gap-1.5 text-xs shadow-xs cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#ded6f4]" />
                  <span>Abrir Ficha / Prontuário</span>
                </button>
              </div>

              {/* Date and Time Edit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#452267] uppercase mb-1">
                    Data (dd-mm-aaaa)
                  </label>
                  <input
                    type="date"
                    value={activeSessionCard.date}
                    onChange={(e) =>
                      setActiveSessionCard({ ...activeSessionCard, date: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-semibold text-[#452267] focus:outline-none focus:border-[#452267]"
                    required
                  />
                  <span className="text-[10px] text-[#705e8b] mt-0.5 block">
                    Formato: {formatDateBR(activeSessionCard.date)}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#452267] uppercase mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={activeSessionCard.time}
                    onChange={(e) =>
                      setActiveSessionCard({ ...activeSessionCard, time: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs font-semibold text-[#452267] focus:outline-none focus:border-[#452267]"
                    required
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#452267] uppercase mb-1">
                  Status do Atendimento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSessionCard({ ...activeSessionCard, status: 'agendado' })
                    }
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      activeSessionCard.status === 'agendado'
                        ? 'bg-[#452267] text-white border-[#452267]'
                        : 'bg-white border-[#ece4f6] text-[#705e8b]'
                    }`}
                  >
                    Agendado
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSessionCard({ ...activeSessionCard, status: 'realizado' })
                    }
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      activeSessionCard.status === 'realizado'
                        ? 'bg-[#059669] text-white border-[#059669]'
                        : 'bg-white border-[#ece4f6] text-[#705e8b]'
                    }`}
                  >
                    Realizado
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSessionCard({ ...activeSessionCard, status: 'desmarcado' })
                    }
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      activeSessionCard.status === 'desmarcado'
                        ? 'bg-[#be123c] text-white border-[#be123c]'
                        : 'bg-white border-[#ece4f6] text-[#705e8b]'
                    }`}
                  >
                    Cancelado
                  </button>
                </div>
              </div>

              {/* Modality */}
              <div>
                <label className="block text-[11px] font-bold text-[#452267] uppercase mb-1">
                  Modalidade
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveSessionCard({ ...activeSessionCard, modality: 'presencial' })
                    }
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      activeSessionCard.modality === 'presencial'
                        ? 'bg-[#faf5ec] border-[#452267] text-[#452267]'
                        : 'bg-white border-[#ece4f6] text-[#705e8b]'
                    }`}
                  >
                    Presencial
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSessionCard({ ...activeSessionCard, modality: 'online' })
                    }
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      activeSessionCard.modality === 'online'
                        ? 'bg-[#ecfdf5] border-[#059669] text-[#065f46]'
                        : 'bg-white border-[#ece4f6] text-[#705e8b]'
                    }`}
                  >
                    Online
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[#452267] uppercase mb-1">
                  Anotação Breve
                </label>
                <textarea
                  rows={2}
                  value={activeSessionCard.notes || ''}
                  onChange={(e) =>
                    setActiveSessionCard({ ...activeSessionCard, notes: e.target.value })
                  }
                  placeholder="Observação da sessão..."
                  className="w-full px-3 py-2 bg-[#faf8fd] border border-[#ece4f6] rounded-xl text-xs text-[#452267] focus:outline-none focus:border-[#452267]"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#ece4f6]">
                {!isConfirmingDelete && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="px-3 py-2 bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#be123c] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Excluir agendamento da agenda"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Card</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSessionCard(null);
                      setIsConfirmingDelete(false);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-[#705e8b] hover:text-[#452267] cursor-pointer"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Slot Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f1535] border border-[#ece4f6] dark:border-[#3d2b63] rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ece4f6] dark:border-[#3d2b63] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#faf5ec] dark:bg-[#452267] text-[#452267] dark:text-[#ded6f4] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#452267] dark:text-white">Bloquear Horário na Agenda</h3>
                  <p className="text-[11px] text-[#705e8b] dark:text-slate-400">Reserve períodos para almoço, supervisão ou afazeres</p>
                </div>
              </div>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!blockDate || !blockTimeStart || !blockReason) return;
                addBlockedSlot(blockDate, blockTimeStart, blockTimeEnd, blockReason);
                setIsBlockModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-[#452267] dark:text-slate-200 uppercase mb-1">
                  Data do Bloqueio
                </label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#251940] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs text-[#452267] dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#452267] dark:text-slate-200 uppercase mb-1">
                    Horário Início
                  </label>
                  <input
                    type="time"
                    value={blockTimeStart}
                    onChange={(e) => setBlockTimeStart(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#251940] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs text-[#452267] dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#452267] dark:text-slate-200 uppercase mb-1">
                    Horário Término
                  </label>
                  <input
                    type="time"
                    value={blockTimeEnd}
                    onChange={(e) => setBlockTimeEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#251940] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs text-[#452267] dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#452267] dark:text-slate-200 uppercase mb-1">
                  Motivo do Bloqueio
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Intervalo de Almoço, Supervisão..."
                  className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#251940] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs text-[#452267] dark:text-white focus:outline-none"
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Intervalo de Almoço', 'Supervisão Clínica', 'Compromisso Pessoal', 'Estudo / TCC', 'Reunião'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBlockReason(preset)}
                      className="px-2 py-0.5 rounded-lg bg-[#faf5ec] dark:bg-[#452267] text-[10px] text-[#452267] dark:text-[#ded6f4] font-medium border border-[#e8dfd2] dark:border-[#4d377d] hover:bg-[#ede3f8] cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ece4f6] dark:border-[#3d2b63]">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#705e8b] dark:text-slate-400 hover:text-[#452267] dark:hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Confirmar Bloqueio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
