import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types/clinic';
import { formatDateBR } from '../../utils/dateUtils';
import { PatientAvatar } from '../common/PatientAvatar';
import { SharePreCadastroModal } from '../modals/SharePreCadastroModal';
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Filter,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Calendar,
  X,
  SlidersHorizontal,
  Share2,
} from 'lucide-react';

interface PatientDirectoryProps {
  onOpenNewPatientModal: () => void;
  onSelectPatient: (patientId: string) => void;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({
  onOpenNewPatientModal,
  onSelectPatient,
}) => {
  const { patients, settings } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSharePreCadastroOpen, setIsSharePreCadastroOpen] = useState(false);

  // E-commerce style collapsible filter panel
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Multi-select / checkbox filters
  const [selectedCadences, setSelectedCadences] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'alphabetical'>('recent');

  const toggleCadence = (val: string) => {
    setSelectedCadences((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const toggleStatus = (val: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const toggleModality = (val: string) => {
    setSelectedModalities((prev) =>
      prev.includes(val) ? prev.filter((m) => m !== val) : [...prev, val]
    );
  };

  const clearAllFilters = () => {
    setSelectedCadences([]);
    setSelectedStatuses([]);
    setSelectedModalities([]);
    setSearchTerm('');
    setSortOrder('recent');
  };

  const filteredPatients = patients
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.obs && p.obs.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.phone && p.phone.includes(searchTerm));

      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(p.status);

      const matchesCadence =
        selectedCadences.length === 0 || selectedCadences.includes(p.cadence);

      const matchesModality =
        selectedModalities.length === 0 || selectedModalities.includes(p.preferredModality);

      return matchesSearch && matchesStatus && matchesCadence && matchesModality;
    })
    .sort((a, b) => {
      if (sortOrder === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === 'recent') {
        return (b.startDate || '').localeCompare(a.startDate || '');
      }
      return (a.startDate || '').localeCompare(b.startDate || '');
    });

  const activeFilterCount =
    selectedCadences.length + selectedStatuses.length + selectedModalities.length;

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* Top Header Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#452267] dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#452267] dark:text-[#ded6f4]" />
            Prontuários &amp; Fichas de Pacientes
          </h2>
          <p className="text-xs text-[#665282] dark:text-slate-300 mt-1">
            Gestão de atendimentos, cadernos individuais, documentos e prontuários sigilosos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsSharePreCadastroOpen(true)}
            className="px-4 py-2.5 bg-[#FAF6F0] hover:bg-[#ede5d8] dark:bg-[#25103b] dark:hover:bg-[#2f144b] border border-[#452267]/15 dark:border-[#ded6f4]/20 text-[#452267] dark:text-white text-xs font-bold rounded-2xl shadow-2xs btn-interactive flex items-center gap-2 cursor-pointer"
            title="Gerar link externo para o paciente preencher seu cadastro básico"
          >
            <Share2 className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
            <span>Compartilhar Link de Cadastro</span>
          </button>

          <button
            onClick={onOpenNewPatientModal}
            className="px-5 py-2.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl shadow-md shadow-[#452267]/20 btn-interactive flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Paciente</span>
          </button>
        </div>
      </div>

      {/* Main Layout: E-Commerce Style Collapsible Filters on Left / Top + Patient Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Collapsible Filter Panel (Padrão de Lojas Virtuais) */}
        <div className="lg:col-span-1">
          <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-[#452267]/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
                <h3 className="text-xs font-bold text-[#452267] dark:text-white uppercase tracking-wider">
                  Filtros &amp; Ordenação
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="text-[#452267] dark:text-[#ded6f4] p-1 rounded-lg hover:bg-[#FAF6F0] dark:hover:bg-[#25103b] cursor-pointer"
              >
                {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {isFilterOpen && (
              <div className="space-y-5 animate-fade-slide-up text-xs">
                {/* Search input inside filters */}
                <div>
                  <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1.5">
                    Buscar por Nome ou Dado
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filtrar paciente..."
                      className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#452267]"
                    />
                  </div>
                </div>

                {/* Ordenação */}
                <div>
                  <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase mb-1.5">
                    Ordenar por
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e: any) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 rounded-xl text-xs font-semibold text-[#452267] dark:text-white focus:outline-none"
                  >
                    <option value="recent">Mais Recentes (Início)</option>
                    <option value="oldest">Mais Antigos</option>
                    <option value="alphabetical">Ordem Alfabética (A-Z)</option>
                  </select>
                </div>

                {/* Frequência (Checkboxes) */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase">
                    Frequência das Sessões
                  </span>
                  {[
                    { id: 'semanal', label: 'Semanal' },
                    { id: 'quinzenal', label: 'Quinzenal' },
                    { id: 'avulso', label: 'Avulso / Mensal' },
                  ].map((cad) => (
                    <label key={cad.id} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedCadences.includes(cad.id)}
                        onChange={() => toggleCadence(cad.id)}
                        className="w-4 h-4 rounded text-[#452267] focus:ring-[#452267]"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {cad.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Status (Checkboxes) */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase">
                    Status do Paciente
                  </span>
                  {[
                    { id: 'ativo', label: 'Em Acompanhamento Ativo' },
                    { id: 'pausa', label: 'Em Pausa' },
                    { id: 'alta', label: 'Alta Terapêutica' },
                  ].map((st) => (
                    <label key={st.id} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(st.id)}
                        onChange={() => toggleStatus(st.id)}
                        className="w-4 h-4 rounded text-[#452267] focus:ring-[#452267]"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {st.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Modalidade (Checkboxes) */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase">
                    Modalidade
                  </span>
                  {[
                    { id: 'presencial', label: 'Presencial (Consultório)' },
                    { id: 'online', label: 'Teleconsulta Online' },
                  ].map((mod) => (
                    <label key={mod.id} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedModalities.includes(mod.id)}
                        onChange={() => toggleModality(mod.id)}
                        className="w-4 h-4 rounded text-[#452267] focus:ring-[#452267]"
                      />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        {mod.label}
                      </span>
                    </label>
                  ))}
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpar Todos os Filtros ({activeFilterCount})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Patients Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#665282] dark:text-slate-300 px-1">
            <span className="font-semibold">
              Exibindo {filteredPatients.length} de {patients.length} pacientes
            </span>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-12 text-center shadow-xs">
              <Users className="w-10 h-10 text-[#452267] dark:text-[#ded6f4] mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-bold text-[#452267] dark:text-white">
                Nenhum paciente encontrado com esses filtros
              </h4>
              <p className="text-xs text-[#8675a3] dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Tente redefinir os filtros de frequência e status ou cadastre um novo paciente.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-[#FAF6F0] text-[#452267] text-xs font-bold rounded-xl border border-[#452267]/15 hover:bg-[#ede5d8] transition-all cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <PatientAvatar avatar={patient.avatar} name={patient.name} size="md" />
                        <div>
                          <h4
                            onClick={() => onSelectPatient(patient.id)}
                            className={`text-sm font-bold text-[#452267] dark:text-white hover:underline cursor-pointer ${
                              settings.privacyMode && settings.privacyPreferences?.hidePatientNames
                                ? 'privacy-blur'
                                : ''
                            }`}
                          >
                            {patient.name}
                          </h4>
                          <div className="text-[11px] text-[#8675a3] dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="capitalize">{patient.cadence}</span>
                            <span>·</span>
                            <span className="capitalize">{patient.preferredModality}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                          patient.status === 'ativo'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {patient.status}
                      </span>
                    </div>

                    {/* Obs Preview */}
                    {patient.obs && (
                      <div className="mt-3.5 p-3 bg-[#FAF6F0] dark:bg-[#25103b] rounded-2xl border border-[#452267]/10 text-xs text-[#665282] dark:text-slate-300">
                        <strong className="text-[#452267] dark:text-white block text-[10px] uppercase font-bold mb-0.5">
                          Observações Clínicas:
                        </strong>
                        <span className={`line-clamp-2 leading-relaxed ${settings.privacyMode ? 'privacy-blur' : ''}`}>
                          {patient.obs}
                        </span>
                      </div>
                    )}

                    {/* Meta info: Fee and start date */}
                    <div className="mt-3.5 pt-3 border-t border-[#452267]/10 dark:border-white/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#8675a3] dark:text-slate-400 block font-medium">Honorário Acordado</span>
                        <span className={`font-mono font-bold text-[#452267] dark:text-[#ded6f4] text-xs ${settings.privacyMode && settings.privacyPreferences?.hideFinancialValues ? 'privacy-blur' : ''}`}>
                          R$ {patient.sessionFee.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#8675a3] dark:text-slate-400 block font-medium">Início</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {formatDateBR(patient.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 
                    Action Bar: 
                    "Manter apenas um botão de acesso na lista: 'Ver ficha completa' na cor #452267 (remover botão 'Caderno')."
                  */}
                  <div className="mt-4 pt-3 border-t border-[#452267]/10 dark:border-white/10 flex justify-end">
                    <button
                      onClick={() => onSelectPatient(patient.id)}
                      className="w-full py-2.5 px-4 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#452267]/20 btn-interactive flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Ver ficha completa</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SharePreCadastroModal
        isOpen={isSharePreCadastroOpen}
        onClose={() => setIsSharePreCadastroOpen(false)}
      />
    </div>
  );
};
