
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Volume2, LogOut, ChevronLeft, Smartphone, Trash2, User, Flag, ChevronRight, GraduationCap, Map, Footprints, School, Hash, BookOpen, Radio, Zap, Sliders, Moon, Sun, Info, Check, Compass, Target
} from 'lucide-react';
import { AppSettings, UserStats, RolePreferences } from '../types';
import { playSound, refreshAudioSettings } from '../services/audioService';
import { COUNTRY_ACADEMIC_MAP, LevelConfig } from '../constants';
import { useUIStore } from '../store/uiStore';

interface SettingsProps {
  settings: AppSettings;
  stats: UserStats;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onUpdateStats: (newStats: UserStats) => void;
  onBack: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onEditProfile: () => void;
}

const ACADEMIC_LEVELS = ['Primary', 'Secondary', 'Higher', 'Professional', 'Lifelong Learner'];

const Settings: React.FC<SettingsProps> = ({ settings, stats, onUpdateSettings, onUpdateStats, onBack, onLogout, onResetData, onEditProfile }) => {
  const { changeView } = useUIStore(state => state);
  const [activeTab, setActiveTab] = useState<'general' | 'roles'>('general');

  const regionRoot = useMemo(() => {
    return COUNTRY_ACADEMIC_MAP[settings.country] || COUNTRY_ACADEMIC_MAP['International'];
  }, [settings.country]);

  const activeLevelConfig: LevelConfig = useMemo(() => {
    const level = stats.rolePreferences.Student.academicLevel;
    return regionRoot.levelOverrides?.[level] || regionRoot.default;
  }, [regionRoot, stats.rolePreferences.Student.academicLevel]);

  const handleToggle = (key: keyof AppSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    onUpdateSettings(newSettings);
    if (key === 'sound' || key === 'haptics') setTimeout(refreshAudioSettings, 100);
    playSound('click');
  };

  const updateRolePref = (role: keyof RolePreferences, key: string, value: any) => {
    const newStats = {
      ...stats,
      rolePreferences: {
        ...stats.rolePreferences,
        [role]: { ...stats.rolePreferences[role], [key]: value }
      }
    };
    onUpdateStats(newStats);
    playSound('click');
  };

  const CustomToggle = ({ active, onClick, color = "bg-primary" }: { active: boolean, onClick?: () => void, color?: string }) => (
    <div 
        onClick={onClick}
        role="switch"
        aria-checked={active}
        className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0 flex items-center px-1 cursor-pointer ${active ? color : 'bg-white/10'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 transform ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  );

  const SettingRow = ({ icon: Icon, label, description, children, onClick, activeColor = "text-primary" }: any) => (
    <div className={`flex items-center justify-between py-4 border-b border-white/5 transition-all last:border-0 ${onClick ? 'cursor-pointer group' : ''}`} onClick={onClick}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 ${onClick ? 'group-hover:bg-primary/10 transition-colors' : ''}`}>
                <Icon size={16} className={onClick ? `text-txt-dim group-hover:${activeColor} transition-colors` : activeColor} />
            </div>
            <div className="flex-1 min-w-0 pr-2">
                <span className="text-sm font-bold text-txt-main block">{label}</span>
                {description && <span className="text-[10px] text-txt-dim block truncate font-medium">{description}</span>}
            </div>
        </div>
        <div className="flex-shrink-0 pl-4">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32 animate-in slide-in-from-right duration-400 font-sans text-txt-main">
      <div className="p-6 flex items-center gap-4 sticky top-0 bg-background/90 backdrop-blur-xl z-40 border-b border-white/5">
          <button onClick={onBack} aria-label="Go back" className="p-2 -ml-2 text-txt-main hover:bg-white/10 rounded-full transition-all"><ChevronLeft size={24} /></button>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-txt-main leading-none">Preferences</h2>
          </div>
      </div>

      <div className="flex px-6 py-4 gap-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-white text-background' : 'bg-white/5 text-txt-dim hover:text-txt-main'}`}
          >
              General
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'roles' ? 'bg-primary text-white' : 'bg-white/5 text-txt-dim hover:text-txt-main'}`}
          >
              Role Rules
          </button>
      </div>

      <div className="px-6 space-y-10 mt-4">
        {activeTab === 'general' ? (
            <>
                <section>
                    <h3 className="text-[10px] font-black text-txt-dim uppercase mb-2 ml-1 tracking-[0.2em] opacity-60">Profile</h3>
                    <div className="space-y-1">
                        <SettingRow 
                            icon={User} 
                            label="Personal Details" 
                            description="Name, Avatar, Bio"
                            onClick={onEditProfile}
                            activeColor="text-primary"
                        >
                            <ChevronRight size={18} className="text-txt-dim group-hover:text-primary transition-colors" />
                        </SettingRow>
                        <SettingRow 
                          icon={Flag} 
                          label="Regional Standards" 
                          description={settings.country} 
                          activeColor="text-blue-500"
                          onClick={() => changeView('region-selection', true)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-txt-main">{settings.country}</span>
                                <ChevronRight size={18} className="text-txt-dim group-hover:text-blue-500 transition-colors" />
                            </div>
                        </SettingRow>
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-black text-txt-dim uppercase mb-2 ml-1 tracking-[0.2em] opacity-60">System</h3>
                    <div className="space-y-1">
                        <SettingRow icon={Volume2} label="Sound Effects" description="UI & Feedback Audio" onClick={() => handleToggle('sound')} activeColor="text-orange-500">
                            <CustomToggle active={settings.sound} color="bg-orange-500" />
                        </SettingRow>
                        <SettingRow icon={Smartphone} label="Haptic Feedback" description="Vibration Response" onClick={() => handleToggle('haptics')} activeColor="text-emerald-500">
                            <CustomToggle active={settings.haptics} color="bg-emerald-500" />
                        </SettingRow>
                    </div>
                </section>

                <section className="pt-8">
                    <button onClick={onLogout} className="w-full py-4 text-rose-500 hover:text-rose-400 transition-colors font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 group">
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                    </button>
                </section>
            </>
        ) : (
            <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-12">
                {stats.activeRoles.includes('Explorer') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 ml-1">
                            <Compass size={14} className="text-discovery-500" />
                            <h3 className="text-[10px] font-black text-discovery-500 uppercase tracking-[0.2em]">Explorer</h3>
                        </div>
                        <div className="space-y-1">
                            <SettingRow icon={Map} label="Preferred Terrain" description="Mission bias" activeColor="text-discovery-500">
                                <select 
                                    value={stats.rolePreferences.Explorer.terrain}
                                    onChange={(e) => updateRolePref('Explorer', 'terrain', e.target.value)}
                                    className="bg-transparent text-xs font-bold text-discovery-500 outline-none cursor-pointer text-right dir-rtl focus:text-white"
                                >
                                    {['Urban', 'Nature', 'Industrial', 'Mixed'].map(t => <option key={t} value={t} className="bg-surface text-white">{t}</option>)}
                                </select>
                            </SettingRow>
                        </div>
                    </section>
                )}

                {stats.activeRoles.includes('Student') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 ml-1">
                            <GraduationCap size={14} className="text-learning-500" />
                            <h3 className="text-[10px] font-black text-learning-500 uppercase tracking-[0.2em]">Academic</h3>
                        </div>
                        <div className="space-y-1">
                            <SettingRow icon={School} label="Stage" description="Complexity" activeColor="text-learning-500">
                                <select 
                                    value={stats.rolePreferences.Student.academicLevel}
                                    onChange={(e) => updateRolePref('Student', 'academicLevel', e.target.value)}
                                    className="bg-transparent text-xs font-bold text-learning-500 outline-none cursor-pointer text-right max-w-[120px]"
                                >
                                    {ACADEMIC_LEVELS.map(lvl => <option key={lvl} value={lvl} className="bg-surface text-white">{lvl}</option>)}
                                </select>
                            </SettingRow>
                            
                            <SettingRow icon={BookOpen} label={regionRoot.curriculumLabel} description="Standard" activeColor="text-learning-500">
                                <select 
                                    value={stats.rolePreferences.Student.curriculum}
                                    onChange={(e) => updateRolePref('Student', 'curriculum', e.target.value)}
                                    className="bg-transparent text-xs font-bold text-learning-500 outline-none cursor-pointer text-right max-w-[120px]"
                                >
                                    {activeLevelConfig.curricula.map(cur => <option key={cur} value={cur} className="bg-surface text-white">{cur}</option>)}
                                </select>
                            </SettingRow>

                            <SettingRow icon={Radio} label="Live Assistant" description="Fact Check Helper" activeColor="text-learning-500" onClick={() => updateRolePref('Student', 'syncGrounding', !stats.rolePreferences.Student.syncGrounding)}>
                                <CustomToggle active={stats.rolePreferences.Student.syncGrounding} color="bg-learning-500" />
                            </SettingRow>
                        </div>
                    </section>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
