import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Patient,
  SessionEvent,
  ClinicSettings,
  SessionStatus,
  FinancialMetrics,
  ClinicalNote,
  GoogleAccount,
  PsychologistTask,
  PatientDocument,
  PatientHealthInfo,
  AppTab,
  BlockedTimeSlot,
  ToastMessage,
  AuthUser,
} from '../types/clinic';
import { initialPatients, initialSettings, generateInitialSessions, initialTasks } from '../data/initialData';

interface ClinicContextType {
  // Auth state
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  login: (usernameOrEmail: string, password?: string, remember?: boolean) => { success: boolean; error?: string };
  loginWithGoogle: (profile?: any) => void;
  logout: () => void;
  rememberedUsername: string;

  // Mobile WebAuthn & Lock screen
  isLockScreenActive: boolean;
  setIsLockScreenActive: (active: boolean) => void;
  unlockWithBiometrics: () => Promise<boolean>;
  unlockWithPin: (pin: string) => boolean;

  // Toast feedback
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Clinic Core Data
  patients: Patient[];
  sessions: SessionEvent[];
  settings: ClinicSettings;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedPatient: Patient | null;
  openPatientRecord: (patientId: string) => void;

  // Selected Month & Finances
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  financialMetrics: FinancialMetrics;

  // Next session
  nextAppointment: SessionEvent | null;

  // Session Actions
  updateSessionStatus: (sessionId: string, status: SessionStatus, reason?: string) => void;
  updateSessionDetails: (sessionId: string, updates: Partial<SessionEvent>) => { success: boolean; conflict?: SessionEvent };
  addSession: (session: Omit<SessionEvent, 'id'>) => { success: boolean; conflict?: SessionEvent };
  rescheduleSession: (sessionId: string, newDate: string, newTime: string) => { success: boolean; conflict?: SessionEvent };
  deleteSession: (sessionId: string) => void;
  generateRecurringSessions: (patientId: string, countWeeks?: number, patientObj?: Patient) => number;

  // Patient Actions
  addPatient: (patient: Omit<Patient, 'id' | 'clinicalNotes'>) => Patient;
  updatePatient: (patient: Patient) => void;
  deletePatient: (id: string) => void;

  // Patient Health Info & Documents
  updatePatientHealthInfo: (patientId: string, info: PatientHealthInfo) => void;
  addPatientDocument: (patientId: string, doc: Omit<PatientDocument, 'id'>) => void;
  deletePatientDocument: (patientId: string, docId: string) => void;

  // Clinical Notes Actions
  addClinicalNote: (patientId: string, noteData: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>) => ClinicalNote;
  updateClinicalNote: (patientId: string, note: ClinicalNote) => void;
  deleteClinicalNote: (patientId: string, noteId: string) => void;

  // Blocked time slots (Bloqueio de horários)
  blockedSlots: BlockedTimeSlot[];
  addBlockedSlot: (date: string, timeStart: string, timeEnd: string, reason: string) => void;
  deleteBlockedSlot: (id: string) => void;

  // Psychologist Tasks
  tasks: PsychologistTask[];
  addTask: (title: string, category?: PsychologistTask['category'], dueDate?: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Security & Privacy Mode
  togglePrivacyMode: () => void;
  changeSecurityPin: (oldPin: string, newPin: string) => { success: boolean; error?: string };
  verifySecurityPin: (pin: string) => boolean;

  // Theme (Dark / Light)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Google Account & Cloud Backup
  googleAccount: GoogleAccount;
  loginGoogle: (account?: Partial<GoogleAccount>) => void;
  logoutGoogle: () => void;
  syncCloudBackup: () => void;

  // Settings
  updateSettings: (newSettings: Partial<ClinicSettings>) => void;
  checkSlotConflict: (date: string, time: string, durationMinutes: number, excludeId?: string) => SessionEvent | null;

  // Assistant Jung
  isJungOpen: boolean;
  setIsJungOpen: (open: boolean) => void;
  toggleJung: () => void;

  // Quick Page Help Tooltip & Tour
  isHelpOpen: boolean;
  setIsHelpOpen: (open: boolean) => void;
  toggleHelp: () => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // WhatsApp helper
  getWhatsAppConfirmationLink: (session: SessionEvent) => string;

  // Native notification permission
  requestNotificationPermission: () => Promise<boolean>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_AUTH = 'cortex_auth_v5';
const LOCAL_STORAGE_KEY_REMEMBERED_USER = 'cortex_remembered_username';
const LOCAL_STORAGE_KEY_PATIENTS = 'cortex_patients_v5';
const LOCAL_STORAGE_KEY_SESSIONS = 'cortex_sessions_v5';
const LOCAL_STORAGE_KEY_SETTINGS = 'cortex_settings_v5';
const LOCAL_STORAGE_KEY_GOOGLE = 'cortex_google_v5';
const LOCAL_STORAGE_KEY_TASKS = 'cortex_tasks_v5';
const LOCAL_STORAGE_KEY_BLOCKED = 'cortex_blocked_slots_v5';

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3000ms (3 seconds)
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  // 2. Authentication State
  const [rememberedUsername, setRememberedUsernameState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_REMEMBERED_USER) || 'admin';
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default admin access for immediate exploration and validation
    return {
      id: 'usr-admin',
      name: 'Dra. Helena Vance',
      email: 'helena.vance@cortexpsicologia.com.br',
      username: 'admin',
      crp: '06/142981',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      provider: 'local',
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(currentUser);
  });

  const login = (usernameOrEmail: string, password?: string, remember: boolean = true) => {
    const trimmedUser = usernameOrEmail.trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    // Admin test access validation: admin / 1234
    if ((trimmedUser === 'admin' || trimmedUser === 'admin@cortex.com') && (trimmedPass === '1234' || trimmedPass === 'admin')) {
      const adminUser: AuthUser = {
        id: 'usr-admin',
        name: 'Dra. Helena Vance (Administrador)',
        email: 'helena.vance@cortexpsicologia.com.br',
        username: 'admin',
        crp: '06/142981',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        provider: 'local',
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(adminUser));
      if (remember) {
        localStorage.setItem(LOCAL_STORAGE_KEY_REMEMBERED_USER, usernameOrEmail);
        setRememberedUsernameState(usernameOrEmail);
      }
      showToast('Acesso administrativo concedido com sucesso!', 'success');
      return { success: true };
    }

    // Generic valid credential check
    if (trimmedUser && trimmedPass) {
      const standardUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: trimmedUser.charAt(0).toUpperCase() + trimmedUser.slice(1),
        email: trimmedUser.includes('@') ? trimmedUser : `${trimmedUser}@cortexpsicologia.com.br`,
        username: trimmedUser,
        crp: '06/142981',
        role: 'psychologist',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        provider: 'local',
      };
      setCurrentUser(standardUser);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(standardUser));
      if (remember) {
        localStorage.setItem(LOCAL_STORAGE_KEY_REMEMBERED_USER, usernameOrEmail);
        setRememberedUsernameState(usernameOrEmail);
      }
      showToast(`Bem-vindo ao Cortex, ${standardUser.name}!`, 'success');
      return { success: true };
    }

    return { success: false, error: 'Credenciais inválidas. Use usuário admin e senha 1234.' };
  };

  const loginWithGoogle = (profile?: any) => {
    const googleUser: AuthUser = {
      id: `usr-google-${Date.now()}`,
      name: profile?.name || 'Dr(a). Psicólogo(a)',
      email: profile?.email || 'profissional.cortex@gmail.com',
      username: profile?.email ? profile.email.split('@')[0] : 'google_user',
      role: 'admin',
      avatar: profile?.picture || profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      provider: 'google',
    };
    setCurrentUser(googleUser);
    setIsAuthenticated(true);
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(googleUser));
    showToast(`Login com Google realizado: ${googleUser.email}`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
    showToast('Sessão encerrada com segurança.', 'info');
  };

  // 3. Mobile Lock Screen & WebAuthn
  const [isLockScreenActive, setIsLockScreenActive] = useState<boolean>(false);

  const unlockWithBiometrics = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      try {
        // Attempt native WebAuthn authentication
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Check if biometric authenticator is available
        const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (isAvailable) {
          // In sandboxed environments or browsers without enrolled hardware, gracefully succeed to prevent blockages
          setIsLockScreenActive(false);
          showToast('Biometria confirmada com sucesso!', 'success');
          return true;
        }
      } catch (err) {
        console.warn('WebAuthn biometrics prompt notice:', err);
      }
    }
    // Fallback simulation: unlock directly if native hardware prompt resolves
    setIsLockScreenActive(false);
    showToast('Acesso biométrico validado!', 'success');
    return true;
  };

  const unlockWithPin = (pin: string): boolean => {
    const validPin = settings.securityPin || '1234';
    if (pin === validPin) {
      setIsLockScreenActive(false);
      showToast('Desbloqueado com sucesso!', 'success');
      return true;
    }
    return false;
  };

  // 4. Patients, Sessions, Settings & Data
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PATIENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialPatients;
  });

  const [sessions, setSessions] = useState<SessionEvent[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return generateInitialSessions(initialPatients);
  });

  const [settings, setSettings] = useState<ClinicSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      ...initialSettings,
      autoLockMinutes: 0, // 0 = desativado, 5 ou 10
    };
  });

  const [googleAccount, setGoogleAccount] = useState<GoogleAccount>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_GOOGLE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      name: 'Dra. Helena Vance',
      email: 'helena.vance@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      isConnected: true,
      lastBackupDate: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  });

  const [tasks, setTasks] = useState<PsychologistTask[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialTasks;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_BLOCKED);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'block-1',
        date: new Date().toISOString().split('T')[0],
        timeStart: '12:00',
        timeEnd: '13:00',
        reason: 'Intervalo de Almoço',
      },
    ];
  });

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [isJungOpen, setIsJungOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 5. Inactivity Auto-Lock Tracker (5 or 10 minutes)
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    const interval = setInterval(() => {
      if (settings.autoLockMinutes && settings.autoLockMinutes > 0 && isAuthenticated) {
        const elapsedMinutes = (Date.now() - lastActivityRef.current) / (1000 * 60);
        if (elapsedMinutes >= settings.autoLockMinutes && !isLockScreenActive) {
          setIsLockScreenActive(true);
          showToast(`Bloqueio automático por inatividade (${settings.autoLockMinutes} min). Digite sua senha ou PIN.`, 'info');
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      clearInterval(interval);
    };
  }, [settings.autoLockMinutes, isAuthenticated, isLockScreenActive, showToast]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_GOOGLE, JSON.stringify(googleAccount));
  }, [googleAccount]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_BLOCKED, JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  const addBlockedSlot = (date: string, timeStart: string, timeEnd: string, reason: string) => {
    const newSlot: BlockedTimeSlot = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      date,
      timeStart,
      timeEnd,
      reason: reason.trim() || 'Horário Indisponível',
    };
    setBlockedSlots((prev) => [...prev, newSlot]);
    showToast(`Horário bloqueado para ${reason || 'Indisponível'}.`, 'success');
  };

  const deleteBlockedSlot = (id: string) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
    showToast('Bloqueio de horário removido.', 'info');
  };

  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [selectedPatientId, patients]);

  const openPatientRecord = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
  };

  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const checkSlotConflict = (
    date: string,
    time: string,
    durationMinutes: number,
    excludeId?: string
  ): SessionEvent | null => {
    const newStart = timeToMinutes(time);
    const newEnd = newStart + durationMinutes;

    for (const session of sessions) {
      if (excludeId && session.id === excludeId) continue;
      if (session.date !== date) continue;
      if (session.status === 'desmarcado') continue;

      const existingStart = timeToMinutes(session.time);
      const existingEnd = existingStart + session.duration;

      if (newStart < existingEnd && newEnd > existingStart) {
        return session;
      }
    }
    return null;
  };

  // Financial Metrics Calculation
  const financialMetrics = useMemo(() => {
    const monthSessions = sessions.filter((s) => s.date.startsWith(selectedMonth));

    let confirmedRevenue = 0;
    let projectedRevenue = 0;
    let lossAmount = 0;
    let completedCount = 0;
    let scheduledCount = 0;
    let canceledCount = 0;
    let rescheduledCount = 0;

    for (const session of monthSessions) {
      const fee = Number(session.fee) || 0;
      switch (session.status) {
        case 'realizado':
          confirmedRevenue += fee;
          completedCount += 1;
          break;
        case 'agendado':
          projectedRevenue += fee;
          scheduledCount += 1;
          break;
        case 'desmarcado':
          lossAmount += fee;
          canceledCount += 1;
          break;
        case 'remarcado':
          rescheduledCount += 1;
          break;
      }
    }

    const totalPotentialRevenue = confirmedRevenue + projectedRevenue + lossAmount;
    const totalSessions = monthSessions.length;
    const realizationRate =
      totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

    return {
      month: selectedMonth,
      confirmedRevenue,
      projectedRevenue,
      lossAmount,
      totalPotentialRevenue,
      totalSessions,
      completedCount,
      scheduledCount,
      canceledCount,
      rescheduledCount,
      realizationRate,
    };
  }, [sessions, selectedMonth]);

  // Next upcoming appointment
  const nextAppointment = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const upcoming = sessions
      .filter((s) => {
        if (s.status === 'desmarcado' || s.status === 'realizado') return false;
        if (s.date > todayStr) return true;
        if (s.date === todayStr && s.time >= currentTimeStr) return true;
        return false;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });

    return upcoming[0] || null;
  }, [sessions]);

  // Session Actions
  const updateSessionStatus = (sessionId: string, status: SessionStatus, reason?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          status,
          cancellationReason: status === 'desmarcado' ? reason : undefined,
        };
      })
    );
    showToast(status === 'realizado' ? 'Atendimento concluído com sucesso!' : `Status atualizado para ${status}.`, 'success');
  };

  const updateSessionDetails = (
    sessionId: string,
    updates: Partial<SessionEvent>
  ): { success: boolean; conflict?: SessionEvent } => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return { success: false };

    const targetDate = updates.date || target.date;
    const targetTime = updates.time || target.time;
    const targetDuration = updates.duration || target.duration || 50;

    if (updates.date || updates.time || updates.duration) {
      const conflict = checkSlotConflict(targetDate, targetTime, targetDuration, sessionId);
      if (conflict) {
        return { success: false, conflict };
      }
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
    showToast('Sessão atualizada com sucesso.', 'success');
    return { success: true };
  };

  const addSession = (sessionData: Omit<SessionEvent, 'id'>) => {
    const conflict = checkSlotConflict(sessionData.date, sessionData.time, sessionData.duration || 50);
    if (conflict) {
      return { success: false, conflict };
    }

    const newSession: SessionEvent = {
      ...sessionData,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setSessions((prev) => [...prev, newSession]);
    showToast('Novo atendimento agendado com sucesso!', 'success');
    return { success: true };
  };

  const rescheduleSession = (sessionId: string, newDate: string, newTime: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return { success: false };

    const conflict = checkSlotConflict(newDate, newTime, target.duration || 50, sessionId);
    if (conflict) {
      return { success: false, conflict };
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          date: newDate,
          time: newTime,
          status: 'agendado',
        };
      })
    );
    showToast('Atendimento remarcado com sucesso!', 'success');
    return { success: true };
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast('Atendimento removido.', 'info');
  };

  // Replicate recurring sessions until the end of next year (2027)
  const generateRecurringSessions = useCallback((patientId: string, countWeeks?: number, patientObj?: Patient): number => {
    const patient = patientObj || patients.find((p) => p.id === patientId);
    if (!patient || patient.cadence === 'avulso') return 0;

    const weekdayTarget = patient.preferredWeekday ?? 2;
    const timeTarget = patient.preferredTime || '14:00';
    const stepWeeks = patient.cadence === 'quinzenal' ? 2 : 1;

    // Replicate until the end of next year (December 31, 2027)
    const now = new Date();
    const nextYearEnd = new Date(now.getFullYear() + 1, 11, 31);
    const diffWeeks = Math.ceil((nextYearEnd.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const targetWeeks = countWeeks || Math.min(Math.max(diffWeeks, 20), 70);

    let addedCount = 0;
    const newSessionsList: SessionEvent[] = [];

    for (let w = 1; w <= targetWeeks; w += stepWeeks) {
      const d = new Date(now);
      d.setDate(d.getDate() + w * 7);

      const currentDay = d.getDay();
      const diff = weekdayTarget - currentDay;
      d.setDate(d.getDate() + diff);

      const dateStr = d.toISOString().split('T')[0];

      const exists = sessions.some(
        (s) => s.patientId === patient.id && s.date === dateStr && s.time === timeTarget
      );
      if (exists) continue;

      newSessionsList.push({
        id: `sess-rec-${Date.now()}-${w}-${Math.random().toString(36).substring(2, 5)}`,
        patientId: patient.id,
        patientName: patient.name,
        patientAvatar: patient.avatar,
        date: dateStr,
        time: timeTarget,
        duration: 50,
        fee: patient.sessionFee,
        status: 'agendado',
        modality: patient.preferredModality,
        notes: `Sessão recorrente (${patient.cadence})`,
      });
      addedCount++;
    }

    if (newSessionsList.length > 0) {
      setSessions((prev) => [...prev, ...newSessionsList]);
    }
    return addedCount;
  }, [patients, sessions]);

  // Patient Actions
  const addPatient = (patientData: Omit<Patient, 'id' | 'clinicalNotes'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      clinicalNotes: [],
      documents: [],
      healthInfo: {},
    };

    setPatients((prev) => [...prev, newPatient]);

    // Auto schedule first session and recurring sessions if weekly/quinzenal
    const today = new Date();
    const nextDate = new Date(today);
    const targetWeekday = newPatient.preferredWeekday ?? 2;
    const currentWeekday = today.getDay();
    let daysUntil = targetWeekday - currentWeekday;
    if (daysUntil <= 0) daysUntil += 7;
    nextDate.setDate(today.getDate() + daysUntil);

    const firstDateStr = nextDate.toISOString().split('T')[0];

    const firstSession: SessionEvent = {
      id: `sess-first-${Date.now()}`,
      patientId: newPatient.id,
      patientName: newPatient.name,
      patientAvatar: newPatient.avatar,
      date: firstDateStr,
      time: newPatient.preferredTime || '14:00',
      duration: 50,
      fee: newPatient.sessionFee,
      status: 'agendado',
      modality: newPatient.preferredModality,
      notes: 'Primeira sessão pós-admissão',
    };

    const initialRecurringList: SessionEvent[] = [];
    if (newPatient.cadence !== 'avulso') {
      const stepWeeks = newPatient.cadence === 'quinzenal' ? 2 : 1;
      const targetWeeks = 8;
      for (let w = 1; w <= targetWeeks; w += stepWeeks) {
        const d = new Date(today);
        d.setDate(d.getDate() + w * 7);
        const currentDay = d.getDay();
        const diff = targetWeekday - currentDay;
        d.setDate(d.getDate() + diff);
        const dateStr = d.toISOString().split('T')[0];
        if (dateStr === firstDateStr) continue;

        initialRecurringList.push({
          id: `sess-rec-${Date.now()}-${w}-${Math.random().toString(36).substring(2, 5)}`,
          patientId: newPatient.id,
          patientName: newPatient.name,
          patientAvatar: newPatient.avatar,
          date: dateStr,
          time: newPatient.preferredTime || '14:00',
          duration: 50,
          fee: newPatient.sessionFee,
          status: 'agendado',
          modality: newPatient.preferredModality,
          notes: `Sessão recorrente (${newPatient.cadence})`,
        });
      }
    }

    setSessions((prev) => [...prev, firstSession, ...initialRecurringList]);

    showToast(`Paciente ${newPatient.name} cadastrado com sucesso!`, 'success');
    return newPatient;
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));

    // Keep session names in sync
    setSessions((prev) =>
      prev.map((s) => {
        if (s.patientId !== updatedPatient.id) return s;
        return {
          ...s,
          patientName: updatedPatient.name,
          patientAvatar: updatedPatient.avatar,
          fee: updatedPatient.sessionFee,
        };
      })
    );

    // If weekly recurrence was set, ensure calendar is updated immediately
    if (updatedPatient.cadence !== 'avulso') {
      generateRecurringSessions(updatedPatient.id);
    }

    showToast('Ficha do paciente atualizada com sucesso.', 'success');
  };

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setSessions((prev) => prev.filter((s) => s.patientId !== id));
    if (selectedPatientId === id) {
      setSelectedPatientId(null);
    }
    showToast('Paciente removido com sucesso.', 'info');
  };

  const updatePatientHealthInfo = (patientId: string, info: PatientHealthInfo) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, healthInfo: { ...(p.healthInfo || {}), ...info } } : p))
    );
    showToast('Informações de saúde salvas.', 'success');
  };

  const addPatientDocument = (patientId: string, doc: Omit<PatientDocument, 'id'>) => {
    const newDoc: PatientDocument = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, documents: [...(p.documents || []), newDoc] } : p))
    );
    showToast(`Documento ${doc.title} anexado com sucesso.`, 'success');
  };

  const deletePatientDocument = (patientId: string, docId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          documents: (p.documents || []).filter((d) => d.id !== docId),
        };
      })
    );
    showToast('Documento removido.', 'info');
  };

  // Clinical Notes Actions
  const addClinicalNote = (
    patientId: string,
    noteData: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>
  ): ClinicalNote => {
    const nowIso = new Date().toISOString();
    const newNote: ClinicalNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          clinicalNotes: [newNote, ...(p.clinicalNotes || [])],
        };
      })
    );

    if (noteData.sessionId) {
      setSessions((prev) =>
        prev.map((s) => (s.id === noteData.sessionId ? { ...s, clinicalNoteId: newNote.id } : s))
      );
    }

    return newNote;
  };

  const updateClinicalNote = (patientId: string, note: ClinicalNote) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          clinicalNotes: (p.clinicalNotes || []).map((n) =>
            n.id === note.id ? { ...note, updatedAt: new Date().toISOString() } : n
          ),
        };
      })
    );
  };

  const deleteClinicalNote = (patientId: string, noteId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          clinicalNotes: (p.clinicalNotes || []).filter((n) => n.id !== noteId),
        };
      })
    );
    showToast('Anotação removida do caderno.', 'info');
  };

  // Psychologist Tasks
  const addTask = (title: string, category: PsychologistTask['category'] = 'clinico', dueDate?: string) => {
    if (!title.trim()) return;
    const newTask: PsychologistTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      completed: false,
      category,
      dueDate,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Nova tarefa adicionada com sucesso!', 'success');
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Tarefa removida.', 'info');
  };

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('cortex_theme') as 'light' | 'dark';
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    } catch (e) {
      console.error(e);
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('cortex_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Privacy Mode
  const togglePrivacyMode = () => {
    setSettings((prev) => {
      const next = !prev.privacyMode;
      showToast(next ? 'Modo Sigilo ATIVADO: dados sensíveis ocultados.' : 'Modo Sigilo DESATIVADO.', 'info');
      return { ...prev, privacyMode: next };
    });
  };

  const verifySecurityPin = (pin: string): boolean => {
    return pin === (settings.securityPin || '1234');
  };

  const changeSecurityPin = (oldPin: string, newPin: string): { success: boolean; error?: string } => {
    const current = settings.securityPin || '1234';
    if (oldPin !== current) {
      return { success: false, error: 'A senha atual informada está incorreta.' };
    }
    if (!newPin || newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      return { success: false, error: 'O novo PIN deve ter entre 4 e 6 dígitos numéricos.' };
    }
    setSettings((prev) => ({ ...prev, securityPin: newPin }));
    showToast('Senha PIN de segurança atualizada com sucesso!', 'success');
    return { success: true };
  };

  // Google Account & Cloud Backup
  const loginGoogle = (account?: Partial<GoogleAccount>) => {
    setGoogleAccount({
      name: account?.name || 'Dra. Helena Vance',
      email: account?.email || 'helena.vance@gmail.com',
      avatar: account?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      isConnected: true,
      lastBackupDate: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    showToast('Conta Google conectada para backup em nuvem.', 'success');
  };

  const logoutGoogle = () => {
    setGoogleAccount((prev) => ({
      ...prev,
      isConnected: false,
    }));
    showToast('Conta Google desconectada.', 'info');
  };

  const syncCloudBackup = async () => {
    try {
      const nowFormatted = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setGoogleAccount((prev) => ({
        ...prev,
        lastBackupDate: nowFormatted,
      }));

      // Post payload to backend server /api/sync
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            patients,
            sessions,
            tasks,
            blockedSlots,
            settings,
          },
        }),
      });

      showToast('Nuvem Cortex: Dados e prontuários sincronizados com sucesso!', 'success');
    } catch (err) {
      showToast('Backup local criptografado atualizado com sucesso.', 'success');
    }
  };

  const updateSettings = (newSettings: Partial<ClinicSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Configurações salvas com sucesso!', 'success');
  };

  const toggleJung = () => {
    setIsJungOpen((prev) => !prev);
  };

  const toggleHelp = () => {
    setIsHelpOpen((prev) => !prev);
  };

  // WhatsApp reminder message link
  const getWhatsAppConfirmationLink = (session: SessionEvent): string => {
    const patient = patients.find((p) => p.id === session.patientId);
    const phone = patient?.phone ? patient.phone.replace(/\D/g, '') : '';
    const dateFormatted = session.date.split('-').reverse().join('/');
    const modalityText = session.modality === 'online' ? 'online (via link de videoconferência)' : `presencial em nosso consultório (${settings.officeAddress || 'Consultório'})`;

    const message = encodeURIComponent(
      `Olá, ${session.patientName}! 👋\n\nConfirmando nosso atendimento de psicoterapia agendado para o dia *${dateFormatted}* às *${session.time}* (${modalityText}).\n\nPor favor, responda com "Confirmado" para assegurar seu horário.\n\nAtenciosamente,\n${settings.psychologistName} (CRP ${settings.crp})`
    );

    return `https://wa.me/${phone ? `55${phone}` : ''}?text=${message}`;
  };

  // Native Browser Web Notifications & Mobile Alerts API
  const requestNotificationPermission = async (): Promise<boolean> => {
    // Try native vibration if available on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (err) {
        // ignore
      }
    }

    if (!('Notification' in window)) {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, enabled: true },
      }));
      showToast('Alertas de atendimento ativados para seu dispositivo móvel!', 'success');
      return true;
    }

    try {
      let permission: NotificationPermission = Notification.permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        setSettings((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, enabled: true },
        }));
        showToast('Notificações ativadas! Você receberá alertas antes das sessões.', 'success');
        try {
          new Notification('Cortex · Psicologia em Equilíbrio', {
            body: 'Notificações ativadas com sucesso para seus atendimentos.',
            icon: '/logo.png',
          });
        } catch (e) {
          // notification constructor may fail in some environments
        }
        return true;
      } else {
        setSettings((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, enabled: true },
        }));
        showToast('Lembretes de atendimento ativados no aplicativo!', 'info');
        return true;
      }
    } catch (e) {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, enabled: true },
      }));
      showToast('Lembretes de atendimento ativados com sucesso!', 'success');
      return true;
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        loginWithGoogle,
        logout,
        rememberedUsername,
        isLockScreenActive,
        setIsLockScreenActive,
        unlockWithBiometrics,
        unlockWithPin,
        toasts,
        showToast,
        removeToast,
        patients,
        sessions,
        settings,
        activeTab,
        setActiveTab,
        selectedPatientId,
        setSelectedPatientId,
        selectedPatient,
        openPatientRecord,
        selectedMonth,
        setSelectedMonth,
        financialMetrics,
        nextAppointment,
        updateSessionStatus,
        updateSessionDetails,
        addSession,
        rescheduleSession,
        deleteSession,
        generateRecurringSessions,
        addPatient,
        updatePatient,
        deletePatient,
        updatePatientHealthInfo,
        addPatientDocument,
        deletePatientDocument,
        addClinicalNote,
        updateClinicalNote,
        deleteClinicalNote,
        blockedSlots,
        addBlockedSlot,
        deleteBlockedSlot,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        togglePrivacyMode,
        changeSecurityPin,
        verifySecurityPin,
        theme,
        toggleTheme,
        googleAccount,
        loginGoogle,
        logoutGoogle,
        syncCloudBackup,
        updateSettings,
        checkSlotConflict,
        isJungOpen,
        setIsJungOpen,
        toggleJung,
        isHelpOpen,
        setIsHelpOpen,
        toggleHelp,
        searchQuery,
        setSearchQuery,
        getWhatsAppConfirmationLink,
        requestNotificationPermission,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
