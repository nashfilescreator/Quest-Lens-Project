
import React, { useState, useEffect, useMemo } from 'react';
import { UserStats } from '../types';
import { COUNTRY_ACADEMIC_MAP, LevelConfig } from '../constants';
import { 
  RefreshCw, User, ChevronLeft, GraduationCap, 
  Check, Flag, BookOpen, Calendar, Users, Camera
} from 'lucide-react';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface EditProfileModalProps {
  currentStats: UserStats;
  onSave: (updatedData: Partial<UserStats>) => void;
  onClose: () => void;
  currentCountry?: string;
}

const ACADEMIC_LEVELS = ['Primary', 'Secondary', 'Higher', 'Professional', 'Lifelong Learner'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentStats, onSave, onClose, currentCountry = 'USA' }) => {
  const [username, setUsername] = useState(currentStats.username);
  const [seed, setSeed] = useState(currentStats.avatarSeed);
  const [profileImage, setProfileImage] = useState<string | null>(currentStats.profileImage || null);
  const [bio, setBio] = useState(currentStats.bio || "");
  const [age, setAge] = useState(currentStats.age?.toString() || "");
  const [gender, setGender] = useState(currentStats.gender || "Other");

  // Determine configuration based on current country prop, which allows region switch to propagate
  const regionRoot = useMemo(() => {
    return COUNTRY_ACADEMIC_MAP[currentCountry] || COUNTRY_ACADEMIC_MAP['International'];
  }, [currentCountry]);

  const isStudent = currentStats.activeRoles.includes('Student');
  const [academicLevel, setAcademicLevel] = useState(currentStats.rolePreferences.Student.academicLevel);
  
  const activeLevelConfig: LevelConfig = useMemo(() => {
      return regionRoot.levelOverrides?.[academicLevel] || regionRoot.default;
  }, [regionRoot, academicLevel]);

  // Initial load: ensure current values are valid for the region, otherwise default to first available
  const [curriculum, setCurriculum] = useState(() => {
      const current = currentStats.rolePreferences.Student.curriculum;
      return activeLevelConfig.curricula.includes(current) ? current : activeLevelConfig.curricula[0];
  });
  
  const [grade, setGrade] = useState(() => {
      const current = currentStats.rolePreferences.Student.grade;
      return activeLevelConfig.grades.includes(current) ? current : activeLevelConfig.grades[0];
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(currentStats.rolePreferences.Student.subjects || []);

  // Update options if level changes within the modal
  useEffect(() => {
    if (isStudent) {
        if (!activeLevelConfig.curricula.includes(curriculum)) {
            setCurriculum(activeLevelConfig.curricula[0]);
        }
        if (!activeLevelConfig.grades.includes(grade)) {
            setGrade(activeLevelConfig.grades[0]);
        }
    }
  }, [academicLevel, activeLevelConfig, isStudent]);

  const toggleSubject = (subj: string) => {
      setSelectedSubjects(prev => 
          prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
      );
      playSound('click');
  };

  const handleSave = () => {
    if (username.trim()) {
      const updatedData: Partial<UserStats> = {
        username,
        avatarSeed: seed,
        profileImage: profileImage || null,
        bio,
        age: parseInt(age) || null,
        gender
      };

      if (isStudent) {
        updatedData.rolePreferences = {
          ...currentStats.rolePreferences,
          Student: {
            ...currentStats.rolePreferences.Student,
            academicLevel,
            curriculum,
            grade,
            subjects: selectedSubjects
          }
        };
      }

      onSave(updatedData);
      playSound('success');
    }
  };

  return (
    <div className="fixed inset-0 z-[140] bg-background flex flex-col animate-in slide-in-from-right duration-400 overflow-hidden font-sans">
      {/* Frameless Header */}
      <div className="flex items-center justify-between px-6 py-6 shrink-0 bg-background/80 backdrop-blur-md z-30 border-b border-white/5">
          <button onClick={onClose} className="p-2 -ml-2 text-txt-dim hover:text-white transition-all active:scale-90">
              <ChevronLeft size={28} />
          </button>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">Settings</h2>
          <button 
              onClick={handleSave}
              disabled={!username.trim()}
              className="text-primary font-black uppercase text-xs tracking-[0.2em] hover:text-indigo-400 active:scale-95 disabled:opacity-30 transition-all"
          >
              Save
          </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 scrollbar-hide">
          
          {/* Circular Avatar Selector */}
          <div className="flex flex-col items-center mb-12 mt-4">
              <div className="relative group">
                  <div className="w-36 h-36 rounded-[3rem] p-1 bg-gradient-to-br from-primary via-purple-500 to-pink-500 relative animate-[spin_10s_linear_infinite] group-hover:animate-none"></div>
                  <div className="absolute inset-1 rounded-[2.8rem] overflow-hidden bg-surface shadow-2xl border-4 border-background">
                        <OptimizedImage 
                            src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                        />
                  </div>
                  
                  <button 
                      onClick={() => setSeed(Math.random().toString(36).substring(7))}
                      className="absolute -bottom-2 -right-2 w-12 h-12 bg-white text-black border-4 border-background rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all z-20 hover:bg-primary hover:text-white"
                  >
                      <RefreshCw size={20} strokeWidth={3} />
                  </button>
              </div>
          </div>

          <div className="max-w-md mx-auto space-y-16">
              
              {/* Profile Identity Section */}
              <section className="space-y-10">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_10px_currentColor]"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Public Identity</span>
                  </div>
                  
                  <div className="space-y-8">
                      <div className="space-y-2 border-b border-white/10 pb-2 focus-within:border-primary transition-colors group">
                        <label className="text-[10px] font-bold text-txt-dim uppercase tracking-widest block group-focus-within:text-white transition-colors">Display Name</label>
                        <input 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder:text-txt-dim/30"
                            placeholder="Assign handle..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-2 border-b border-white/10 pb-2 focus-within:border-primary transition-colors group">
                            <label className="text-[10px] font-bold text-txt-dim uppercase tracking-widest block group-focus-within:text-white transition-colors">Age</label>
                            <input 
                                type="number"
                                value={age} 
                                onChange={(e) => setAge(e.target.value)} 
                                placeholder="--"
                                className="w-full bg-transparent text-xl font-bold text-white outline-none placeholder:text-txt-dim/30"
                            />
                        </div>
                        <div className="space-y-2 border-b border-white/10 pb-2 focus-within:border-primary transition-colors group">
                            <label className="text-[10px] font-bold text-txt-dim uppercase tracking-widest block group-focus-within:text-white transition-colors">Gender</label>
                            <select 
                                value={gender} 
                                onChange={(e) => setGender(e.target.value)} 
                                className="w-full bg-transparent text-xl font-bold text-white outline-none appearance-none cursor-pointer"
                            >
                                {GENDERS.map(g => <option key={g} value={g} className="bg-surface text-white">{g}</option>)}
                            </select>
                        </div>
                      </div>

                      <div className="space-y-2 border-b border-white/10 pb-2 focus-within:border-primary transition-colors group">
                        <label className="text-[10px] font-bold text-txt-dim uppercase tracking-widest block group-focus-within:text-white transition-colors">About Me</label>
                        <textarea 
                            value={bio} 
                            onChange={(e) => setBio(e.target.value)} 
                            placeholder="Tell us about yourself..."
                            className="w-full bg-transparent text-base font-medium text-white outline-none resize-none h-12 scrollbar-hide placeholder:text-txt-dim/30"
                        />
                      </div>
                  </div>
              </section>

              {/* Educational Knowledge Path */}
              {isStudent && (
                  <section className="space-y-10">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_currentColor]"></div>
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">Learning Path</span>
                      </div>
                      
                      <div className="space-y-12">
                        <div className="p-5 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <Flag size={24} />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-txt-dim uppercase tracking-widest block mb-0.5">Active Region</span>
                                    <span className="text-sm font-bold text-white">{currentCountry}</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all hover:bg-emerald-400">Change</button>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-2 border-b border-white/10 pb-2 focus-within:border-emerald-500 transition-colors group">
                                <label className="text-[10px] font-bold text-txt-dim uppercase tracking-widest block group-focus-within:text-white transition-colors">Level of Study</label>
                                <select 
                                    value={academicLevel} 
                                    onChange={(e) => setAcademicLevel(e.target.value as any)}
                                    className="w-full bg-transparent text-xl font-bold text-white outline-none appearance-none cursor-pointer"
                                >
                                    {ACADEMIC_LEVELS.map(lvl => <option key={lvl} value={lvl} className="bg-surface text-white">{lvl}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-2 border-b border-white/10 pb-2 focus-within:border-emerald-500 transition-colors group">
                                    <label className="text-[10px] font-bold text-txt-dim uppercase tracking-widest block group-focus-within:text-white transition-colors">{regionRoot.curriculumLabel}</label>
                                    <select 
                                        value={curriculum} 
                                        onChange={(e) => setCurriculum(e.target.value)}
                                        className="w-full bg-transparent text-xl font-bold text-white outline-none appearance-none cursor-pointer"
                                    >
                                        {activeLevelConfig.curricula.map(cur => <option key={cur} value={cur} className="bg-surface text-white">{cur}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2 border-b border-white/10 pb-2 focus-within:border-emerald-500 transition-colors group">
                                    <label className="text-[10px] font-bold text-txt-dim uppercase tracking-widest block group-focus-within:text-white transition-colors">{regionRoot.gradeLabel}</label>
                                    <select 
                                        value={grade} 
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full bg-transparent text-xl font-bold text-white outline-none appearance-none cursor-pointer"
                                    >
                                        {activeLevelConfig.grades.map(grd => <option key={grd} value={grd} className="bg-surface text-white">{grd}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-bold text-txt-dim uppercase tracking-widest block">Study Subjects</label>
                                <div className="flex flex-wrap gap-3">
                                    {activeLevelConfig.subjects.map(subj => {
                                        const isSelected = selectedSubjects.includes(subj);
                                        return (
                                            <button
                                                key={subj}
                                                onClick={() => toggleSubject(subj)}
                                                className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    isSelected 
                                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105' 
                                                    : 'bg-white/5 text-txt-dim border-white/10 hover:border-emerald-500/50 hover:bg-white/10'
                                                }`}
                                            >
                                                {subj}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                      </div>
                  </section>
              )}
          </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
          <button 
              onClick={handleSave}
              className="w-full h-18 bg-white text-black font-black text-sm uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-gray-100"
          >
              <Check size={24} strokeWidth={3} /> Sync Profile
          </button>
      </div>

    </div>
  );
};

export default EditProfileModal;
