
import { create } from 'zustand';
import { Quest, ViewState, StoryStep, ValidationResult, DiscoveryResult, Notification, Friend } from '../types';
import { playSound } from '../services/audioService';

type ModalType = 'levelUp' | 'notifications' | 'inventory' | 'crafting' | 'scanner' | 'lensMenu' | 'dailyBonus' | 'skills' | 'agentProfile' | 'chat';

// Helper to determine the starting view based on local storage flags
const getInitialView = (): ViewState => {
  const isOnboarded = localStorage.getItem('questLens_onboarded') === 'true';
  const isAuthenticated = localStorage.getItem('questlens_authenticated') === 'true';

  if (isAuthenticated) return 'feed';
  if (isOnboarded) return 'auth';
  return 'onboarding';
};

interface UIState {
  view: ViewState;
  returnView: ViewState;
  activeQuest: Quest | null;
  activeStoryStep: StoryStep | null;
  completionData: any | null;
  discoveryContext: { image: string, title: string } | null;
  editingQuest: Quest | null;
  scannerMode: 'quest' | 'free';

  // Modal states
  activeModals: Set<ModalType>;
  
  // Contextual data for modals
  inspectedAgent: any | null;
  activeChat: Friend | null;
  activeToast: Notification | null;
  
  isCameraOpen: boolean;
  isTeamContribution: boolean;

  // Actions
  changeView: (newView: ViewState, setReturn?: boolean) => void;
  goBack: () => void;
  openModal: (type: ModalType, context?: any) => void;
  closeModal: (type: ModalType) => void;
  
  setActiveQuest: (quest: Quest | null) => void;
  setActiveStoryStep: (step: StoryStep | null) => void;
  setCompletionData: (data: any | null) => void;
  setDiscoveryContext: (context: { image: string, title: string } | null) => void;
  setEditingQuest: (quest: Quest | null) => void;
  setScannerMode: (mode: 'quest' | 'free') => void;
  
  openCamera: (isTeam?: boolean) => void;
  closeCamera: () => void;
  setIsCameraOpen: (isOpen: boolean) => void;
  setIsTeamContribution: (isTeam: boolean) => void;

  setToast: (toast: Notification | null) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  view: getInitialView(),
  returnView: 'feed',
  activeQuest: null,
  activeStoryStep: null,
  completionData: null,
  discoveryContext: null,
  editingQuest: null,
  scannerMode: 'quest',
  activeModals: new Set<ModalType>(),
  inspectedAgent: null,
  activeChat: null,
  activeToast: null,
  isCameraOpen: false,
  isTeamContribution: false,

  // --- ACTIONS ---
  changeView: (newView, setReturn = false) => {
    playSound('click');
    set(state => {
      const newModals = new Set<ModalType>(state.activeModals);
      newModals.delete('lensMenu');
      newModals.delete('scanner');
      return {
        ...state,
        view: newView,
        returnView: setReturn ? state.view : state.returnView,
        activeModals: newModals,
      };
    });
  },
  
  goBack: () => {
    const { returnView } = get();
    set({ view: returnView });
  },

  openModal: (type, context) => {
    set(state => {
      const newModals = new Set<ModalType>(state.activeModals);
      newModals.add(type);
      const updates: Partial<UIState> = { activeModals: newModals };
      if (type === 'agentProfile' && context) updates.inspectedAgent = context;
      if (type === 'chat' && context) updates.activeChat = context;
      return updates;
    });
  },
  
  closeModal: (type) => {
    set(state => {
      const newModals = new Set<ModalType>(state.activeModals);
      newModals.delete(type);
      const updates: Partial<UIState> = { activeModals: newModals };
      if (type === 'agentProfile') updates.inspectedAgent = null;
      if (type === 'chat') updates.activeChat = null;
      return updates;
    });
  },

  setActiveQuest: (quest) => set({ activeQuest: quest }),
  setActiveStoryStep: (step) => set({ activeStoryStep: step }),
  setCompletionData: (data) => set({ completionData: data }),
  setDiscoveryContext: (context) => set({ discoveryContext: context }),
  setEditingQuest: (quest) => set({ editingQuest: quest }),
  setScannerMode: (mode) => set({ scannerMode: mode }),

  openCamera: (isTeam = false) => {
    set({ isCameraOpen: true, activeStoryStep: null, scannerMode: 'quest', isTeamContribution: isTeam });
  },
  closeCamera: () => set({ isCameraOpen: false }),
  setIsCameraOpen: (isOpen) => set({ isCameraOpen: isOpen }),
  setIsTeamContribution: (isTeam) => set({ isTeamContribution: isTeam }),

  setToast: (toast) => {
    set({ activeToast: toast });
    if(toast) setTimeout(() => set({ activeToast: null }), 3000);
  }
}));
