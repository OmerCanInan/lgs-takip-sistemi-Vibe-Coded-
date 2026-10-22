// Gemini API Service for LGS Takip Sistemi
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const SYSTEM_PROMPT = `Sen LGS (Liselere Geçiş Sınavı) için uzmanlaşmış bir yapay zeka koçusun. Türkçe konuşuyorsun.
Görevin 8. sınıf öğrencilerine LGS hazırlığında yardım etmek.

KRİTİK KURALLAR:
- Sokratik yöntem kullan: Cevabı direkt verme, öğrenciyi düşündürerek doğru cevaba yönlendir.
- Kısa ve öz cevaplar ver (en fazla 3-4 paragraf).
- LGS müfredatına uygun bilgi ver (8. sınıf seviyesi).
- Dersler: Matematik, Fen Bilimleri, Türkçe, T.C. İnkılap Tarihi, Din Kültürü, İngilizce.
- Motivasyon verici ve samimi bir dil kullan.
- Emoji kullanabilirsin ama abartma.
- Formül veya kural gerekiyorsa kısa ve net yaz.`;

/**
 * Send a chat message to Gemini and get AI response
 */
export async function sendMessageToGemini(
  userMessage: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  try {
    // Convert chat history to Gemini format
    const geminiHistory: GeminiMessage[] = chatHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Add system instruction as first user message if no history
    const contents: GeminiMessage[] = [];

    if (geminiHistory.length === 0) {
      contents.push({ role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nÖğrenci sorusu: ' + userMessage }] });
    } else {
      // Prepend system prompt to first message context
      contents.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + '\n\nÖğrenci sorusu: ' + geminiHistory[0].parts[0].text }],
      });
      if (geminiHistory.length > 1) {
        contents.push(...geminiHistory.slice(1));
      }
      contents.push({ role: 'user', parts: [{ text: userMessage }] });
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API hatası: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini yanıt vermedi');
    }

    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return 'Şu an yapay zeka hizmetine bağlanılamıyor. Lütfen biraz sonra tekrar dene. 🔄';
  }
}

/**
 * Generate a weekly analysis report using Gemini
 */
export async function generateWeeklyReportFromGemini(context: {
  studyLogs: { subject: string; correct: number; incorrect: number; blank: number; topicName: string; logDate: string }[];
  exams: { examName: string; totalNet: number; subjects: { subject: string; correct: number; incorrect: number; blank: number }[] }[];
  streakDays: number;
}): Promise<{
  title: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}> {
  const prompt = `Sen LGS hazırlık koçusun. Aşağıdaki öğrenci verilerini analiz edip haftalık rapor oluştur.

VERİLER:
- Çalışma logları: ${JSON.stringify(context.studyLogs.slice(-20))}
- Deneme sınavları: ${JSON.stringify(context.exams.slice(-5))}
- Çalışma serisi: ${context.streakDays} gün

CEVAP FORMATI (sadece JSON, başka bir şey yazma):
{
  "title": "Haftalık başlık",
  "summary": "Kısa genel değerlendirme (2-3 cümle)",
  "strengths": ["güçlü yön 1", "güçlü yön 2", "güçlü yön 3"],
  "weaknesses": ["zayıf yön 1", "zayıf yön 2"],
  "recommendations": ["öneri 1", "öneri 2", "öneri 3"]
}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response');

    return JSON.parse(text);
  } catch (error) {
    console.error('Weekly report generation failed:', error);
    return {
      title: `LGS Haftalık Analiz (${new Date().toLocaleDateString('tr-TR')})`,
      summary: 'Rapor oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.',
      strengths: ['Veri yetersiz — lütfen tekrar deneyin.'],
      weaknesses: ['Veri yetersiz — lütfen tekrar deneyin.'],
      recommendations: ['Daha fazla çalışma verisi girdikten sonra tekrar deneyin.'],
    };
  }
}

/**
 * Generate a weekly plan (draft tasks) using Gemini
 */
export async function generateWeeklyPlanFromGemini(context: {
  studyLogs: { subject: string; correct: number; incorrect: number; blank: number; topicName: string }[];
  currentTasks: { title: string; subject: string; isCompleted: boolean }[];
  customInstruction?: string;
}): Promise<{ title: string; subject: string; topicName: string; targetCount: number }[]> {
  const customText = context.customInstruction?.trim() || '';
  const instructionPart = customText
    ? `\nKULLANICI / MENTÖRÜN ÖZEL ROTA TALİMATI:
"${customText}"
ÖNEMLİ KURAL: Bu özel talebi MUTLAKA en yüksek öncelikle plana yansıt! 
- Eğer talimatta Atatürk, inkılap, milli mücadele, tarih geçiyorsa subject "T.C. İnkılap Tarihi" olmalıdır.
- Eğer matematik, üslü, kareköklü, çarpanlar geçiyorsa subject "Matematik" olmalıdır.
- Eğer fen, basınç, dna, kalıtım, iklim geçiyorsa subject "Fen Bilimleri" olmalıdır.
- Eğer paragraf, fiilimsi, dil bilgisi geçiyorsa subject "Türkçe" olmalıdır.
- Görev başlığını profesyonel bir LGS çalışma başlığı olarak yaz (Örn: "Bir Kahraman Doğuyor 30 Soru", "Cebirsel İfadeler Soru Çözümü 25 Soru"). Talimat cümlesini aynen başlığa yapıştırma!\n`
    : '';

  const prompt = `Sen LGS hazırlık koçusun. 8. sınıf öğrencisi için haftalık çalışma planı (2-4 görev) öner.

VERİLER:
- Son çalışmalar: ${JSON.stringify(context.studyLogs.slice(-15))}
- Mevcut görevler: ${JSON.stringify(context.currentTasks.slice(-5))}
${instructionPart}
Zayıf konulara ve varsa yukarıdaki özel talimata öncelik ver. LGS müfredatından gerçek konular seç.

CEVAP FORMATI (Sadece JSON array, kesinlikle başka hiçbir yazı veya markdown backtick ekleme):
[
  { "title": "Ders ve Konu Başlığı 30 Soru", "subject": "Ders adı", "topicName": "Müfredat Konu Adı", "targetCount": 30 }
]

Ders adları sadece şunlardan biri olabilir:
- Matematik
- Fen Bilimleri
- Türkçe
- T.C. İnkılap Tarihi
- Din Kültürü
- İngilizce`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response');

    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Weekly plan generation failed:', error);

    // Smart fallback based on custom text if API fails or network offline
    const lower = customText.toLowerCase();
    if (lower.includes('atatürk') || lower.includes('tarih') || lower.includes('inkılap')) {
      return [
        { title: "Bir Kahraman Doğuyor - Atatürk'ün Hayatı 30 Soru", subject: 'T.C. İnkılap Tarihi', topicName: 'Bir Kahraman Doğuyor', targetCount: 30 },
        { title: 'Milli Uyanış ve Bağımsızlık Yolunda 30 Soru', subject: 'T.C. İnkılap Tarihi', topicName: 'Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar', targetCount: 30 },
      ];
    } else if (lower.includes('fen') || lower.includes('basınç') || lower.includes('dna') || lower.includes('kalıtım')) {
      return [
        { title: 'DNA ve Genetik Kod Pekiştirme 30 Soru', subject: 'Fen Bilimleri', topicName: 'DNA ve Genetik Kod', targetCount: 30 },
        { title: 'Basınç Ünitesi Yeni Nesil Sorular 25 Soru', subject: 'Fen Bilimleri', topicName: 'Basınç', targetCount: 25 },
      ];
    } else if (lower.includes('türkçe') || lower.includes('paragraf') || lower.includes('fiilimsi')) {
      return [
        { title: 'Paragrafta Anlam ve Muhakeme 30 Soru', subject: 'Türkçe', topicName: 'Paragrafta Anlam', targetCount: 30 },
        { title: 'Fiilimsiler Soru Çözümü 25 Soru', subject: 'Türkçe', topicName: 'Fiilimsiler', targetCount: 25 },
      ];
    } else {
      return [
        { title: 'Çarpanlar ve Katlar Pekiştirme 30 Soru', subject: 'Matematik', topicName: 'Çarpanlar ve Katlar', targetCount: 30 },
        { title: 'Fen Bilimleri Mevsimler ve İklim 25 Soru', subject: 'Fen Bilimleri', topicName: 'Mevsimler ve İklim', targetCount: 25 },
      ];
    }
  }
}
