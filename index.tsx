
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Loader } from 'lucide-react';

/**
 * Convex Initialization
 * 
 * The VITE_CONVEX_URL environment variable must be set in .env.local
 * Run `npx convex dev` to get your deployment URL
 */
const convexUrl = import.meta.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!convexUrl || convexUrl === 'undefined') {
  console.warn(
    '[Convex] No VITE_CONVEX_URL found. Running in offline mode.',
    'To connect to Convex, run: npx convex dev'
  );
}

const convex = new ConvexReactClient(
  convexUrl || "https://placeholder-offline.convex.cloud"
);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Missing Publishable Key: VITE_CLERK_PUBLISHABLE_KEY");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || "pk_test_placeholder"}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#020617]">
            <Loader className="animate-spin text-[#818cf8]" size={32} />
          </div>
        }>
          <App />
        </Suspense>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </React.StrictMode>
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW failed', err));
  });
}
