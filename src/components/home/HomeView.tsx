import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatDateBR } from '../../utils/dateUtils';
import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Check,
  ListTodo,
  Bell,
  MessageCircle,
  Video,
  MapPin,
  CheckCircle2,
  CalendarDays,
  Coffee,
  CheckSquare,
} from 'lucide-react';

interface HomeViewProps {
  onOpenNewSession: () => void;
  onOpenReschedule: (sessionId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenNewSession,
}) => {
  const {
    settings,
    updateSettings,
    setActiveTab,
    nextAppointment,
    sessions,
    openPatientRecord,
    updateSessionStatus,
    tasks,
    toggleTask,
    getWhatsAppConfirmationLink,
    requestNotificationPermission,
    showToast,
  } = useClinic();

  const [showNotificationConfig, setShowNotificationConfig] = useState(false);
  const [notificationInterval, setNotificationInterval] = useState<number>(
    settings.notifications?.minutesBefore || 15
  );

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBR = formatDateBR(todayStr);

  const todaySessions = sessions
    .filter((s) => s.date === todayStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const weekdayName = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const capitalizedWeekday = weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);

  // Background Web Notification checker
  useEffect(() => {
    if (!settings.notifications?.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTimeInMins = currentH * 60 + currentM;

      todaySessions.forEach((sess) => {
        if (sess.status === 'desmarcado' || sess.status === 'realizado') return;
        const [sh, sm] = sess.time.split(':').map(Number);
        const sessionMins = sh * 60 + sm;
        const diff = sessionMins - currentTimeInMins;

        // If matching notification window (e.g., exactly 10 or 15 mins before)
        if (diff === (settings.notifications?.minutesBefore || 15)) {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Cortex · Atendimento em ${diff} min`, {
              body: `Sessão com ${sess.patientName} às ${sess.time} (${sess.modality === 'online' ? 'Online' : 'Consultório'}).`,
              icon: '/logo.png',
            });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [settings.notifications, todaySessions]);

  const handleSaveNotifications = (enabled: boolean, minutesBefore: number) => {
    updateSettings({
      notifications: {
        enabled,
        minutesBefore,
      },
    });
    setNotificationInterval(minutesBefore);
    if (enabled) {
      requestNotificationPermission();
    }
    showToast(
      enabled
        ? `Lembretes ativados para ${minutesBefore} minutos antes!`
        : 'Lembretes de sessão desativados.',
      'info'
    );
    setShowNotificationConfig(false);
  };

  const shouldHideName = settings.privacyMode && settings.privacyPreferences?.hidePatientNames;

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* 1. Welcome Banner */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#452267] dark:text-[#ded6f4] tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#452267] dark:bg-[#ded6f4]" />
              <span>{capitalizedWeekday}, {todayBR}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#452267] dark:text-white tracking-tight">
              {getGreeting()}, {settings.psychologistName}
            </h1>

            <p className="text-xs sm:text-sm text-[#665282] dark:text-slate-300 max-w-xl leading-relaxed">
              Bem-vindo ao <strong>Cortex</strong>. Um espaço pensado para trazer clareza, organização e acolhimento à sua rotina clínica.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-2.5">
            {/* Notification toggle button */}
            <button
              onClick={() => setShowNotificationConfig(!showNotificationConfig)}
              className="px-4 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] hover:bg-[#ede5d8] border border-[#452267]/15 dark:border-[#ded6f4]/20 text-[#452267] dark:text-white text-xs font-bold rounded-2xl btn-interactive flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Configurar notificações nativas do navegador"
            >
              <Bell className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
              <span>Avisos de Sessão</span>
            </button>

            <button
              onClick={onOpenNewSession}
              className="px-5 py-2.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#452267]/20 btn-interactive flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>

        {/* Notification Manager Panel */}
        {showNotificationConfig && (
          <div className="mt-5 pt-4 border-t border-[#452267]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-slide-up">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#452267] dark:text-white flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
                Notificação no Navegador/Desktop:
              </span>
              <div className="flex items-center gap-2">
                {[10, 15, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleSaveNotifications(true, mins)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      settings.notifications?.enabled && settings.notifications?.minutesBefore === mins
                        ? 'bg-[#452267] text-white shadow-xs'
                        : 'bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 dark:border-[#ded6f4]/20 text-[#452267] dark:text-slate-300'
                    }`}
                  >
                    {mins} min antes
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSaveNotifications(false, 15)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    !settings.notifications?.enabled
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 dark:border-[#ded6f4]/20 text-slate-500'
                  }`}
                >
                  Desativado
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Side-by-side Top Grid: Próximo Atendimento ao lado da Agenda de Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Próximo Atendimento (Card compacto otimizado conforme requisitos) */}
        <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#452267]/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/10 flex items-center justify-center text-[#452267] dark:text-[#ded6f4]">
                  <Sparkles className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#452267] block">
                    Próximo Atendimento
                  </span>
                  <h3 className={`text-sm font-bold text-[#452267] dark:text-white ${shouldHideName ? 'privacy-blur' : ''}`}>
                    {nextAppointment ? nextAppointment.patientName : 'Tudo em dia por aqui'}
                  </h3>
                </div>
              </div>

              {nextAppointment && (
                <div className="flex items-center gap-2">
                  {/* WhatsApp Reminder Button */}
                  <a
                    href={getWhatsAppConfirmationLink(nextAppointment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Enviar confirmação pronta via WhatsApp"
                    className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all btn-interactive"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* Single Time Display with Modality Tag */}
                  <span className="text-xs font-black font-mono text-[#452267] dark:text-[#ded6f4] bg-[#FAF6F0] dark:bg-[#25103b] px-2.5 py-1 rounded-xl border border-[#452267]/15">
                    {nextAppointment.time}
                  </span>
                </div>
              )}
            </div>

            {nextAppointment ? (
              <div className="py-3.5 space-y-2">
                <div className="flex items-center justify-between p-3 bg-[#FAF6F0] dark:bg-[#25103b] rounded-2xl border border-[#452267]/10 text-xs">
                  {/* Data pura sem texto "Data agendada:" */}
                  <span className="font-bold text-[#452267] dark:text-white">
                    {formatDateBR(nextAppointment.date)}
                  </span>

                  {/* Modality Tag */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                      nextAppointment.modality === 'online'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {nextAppointment.modality === 'online' ? (
                      <>
                        <Video className="w-3 h-3" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3 h-3" />
                        <span>Consultório</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              /* Acolhedor Empty State */
              <div className="py-8 text-center text-xs text-[#705e8b] dark:text-slate-400">
                <Coffee className="w-6 h-6 text-[#452267] dark:text-[#ded6f4] mx-auto mb-1.5 opacity-60" />
                <p className="font-bold text-xs text-[#452267] dark:text-white">
                  Tudo em dia por aqui.
                </p>
                <p className="text-[11px] text-[#8675a3] dark:text-slate-400 mt-0.5">
                  Nenhuma sessão agendada para hoje.
                </p>
              </div>
            )}
          </div>

          {nextAppointment && (
            <div className="flex items-center justify-between pt-3 border-t border-[#452267]/10 dark:border-white/10">
              {/* No canto inferior esquerdo: manter apenas um ícone de "check/correto" (✓) verde para concluir */}
              <button
                onClick={() => updateSessionStatus(nextAppointment.id, 'realizado')}
                className="w-9 h-9 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-center cursor-pointer btn-interactive shadow-xs"
                title="Concluir atendimento (✓)"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* No outro canto: botão com ícone de seta (➜) direcionando para a página do paciente */}
              <button
                onClick={() => openPatientRecord(nextAppointment.patientId)}
                className="w-9 h-9 bg-[#452267] hover:opacity-90 text-white rounded-xl flex items-center justify-center cursor-pointer btn-interactive shadow-xs"
                title="Ir para a página do paciente (➜)"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Agenda de Hoje (Sem data repetida no título, no botão Ver agenda apenas a seta, sem aviso de faturamento) */}
        <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#452267]/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/10 flex items-center justify-center text-[#452267] dark:text-[#ded6f4]">
                  <CalendarDays className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
                </div>
                <div>
                  {/* Título limpo sem a data repetida */}
                  <h3 className="text-sm font-bold text-[#452267] dark:text-white">
                    Agenda de Hoje
                  </h3>
                  <span className="text-[10px] text-[#705e8b] dark:text-slate-400">
                    {todaySessions.length === 0
                      ? 'Nenhum paciente agendado'
                      : `${todaySessions.length} ${todaySessions.length === 1 ? 'atendimento' : 'atendimentos'}`}
                  </span>
                </div>
              </div>

              {/* No botão "Ver agenda", remover o texto e deixar apenas o ícone de seta */}
              <button
                onClick={() => setActiveTab('calendar')}
                className="w-9 h-9 rounded-xl bg-[#FAF6F0] hover:bg-[#ede5d8] dark:bg-[#25103b] dark:hover:bg-[#2f144b] border border-[#452267]/15 text-[#452267] dark:text-white flex items-center justify-center transition-all cursor-pointer btn-interactive shadow-xs"
                title="Ver agenda completa"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sessions list com etiquetas coloridas diferenciando presencial de online */}
            {todaySessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#705e8b] dark:text-slate-400">
                <Calendar className="w-6 h-6 text-[#452267] dark:text-[#ded6f4] mx-auto mb-1.5 opacity-60" />
                <p className="font-bold text-xs text-[#452267] dark:text-white">
                  Tudo em dia por aqui.
                </p>
                <p className="text-[11px] text-[#8675a3] dark:text-slate-400 mt-0.5">
                  Nenhuma sessão agendada para hoje.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#452267]/5 dark:divide-white/10 max-h-52 overflow-y-auto mt-1">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-[#FAF6F0] dark:hover:bg-[#25103b] px-2 rounded-xl transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono font-bold text-xs text-[#452267] dark:text-white min-w-[45px]">
                        {session.time}
                      </span>
                      <span
                        onClick={() => openPatientRecord(session.patientId)}
                        className={`font-semibold text-slate-800 dark:text-slate-200 hover:text-[#452267] cursor-pointer truncate ${
                          shouldHideName ? 'privacy-blur' : ''
                        }`}
                      >
                        {session.patientName}
                      </span>

                      {/* Diferenciação visual com etiquetas coloridas: Presencial vs Online */}
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          session.modality === 'online'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {session.modality === 'online' ? 'Online' : 'Consultório'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* WhatsApp shortcut */}
                      <a
                        href={getWhatsAppConfirmationLink(session)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                        title="Enviar confirmação WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => updateSessionStatus(session.id, 'realizado')}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          session.status === 'realizado'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {session.status === 'realizado' ? 'Concluído' : 'Confirmar'}
                      </button>

                      <button
                        onClick={() => openPatientRecord(session.patientId)}
                        className="p-1 text-[#8675a3] hover:text-[#452267] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Ver prontuário"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 
        3. Widget "Minhas Tarefas" da Home:
        Remover o botão/campo de adicionar novas tarefas da Home!
        A tela inicial apenas lista as tarefas existentes; a criação deve ocorrer exclusivamente na página dedicada de tarefas.
      */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#452267]/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/10 flex items-center justify-center text-[#452267] dark:text-[#ded6f4]">
              <ListTodo className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
            </div>
            <h3 className="text-sm font-bold text-[#452267] dark:text-white">
              Minhas Tarefas
            </h3>
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-bold text-[#452267] dark:text-[#ded6f4] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Gerenciar na Página Dedicada</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Existing Tasks List (Sem formulário de adicionar na Home) */}
        {tasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#705e8b] dark:text-slate-400">
            <CheckSquare className="w-6 h-6 text-[#452267] dark:text-[#ded6f4] mx-auto mb-1 opacity-50" />
            <p className="font-bold text-[#452267] dark:text-white">Nenhuma tarefa pendente no momento.</p>
            <p className="text-[11px] text-[#8675a3] dark:text-slate-400 mt-0.5">Sua rotina pessoal e clínica está organizada.</p>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-[#FAF6F0] dark:hover:bg-[#25103b] transition-colors text-xs border border-transparent hover:border-[#452267]/10"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      task.completed
                        ? 'bg-[#452267] border-[#452267] text-white'
                        : 'border-[#452267]/30 bg-white dark:bg-[#351a50]'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                  <span
                    onClick={() => toggleTask(task.id)}
                    className={`cursor-pointer truncate ${
                      task.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-800 dark:text-white font-medium'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FAF6F0] dark:bg-[#25103b] text-[#452267] dark:text-[#ded6f4] shrink-0 border border-[#452267]/10">
                  {task.category || 'clínico'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
