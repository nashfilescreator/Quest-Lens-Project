
import { INITIAL_STATS } from '../constants';
import { UserStats } from '../types';

/**
 * Authentication Service
 * 
 * This service handles user authentication with local UID generation.
 * The generated UID maps to a Convex user record.
 * 
 * For production, this can be replaced with:
 * - Convex Auth (built-in)
 * - Clerk integration
 * - Auth0 integration
 * - Firebase Auth
 */

const STORAGE_KEYS = {
  UID: 'questlens_local_uid',
  AUTH: 'questlens_authenticated',
  PROFILE: 'questlens_user_profile',
  SESSION: 'questlens_session',
  LAST_LOGIN: 'questlens_last_login',
};

// Generate a unique user ID
const generateUid = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 8);
  return `ql-${timestamp}-${random}`;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
};

// Get current user UID
export const getCurrentUid = (): string | null => {
  if (!isAuthenticated()) return null;
  return localStorage.getItem(STORAGE_KEYS.UID);
};

// Get current session info
export const getSession = (): { uid: string; email: string; createdAt: number } | null => {
  const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!sessionData) return null;
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
};

// Register a new user
export const registerUser = async (email: string, password: string, username: string) => {
  // Validate inputs
  if (!email || !password || !username) {
    throw new Error('Email, password, and username are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  if (username.length < 2) {
    throw new Error('Username must be at least 2 characters');
  }

  // Generate unique user ID
  const uid = generateUid();

  // Create session
  const session = {
    uid,
    email: email.toLowerCase(),
    createdAt: Date.now(),
  };

  // Create initial user data for Convex
  const initialData: UserStats = {
    ...INITIAL_STATS,
    username: username.trim(),
    avatarSeed: username.trim() || 'Explorer',
  };

  // Store session and auth state
  localStorage.setItem(STORAGE_KEYS.UID, uid);
  localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(initialData));
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, Date.now().toString());

  // Note: The actual Convex user creation is handled by App.tsx via users.create mutation
  // This ensures the user is synced to the cloud database

  return {
    uid,
    email: email.toLowerCase(),
    displayName: username.trim(),
    isNewUser: true
  };
};

// Login an existing user
export const loginUser = async (email: string, password: string) => {
  // For local auth, we check if a profile exists
  const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
  const existingUid = localStorage.getItem(STORAGE_KEYS.UID);

  if (!savedProfile || !existingUid) {
    throw new Error('No account found. Please register first.');
  }

  // In production with real auth, this would validate credentials
  // For now, we just restore the session

  const profile = JSON.parse(savedProfile);

  // Update session
  const session = {
    uid: existingUid,
    email: email.toLowerCase(),
    createdAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, Date.now().toString());

  return {
    uid: existingUid,
    email: email.toLowerCase(),
    displayName: profile.username,
    isNewUser: false
  };
};

// Logout the current user
export const logoutUser = async () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  // Note: We keep UID and PROFILE so user can log back in
};

// Full account deletion
export const deleteAccount = async () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  // Note: In production, also call Convex mutation to delete user data
};

// Reset password (mock for local auth)
export const resetPassword = async (email: string) => {
  console.log(`[Auth] Password reset requested for: ${email}`);
  // In production, this would:
  // 1. Send email via Convex action
  // 2. Generate reset token
  // 3. Handle password update
  return { success: true, message: 'If an account exists, a reset link has been sent.' };
};

// Update password (for logged-in users)
export const updatePassword = async (currentPassword: string, newPassword: string) => {
  if (!isAuthenticated()) {
    throw new Error('Must be logged in to change password');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters');
  }

  // In production, validate current password and update
  console.log('[Auth] Password updated');
  return { success: true };
};

// Refresh session (extend session timeout)
export const refreshSession = () => {
  if (!isAuthenticated()) return false;

  localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, Date.now().toString());
  return true;
};

// Check if session is expired (30 days)
export const isSessionExpired = (): boolean => {
  const lastLogin = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN);
  if (!lastLogin) return true;

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - parseInt(lastLogin) > thirtyDays;
};

