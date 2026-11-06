import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { CortexLogo } from '../common/CortexLogo';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, loginWithGoogle, rememberedUsername } = useClinic();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState(rememberedUsername || 'admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCrp, setRegCrp] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = login(usernameInput, passwordInput, true);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciais inválidas.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    login(regEmail, regPassword, true);
  };

  const handleGoogleSignInClick = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.prompt();
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    loginWithGoogle({
      name: 'Dra. Helena Vance',
      email: 'helena.vance@gmail.com',
      picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    });
  };

  return (
    <div className="min-h-screen bg-[#452267] text-white flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-x-hidden">
      {/* Background Brain Watermark Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      {/* Official Centered Logo on Purple Background */}
      <div className="mb-6 sm:mb-8 text-center animate-in fade-in duration-300">
        <CortexLogo size="lg" variant="light" showWordmark={true} />
      </div>

      {/* Floating Centered Pure White Card (Replicating login_db7046ac.jpeg) */}
      <div className="w-full max-w-[420px] bg-[#FFFFFF] rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-white/20 text-slate-800 animate-fade-slide-up relative">
        {/* Discreet Top Lock Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] flex items-center justify-center mx-auto mb-3.5 border border-[#452267]/10 shadow-xs">
          <Lock className="w-5 h-5 text-[#452267]" />
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {tab === 'login' ? 'Entrar na sua conta' : 'Criar Conta Profissional'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {tab === 'login'
              ? 'Acesse seus prontuários, caderno e rotina clínica'
              : 'Cadastre seu consultório com sigilo ético e profissional'}
          </p>
        </div>

        {/* Segmented Switcher Tabs: [->] Acessar] and [Criar Conta] */}
        <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center gap-1 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-[#452267] shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Acessar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-[#452267] shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Conta</span>
          </button>
        </div>

        {/* Prominent Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignInClick}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer mb-4"
        >
          {/* Official Google multicolored icon */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continuar com o Google</span>
        </button>

        {/* Horizontal Divider: OU CREDENCIAIS */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-bold">
            <span className="bg-[#FFFFFF] px-2.5 text-slate-400">
              OU CREDENCIAIS
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-3.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {/* Field 1: Nome de Usuário ou E-mail */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nome de Usuário ou E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin ou seu@email.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#452267] focus:ring-1 focus:ring-[#452267] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Field 2: Senha de Acesso */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => alert('Para redefinir sua senha, utilize o acesso administrativo padrão ou entre em contato com o suporte: suporte@cortexpsicologia.com.br')}
                  className="text-[11px] font-bold text-[#452267] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#452267] focus:ring-1 focus:ring-[#452267] focus:bg-white transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#452267] cursor-pointer"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Main Submit Button in #452267 */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#452267] hover:opacity-90 active:scale-[0.99] text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#452267]/20 flex items-center justify-center gap-2 cursor-pointer mt-4 btn-interactive"
            >
              <span>Entrar no Consultório</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Dra. Helena Vance"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#452267] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                E-mail Profissional *
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="helena@consultorio.com.br"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#452267] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Número CRP
                </label>
                <input
                  type="text"
                  value={regCrp}
                  onChange={(e) => setRegCrp(e.target.value)}
                  placeholder="06/123456"
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#452267] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Senha *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#452267] focus:bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#452267] hover:opacity-90 active:scale-[0.99] text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#452267]/20 flex items-center justify-center gap-2 cursor-pointer mt-4 btn-interactive"
            >
              <span>Cadastrar e Iniciar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Discreet bottom copyright */}
      <div className="mt-6 text-center text-[11px] text-[#ded6f4]/75">
        &copy; {new Date().getFullYear()} Cortex · Psicologia em Equilíbrio
      </div>
    </div>
  );
};
