
import React, { useState } from 'react';
import { ChevronRight, Camera, Trophy, Map, Compass, Sparkles, ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgImage: string;
  gradient: string;
  accent: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: "Discover Your World",
    description: "Turn your daily walk into an adventure. Find hidden gems and interesting items right in your neighborhood.",
    icon: <Compass size={40} className="text-white" />,
    bgImage: "/assets/quests/daily_explorer.png",
    gradient: "from-blue-600/80 via-indigo-600/40 to-transparent",
    accent: "bg-blue-500"
  },
  {
    title: "Snap & Collect",
    description: "Use the smart lens to identify objects. Build your collection of discoveries and earn rewards.",
    icon: <Camera size={40} className="text-white" />,
    bgImage: "/assets/quests/story_adventure.png",
    gradient: "from-purple-600/80 via-fuchsia-600/40 to-transparent",
    accent: "bg-purple-500"
  },
  {
    title: "Play Together",
    description: "Join community teams, share your findings, and climb the local leaderboards.",
    icon: <Trophy size={40} className="text-white" />,
    bgImage: "/assets/quests/team_coop.png",
    gradient: "from-emerald-600/80 via-teal-600/40 to-transparent",
    accent: "bg-emerald-500"
  }
];

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans overflow-hidden">

      {/* Immersive Background Layer */}
      <div className="absolute inset-0 z-0">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === step ? 'opacity-100' : 'opacity-0'}`}
          >
            <OptimizedImage
              src={s.bgImage}
              className="w-full h-full object-cover"
              alt="Onboarding"
            />
            <div className={`absolute inset-0 bg-gradient-to-b ${s.gradient} mix-blend-multiply`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Floating Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-12">

        <div className="mb-8">
          <div className={`w-20 h-20 rounded-[2rem] ${current.accent} shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center mb-8 animate-in zoom-in slide-in-from-bottom-10 duration-500 border-4 border-white/10 backdrop-blur-md`}>
            {current.icon}
          </div>

          <h1 className="text-5xl font-extrabold text-white mb-4 leading-[1.1] tracking-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 key={step}-title">
            {current.title}
          </h1>

          <p className="text-white/80 text-lg leading-relaxed font-medium max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700 key={step}-desc">
            {current.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${i === step ? `w-12 ${current.accent} shadow-glow` : 'w-2 bg-white/20'}`}
              ></div>
            ))}
          </div>

          <button
            onClick={handleNext}
            className={`group h-16 px-8 ${current.accent} text-white rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all hover:brightness-110 hover:scale-105`}
          >
            <span className="font-bold uppercase tracking-widest text-sm">{step === STEPS.length - 1 ? "Start" : "Next"}</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
