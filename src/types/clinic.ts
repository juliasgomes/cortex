export type SessionStatus = 'agendado' | 'realizado' | 'desmarcado' | 'remarcado';

export type ModalityType = 'presencial' | 'online';

export type AppTab = 'home' | 'calendar' | 'patients' | 'tasks' | 'documents' | 'finance' | 'settings';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username: string;
  crp?: string;
  role: 'admin' | 'psychologist';
  avatar?: string;
  provider: 'local' | 'google';
}

export interface PrivacyPreferences {
  hidePatientNames: boolean;
  hideFinancialValues: boolean;
  hideSessionNotes: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  minutesBefore: number; // e.g. 10, 15, 30
}

export interface BlockedTimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:MM
  timeEnd: string; // HH:MM
  reason: string; // e.g. "Almoço", "Supervisão", "Compromisso pessoal"
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  sessionId?: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  content: string; // Conteúdo completo da anotação
  handwritingData?: string; // Traço da escrita manual / caneta digital
  createdAt: string;
  updatedAt: string;
}

export interface PatientDocument {
  id: string;
  title: string;
  category: 'anamnese' | 'prontuario' | 'laudo' | 'termo' | 'outro';
  fileDate: string; // YYYY-MM-DD
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  notes?: string;
}

export interface PatientHealthInfo {
  healthSummary?: string; // Queixas, histórico de saúde física/mental
  currentMedications?: string; // Medicações psiquiátricas/clínicas em uso
  medicalReferrals?: string; // Encaminhamentos médicos ou psiquiátricos
  treatmentGoals?: string; // Objetivos do acompanhamento terapêutico
}

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  sessionFee: number; // Valor que o paciente paga por sessão
  preferredModality: ModalityType;
  cadence: 'semanal' | 'quinzenal' | 'avulso';
  preferredWeekday: number; // 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
  preferredTime: string; // HH:MM
  status: 'ativo' | 'pausa' | 'alta';
  startDate: string; // YYYY-MM-DD
  obs: string; // Observações gerais do paciente
  clinicalNotes: ClinicalNote[];
  documents?: PatientDocument[];
  healthInfo?: PatientHealthInfo;
}

export interface SessionEvent {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes (default 50)
  fee: number; // Valor da sessão
  status: SessionStatus;
  modality: ModalityType;
  room?: string;
  meetLink?: string;
  notes?: string;
  clinicalNoteId?: string;
  cancellationReason?: string;
  rescheduledToDate?: string;
  rescheduledToTime?: string;
}

export interface PsychologistTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  category?: 'academico' | 'clinico' | 'administrativo' | 'pessoal';
  createdAt: string;
}

export interface FinancialMetrics {
  month: string; // YYYY-MM
  confirmedRevenue: number;
  projectedRevenue: number;
  lossAmount: number;
  totalPotentialRevenue: number;
  totalSessions: number;
  completedCount: number;
  scheduledCount: number;
  canceledCount: number;
  rescheduledCount: number;
  realizationRate: number; // percentage (0 - 100)
}

export interface GoogleAccount {
  name: string;
  email: string;
  avatar: string;
  isConnected: boolean;
  lastBackupDate?: string;
  lastSync?: string;
}

export interface ClinicSettings {
  psychologistName: string;
  psychologistAvatar?: string;
  crp: string;
  specialty: string;
  defaultFee: number;
  workStart: string; // '08:00'
  workEnd: string; // '19:00'
  defaultSessionDuration?: number; // in minutes (default 50)
  officeAddress: string;
  privacyMode: boolean; // Modo Sigilo / Ocultar dados sensíveis
  securityPin: string; // Senha para desbloqueio do modo sigilo (até 6 dígitos)
  pinProtectionEnabled?: boolean; // Proteção opcional por PIN configurável
  privacyPreferences: PrivacyPreferences;
  notifications: NotificationSettings;
  theme: 'light' | 'dark';
  autoLockMinutes: number; // 0 (desativado), 5 ou 10 minutos
}
