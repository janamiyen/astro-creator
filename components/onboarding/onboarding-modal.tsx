'use client';

import React, { useState } from 'react';
import { BirthInput } from '@/astronomy/types';
import { POPULAR_CITIES, searchCities, CityLocation } from '@/lib/geocoding/cities';
import { CREATOR_NICHES } from '@/creator-timing/niches/niche-adapter';
import { Sparkles, MapPin, Clock, Calendar, User, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  onCalculate: (input: BirthInput) => void;
  loading: boolean;
  savedProfiles?: BirthInput[];
  onSelectProfile?: (profile: BirthInput) => void;
  onCancel?: () => void;
  initialData?: BirthInput | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onCalculate,
  loading,
  savedProfiles = [],
  onSelectProfile,
  onCancel,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || 'Lucas');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '1995-09-21');
  const [birthTime, setBirthTime] = useState(initialData?.birthTime || '14:30');
  const [timeUnknown, setTimeUnknown] = useState(initialData?.timeUnknown || false);
  const [citySearch, setCitySearch] = useState(
    initialData?.city ? `${initialData.city}, ${initialData.country}` : 'Buenos Aires'
  );
  const [selectedCity, setSelectedCity] = useState<CityLocation>(
    initialData?.city
      ? {
          name: initialData.city,
          country: initialData.country,
          latitude: initialData.latitude,
          longitude: initialData.longitude,
          timezone: initialData.timezone,
        }
      : POPULAR_CITIES[0]
  );
  const [selectedNiche, setSelectedNiche] = useState(initialData?.creatorNiche || 'lifestyle');

  const filteredCities = searchCities(citySearch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;

    const parts = birthDate.split('-');
    const year = parseInt(parts[0], 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
      alert('Por favor ingresá un año de nacimiento válido entre 1900 y 2100.');
      return;
    }

    onCalculate({
      name: name.trim() || 'Creador',
      birthDate,
      birthTime: timeUnknown ? '' : birthTime,
      timeUnknown,
      city: selectedCity.name,
      country: selectedCity.country,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      timezone: selectedCity.timezone,
      creatorNiche: selectedNiche,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#111317] border border-[#232a35] rounded-3xl p-8 lg:p-10 shadow-2xl space-y-8">
      {/* Header with Cancel button if editing */}
      <div className="flex items-start justify-between">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#c2a878]/10 text-[#c2a878] border border-[#c2a878]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Configuración Astral & Creador
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#f2efe9] tracking-tight">
            Creá tu mapa astral para saber cuándo tu cielo está de tu lado.
          </h2>
          <p className="text-sm text-[#8a929e] leading-relaxed">
            Cálculos astronómicos reales ejecutados con Swiss Ephemeris. Sin aproximaciones ni horóscopos genéricos.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[#171b21] hover:bg-[#232a35] border border-[#232a35] text-xs font-semibold text-[#dedad2] transition-colors"
          >
            ← Volver
          </button>
        )}
      </div>

      {/* Saved Profiles Quick Switcher */}
      {savedProfiles.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#171b21] border border-[#232a35] space-y-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#c2a878] flex items-center justify-between">
            <span>Perfiles Guardados</span>
            <span className="text-[11px] text-[#8a929e]">{savedProfiles.length} perfiles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedProfiles.map((p, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => onSelectProfile && onSelectProfile(p)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111317] hover:bg-[#232a35] border border-[#2d3748] text-[#f2efe9] flex items-center gap-2 transition-colors"
              >
                <span>👤 {p.name}</span>
                <span className="text-[10px] text-[#8a929e]">({p.city})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#dedad2] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#c2a878]" />
              Nombre o Alias
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 rounded-xl bg-[#171b21] border border-[#232a35] text-[#f2efe9] text-sm focus:outline-none focus:border-[#c2a878] transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#dedad2] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#c2a878]" />
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={birthDate}
              min="1900-01-01"
              max="2100-12-31"
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#171b21] border border-[#232a35] text-[#f2efe9] text-sm focus:outline-none focus:border-[#c2a878] transition-colors technical-mono"
              required
            />
          </div>
        </div>

        {/* Time & Unknown Checkbox */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider font-semibold text-[#dedad2] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#c2a878]" />
              Hora Exacta de Nacimiento
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8a929e] hover:text-[#dedad2]">
              <input
                type="checkbox"
                checked={timeUnknown}
                onChange={(e) => setTimeUnknown(e.target.checked)}
                className="rounded bg-[#171b21] border-[#232a35] text-[#c2a878] focus:ring-0"
              />
              No sé mi hora
            </label>
          </div>

          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={timeUnknown}
            className={`w-full px-4 py-3 rounded-xl bg-[#171b21] border border-[#232a35] text-[#f2efe9] text-sm focus:outline-none focus:border-[#c2a878] transition-colors technical-mono ${
              timeUnknown ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          />

          {timeUnknown && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-[#b56b59]/10 border border-[#b56b59]/20 text-[11px] text-[#dedad2]">
              <AlertCircle className="w-4 h-4 text-[#b56b59] shrink-0 mt-0.5" />
              <span>
                <strong>Precisión de la carta: 🟠 Hora desconocida.</strong> Se calcularán planetas y aspectos con total precisión, pero el Ascendente, MC y casas no serán utilizados en el timing diario.
              </span>
            </div>
          )}
        </div>

        {/* City Autocomplete & Timezone resolution */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#dedad2] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#c2a878]" />
            Lugar de Nacimiento (Ciudad y País)
          </label>
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Escribí una ciudad..."
            className="w-full px-4 py-3 rounded-xl bg-[#171b21] border border-[#232a35] text-[#f2efe9] text-sm focus:outline-none focus:border-[#c2a878] transition-colors"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            {filteredCities.slice(0, 5).map((city) => (
              <button
                type="button"
                key={`${city.name}-${city.country}`}
                onClick={() => {
                  setSelectedCity(city);
                  setCitySearch(`${city.name}, ${city.country}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedCity.name === city.name
                    ? 'bg-[#c2a878]/15 border-[#c2a878] text-[#c2a878]'
                    : 'bg-[#171b21] border-[#232a35] text-[#8a929e] hover:text-[#dedad2]'
                }`}
              >
                {city.name} ({city.country})
              </button>
            ))}
          </div>

          <div className="text-[11px] technical-mono text-[#8a929e] pt-1">
            Zona horaria detectada:{' '}
            <span className="text-[#dedad2]">{selectedCity.timezone}</span> (Lat: {selectedCity.latitude.toFixed(2)}°, Lon: {selectedCity.longitude.toFixed(2)}°)
          </div>
        </div>

        {/* Creator Niche Selector */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-[#dedad2] flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#c2a878]" />
            ¿Qué tipo de creador sos? (Nicho)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(CREATOR_NICHES).map((niche) => (
              <button
                type="button"
                key={niche.nicheId}
                onClick={() => setSelectedNiche(niche.nicheId)}
                className={`p-3 rounded-xl text-left border text-xs font-medium transition-all ${
                  selectedNiche === niche.nicheId
                    ? 'bg-[#c2a878]/10 border-[#c2a878] text-[#f2efe9]'
                    : 'bg-[#171b21] border-[#232a35] text-[#8a929e] hover:text-[#dedad2]'
                }`}
              >
                <div className="font-semibold text-sm">{niche.nameEs}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#c2a878] hover:bg-[#d8be8d] text-[#090a0c] font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-xl disabled:opacity-50"
        >
          {loading ? 'Calculando carta con Swiss Ephemeris...' : 'Calcular Carta & Creator Timing'}
        </button>
      </form>
    </div>
  );
};
