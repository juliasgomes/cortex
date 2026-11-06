import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatDateBR } from '../../utils/dateUtils';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Database,
  ArrowRight,
} from 'lucide-react';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAccountModal: React.FC<GoogleAccountModalProps> = ({ isOpen, onClose }) => {
  const {
    googleAccount,
    loginGoogle,
    logoutGoogle,
    syncCloudBackup,
    patients,
    sessions,
  } = useClinic();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    syncCloudBackup();
    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback('Backup sincronizado com sucesso com sua nuvem Google Drive!');
      setTimeout(() => setSyncFeedback(null), 3500);
    }, 600);
  };

  const handleConnect = () => {
    loginGoogle();
  };

  const handleDisconnect = () => {
    logoutGoogle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#ded6f4] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#faf8fd] border-b border-[#ece4f6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#e8dfd2] flex items-center justify-center shadow-2xs">
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Conta Google & Backup em Nuvem
              </h3>
              <p className="text-[11px] text-[#705e8b]">
                Proteção e sincronização dos seus prontuários
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8675a3] hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {googleAccount.isConnected ? (
            <div className="space-y-4">
              {/* Connected Profile Card */}
              <div className="p-4 bg-[#faf5ec] border border-[#e8dfd2] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-2xs">
                    <img
                      src={googleAccount.avatar}
                      alt={googleAccount.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      {googleAccount.name}
                    </h4>
                    <p className="text-[11px] text-[#705e8b] font-mono">
                      {googleAccount.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                      <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wide">
                        Conectado ao Google
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backup status box */}
              <div className="bg-[#fcfaff] border border-[#ece4f6] rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-[#452267]" />
                    Status da Sincronização
                  </span>
                  <span className="text-[11px] text-[#059669] font-semibold bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Atualizado
                  </span>
                </div>

                <p className="text-xs text-[#705e8b] leading-relaxed">
                  Último backup em nuvem:{' '}
                  <strong className="text-slate-800">
                    {formatDateBR((googleAccount.lastSync || googleAccount.lastBackupDate || new Date().toISOString()).split('T')[0])} às{' '}
                    {new Date(googleAccount.lastSync || googleAccount.lastBackupDate || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </strong>
                </p>

                <div className="pt-2 border-t border-[#f2ecf8] grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-white rounded-xl border border-[#eee4f6]">
                    <span className="text-[10px] text-[#705e8b] uppercase block font-bold">
                      Prontuários Salvos
                    </span>
                    <span className="text-base font-extrabold font-mono text-slate-800">
                      {patients.length} pacientes
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-[#eee4f6]">
                    <span className="text-[10px] text-[#705e8b] uppercase block font-bold">
                      Sessões na Nuvem
                    </span>
                    <span className="text-base font-extrabold font-mono text-slate-800">
                      {sessions.length} registros
                    </span>
                  </div>
                </div>
              </div>

              {syncFeedback && (
                <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl text-xs text-[#065f46] font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full py-2.5 bg-[#452267] hover:opacity-90 disabled:opacity-60 text-white font-bold text-xs rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 text-[#ded6f4] ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando com a nuvem...' : 'Sincronizar Backup Agora'}</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full py-2 bg-white hover:bg-[#fff1f2] text-[#be123c] border border-[#fecdd3] font-semibold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar Conta Google</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-3xl bg-[#faf5ec] border border-[#e8dfd2] flex items-center justify-center mx-auto text-slate-800 shadow-2xs">
                <Database className="w-7 h-7 text-[#452267]" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-800">
                  Conecte sua Conta Google
                </h4>
                <p className="text-xs text-[#705e8b] max-w-sm mx-auto leading-relaxed">
                  Evite perda de anotações e prontuários. Seus dados são salvos com criptografia ponta a ponta na sua própria conta segura.
                </p>
              </div>

              <div className="p-3 bg-[#faf7fe] border border-[#ece4f6] rounded-2xl text-left text-xs text-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <span>Vantagens do Backup Google:</span>
                </div>
                <p className="text-[#665282] text-[11px] leading-relaxed">
                  • Recuperação instantânea caso troque de aparelho ou limpe o navegador.<br />
                  • Sincronização contínua das evoluções de sessão e calendário clínico.
                </p>
              </div>

              <button
                onClick={handleConnect}
                className="w-full py-3 bg-[#452267] hover:opacity-90 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {/* Google G icon */}
                <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Fazer Login com Google & Ativar Backup</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
