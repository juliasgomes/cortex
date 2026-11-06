import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient, ModalityType } from '../../types/clinic';
import { X, Save, Calendar, Repeat, AlertCircle, Camera, Trash2, Upload } from 'lucide-react';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
}) => {
  const { addPatient, updatePatient, generateRecurringSessions, settings } = useClinic();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [sessionFee, setSessionFee] = useState<number>(settings.defaultFee || 240);
  const [preferredModality, setPreferredModality] = useState<ModalityType>('presencial');
  const [cadence, setCadence] = useState<'semanal' | 'quinzenal' | 'avulso'>('semanal');
  const [preferredWeekday, setPreferredWeekday] = useState<number>(2); // 2 = Terça
  const [preferredTime, setPreferredTime] = useState('14:00');
  const [shouldAutoGenerateSessions, setShouldAutoGenerateSessions] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ativo' | 'pausa' | 'alta'>('ativo');
  const [obs, setObs] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (patientToEdit) {
      setName(patientToEdit.name);
      setAvatar(patientToEdit.avatar || '');
      setSessionFee(patientToEdit.sessionFee);
      setPreferredModality(patientToEdit.preferredModality);
      setCadence(patientToEdit.cadence);
      setPreferredWeekday(patientToEdit.preferredWeekday ?? 2);
      setPreferredTime(patientToEdit.preferredTime || '14:00');
      setEmail(patientToEdit.email);
      setPhone(patientToEdit.phone);
      setStatus(patientToEdit.status);
      setObs(patientToEdit.obs || '');
      setEmergencyName(patientToEdit.emergencyContact?.name || '');
      setEmergencyPhone(patientToEdit.emergencyContact?.phone || '');
      setEmergencyRelation(patientToEdit.emergencyContact?.relation || '');
      setShouldAutoGenerateSessions(patientToEdit.cadence !== 'avulso');
      setErrorMessage(null);
    } else {
      setName('');
      setAvatar('');
      setSessionFee(settings.defaultFee || 240);
      setPreferredModality('presencial');
      setCadence('semanal');
      setPreferredWeekday(2);
      setPreferredTime('14:00');
      setEmail('');
      setPhone('');
      setStatus('ativo');
      setObs('');
      setEmergencyName('');
      setEmergencyPhone('');
      setEmergencyRelation('');
      setShouldAutoGenerateSessions(true);
      setErrorMessage(null);
    }
  }, [patientToEdit, isOpen, settings.defaultFee]);

  if (!isOpen) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Por favor, informe o nome do paciente.');
      return;
    }

    if (patientToEdit) {
      const updated: Patient = {
        ...patientToEdit,
        name: name.trim(),
        avatar: avatar.trim(),
        sessionFee: Number(sessionFee),
        preferredModality,
        cadence,
        preferredWeekday,
        preferredTime,
        email,
        phone,
        status,
        obs,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation,
        },
      };
      updatePatient(updated);

      if (shouldAutoGenerateSessions && cadence !== 'avulso') {
        generateRecurringSessions(patientToEdit.id, 8, updated);
      }
    } else {
      const added = addPatient({
        name: name.trim(),
        avatar: avatar.trim() || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
        sessionFee: Number(sessionFee),
        preferredModality,
        cadence,
        preferredWeekday,
        preferredTime,
        email,
        phone,
        status,
        startDate: new Date().toISOString().split('T')[0],
        obs,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation,
        },
      });

      if (shouldAutoGenerateSessions && cadence !== 'avulso' && added) {
        generateRecurringSessions(added.id, 8, added);
      }
    }

    onClose();
  };

  const weekdaysList = [
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1f1535] rounded-3xl max-w-xl w-full border border-[#ece4f6] dark:border-[#3d2b63] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-800 dark:text-[#ede8f8]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#faf8fd] dark:bg-[#251940] border-b border-[#ece4f6] dark:border-[#3d2b63] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {patientToEdit ? 'Editar Ficha do Paciente' : 'Cadastrar Novo Paciente'}
            </h3>
            <p className="text-xs text-[#705e8b] dark:text-slate-400">
              Configure foto, valor da sessão, frequência na agenda e observações clínicas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8675a3] hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="px-6 py-2.5 bg-[#fff1f2] dark:bg-[#3d1222] border-b border-[#fecdd3] text-xs text-[#be123c] dark:text-rose-300 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Avatar Picture Section */}
          <div className="p-4 bg-[#faf5ec] dark:bg-[#281b45] rounded-2xl border border-[#e8dfd2] dark:border-[#3d2b63] flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-[#1f1535] border-2 border-[#452267]/40 shrink-0 flex items-center justify-center font-bold text-xl text-slate-800 dark:text-white shadow-xs">
              {avatar ? (
                <img src={avatar} alt="Foto do paciente" className="w-full h-full object-cover" />
              ) : (
                <span>{name ? name.charAt(0).toUpperCase() : '?'}</span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <span className="block text-[11px] font-bold text-slate-800 dark:text-white uppercase">
                Foto de Perfil do Paciente
              </span>
              <p className="text-[10px] text-[#705e8b] dark:text-slate-400">
                Adicione uma imagem real do paciente ou mantenha a inicial do nome.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
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
                  className="px-3 py-1.5 bg-white dark:bg-[#1f1535] hover:bg-[#ded6f4]/40 dark:hover:bg-[#342258] border border-[#e8dfd2] dark:border-[#3d2b63] rounded-xl text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#452267]" />
                  <span>Trocar Foto</span>
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-1.5 bg-white dark:bg-[#1f1535] hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Foto</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name & Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-800 dark:text-white uppercase mb-1">
                Nome do Paciente *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Ex: Clara Albuquerque"
                className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-white uppercase mb-1">
                Valor da Sessão (R$) *
              </label>
              <input
                type="number"
                value={sessionFee}
                onChange={(e) => setSessionFee(Number(e.target.value))}
                min={0}
                step={10}
                className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs font-mono font-bold text-[#047857] dark:text-emerald-400 focus:outline-none focus:border-[#452267]"
                required
              />
            </div>
          </div>

          {/* Recurrence & Scheduling Cadence */}
          <div className="p-4 bg-[#faf5ec] dark:bg-[#281b45] rounded-2xl border border-[#e8dfd2] dark:border-[#3d2b63] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
              <Repeat className="w-4 h-4 text-[#452267]" />
              <span>Frequência e Horário Fixo dos Atendimentos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[#705e8b] dark:text-slate-400 font-bold uppercase mb-1">
                  Periodicidade
                </label>
                <select
                  value={cadence}
                  onChange={(e) => setCadence(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1f1535] border border-[#e8dfd2] dark:border-[#3d2b63] rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
                >
                  <option value="semanal">Semanal (Toda semana)</option>
                  <option value="quinzenal">Quinzenal (A cada 15 dias)</option>
                  <option value="avulso">Avulso (Esporádico)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#705e8b] dark:text-slate-400 font-bold uppercase mb-1">
                  Dia da Semana Fixo
                </label>
                <select
                  value={preferredWeekday}
                  onChange={(e) => setPreferredWeekday(Number(e.target.value))}
                  disabled={cadence === 'avulso'}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1f1535] border border-[#e8dfd2] dark:border-[#3d2b63] disabled:opacity-50 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
                >
                  {weekdaysList.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#705e8b] dark:text-slate-400 font-bold uppercase mb-1">
                  Horário Fixo
                </label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  disabled={cadence === 'avulso'}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1f1535] border border-[#e8dfd2] dark:border-[#3d2b63] disabled:opacity-50 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
                />
              </div>
            </div>

            {cadence !== 'avulso' && (
              <label className="flex items-center gap-2 pt-1 text-xs text-slate-800 dark:text-[#ded6f4] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={shouldAutoGenerateSessions}
                  onChange={(e) => setShouldAutoGenerateSessions(e.target.checked)}
                  className="rounded text-slate-800 focus:ring-[#452267] w-4 h-4 cursor-pointer"
                />
                <span>
                  {cadence === 'quinzenal'
                    ? 'Agendar automaticamente sessões quinzenais (a cada 15 dias) na agenda'
                    : 'Gerar e preencher automaticamente sessões na agenda para as próximas 8 semanas'}
                </span>
              </label>
            )}
          </div>

          {/* Modality & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-white uppercase mb-1">
                Modalidade Preferida
              </label>
              <select
                value={preferredModality}
                onChange={(e) => setPreferredModality(e.target.value as ModalityType)}
                className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
              >
                <option value="presencial">Presencial no Consultório</option>
                <option value="online">Teleconsulta Online</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-white uppercase mb-1">
                Status Clínico
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
              >
                <option value="ativo">Ativo (Em acompanhamento)</option>
                <option value="pausa">Em Pausa</option>
                <option value="alta">Alta Concluída</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-white uppercase mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 dark:text-white uppercase mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@email.com"
                className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 bg-[#faf5ec] dark:bg-[#281b45] rounded-2xl border border-[#e8dfd2] dark:border-[#3d2b63] space-y-2.5">
            <span className="block font-bold text-xs text-slate-800 dark:text-white">
              Contato de Emergência
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-[#705e8b] dark:text-slate-400 font-medium mb-0.5">Nome</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Ex: Mariana Silveira"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#1f1535] border border-[#e8dfd2] dark:border-[#3d2b63] rounded-lg text-xs text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#705e8b] dark:text-slate-400 font-medium mb-0.5">Telefone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="(11) 99999-0000"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#1f1535] border border-[#e8dfd2] dark:border-[#3d2b63] rounded-lg text-xs font-mono text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#705e8b] dark:text-slate-400 font-medium mb-0.5">Vínculo</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="Ex: Cônjuge / Mãe"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#1f1535] border border-[#e8dfd2] dark:border-[#3d2b63] rounded-lg text-xs text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Single Observações (Obs) field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-800 dark:text-white uppercase mb-1">
              Observações Clínicas (Obs)
            </label>
            <textarea
              rows={3}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Observações gerais sobre o paciente, preferências, acordos..."
              className="w-full px-3 py-2 bg-[#faf8fd] dark:bg-[#281b45] border border-[#ece4f6] dark:border-[#3d2b63] rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ece4f6] dark:border-[#3d2b63] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#705e8b] dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#452267] dark:bg-[#3d2b63] hover:opacity-90 dark:hover:bg-[#4d377d] text-white text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 text-[#ded6f4]" />
              <span>{patientToEdit ? 'Salvar Alterações' : 'Salvar Paciente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
