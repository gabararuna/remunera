import { useState } from 'react';
import { useSalaryForm } from './hooks/useSalaryForm';
import { PeriodoStep } from './components/PeriodoStep';
import { SalarioStep } from './components/SalarioStep';
import { FeriasStep } from './components/FeriasStep';
import { BeneficiosStep } from './components/BeneficiosStep';
import { DescontosStep } from './components/DescontosStep';
import { ResultsDashboard } from './components/ResultsDashboard';

export default function App() {
  const { params, updateParam } = useSalaryForm();
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const restart = () => setStep(1);

  return (
    <div style={{ maxWidth: step === 6 ? '100%' : '800px', width: '100%', margin: '0 auto', padding: step === 6 ? '2rem 60px' : '2rem 1rem', transition: 'max-width 0.4s ease', boxSizing: 'border-box' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1rem' }} className="animate-fade-in">
        <a href="https://portfolio.gabrielararuna.com/" target="_blank" rel="noopener noreferrer" className="author-btn" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          Criado por Gabriel Araruna
        </a>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
          Remunera
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Projete sua remuneração real CLT de forma inteligente</p>

        {step < 6 && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                style={{
                  width: '40px',
                  height: '6px',
                  borderRadius: '3px',
                  background: s <= step ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </header>

      <main style={{ minHeight: '400px' }}>
        {step === 1 && <PeriodoStep data={params} update={updateParam} onNext={nextStep} />}
        {step === 2 && <SalarioStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
        {step === 3 && <FeriasStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
        {step === 4 && <BeneficiosStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
        {step === 5 && <DescontosStep data={params} update={updateParam} onNext={nextStep} onBack={prevStep} />}
        {step === 6 && <ResultsDashboard data={params} onRestart={restart} />}
      </main>
    </div>
  );
}
