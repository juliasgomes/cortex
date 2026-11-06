import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CortexLogo } from '../common/CortexLogo';
import {
  ShieldCheck,
  Mail,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useClinic();

  return (
    <footer className="w-full bg-[#452267] text-white py-5 sm:py-6 border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & CFP Shield */}
          <div className="flex flex-wrap items-center gap-3.5 justify-center md:justify-start">
            <CortexLogo size="sm" variant="light" showWordmark={true} />
            <span className="hidden sm:inline text-white/30">|</span>
            <div className="flex items-center gap-2 text-[11px] text-[#ded6f4]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                CFP &amp; LGPD Compliant
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-white" />
                Criptografia 256-bit
              </span>
            </div>
          </div>

          {/* Direct Institutional Email Support & Settings Shortcut */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a
              href="mailto:suporte@cortexpsicologia.com.br"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-white hover:underline bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 transition-all"
              title="Canal direto de suporte institucional"
            >
              <Mail className="w-3.5 h-3.5 text-[#ded6f4]" />
              <span>suporte@cortexpsicologia.com.br</span>
            </a>

            <button
              onClick={() => setActiveTab('settings')}
              className="text-[11px] text-[#ded6f4] hover:text-white transition-colors cursor-pointer"
            >
              Consultório &amp; Ajustes
            </button>
          </div>
        </div>

        {/* Clean bottom copyright line */}
        <div className="pt-3.5 mt-3.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#ded6f4]/60 gap-1.5">
          <span>
            &copy; {new Date().getFullYear()} Cortex · Psicologia em Equilíbrio. Todos os direitos reservados.
          </span>
          <span className="font-mono">
            Versão 2.5.0
          </span>
        </div>
      </div>
    </footer>
  );
};
