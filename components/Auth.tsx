import React, { useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { SignIn, SignUp } from "@clerk/clerk-react";
import OptimizedImage from './OptimizedImage';

interface AuthProps {
  onAuthenticated: (user: any, isNewUser: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="fixed inset-0 z-[110] bg-[#020617] flex flex-col font-sans overflow-hidden text-white">

      {/* Real World Background Image */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=1200"
          className="w-full h-full object-cover"
          alt="Neighborhood Explorer Background"
        />
        {/* Dark Overlays for Readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/40"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 w-full max-w-md mx-auto h-full overflow-y-auto pt-safe pb-safe">

        {/* Centered Brand Header */}
        <div className="mb-6 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative mb-5">
            {/* Glow Halo */}
            <div className="absolute inset-0 bg-amber-400/30 rounded-[1.8rem] blur-2xl animate-pulse scale-110"></div>

            <div className="relative w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center border border-white/50 shadow-2xl overflow-hidden group">
              <Compass size={40} className="text-amber-500 transition-transform group-hover:scale-110 duration-500" strokeWidth={2} />
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
            </div>

            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-xl p-1.5 shadow-lg border border-white/20">
              <Sparkles size={12} fill="white" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-1.5">
            Quest Lens
          </h1>
          <p className="text-[11px] text-white/60 font-bold uppercase tracking-[0.2em]">
            {mode === 'signup' ? 'Start your journey' : 'Welcome back Agent'}
          </p>
        </div>

        {/* Clerk Auth Component */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 backdrop-blur-xl bg-black/30 p-2 rounded-3xl border border-white/10 shadow-2xl">
          {mode === 'login' ? (
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full p-6",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:scale-[1.02] transition-all",
                  maxWidth: "100%",
                  footer: { display: "none" }
                },
                layout: { showOptionalFields: false }
              }}
              signUpUrl="#"
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full p-6",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "bg-gradient-to-r from-emerald-500 to-teal-600 border-0 hover:scale-[1.02] transition-all",
                  maxWidth: "100%",
                  footer: { display: "none" }
                }
              }}
            />
          )}
        </div>

        {/* Custom Toggle Footer to keep theme */}
        <div className="mt-8 text-center animate-in fade-in duration-1000 delay-500 pb-10">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <span>{mode === 'login' ? "Need an account?" : "Already a member?"}</span>
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className={`font-black hover:brightness-125 transition-all pb-0.5 border-b-2 ${mode === 'login' ? 'text-emerald-400 border-emerald-400/30' : 'text-indigo-400 border-indigo-400/30'}`}
            >
              {mode === 'login' ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
