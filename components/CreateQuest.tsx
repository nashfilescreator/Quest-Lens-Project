
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Loader, MapPin, PenTool, Target, Zap, ChevronLeft, Image as ImageIcon, Check, Clock, Users, Trophy, BookOpen, Plus, Trash2, ArrowRight, Shield, GraduationCap, School, Star, Eye, Edit3, Wand2, X, Scroll, Swords, AlertCircle, Camera } from 'lucide-react';
import { generateAIQuests, findNearbyQuestLocations } from '../services/geminiService';
import { Quest, QuestDifficulty, QuestType, StoryStep, UserStats, AppRole } from '../types';
import { playSound } from '../services/audioService';
import { MATERIALS } from '../constants';
import QuestCard from './QuestCard';
import OptimizedImage from './OptimizedImage';

interface CreateQuestProps {
    onQuestCreated: (quests: Quest[]) => void;
    onCancel: () => void;
    initialData?: { image: string, title: string } | null;
    editingQuest?: Quest | null;
    userStats?: UserStats;
}

const AI_QUEST_TYPES = [
    { id: QuestType.STORY, label: 'Story', icon: Scroll, desc: 'Multi-chapter', gradient: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/20' },
    { id: QuestType.DAILY, label: 'Daily', icon: Clock, desc: 'Quick finds', gradient: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { id: QuestType.COMPETITIVE, label: 'Duel', icon: Swords, desc: 'Speed run', gradient: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/20' },
    { id: QuestType.TEAM, label: 'Team', icon: Users, desc: 'Co-op mission', gradient: 'from-blue-400 to-cyan-600', shadow: 'shadow-blue-500/20' },
    { id: QuestType.BOUNTY, label: 'Bounty', icon: Target, desc: 'Rare target', gradient: 'from-amber-400 to-orange-600', shadow: 'shadow-amber-500/20' },
    { id: QuestType.COMMUNITY, label: 'Social', icon: Users, desc: 'Local items', gradient: 'from-violet-500 to-fuchsia-600', shadow: 'shadow-violet-500/20' },
];

const AutoResizeTextarea = ({ value, onChange, className, placeholder, ...props }: any) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);
    return <textarea ref={textareaRef} value={value} onChange={onChange} placeholder={placeholder} className={`overflow-hidden resize-none ${className}`} rows={1} {...props} />;
};

const CreateQuest: React.FC<CreateQuestProps> = ({ onQuestCreated, onCancel, initialData, editingQuest, userStats }) => {
    const [mode, setMode] = useState<'choice' | 'ai' | 'manual'>(initialData || editingQuest ? 'manual' : 'choice');
    const [step, setStep] = useState(1);
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genPhase, setGenPhase] = useState('');
    const [useLocation, setUseLocation] = useState(false);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [aiType, setAiType] = useState<QuestType>(QuestType.DAILY);

    const [mTitle, setMTitle] = useState('');
    const [mDesc, setMDesc] = useState('');
    const [mTarget, setMTarget] = useState('');
    const [mDiff, setMDiff] = useState<QuestDifficulty>(QuestDifficulty.MEDIUM);
    const [mType, setMType] = useState<QuestType>(QuestType.COMMUNITY);
    const [mRoles, setMRoles] = useState<AppRole[]>(['Explorer']);
    const [mCover, setMCover] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [typeConfig, setTypeConfig] = useState<{ chapterCount: number; partySize: number; duration: number; rarity: string; }>({
        chapterCount: 3, partySize: 3, duration: 30, rarity: 'Common'
    });

    const [mSteps, setMSteps] = useState<{ title: string; desc: string; target: string }[]>([{ title: 'Chapter 1', desc: '', target: '' }]);

    useEffect(() => {
        if (mType === QuestType.STORY) {
            const currentLen = mSteps.length;
            const targetLen = typeConfig.chapterCount;
            if (targetLen > currentLen) {
                const newSteps = [...mSteps];
                for (let i = currentLen; i < targetLen; i++) newSteps.push({ title: `Chapter ${i + 1}`, desc: '', target: '' });
                setMSteps(newSteps);
            } else if (targetLen < currentLen) setMSteps(mSteps.slice(0, targetLen));
        }
    }, [typeConfig.chapterCount, mType]);

    useEffect(() => {
        if (editingQuest) {
            setMode('manual'); setStep(2);
            setMTitle(editingQuest.title); setMDesc(editingQuest.description); setMTarget(editingQuest.imagePrompt);
            setMDiff(editingQuest.difficulty); setMType(editingQuest.type); setMRoles(editingQuest.roleTags); setMCover(editingQuest.coverImage || '');
            if (editingQuest.storyLine) {
                setMSteps(editingQuest.storyLine.map(s => ({ title: s.title, desc: s.description, target: s.imagePrompt })));
                setTypeConfig(prev => ({ ...prev, chapterCount: editingQuest.storyLine?.length || 3 }));
            }
        } else if (initialData) {
            setMode('manual'); setStep(2);
            setMTitle(initialData.title); setMDesc(''); setMTarget(''); setMType(QuestType.COMMUNITY); setMCover(initialData.image);
        }
    }, [initialData, editingQuest]);

    const toggleRole = (role: AppRole) => {
        setMRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
        playSound('click');
    };

    const addStep = () => {
        setMSteps(prev => [...prev, { title: `Chapter ${prev.length + 1}`, desc: '', target: '' }]);
        playSound('click');
    };

    const removeStep = (index: number) => {
        setMSteps(prev => prev.filter((_, i) => i !== index));
        playSound('click');
    };

    const updateStep = (index: number, field: 'title' | 'desc' | 'target', value: string) => {
        setMSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        const phases = ["Thinking...", "Drafting quest...", "Adding details...", "Finalizing..."];
        let phaseIdx = 0;
        const phaseInterval = setInterval(() => { setGenPhase(phases[phaseIdx]); phaseIdx = (phaseIdx + 1) % phases.length; }, 800);
        playSound('click');

        try {
            let quests: Quest[] = [];
            if (useLocation && coords) {
                quests = await findNearbyQuestLocations(coords.lat, coords.lng, topic);
            } else {
                quests = await generateAIQuests(topic, 1, userStats?.rolePreferences, { country: userStats?.rolePreferences?.Student?.curriculum || 'International' } as any, aiType, typeConfig);
            }
            clearInterval(phaseInterval);
            if (quests.length > 0) {
                const q = quests[0];
                setMTitle(q.title); setMDesc(q.description); setMTarget(q.imagePrompt);
                setMDiff(q.difficulty); setMType(q.type); setMRoles(q.roleTags); setMCover(q.coverImage || '');
                if (q.storyLine && q.storyLine.length > 0) {
                    setMSteps(q.storyLine.map(s => ({ title: s.title, desc: s.description, target: s.imagePrompt })));
                    setTypeConfig(prev => ({ ...prev, chapterCount: q.storyLine?.length || 3 }));
                } else if (q.type === QuestType.STORY) {
                    setMSteps([{ title: 'Chapter 1', desc: q.description, target: q.imagePrompt }]);
                }
                setMode('manual'); setStep(2); playSound('success');
            }
        } catch (e) { setGenPhase("Connection failed."); } finally { setIsGenerating(false); }
    };

    const handleManualSubmit = () => {
        playSound('hero');
        const rewards = { [QuestDifficulty.EASY]: { xp: 50, coins: 10 }, [QuestDifficulty.MEDIUM]: { xp: 120, coins: 30 }, [QuestDifficulty.HARD]: { xp: 300, coins: 75 }, [QuestDifficulty.LEGENDARY]: { xp: 600, coins: 150 } }[mDiff];
        const isStory = mType === QuestType.STORY;
        const finalQuest: Quest = {
            id: editingQuest?.id || `usr-${Date.now()}`,
            title: mTitle, description: mDesc, type: mType, difficulty: mDiff,
            xpReward: isStory ? rewards.xp * mSteps.length : rewards.xp,
            coinReward: isStory ? rewards.coins * mSteps.length : rewards.coins,
            imagePrompt: isStory ? mSteps[0].target : mTarget,
            coverImage: mCover || '/assets/quests/community_discovery.png',
            creator: editingQuest?.creator || 'You', roleTags: mRoles,
            difficultyTier: mDiff === QuestDifficulty.EASY ? 1 : mDiff === QuestDifficulty.MEDIUM ? 2 : mDiff === QuestDifficulty.HARD ? 4 : 5,
            storyLine: isStory ? mSteps.map((s, i) => ({ id: i + 1, title: s.title, description: s.desc, imagePrompt: s.target, isCompleted: false, isLocked: i !== 0, rewardXP: Math.floor(rewards.xp / mSteps.length) })) : undefined,
            currentStep: isStory ? 1 : undefined, steps: isStory ? mSteps.length : 1
        };
        onQuestCreated([finalQuest]);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image(); img.src = reader.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height; const maxWidth = 800;
                    if (width > maxWidth) { height = (maxWidth / width) * height; width = maxWidth; }
                    canvas.width = width; canvas.height = height;
                    canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
                    setMCover(canvas.toDataURL('image/jpeg', 0.8)); playSound('success');
                };
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[140] bg-background flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden font-sans text-txt-main">

            {/* New Sticky Header */}
            <div className="flex items-center justify-between p-4 pt-safe bg-background/90 backdrop-blur-xl sticky top-0 z-40 border-b border-white/5">
                <button onClick={step === 1 ? onCancel : () => setStep(1)} className="p-2 -ml-2 text-txt-main hover:bg-white/10 rounded-full transition-all">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1 text-center">
                    <h2 className="text-xl font-extrabold text-txt-main leading-none">{editingQuest ? 'Edit Quest' : 'Create Quest'}</h2>
                </div>
                <div className="w-8"></div> {/* Placeholder for right-side elements */}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
                <div className="max-w-md mx-auto space-y-8 pb-32">

                    {mode === 'choice' && (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="text-center space-y-3 mb-10">
                                <div className="w-20 h-20 bg-gradient-to-tr from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-primary/30 animate-pulse">
                                    <Sparkles size={32} />
                                </div>
                                <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Quest</h1>
                                <p className="text-sm text-txt-dim font-medium">Choose how you want to build.</p>
                            </div>

                            <div className="grid gap-6">
                                <button
                                    onClick={() => { setMode('ai'); playSound('click'); }}
                                    className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 flex items-center gap-5 hover:border-primary transition-all group text-left hover:from-indigo-500/20 hover:to-purple-500/20 rounded-3xl"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Wand2 size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">AI Generator</h3>
                                        <p className="text-xs text-txt-dim font-medium leading-relaxed">Let AI draft a quest for you.</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setMode('manual'); playSound('click'); }}
                                    className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center gap-5 hover:border-emerald-400 transition-all group text-left hover:from-emerald-500/20 hover:to-teal-500/20 rounded-3xl"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <PenTool size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Custom Build</h3>
                                        <p className="text-xs text-txt-dim font-medium leading-relaxed">Manually set objectives.</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === 'ai' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1">Style</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {AI_QUEST_TYPES.map(type => {
                                        const isActive = aiType === type.id;
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => { setAiType(type.id); playSound('click'); }}
                                                className={`relative overflow-hidden flex flex-col items-start p-4 rounded-3xl transition-all duration-300 text-left border ${isActive ? `border-white/20 shadow-xl ${type.shadow}` : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                            >
                                                {isActive && (
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-90`}></div>
                                                )}

                                                <div className={`relative z-10 p-2 rounded-xl mb-3 ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-txt-dim'}`}>
                                                    <Icon size={18} />
                                                </div>
                                                <div className="relative z-10">
                                                    <span className={`text-sm font-bold mb-0.5 block ${isActive ? 'text-white' : 'text-txt-main'}`}>{type.label}</span>
                                                    <span className={`text-[10px] font-medium ${isActive ? 'text-white/80' : 'text-txt-dim'}`}>{type.desc}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1">Vision</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-3xl opacity-0 group-focus-within:opacity-20 transition-opacity blur-md"></div>
                                    <AutoResizeTextarea
                                        value={topic}
                                        onChange={(e: any) => setTopic(e.target.value)}
                                        placeholder="e.g. Find red objects in the park..."
                                        className="relative z-10 w-full bg-surface border border-white/10 rounded-3xl p-6 text-xl font-bold text-white placeholder:text-txt-dim/30 focus:border-primary/50 outline-none transition-all min-h-[100px] shadow-inner"
                                    />
                                </div>
                            </div>

                            {isGenerating ? (
                                <div className="py-10 flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary blur-xl opacity-30 animate-pulse"></div>
                                        <Loader className="relative z-10 animate-spin text-primary" size={48} strokeWidth={3} />
                                    </div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">{genPhase}</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerate}
                                    disabled={!topic.trim()}
                                    className="w-full py-5 bg-gradient-to-r from-primary to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 hover:brightness-110"
                                >
                                    Generate <Wand2 size={18} />
                                </button>
                            )}
                        </div>
                    )}

                    {mode === 'manual' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-left duration-500">
                            {step === 1 ? (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1">Cover</label>
                                        <div className="relative h-48 w-full rounded-[2rem] overflow-hidden bg-surface border border-white/10 group shadow-lg">
                                            {mCover ? (
                                                <OptimizedImage src={mCover} className="w-full h-full object-cover opacity-80" alt="Cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-txt-dim group-hover:text-white transition-colors">
                                                    <ImageIcon size={32} strokeWidth={1} />
                                                    <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">No Image</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer z-10"
                                            >
                                                <div className="bg-white/10 p-3 rounded-full mb-2 backdrop-blur-md border border-white/20">
                                                    <Camera size={24} className="text-white" />
                                                </div>
                                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Upload Photo</span>
                                            </button>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Title</label>
                                        <input
                                            type="text" value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="Quest Name"
                                            className="w-full bg-transparent border-b border-white/20 py-3 text-3xl font-extrabold text-white outline-none focus:border-primary transition-all placeholder:text-txt-dim/20"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1">Roles</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['Explorer', 'Competitor', 'Creator', 'Student'] as AppRole[]).map(role => (
                                                <button
                                                    key={role}
                                                    onClick={() => toggleRole(role)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${mRoles.includes(role)
                                                            ? 'bg-white text-black border-white shadow-glow'
                                                            : 'bg-transparent text-txt-dim border-white/10 hover:border-white/30 hover:bg-white/5'
                                                        }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            disabled={!mTitle.trim()}
                                            className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-3xl active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 hover:brightness-110"
                                        >
                                            Next <ArrowRight size={16} className="inline ml-2" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Difficulty</label>
                                            <div className="relative">
                                                <select
                                                    value={mDiff} onChange={(e) => setMDiff(e.target.value as any)}
                                                    className="w-full bg-transparent border-b border-white/20 py-2 text-sm font-bold text-white outline-none focus:border-primary appearance-none rounded-none"
                                                >
                                                    {Object.values(QuestDifficulty).map(d => <option key={d} value={d} className="bg-surface">{d}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Type</label>
                                            <div className="relative">
                                                <select
                                                    value={mType} onChange={(e) => { const newType = e.target.value as any; setMType(newType); if (newType === QuestType.STORY && mSteps.length === 0) setMSteps([{ title: 'Chapter 1', desc: '', target: '' }]); }}
                                                    className="w-full bg-transparent border-b border-white/20 py-2 text-sm font-bold text-white outline-none focus:border-primary appearance-none rounded-none"
                                                >
                                                    {Object.values(QuestType).map(t => <option key={t} value={t} className="bg-surface">{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Briefing</label>
                                        <AutoResizeTextarea
                                            value={mDesc} onChange={(e: any) => setMDesc(e.target.value)} placeholder="Describe the objective..."
                                            className="w-full bg-transparent border-b border-white/20 py-2 text-base text-white font-medium focus:border-primary outline-none transition-all min-h-[60px]"
                                        />
                                    </div>

                                    {mType === QuestType.STORY ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest">Storyline</label>
                                                <button onClick={addStep} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"><Plus size={12} /> Add Chapter</button>
                                            </div>
                                            <div className="space-y-6">
                                                {mSteps.map((s, idx) => (
                                                    <div key={idx} className="space-y-3 relative pl-4 border-l-2 border-white/10 hover:border-primary/50 transition-colors">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Chapter {idx + 1}</span>
                                                            {mSteps.length > 1 && (
                                                                <button onClick={() => removeStep(idx)} className="text-txt-dim hover:text-rose-500 transition-colors p-1">
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <input type="text" value={s.title} onChange={(e) => updateStep(idx, 'title', e.target.value)} placeholder="Title" className="w-full bg-transparent border-b border-white/10 py-1 text-sm font-bold text-white outline-none focus:border-primary" />
                                                        <input type="text" value={s.target} onChange={(e) => updateStep(idx, 'target', e.target.value)} placeholder="Target Object" className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-txt-sub font-medium outline-none focus:border-primary" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 group">
                                            <label className="text-[10px] font-black text-txt-dim uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Objective</label>
                                            <div className="relative">
                                                <Target size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-primary" />
                                                <input
                                                    type="text" value={mTarget} onChange={(e) => setMTarget(e.target.value)} placeholder="What to find?"
                                                    className="w-full bg-transparent border-b border-white/20 py-3 pl-6 text-base font-bold text-white outline-none focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-10">
                                        <button onClick={() => setStep(1)} className="flex-1 py-4 text-txt-dim hover:text-white font-bold text-xs uppercase rounded-2xl active:scale-95 transition-all bg-white/5 border border-white/10">Back</button>
                                        <button onClick={handleManualSubmit} className="flex-[2] py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-lg shadow-primary/20 active:scale-95 transition-all hover:brightness-110">
                                            {editingQuest ? 'Save' : 'Publish'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateQuest;