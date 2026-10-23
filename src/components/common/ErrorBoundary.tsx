import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleClearStorageAndReload = () => {
    try {
      localStorage.removeItem('lgs_questions');
      localStorage.removeItem('lgs_studyLogs');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#090d16',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>
              Beklenmedik Bir Durum Oluştu
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.5 }}>
              Yüklenen görsel veya veri önbellek sınırını aşmış olabilir. Aşağıdaki seçeneklerle sistemi hemen normale döndürebilirsiniz.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#f87171',
                  textAlign: 'left',
                  marginBottom: '20px',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                <span>Sayfayı Yenile</span>
              </button>

              <button
                onClick={this.handleClearStorageAndReload}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                }}
              >
                <Trash2 size={16} />
                <span>Soru Önbelleğini Sıfırla ve Aç</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
