// Gemini API Service for LGS Takip Sistemi
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const SYSTEM_INSTRUCTION = `Sen, Türkiye'deki LGS (Liselere Geçiş Sınavı) için uzmanlaşmış bir yapay zeka eğitim koçusun. Adın "LGS Pusula Koç".

SENİN KİMLİĞİN:
- 8. sınıf öğrencilerine LGS hazırlığında birebir destek veren, deneyimli ve sabırlı bir öğretmensin.
- Türkçe konuşursun. Cevaplarında samimi ama profesyonel bir dil kullanırsın.
- Öğrenciyle "sen" diye konuşursun, arkadaşça ama saygılı bir ton kullanırsın.

UZMANLIK ALANLARIN (Sadece bu derslerle ilgili sorulara cevap ver):
1. Matematik (8. sınıf): Çarpanlar-Katlar, Üslü İfadeler, Kareköklü İfadeler, Cebirsel İfadeler, Doğrusal Denklemler, Eşitsizlikler, Olasılık, Veri Analizi, Üçgenler, Eşlik-Benzerlik, Dönüşüm Geometrisi, Geometrik Cisimler
2. Fen Bilimleri (8. sınıf): Mevsimler-İklim, DNA-Genetik Kod, Basınç, Madde ve Endüstri, Enerji Dönüşümleri, Elektrik Yükleri, Periyodik Sistem
3. Türkçe (8. sınıf): Sözcükte Anlam, Cümlede Anlam, Paragraf, Fiilimsiler, Cümle Türleri, Yazım-Noktalama
4. T.C. İnkılap Tarihi ve Atatürkçülük: Bir Kahraman Doğuyor, Milli Uyanış, Milli Mücadele, Türkiye Cumhuriyeti'nin Kuruluşu, Atatürk İlkeleri, Demokratikleşme
5. Din Kültürü ve Ahlak Bilgisi (8. sınıf): Kader, Hz. Muhammed'in Hayatı, Din ve Hayat
6. İngilizce (8. sınıf): Friendship, Teen Life, Cooking, Communication, The Internet, Adventures, Tourism, Chores

YANITLAMA KURALLARI:
- Sokratik yöntem kullan: Cevabı direkt verme, öğrenciyi adım adım düşündürerek doğru cevaba yönlendir.
- Kısa ve öz cevaplar ver. Maksimum 3-4 paragraf. Gereksiz tekrar yapma.
- Formül veya kural gerekiyorsa kısa, net ve doğru yaz.
- Öğrenciyi motive et ama abartma. Doğal ol.
- Emoji kullanabilirsin ama her cümlede değil, sadece vurgu için.
- Sorunun cevabını verdikten sonra ilgili ipucu veya benzer soru önerisi ekleyebilirsin.

YASAKLAR:
- LGS müfredatı dışında konu anlatma (lise konuları, üniversite, programlama, oyun vs. YASAK).
- Eğer öğrenci müfredat dışı soru sorarsa: "Bu konu LGS müfredatında yok, ama LGS'ye yönelik başka bir sorun varsa yardımcı olabilirim! 📚" de.
- Uydurma bilgi verme. Emin olmadığın konularda bunu belirt.
- Çok uzun cevaplar yazma.
- Öğrenciye doğrudan tam cevap verme, önce düşünmesini sağla.`;

/**
 * Send a chat message to Gemini and get AI response
 */
export async function sendMessageToGemini(
  userMessage: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  try {
    // Convert chat history to Gemini format and ensure alternating roles
    const rawHistory: GeminiMessage[] = chatHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Fix consecutive same-role messages (Gemini requires alternating user/model)
    const contents: GeminiMessage[] = [];
    for (const msg of rawHistory) {
      const lastMsg = contents[contents.length - 1];
      if (lastMsg && lastMsg.role === msg.role) {
        // Merge consecutive same-role messages
        lastMsg.parts[0].text += '\n' + msg.parts[0].text;
      } else {
        contents.push({ ...msg });
      }
    }

    // Add current user message
    const lastMsg = contents[contents.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      // Merge with last user message to prevent consecutive user turns
      lastMsg.parts[0].text += '\n' + userMessage;
    } else {
      contents.push({ role: 'user', parts: [{ text: userMessage }] });
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents,
        generationConfig: {
          temperature: 0.5,
          topP: 0.9,
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
  const prompt = `Aşağıdaki 8. sınıf LGS öğrencisinin verilerini analiz et ve Türkçe haftalık rapor oluştur.

ÖĞRENCİ VERİLERİ:
- Son çalışma logları: ${JSON.stringify(context.studyLogs.slice(-20))}
- Son deneme sınavları: ${JSON.stringify(context.exams.slice(-5))}
- Kesintisiz çalışma serisi: ${context.streakDays} gün

GÖREV: Bu verilere dayanarak samimi, motive edici ve gerçekçi bir haftalık rapor üret.

JSON CEVAP FORMATI (başka hiçbir şey yazma):
{
  "title": "Haftalık rapor başlığı (samimi ve motive edici)",
  "summary": "2-3 cümlelik genel değerlendirme. Öğrencinin güçlü ve zayıf yönlerini özetle.",
  "strengths": ["En az 2 güçlü yön - verilere dayalı somut gözlemler"],
  "weaknesses": ["En az 2 zayıf yön - verilere dayalı somut gözlemler"],
  "recommendations": ["En az 3 öneri - somut ve uygulanabilir tavsiyeler"]
}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: 'Sen LGS eğitim analisti ve koçusun. Sadece istenilen JSON formatında cevap ver, ekstra yazı ekleme.' }],
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response');

    const parsed = JSON.parse(text);
    // Validate required fields
    if (!parsed.title || !parsed.summary || !Array.isArray(parsed.strengths) || !Array.isArray(parsed.weaknesses) || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid response structure');
    }
    return parsed;
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

// Valid LGS subjects for validation
const VALID_SUBJECTS = ['Matematik', 'Fen Bilimleri', 'Türkçe', 'T.C. İnkılap Tarihi', 'Din Kültürü', 'İngilizce'];

// Real LGS curriculum topic names for each subject
const TOPIC_MAP: Record<string, string[]> = {
  'Matematik': ['Çarpanlar ve Katlar', 'Üslü İfadeler', 'Kareköklü İfadeler', 'Cebirsel İfadeler ve Özdeşlikler', 'Doğrusal Denklemler', 'Eşitsizlikler', 'Üçgenler', 'Eşlik ve Benzerlik', 'Dönüşüm Geometrisi', 'Geometrik Cisimler', 'Veri Analizi', 'Olasılık'],
  'Fen Bilimleri': ['Mevsimler ve İklim', 'DNA ve Genetik Kod', 'Basınç', 'Madde ve Endüstri', 'Enerji Dönüşümleri ve Çevre Bilimi', 'Elektrik Yükleri ve Elektrik Enerjisi', 'Periyodik Sistem'],
  'Türkçe': ['Sözcükte Anlam', 'Cümlede Anlam', 'Paragrafta Anlam', 'Fiilimsiler', 'Cümle Türleri', 'Söz Sanatları', 'Yazım ve Noktalama Kuralları'],
  'T.C. İnkılap Tarihi': ['Bir Kahraman Doğuyor', 'Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar', 'Milli Bir Destan: Ya İstiklal Ya Ölüm!', 'Atatürkçülük ve Çağdaşlaşan Türkiye', 'Demokratikleşme Çabaları', 'Atatürk Dönemi Türk Dış Politikası'],
  'Din Kültürü': ['Kader İnancı', 'Zekât ve Sadaka', 'Din ve Hayat', 'Hz. Muhammed\'in Örnekliği'],
  'İngilizce': ['Friendship', 'Teen Life', 'Cooking', 'Communication', 'The Internet', 'Adventures', 'Tourism', 'Chores'],
};

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
    ? `\nMENTÖR / KULLANICI TALİMATI (EN YÜKSEK ÖNCELİK):
"${customText}"

Bu talimatı mutlaka plana yansıt. Talimatta geçen derslere ve konulara özellikle odaklan.
Ders eşleştirme kuralları:
- Atatürk, inkılap, tarih, milli mücadele → subject: "T.C. İnkılap Tarihi"
- matematik, üslü, kareköklü, çarpanlar, denklem → subject: "Matematik"
- fen, basınç, dna, kalıtım, iklim, periyodik → subject: "Fen Bilimleri"
- paragraf, fiilimsi, dil bilgisi, sözcük → subject: "Türkçe"
- din, kader, zekat, hz. muhammed → subject: "Din Kültürü"
- ingilizce, friendship, teen life → subject: "İngilizce"\n`
    : '';

  const prompt = `8. sınıf LGS öğrencisi için haftalık çalışma planı oluştur. 2-4 arası görev üret.

ÖĞRENCİ VERİLERİ:
- Son çalışmalar: ${JSON.stringify(context.studyLogs.slice(-15))}
- Mevcut görevler: ${JSON.stringify(context.currentTasks.slice(-5))}
${instructionPart}
KURALLAR:
1. Zayıf konulara öncelik ver (yanlış oranı yüksek olanlar).
2. Varsa mentör talimatını en yüksek öncelikle planla.
3. Görev başlıklarını profesyonel yaz: "Konu Adı + Soru Çözümü + Soru Sayısı" formatı.
   Örnek: "Çarpanlar ve Katlar Pekiştirme 30 Soru", "DNA ve Genetik Kod Yeni Nesil 25 Soru"
4. targetCount: 20 ile 40 arası olsun.
5. subject alanı SADECE şunlardan biri: Matematik, Fen Bilimleri, Türkçe, T.C. İnkılap Tarihi, Din Kültürü, İngilizce
6. topicName alanı gerçek MEB 8. sınıf müfredat konu adı olmalı.

JSON ARRAY CEVAP VER (başka hiçbir şey yazma):
[
  { "title": "Görev Başlığı", "subject": "Ders Adı", "topicName": "Müfredat Konu Adı", "targetCount": 30 }
]`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: 'Sen LGS eğitim planlayıcısın. Sadece istenilen JSON array formatında cevap ver. Ekstra metin, markdown veya backtick EKLEME.' }],
        },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response');

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty or non-array response');

    // Validate and sanitize each task
    return parsed
      .filter((t: any) => t && t.title && t.subject && t.topicName && t.targetCount)
      .map((t: any) => {
        // Fix subject if invalid
        let subject = t.subject;
        if (!VALID_SUBJECTS.includes(subject)) {
          // Try to match
          const lower = subject.toLowerCase();
          if (lower.includes('matematik')) subject = 'Matematik';
          else if (lower.includes('fen')) subject = 'Fen Bilimleri';
          else if (lower.includes('türkçe')) subject = 'Türkçe';
          else if (lower.includes('tarih') || lower.includes('inkılap')) subject = 'T.C. İnkılap Tarihi';
          else if (lower.includes('din')) subject = 'Din Kültürü';
          else if (lower.includes('ingilizce')) subject = 'İngilizce';
          else subject = 'Matematik'; // fallback
        }

        // Clamp targetCount
        const targetCount = Math.min(50, Math.max(10, Number(t.targetCount) || 25));

        return {
          title: String(t.title).slice(0, 100),
          subject,
          topicName: String(t.topicName).slice(0, 80),
          targetCount,
        };
      })
      .slice(0, 5); // Max 5 tasks
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
