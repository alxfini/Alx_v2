import React from 'react';
import { RangeCalculator } from './tools/RangeCalculator';

interface CalculatorSectionProps {
  isStandalone?: boolean;
}

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({ isStandalone = false }) => {
  return (
    <section
      id="calculadora"
      className={`${
        isStandalone ? 'pt-0' : 'pt-16 sm:pt-20'
      } pb-8 bg-[#060608] relative overflow-hidden`}
    >
      {/* Abstract Futuristic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/imagens/fundo-calculadora.jpg"
          alt="Futuristic Digital Tech Abstract"
          className="w-full h-full object-cover object-center opacity-20 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060608]/90 via-[#060608]/85 to-[#070709]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ebbf01]/6 blur-[160px] rounded-full" />
      </div>

      <div className="w-full max-w-[96%] sm:max-w-[92%] lg:w-[70%] lg:max-w-[70vw] mx-auto px-2 sm:px-4 relative z-10">
        <RangeCalculator />
      </div>
    </section>
  );
};
