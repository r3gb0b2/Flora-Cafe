
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- Nova Abordagem: Error Boundary ---
// Adicionado para capturar erros e evitar a tela branca.
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: '#FFFBEB' }}>
          <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #FEE2E2' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#B91C1C', marginBottom: '1rem' }}>Opa! Algo deu errado.</h1>
            <p style={{ color: '#4B5563', marginBottom: '0.5rem' }}>A aplicação encontrou um erro e não pôde continuar.</p>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Por favor, atualize a página. Se o problema persistir, verifique o console do navegador.</p>
            {this.state.error && (
              <pre style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.25rem', textAlign: 'left', fontSize: '0.75rem', color: '#991B1B', overflow: 'auto' }}>
                <code>{this.state.error.toString()}</code>
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
// --- Fim do Error Boundary ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
