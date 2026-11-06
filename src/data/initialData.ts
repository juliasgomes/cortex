import { Patient, SessionEvent, ClinicSettings, PsychologistTask } from '../types/clinic';

// Helper to get formatted relative dates (YYYY-MM-DD for internal logic)
export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const initialSettings: ClinicSettings = {
  psychologistName: 'Dra. Helena Vance',
  crp: 'CRP 06/142980',
  specialty: 'Psicologia Clínica & Psicoterapia',
  defaultFee: 240,
  workStart: '08:00',
  workEnd: '19:00',
  defaultSessionDuration: 50,
  officeAddress: 'Av. Paulista, 1842 - Cj. 72, Bela Vista, São Paulo - SP',
  privacyMode: false,
  securityPin: '1234',
  pinProtectionEnabled: true,
  privacyPreferences: {
    hidePatientNames: true,
    hideFinancialValues: true,
    hideSessionNotes: true,
  },
  notifications: {
    enabled: true,
    minutesBefore: 15,
  },
  autoLockMinutes: 10,
  theme: 'light',
};

export const initialPatients: Patient[] = [
  {
    id: 'pat-1',
    name: 'Beatriz Silveira',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'beatriz.silveira@email.com',
    phone: '(11) 98765-4321',
    emergencyContact: {
      name: 'Carlos Silveira',
      phone: '(11) 98111-2233',
      relation: 'Irmão',
    },
    sessionFee: 260,
    preferredModality: 'presencial',
    cadence: 'semanal',
    preferredWeekday: 4, // Quinta
    preferredTime: '15:00',
    status: 'ativo',
    startDate: '2025-08-10',
    obs: 'Paciente prefere atendimentos presenciais às quintas. Relata boa adesão aos exercícios de escrita reflexiva e busca equilíbrio entre demandas corporativas e autocuidado.',
    clinicalNotes: [
      {
        id: 'note-b1',
        patientId: 'pat-1',
        sessionNumber: 12,
        date: getRelativeDateString(-7),
        time: '15:00',
        title: 'Elaboração do luto e confronto com objetos de apego',
        content: `Beatriz compareceu pontualmente à sessão. Apresentou afeto congruente, postura contida e choro espontâneo ao relatar o aniversário de 6 meses da partida da mãe. Conseguiu pela primeira vez entrar no quarto da mãe e organizar algumas roupas sem paralisia ansiosa.

Expressou uma fala marcante durante a sessão:
"Quando segurei o xale dela, percebi que não preciso carregar a dor como se fosse a única forma de me manter conectada ao amor que ela me deu."

Observação de processo:
Percebe-se uma transição gradual da culpa retrospectiva para a aceitação da saudade. Foi combinada a prática de escrita expressiva quando surgir angústia nos finais de semana. Manter acompanhamento dos limites no trabalho corporativo.`,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'note-b2',
        patientId: 'pat-1',
        sessionNumber: 13,
        date: getRelativeDateString(0),
        time: '15:00',
        title: 'Autonomia laboral e limites com a diretoria',
        content: `Trabalho focado na dinâmica de sobrecarga na agência. Beatriz relatou que conseguiu delegar o fechamento da campanha para a equipe júnior sem conferir compulsivamente três vezes cada entrega.

Paciente expressou:
"Disse não para a reunião de domingo e o mundo continuou de pé. Foi assustadoramente libertador."

Alinhamento para a próxima quinzena: continuar fortalecendo o posicionamento assertivo com a liderança sem sentimento residual de desvalor.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    healthInfo: {
      healthSummary: 'Histórico de luto parental recente e sintomas reativos de sobrecarga. Sem comorbidades psiquiátricas prévias.',
      currentMedications: 'Nenhum medicamento psiquiátrico de uso contínuo.',
      medicalReferrals: 'Acompanhamento clínico geral anual; sem necessidade atual de interconsulta psiquiátrica.',
      treatmentGoals: 'Elaboração do luto, fortalecimento de limites laborais e desenvolvimento de tolerância ao desconforto sem sobrecompensação.',
    },
    documents: [
      {
        id: 'doc-b1',
        title: 'Ficha de Anamnese & Entrevista Inicial',
        category: 'anamnese',
        fileDate: '2025-08-10',
        fileName: 'anamnese_beatriz_silveira.pdf',
        fileSize: '142 KB',
        notes: 'Coleta inicial de dados sociodemográficos, histórico familiar e queixa de sobrecarga.',
      },
      {
        id: 'doc-b2',
        title: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
        category: 'termo',
        fileDate: '2025-08-10',
        fileName: 'termo_consentimento_assinado.pdf',
        fileSize: '89 KB',
        notes: 'Assinado eletronicamente pela paciente no primeiro atendimento.',
      },
    ],
  },
  {
    id: 'pat-2',
    name: 'Lucas Mendes',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'lucas.mendes@tech.io',
    phone: '(11) 97654-3210',
    emergencyContact: {
      name: 'Mariana Mendes',
      phone: '(11) 98777-6655',
      relation: 'Esposa',
    },
    sessionFee: 220,
    preferredModality: 'online',
    cadence: 'semanal',
    preferredWeekday: 5, // Sexta
    preferredTime: '10:00',
    status: 'ativo',
    startDate: '2025-06-15',
    obs: 'Atendimento online semanal. Trabalha em empresa de tecnologia com rotina de pressão por metas; foco em regulação emocional e sintomas somáticos de ansiedade.',
    clinicalNotes: [
      {
        id: 'note-l1',
        patientId: 'pat-2',
        sessionNumber: 18,
        date: getRelativeDateString(-14),
        time: '10:00',
        title: 'Gatilhos de ansiedade em reuniões de liderança',
        content: `Lucas trouxe relato de um episódio agudo ocorrido durante a apresentação trimestral de resultados. Sentiu dormência nas mãos, taquicardia e sensação iminente de desmaio.

Fala do paciente:
"Sinto que qualquer falha minha em público vai desmoronar tudo o que construí na empresa e vão me desmascarar."

Manejo clínico:
Trabalhada a identificação de sinais precursores físicos e técnica de respiração diafragmática. Reavaliação das evidências contra o pensamento catastrofizante de demissão ou humilhação pública.`,
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 'note-l2',
        patientId: 'pat-2',
        sessionNumber: 19,
        date: getRelativeDateString(-7),
        time: '10:00',
        title: 'Desconstrução da crença de incompetência e regulação',
        content: `Paciente apresentou o registro de pensamentos disfuncionais preenchido. Relatou que conseguiu interagir com tranquilidade com o diretor geral na terça-feira.

Fala do paciente:
"Quando analisei os dados objetivos, vi que nenhum projeto meu atrasou este ano. A catástrofe existia quase toda na minha cabeça."

Evolução favorável na percepção de autoeficácia. Manter registro para a próxima reunião de diretoria.`,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ],
  },
  {
    id: 'pat-3',
    name: 'Camila Vasconcelos',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    email: 'camila.vasc@design.com',
    phone: '(11) 96543-2109',
    emergencyContact: {
      name: 'Renata Vasconcelos',
      phone: '(11) 98222-3344',
      relation: 'Mãe',
    },
    sessionFee: 280,
    preferredModality: 'presencial',
    cadence: 'quinzenal',
    preferredWeekday: 2, // Terça
    preferredTime: '14:00',
    status: 'ativo',
    startDate: '2025-09-01',
    obs: 'Atendimento quinzenal presencial. Foco em limites nas relações interpessoais e desenvolvimento de autonomia emocional.',
    clinicalNotes: [],
  },
  {
    id: 'pat-4',
    name: 'Rodrigo Albuquerque',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'rodrigo.alb@fin.com.br',
    phone: '(11) 95432-1098',
    emergencyContact: {
      name: 'Patrícia Albuquerque',
      phone: '(11) 97333-4455',
      relation: 'Irmã',
    },
    sessionFee: 250,
    preferredModality: 'online',
    cadence: 'semanal',
    preferredWeekday: 3, // Quarta
    preferredTime: '17:00',
    status: 'ativo',
    startDate: '2025-10-05',
    obs: 'Atendimento online. Processo reflexivo sobre transição profissional e equilíbrio entre carreira corporativa e tempo familiar.',
    clinicalNotes: [],
  },
  {
    id: 'pat-5',
    name: 'Mariana Costa',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'mariana.costa@adv.com',
    phone: '(11) 94321-0987',
    emergencyContact: {
      name: 'Felipe Costa',
      phone: '(11) 98444-5566',
      relation: 'Cônjuge',
    },
    sessionFee: 240,
    preferredModality: 'presencial',
    cadence: 'semanal',
    preferredWeekday: 1, // Segunda
    preferredTime: '09:00',
    status: 'ativo',
    startDate: '2025-11-20',
    obs: 'Atendimento presencial semanal. Desconforto em situações de aglomeração; trabalhando exposição gradual e segurança corporal.',
    clinicalNotes: [],
  },
  {
    id: 'pat-6',
    name: 'Eduardo Farias',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    email: 'eduardo.farias@med.br',
    phone: '(11) 93210-9876',
    emergencyContact: {
      name: 'Juliana Farias',
      phone: '(11) 98555-6677',
      relation: 'Esposa',
    },
    sessionFee: 270,
    preferredModality: 'presencial',
    cadence: 'semanal',
    preferredWeekday: 4, // Quinta
    preferredTime: '16:30',
    status: 'ativo',
    startDate: '2025-07-02',
    obs: 'Médico cirurgião. Queixa de insônia e sobrecarga emocional decorrente de plantões hospitalares e alta responsabilidade.',
    clinicalNotes: [],
  },
];

export function generateInitialSessions(patients: Patient[]): SessionEvent[] {
  const todayStr = getRelativeDateString(0);
  const yesterdayStr = getRelativeDateString(-1);
  const tomorrowStr = getRelativeDateString(1);
  const next2DaysStr = getRelativeDateString(2);
  const past5DaysStr = getRelativeDateString(-5);
  const past8DaysStr = getRelativeDateString(-8);
  const past12DaysStr = getRelativeDateString(-12);

  return [
    {
      id: 'sess-today-1',
      patientId: 'pat-1',
      patientName: 'Beatriz Silveira',
      patientAvatar: patients[0]?.avatar,
      date: todayStr,
      time: '15:00',
      duration: 50,
      fee: 260,
      status: 'agendado',
      modality: 'presencial',
      room: 'Consultório Principal',
      notes: '',
      clinicalNoteId: 'note-b2',
    },
    {
      id: 'sess-today-2',
      patientId: 'pat-6',
      patientName: 'Eduardo Farias',
      patientAvatar: patients[5]?.avatar,
      date: todayStr,
      time: '16:30',
      duration: 50,
      fee: 270,
      status: 'agendado',
      modality: 'presencial',
      room: 'Consultório Principal',
      notes: 'Diário do sono e rotina hospitalar.',
    },
    {
      id: 'sess-today-0',
      patientId: 'pat-5',
      patientName: 'Mariana Costa',
      patientAvatar: patients[4]?.avatar,
      date: todayStr,
      time: '09:00',
      duration: 50,
      fee: 240,
      status: 'realizado',
      modality: 'presencial',
      room: 'Consultório Principal',
    },
    {
      id: 'sess-tom-1',
      patientId: 'pat-2',
      patientName: 'Lucas Mendes',
      patientAvatar: patients[1]?.avatar,
      date: tomorrowStr,
      time: '10:00',
      duration: 50,
      fee: 220,
      status: 'agendado',
      modality: 'online',
      meetLink: 'https://meet.google.com/cortex-lucas-mendes',
    },
    {
      id: 'sess-tom-2',
      patientId: 'pat-4',
      patientName: 'Rodrigo Albuquerque',
      patientAvatar: patients[3]?.avatar,
      date: tomorrowStr,
      time: '14:30',
      duration: 50,
      fee: 250,
      status: 'agendado',
      modality: 'online',
      meetLink: 'https://meet.google.com/cortex-rodrigo-alb',
    },
    {
      id: 'sess-next-1',
      patientId: 'pat-3',
      patientName: 'Camila Vasconcelos',
      patientAvatar: patients[2]?.avatar,
      date: next2DaysStr,
      time: '14:00',
      duration: 50,
      fee: 280,
      status: 'agendado',
      modality: 'presencial',
      room: 'Consultório Principal',
    },
    {
      id: 'sess-past-canceled-1',
      patientId: 'pat-2',
      patientName: 'Lucas Mendes',
      patientAvatar: patients[1]?.avatar,
      date: yesterdayStr,
      time: '18:00',
      duration: 50,
      fee: 220,
      status: 'desmarcado',
      modality: 'online',
      cancellationReason: 'Viagem de emergência a negócios.',
    },
    {
      id: 'sess-past-canceled-2',
      patientId: 'pat-4',
      patientName: 'Rodrigo Albuquerque',
      patientAvatar: patients[3]?.avatar,
      date: past5DaysStr,
      time: '17:00',
      duration: 50,
      fee: 250,
      status: 'desmarcado',
      modality: 'online',
      cancellationReason: 'Gripe e mal-estar.',
    },
    {
      id: 'sess-past-done-1',
      patientId: 'pat-1',
      patientName: 'Beatriz Silveira',
      patientAvatar: patients[0]?.avatar,
      date: past8DaysStr,
      time: '15:00',
      duration: 50,
      fee: 260,
      status: 'realizado',
      modality: 'presencial',
      clinicalNoteId: 'note-b1',
    },
    {
      id: 'sess-past-done-2',
      patientId: 'pat-2',
      patientName: 'Lucas Mendes',
      patientAvatar: patients[1]?.avatar,
      date: past8DaysStr,
      time: '10:00',
      duration: 50,
      fee: 220,
      status: 'realizado',
      modality: 'online',
      clinicalNoteId: 'note-l2',
    },
    {
      id: 'sess-past-done-3',
      patientId: 'pat-3',
      patientName: 'Camila Vasconcelos',
      patientAvatar: patients[2]?.avatar,
      date: past12DaysStr,
      time: '14:00',
      duration: 50,
      fee: 280,
      status: 'realizado',
      modality: 'presencial',
    },
  ];
}

export const initialTasks: PsychologistTask[] = [
  {
    id: 'task-1',
    title: 'Revisar TCC e apontamentos bibliográficos',
    completed: false,
    dueDate: getRelativeDateString(1),
    category: 'academico',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Emitir recibo de honorários do Lucas Mendes',
    completed: false,
    dueDate: getRelativeDateString(2),
    category: 'administrativo',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Preparar laudo de encaminhamento psiquiátrico da Beatriz',
    completed: false,
    dueDate: getRelativeDateString(3),
    category: 'clinico',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Supervisão clínica com Dr. Arnaldo',
    completed: true,
    dueDate: getRelativeDateString(-1),
    category: 'clinico',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
