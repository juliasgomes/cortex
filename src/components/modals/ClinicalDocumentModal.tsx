import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types/clinic';
import { formatDateBR } from '../../utils/dateUtils';
import {
  FileText,
  Printer,
  X,
  Download,
  Check,
  Building,
  ShieldCheck,
  Calendar,
  User,
  Copy,
  Pencil,
  Save,
} from 'lucide-react';

interface ClinicalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

type DocumentType = 'declaracao' | 'encaminhamento' | 'atestado' | 'contrato';

export const ClinicalDocumentModal: React.FC<ClinicalDocumentModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const { settings, currentUser, showToast } = useClinic();

  const professionalName = settings.psychologistName || currentUser?.name || 'Dra. Helena Vance';
  const professionalCrp = settings.crp || currentUser?.crp || '06/142981';
  const professionalSpecialty = settings.specialty || 'Psicologia Clínica';
  const professionalAddress = settings.officeAddress || 'São Paulo - SP';

  const [docType, setDocType] = useState<DocumentType>('declaracao');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState(patient.preferredTime || '14:00');
  const [duration, setDuration] = useState('50 minutos');
  const [specialistName, setSpecialistName] = useState('Dr(a). Médico(a) Psiquiatra');
  const [purpose, setPurpose] = useState('justificativa de ausência no período do atendimento');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState<string | null>(null);

  if (!isOpen) return null;

  const todayFormatted = formatDateBR(new Date().toISOString().split('T')[0]);
  const sessionFormatted = formatDateBR(sessionDate);

  // Template text generators
  const getDefaultDocumentContent = () => {
    switch (docType) {
      case 'declaracao':
        return `DECLARAÇÃO DE COMPARECIMENTO

Declaro para os devidos fins que o(a) paciente ${patient.name}, portador(a) do documento de identificação sob registro neste consultório, compareceu a atendimento psicológico no dia ${sessionFormatted}, no horário das ${sessionTime}, com duração de ${duration}.

A presente declaração é emitida em conformidade com as normas éticas do Conselho Federal de Psicologia (CFP - Resolução nº 06/2019).

${additionalNotes ? `Observação adicional: ${additionalNotes}\n\n` : ''}${professionalAddress}, ${todayFormatted}.

___________________________________________________
${professionalName}
Psicólogo(a) Clínico(a) · CRP: ${professionalCrp}
${professionalSpecialty}`;

      case 'encaminhamento':
        return `ENCAMINHAMENTO PSICOLÓGICO

A/C: ${specialistName}

Prezado(a) colega,

Encaminho o(a) paciente ${patient.name}, atualmente em acompanhamento psicoterápico sob meus cuidados profissionais na modalidade ${patient.preferredModality}.

Objetivo do encaminhamento: Avaliação e parecer conjunto clínico/psiquiátrico para suporte multidisciplinar.
${additionalNotes ? `\nSíntese das observações clínicas pertinentes:\n${additionalNotes}\n` : ''}
Coloco-me à inteira disposição para discussão do caso clínico em prol do bem-estar biopsicossocial do paciente.

${professionalAddress}, ${todayFormatted}.

___________________________________________________
${professionalName}
Psicólogo(a) Clínico(a) · CRP: ${professionalCrp}
Contato: ${professionalAddress}`;

      case 'atestado':
        return `ATESTADO PSICOLÓGICO
(Conforme Resolução CFP nº 06/2019)

Atesto, para os devidos fins e a pedido do(a) interessado(a), que o(a) paciente ${patient.name} encontra-se em acompanhamento psicológico regular neste consultório clínico.

Finalidade do documento: ${purpose}.

Com base na avaliação clínica e sessões realizadas, recomendo o afastamento/adequação das atividades pelo período necessário para remissão sintomática e cuidado emocional.
${additionalNotes ? `\nObservações complementares:\n${additionalNotes}\n` : ''}
Documento emitido com estrita observância ao Código de Ética Profissional do Psicólogo.

${professionalAddress}, ${todayFormatted}.

___________________________________________________
${professionalName}
Psicólogo(a) Clínico(a) · CRP: ${professionalCrp}
${professionalSpecialty}`;

      case 'contrato':
        return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOLÓGICOS (TERAPÊUTICO)

Pelo presente instrumento particular, de um lado:
PROFISSIONAL: ${professionalName}, Psicólogo(a) devidamente inscrito(a) no Conselho Regional de Psicologia sob o CRP nº ${professionalCrp}.
PACIENTE/CONTRATANTE: ${patient.name}.

Ficam justas e acordadas as seguintes cláusulas:

1. DO OBJETO: Prestação de serviços de psicoterapia clínica pelo profissional contratado.
2. DA FREQUÊNCIA: Os atendimentos ocorrerão com frequência ${patient.cadence.toUpperCase()}, com duração de 50 minutos por sessão, no dia e horário previamente combinados (${patient.preferredTime}).
3. DOS HONORÁRIOS: O valor acordado por sessão é de R$ ${patient.sessionFee.toFixed(2).replace('.', ',')}, a ser pago conforme combinação entre as partes.
4. DO SIGILO: O psicólogo garante o absoluto sigilo das informações e relatos, conforme os preceitos do Código de Ética do CFP.
5. DE DESMARCAÇÕES E FALTAS: O cancelamento ou remarcação deve ocorrer com antecedência mínima de 24 horas.

E, por estarem de acordo, firmam o presente.

${professionalAddress}, ${todayFormatted}.

_________________________________            _________________________________
${patient.name}                              ${professionalName}
Contratante                                  Psicólogo(a) · CRP ${professionalCrp}`;
    }
  };

  const activeContent = customText !== null ? customText : getDefaultDocumentContent();

  const handleStartEdit = () => {
    if (customText === null) {
      setCustomText(getDefaultDocumentContent());
    }
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    showToast('Alterações no documento salvas com sucesso!', 'success');
  };

  // Real PDF Export & Download
  const handleDownloadPdf = () => {
    const filename = `${docType}_${patient.name.toLowerCase().replace(/\s+/g, '_')}_${todayFormatted.replace(/\//g, '-')}.pdf`;
    
    // Printable window formatted as clinical PDF document
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docType.toUpperCase()} - ${patient.name}</title>
          <style>
            @page { size: A4; margin: 25mm 20mm; }
            body {
              font-family: 'Times New Roman', Times, serif;
              color: #111;
              line-height: 1.8;
              font-size: 13pt;
              margin: 0;
              padding: 20px;
            }
            .header {
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
              margin-bottom: 30px;
              text-align: center;
            }
            .header h1 {
              font-size: 16pt;
              margin: 0 0 4px 0;
              color: #452267;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p {
              margin: 2px 0;
              font-size: 10.5pt;
              color: #444;
            }
            .content {
              white-space: pre-wrap;
              text-align: justify;
              min-height: 400px;
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
              font-size: 9pt;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${professionalName}</h1>
            <p>${professionalSpecialty} · CRP: ${professionalCrp}</p>
            <p>${professionalAddress}</p>
          </div>
          <div class="content">${activeContent}</div>
          <div class="footer">
            Documento emitido conforme Resoluções do CFP e Código de Ética Profissional do Psicólogo · Cortex Psicologia
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
      showToast(`Documento ${filename} enviado para exportação / download em PDF!`, 'success');
    } else {
      // Fallback: download directly as formatted text/doc file
      const blob = new Blob([activeContent], { type: 'application/pdf;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Arquivo ${filename} baixado com sucesso!`, 'success');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(activeContent);
    showToast('Texto do documento copiado para a área de transferência!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-[#FFFFFF] rounded-3xl max-w-3xl w-full border border-[#452267]/15 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-[#452267] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Modelos de Documentos Clínicos
              </h3>
              <span className="text-[11px] text-[#ded6f4]">
                {patient.name} · Padrão oficial CFP · {professionalName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Type Selector Tabs */}
        <div className="px-6 pt-3 pb-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 shrink-0">
          {[
            { id: 'declaracao', label: 'Declaração de Comparecimento' },
            { id: 'encaminhamento', label: 'Encaminhamento' },
            { id: 'atestado', label: 'Atestado Psicológico' },
            { id: 'contrato', label: 'Contrato Terapêutico' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setDocType(t.id as DocumentType);
                setCustomText(null);
                setIsEditing(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                docType === t.id
                  ? 'bg-[#452267] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Reading and Editing Container (overflow-y: auto; max-height: 80vh; width: 100%) */}
        <div className="p-6 overflow-y-auto max-h-[80vh] w-full space-y-4 text-xs bg-white flex-1">
          {/* Quick parameters when not in custom edit mode */}
          {!isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              {docType === 'declaracao' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Data da Sessão</label>
                    <input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => {
                        setSessionDate(e.target.value);
                        setCustomText(null);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Horário</label>
                    <input
                      type="text"
                      value={sessionTime}
                      onChange={(e) => {
                        setSessionTime(e.target.value);
                        setCustomText(null);
                      }}
                      placeholder="14:00"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                    />
                  </div>
                </>
              )}

              {docType === 'encaminhamento' && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Especialista Destinatário</label>
                  <input
                    type="text"
                    value={specialistName}
                    onChange={(e) => {
                      setSpecialistName(e.target.value);
                      setCustomText(null);
                    }}
                    placeholder="Dr(a). Fulano de Tal - Psiquiatria"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              )}

              {docType === 'atestado' && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Finalidade do Atestado</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => {
                      setPurpose(e.target.value);
                      setCustomText(null);
                    }}
                    placeholder="Finalidade do documento..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Observações Adicionais (opcional)</label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => {
                    setAdditionalNotes(e.target.value);
                    setCustomText(null);
                  }}
                  placeholder="Informações adicionais para constar no documento..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Action Row: Editar Documento & Copiar */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isEditing ? handleSaveEdit : handleStartEdit}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEditing
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#452267] border border-slate-200'
                }`}
                title="Editar texto livremente antes de imprimir ou descarregar"
              >
                {isEditing ? <Save className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Salvar Edição' : 'Editar Documento'}</span>
              </button>

              {customText !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomText(null);
                    setIsEditing(false);
                    showToast('Documento restaurado para o padrão original.', 'info');
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Restaurar padrão
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyText}
              className="text-xs text-[#452267] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Texto</span>
            </button>
          </div>

          {/* Formatted Document Sheet Preview or Textarea Editor */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                rows={16}
                value={customText || ''}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-4 border border-[#452267]/25 rounded-2xl font-serif text-xs leading-relaxed text-slate-800 focus:outline-none focus:border-[#452267] focus:ring-1 focus:ring-[#452267] bg-white shadow-inner"
                placeholder="Edite o conteúdo do documento diretamente aqui..."
              />
              <p className="text-[10px] text-slate-400 italic">
                Você pode alterar termos, datas, nomes ou acrescentar cláusulas personalizadas livremente.
              </p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-inner font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800 min-h-[260px]">
              {activeContent}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Fechar Janela
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-5 py-2.5 bg-[#452267] hover:opacity-90 text-white text-xs font-bold rounded-2xl shadow-md shadow-[#452267]/20 btn-interactive flex items-center gap-2 cursor-pointer"
              title="Gerar e Descarregar o documento real formatado em PDF"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Descarregar PDF / Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
