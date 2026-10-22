import React, { useState } from 'react';
import { Zap, CheckCircle2, Target, Clock, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INTENSITY_LEVELS } from '../../data/curriculum';

export const MentorIntensity: React.FC = () => {
  const { intensityLevel, setIntensityLevel, currentIntensity, studentName } = useApp();
  const [justUpdated, setJustUpdated] = useState(false);

  const handleSelectLevel = (level: number) => {
    setIntensityLevel(level);
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Overview Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Zap size={22} color="#f59e0b" fill="#f59e0b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Çalışma Yoğunluk Kontrolü</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              Öğrencinin temposuna ve okul sınav durumuna göre 5 kademeden birini seçin. Seçtiğiniz seviye
              anında öğrencinin günlük soru bütçesini ve AI haftalık planını günceller.
            </p>
          </div>

          <div
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentIntensity.badgeColor}`,
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>AKTİF SEVİYE</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: currentIntensity.badgeColor }}>
              Seviye {currentIntensity.level}: {currentIntensity.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Hedef: {currentIntensity.dailyQuestions} Soru • {currentIntensity.dailyMinutes} Dk / Gün
            </div>
          </div>
        </div>

        {justUpdated && (
          <div
            style={{
              marginTop: '16px',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#6ee7b7',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={18} />
            <span>Yoğunluk seviyesi güncellendi! Öğrenci için yeni günlük hedef uygulandı.</span>
          </div>
        )}
      </div>

      {/* 5-Level Interactive Buttons Group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {INTENSITY_LEVELS.map((lvl) => {
          const isSelected = lvl.level === intensityLevel;

          return (
            <div
              key={lvl.level}
              onClick={() => handleSelectLevel(lvl.level)}
              className="glass-panel glass-card-interactive"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(99, 102, 241, 0.15) 100%)'
                  : 'rgba(15, 23, 42, 0.7)',
                border: isSelected ? `2px solid ${lvl.badgeColor}` : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? `0 8px 24px -4px ${lvl.badgeColor}40` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Level Circle */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: isSelected ? lvl.badgeColor : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? '#000' : lvl.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.3rem',
                  }}
                >
                  {lvl.level}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{lvl.name}</h3>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: `${lvl.badgeColor}25`,
                          color: lvl.badgeColor,
                          border: `1px solid ${lvl.badgeColor}`,
                        }}
                      >
                        AKTİF
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {lvl.description}
                  </p>
                </div>
              </div>

              {/* Targets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GÜNLÜK HEDEF</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: lvl.badgeColor }}>
                    {lvl.dailyQuestions} Soru
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MİNİMUM SÜRE</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    {lvl.dailyMinutes} Dk
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ minWidth: '90px' }}
                >
                  {isSelected ? 'Seçili' : 'Seç'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
