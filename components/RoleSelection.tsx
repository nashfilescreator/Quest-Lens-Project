
import React, { useState } from 'react';
import { Check, ChevronRight, Loader, Zap } from 'lucide-react';
import { AppRole } from '../types';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';
import { ROLE_ICONS } from '../constants';

interface RoleSelectionProps {
  onComplete: (selectedRoles: AppRole[]) => void;
  username: string;
}

const ROLES: {
  id: AppRole;
  title: string;
  description: string;
  icon: string;
  gradient: string;
}[] = [
    {
      id: 'Explorer',
      title: 'Explorer',
      description: 'Find hidden items.',
      icon: ROLE_ICONS['Explorer'],
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'Competitor',
      title: 'Competitor',
      description: 'Climb the ranks.',
      icon: ROLE_ICONS['Competitor'],
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'Creator',
      title: 'Creator',
      description: 'Design new quests.',
      icon: ROLE_ICONS['Creator'],
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      id: 'Student',
      title: 'Student',
      description: 'Learn real facts.',
      icon: ROLE_ICONS['Student'],
      gradient: 'from-emerald-500 to-green-600'
    },
  ];

const RoleSelection: React.FC<RoleSelectionProps> = ({ onComplete, username }) => {
  const [selected, setSelected] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleRole = (roleId: AppRole) => {
    setSelected(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
    playSound('click');
  };

  const handleConfirm = () => {
    if (selected.length > 0) {
      setIsLoading(true);
      playSound('hero');
      setTimeout(() => {
        onComplete(selected);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-[#020617] flex flex-col overflow-hidden font-sans text-white">

      {/* Immersive Urban Discovery Background */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
          className="w-full h-full object-cover"
          alt="Collaboration & Discovery Background"
        />
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-black/75"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-transparent to-[#020617]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pt-12">
        <div className="mb-8 text-center space-y-3 animate-in slide-in-from-bottom duration-700">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 mb-2 shadow-sm">
            <Zap size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Identity Matrix</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">
            Choose Your Path
          </h1>
          <p className="text-white/50 text-xs font-medium max-w-[200px] mx-auto">
            Select the roles that define your journey.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-x-6 gap-y-8 px-4">
          {ROLES.map((role) => {
            const isSelected = selected.includes(role.id);
            return (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className="group flex flex-col items-center gap-3 relative outline-none"
              >
                {/* Icon Container */}
                <div className={`
                    w-20 h-20 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 relative
                    ${isSelected ? `bg-gradient-to-br ${role.gradient} shadow-[0_0_30px_rgba(0,0,0,0.3)] scale-110` : 'bg-white/5 group-hover:bg-white/10 text-white/30'}
                `}>
                  <div className={`transition-all duration-300 w-12 h-12 ${isSelected ? 'scale-110' : 'scale-100 opacity-50'}`}>
                    <OptimizedImage
                      src={role.icon}
                      alt={role.title}
                      className="w-full h-full"
                      imgClassName="object-contain"
                    />
                  </div>
                  {isSelected && <div className="absolute inset-0 rounded-[2.2rem] bg-white/20 animate-pulse"></div>}

                  {/* Selected Checkmark */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-black shadow-lg animate-in zoom-in duration-300">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="text-center space-y-0.5">
                  <span className={`text-[11px] font-black uppercase tracking-widest block transition-colors ${isSelected ? 'text-white' : 'text-white/40'}`}>
                    {role.title}
                  </span>
                  <span className={`text-[9px] font-medium block transition-colors ${isSelected ? 'text-white/70' : 'text-white/20'}`}>
                    {role.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer - Moved upwards closer to icons and increased bottom padding */}
      <div className="px-8 pt-6 pb-28 z-20 flex justify-center w-full">
        <button
          onClick={handleConfirm}
          disabled={selected.length === 0 || isLoading}
          className={`
            w-full max-w-sm h-16 bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-full shadow-2xl flex items-center justify-center gap-3 transition-all
            ${selected.length > 0
              ? 'hover:scale-[1.02] active:scale-[0.98] opacity-100 shadow-primary/30'
              : 'opacity-30 cursor-not-allowed shadow-none grayscale'}
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader className="animate-spin" size={16} />
              <span>Initializing...</span>
            </div>
          ) : (
            <>
              Start Exploring <ChevronRight size={16} strokeWidth={3} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
