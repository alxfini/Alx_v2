import React, { useState, useMemo } from 'react';
import { useSiteData } from '../../context/SiteDataContext';
import { EVModel } from '../../types';
import { BatteryCharging, Zap, Gauge, Compass, Wind, DollarSign, Car, ChevronDown } from 'lucide-react';

export const RangeCalculator: React.FC = () => {
  const { evModels } = useSiteData();
  const [selectedModelId, setSelectedModelId] = useState<string>('byd-dolphin-mini');
  const [batteryPercent, setBatteryPercent] = useState<number>(85);
  const [drivingMode, setDrivingMode] = useState<'eco' | 'normal' | 'sport'>('normal');
  const [speedCategory, setSpeedCategory] = useState<'city' | 'mixed' | 'highway'>('mixed');
  const [acOn, setAcOn] = useState<boolean>(true);
  const [tempCondition, setTempCondition] = useState<'cold' | 'optimal' | 'hot'>('optimal');
  const [kwhPrice, setKwhPrice] = useState<number>(1.00); // R$ 1,00 de referência padrão

  const currentModel = useMemo(() => {
    return evModels.find(m => m.id === selectedModelId) || evModels[0] || {
      id: 'byd-dolphin-mini',
      name: 'BYD Dolphin Mini',
      badge: '38 kWh • Compacto',
      batteryCapacityKwh: 38,
      wltpRangeKm: 280,
      inmetroRangeKm: 280,
      maxDcChargingKw: 40,
      acChargingKw: 6.6,
      efficiencyKwh100km: 13.5,
      imageUrl: '',
      features: []
    };
  }, [evModels, selectedModelId]);

  // Calculation Engine
  const calculation = useMemo(() => {
    let modeFactor = 1.0;
    if (drivingMode === 'eco') modeFactor = 1.08;
    if (drivingMode === 'sport') modeFactor = 0.88;

    let speedFactor = 1.0;
    let avgSpeedKm = 65;
    if (speedCategory === 'city') {
      speedFactor = 1.15; // City regeneration bonus
      avgSpeedKm = 38;
    } else if (speedCategory === 'highway') {
      speedFactor = 0.82; // Highway aerodynamic drag
      avgSpeedKm = 110;
    }

    let acFactor = acOn ? 0.94 : 1.0;

    let tempFactor = 1.0;
    if (tempCondition === 'cold') tempFactor = 0.88;
    if (tempCondition === 'hot') tempFactor = 0.93;

    // Usable energy in kWh remaining
    const usableBattery = (currentModel.batteryCapacityKwh * batteryPercent) / 100;
    
    // Effective consumption in kWh/100km
    const effectiveConsumption = (currentModel.efficiencyKwh100km / (modeFactor * speedFactor * acFactor * tempFactor));
    
    // Estimated range
    const estimatedRangeKm = Math.round((usableBattery / effectiveConsumption) * 100);
    
    // Full 100% estimated range
    const fullRangeEstimate = Math.round((currentModel.batteryCapacityKwh / effectiveConsumption) * 100);

    // Cost to fill complete 0-100%
    const costZeroToHundred = currentModel.batteryCapacityKwh * kwhPrice;

    // Cost to fill from current % to 100%
    const energyToFullKwh = currentModel.batteryCapacityKwh * ((100 - batteryPercent) / 100);
    const costToFull = energyToFullKwh * kwhPrice;

    // Cost per km in R$
    const costPerKm = (effectiveConsumption / 100) * kwhPrice;

    // Fast charge time (10-80% on DC)
    const dcMinutes = Math.round(((currentModel.batteryCapacityKwh * 0.7) / currentModel.maxDcChargingKw) * 60) + 5;

    return {
      usableBattery: usableBattery.toFixed(1),
      effectiveConsumption: effectiveConsumption.toFixed(1),
      estimatedRangeKm,
      fullRangeEstimate,
      costZeroToHundred: costZeroToHundred.toFixed(2),
      costToFull: costToFull.toFixed(2),
      costPerKm: costPerKm.toFixed(2),
      dcMinutes,
      avgSpeedKm
    };
  }, [currentModel, batteryPercent, drivingMode, speedCategory, acOn, tempCondition, kwhPrice]);

  return (
    <div className="bg-[#0D0D10]/95 border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-brand)]/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Model Selector Bar directly at the top */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-[var(--color-brand)]" />
          <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Selecione o Modelo EV
          </span>
        </div>

        {/* Model Selector Dropdown Box */}
        <div className="relative w-full sm:w-80">
          <div className="relative">
            <select
              value={currentModel.id}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full bg-[#18181f] text-white text-xs sm:text-sm font-bold rounded-2xl border-2 border-[var(--color-brand)]/40 hover:border-[var(--color-brand)] focus:border-[var(--color-brand)] focus:outline-none pl-4 pr-10 py-3 appearance-none cursor-pointer shadow-lg shadow-black/40 transition-all font-heading"
            >
              {evModels.map(model => (
                <option key={model.id} value={model.id} className="bg-[#121216] text-white py-2">
                  {model.name} ({model.batteryCapacityKwh} kWh)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[var(--color-brand)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Responsive Content: 2-column on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 relative z-10 items-start">
        
        {/* LEFT COLUMN ON DESKTOP */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          
          {/* 1. Nível de Bateria (SoC) */}
          <div className="bg-[#121216] border border-white/[0.06] rounded-2xl p-4 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-[var(--color-brand)]" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-200">
                  1. Nível de Bateria (SoC)
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[var(--color-brand)]">
                  {batteryPercent}%
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  ({calculation.usableBattery} kWh)
                </span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={batteryPercent}
              onChange={(e) => setBatteryPercent(Number(e.target.value))}
              className="w-full h-2.5 bg-[#1F1F24] rounded-lg appearance-none cursor-pointer accent-[var(--color-brand)]"
            />

            <div className="flex justify-between text-[11px] text-neutral-400 font-medium">
              <span>5% (Reserva)</span>
              <span>50%</span>
              <span>80% (DC)</span>
              <span>100% (Cheio)</span>
            </div>
          </div>

          {/* MOBILE ONLY RESULT DISPLAY: Appears right below Battery on Mobile */}
          <div className="block lg:hidden">
            <div className="bg-gradient-to-b from-[#181820] via-[#121216] to-[#0A0A0C] border border-[var(--color-brand)]/40 rounded-2xl p-4 shadow-xl relative overflow-hidden space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-base font-black text-white">{currentModel.name}</h3>
                  <p className="text-xs text-[var(--color-brand)] font-medium">{currentModel.badge}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#222228] text-neutral-200 border border-white/[0.06]">
                  {currentModel.batteryCapacityKwh} kWh
                </span>
              </div>

              {/* Autonomia Estimada */}
              <div className="py-2 text-center">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
                  Autonomia Estimada com {batteryPercent}%
                </span>
                <div className="flex items-baseline justify-center gap-1.5 my-0.5">
                  <span className="text-5xl font-black text-white tracking-tight drop-shadow">
                    {calculation.estimatedRangeKm}
                  </span>
                  <span className="text-xl font-black text-[var(--color-brand)]">km</span>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Até <span className="text-white font-bold">{calculation.fullRangeEstimate} km</span> com 100% de carga
                </p>
              </div>

              {/* Grid de Custos Mobile */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/[0.08]">
                <div className="bg-[#0E0E12] p-2.5 rounded-xl border border-[var(--color-brand)]/20">
                  <div className="text-[10px] text-[var(--color-brand)] uppercase font-bold">Carga Total (0-100%)</div>
                  <div className="text-base font-black text-[var(--color-brand)] mt-0.5">
                    R$ {calculation.costZeroToHundred}
                  </div>
                  <div className="text-[9px] text-neutral-400">@ R$ {kwhPrice.toFixed(2)}/kWh</div>
                </div>

                <div className="bg-[#0E0E12] p-2.5 rounded-xl border border-white/[0.04]">
                  <div className="text-[10px] text-neutral-300 uppercase font-bold">Completar ({100 - batteryPercent}%)</div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">
                    R$ {calculation.costToFull}
                  </div>
                  <div className="text-[9px] text-neutral-400">até 100%</div>
                </div>

                <div className="bg-[#0E0E12] p-2.5 rounded-xl border border-white/[0.04]">
                  <div className="text-[10px] text-neutral-400 uppercase font-medium">Custo por km</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    R$ {calculation.costPerKm} <span className="text-[10px] text-neutral-400 font-normal">/ km</span>
                  </div>
                </div>

                <div className="bg-[#0E0E12] p-2.5 rounded-xl border border-white/[0.04]">
                  <div className="text-[10px] text-neutral-400 uppercase font-medium">Consumo Médio</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {calculation.effectiveConsumption} <span className="text-[10px] text-neutral-400 font-normal">kWh/100km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Valor do kWh / Tarifa de Energia */}
          <div className="bg-[#121216] border border-white/[0.06] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 flex items-center justify-center text-[var(--color-brand)] shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Valor do kWh / Tarifa
                </div>
                <div className="text-xs text-neutral-400">Referência: R$ 1,00 por kWh</div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-[var(--color-brand)]">R$</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.01"
                  max="10.00"
                  value={kwhPrice || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setKwhPrice(isNaN(val) ? 0 : val);
                  }}
                  className="w-32 bg-[#1B1B22] border border-white/[0.12] focus:border-[var(--color-brand)] rounded-xl pl-9 pr-3 py-1.5 text-sm font-bold text-white outline-none transition-colors"
                  placeholder="1.00"
                />
              </div>
            </div>
          </div>

          {/* 3. Modo de Condução & Tipo de Trajeto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Modo de Condução */}
            <div className="bg-[#121216] border border-white/[0.06] rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                Modo de Condução
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'eco', label: 'ECO', desc: '+8%' },
                  { id: 'normal', label: 'NORMAL', desc: 'Padrão' },
                  { id: 'sport', label: 'SPORT', desc: '-12%' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setDrivingMode(mode.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      drivingMode === mode.id
                        ? 'bg-[var(--color-brand)] text-black shadow-sm font-black'
                        : 'bg-[#18181C] text-neutral-300 hover:text-white border border-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold">{mode.label}</div>
                    <div className="text-[10px] font-normal opacity-85">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Trajeto */}
            <div className="bg-[#121216] border border-white/[0.06] rounded-2xl p-3.5 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--color-brand)]" />
                Tipo de Trajeto
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'city', label: 'Cidade', desc: '~40 km/h' },
                  { id: 'mixed', label: 'Misto', desc: '~70 km/h' },
                  { id: 'highway', label: 'Rodovia', desc: '~110 km/h' }
                ].map(sp => (
                  <button
                    key={sp.id}
                    onClick={() => setSpeedCategory(sp.id as any)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                      speedCategory === sp.id
                        ? 'bg-[var(--color-brand)] text-black shadow-sm font-black'
                        : 'bg-[#18181C] text-neutral-300 hover:text-white border border-white/[0.04]'
                    }`}
                  >
                    <div className="text-xs font-bold">{sp.label}</div>
                    <div className="text-[10px] font-normal opacity-85">{sp.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 4. Ar-Condicionado & Clima / Temperatura */}
          <div className="bg-[#121216] border border-white/[0.06] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            {/* AC Toggle */}
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                acOn ? 'bg-[var(--color-brand)] text-black' : 'bg-[#1F1F24] text-neutral-400'
              }`}>
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Ar-Condicionado</div>
                <div className="text-[11px] text-neutral-400">{acOn ? 'Ligado (Clima Auto)' : 'Desligado'}</div>
              </div>
              <button
                onClick={() => setAcOn(!acOn)}
                className={`ml-2 px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  acOn ? 'bg-[var(--color-brand)] text-black' : 'bg-[#222228] text-neutral-300'
                }`}
              >
                {acOn ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* External Weather */}
            <div className="flex items-center gap-1.5 bg-[#18181C] p-1 rounded-xl border border-white/[0.04]">
              {[
                { id: 'cold', label: '❄ 12°C' },
                { id: 'optimal', label: '☀ 24°C' },
                { id: 'hot', label: '🔥 36°C' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTempCondition(t.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    tempCondition === t.id
                      ? 'bg-[var(--color-brand)] text-black font-bold shadow-sm'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DESKTOP ONLY DEDICATED RESULT COCKPIT */}
        <div className="hidden lg:flex lg:col-span-5 flex-col h-full sticky top-24">
          <div className="h-full bg-gradient-to-b from-[#181820] via-[#121216] to-[#0A0A0C] border border-[var(--color-brand)]/35 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
            
            {/* Model Card Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
              <div>
                <h3 className="text-lg font-black text-white">{currentModel.name}</h3>
                <p className="text-xs text-[var(--color-brand)] font-semibold mt-0.5">{currentModel.badge}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-[#222228] text-neutral-200 border border-white/[0.06] font-mono">
                {currentModel.batteryCapacityKwh} kWh
              </span>
            </div>

            {/* Main Hero Range Output */}
            <div className="py-5 text-center space-y-1">
              <span className="text-xs uppercase tracking-wider text-neutral-300 font-semibold">
                Autonomia Estimada com {batteryPercent}%
              </span>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl sm:text-7xl font-black text-white tracking-tight drop-shadow-md">
                  {calculation.estimatedRangeKm}
                </span>
                <span className="text-2xl font-black text-[var(--color-brand)]">km</span>
              </div>
              <p className="text-xs text-neutral-300">
                Até <span className="text-white font-bold">{calculation.fullRangeEstimate} km</span> com 100% de carga
              </p>
            </div>

            {/* Telemetry Matrix Bento Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-3.5 border-t border-white/[0.08]">
              <div className="bg-[#0E0E12] p-3 rounded-2xl border border-[var(--color-brand)]/20 bg-gradient-to-br from-[var(--color-brand)]/5 to-transparent">
                <div className="text-[11px] text-[var(--color-brand)] uppercase font-bold">Carga Total (0-100%)</div>
                <div className="text-lg font-black text-[var(--color-brand)] mt-0.5">
                  R$ {calculation.costZeroToHundred}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">({currentModel.batteryCapacityKwh} kWh @ R$ {kwhPrice.toFixed(2)})</div>
              </div>

              <div className="bg-[#0E0E12] p-3 rounded-2xl border border-white/[0.04]">
                <div className="text-[11px] text-neutral-300 uppercase font-bold">Completar ({100 - batteryPercent}%)</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  R$ {calculation.costToFull}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Carga até 100%</div>
              </div>

              <div className="bg-[#0E0E12] p-3 rounded-2xl border border-white/[0.04]">
                <div className="text-[11px] text-neutral-400 uppercase font-medium">Custo por km</div>
                <div className="text-base font-bold text-white mt-0.5">
                  R$ {calculation.costPerKm} <span className="text-xs text-neutral-400 font-normal">/ km</span>
                </div>
              </div>

              <div className="bg-[#0E0E12] p-3 rounded-2xl border border-white/[0.04]">
                <div className="text-[11px] text-neutral-400 uppercase font-medium">Consumo Médio</div>
                <div className="text-base font-bold text-white mt-0.5">
                  {calculation.effectiveConsumption} <span className="text-xs text-neutral-400 font-normal">kWh/100km</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
