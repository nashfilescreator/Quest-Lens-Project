
import React, { useState } from 'react';
import { ChevronLeft, ArrowRight, Shield, Globe, Lock, Loader, Zap, Image as ImageIcon, Check } from 'lucide-react';
import { playSound } from '../services/audioService';
import OptimizedImage from './OptimizedImage';

interface CreateTeamProps {
  onCreate: (teamData: { name: string; description: string; avatar: string; privacy: 'open' | 'invite' | 'apply' }) => void;
  onCancel: () => void;
  coinCost: number;
  userCoins: number;
}

const CreateTeam: React.FC<CreateTeamProps> = ({ onCreate, onCancel, coinCost, userCoins }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [privacy, setPrivacy] = useState<'open' | 'invite' | 'apply'>('apply');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateLogo = () => {
    if (!name) return;
    setIsGenerating(true);
    playSound('click');
    
    setTimeout(() => {
      const seed = Math.floor(Math.random() * 1000);
      const url = `https://image.pollinations.ai/prompt/minimalist%20team%20logo%20${encodeURIComponent(name)}%20vector%20vibrant%20colors?width=400&height=400&nologo=true&seed=${seed}`;
      setAvatar(url);
      setIsGenerating(false);
      playSound('success');
    }, 1500);
  };

  const handleNextStep = () => {
    if (step === 1) {
        if (!name.trim() || !description.trim()) {
            setError('Please name your team and provide a motto.');
            return;
        }
        if (!avatar) {
            setError('Please generate or set a team emblem.');
            return;
        }
    }
    setError('');
    setStep(s => s + 1);
    playSound('click');
  };

  const handleCreate = () => {
    if (userCoins < coinCost) {
      setError("Insufficient funds.");
      return;
    }
    playSound('hero');
    onCreate({ name, description, avatar, privacy });
  };

  const PRIVACY_OPTIONS = [
      { id: 'open', label: 'Open', desc: 'Anyone can join instantly.', icon: Globe, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
      { id: 'apply', label: 'Application', desc: 'Review requests first.', icon: Shield, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
      { id: 'invite', label: 'Private', desc: 'Invite code only.', icon: Lock, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="fixed inset-0 z-[140] bg-background flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden font-sans text-txt-main">
      
      {/* Header matching CreateQuest */}
      <div className="flex items-center justify-between px-6 py-6 shrink-0 bg-background/90 backdrop-blur-md z-30 border-b border-white/5">
          <button onClick={step === 1 ? onCancel : () => setStep(1)} className="p-2 -ml-2 text-txt-dim hover:text-white transition-all active:scale-90">
              <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
              <h2 className="text-sm font-black text-white uppercase tracking-widest bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                  Establish Team
              </h2>
          </div>
          <div className="w-8"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
          <div className="max-w-md mx-auto space-y-8 pb-32">
            
            {step === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-left duration-500">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1">Identity</label>
                        
                        {/* Avatar Generator */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-surface border border-white/10 shadow-lg group">
                                {avatar ? (
                                    <OptimizedImage src={avatar} className="w-full h-full object-cover" alt="Team Logo" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-txt-dim">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                                {isGenerating && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <Loader className="animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={generateLogo}
                                disabled={!name || isGenerating}
                                className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                            >
                                {avatar ? 'Regenerate Emblem' : 'Generate from Name'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Team Name</label>
                        <input 
                            type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Night Owls"
                            className="w-full bg-transparent border-b border-white/20 py-3 text-3xl font-extrabold text-white outline-none focus:border-primary transition-all placeholder:text-txt-dim/20"
                        />
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Motto</label>
                        <textarea
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe your mission..."
                            className="w-full bg-transparent border-b border-white/20 py-2 text-base text-white font-medium focus:border-primary outline-none transition-all min-h-[80px] resize-none"
                        />
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-4">
                        <button 
                            onClick={handleNextStep}
                            disabled={!name.trim()}
                            className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-3xl active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 hover:brightness-110 flex items-center justify-center gap-2"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500">
                    <div className="text-center space-y-2 mb-6">
                        <h1 className="text-2xl font-extrabold text-white">Access Protocol</h1>
                        <p className="text-sm text-txt-dim font-medium">How should agents join your team?</p>
                    </div>

                    <div className="grid gap-4">
                        {PRIVACY_OPTIONS.map((opt) => {
                            const isSelected = privacy === opt.id;
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setPrivacy(opt.id as any)}
                                    className={`relative p-5 rounded-3xl text-left transition-all border ${
                                        isSelected 
                                        ? `bg-surface border-primary shadow-glow` 
                                        : 'bg-surface border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${opt.bg} ${opt.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h3 className={`text-base font-bold mb-1 ${isSelected ? 'text-white' : 'text-txt-main'}`}>{opt.label}</h3>
                                            <p className="text-xs text-txt-dim font-medium">{opt.desc}</p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-5 right-5 text-primary">
                                            <Check size={18} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="pt-8">
                        <button 
                            onClick={handleCreate}
                            disabled={userCoins < coinCost}
                            className="w-full py-5 bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:brightness-110"
                        >
                            <Zap size={16} fill="currentColor" />
                            Create Team <span className="opacity-70 ml-1">({coinCost} QC)</span>
                        </button>
                        {userCoins < coinCost && (
                            <p className="text-center text-rose-400 text-[10px] font-bold uppercase tracking-widest mt-4">Insufficient Funds</p>
                        )}
                    </div>
                </div>
            )}

          </div>
      </div>
    </div>
  );
};

export default CreateTeam;
