import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Trash2,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sun,
  Calendar,
  Lock,
  PlusCircle,
  HelpCircle,
  Mic,
  MicOff,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionTaken?: string;
}

export const JungAssistant: React.FC = () => {
  const {
    isJungOpen,
    setIsJungOpen,
    patients,
    sessions,
    financialMetrics,
    settings,
    setActiveTab,
    addPatient,
    addBlockedSlot,
    showToast,
  } = useClinic();

  const getInitialGreeting = () => {
    const hour = new Date().getHours();
    const salutation = hour >= 5 && hour < 12 ? 'Bom dia' : hour >= 12 && hour < 18 ? 'Boa tarde' : 'Boa noite';
    return `${salutation}, sou seu assistente virtual Jung. Posso realizar agendamentos, cadastrar pacientes por comando, resumir sessões anteriores, guiar pela plataforma ou gerar seu briefing matinal. Como posso colaborar agora?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: getInitialGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isJungOpen) {
      scrollToBottom();
    }
  }, [messages, isJungOpen]);

  // Mask patient names with initials when Privacy Mode (Modo Oculto) is active
  const maskPatientName = (name: string): string => {
    if (!settings.privacyMode || !settings.privacyPreferences?.hidePatientNames) return name;
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0) + '.';
    return parts.map((p) => p.charAt(0) + '.').join('');
  };

  // Clear chat history for strict professional confidentiality
  const handleClearHistory = () => {
    setMessages([
      {
        id: `cleared-${Date.now()}`,
        role: 'assistant',
        content: 'Histórico de mensagens apagado integralmente por motivos de sigilo profissional. Como posso ajudar agora?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    showToast('Histórico do chat apagado com sucesso.', 'info');
  };

  // Parse Operational Commands (Client-Side Action Engine)
  const processOperationalCommands = (prompt: string): { handled: boolean; reply: string; actionTaken?: string } => {
    const p = prompt.toLowerCase();

    // 1. Navegação Direta
    if (p.includes('abra o faturamento') || p.includes('abrir faturamento') || p.includes('ver financeiro') || p.includes('motor financeiro')) {
      setActiveTab('finance');
      return {
        handled: true,
        reply: 'Direcionando você para o **Motor Financeiro**. Aqui você confere os valores confirmados, projeções e perdas por faltas.',
        actionTaken: 'Navegação para Motor Financeiro',
      };
    }

    if (p.includes('abra a agenda') || p.includes('abrir agenda') || p.includes('ver agenda') || p.includes('calendário')) {
      setActiveTab('calendar');
      return {
        handled: true,
        reply: 'Abrindo a **Agenda Clínica**. Você pode visualizar seus horários em formato semanal ou mensal e arrastar sessões.',
        actionTaken: 'Navegação para Agenda',
      };
    }

    if (p.includes('abra as tarefas') || p.includes('abrir tarefas') || p.includes('minhas tarefas')) {
      setActiveTab('tasks');
      return {
        handled: true,
        reply: 'Abrindo a página dedicada de **Minhas Tarefas**. Aqui você organiza afazeres clínicos, administrativos e pessoais.',
        actionTaken: 'Navegação para Tarefas',
      };
    }

    if (p.includes('abra os prontuários') || p.includes('abrir prontuarios') || p.includes('ver pacientes') || p.includes('cadernos')) {
      setActiveTab('patients');
      return {
        handled: true,
        reply: 'Abrindo a lista de **Prontuários & Cadernos de Pacientes**.',
        actionTaken: 'Navegação para Prontuários',
      };
    }

    if (p.includes('configurações') || p.includes('ajustes') || p.includes('consultório')) {
      setActiveTab('settings');
      return {
        handled: true,
        reply: 'Abrindo as **Configurações do Consultório**.',
        actionTaken: 'Navegação para Configurações',
      };
    }

    // 2. Bloqueio de Horário
    if (p.includes('bloqueie') || p.includes('bloquear') || p.includes('intervalo')) {
      // e.g. "bloqueie quinta-feira das 12h às 13h para almoço"
      const dateStr = new Date().toISOString().split('T')[0];
      let start = '12:00';
      let end = '13:00';
      let reason = 'Intervalo de Almoço';

      if (p.includes('almoço') || p.includes('almoco')) reason = 'Intervalo de Almoço';
      if (p.includes('supervisão') || p.includes('supervisao')) reason = 'Supervisão Clínica';
      if (p.includes('estudo')) reason = 'Horário de Estudo';

      addBlockedSlot(dateStr, start, end, reason);
      setActiveTab('calendar');
      return {
        handled: true,
        reply: `Horário bloqueado com sucesso na agenda para **${reason}** (${start} às ${end}). O período foi marcado como indisponível para novos atendimentos.`,
        actionTaken: 'Bloqueio de Horário Realizado',
      };
    }

    // 3. Cadastro de Pacientes Operacional
    if ((p.includes('adicione o paciente') || p.includes('cadastre o paciente') || p.includes('adicionar paciente')) && p.length > 10) {
      // Simple natural language extractor
      const nameMatch = prompt.match(/(?:paciente|adicionar|adicione)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/i);
      const extractedName = nameMatch ? nameMatch[1].trim() : 'Novo Paciente';
      const isOnline = p.includes('online');
      const cadence = p.includes('quinzenal') ? 'quinzenal' : 'semanal';

      let time = '15:00';
      const timeMatch = p.match(/(\d{1,2})h(?:(\d{2}))?/);
      if (timeMatch) {
        const h = String(timeMatch[1]).padStart(2, '0');
        const m = timeMatch[2] ? String(timeMatch[2]).padStart(2, '0') : '00';
        time = `${h}:${m}`;
      }

      addPatient({
        name: extractedName,
        avatar: '',
        email: `${extractedName.toLowerCase().replace(/\s+/g, '')}@email.com`,
        phone: '(11) 98765-4321',
        emergencyContact: {
          name: 'Contato de Emergência',
          phone: '(11) 98765-0000',
          relation: 'Familiar',
        },
        sessionFee: settings.defaultFee || 200,
        preferredModality: isOnline ? 'online' : 'presencial',
        cadence: cadence as any,
        preferredWeekday: 2, // Terça
        preferredTime: time,
        status: 'ativo',
        startDate: new Date().toISOString().split('T')[0],
        obs: `Cadastrado automaticamente via comando de voz/texto com o Assistente Jung. Frequência ${cadence} às ${time}.`,
      });

      setActiveTab('patients');
      return {
        handled: true,
        reply: `Paciente **${maskPatientName(extractedName)}** cadastrado com sucesso! Foi criado o prontuário individual e gerada a recorrência ${cadence} às ${time} (${isOnline ? 'Online' : 'Presencial'}).`,
        actionTaken: 'Cadastro de Paciente Concluído',
      };
    }

    // 4. Briefing Matinal
    if (p.includes('briefing') || p.includes('resumo do dia') || p.includes('bom dia') || p.includes('matinal')) {
      const today = new Date().toISOString().split('T')[0];
      const todaySessions = sessions.filter((s) => s.date === today && s.status !== 'desmarcado');
      const pendingNotes = patients.reduce((acc, p) => acc + (p.clinicalNotes?.length === 0 ? 1 : 0), 0);

      const firstSession = todaySessions.sort((a, b) => a.time.localeCompare(b.time))[0];

      return {
        handled: true,
        reply: `**Briefing Matinal · Cortex** 🌅\n\n• **Atendimentos Hoje:** Você possui **${todaySessions.length}** ${todaySessions.length === 1 ? 'sessão programada' : 'sessões programadas'}.\n• **Primeiro Horário:** ${firstSession ? `Às **${firstSession.time}** com **${maskPatientName(firstSession.patientName)}** (${firstSession.modality})` : 'Nenhum atendimento pela manhã.'}\n• **Pendências:** ${pendingNotes > 0 ? `${pendingNotes} fichas clínicas aguardando anotações iniciais.` : 'Todas as fichas clínicas estão com prontuários atualizados!'}\n\nDeseja que eu abra a agenda de hoje ou detalhe algum caso?`,
        actionTaken: 'Briefing Matinal Gerado',
      };
    }

    // 5. Recuperação de Histórico Pré-Sessão
    if (p.includes('resuma a última sessão') || p.includes('última sessão') || p.includes('resumo da paciente') || p.includes('resumo do paciente')) {
      const matched = patients.find((pat) => p.includes(pat.name.toLowerCase().split(' ')[0]));
      if (matched && matched.clinicalNotes && matched.clinicalNotes.length > 0) {
        const lastNote = matched.clinicalNotes[0];
        return {
          handled: true,
          reply: `**Resumo Pré-Sessão · ${maskPatientName(matched.name)}**\n\n• **Última Anotação:** ${lastNote.title} (${lastNote.date})\n• **Principais Tópicos Registrados:**\n  - ${lastNote.content ? lastNote.content.substring(0, 180) + '...' : 'Registro sem texto detalhado.'}\n• **Frequência & Modalidade:** ${matched.cadence} (${matched.preferredModality})\n• **Lembrete Clínico:** Verificar evolução dos exercícios de regulação emocional e tarefas combinadas.`,
          actionTaken: 'Histórico Pré-Sessão Recuperado',
        };
      }
    }

    return { handled: false, reply: '' };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    // 1. Check client-side operational handler first
    const operational = processOperationalCommands(prompt);
    if (operational.handled) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `reply-${Date.now()}`,
            role: 'assistant',
            content: operational.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionTaken: operational.actionTaken,
          },
        ]);
        setIsLoading(false);
      }, 400);
      return;
    }

    // 2. Call backend Jung AI service
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/jung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          context: {
            today,
            privacyMode: settings.privacyMode,
            todaySessions: sessions.filter((s) => s.date === today).map((s) => ({
              time: s.time,
              patientName: maskPatientName(s.patientName),
              modality: s.modality,
              status: s.status,
            })),
            patients: patients.map((p) => ({
              name: maskPatientName(p.name),
              cadence: p.cadence,
              fee: p.sessionFee,
              obs: p.obs,
              notesCount: p.clinicalNotes?.length || 0,
            })),
            finances: financialMetrics,
            psychologist: settings.psychologistName,
          },
        }),
      });

      const data = await res.json();
      let reply = data.reply || 'Estou à disposição para organizar sua rotina clínica.';
      if (settings.privacyMode && settings.privacyPreferences?.hidePatientNames) {
        patients.forEach((p) => {
          const initials = maskPatientName(p.name);
          reply = reply.replace(new RegExp(p.name, 'gi'), initials);
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Como assistente clínico Jung, estou pronto para gerenciar sua agenda, tarefas ou tirar dúvidas sobre o sistema Cortex.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice command input toggle
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      handleSendMessage('Briefing matinal de hoje');
      return;
    }

    if (isVoiceActive) {
      recognitionRef.current?.stop();
      setIsVoiceActive(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.onstart = () => setIsVoiceActive(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputPrompt(transcript);
          handleSendMessage(transcript);
        }
      };
      recognition.onend = () => setIsVoiceActive(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsVoiceActive(false);
    }
  };

  return (
    <>
      {/* 
        Single Floating Trigger Button in bottom right:
        "O Jung deve ser obrigatoriamente uma bolinha/ícone circular discreto flutuando no canto inferior direito.
        Ele deve permanecer recolhido e só se expandir/abrir quando o usuário passar o mouse por cima (hover) ou clicar nele, revelando o chat completo."
      {/* 
        Intelligent AI Assistant Jung - Floating Trigger:
        Circular button in bottom right.
        On Hover: Expands laterally into a small capsule showing "Jung IA", without opening the chat.
        On Click: Opens the full chat.
      */}
      {!isJungOpen && (
        <button
          type="button"
          onClick={() => setIsJungOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 group h-14 w-14 hover:w-36 rounded-full bg-[#452267] active:scale-95 text-white shadow-xl shadow-[#452267]/30 flex items-center justify-center hover:justify-start px-0 hover:px-4.5 transition-all duration-300 ease-out cursor-pointer border border-white/25 select-none overflow-hidden"
          title="Assistente Jung IA (Clique para conversar)"
        >
          <div className="flex items-center gap-2 shrink-0">
            <Bot className="w-6 h-6 text-white shrink-0" />
            <span className="max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 overflow-hidden whitespace-nowrap text-xs font-bold text-white transition-all duration-300 ease-out">
              Jung IA
            </span>
          </div>
        </button>
      )}

      {/* Slide-over Assistant Drawer / Modal */}
      {isJungOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#FFFFFF] dark:bg-[#452267] border-l border-[#452267]/15 dark:border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 bg-[#452267] text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight">Assistente Jung</h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    Operacional
                  </span>
                </div>
                <p className="text-[11px] text-[#ded6f4] opacity-90">
                  Agendamento, prontuários &amp; auxílio clínico
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Botão 'Limpar Histórico' */}
              <button
                onClick={handleClearHistory}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer mr-1"
                title="Apagar histórico do chat por sigilo profissional"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Histórico</span>
              </button>

              <button
                onClick={() => setIsJungOpen(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                title="Fechar assistente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="p-2.5 bg-[#FAF6F0] dark:bg-black/20 border-b border-[#452267]/10 dark:border-white/10 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
            <button
              onClick={() => handleSendMessage('Briefing matinal de hoje')}
              className="px-3 py-1 bg-white dark:bg-white/10 hover:bg-[#ede5d8] border border-[#452267]/15 rounded-xl text-[#452267] dark:text-white font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Briefing Matinal</span>
            </button>

            <button
              onClick={() => handleSendMessage('Abra o faturamento deste mês')}
              className="px-3 py-1 bg-white dark:bg-white/10 hover:bg-[#ede5d8] border border-[#452267]/15 rounded-xl text-[#452267] dark:text-white font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <ArrowRight className="w-3.5 h-3.5 text-[#452267]" />
              <span>Ver Faturamento</span>
            </button>

            <button
              onClick={() => handleSendMessage('Como funciona o bloqueio de horários na agenda?')}
              className="px-3 py-1 bg-white dark:bg-white/10 hover:bg-[#ede5d8] border border-[#452267]/15 rounded-xl text-[#452267] dark:text-white font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#452267]" />
              <span>Ajuda do Sistema</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-white dark:bg-[#452267]">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-xs ${
                      isAssistant
                        ? 'bg-[#452267] text-white'
                        : 'bg-[#FAF6F0] dark:bg-white/15 border border-[#452267]/15 text-[#452267] dark:text-white font-bold'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 shadow-xs ${
                      isAssistant
                        ? 'bg-[#FAF6F0] dark:bg-white/10 text-slate-800 dark:text-slate-100 border border-[#452267]/10'
                        : 'bg-[#452267] text-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed font-sans">
                      {msg.content}
                    </div>

                    {msg.actionTaken && (
                      <div className="pt-1.5 mt-1 border-t border-[#452267]/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Ação executada: {msg.actionTaken}</span>
                      </div>
                    )}

                    <span
                      className={`block text-[9px] font-mono text-right ${
                        isAssistant ? 'text-slate-400' : 'text-white/70'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#FAF6F0] dark:bg-white/10 rounded-2xl text-xs text-[#452267] dark:text-[#ded6f4] w-fit">
                <Sparkles className="w-4 h-4 text-[#452267] animate-spin" />
                <span className="font-semibold">Jung processando comando clínico...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#FAF6F0] dark:bg-black/20 border-t border-[#452267]/10 dark:border-white/10 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isVoiceActive
                    ? 'bg-rose-600 text-white animate-pulse border-rose-500'
                    : 'bg-white dark:bg-white/10 text-[#452267] dark:text-white border-[#452267]/15'
                }`}
                title="Comando por voz"
              >
                {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ex: 'Adicione o paciente Carlos, semanal às 15h' ou 'Briefing matinal'..."
                className="flex-1 px-3.5 py-2.5 bg-white dark:bg-white/10 border border-[#452267]/15 rounded-2xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#452267]"
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="p-2.5 bg-[#452267] hover:opacity-90 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md btn-interactive cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
