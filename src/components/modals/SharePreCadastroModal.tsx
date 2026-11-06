import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface SharePreCadastroModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
}

export const SharePreCadastroModal: React.FC<SharePreCadastroModalProps> = ({
  isOpen,
  onClose,
  patientName,
}) => {
  const { showToast, settings } = useClinic();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicLink = `${window.location.origin}/?precadastro=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    showToast('Link de pré-cadastro copiado com sucesso!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const greetingName = patientName ? `Olá, ${patientName}!` : 'Olá!';
  const whatsappMessage = encodeURIComponent(
    `${greetingName} Para agilizar seu cadastro inicial no consultório de Psicologia da ${settings.psychologistName}, por favor preencha seus dados básicos através deste link seguro:\n\n${publicLink}\n\nSeus dados são protegidos por sigilo profissional (CFP/LGPD).`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFFFF] dark:bg-[#351a50] rounded-3xl max-w-md w-full border border-[#452267]/15 dark:border-[#ded6f4]/20 shadow-2xl p-6 sm:p-7 space-y-5 animate-fade-slide-up text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#452267]/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#452267] text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#452267] dark:text-white">
                Compartilhar Link de Pré-Cadastro
              </h3>
              <span className="text-[11px] text-[#705e8b] dark:text-slate-400">
                Formulário isolado para preenchimento em casa
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#452267] dark:hover:text-white rounded-xl hover:bg-[#FAF6F0] dark:hover:bg-[#25103b] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Security Callout */}
        <div className="p-3.5 bg-[#FAF6F0] dark:bg-[#25103b] rounded-2xl border border-[#452267]/10 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#452267] dark:text-[#ded6f4]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacidade &amp; Sigilo Total</span>
          </div>
          <p className="text-[11px] text-[#665282] dark:text-slate-300 leading-relaxed">
            O paciente terá acesso <strong>exclusivamente</strong> ao formulário com seus dados pessoais básicos. Prontuários, anotações de evolução e dados confidenciais do consultório nunca são exibidos.
          </p>
        </div>

        {/* Link Input Box */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-[#452267] dark:text-white uppercase tracking-wider">
            Link Exclusivo de Cadastro
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicLink}
              className="flex-1 px-3 py-2.5 bg-[#FAF6F0] dark:bg-[#25103b] border border-[#452267]/15 dark:border-[#ded6f4]/20 rounded-xl font-mono text-[11px] text-[#452267] dark:text-slate-200 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer btn-interactive ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#452267] hover:opacity-90 text-white shadow-xs'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs btn-interactive"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Enviar no WhatsApp</span>
          </a>

          <a
            href={publicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-[#FAF6F0] hover:bg-[#ede5d8] dark:bg-[#25103b] dark:hover:bg-[#2f144b] border border-[#452267]/15 dark:border-[#ded6f4]/20 text-[#452267] dark:text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs btn-interactive"
          >
            <ExternalLink className="w-4 h-4 text-[#452267] dark:text-[#ded6f4]" />
            <span>Visualizar Página</span>
          </a>
        </div>
      </div>
    </div>
  );
};
