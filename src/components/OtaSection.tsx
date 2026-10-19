import React from 'react';
import { OtaTracker } from './tools/OtaTracker';

interface OtaSectionProps {
  isStandalone?: boolean;
}

export const OtaSection: React.FC<OtaSectionProps> = ({ isStandalone = false }) => {
  return (
    <section id="radar-ota" className={`${isStandalone ? 'pt-0 pb-8 sm:pb-10' : 'py-10 sm:py-14'} bg-[#070709] border-t border-white/[0.06] relative overflow-hidden`}>
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#ebbf01]/4 blur-[160px] pointer-events-none rounded-full" />

      <div className="w-full max-w-[96%] sm:max-w-[90%] lg:w-[75%] lg:max-w-[75vw] mx-auto px-2 sm:px-4 relative z-10">
        <OtaTracker />
      </div>
    </section>
  );
};
