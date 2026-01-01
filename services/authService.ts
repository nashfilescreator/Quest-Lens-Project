
import { INITIAL_STATS } from '../constants';
import { UserStats } from '../types';

/**
 * Enhanced Local Storage Auth targeting Convex persistence.
 */

const STORAGE_KEY = 'questlens_user_profile';

export const registerUser = async (email: string, pass: string, username: string) => {
  // We generate a local ID that will map to a Convex record
  const uid = `ql-${Math.random().toString(36).substr(2, 12)}`;
  localStorage.setItem('questlens_local_uid', uid);
  
  const newUser = { uid, email, displayName: username };
  const initialData: UserStats = {
    ...INITIAL_STATS,
    username: username,
    avatarSeed: username || 'Explorer',
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  localStorage.setItem('questlens_authenticated', 'true');
  
  // Note: App.tsx or useGameLogic handles the actual Convex .create mutation
  return newUser;
};

export const loginUser = async (email: string, pass: string) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) throw new Error("No profile found.");
  localStorage.setItem('questlens_authenticated', 'true');
  const profile = JSON.parse(saved);
  const uid = localStorage.getItem('questlens_local_uid') || 'anonymous';
  return { uid, email, displayName: profile.username };
};

export const logoutUser = async () => {
  localStorage.removeItem('questlens_authenticated');
};

export const resetPassword = async (email: string) => {
  console.log(`Reset link simulated for ${email}`);
};
