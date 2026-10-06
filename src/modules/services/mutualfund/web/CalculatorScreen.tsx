import type { ReactNode } from 'react';

interface CalculatorScreenProps {
  title: string;
  subtitle: string;
  image?: string;
  onBack: () => void;
  children: ReactNode;
}

export default function CalculatorScreen({ title, subtitle, image, onBack, children }: CalculatorScreenProps) {
  return (
    <section className="mf-calculator-screen min-h-full overflow-hidden rounded-3xl bg-[#F7F4FF]">
      <header className="flex items-center justify-between gap-4 rounded-b-3xl bg-gradient-to-br from-[#080B26] via-[#171F59] to-[#3545A3] px-6 py-6 text-white">
        <div className="flex items-center gap-4">
          <button
            type="button"
            autoFocus
            onClick={onBack}
            aria-label="Back to calculators"
            className="mf-calculator-back flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-3xl hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <div>
            <h2 id="mf-calculator-title" className="text-xl font-extrabold">{title}</h2>
            <p className="mt-1 text-sm text-white/75">{subtitle}</p>
          </div>
        </div>
        {image && (
          <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 p-1.5 backdrop-blur-sm">
            <img src={image} alt="" className="h-full w-full object-contain select-none" />
          </div>
        )}
      </header>
      <div className="space-y-4 p-6 pb-12">{children}</div>
    </section>
  );
}
