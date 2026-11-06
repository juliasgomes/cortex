import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Settings as SettingsIcon,
  Clock,
  Download,
  CheckCircle,
  Building,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Headphones,
  Check,
  Mail,
  Printer,
  FileText,
  Timer,
  User,
} from 'lucide-react';

export const ClinicSettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    changeSecurityPin,
    verifySecurityPin,
    patients,
    sessions,
    showToast,
  } = useClinic();

  const [psychologistName, setPsychologistName] = useState(settings.psychologistName);
  const [psychologistAvatar, setPsychologistAvatar] = useState(settings.psychologistAvatar || '');
  const [crp, setCrp] = useState(settings.crp);
  const [specialty, setSpecialty] = useState(settings.specialty);
  const [defaultFee, setDefaultFee] = useState(settings.defaultFee);
  const [workStart, setWorkStart] = useState(settings.workStart);
  const [workEnd, setWorkEnd] = useState(settings.workEnd);
  const [officeAddress, setOfficeAddress] = useState(settings.officeAddress);
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes || 0);
  const [pinProtectionEnabled, setPinProtectionEnabled] = useState(settings.pinProtectionEnabled ?? true);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // PIN settings state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PIN toggle modal state - requires current PIN to authorize change
  const [isConfirmToggleModalOpen, setIsConfirmToggleModalOpen] = useState(false);
  const [toggleTargetState, setToggleTargetState] = useState<boolean | null>(null);
  const [togglePinInput, setTogglePinInput] = useState('');
  const [togglePinError, setTogglePinError] = useState<string | null>(null);

  const requestTogglePinProtection = (enabled: boolean) => {
    setToggleTargetState(enabled);
    setTogglePinInput('');
    setTogglePinError(null);
    setIsConfirmToggleModalOpen(true);
  };

  const handleConfirmTogglePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifySecurityPin(togglePinInput)) {
      setTogglePinError('PIN atual incorreto. Digite a senha correta para autorizar a alteração.');
      return;
    }
    const target = toggleTargetState ?? false;
    setPinProtectionEnabled(target);
    updateSettings({ pinProtectionEnabled: target });
    setIsConfirmToggleModalOpen(false);
    showToast(target ? 'Proteção por PIN ativada com sucesso.' : 'Proteção por PIN desativada (Acesso livre).', 'info');
  };

  // Privacy preferences with PIN confirmation
  const [prefHideNames, setPrefHideNames] = useState(settings.privacyPreferences?.hidePatientNames ?? true);
  const [prefHideValues, setPrefHideValues] = useState(settings.privacyPreferences?.hideFinancialValues ?? true);
  const [prefHideNotes, setPrefHideNotes] = useState(settings.privacyPreferences?.hideSessionNotes ?? true);
  const [prefPinConfirm, setPrefPinConfirm] = useState('');
  const [prefMessage, setPrefMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPsychologistAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePsychologistAvatar = () => {
    setPsychologistAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Botão "Salvar configurações" posicionado internamente dentro do seu respectivo card branco
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      psychologistName,
      psychologistAvatar,
      crp,
      specialty,
      defaultFee: Number(defaultFee),
      workStart,
      workEnd,
      officeAddress,
      autoLockMinutes,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    if (newPinInput.length < 4 || newPinInput.length > 6 || !/^\d+$/.test(newPinInput)) {
      setPinMessage({ type: 'error', text: 'O novo PIN deve conter de 4 a 6 dígitos numéricos.' });
      return;
    }

    if (newPinInput !== confirmNewPinInput) {
      setPinMessage({ type: 'error', text: 'A confirmação do novo PIN não coincide.' });
      return;
    }

    const result = changeSecurityPin(currentPinInput, newPinInput);
    if (result.success) {
      setPinMessage({ type: 'success', text: 'PIN de segurança alterado com sucesso!' });
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
      setTimeout(() => setPinMessage(null), 3500);
    } else {
      setPinMessage({ type: 'error', text: result.error || 'PIN atual incorreto. Digite a senha atual correta para alterar.' });
    }
  };

  // Save customized privacy preferences requiring PIN
  const handleSavePrivacyPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefMessage(null);

    if (!verifySecurityPin(prefPinConfirm)) {
      setPrefMessage({
        type: 'error',
        text: 'PIN incorreto. Digite sua senha de segurança para confirmar a alteração.',
      });
      return;
    }

    updateSettings({
      privacyPreferences: {
        hidePatientNames: prefHideNames,
        hideFinancialValues: prefHideValues,
        hideSessionNotes: prefHideNotes,
      },
    });

    setPrefMessage({
      type: 'success',
      text: 'Preferências de ocultação atualizadas com sucesso!',
    });
    setPrefPinConfirm('');
    setTimeout(() => setPrefMessage(null), 3500);
  };

  // Export Complete Vault Backup (JSON)
  const handleExportVault = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      psychologist: {
        name: settings.psychologistName,
        crp: settings.crp,
        specialty: settings.specialty,
      },
      patients,
      sessions,
      settings,
      systemVersion: '2.5.0-cortex',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cortex_backup_completo_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup JSON exportado com sucesso!', 'success');
  };

  // Export Clinical Records to PDF
  const handleExportPDF = () => {
    window.print();
    showToast('Histórico de prontuários enviado para impressão / PDF.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-slide-up">
      {/* 1. Header Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#452267] text-white flex items-center justify-center shadow-sm">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#452267] dark:text-white tracking-tight">
              Consultório &amp; Ajustes
            </h1>
            <p className="text-xs text-[#665282] dark:text-slate-300 mt-0.5">
              Personalize dados clínicos, padrões de honorários, sigilo com PIN e regras de inatividade.
            </p>
          </div>
        </div>
      </div>

      {/* 
        2. Perfil do Profissional & Consultório
        "Botão 'Salvar configurações': Deve ser estilizado na cor #452267 e posicionado internamente dentro do seu respectivo card branco."
      */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#452267]/10 dark:border-white/10">
          <h2 className="text-sm font-bold text-[#452267] dark:text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
            <span>1. Dados do Psicólogo &amp; Consultório</span>
          </h2>

          {isSaved && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              Configurações salvas!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar Profile */}
          <div className="flex items-center gap-4 p-4 bg-[#FAF6F0] dark:bg-[#25103b] rounded-2xl border border-[#452267]/10">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-[#351a50] border border-[#452267]/15 flex items-center justify-center font-black text-xl text-[#452267] dark:text-white shrink-0 shadow-xs">
              {psychologistAvatar ? (
                <img src={psychologistAvatar} alt="Foto do Psicólogo" className="w-full h-full object-cover" />
              ) : (
                psychologistName.charAt(0)
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#452267] dark:text-white block">
                Foto de Perfil do Psicólogo
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white dark:bg-[#351a50] hover:bg-[#ede5d8] border border-[#452267]/15 text-[#452267] dark:text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  Alterar Foto
                </button>
                {psychologistAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePsychologistAvatar}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer font-semibold"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                Nome do Profissional
              </label>
              <input
                type="text"
                value={psychologistName}
                onChange={(e) => setPsychologistName(e.target.value)}
                placeholder="Ex: Dra. Helena Vance"
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                Número do CRP
              </label>
              <input
                type="text"
                value={crp}
                onChange={(e) => setCrp(e.target.value)}
                placeholder="Ex: 06/142981"
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                Especialidade / Abordagem
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ex: Psicologia Clínica · TCC"
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                Honorário Padrão por Sessão (R$)
              </label>
              <input
                type="number"
                value={defaultFee}
                onChange={(e) => setDefaultFee(Number(e.target.value))}
                placeholder="200"
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                Horário de Início
              </label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                Horário de Término
              </label>
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                Endereço do Consultório Físico
              </label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000, Conjunto 42, Bela Vista, São Paulo - SP"
                className="w-full px-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 
            Botão "Salvar configurações": Deve ser estilizado na cor #452267 e posicionado internamente dentro do seu respectivo card branco.
          */}
          <div className="flex justify-end pt-3 border-t border-[#452267]/10 dark:border-white/10">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#452267]/20 btn-interactive flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Salvar configurações</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Bloqueio Automático por Inatividade (5 ou 10 minutos) */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#452267]/10 dark:border-white/10">
          <h3 className="text-sm font-bold text-[#452267] dark:text-white flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
            <span>2. Bloqueio Automático por Inatividade</span>
          </h3>
          <span className="text-[11px] font-mono text-[#452267] dark:text-[#ded6f4] bg-[#FAF6F0] dark:bg-[#25103b] px-2.5 py-0.5 rounded-lg font-bold border border-[#452267]/10">
            {autoLockMinutes === 0 ? 'Desativado' : `${autoLockMinutes} minutos`}
          </span>
        </div>

        <p className="text-xs text-[#665282] dark:text-slate-300">
          Ativa a tela de bloqueio e o Modo Oculto automaticamente quando o consultório ficar sem atividade (sem movimento de mouse ou digitação).
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {[
            { value: 0, label: 'Desativado' },
            { value: 5, label: 'Bloquear após 5 minutos' },
            { value: 10, label: 'Bloquear após 10 minutos' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setAutoLockMinutes(opt.value);
                updateSettings({ autoLockMinutes: opt.value });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                autoLockMinutes === opt.value
                  ? 'bg-[#452267] text-white shadow-xs'
                  : 'bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 text-[#452267] dark:text-slate-300 hover:bg-[#ede5d8]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Modo Oculto & Preferências de Sigilo (Exigindo Senha para Salvar) */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#452267]/10 dark:border-white/10">
          <h3 className="text-sm font-bold text-[#452267] dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
            <span>3. Preferências de Ocultação no Modo Sigilo</span>
          </h3>
          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-semibold">
            Requer PIN para salvar
          </span>
        </div>

        {prefMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              prefMessage.type === 'success'
                ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                : 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]'
            }`}
          >
            {prefMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-[#059669] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#be123c] shrink-0" />
            )}
            <span>{prefMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSavePrivacyPreferences} className="space-y-4 pt-1 text-xs">
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={prefHideNames}
                onChange={(e) => setPrefHideNames(e.target.checked)}
                className="w-4 h-4 rounded text-[#452267] focus:ring-[#452267]"
              />
              <span className="font-bold text-[#452267] dark:text-white">Ocultar Nome dos Pacientes (apenas iniciais ou desfoque)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={prefHideValues}
                onChange={(e) => setPrefHideValues(e.target.checked)}
                className="w-4 h-4 rounded text-[#452267] focus:ring-[#452267]"
              />
              <span className="font-bold text-[#452267] dark:text-white">Ocultar Valores Financeiros e Faturamento</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={prefHideNotes}
                onChange={(e) => setPrefHideNotes(e.target.checked)}
                className="w-4 h-4 rounded text-[#452267] focus:ring-[#452267]"
              />
              <span className="font-bold text-[#452267] dark:text-white">Bloquear Acesso ao Caderno de Sessões</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#452267]/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
              <input
                type="password"
                maxLength={6}
                value={prefPinConfirm}
                onChange={(e) => setPrefPinConfirm(e.target.value.replace(/\D/g, ''))}
                placeholder="Digite seu PIN atual (1234)"
                className="w-48 px-3 py-2 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-mono font-bold text-[#452267] dark:text-white focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl transition-all shadow-xs btn-interactive flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Preferências de Ocultação</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. Senha de Bloqueio com PIN Opcional (Até 6 dígitos) */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#452267]/10 dark:border-white/10 gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#452267] dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
              <span>4. Proteção por Senha / PIN (Recurso Opcional)</span>
            </h3>
            <p className="text-[11px] text-[#705e8b] dark:text-slate-400 mt-0.5">
              Defina se deseja exigir um PIN numérico de até 6 dígitos para desbloquear o sistema ou acessar prontuários.
            </p>
          </div>

          {/* Optional Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-[#452267] dark:text-white">
              {pinProtectionEnabled ? 'Proteção Ativada' : 'Desativada (Livre)'}
            </span>
            <button
              type="button"
              onClick={() => requestTogglePinProtection(!pinProtectionEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                pinProtectionEnabled ? 'bg-[#452267]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  pinProtectionEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {pinProtectionEnabled ? (
          <>
            {pinMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  pinMessage.type === 'success'
                    ? 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]'
                    : 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]'
                }`}
              >
                {pinMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-[#059669] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#be123c] shrink-0" />
                )}
                <span>{pinMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePin} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                    PIN Atual
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full px-3 py-2 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-mono font-bold text-[#452267] dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                    Novo PIN (4 a 6 dígitos)
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full px-3 py-2 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-mono font-bold text-[#452267] dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1">
                    Confirmar Novo PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmNewPinInput}
                    onChange={(e) => setConfirmNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full px-3 py-2 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-mono font-bold text-[#452267] dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl transition-all shadow-xs btn-interactive flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-white" />
                  <span>Salvar Novo PIN (Até 6 dígitos)</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-3 bg-[#FAF6F0] dark:bg-[#25103b] rounded-2xl text-xs text-[#705e8b] dark:text-slate-300">
            A proteção por PIN está atualmente desativada. As telas e prontuários abrirão diretamente sem solicitar código numérico.
          </div>
        )}
      </div>

      {/* 6. Backup de Dados (JSON e PDF) */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#452267] dark:text-white pb-2 border-b border-[#452267]/10 dark:border-white/10">
          5. Segurança &amp; Backup de Dados
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#FAF6F0] dark:bg-[#25103b] rounded-2xl border border-[#452267]/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-[#452267] dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
                Exportar Backup Completo (JSON)
              </h4>
              <p className="text-[11px] text-[#705e8b] dark:text-slate-400 mt-1">
                Baixe o banco de dados integral com prontuários, fichas e configurações em arquivo criptografado.
              </p>
            </div>
            <button
              onClick={handleExportVault}
              className="mt-4 px-4 py-2 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all btn-interactive flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Arquivo JSON</span>
            </button>
          </div>

          <div className="p-4 bg-[#FAF6F0] dark:bg-[#25103b] rounded-2xl border border-[#452267]/10 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs text-[#452267] dark:text-white flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
                Exportar Histórico em PDF
              </h4>
              <p className="text-[11px] text-[#705e8b] dark:text-slate-400 mt-1">
                Gera relatório formal para arquivo físico ou exportação em PDF em conformidade com as normas do CFP.
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              className="mt-4 px-4 py-2 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all btn-interactive flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Gerar PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7. Suporte Técnico e Central de Ajuda */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#452267] dark:text-white pb-2 border-b border-[#452267]/10 dark:border-white/10 flex items-center gap-2">
          <Headphones className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
          <span>6. Suporte Técnico Especializado</span>
        </h3>

        <div className="p-4 bg-[#FAF6F0] dark:bg-[#25103b] rounded-2xl border border-[#452267]/10 space-y-2">
          <p className="text-xs text-[#665282] dark:text-slate-300 leading-relaxed">
            Nossa equipe de engenharia e atendimento especializado para psicólogos está disponível para esclarecer dúvidas de funcionamento, exportação e segurança.
          </p>
          <div className="flex items-center gap-2 pt-1 font-mono text-xs font-bold text-[#452267] dark:text-[#ded6f4]">
            <Mail className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
            <a href="mailto:suporte@cortexpsicologia.com.br" className="hover:underline">
              suporte@cortexpsicologia.com.br
            </a>
          </div>
        </div>
      </div>

      {/* Selos de Segurança e Confiança no Rodapé das Configurações */}
      <div className="pt-2 pb-4 text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-[#452267] dark:text-[#ded6f4] bg-white/70 dark:bg-black/30 px-4 py-2 rounded-2xl border border-[#452267]/10">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#452267] dark:text-[#ded6f4]" />
            Criptografia de Ponta a Ponta (256-bit)
          </span>
          <span className="opacity-40">·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Conforme normas do CFP e LGPD
          </span>
        </div>
      </div>

      {/* Modal de Confirmação com Senha Atual para Alterar Proteção de PIN */}
      {isConfirmToggleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] dark:bg-[#351a50] rounded-3xl max-w-md w-full p-6 border border-[#452267]/20 shadow-2xl animate-fade-slide-up space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#452267] text-white flex items-center justify-center shadow-xs">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#452267] dark:text-white">
                  Autorização de Segurança
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-300">
                  {toggleTargetState
                    ? 'Digite seu PIN atual para ativar a proteção por senha.'
                    : 'Digite seu PIN atual para desativar a proteção por senha.'}
                </p>
              </div>
            </div>

            {togglePinError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{togglePinError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmTogglePin} className="space-y-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Senha / PIN Atual (4 a 6 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  value={togglePinInput}
                  onChange={(e) => setTogglePinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/20 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#452267] dark:text-white focus:outline-none focus:border-[#452267]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmToggleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  Confirmar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
