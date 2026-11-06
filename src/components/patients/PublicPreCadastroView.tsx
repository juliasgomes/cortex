import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CortexLogo } from '../common/CortexLogo';
import {
  User,
  Calendar,
  Phone,
  Mail,
  Home,
  ShieldCheck,
  CheckCircle2,
  Lock,
  HeartPulse,
  Send,
  AlertCircle,
  Building,
} from 'lucide-react';
import { ModalityType } from '../../types/clinic';

export const PublicPreCadastroView: React.FC = () => {
  const { addPatient, settings, currentUser, showToast } = useClinic();

  // Dynamic psychologist profile details
  const professionalName = settings.psychologistName || currentUser?.name || 'Dra. Helena Vance';
  const professionalCrp = settings.crp || currentUser?.crp || '06/142981';
  const professionalSpecialty = settings.specialty || 'Psicologia Clínica & TCC';
  const professionalContact = settings.officeAddress || 'São Paulo - SP';

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [address, setAddress] = useState('');
  const [preferredModality, setPreferredModality] = useState<ModalityType>('presencial');
  const [preferredWeekday, setPreferredWeekday] = useState<number>(1);
  const [preferredPeriod, setPreferredPeriod] = useState<string>('tarde');
  const [reasonForCare, setReasonForCare] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios marcados com (*).');
      return;
    }

    setIsSubmitting(true);

    try {
      addPatient({
        name: name.trim(),
        avatar: '',
        email: email.trim(),
        phone: phone.trim(),
        emergencyContact: {
          name: emergencyName.trim() || 'A definir',
          phone: emergencyPhone.trim() || phone.trim(),
          relation: emergencyRelation.trim() || 'Contato pessoal',
        },
        sessionFee: settings.defaultFee || 240,
        preferredModality,
        cadence: 'semanal',
        preferredWeekday: Number(preferredWeekday),
        preferredTime: preferredPeriod === 'manha' ? '09:00' : preferredPeriod === 'tarde' ? '15:00' : '18:00',
        status: 'ativo',
        startDate: new Date().toISOString().split('T')[0],
        obs: `[Pré-cadastro do Paciente] Data de Nascimento: ${birthDate || 'Não informada'}. Endereço: ${address || 'Não informado'}. Preferência: ${preferredPeriod}. Motivo: ${reasonForCare || 'Não informado'}.`,
        healthInfo: {
          healthSummary: reasonForCare.trim() || undefined,
        },
      });

      showToast('Pré-cadastro enviado com sucesso!', 'success');
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage('Ocorreu um erro ao salvar o pré-cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#452267] text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#452267]/30 selection:text-white">
      {/* Top Header with Dynamic Professional Data */}
      <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between py-4 border-b border-white/15 gap-4">
        <div className="flex items-center gap-3">
          <CortexLogo size="md" variant="light" showWordmark={true} />
          <div className="border-l border-white/20 pl-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ded6f4] block">
              Ficha de Pré-Cadastro
            </span>
            <span className="text-xs font-semibold text-white">
              Consultório {professionalName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-white bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Ambiente Seguro CFP &amp; LGPD</span>
        </div>
      </div>

      {/* Main Container: Floating Pure White Card */}
      <main className="w-full max-w-2xl mx-auto my-6 flex-1 flex flex-col justify-center animate-fade-slide-up">
        {isSubmitted ? (
          <div className="bg-[#FFFFFF] text-slate-800 rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 shadow-2xl border border-white/20 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#452267] tracking-tight">
                Pré-Cadastro Enviado com Sucesso!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Olá, <strong>{name}</strong>! Seus dados foram recebidos com segurança pelo consultório de{' '}
                <strong>{professionalName}</strong> ({professionalCrp}). Entraremos em contato em breve para confirmar a data e o horário da sua primeira sessão.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto text-left space-y-1">
              <div className="flex items-center gap-2 font-bold text-[#452267]">
                <Lock className="w-3.5 h-3.5 text-[#452267]" />
                <span>Garantia de Sigilo Clínico</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Suas informações são tratadas sob estrito sigilo profissional, conforme as resoluções do Conselho Federal de Psicologia (CFP) e a LGPD.
              </p>
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setName('');
                setPhone('');
                setEmail('');
                setReasonForCare('');
              }}
              className="px-6 py-2.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Preencher Novo Formulário
            </button>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] text-slate-800 rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 shadow-2xl border border-white/20 space-y-6">
            {/* Professional Welcome Banner with Dynamic Account Data */}
            <div className="border-b border-slate-200 pb-5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#452267] block">
                Atendimento Psicológico Especializado
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {professionalName}
              </h1>
              <p className="text-xs text-slate-500">
                {professionalSpecialty} · CRP {professionalCrp}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Preencha os campos abaixo para dar início ao seu atendimento clínico com total confidencialidade.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Personal Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <User className="w-3.5 h-3.5 text-[#452267]" />
                  <span>1. Dados Pessoais</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Endereço / Cidade
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: São Paulo - SP ou Bairro, Cidade"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <HeartPulse className="w-3.5 h-3.5 text-[#452267]" />
                  <span>2. Contato de Confiança / Emergência</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Nome do Contato
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Ex: Maria (Mãe/Esposo)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="(11) 98888-0000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Parentesco / Vínculo
                    </label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="Ex: Cônjuge, Pai, Amigo"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Calendar className="w-3.5 h-3.5 text-[#452267]" />
                  <span>3. Preferências de Atendimento</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Modalidade
                    </label>
                    <select
                      value={preferredModality}
                      onChange={(e) => setPreferredModality(e.target.value as ModalityType)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] cursor-pointer"
                    >
                      <option value="presencial">Presencial (Consultório)</option>
                      <option value="online">Online (Videochamada)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Melhor Dia da Semana
                    </label>
                    <select
                      value={preferredWeekday}
                      onChange={(e) => setPreferredWeekday(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] cursor-pointer"
                    >
                      <option value={1}>Segunda-feira</option>
                      <option value={2}>Terça-feira</option>
                      <option value={3}>Quarta-feira</option>
                      <option value={4}>Quinta-feira</option>
                      <option value={5}>Sexta-feira</option>
                      <option value={6}>Sábado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Turno Preferencial
                    </label>
                    <select
                      value={preferredPeriod}
                      onChange={(e) => setPreferredPeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#452267] cursor-pointer"
                    >
                      <option value="manha">Manhã (08h às 12h)</option>
                      <option value="tarde">Tarde (13h às 18h)</option>
                      <option value="noite">Noite (18h às 21h)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reason for care */}
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Motivo da Busca por Terapia (Breve resumo)
                </label>
                <textarea
                  rows={3}
                  value={reasonForCare}
                  onChange={(e) => setReasonForCare(e.target.value)}
                  placeholder="Se desejar, descreva resumidamente o que te motivou a buscar atendimento psicológico neste momento..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#452267] focus:bg-white"
                />
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-[#452267] hover:opacity-90 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-[#452267]/20 flex items-center justify-center gap-2 cursor-pointer btn-interactive"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enviando com Segurança...' : 'Enviar Pré-Cadastro ao Consultório'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto py-4 border-t border-white/15 text-center text-[11px] text-[#ded6f4]/80">
        <p>
          Consultório de Psicologia {professionalName} · CRP {professionalCrp} · {professionalContact}
        </p>
        <p className="text-[10px] text-white/50 mt-1">
          &copy; {new Date().getFullYear()} Cortex · Gestão Clínica &amp; Psicologia em Equilíbrio
        </p>
      </footer>
    </div>
  );
};
