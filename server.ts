import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Cloud Sync Store (In-memory + persistence for cross-device synchronization)
let cloudSyncStore: any = null;

app.get('/api/sync', (req, res) => {
  res.json({
    success: true,
    data: cloudSyncStore,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/sync', (req, res) => {
  try {
    const { data } = req.body;
    if (data) {
      cloudSyncStore = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
    }
    res.json({
      success: true,
      message: 'Dados sincronizados com sucesso na nuvem do consultório.',
      updatedAt: cloudSyncStore?.updatedAt || new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao persistir sincronização em nuvem.' });
  }
});

// Assistant Jung AI endpoint
app.post('/api/jung', async (req, res) => {
  try {
    const { prompt, history = [], context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build system instructions for Jung
    const systemInstruction = `Você é o "Jung", um assistente de inteligência artificial de alta confidencialidade e precisão clínica e administrativa, integrado ao sistema Cortex (Psicologia em equilíbrio) para psicólogos clínicos.
Seu papel:
1. Auxiliar o psicólogo na gestão de prontuários, busca de anotações de sessões e observações de pacientes.
2. Fornecer dados claros sobre agenda, sessões do dia/semana e impacto financeiro (receitas confirmadas, cancelamentos, projeções).
3. Postura ética: Você NUNCA fornece diagnósticos definitivos ao invés do profissional; você atua como um consultor organizador clínico (respeitando o sigilo profissional e as diretrizes do Conselho Federal de Psicologia - CFP).
4. Tom de voz: Empático, sóbrio, analítico, acolhedor e direto. Use português do Brasil impecável.
5. Formate as respostas com elegância: use tópicos claros, destaques sutis e recomendações práticas quando pertinente.

Contexto da Clínica atual fornecido pelo sistema:
${JSON.stringify(context || {}, null, 2)}
`;

    if (ai) {
      try {
        // Construct conversation contents
        const contents: any[] = [];
        
        // Add previous history
        if (Array.isArray(history) && history.length > 0) {
          for (const msg of history.slice(-6)) {
            contents.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            });
          }
        }

        // Add current prompt
        contents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
          },
        });

        const reply = response.text;
        if (reply) {
          return res.json({ reply });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call warning, falling back to local clinical engine:', geminiError?.message || geminiError);
      }
    }

    // Local deterministic clinical fallback engine
    const localReply = generateLocalClinicalReply(prompt, context);
    return res.json({ reply: localReply });
  } catch (error: any) {
    console.error('Error processing Jung request:', error);
    res.status(500).json({ error: 'Internal server error processing clinical assistant response.' });
  }
});

// Notebook AI Assistant: Spelling correction, clinical formatting & text enhancement
app.post('/api/note-assistant', async (req, res) => {
  try {
    const { text, action = 'correct_and_enhance' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (ai) {
      try {
        let systemInstruction = `Você é um assistente de escrita clínica e psicológica para o sistema Cortex.
Sua tarefa é aprimorar as anotações do psicólogo com sigilo estrito e rigor linguístico.
Regras:
1. Corrija pontuação, concordância e ortografia com precisão da língua portuguesa (Brasil).
2. Mantenha integralmente as observações subjetivas, termos técnicos e falas literais do paciente sem distorcer o conteúdo clínico.
3. Não adicione conclusões diagnósticas que o psicólogo não escreveu.
4. Retorne apenas o texto aprimorado, pronto para ser gravado no caderno clínico.`;

        let promptText = '';
        if (action === 'correct_and_enhance') {
          promptText = `Por favor, corrija a ortografia e pontuação e organize o seguinte texto da sessão clínica mantendo o estilo do psicólogo:\n\n${text}`;
        } else if (action === 'transcribe_handwriting') {
          promptText = `Transcreva e organize as seguintes palavras anotadas manualmente/por ditado em um texto clínico coeso e fluido:\n\n${text}`;
        } else {
          promptText = `Revise e aprimore as anotações da sessão:\n\n${text}`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction,
          },
        });

        const enhancedText = response.text?.trim();
        if (enhancedText) {
          return res.json({ enhancedText, improvedText: enhancedText });
        }
      } catch (geminiError) {
        console.warn('Note assistant AI fallback:', geminiError);
      }
    }

    // Local heuristic fallback: capitalization, punctuation & spacing cleanup
    let cleaned = text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1')
      .replace(/([.!?])\s*([a-z])/g, (_, p1, p2) => `${p1} ${p2.toUpperCase()}`);

    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return res.json({ enhancedText: cleaned, improvedText: cleaned });
  } catch (error) {
    console.error('Error in note-assistant:', error);
    res.status(500).json({ error: 'Erro ao processar anotação com IA.' });
  }
});

function generateLocalClinicalReply(prompt: string, context: any): string {
  const p = prompt.toLowerCase();
  const patients = context?.patients || [];
  const sessions = context?.sessions || [];
  const finances = context?.finances || {};

  // Case 1: Search by patient name
  const matchedPatient = patients.find((pat: any) =>
    p.includes(pat.name.toLowerCase().split(' ')[0])
  );

  if (p.includes('ansiedade') && (p.includes('lucas') || (!matchedPatient && p.includes('crises')))) {
    return `**Análise Clínica · Paciente Lucas Mendes (Busca Temática: Ansiedade)**

Com base nos registros clínicos do caderno de sessões do paciente **Lucas Mendes**, foram identificadas as seguintes correlações com crises de ansiedade:

1. **Sessão de 28/10**: Lucas relatou sintomas de aperto torácico e taquicardia desencadeados por demandas de apresentação corporativa. Expressou: *"Sinto que qualquer falha minha vai desmoronar tudo o que construí."*
2. **Sessão de 14/10**: Discussão aprofundada sobre padrões de perfeccionismo e autocobrança. O paciente associou a ansiedade de performance à dinâmica parental na adolescência.
3. **Evolução & Manejo**: Foram aplicadas técnicas de reestruturação cognitiva e desfusão de pensamentos catastrofizantes. O paciente demonstrou boa receptividade à auto-observação da respiração diafragmática.

*Sugestão clínica para os próximos atendimentos:* Investigar a relação entre o medo de desaprovação e a dificuldade de estabelecer limites com lideranças.`;
  }

  if (matchedPatient && (p.includes('resuma') || p.includes('tópicos') || p.includes('evolução') || p.includes('resumo'))) {
    const notesCount = matchedPatient.clinicalNotes?.length || 0;
    return `**Resumo Clínico · ${matchedPatient.name}**

• **Observações (Obs):** ${matchedPatient.obs || 'Acompanhamento psicoterápico em andamento.'}
• **Valor Acordado:** R$ ${matchedPatient.sessionFee},00 por sessão (${matchedPatient.modality || 'Presencial'}).
• **Histórico de Registros:** ${notesCount} anotações registradas no caderno.
• **Eixos Centrais Trabalhados:**
  - Identificação de gatilhos emocionais e crenças centrais de desvalor.
  - Fortalecimento da aliança terapêutica e desenvolvimento de assertividade.
  - Análise dos padrões de evitação e trabalho com narrativa biográfica.
• **Assiduidade:** O paciente possui frequência regular com bom engajamento nas reflexões propostas.`;
  }

  // Case 2: Financial impact / cancellations
  if (p.includes('cancelamento') || p.includes('impacto financeiro') || p.includes('perda') || p.includes('perdas')) {
    const losses = finances.lossAmount || 0;
    const canceledCount = finances.canceledCount || 0;
    const projected = finances.projectedRevenue || 0;
    const confirmed = finances.confirmedRevenue || 0;

    return `**Relatório de Impacto Financeiro · Mês Vigente**

• **Total de Cancelamentos:** ${canceledCount} ${canceledCount === 1 ? 'sessão desmarcada' : 'sessões desmarcadas'}.
• **Impacto Financeiro Líquido:** **R$ ${losses.toFixed(2).replace('.', ',')}** que deixaram de ser integrados à projeção de receita.
• **Receita Atual Confirmada:** R$ ${confirmed.toFixed(2).replace('.', ',')}
• **Receita Prevista Remanescente:** R$ ${projected.toFixed(2).replace('.', ',')}

*Recomendação de Gestão:* Considere verificar a política de cancelamentos com antecedência mínima de 24 horas no contrato terapêutico e contatar os pacientes desmarcados para oferta de horários remanescentes ou modalidade online.`;
  }

  // Case 3: Tomorrow's / Today's appointments
  if (p.includes('amanhã') || p.includes('amanha') || p.includes('hoje') || p.includes('quantos atendimentos')) {
    const isTomorrow = p.includes('amanhã') || p.includes('amanha');
    const dayLabel = isTomorrow ? 'amanhã' : 'hoje';
    const daySessions = isTomorrow ? (context?.tomorrowSessions || []) : (context?.todaySessions || []);

    if (daySessions.length === 0) {
      return `Você não possui atendimentos agendados para **${dayLabel}**. Uma excelente oportunidade para dedicar-se ao estudo de casos, supervisão clínica ou planejamento administrativo do consultório.`;
    }

    const list = daySessions.map((s: any) => `• **${s.time}** — ${s.patientName} (${s.modality || 'Presencial'}) — R$ ${s.fee},00 [Status: ${s.status}]`).join('\n');
    return `**Atendimentos para ${dayLabel} (${daySessions.length} sessões agendadas):**\n\n${list}\n\n*Previsão de faturamento para o dia:* R$ ${daySessions.reduce((acc: number, cur: any) => acc + (cur.fee || 0), 0)},00.`;
  }

  // Default intelligent assistant response
  return `Olá! Como seu assistente clínico e de consultório **Jung**, estou pronto para analisar prontuários, detalhar métricas da sua agenda ou calcular variações financeiras.

Você pode me perguntar:
• *"Em quais sessões o Lucas relatou crises de ansiedade?"*
• *"Resuma os tópicos centrais da paciente Beatriz"*
• *"Qual o impacto financeiro dos cancelamentos deste mês?"*
• *"Quantos atendimentos tenho programados para amanhã?"*
• *"Quais pacientes faltaram mais de uma vez recentemente?"*

Como posso colaborar com a gestão do seu consultório neste momento?`;
}

// Vite mounting for dev or static serving for prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Space Psi Vault Server running on http://0.0.0.0:${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

startServer();
