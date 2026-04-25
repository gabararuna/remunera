import { useEffect, useState } from 'react';
import { useSalaryForm } from './hooks/useSalaryForm';
import { PeriodoStep } from './components/PeriodoStep';
import { SalarioStep } from './components/SalarioStep';
import { FeriasStep } from './components/FeriasStep';
import { BeneficiosStep } from './components/BeneficiosStep';
import { DescontosStep } from './components/DescontosStep';
import { DemissaoStep } from './components/DemissaoStep';
import { ResultsDashboard } from './components/ResultsDashboard';

export default function App() {
  const { params, updateParam } = useSalaryForm();
  const [step, setStep] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const nextStep = () => setStep(s => Math.min(s + 1, 7));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const restart = () => setStep(0);

  useEffect(() => {
    if (step !== 0) return;
    const onMove = (e: MouseEvent) => setMouse({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [step]);

  if (step === 0) {
    return (
      <div className="welcome-screen">
        <div className="welcome-bg">
          <div className="welcome-bg-gradient" />
          <div className="welcome-bg-grid" />
        </div>

        <div
          className="welcome-orb"
          style={{
            left: `${mouse.x * 100}%`,
            top: `${mouse.y * 100}%`,
          }}
        />

        <div className="welcome-content">
          <a
            href="https://www.gruponumera.com"
            target="_blank"
            rel="noopener noreferrer"
            className="welcome-badge"
          >
            Desenvolvido por Numera
          </a>

          <h1 className="shimmer-teal welcome-title">Remunera</h1>

          <p className="welcome-subtitle">
            Projete sua remuneração real CLT de forma inteligente.
          </p>

          <button onClick={nextStep} className="btn-primary welcome-cta">
            Iniciar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="orb-container" />
      <div style={{ maxWidth: step === 7 ? '1200px' : '800px', width: '100%', margin: '0 auto', padding: step === 7 ? '2rem 2rem' : '2rem 1rem', transition: 'max-width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }} className="animate-fade-in">
          <a href="https://www.gruponumera.com/" target="_blank" rel="noopener noreferrer" className="author-btn" style={{ marginBottom: '2rem' }}>
            Desenvolvido por Numera
          </a>
          <h1 className="shimmer-text" style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 500, letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>
            Remunera
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontWeight: 300, letterSpacing: '0.025em', lineHeight: '1.6' }}>Projete sua remuneração real CLT de forma inteligente</p>

          {step < 7 && (
            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5, 6].map(s => (
                <div
                  key={s}
                  style={{
                    width: '48px',
                    height: '4px',
                    borderRadius: '2px',
                    background: s <= step ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)',
                    boxShadow: s <= step ? '0 0 15px rgba(0, 191, 165, 0.3)' : 'none',
                    transition: 'all 0.4s ease'
                  }}
                />
              ))}
            </div>
          )}
        </header>

        <main style={{ minHeight: '400px', paddingBottom: '4rem' }}>
          {step === 1 && <PeriodoStep data={params} update={updateParam} onNext={nextStep} />}
          {step === 2 && <SalarioStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
          {step === 3 && <FeriasStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
          {step === 4 && <BeneficiosStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
          {step === 5 && <DescontosStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
          {step === 6 && <DemissaoStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
          {step === 7 && <ResultsDashboard data={params} onRestart={restart} />}
        </main>
      </div>
    </>
  );
}
