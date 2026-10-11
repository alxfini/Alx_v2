import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function ErrorWrapper({ children }: { children: ReactNode }) {
  const [hasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-[#ebbf01]/10 border border-[#ebbf01]/30 flex items-center justify-center mb-6 text-[#ebbf01] text-2xl font-bold">
          !
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 font-heading">
          Instabilidade no carregamento
        </h1>
        <p className="text-neutral-400 text-sm max-w-md mb-6 leading-relaxed">
          Clique abaixo para reiniciar o portal.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('alx_site_data_v2');
            window.location.reload();
          }}
          className="px-6 py-2.5 rounded-xl bg-[#ebbf01] hover:bg-[#f5cc14] text-black text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#ebbf01]/20"
        >
          Recarregar
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorWrapper>
        <App />
      </ErrorWrapper>
    </StrictMode>,
  );
}
