import React, { useState } from 'react';
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { Mail, Lock, User, ArrowRight, X, AlertTriangle, Loader, CheckCircle, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface AuthProps {
    onAuthenticated: () => void;
}

type AuthMode = 'signin' | 'signup' | 'verify';

export default function Auth({ onAuthenticated }: AuthProps) {
    const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
    const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

    const [mode, setMode] = useState<AuthMode>('signin');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState(""); // Optional, for display or meta
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Tactical Noir Theme Colors
    const accentColor = mode === 'signin' ? 'text-cyan-400' : 'text-violet-400';
    const accentBg = mode === 'signin' ? 'bg-cyan-500' : 'bg-violet-500';
    const accentBorder = mode === 'signin' ? 'border-cyan-500/50' : 'border-violet-500/50';
    const glowShadow = mode === 'signin' ? 'shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'shadow-[0_0_20px_rgba(139,92,246,0.3)]';
    const gradientBg = mode === 'signin' ? 'from-cyan-500/20 to-blue-600/20' : 'from-violet-500/20 to-fuchsia-600/20';

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignInLoaded) return;
        setLoading(true);
        setError(null);

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setSignInActive({ session: result.createdSessionId });
                onAuthenticated();
            } else {
                console.error("SignIn incomplete", result);
                setError("Sign in requires further steps.");
            }
        } catch (err: any) {
            console.error("SignIn error", err);
            // If session already exists, we can consider it a success and proceed
            if (err.errors?.[0]?.code === "session_already_exists") {
                onAuthenticated();
                return;
            }
            setError(err.errors?.[0]?.message || "Failed to sign in. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignUpLoaded) return;
        setLoading(true);
        setError(null);

        try {
            await signUp.create({
                emailAddress: email,
                password,
                // Note: username is only sent if enabled in Clerk Dashboard. 
                // Currently rejected by API, so removed to ensure sign-up works.
            });

            // Prepare email verification
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setMode('verify');
        } catch (err: any) {
            console.error("SignUp error", err);
            setError(err.errors?.[0]?.message || "Failed to sign up.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignUpLoaded) return;
        setLoading(true);
        setError(null);

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (result.status === "complete") {
                await setSignUpActive({ session: result.createdSessionId });
                onAuthenticated();
            } else {
                console.error("Verification incomplete", result);
                setError("Verification incomplete.");
            }
        } catch (err: any) {
            console.error("Verification error", err);
            setError(err.errors?.[0]?.message || "Invalid verification code.");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError(null);
        setEmail("");
        setPassword("");
        setCode("");
    };

    return (
        <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-200">

            {/* Immersive Background Effects */}
            <div className="absolute inset-0 z-0">
                {/* Abstract Image Background */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-color-dodge"></div>
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-b ${gradientBg} transition-colors duration-1000`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            </div>

            {/* Main Content Container - Frameless/Floating */}
            <div className="w-full max-w-sm z-10 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Header & Logo */}
                <div className="text-center space-y-6 flex flex-col items-center">

                    {/* Logo Component */}
                    <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${mode === 'signin' ? 'from-cyan-500 to-blue-600' : 'from-violet-500 to-fuchsia-600'} shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center border-4 border-white/10 backdrop-blur-md animate-in zoom-in duration-500`}>
                        <div className="text-white">
                            {/* Using a Compass icon as the app logo metaphor */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-2xl">
                            QUEST<span className={accentColor}>LENS</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium tracking-wide">
                            {mode === 'signin' ? 'Welcome back! Please sign in.' : mode === 'signup' ? 'Create an account to join.' : 'Verify your email address.'}
                        </p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/10 border-l-2 border-red-500 p-4 rounded-r-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                        <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-200 text-xs font-medium leading-relaxed">{error}</p>
                    </div>
                )}

                {/* Forms */}
                <form onSubmit={mode === 'signin' ? handleSignIn : mode === 'signup' ? handleSignUp : handleVerify} className="space-y-6">

                    {mode !== 'verify' && (
                        <>
                            <div className="space-y-4">
                                {/* Email Input */}
                                <div className="group relative">
                                    <div className={`absolute left-0 bottom-0 w-full h-[1px] bg-slate-800 group-focus-within:${accentBg} transition-colors duration-300`} />
                                    <div className="flex items-center gap-3 py-3 text-slate-400 group-focus-within:text-white transition-colors">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email Address"
                                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 font-medium"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                {/* Username Input (SignUp only) */}
                                {mode === 'signup' && (
                                    <div className="group relative animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className={`absolute left-0 bottom-0 w-full h-[1px] bg-slate-800 group-focus-within:${accentBg} transition-colors duration-300`} />
                                        <div className="flex items-center gap-3 py-3 text-slate-400 group-focus-within:text-white transition-colors">
                                            <User size={18} />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Username"
                                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 font-medium"
                                                required={false}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Password Input */}
                                <div className="group relative">
                                    <div className={`absolute left-0 bottom-0 w-full h-[1px] bg-slate-800 group-focus-within:${accentBg} transition-colors duration-300`} />
                                    <div className="flex items-center gap-3 py-3 text-slate-400 group-focus-within:text-white transition-colors">
                                        <Lock size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 font-medium"
                                            required
                                            autoComplete={mode === 'signin' ? "current-password" : "new-password"}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Verification Code Input */}
                    {mode === 'verify' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="group relative">
                                <div className={`absolute left-0 bottom-0 w-full h-[1px] bg-slate-800 group-focus-within:${accentBg} transition-colors duration-300`} />
                                <div className="flex items-center gap-3 py-3 text-slate-400 group-focus-within:text-white transition-colors">
                                    <CheckCircle size={18} />
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Enter Code"
                                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600 font-medium tracking-[0.2em]"
                                        required
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Check your email for the verification code.</p>
                        </div>
                    )}

                    {/* Main Action Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full h-14 ${accentBg} text-white font-bold uppercase tracking-widest text-xs rounded-xl ${glowShadow} hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 group relative overflow-hidden`}
                    >
                        {loading ? <Loader className="animate-spin" size={20} /> : (
                            <>
                                <span className="relative z-10">{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Verify'}</span>
                                <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    </button>

                    {/* Clerk Bot Protection Hint */}
                    <div id="clerk-captcha"></div>

                </form>

                {/* Footer Actions */}
                <div className="text-center space-y-4">

                    {mode === 'signin' && (
                        <div className="flex flex-col gap-4 text-xs font-medium text-slate-500">
                            <button className="hover:text-slate-300 transition-colors">Forgot Password?</button>
                            <div className="flex items-center justify-center gap-2">
                                <span>Don't have an account?</span>
                                <button onClick={() => switchMode('signup')} className={`uppercase font-bold tracking-wider ${accentColor} hover:brightness-125 transition-all`}>
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'signup' && (
                        <div className="flex flex-col gap-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center justify-center gap-2">
                                <span>Already have an account?</span>
                                <button onClick={() => switchMode('signin')} className={`uppercase font-bold tracking-wider ${accentColor} hover:brightness-125 transition-all`}>
                                    Sign In
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'verify' && (
                        <button onClick={() => switchMode('signup')} className="text-xs font-medium text-slate-500 hover:text-white flex items-center justify-center gap-1 transition-colors">
                            <ArrowRight size={12} className="rotate-180" /> Back to Registration
                        </button>
                    )}

                </div>

            </div>
        </div>
    );
}
