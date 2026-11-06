import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CortexLogo } from '../common/CortexLogo';
import { UnlockPinModal } from '../modals/UnlockPinModal';
import {
  HelpCircle,
  Eye,
  EyeOff,
  PlusCircle,
  Calendar,
  Users,
  Wallet,
  Settings as SettingsIcon,
  Search,
  X,
  BookOpen,
  Moon,
  Sun,
  ListTodo,
  CheckSquare,
  Bell,
  LogOut,
  Shield,
  Check,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewSession: () => void;
  onOpenGoogleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewSession, onOpenGoogleModal }) => {
  const {
    settings,
    togglePrivacyMode,
    toggleHelp,
    googleAccount,
    patients,
    tasks,
    openPatientRecord,
    setActiveTab,
    theme,
    toggleTheme,
    currentUser,
    logout,
    requestNotificationPermission,
    showToast,
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close search and user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const queryTrimmed = searchQuery.trim().toLowerCase();

  const matchingPatients = queryTrimmed
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(queryTrimmed) ||
          p.phone.includes(queryTrimmed) ||
          p.email.toLowerCase().includes(queryTrimmed) ||
          (p.obs && p.obs.toLowerCase().includes(queryTrimmed)) ||
          p.clinicalNotes.some(
            (n) =>
              n.title.toLowerCase().includes(queryTrimmed) ||
              n.content.toLowerCase().includes(queryTrimmed)
          )
      )
    : [];

  const matchingTasks = queryTrimmed
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(queryTrimmed) ||
          (t.category && t.category.toLowerCase().includes(queryTrimmed))
      )
    : [];

  const handlePrivacyToggleClick = () => {
    if (settings.privacyMode) {
      // Trying to unhide confidential data -> strictly require PIN
      setIsUnlockModalOpen(true);
    } else {
      // Hiding confidential data -> toggle immediately
      togglePrivacyMode();
    }
  };

  return (
    <>
      {/* 
        HEADER: Fixed at the top, ALWAYS in purple #452267 in BOTH light and dark mode.
      */}
      <header className="sticky top-0 z-40 bg-[#452267] text-white shadow-md border-b border-black/10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Main Desktop & Tablet Header Row */}
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Zone 1: Cortex Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('home')}
                className="text-left group flex items-center gap-2 focus-visible:outline-none cursor-pointer transition-transform active:scale-95"
                title="Ir para a página inicial Cortex"
              >
                <CortexLogo size="md" variant="light" showWordmark={true} />
              </button>
            </div>

            {/* Zone 2: Global Search Bar (Centralized, Amplified, Capable of searching everything) */}
            <div
              ref={searchRef}
              className="relative flex-1 max-w-md lg:max-w-xl mx-2 hidden sm:block"
            >
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#ded6f4] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Buscar pacientes, prontuários, tarefas ou anotações..."
                  className="w-full pl-10 pr-9 py-2 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-800 placeholder:text-[#ded6f4]/70 focus:placeholder:text-slate-400 border border-white/20 focus:border-white rounded-2xl text-xs transition-all shadow-inner focus:shadow-md focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-[#ded6f4] hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-[#452267]/15 overflow-hidden z-50 animate-fade-slide-up max-h-80 overflow-y-auto">
                  <div className="p-2.5 bg-[#faf6f0] border-b border-[#452267]/10 text-[10px] font-bold uppercase text-[#452267] flex items-center justify-between">
                    <span>Resultados da busca global</span>
                    <span>{matchingPatients.length + matchingTasks.length} encontrados</span>
                  </div>

                  {matchingPatients.length === 0 && matchingTasks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Nenhum resultado encontrado para &quot;{searchQuery}&quot;.
                    </div>
                  ) : (
                    <>
                      {/* Patients Section */}
                      {matchingPatients.length > 0 && (
                        <div>
                          <div className="px-3 py-1.5 bg-[#FAF6F0] text-[10px] font-bold text-[#452267] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#452267]/10">
                            <Users className="w-3 h-3 text-[#452267]" />
                            <span>Pacientes e Cadernos ({matchingPatients.length})</span>
                          </div>
                          {matchingPatients.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                openPatientRecord(p.id);
                                setIsSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="p-3 hover:bg-[#FAF6F0] border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#FAF6F0] flex items-center justify-center font-bold text-[#452267] text-[11px] border border-[#452267]/10 shrink-0">
                                  {p.avatar ? (
                                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    p.name.charAt(0)
                                  )}
                                </div>
                                <div className="truncate">
                                  <span className={`font-bold text-[#452267] block truncate ${settings.privacyMode ? 'privacy-blur' : ''}`}>
                                    {p.name}
                                  </span>
                                  <span className="block text-[10px] text-slate-500 font-mono truncate">
                                    {p.phone || p.email}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[10px] text-[#452267] font-semibold flex items-center gap-1 shrink-0">
                                <BookOpen className="w-3 h-3" />
                                Abrir ficha
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tasks Section */}
                      {matchingTasks.length > 0 && (
                        <div>
                          <div className="px-3 py-1.5 bg-[#FAF6F0] text-[10px] font-bold text-[#452267] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#452267]/10">
                            <ListTodo className="w-3 h-3 text-[#452267]" />
                            <span>Minhas Tarefas ({matchingTasks.length})</span>
                          </div>
                          {matchingTasks.map((t) => (
                            <div
                              key={t.id}
                              onClick={() => {
                                setActiveTab('tasks');
                                setIsSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="p-3 hover:bg-[#FAF6F0] border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <CheckSquare className={`w-3.5 h-3.5 shrink-0 ${t.completed ? 'text-emerald-600' : 'text-[#452267]'}`} />
                                <span className={`truncate text-slate-800 ${t.completed ? 'line-through opacity-60' : 'font-medium'}`}>
                                  {t.title}
                                </span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#faf5ec] text-[#452267] capitalize shrink-0">
                                {t.category}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Zone 3: Quick Action Shortcuts (Novo Agendamento, Modo Oculto, Ajuda, Notificações, Tema, Perfil) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Dark / Light Mode Toggle (Desktop) */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Mudar para Modo Claro (#F8F5F1)' : 'Mudar para Modo Escuro (#452267)'}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 hidden sm:flex items-center justify-center transition-all cursor-pointer text-white"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-300" />
                ) : (
                  <Moon className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Notification Permission Request (Desktop) */}
              <button
                onClick={requestNotificationPermission}
                title="Notificações de Sessões no Navegador"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 hidden sm:flex items-center justify-center transition-all cursor-pointer text-white"
              >
                <Bell className="w-4 h-4 text-[#ded6f4]" />
              </button>

              {/* Modo Oculto / Sigilo (Always visible on mobile & desktop) */}
              <button
                onClick={handlePrivacyToggleClick}
                title={settings.privacyMode ? 'Modo Oculto Ativo (Clique para revelar com PIN)' : 'Ocultar dados confidenciais (Modo Oculto)'}
                className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  settings.privacyMode
                    ? 'bg-amber-400 text-[#452267] border-amber-300 font-bold shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                }`}
              >
                {settings.privacyMode ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-[#452267]" />
                    <span className="hidden sm:inline">Oculto</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#ded6f4]" />
                    <span className="hidden sm:inline">Modo Oculto</span>
                  </>
                )}
              </button>

              {/* Ajuda / Interactive Tour (Desktop) */}
              <button
                onClick={toggleHelp}
                title="Ajuda e Tour Interativo da Plataforma"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white hidden sm:flex items-center justify-center transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-[#ded6f4]" />
              </button>

              {/* Primary Action Button: Novo Agendamento */}
              <button
                onClick={onOpenNewSession}
                className="h-9 px-3.5 text-xs font-bold text-[#452267] bg-white hover:bg-[#FAF6F0] active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer btn-interactive hidden sm:flex"
              >
                <PlusCircle className="w-4 h-4 text-[#452267]" />
                <span>Novo Agendamento</span>
              </button>

              {/* User Avatar with Popup Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-9 h-9 rounded-xl overflow-hidden border border-white/30 flex items-center justify-center bg-white/20 hover:scale-105 transition-all cursor-pointer"
                  title="Menu do Psicólogo"
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs text-white">
                      {(currentUser?.name || settings.psychologistName).charAt(0)}
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-[#452267]/15 py-2 z-50 animate-fade-slide-up">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#452267] block">
                        Profissional Conectado
                      </span>
                      <p className="text-xs font-bold text-[#452267] truncate">
                        {currentUser?.name || settings.psychologistName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        CRP: {settings.crp}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left hover:bg-[#FAF6F0] flex items-center gap-2 cursor-pointer"
                    >
                      <SettingsIcon className="w-4 h-4 text-[#452267]" />
                      <span>Configurações do Consultório</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenGoogleModal();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left hover:bg-[#FAF6F0] flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-[#452267]" />
                      <span>Backup &amp; Conta Google</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Encerrar Sessão</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 
            MOBILE HEADER STRUCTURE:
            Immediately below top bar:
            1) Barra de pesquisa mobile
            2) Botão destacado de "Agendar novo atendimento"
          */}
          <div className="sm:hidden pb-3 pt-1 space-y-2">
            {/* Search bar mobile */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#ded6f4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar paciente ou anotação..."
                className="w-full pl-9 pr-8 py-2 bg-white/10 text-white placeholder:text-[#ded6f4]/70 border border-white/20 rounded-xl text-xs focus:outline-none focus:bg-white focus:text-slate-800"
              />
            </div>

            {/* Agendar novo atendimento destacado */}
            <button
              onClick={onOpenNewSession}
              className="w-full py-2 px-3 bg-white hover:bg-[#FAF6F0] active:scale-95 text-[#452267] text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#452267]" />
              <span>Agendar Novo Atendimento</span>
            </button>
          </div>
        </div>
      </header>

      {/* PIN Unlock Modal for revealing hidden data */}
      <UnlockPinModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onSuccess={() => {
          togglePrivacyMode();
        }}
      />
    </>
  );
};
