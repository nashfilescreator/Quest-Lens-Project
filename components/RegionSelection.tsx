
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Search, Check, Globe, Flag } from 'lucide-react';
import { AppSettings, UserStats } from '../types';
import { COUNTRY_ACADEMIC_MAP } from '../constants';
import { playSound } from '../services/audioService';

interface RegionSelectionProps {
  settings: AppSettings;
  stats: UserStats;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onUpdateStats: (newStats: UserStats) => void;
  onBack: () => void;
}

const COUNTRIES = ["USA", "UK", "Kenya", "Uganda", "Tanzania", "Nigeria", "South Africa", "India", "Japan", "France", "Canada", "Germany", "International"];

const RegionSelection: React.FC<RegionSelectionProps> = ({ settings, stats, onUpdateSettings, onUpdateStats, onBack }) => {
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const handleSelect = (country: string) => {
    // 1. Update general settings
    onUpdateSettings({ ...settings, country });
    playSound('success');
    
    // 2. Sync Academic Settings if Student role is active
    // This ensures consistency across the app (CreateQuest, Profile, etc.)
    if (stats.activeRoles?.includes('Student')) {
        const newRegionRoot = COUNTRY_ACADEMIC_MAP[country] || COUNTRY_ACADEMIC_MAP['International'];
        const currentLevel = stats.rolePreferences.Student.academicLevel;
        
        // Check if current level overrides exist for new region, else fallback to default
        const newLevelConfig = newRegionRoot.levelOverrides?.[currentLevel] || newRegionRoot.default;
        
        // Reset specific curriculum/grade to the first valid option of the new region to prevent mismatch
        const newStats = {
            ...stats,
            rolePreferences: {
                ...stats.rolePreferences,
                Student: {
                    ...stats.rolePreferences.Student,
                    curriculum: newLevelConfig.curricula[0],
                    grade: newLevelConfig.grades[0],
                    subjects: [] // Reset subjects as they might be region specific
                }
            }
        };
        onUpdateStats(newStats);
    }
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[150] bg-background flex flex-col animate-in slide-in-from-bottom duration-400 font-sans">
      <div className="p-4 pt-safe flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-txt-main hover:bg-glass rounded-full transition-all"><ChevronLeft size={24} /></button>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-txt-main">Select Region</h2>
          </div>
      </div>

      <div className="px-6 py-2">
        <p className="text-xs text-txt-sub leading-relaxed font-medium mb-6">
          Changing your region updates the theme of your scavenger hunts and re-calibrates academic curriculum settings.
        </p>
        
        <div className="relative mb-8">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-txt-dim" size={18} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search standards..."
            className="w-full bg-transparent border-b border-ln-base py-4 pl-8 pr-4 text-base font-bold text-txt-main outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-hide">
        <div className="divide-y divide-ln-base">
          {filteredCountries.map(country => {
            const isSelected = settings.country === country;
            const config = COUNTRY_ACADEMIC_MAP[country] || COUNTRY_ACADEMIC_MAP['International'];

            return (
              <button
                key={country}
                onClick={() => handleSelect(country)}
                className="w-full flex items-center justify-between py-6 group transition-all"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-surface text-txt-dim group-hover:text-txt-main'}`}>
                    {country === 'International' ? <Globe size={20} /> : <Flag size={20} />}
                  </div>
                  <div>
                    <h4 className={`text-base font-bold ${isSelected ? 'text-primary' : 'text-txt-main'}`}>{country}</h4>
                    <p className="text-[10px] text-txt-dim font-bold uppercase tracking-widest">{config.curriculumLabel}: {config.default.curricula[0]}</p>
                  </div>
                </div>
                {isSelected && <Check size={20} className="text-primary" strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {filteredCountries.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <p className="text-sm font-bold uppercase tracking-widest">No regions matched</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionSelection;
