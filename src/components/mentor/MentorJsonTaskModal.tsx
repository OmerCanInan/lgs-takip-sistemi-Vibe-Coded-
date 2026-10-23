import React, { useState, useMemo } from 'react';
import {
  Code2,
  Check,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Send,
  X,
  BookOpen,
  Layers,
  HelpCircle,
  Copy,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { CURRICULUM_TOPICS } from '../../data/curriculum';
import type { SubjectName, TaskQuestion } from '../../types';

interface MentorJsonTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// User-provided sample JSON for quick testing
export const SAMPLE_LGS_QUIZ_JSON = `{
  "sinav_adi": "LGS Matematik 1. Dönem Ara Değerlendirme",
  "soru_sayisi": 20,
  "mufredat_kapsami": [
    "Çarpanlar ve Katlar",
    "EBOB ve EKOK",
    "Üslü İfadeler"
  ],
  "sorular": [
    {
      "id": 1,
      "konu": "Çarpanlar ve Katlar",
      "soru_metni": "72 sayısının asal çarpanlarının üslü ifadelerin çarpımı şeklinde yazılışı aşağıdakilerden hangisidir?",
      "secenekler": {
        "A": "2³ × 3²",
        "B": "2² × 3³",
        "C": "2⁴ × 3",
        "D": "2³ × 9"
      },
      "dogru_cevap": "A",
      "cozum": "72 = 2 × 2 × 2 × 3 × 3 = 2³ × 3². D seçeneği de 72'ye eşittir ama 9 asal sayı olmadığı için asal çarpanlara ayrılmış hâli değildir."
    },
    {
      "id": 2,
      "konu": "Çarpanlar ve Katlar",
      "soru_metni": "84 sayısının kaç tane pozitif tam sayı çarpanı vardır?",
      "secenekler": {
        "A": 8,
        "B": 10,
        "C": 12,
        "D": 16
      },
      "dogru_cevap": "C",
      "cozum": "84'ün çarpanları: 1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84. Toplam 12 tanedir."
    },
    {
      "id": 3,
      "konu": "Çarpanlar ve Katlar",
      "soru_metni": "Bir beden eğitimi öğretmeni 48 öğrenciyi, her grupta eşit sayıda öğrenci olacak şekilde gruplara ayıracaktır. Her grupta en az 3, en fazla 12 öğrenci olacağına göre öğretmen öğrencileri kaç farklı şekilde gruplandırabilir?",
      "secenekler": {
        "A": 4,
        "B": 5,
        "C": 6,
        "D": 7
      },
      "dogru_cevap": "B",
      "cozum": "Gruptaki öğrenci sayısı 48'in bir çarpanı olmalıdır. 48'in çarpanlarından 3 ile 12 arasında olanlar: 3, 4, 6, 8, 12. Toplam 5 farklı gruplandırma yapılabilir."
    },
    {
      "id": 4,
      "konu": "Çarpanlar ve Katlar",
      "soru_metni": "Aşağıdaki sayı çiftlerinden hangisi aralarında asal değildir?",
      "secenekler": {
        "A": "8 ile 15",
        "B": "9 ile 28",
        "C": "14 ile 21",
        "D": "16 ile 27"
      },
      "dogru_cevap": "C",
      "cozum": "14 ve 21 sayılarının 1'den başka ortak böleni 7'dir. Bu yüzden aralarında asal değildir. Diğer çiftlerin 1'den başka ortak böleni yoktur."
    },
    {
      "id": 5,
      "konu": "EBOB - EKOK",
      "soru_metni": "Uzunlukları 48 metre ve 72 metre olan iki kumaş, hiç artmayacak şekilde eşit uzunlukta parçalara ayrılacaktır. Buna göre en az kaç parça kumaş elde edilir?",
      "secenekler": {
        "A": 5,
        "B": 6,
        "C": 10,
        "D": 12
      },
      "dogru_cevap": "A",
      "cozum": "En az parça için parça uzunluğu en büyük olmalıdır: EBOB(48, 72) = 24 m. Parça sayısı = 48/24 + 72/24 = 2 + 3 = 5."
    },
    {
      "id": 6,
      "konu": "EBOB - EKOK",
      "soru_metni": "Bir okuldaki öğrenciler 6'şar, 8'er ve 10'ar kişilik gruplara ayrıldığında her seferinde son grubu tamamlamak için 1 öğrenci eksik kalmaktadır. Öğrenci sayısı 150'den az olduğuna göre okulda kaç öğrenci vardır?",
      "secenekler": {
        "A": 59,
        "B": 119,
        "C": 121,
        "D": 241
      },
      "dogru_cevap": "B",
      "cozum": "Öğrenci sayısının 1 fazlası 6, 8 ve 10'un ortak katıdır. EKOK(6, 8, 10) = 120. Öğrenci sayısı = 120 − 1 = 119. Bir sonraki değer 239 olur ve 150'den büyüktür."
    },
    {
      "id": 7,
      "konu": "EBOB - EKOK",
      "soru_metni": "Eni 90 cm, boyu 150 cm olan dikdörtgen şeklindeki bir duvar, hiç boşluk kalmadan birbirine eş ve olabildiğince büyük kare fayanslarla kaplanacaktır. Bu iş için kaç fayans gerekir?",
      "secenekler": {
        "A": 12,
        "B": 18,
        "C": 20,
        "D": 15
      },
      "dogru_cevap": "D",
      "cozum": "Fayansın kenarı EBOB(90, 150) = 30 cm olur. Ene 90/30 = 3, boya 150/30 = 5 fayans sığar. Toplam 3 × 5 = 15 fayans."
    },
    {
      "id": 8,
      "konu": "EBOB - EKOK",
      "soru_metni": "Kısa kenarı 12 cm, uzun kenarı 18 cm olan dikdörtgen kartlar, hepsi aynı yönde olacak şekilde yan yana ve alt alta dizilerek bir kare oluşturulacaktır. Bunun için en az kaç kart gerekir?",
      "secenekler": {
        "A": 4,
        "B": 9,
        "C": 12,
        "D": 6
      },
      "dogru_cevap": "D",
      "cozum": "Karenin kenarı en az EKOK(12, 18) = 36 cm olur. Bir kenara 36/12 = 3, diğer kenara 36/18 = 2 kart sığar. Toplam 3 × 2 = 6 kart."
    },
    {
      "id": 9,
      "konu": "EBOB - EKOK",
      "soru_metni": "İki sayının EBOB'u 6, EKOK'u 90'dır. Bu sayılardan biri 18 olduğuna göre diğeri kaçtır?",
      "secenekler": {
        "A": 15,
        "B": 24,
        "C": 30,
        "D": 36
      },
      "dogru_cevap": "C",
      "cozum": "İki sayının çarpımı = EBOB × EKOK. 18 × x = 6 × 90 = 540, x = 30. Kontrol: EBOB(18, 30) = 6, EKOK(18, 30) = 90."
    },
    {
      "id": 10,
      "konu": "EBOB - EKOK",
      "soru_metni": "Bir duraktan A hattı otobüsleri 12 dakikada bir, B hattı otobüsleri 18 dakikada bir kalkmaktadır. İki hattın otobüsleri saat 07:30'da birlikte kalktığına göre saat 10:00'a kadar kaç kez daha birlikte kalkarlar?",
      "secenekler": {
        "A": 3,
        "B": 4,
        "C": 5,
        "D": 6
      },
      "dogru_cevap": "B",
      "cozum": "EKOK(12, 18) = 36 dakikada bir birlikte kalkarlar: 08:06, 08:42, 09:18, 09:54. Bir sonraki 10:30 olur. Toplam 4 kez."
    },
    {
      "id": 11,
      "konu": "Üslü İfadeler",
      "soru_metni": "(−2)³ + (−2)² − 2⁰ işleminin sonucu kaçtır?",
      "secenekler": {
        "A": -5,
        "B": -3,
        "C": 3,
        "D": 11
      },
      "dogru_cevap": "A",
      "cozum": "(−2)³ = −8 (tek kuvvet, işaret korunur), (−2)² = 4 (çift kuvvet, sonuç pozitif), 2⁰ = 1. İşlem: −8 + 4 − 1 = −5."
    },
    {
      "id": 12,
      "konu": "Üslü İfadeler",
      "soru_metni": "(2⁻²)³ ifadesinin değeri kaçtır?",
      "secenekler": {
        "A": "64",
        "B": "1/12",
        "C": "1/32",
        "D": "1/64"
      },
      "dogru_cevap": "D",
      "cozum": "Üssün üssü alınırken üsler çarpılır: (2⁻²)³ = 2⁻⁶ = 1/2⁶ = 1/64."
    },
    {
      "id": 13,
      "konu": "Üslü İfadeler",
      "soru_metni": "3¹⁰ + 3¹⁰ + 3¹⁰ toplamı aşağıdakilerden hangisine eşittir?",
      "secenekler": {
        "A": "9¹⁰",
        "B": "3³⁰",
        "C": "3¹¹",
        "D": "9³⁰"
      },
      "dogru_cevap": "C",
      "cozum": "Üç tane 3¹⁰'un toplamı 3 × 3¹⁰ = 3¹ × 3¹⁰ = 3¹¹ olur."
    },
    {
      "id": 14,
      "konu": "Üslü İfadeler",
      "soru_metni": "a = 2⁵ olduğuna göre 4³ × 8 ifadesinin a türünden eşiti aşağıdakilerden hangisidir?",
      "secenekler": {
        "A": "4a",
        "B": "8a",
        "C": "16a",
        "D": "a²"
      },
      "dogru_cevap": "C",
      "cozum": "4³ × 8 = (2²)³ × 2³ = 2⁶ × 2³ = 2⁹. 2⁹ = 2⁵ × 2⁴ = a × 16 = 16a."
    },
    {
      "id": 15,
      "konu": "Üslü İfadeler",
      "soru_metni": "4,07 sayısının 10'un kuvvetleri kullanılarak çözümlenmiş hâli aşağıdakilerden hangisidir?",
      "secenekler": {
        "A": "4 × 10⁰ + 7 × 10⁻¹",
        "B": "4 × 10⁰ + 7 × 10⁻²",
        "C": "4 × 10¹ + 7 × 10⁻²",
        "D": "4 × 10⁻¹ + 7 × 10⁻²"
      },
      "dogru_cevap": "B",
      "cozum": "4 birler basamağındadır: 4 × 10⁰. 7 yüzde birler basamağındadır: 7 × 10⁻². Onda birler basamağı 0 olduğu için yazılmaz."
    },
    {
      "id": 16,
      "konu": "Üslü İfadeler",
      "soru_metni": "3 600 000 sayısının bilimsel gösterimi aşağıdakilerden hangisidir?",
      "secenekler": {
        "A": "36 × 10⁵",
        "B": "0,36 × 10⁷",
        "C": "3,6 × 10⁵",
        "D": "3,6 × 10⁶"
      },
      "dogru_cevap": "D",
      "cozum": "Bilimsel gösterimde katsayı 1'e eşit veya 1'den büyük, 10'dan küçük olmalıdır. Virgül 6 basamak sola kaydırılır: 3,6 × 10⁶. A ve B sayıya eşittir ama katsayı kurala uymaz."
    },
    {
      "id": 17,
      "konu": "Üslü İfadeler",
      "soru_metni": "Işık saniyede yaklaşık 3 × 10⁸ metre yol alır. Güneş'ten çıkan ışık Dünya'ya yaklaşık 500 saniyede ulaştığına göre Güneş ile Dünya arasındaki uzaklık yaklaşık kaç metredir?",
      "secenekler": {
        "A": "1,5 × 10¹⁰",
        "B": "15 × 10¹¹",
        "C": "1,5 × 10¹²",
        "D": "1,5 × 10¹¹"
      },
      "dogru_cevap": "D",
      "cozum": "Yol = hız × zaman = 3 × 10⁸ × 5 × 10² = 15 × 10¹⁰. Bilimsel gösterimle 1,5 × 10¹¹ metre."
    },
    {
      "id": 18,
      "konu": "Üslü İfadeler",
      "soru_metni": "Kapasitesi 2³² bayt olan bir belleğe, her biri 2²⁰ bayt büyüklüğünde olan dosyalardan en fazla kaç tane kaydedilebilir?",
      "secenekler": {
        "A": "2¹²",
        "B": "2¹⁶",
        "C": "2⁵²",
        "D": "2⁸"
      },
      "dogru_cevap": "A",
      "cozum": "Dosya sayısı = 2³² ÷ 2²⁰. Tabanları aynı üslü ifadeler bölünürken üsler çıkarılır: 2³²⁻²⁰ = 2¹²."
    },
    {
      "id": 19,
      "konu": "Üslü İfadeler",
      "soru_metni": "a = 2⁻³, b = 3⁻², c = 4⁻¹ olduğuna göre a, b ve c'nin küçükten büyüğe doğru sıralanışı aşağıdakilerden hangisidir?",
      "secenekler": {
        "A": "a < b < c",
        "B": "b < a < c",
        "C": "c < a < b",
        "D": "b < c < a"
      },
      "dogru_cevap": "B",
      "cozum": "a = 1/8, b = 1/9, c = 1/4. Payları eşit kesirlerde paydası büyük olan küçüktür: 1/9 < 1/8 < 1/4, yani b < a < c."
    },
    {
      "id": 20,
      "konu": "Üslü İfadeler",
      "soru_metni": "(10⁻³ × 10⁵) ÷ 10⁻² işleminin sonucu aşağıdakilerden hangisidir?",
      "secenekler": {
        "A": "10⁴",
        "B": "10⁰",
        "C": "10²",
        "D": "10¹⁰"
      },
      "dogru_cevap": "A",
      "cozum": "Çarpmada üsler toplanır: 10⁻³⁺⁵ = 10². Bölmede üsler çıkarılır: 10²⁻⁽⁻²⁾ = 10⁴."
    }
  ]
}`;

export const MentorJsonTaskModal: React.FC<MentorJsonTaskModalProps> = ({ isOpen, onClose }) => {
  const { addMentorTask } = useApp();

  const [jsonInput, setJsonInput] = useState('');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectName>('Matematik');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [customNote, setCustomNote] = useState('');

  // Parse and validate JSON in real time
  const parseResult = useMemo(() => {
    const trimmed = jsonInput.trim();
    if (!trimmed) {
      return { isValid: false, error: null, examName: '', scope: [], questions: [] };
    }

    try {
      const data = JSON.parse(trimmed);

      // Extract exam title
      const examName = data.sinav_adi || data.title || data.test_adi || 'LGS Soru Paketi & Değerlendirme';

      // Extract scope topics
      let scope: string[] = [];
      if (Array.isArray(data.mufredat_kapsami)) {
        scope = data.mufredat_kapsami;
      } else if (Array.isArray(data.kapsam)) {
        scope = data.kapsam;
      } else if (Array.isArray(data.topics)) {
        scope = data.topics;
      }

      // Extract question list
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data.sorular)
        ? data.sorular
        : Array.isArray(data.questions)
        ? data.questions
        : [];

      if (rawList.length === 0) {
        return {
          isValid: false,
          error: 'JSON içerisinde "sorular" veya "questions" listesi bulunamadı.',
          examName,
          scope,
          questions: [],
        };
      }

      const questions: TaskQuestion[] = rawList.map((q: any, idx: number) => {
        const text = q.soru_metni || q.text || q.soru || q.question || '';
        const optionsRaw = q.secenekler || q.options || q.choices || {};

        let optA = String(optionsRaw.A ?? optionsRaw.a ?? '');
        let optB = String(optionsRaw.B ?? optionsRaw.b ?? '');
        let optC = String(optionsRaw.C ?? optionsRaw.c ?? '');
        let optD = String(optionsRaw.D ?? optionsRaw.d ?? '');

        // If options are an array ['...', '...', '...', '...']
        if (Array.isArray(optionsRaw)) {
          optA = String(optionsRaw[0] ?? '');
          optB = String(optionsRaw[1] ?? '');
          optC = String(optionsRaw[2] ?? '');
          optD = String(optionsRaw[3] ?? '');
        }

        const correctRaw = String(q.dogru_cevap || q.correct_answer || q.answer || q.dogru || '').toUpperCase().trim();
        const correctOption: 'A' | 'B' | 'C' | 'D' | undefined = ['A', 'B', 'C', 'D'].includes(correctRaw)
          ? (correctRaw as 'A' | 'B' | 'C' | 'D')
          : undefined;

        const explanation = q.cozum || q.explanation || q.aciklama || '';
        const imageUrl = q.gorsel_url || q.image_url || q.imageUrl || undefined;

        return {
          id: `q-json-${idx + 1}-${Date.now()}`,
          questionNumber: idx + 1,
          text,
          imageUrl,
          options: {
            A: optA,
            B: optB,
            C: optC,
            D: optD,
          },
          correctOption,
          explanation,
        };
      });

      // Auto-detect subject if mentioned in exam title
      let autoSubject: SubjectName | null = null;
      const lowerTitle = examName.toLowerCase();
      if (lowerTitle.includes('matematik')) autoSubject = 'Matematik';
      else if (lowerTitle.includes('fen')) autoSubject = 'Fen Bilimleri';
      else if (lowerTitle.includes('türkçe') || lowerTitle.includes('turkce')) autoSubject = 'Türkçe';
      else if (lowerTitle.includes('inkılap') || lowerTitle.includes('inkilap')) autoSubject = 'T.C. İnkılap Tarihi';
      else if (lowerTitle.includes('din')) autoSubject = 'Din Kültürü';
      else if (lowerTitle.includes('ingilizce')) autoSubject = 'İngilizce';

      return {
        isValid: true,
        error: null,
        examName,
        scope,
        questions,
        autoSubject,
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: `JSON Sözdizimi Hatası: ${err.message}`,
        examName: '',
        scope: [],
        questions: [],
      };
    }
  }, [jsonInput]);

  // When auto-subject is detected from new valid JSON, update subject
  React.useEffect(() => {
    if (parseResult.autoSubject) {
      setSelectedSubject(parseResult.autoSubject);
    }
  }, [parseResult.autoSubject]);

  if (!isOpen) return null;

  const handlePasteSample = () => {
    setJsonInput(SAMPLE_LGS_QUIZ_JSON);
    setActiveTab('preview');
  };

  const handleClear = () => {
    setJsonInput('');
    setActiveTab('editor');
  };

  const handleSubmitTask = () => {
    if (!parseResult.isValid || parseResult.questions.length === 0) return;

    // Pick a matched topic or fallback
    const matchedTopic =
      CURRICULUM_TOPICS.find((t) => t.subject === selectedSubject && parseResult.scope.some((s) => t.topicName.toLowerCase().includes(s.toLowerCase()))) ||
      CURRICULUM_TOPICS.find((t) => t.subject === selectedSubject);

    const topicName = parseResult.scope.length > 0 ? parseResult.scope.join(', ') : matchedTopic?.topicName || selectedSubject;
    const topicId = matchedTopic?.id || `${selectedSubject.toLowerCase().slice(0, 3)}-1`;

    addMentorTask({
      title: parseResult.examName,
      subject: selectedSubject,
      topicId,
      topicName,
      targetCount: parseResult.questions.length,
      targetDate,
      taskType: 'quiz',
      questions: parseResult.questions,
      mentorNote: customNote.trim() || `Mentor tarafından JSON formatında hazırlanan ${parseResult.questions.length} soruluk değerlendirme sınavı.`,
    });

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch {}

    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Code2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>JSON ile Sınav & Test Paketi Yükle</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Otomatik İçe Aktarma
                </span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ChatGPT, Gemini veya arşivinizdeki hazır LGS soru JSON'ını yapıştırın; anında interaktif teste dönüştürün.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Controls & Settings */}
        <div
          style={{
            padding: '14px 24px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'editor' ? '1px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.1)',
                background: activeTab === 'editor' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === 'editor' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Code2 size={15} />
              <span>JSON Editörü</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'preview' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                background: activeTab === 'preview' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: activeTab === 'preview' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <BookOpen size={15} />
              <span>Canlı Soru Önizleme ({parseResult.questions.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePasteSample}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px', fontSize: '0.78rem', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#c7d2fe' }}
              title="20 Soruluk Örnek LGS Matematik Değerlendirme Testini Yükle"
            >
              <Sparkles size={14} color="#818cf8" />
              <span>Örnek LGS Formatını Yapıştır (20 Soru)</span>
            </button>

            {jsonInput && (
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary btn-sm"
                style={{ gap: '4px', fontSize: '0.78rem', color: '#fca5a5' }}
              >
                <Trash2 size={14} />
                <span>Temizle</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* Target Metadata Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '18px',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <label className="input-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                Ders
              </label>
              <select
                className="input-field"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as SubjectName)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <option value="Matematik">Matematik</option>
                <option value="Fen Bilimleri">Fen Bilimleri</option>
                <option value="Türkçe">Türkçe</option>
                <option value="T.C. İnkılap Tarihi">T.C. İnkılap Tarihi</option>
                <option value="Din Kültürü">Din Kültürü</option>
                <option value="İngilizce">İngilizce</option>
              </select>
            </div>

            <div>
              <label className="input-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                Hedef Çözüm Tarihi (Termin)
              </label>
              <input
                type="date"
                className="input-field"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label className="input-label" style={{ fontSize: '0.78rem', marginBottom: '4px' }}>
                Öğrenciye Özel Mentor Notu (İsteğe Bağlı)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Örn: Süre tutarak çöz, 1. dönemi tarama testi."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Validation Status Notice */}
          {parseResult.error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} color="#ef4444" />
              <span>{parseResult.error}</span>
            </div>
          )}

          {parseResult.isValid && parseResult.questions.length > 0 && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>
                  <strong>"{parseResult.examName}"</strong> başarıyla çözümlendi: Toplam <strong>{parseResult.questions.length} soru</strong> hazır.
                </span>
              </div>
              {parseResult.scope.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {parseResult.scope.map((topic, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content: Editor vs Preview */}
          {activeTab === 'editor' ? (
            <div>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="input-field"
                  rows={15}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`JSON verinizi buraya yapıştırın. Örnek şema:\n{\n  "sinav_adi": "LGS Matematik Denemesi",\n  "soru_sayisi": 20,\n  "mufredat_kapsami": ["Çarpanlar ve Katlar", "Üslü İfadeler"],\n  "sorular": [\n    {\n      "id": 1,\n      "konu": "Çarpanlar ve Katlar",\n      "soru_metni": "Soru metni...",\n      "secenekler": {\n        "A": "Seçenek 1",\n        "B": "Seçenek 2",\n        "C": "Seçenek 3",\n        "D": "Seçenek 4"\n      },\n      "dogru_cevap": "A",\n      "cozum": "Açıklamalı soru çözümü..."\n    }\n  ]\n}`}
                  style={{
                    fontFamily: 'Consolas, "Fira Code", monospace',
                    fontSize: '0.82rem',
                    lineHeight: '1.5',
                    background: '#090d16',
                    borderColor: parseResult.error ? 'rgba(239, 68, 68, 0.5)' : parseResult.isValid ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-subtle)',
                    padding: '16px',
                    borderRadius: '12px',
                    tabSize: 2,
                  }}
                  spellCheck={false}
                />
              </div>
            </div>
          ) : (
            /* Live Question Cards Preview */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {parseResult.questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Önizleme için lütfen geçerli bir JSON yapıştırın veya yukarıdaki <strong>"Örnek LGS Formatını Yapıştır"</strong> butonuna basın.
                </div>
              ) : (
                parseResult.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                        }}
                      >
                        Soru {q.questionNumber}
                      </span>

                      {q.correctOption && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          Doğru Cevap: {q.correctOption}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#f8fafc', marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
                      {q.text}
                    </p>

                    {/* Options Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                        const isCorrect = q.correctOption === opt;
                        return (
                          <div
                            key={opt}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '0.84rem',
                              background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                              border: isCorrect ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.06)',
                              color: isCorrect ? '#6ee7b7' : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <span
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                background: isCorrect ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                                color: isCorrect ? '#fff' : 'inherit',
                              }}
                            >
                              {opt}
                            </span>
                            <span>{q.options[opt]}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Solution/Explanation */}
                    {q.explanation && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(99, 102, 241, 0.08)',
                          borderLeft: '3px solid #818cf8',
                          fontSize: '0.8rem',
                          color: '#c7d2fe',
                        }}
                      >
                        <strong>💡 Çözüm: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.98)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {parseResult.isValid ? (
              <span style={{ color: '#34d399', fontWeight: 600 }}>
                ✓ {parseResult.questions.length} Soru öğrenciye atanmaya hazır
              </span>
            ) : (
              <span>Geçerli bir JSON yapıştırıp öğrenciye atayabilirsiniz.</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Vazgeç
            </button>

            <button
              type="button"
              onClick={handleSubmitTask}
              disabled={!parseResult.isValid || parseResult.questions.length === 0}
              className="btn btn-primary"
              style={{
                gap: '8px',
                padding: '12px 24px',
                opacity: !parseResult.isValid || parseResult.questions.length === 0 ? 0.5 : 1,
                cursor: !parseResult.isValid || parseResult.questions.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={16} />
              <span>Öğrenciye Görevi Ata & Başlat ({parseResult.questions.length} Soru)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
