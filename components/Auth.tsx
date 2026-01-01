
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Compass, AlertCircle, Loader, ChevronLeft, Sparkles } from 'lucide-react';
import { playSound } from '../services/audioService';
import { loginUser, registerUser, resetPassword } from '../services/authService';
import OptimizedImage from './OptimizedImage';

interface AuthProps {
  onAuthenticated: (user: any, isNewUser: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    
    if (mode !== 'reset' && password.length < 6) { 
      setError("Password must be at least 6 characters."); 
      return; 
    }
    
    setIsLoading(true);
    playSound('click');

    try {
      if (mode === 'signup') {
        const user = await registerUser(email, password, username);
        playSound('success');
        onAuthenticated(user, true);
      } else if (mode === 'login') {
        const user = await loginUser(email, password);
        playSound('success');
        onAuthenticated(user, false);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setInfo("Check your email for a reset link.");
        setMode('login');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already in use.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      playSound('error');
    } finally { 
      setIsLoading(false); 
    }
  };

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

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 w-full max-w-md mx-auto">
        
        {/* Centered Brand Header */}
        <div className="mb-10 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
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
                {mode === 'signup' ? 'Start your journey' : mode === 'reset' ? 'Password Recovery' : 'Welcome back'}
            </p>
        </div>

        {/* Form Area - Reduced 10% in padding and height */}
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {mode === 'signup' && (
                    <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-emerald-400 transition-colors">
                            <User size={16} />
                        </div>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Your Name" 
                            className="w-full bg-white/10 backdrop-blur-xl border border-white/10 focus:border-emerald-500/50 focus:bg-white/15 rounded-[1.2rem] pl-14 pr-6 py-4 text-white placeholder:text-white/20 outline-none transition-all font-semibold text-sm shadow-xl" 
                            required 
                        />
                    </div>
                )}
                
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors">
                        <Mail size={16} />
                    </div>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email Address" 
                        className="w-full bg-white/10 backdrop-blur-xl border border-white/10 focus:border-indigo-500/50 focus:bg-white/15 rounded-[1.2rem] pl-14 pr-6 py-4 text-white placeholder:text-white/20 outline-none transition-all font-semibold text-sm shadow-xl" 
                        required 
                    />
                </div>

                {mode !== 'reset' && (
                    <div className="space-y-1.5 group">
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-rose-400 transition-colors">
                                <Lock size={16} />
                            </div>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Password" 
                                className="w-full bg-white/10 backdrop-blur-xl border border-white/10 focus:border-rose-500/50 focus:bg-white/15 rounded-[1.2rem] pl-14 pr-6 py-4 text-white placeholder:text-white/20 outline-none transition-all font-semibold text-sm shadow-xl" 
                                required 
                            />
                        </div>
                        {mode === 'login' && (
                            <div className="flex justify-end px-1">
                                <button 
                                    type="button" 
                                    onClick={() => { setMode('reset'); setError(null); }}
                                    className="text-[10px] font-bold text-white/30 hover:text-white transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                {error && (
                    <div className="flex items-center gap-3 text-white bg-rose-500/30 backdrop-blur-xl px-5 py-3 rounded-2xl border border-rose-500/20 animate-in zoom-in-95 duration-300">
                        <AlertCircle size={16} className="text-rose-400 shrink-0" />
                        <span className="text-xs font-bold text-rose-100">{error}</span>
                    </div>
                )}

                {info && (
                    <div className="flex items-center gap-3 text-white bg-emerald-500/30 backdrop-blur-xl px-5 py-3 rounded-2xl border border-emerald-500/20 animate-in zoom-in-95 duration-300">
                        <Sparkles size={16} className="text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-emerald-100">{info}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className={`
                        w-full h-14 mt-4 font-black rounded-[1.2rem] shadow-2xl flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-[0.1em] text-[11px] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden group border border-white/10
                        ${mode === 'signup' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'}
                        ${mode === 'reset' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' : ''}
                    `}
                >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    {isLoading ? <Loader className="animate-spin" size={18} /> : (
                    <>
                        {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'} 
                        <ArrowRight size={16} strokeWidth={3} />
                    </>
                    )}
                </button>

                {mode === 'reset' && (
                    <button 
                        type="button"
                        onClick={() => setMode('login')}
                        className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors py-3 text-[10px] font-black uppercase tracking-widest"
                    >
                        <ChevronLeft size={14} /> Back to Login
                    </button>
                )}
            </form>
        </div>

        {/* Centered Mode Toggle Footer */}
        <div className="mt-10 text-center animate-in fade-in duration-1000 delay-500">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <span>{mode === 'login' ? "Need an account?" : "Already a member?"}</span>
                {mode !== 'reset' && (
                  <button 
                      onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login');
                        setError(null);
                        setInfo(null);
                        playSound('click');
                      }} 
                      className={`font-black hover:brightness-125 transition-all pb-0.5 border-b-2 ${mode === 'login' ? 'text-emerald-400 border-emerald-400/30' : 'text-indigo-400 border-indigo-400/30'}`}
                  >
                      {mode === 'login' ? "Sign Up" : "Log In"}
                  </button>
                )}
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
