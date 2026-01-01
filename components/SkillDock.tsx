
import React, { useState, useEffect, useMemo } from 'react';
import { AppRole, Skill } from '../types';
import { Radar, Zap, Share2, GraduationCap, X, Sparkles } from 'lucide-react';

interface SkillDockProps {
  activeRoles: AppRole[];
  cooldowns: Record<string, number>;
  onUseSkill: (skill: Skill) => void;
  onCancelSkill?: (skillId: string) => void;
}

const SKILL_DATABASE: (Skill & { role: AppRole; color: string })[] = [
  { id: 'sk_deep_scan', name: 'Range Pulse', description: 'Extends discovery range', cooldown: 300, icon: 'Radar', role: 'Explorer', color: 'text-blue-500' },
  { id: 'sk_adrenaline', name: 'Arena Surge', description: 'Faster results in duels', cooldown: 600, icon: 'Zap', role: 'Competitor', color: 'text-red-500' },
  { id: 'sk_viral', name: 'Influence 2X', description: 'Double influence on next post', cooldown: 1200, icon: 'Share2', role: 'Creator', color: 'text-purple-500' },
  { id: 'sk_focus', name: 'Study Link', description: 'Earn +50% SXP bonus', cooldown: 900, icon: 'GraduationCap', role: 'Student', color: 'text-emerald-500' }
];

const ICON_MAP: Record<string, React.ElementType> = {
  Radar,
  Zap,
  Share2,
  GraduationCap
};

const CircularProgress: React.FC<{ progress: number; color: string; size?: number; strokeWidth?: number }> = ({ progress, color, size = 40, strokeWidth = 3 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="text-white/10"
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className={`${color} transition-all duration-1000 ease-linear`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        style={{ strokeDashoffset: offset }}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};

const SkillDock: React.FC<SkillDockProps> = ({ activeRoles, cooldowns, onUseSkill, onCancelSkill }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const availableSkills = useMemo(() => {
    return SKILL_DATABASE.filter(skill => activeRoles.includes(skill.role));
  }, [activeRoles]);

  if (availableSkills.length === 0) {
      return (
          <div className="py-10 text-center space-y-2 opacity-50">
              <Sparkles size={32} className="mx-auto text-txt-dim" />
              <p className="text-[10px] font-black uppercase tracking-widest text-txt-dim not-italic">No Skills Initialized</p>
          </div>
      );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {availableSkills.map(skill => {
        const cooldownEndTime = cooldowns[skill.id] || 0;
        const isOnCooldown = now < cooldownEndTime;
        const totalCooldownMs = skill.cooldown * 1000;
        const remainingMs = cooldownEndTime - now;
        const progress = isOnCooldown ? Math.max(0, Math.min(100, (remainingMs / totalCooldownMs) * 100)) : 0;
        
        const IconComponent = ICON_MAP[skill.icon] || Zap;

        const handleClick = () => {
          if (isOnCooldown) {
            onCancelSkill?.(skill.id);
          } else {
            onUseSkill(skill);
          }
        };

        return (
          <button
            key={skill.id}
            onClick={handleClick}
            className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all relative group h-32 ${
              isOnCooldown 
                ? 'bg-white/[0.03] border-white/10 opacity-80' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 active:scale-95 shadow-sm'
            }`}
          >
            <div className="relative mb-2">
              <CircularProgress 
                progress={isOnCooldown ? progress : 0} 
                color={isOnCooldown ? 'text-primary' : skill.color} 
                size={54} 
                strokeWidth={4} 
              />
              <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                isOnCooldown ? 'text-primary' : skill.color
              }`}>
                {isOnCooldown ? (
                  <X size={20} className="opacity-0 group-hover:opacity-100 absolute transition-opacity" />
                ) : null}
                <IconComponent size={24} className={`${isOnCooldown ? 'group-hover:opacity-0' : ''} transition-opacity fill-current opacity-90`} />
              </div>
            </div>

            <div className="text-center">
              <span className={`text-[11px] font-bold block leading-tight not-italic ${isOnCooldown ? 'text-primary' : 'text-white'}`}>
                {skill.name}
              </span>
              <p className={`text-[9px] mt-1 font-black uppercase tracking-tighter not-italic ${isOnCooldown ? 'text-red-400' : 'text-txt-dim'}`}>
                {isOnCooldown ? `${Math.ceil(remainingMs / 1000)}s` : 'Ready'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SkillDock;
