
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Loader } from 'lucide-react';

/**
 * Convex Initialization
 * 
 * To resolve "[CONVEX FATAL ERROR] Couldn't parse deployment name", the client URL
 * must follow the cloud deployment pattern: https://<deployment-name>.convex.cloud
 * 'missing-url' is rejected by the internal parser; using a standard alphanumeric-hyphenated dummy.
 */
const rawUrl = process.env.CONVEX_URL;
const isValidUrl = rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'));
const convexUrl = isValidUrl ? rawUrl : "https://dummy-deployment-999.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#020617]">
          <Loader className="animate-spin text-[#818cf8]" size={32} />
        </div>
      }>
        <App />
      </Suspense>
    </ConvexProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW failed', err));
  });
}
