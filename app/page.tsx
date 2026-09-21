'use client';

import React, { useState } from 'react';
import { BirthInput, NatalChartData } from '@/astronomy/types';
import { CreatorTimingSummary, TimeWindow } from '@/creator-timing/creator-timing.engine';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { BestWindowHero } from '@/components/dashboard/best-window-hero';
import { DayTimeline } from '@/components/timeline/day-timeline';
import { ActionCardsGrid } from '@/components/cards/action-cards-grid';
import { NatalChartWheel } from '@/components/chart/natal-chart-wheel';
import { PlanetaryTable } from '@/components/chart/planetary-table';
import { CalendarView } from '@/components/calendar/calendar-view';
import { WhyNowModal } from '@/components/dashboard/why-now-modal';
import {
  Sparkles,
  Compass,
  Calendar,
  Layers,
  Settings,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export default function AstroCreatorApp() {
  const [chartData, setChartData] = useState<NatalChartData | null>(null);
  const [timingData, setTimingData] = useState<CreatorTimingSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chart' | 'calendar'>('dashboard');
  const [selectedWhyNowWindow, setSelectedWhyNowWindow] = useState<TimeWindow | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<BirthInput[]>([]);

  // Load saved profiles from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('astro_creator_profiles');
      if (stored) {
        const parsed: BirthInput[] = JSON.parse(stored);
        setSavedProfiles(parsed);
        if (parsed.length > 0 && !chartData) {
          // Auto load last profile
          handleCalculate(parsed[0]);
        }
      }
    } catch (err) {
      console.error('Error loading profiles from localStorage:', err);
    }
  }, []);

  const saveProfileToStorage = (profile: BirthInput) => {
    try {
      setSavedProfiles((prev) => {
        // Replace if exists by name, else append
        const filtered = prev.filter((p) => p.name.toLowerCase() !== profile.name.toLowerCase());
        const updated = [profile, ...filtered];
        localStorage.setItem('astro_creator_profiles', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleCalculate = async (input: BirthInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (data.chart && data.creatorTiming) {
        setChartData(data.chart);
        setTimingData(data.creatorTiming);
        saveProfileToStorage(input);
        setShowOnboarding(false);
        setActiveTab('dashboard');
      } else {
        alert(data.error || 'Error al calcular la carta.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el motor de efemérides.');
    } finally {
      setLoading(false);
    }
  };

  // If no chart is calculated yet, show landing with inline calculator
  if (!chartData || !timingData || showOnboarding) {
    return (
      <main className="min-h-screen bg-[#090a0c] text-[#f2efe9] p-6 lg:p-12 flex flex-col justify-between">
        {/* Navigation */}
        <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-[#1c2129]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c2a878]/10 border border-[#c2a878]/30 flex items-center justify-center text-[#c2a878]">
              ✦
            </div>
            <span className="font-extrabold text-base tracking-widest uppercase text-[#dedad2]">
              Astro Creator
            </span>
          </div>

          <div className="text-xs technical-mono text-[#8a929e]">
            Impulsado por <span className="text-[#dedad2]">Swiss Ephemeris 2.10</span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto w-full py-12 space-y-10 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-[#171b21] border border-[#232a35] text-[#c2a878]">
              <Sparkles className="w-3 h-3" />
              Timing de Creador & Precisión Astronómica
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#f2efe9] uppercase leading-tight">
              Creá con <br className="hidden sm:inline" />
              <span className="text-[#c2a878]">El Cosmos</span>
            </h1>
            <p className="text-lg lg:text-xl text-[#8a929e] max-w-2xl mx-auto leading-relaxed">
              Tu carta natal. El cielo actual calculado con Swiss Ephemeris. El mejor momento para crear, publicar, vender e interactuar.
            </p>
          </div>

          {/* Core equation banner in Spanish */}
          <div className="bg-[#111317] border border-[#232a35] rounded-2xl p-4 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-3 text-xs technical-mono text-[#dedad2]">
            <span>CARTA NATAL</span>
            <span className="text-[#c2a878]">+</span>
            <span>CIELO ACTUAL</span>
            <span className="text-[#c2a878]">+</span>
            <span>CREATOR TIMING</span>
            <span className="text-[#c2a878]">=</span>
            <span className="text-[#c2a878] font-bold">TUS VENTANAS CREATIVAS</span>
          </div>

          {/* Onboarding Form */}
          <div className="pt-6">
            <OnboardingModal
              onCalculate={handleCalculate}
              loading={loading}
              savedProfiles={savedProfiles}
              onSelectProfile={handleCalculate}
              onCancel={chartData ? () => setShowOnboarding(false) : undefined}
              initialData={chartData?.input}
            />
          </div>
        </div>

        {/* Footer Disclaimer */}
        <footer className="max-w-4xl mx-auto text-center text-xs text-[#8a929e] py-8 border-t border-[#1c2129]">
          <p>
            Astro Creator utiliza astrología como herramienta de planificación y reflexión creativa. Sus recomendaciones no garantizan alcance, engagement, ventas ni rendimiento de contenido.
          </p>
        </footer>
      </main>
    );
  }

  // Active Dashboard
  return (
    <div className="min-h-screen bg-[#090a0c] text-[#f2efe9] flex flex-col justify-between">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-[#090a0c]/90 backdrop-blur-md border-b border-[#1c2129] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c2a878]/10 border border-[#c2a878]/30 flex items-center justify-center text-[#c2a878]">
              ✦
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-widest uppercase text-[#f2efe9]">
                Astro Creator
              </h1>
              <div className="text-[11px] text-[#8a929e] flex items-center gap-2">
                <span className="text-[#f2efe9] font-medium">{chartData.input.name}</span>
                <span>·</span>
                <span>{chartData.input.city}</span>
                <span>·</span>
                <span>Nicho: {chartData.input.creatorNiche}</span>
              </div>
            </div>
          </div>

          {/* Quick Profiles Switcher in Header */}
          {savedProfiles.length > 1 && (
            <div className="flex items-center gap-1 bg-[#111317] p-1 rounded-xl border border-[#232a35]">
              <span className="text-[10px] uppercase text-[#8a929e] px-2 font-bold">Ver:</span>
              {savedProfiles.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCalculate(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    chartData.input.name.toLowerCase() === p.name.toLowerCase()
                      ? 'bg-[#c2a878] text-[#090a0c] font-bold'
                      : 'text-[#8a929e] hover:text-[#dedad2] hover:bg-[#171b21]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-[#111317] p-1 rounded-xl border border-[#232a35]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-[#c2a878] text-[#090a0c]'
                  : 'text-[#8a929e] hover:text-[#dedad2]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Tu Cielo
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'chart'
                  ? 'bg-[#c2a878] text-[#090a0c]'
                  : 'text-[#8a929e] hover:text-[#dedad2]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Carta Natal
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === 'calendar'
                  ? 'bg-[#c2a878] text-[#090a0c]'
                  : 'text-[#8a929e] hover:text-[#dedad2]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendario
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {chartData.precision === 'unknown_time' && (
              <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold technical-mono bg-[#b56b59]/20 text-[#b56b59] border border-[#b56b59]/30">
                🟠 Hora Desconocida
              </span>
            )}
            <button
              onClick={() => setShowOnboarding(true)}
              className="p-2 rounded-lg bg-[#111317] border border-[#232a35] hover:border-[#3a4556] text-[#8a929e] hover:text-[#dedad2] transition-colors"
              title="Cambiar datos de carta"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full p-6 lg:p-8 space-y-8">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Title with Date & Activity */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1c2129] pb-4">
              <div>
                <span className="text-xs font-bold technical-mono uppercase tracking-widest text-[#c2a878]">
                  Tu Cielo de Hoy
                </span>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-[#f2efe9] capitalize">
                  {timingData.dateFormatted}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#8a929e] technical-mono">
                  Índice de Timing:
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#171b21] border border-[#232a35] text-sm font-bold technical-mono text-[#c2a878]">
                  {timingData.generalScore} / 100 · {timingData.activityLevel}
                </span>
              </div>
            </div>

            {/* Score Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#111317] p-3 rounded-xl border border-[#232a35] text-xs technical-mono">
              <div className="flex justify-between px-3 py-1">
                <span className="text-[#8a929e]">VISIBILIDAD</span>
                <span className="text-[#c2a878] font-bold">{timingData.categoryScores.publish.ratingLabel}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                <span className="text-[#8a929e]">CREATIVIDAD</span>
                <span className="text-[#8fa8d6] font-bold">{timingData.categoryScores.create.ratingLabel}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                <span className="text-[#8a929e]">ENGAGEMENT</span>
                <span className="text-[#76b896] font-bold">{timingData.categoryScores.engage.ratingLabel}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                <span className="text-[#8a929e]">VENTA</span>
                <span className="text-[#d99879] font-bold">{timingData.categoryScores.sell.ratingLabel}</span>
              </div>
              <div className="flex justify-between px-3 py-1">
                <span className="text-[#8a929e]">EXPERIMENTA</span>
                <span className="text-[#ba8ed4] font-bold">{timingData.categoryScores.experiment.ratingLabel}</span>
              </div>
            </div>

            {/* Hero Card: Mejor Ventana */}
            <BestWindowHero
              window={timingData.bestWindow}
              onOpenWhyNow={(w) => setSelectedWhyNowWindow(w)}
            />

            {/* 24h Timeline */}
            <DayTimeline
              windows={timingData.dailyWindows}
              onSelectWindow={(w) => setSelectedWhyNowWindow(w)}
            />

            {/* Action Cards: Qué Hacer Hoy */}
            <ActionCardsGrid
              windows={timingData.dailyWindows}
              onSelectWindow={(w) => setSelectedWhyNowWindow(w)}
            />
          </div>
        )}

        {/* NATAL CHART TAB */}
        {activeTab === 'chart' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#1c2129] pb-4">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider text-[#f2efe9]">
                  Carta Natal & Coordenadas Astronómicas
                </h2>
                <p className="text-xs text-[#8a929e] mt-0.5">
                  Calculado para {chartData.input.city} ({chartData.input.timezone}) con sistema Placidus.
                </p>
              </div>
            </div>

            <NatalChartWheel chart={chartData} />
            <PlanetaryTable chart={chartData} />
          </div>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-8 animate-fadeIn">
            <CalendarView chart={chartData} />
          </div>
        )}
      </main>

      {/* Why Now Modal */}
      {selectedWhyNowWindow && (
        <WhyNowModal
          window={selectedWhyNowWindow}
          onClose={() => setSelectedWhyNowWindow(null)}
        />
      )}

      {/* Footer Disclaimer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-[#1c2129] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8a929e] gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#c2a878]" />
          <span>Astro Creator · Swiss Ephemeris Engine · Zodíaco Tropical Geocéntrico</span>
        </div>
        <p className="text-center sm:text-right max-w-xl text-[11px]">
          Las recomendaciones son interpretaciones astrológicas creativas y no garantizan resultados algorítmicos.
        </p>
      </footer>
    </div>
  );
}
