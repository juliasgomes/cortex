import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatDateBR } from '../../utils/dateUtils';
import {
  FolderOpen,
  FileText,
  Search,
  Plus,
  Printer,
  Copy,
  Check,
  Download,
  Share2,
  ChevronRight,
  ShieldCheck,
  Edit3,
  Eye,
  Save,
  ArrowLeft,
  X,
  FileCheck,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Patient } from '../../types/clinic';

interface ClinicalDocTemplate {
  id: string;
  folderId: string;
  title: string;
  category: string;
  resolution?: string;
  description: string;
  lastUpdated: string;
  content: string;
}

export const DocumentsView: React.FC = () => {
  const { patients, settings, showToast } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ClinicalDocTemplate | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Folders organization
  const folders = [
    {
      id: 'declaracoes',
      title: 'Declarações & Atestados',
      sublabel: 'Comparecimento, faltas justificadas e atestados',
      count: 3,
      iconColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200',
    },
    {
      id: 'contratos',
      title: 'Contratos & Termos',
      sublabel: 'Contrato terapêutico, TCLE e termos para atendimento online',
      count: 3,
      iconColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200',
    },
    {
      id: 'encaminhamentos',
      title: 'Encaminhamentos & Interconsultas',
      sublabel: 'Psiquiatria, neurologia, clínica médica e nutrição',
      count: 2,
      iconColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200',
    },
    {
      id: 'relatorios',
      title: 'Relatórios & Laudos',
      sublabel: 'Relatório psicológico de evolução e parecer técnico',
      count: 2,
      iconColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200',
    },
  ];

  // Templates library compliant with CFP Resolution 06/2019
  const [templates, setTemplates] = useState<ClinicalDocTemplate[]>([
    {
      id: 'dec-comp',
      folderId: 'declaracoes',
      title: 'Declaração de Comparecimento',
      category: 'Declaração',
      resolution: 'Resolução CFP nº 06/2019 - Art. 9º',
      description: 'Documento comprobatório de presença do paciente em atendimento psicológico.',
      lastUpdated: '06/11/2026',
      content: `DECLARAÇÃO DE COMPARECIMENTO

Declaro, para os devidos fins a pedido da parte interessada, que o(a) Sr.(a) {{PATIENT_NAME}}, portador(a) do documento de identidade, compareceu a este consultório de psicologia na presente data, no período das {{TIME_START}} às {{TIME_END}}, para realização de sessão de atendimento psicoterápico.

Por ser a expressão da verdade, firmo a presente declaração sob os ditames da ética profissional.

{{CITY_DATE}}

___________________________________________________
{{PSYCHOLOGIST_NAME}}
Psicólogo(a) Clínico(a) — {{CRP}}
{{ADDRESS}}`,
    },
    {
      id: 'atestado-psicologico',
      folderId: 'declaracoes',
      title: 'Atestado Psicológico',
      category: 'Atestado',
      resolution: 'Resolução CFP nº 06/2019 - Art. 10º',
      description: 'Atesta condições de saúde psicológica com base em avaliação técnica e fundamentada.',
      lastUpdated: '06/11/2026',
      content: `ATESTADO PSICOLÓGICO

1. IDENTIFICAÇÃO DO PACIENTE:
Nome: {{PATIENT_NAME}}
Data de Nascimento: {{PATIENT_BIRTH}}

2. FINALIDADE:
O presente documento tem por objetivo atestar o acompanhamento psicológico clínico com finalidade de justificar afastamento de atividades rotineiras para reabilitação do equilíbrio psíquico e manejo emocional.

3. DESCRIÇÃO DAS CONDIÇÕES PSICOLÓGICAS:
Atesto, com base na avaliação psicológica e acompanhamento clínico continuado, que o(a) paciente supra-identificado(a) encontra-se sob acompanhamento psicoterápico regular neste serviço, necessitando de repouso e afastamento de suas atividades por um período estimado de 03 (três) dias a contar desta data.

4. CONCLUSÃO:
Em consonância com a Resolução CFP nº 06/2019, o presente documento foi elaborado a partir de princípios éticos, científicos e com a devida fundamentação técnica.

{{CITY_DATE}}

___________________________________________________
{{PSYCHOLOGIST_NAME}}
Psicólogo(a) Clínico(a) — {{CRP}}
{{ADDRESS}}`,
    },
    {
      id: 'dec-acompanhamento',
      folderId: 'declaracoes',
      title: 'Declaração de Acompanhamento Terapêutico',
      category: 'Declaração',
      resolution: 'Resolução CFP nº 06/2019',
      description: 'Comprova vínculo e periodicidade de processo psicoterápico em andamento.',
      lastUpdated: '06/11/2026',
      content: `DECLARAÇÃO DE ACOMPANHAMENTO TERAPÊUTICO

Declaro para os devidos fins que o(a) paciente {{PATIENT_NAME}} realiza acompanhamento psicoterápico continuado neste consultório desde {{START_DATE}}, com frequência semanal e duração de 50 minutos por sessão.

O tratamento tem como objetivo o desenvolvimento de estratégias de enfrentamento, autoconhecimento e regulação emocional, encontrando-se atualmente em fase ativa de evolução.

{{CITY_DATE}}

___________________________________________________
{{PSYCHOLOGIST_NAME}}
Psicólogo(a) Clínico(a) — {{CRP}}
{{ADDRESS}}`,
    },
    {
      id: 'contrato-terapeutico',
      folderId: 'contratos',
      title: 'Contrato Terapêutico de Prestação de Serviços',
      category: 'Contrato',
      resolution: 'Código de Ética Profissional do Psicólogo (CFP)',
      description: 'Estabelece os termos de frequência, honorários, sigilo, faltas e desmarcações.',
      lastUpdated: '06/11/2026',
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOLÓGICOS (ENQUADRE TERAPÊUTICO)

Pelo presente instrumento particular de prestação de serviços psicológicos, de um lado:
PSICÓLOGO(A): {{PSYCHOLOGIST_NAME}}, CRP {{CRP}}, com consultório em {{ADDRESS}}.
PACIENTE: {{PATIENT_NAME}}, telefone {{PATIENT_PHONE}}, e-mail {{PATIENT_EMAIL}}.

Têm entre si, justo e contratado, o seguinte enquadre de atendimento clínico:

1. DO ATENDIMENTO E REGULARIDADE:
1.1 As sessões de psicoterapia terão duração regular de 50 (cinquenta) minutos, ocorrendo com periodicidade semanal no dia e horário previamente combinados entre as partes.

2. DOS HONORÁRIOS E FORMA DE PAGAMENTO:
2.1 O valor acordado por sessão é de R$ {{FEE}},00, a ser quitado mensalmente até o quinto dia útil subsequente ou no término de cada sessão realizada.

3. DAS POLÍTICAS DE FALTAS E CANCELAMENTOS (REGRA DAS 24 HORAS):
3.1 Cancelamentos ou pedidos de remarcação deverão ser comunicados com antecedência mínima de 24 (vinte e quatro) horas. Cancelamentos com prazo inferior ou faltas sem aviso prévio serão cobrados integralmente, haja vista a reserva exclusiva do horário de atendimento.

4. DO SIGILO PROFISSIONAL E LGPD:
4.1 Todas as informações trazidas em sessão são resguardadas por sigilo profissional absoluto, consoante ao Art. 9º do Código de Ética Profissional do Psicólogo e à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

E por estarem em pleno e comum acordo, firmam o presente enquadre.

{{CITY_DATE}}

_________________________________        _________________________________
{{PSYCHOLOGIST_NAME}} (CRP)                {{PATIENT_NAME}} (Paciente)`,
    },
    {
      id: 'termo-online',
      folderId: 'contratos',
      title: 'Termo de Atendimento Psicológico Online',
      category: 'Termo',
      resolution: 'Resolução CFP nº 11/2018',
      description: 'Regulamenta os serviços psicológicos realizados por tecnologias da informação e comunicação.',
      lastUpdated: '06/11/2026',
      content: `TERMO DE CONSENTIMENTO PARA ATENDIMENTO PSICOLÓGICO ONLINE

Em conformidade com as diretrizes da Resolução CFP nº 11/2018, que regulamenta a prestação de serviços psicológicos realizados por meios de tecnologias da informação e da comunicação (TICs):

1. O(A) psicólogo(a) {{PSYCHOLOGIST_NAME}} ({{CRP}}) prestará atendimento por plataforma segura e criptografada de videochamada ao paciente {{PATIENT_NAME}}.
2. O paciente declara estar em ambiente reservado e seguro, resguardando sua própria privacidade e confidencialidade durante a sessão.
3. É expressamente proibida a gravação de áudio, imagem ou tela das sessões por qualquer uma das partes, sob pena de infração ética e legal.

{{CITY_DATE}}

___________________________________________________
{{PSYCHOLOGIST_NAME}} — {{CRP}}`,
    },
    {
      id: 'tcle',
      folderId: 'contratos',
      title: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
      category: 'Termo',
      resolution: 'Código de Ética Profissional',
      description: 'Formalização de esclarecimento sobre a abordagem psicoterapêutica e direitos do paciente.',
      lastUpdated: '06/11/2026',
      content: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)

Eu, {{PATIENT_NAME}}, declaro ter sido devidamente informado(a) sobre a abordagem psicoterapêutica, objetivos do acompanhamento, procedimentos éticos e políticas de confidencialidade conduzidas pelo(a) psicólogo(a) {{PSYCHOLOGIST_NAME}} ({{CRP}}).

Declaro ainda ter tido a oportunidade de sanar todas as dúvidas a respeito do processo terapêutico, manifestando minha livre concordância em dar início aos atendimentos.

{{CITY_DATE}}

___________________________________________________
Assinatura do(a) Paciente`,
    },
    {
      id: 'enc-psiquiatrico',
      folderId: 'encaminhamentos',
      title: 'Encaminhamento para Avaliação Psiquiátrica',
      category: 'Encaminhamento',
      resolution: 'Interconsulta Multiprofissional',
      description: 'Documento confidencial direcionado ao médico psiquiatra para avaliação medicamentosa integrada.',
      lastUpdated: '06/11/2026',
      content: `ENCAMINHAMENTO PARA AVALIAÇÃO PSIQUIÁTRICA

Ao(À) Colega Médico(a) Psiquiatra,

Prezado(a) Colega,

Encaminho para sua avaliação clínica e psiquiátrica o(a) paciente {{PATIENT_NAME}}, em acompanhamento psicoterápico neste consultório.

MOTIVO DO ENCAMINHAMENTO:
O(A) paciente apresenta queixas clínicas relevantes de instabilidade do humor, alterações acentuadas de sono e manifestações somáticas de ansiedade que têm impactado substancialmente sua funcionalidade cotidiana.

SOLICITAÇÃO:
Solicito a gentileza de sua avaliação clínica para ponderação quanto à pertinência de suporte psicofarmacológico coadjuvante, visando o alívio sintomático e a potencialização do processo psicoterápico.

Permaneço à disposição para diálogo multiprofissional e alinhamento conjunto do caso.

Cordialmente,

{{CITY_DATE}}

___________________________________________________
{{PSYCHOLOGIST_NAME}}
Psicólogo(a) Clínico(a) — {{CRP}}
Telefone de Contato: (11) 98765-4321`,
    },
    {
      id: 'enc-neuro',
      folderId: 'encaminhamentos',
      title: 'Encaminhamento para Avaliação Neuropsicológica',
      category: 'Encaminhamento',
      resolution: 'Interconsulta Especializada',
      description: 'Encaminhamento para investigação de funções executivas, atenção e memória.',
      lastUpdated: '06/11/2026',
      content: `ENCAMINHAMENTO PARA AVALIAÇÃO NEUROPSICOLÓGICA

Ao(À) Especialista em Neuropsicologia,

Encaminho o(a) paciente {{PATIENT_NAME}} para avaliação das funções executivas, atenção sustentada, flexibilidade cognitiva e memória de trabalho, com vistas a subsidiar o diagnóstico diferencial e planejamento terapêutico.

{{CITY_DATE}}

___________________________________________________
{{PSYCHOLOGIST_NAME}} — {{CRP}}`,
    },
    {
      id: 'relatorio-psicologico',
      folderId: 'relatorios',
      title: 'Relatório Psicológico de Evolução',
      category: 'Relatório',
      resolution: 'Resolução CFP nº 06/2019 - Art. 11º',
      description: 'Apresenta a síntese da demanda, processo e evolução terapêutica em estrutura técnica oficial.',
      lastUpdated: '06/11/2026',
      content: `RELATÓRIO PSICOLÓGICO

1. IDENTIFICAÇÃO:
Autor(a): {{PSYCHOLOGIST_NAME}} ({{CRP}})
Interessado(a): {{PATIENT_NAME}}
Assunto: Síntese de Evolução Psicoterápica

2. DESCRIÇÃO DA DEMANDA:
O(A) paciente buscou atendimento psicológico queixando-se de dificuldades na regulação do afeto, crises agudas de ansiedade situacional e padrões disfuncionais de autocobrança.

3. PROCEDIMENTO:
Foram realizadas sessões semanais de psicoterapia baseadas em princípios científicos e éticos, empregando técnicas de intervenção e observação clínica.

4. ANÁLISE E EVOLUÇÃO:
Durante o percurso, o(a) paciente demonstrou excelente aliança terapêutica, expandindo sua autopercepção emocional e reduzindo a intensidade das reações ansiosas frente aos estressores rotineiros.

5. CONCLUSÃO:
Recomenda-se a continuidade do acompanhamento psicoterápico semanal para consolidação dos ganhos funcionais obtidos.

{{CITY_DATE}}

___________________________________________________
{{PSYCHOLOGIST_NAME}} — {{CRP}}`,
    },
  ]);

  const activePatient: Patient | undefined = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Helper to substitute placeholders with real patient and clinic settings
  const getProcessedContent = (rawContent: string): string => {
    const todayStr = formatDateBR(new Date().toISOString().split('T')[0]);
    const pName = activePatient?.name || '[Nome do Paciente]';
    const pPhone = activePatient?.phone || '[Telefone do Paciente]';
    const pEmail = activePatient?.email || '[E-mail do Paciente]';
    const pFee = String(activePatient?.sessionFee || settings.defaultFee || 240);

    return rawContent
      .replace(/{{PATIENT_NAME}}/g, pName)
      .replace(/{{PATIENT_PHONE}}/g, pPhone)
      .replace(/{{PATIENT_EMAIL}}/g, pEmail)
      .replace(/{{PATIENT_BIRTH}}/g, '15/08/1992')
      .replace(/{{TIME_START}}/g, '14:00')
      .replace(/{{TIME_END}}/g, '14:50')
      .replace(/{{CITY_DATE}}/g, `São Paulo - SP, ${todayStr}`)
      .replace(/{{START_DATE}}/g, activePatient ? formatDateBR(activePatient.startDate) : todayStr)
      .replace(/{{PSYCHOLOGIST_NAME}}/g, settings.psychologistName || 'Dra. Helena Vance')
      .replace(/{{CRP}}/g, settings.crp || 'CRP 06/142980')
      .replace(/{{ADDRESS}}/g, settings.officeAddress || 'Av. Paulista, 1842 - Cj. 72, Bela Vista, São Paulo - SP')
      .replace(/{{FEE}}/g, pFee);
  };

  const handleOpenDoc = (doc: ClinicalDocTemplate) => {
    setSelectedDoc(doc);
    setEditedContent(getProcessedContent(doc.content));
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    showToast('Texto do documento copiado para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveEdit = () => {
    if (!selectedDoc) return;
    showToast('Alterações no documento salvas temporariamente para impressão.', 'success');
    setIsEditing(false);
  };

  // Filter templates
  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder = selectedFolderId ? tpl.folderId === selectedFolderId : true;

    return matchesSearch && matchesFolder;
  });

  return (
    <div className="space-y-6 animate-fade-slide-up w-full">
      {/* 1. Header Banner */}
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-[#ded6f4]/15 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#452267] dark:text-[#ded6f4] uppercase tracking-wider">
              <FolderOpen className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
              <span>Arquivo Clínico &amp; Gestão Documental</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#452267] dark:text-white tracking-tight">
              Documentos &amp; Modelos Oficiais
            </h1>
            <p className="text-xs sm:text-sm text-[#665282] dark:text-slate-300 max-w-2xl leading-relaxed">
              Modelos estruturados em conformidade com as <strong>Resoluções do Conselho Federal de Psicologia (CFP)</strong>. Visualize, personalize com os dados do paciente e exporte diretamente em PDF timbrado.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#FAF6F0] dark:bg-[#25103b] px-3.5 py-2 rounded-2xl border border-[#452267]/15 text-xs font-semibold">
              <span className="text-[#8675a3] dark:text-slate-400">Paciente Vinculado:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  if (selectedDoc) {
                    const pat = patients.find((p) => p.id === e.target.value);
                    if (pat) {
                      setEditedContent(getProcessedContent(selectedDoc.content));
                    }
                  }
                }}
                className="bg-transparent text-[#452267] dark:text-white font-bold focus:outline-none cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id} className="text-slate-800">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Folders Grid Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(isSelected ? null : folder.id)}
              className={`p-4 rounded-3xl border text-left transition-all cursor-pointer btn-interactive flex flex-col justify-between shadow-2xs ${
                isSelected
                  ? 'bg-[#FFFFFF] dark:bg-[#351a50] border-[#452267] dark:border-white ring-2 ring-[#452267]/20 shadow-md'
                  : 'bg-[#FFFFFF] dark:bg-[#351a50] border-[#452267]/10 dark:border-white/10 hover:border-[#452267]/30'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${folder.iconColor} shadow-2xs`}>
                  <FolderOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF6F0] dark:bg-[#25103b] text-[#452267] dark:text-[#ded6f4] border border-[#452267]/10">
                  {folder.count} {folder.count === 1 ? 'modelo' : 'modelos'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-xs text-[#452267] dark:text-white leading-tight">
                  {folder.title}
                </h3>
                <p className="text-[11px] text-[#705e8b] dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                  {folder.sublabel}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#452267]/5 flex items-center justify-between text-[11px] font-semibold text-[#452267] dark:text-[#ded6f4]">
                <span>{isSelected ? 'Pasta ativa' : 'Abrir pasta'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar & Folder Filter Reset */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-white/10 rounded-2xl p-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8675a3] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar modelo de documento, atestado ou contrato..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/10 rounded-xl text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#452267]"
          />
        </div>

        {selectedFolderId && (
          <button
            onClick={() => setSelectedFolderId(null)}
            className="px-3 py-1.5 bg-[#FAF6F0] dark:bg-[#25103b] text-[#452267] dark:text-white text-xs font-bold rounded-xl border border-[#452267]/15 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Ver todas as pastas</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-[#FFFFFF] dark:bg-[#351a50] border border-[#452267]/10 dark:border-white/10 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200">
                  {template.category}
                </span>
                <span className="text-[10px] font-mono text-[#8675a3]">
                  Atualizado em {template.lastUpdated}
                </span>
              </div>

              <h3 className="font-bold text-sm text-[#452267] dark:text-white leading-tight">
                {template.title}
              </h3>

              <p className="text-xs text-[#665282] dark:text-slate-300 leading-relaxed">
                {template.description}
              </p>

              {template.resolution && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{template.resolution}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#452267]/10 dark:border-white/10 flex items-center gap-2">
              <button
                onClick={() => handleOpenDoc(template)}
                className="flex-1 py-2 px-3 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-xs btn-interactive flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar &amp; Editar</span>
              </button>

              <button
                onClick={() => {
                  setSelectedDoc(template);
                  setEditedContent(getProcessedContent(template.content));
                  setTimeout(() => window.print(), 100);
                }}
                className="p-2 bg-[#FAF6F0] hover:bg-[#ede5d8] dark:bg-[#25103b] text-[#452267] dark:text-white rounded-xl border border-[#452267]/15 transition-all cursor-pointer shadow-2xs"
                title="Imprimir / Exportar PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Fullscreen / High-Fidelity Document Viewer & Editor Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-[#FFFFFF] dark:bg-[#351a50] rounded-3xl max-w-4xl w-full border border-[#452267]/15 dark:border-white/10 shadow-2xl flex flex-col h-[90vh] max-h-[850px] overflow-hidden animate-fade-slide-up text-xs">
            {/* Modal Top Bar */}
            <div className="p-4 bg-[#452267] text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight">{selectedDoc.title}</h3>
                    {selectedDoc.resolution && (
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                        CFP Compliant
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#ded6f4] opacity-90">
                    Paciente: {activePatient?.name || 'Geral'} · {settings.psychologistName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isEditing ? 'bg-amber-500 text-white' : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Visualizar' : 'Editar Texto'}</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Copiar texto para colar em outro local"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-white text-[#452267] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs btn-interactive"
                  title="Imprimir ou Salvar em PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-[#452267]" />
                  <span>Imprimir / PDF</span>
                </button>

                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content View / Edit Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F8F5F1] dark:bg-[#25103b] flex justify-center">
              <div className="w-full max-w-2xl bg-white text-slate-800 rounded-2xl border border-[#452267]/15 p-8 sm:p-12 shadow-md space-y-6 min-h-[500px]">
                {/* Formal Letterhead */}
                <div className="border-b border-[#452267]/15 pb-4 text-center space-y-1">
                  <h2 className="text-base font-black tracking-tight text-[#452267]">
                    {settings.psychologistName}
                  </h2>
                  <p className="text-xs font-semibold text-[#665282]">
                    {settings.specialty} · {settings.crp}
                  </p>
                  <p className="text-[11px] text-[#8675a3]">
                    {settings.officeAddress}
                  </p>
                </div>

                {/* Body: Editor or Formatted Sheet */}
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      rows={18}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-4 border border-[#452267]/20 rounded-xl font-serif text-sm leading-relaxed text-slate-800 focus:outline-none focus:border-[#452267]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-[#452267] text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer btn-interactive"
                      >
                        <Save className="w-4 h-4" />
                        <span>Confirmar Alterações</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-serif text-sm sm:text-base leading-relaxed text-[#1a102a] text-justify space-y-4">
                    {editedContent}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print-Only Viewport for Clinical PDF Export */}
      {selectedDoc && (
        <div className="hidden print:block print-only-sheet bg-white text-black p-10 font-serif leading-relaxed">
          <div className="border-b-2 border-black pb-4 text-center mb-8">
            <h1 className="text-xl font-bold uppercase tracking-wide">{settings.psychologistName}</h1>
            <p className="text-sm">{settings.specialty} · {settings.crp}</p>
            <p className="text-xs text-gray-700">{settings.officeAddress}</p>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-loose text-justify">
            {editedContent}
          </div>
        </div>
      )}
    </div>
  );
};
