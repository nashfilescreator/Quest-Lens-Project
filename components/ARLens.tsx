
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';
import { Quest, ActiveBuff } from '../types';
import { playSound } from '../services/audioService';

interface ARLensProps {
  onClose: () => void;
  quests: Quest[];
  onQuestSelect: (quest: Quest) => void;
  activeBuffs?: ActiveBuff[];
}

type ARQuest = Quest & {
    bearing: number;
    distance: number;
};

const ARLens: React.FC<ARLensProps> = ({ onClose, quests, onQuestSelect, activeBuffs = [] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const compassContainerRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  const headingRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  const hasRadarBoost = activeBuffs.some(b => b.type === 'radar_boost');

  // --- Geospatial Math ---
  const toRad = (deg: number) => deg * Math.PI / 180;
  const toDeg = (rad: number) => rad * 180 / Math.PI;

  const calculateBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
    const startLatRad = toRad(startLat);
    const startLngRad = toRad(startLng);
    const destLatRad = toRad(destLat);
    const destLngRad = toRad(destLng);

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
              Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
    const brng = Math.atan2(y, x);
    return (toDeg(brng) + 360) % 360;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // --- Location Tracking ---
  useEffect(() => {
      const watchId = navigator.geolocation.watchPosition(
          (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => setError("GPS signal lost. AR requires location."),
          { enableHighAccuracy: true, maximumAge: 1000 }
      );
      
      // Check if iOS DeviceOrientation requires permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          setNeedsPermission(true);
      }

      return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const requestOrientationPermission = () => {
      const doe = (DeviceOrientationEvent as any);
      if (typeof doe.requestPermission === 'function') {
          doe.requestPermission()
              .then((response: string) => {
                  if (response === 'granted') {
                      setNeedsPermission(false);
                      playSound('success');
                  } else {
                      setError("Sensor access denied.");
                  }
              })
              .catch(console.error);
      } else {
          setNeedsPermission(false);
      }
  };

  // --- Calculate Real World Positions ---
  const nearbyQuests = useMemo<ARQuest[]>(() => {
    if (!userLoc) return [];
    
    // Filter quests within range (e.g., 1km, or 2km with boost)
    const rangeLimit = hasRadarBoost ? 2000 : 1000;

    return quests
      .map(q => {
          if (!q.location) return null;
          const dist = calculateDistance(userLoc.lat, userLoc.lng, q.location.lat, q.location.lng);
          const bearing = calculateBearing(userLoc.lat, userLoc.lng, q.location.lat, q.location.lng);
          return { ...q, distance: dist, bearing };
      })
      .filter((q): q is ARQuest => q !== null && q.distance < rangeLimit)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 15); // Max visible items
  }, [quests, userLoc, hasRadarBoost]);

  // --- Camera & Orientation Loop ---
  useEffect(() => {
    let mounted = true;
    
    const startCamera = async () => {
      try {
        if (streamRef.current && streamRef.current.active) return;
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
        }
      } catch (err) { setError("Camera access denied."); }
    };
    startCamera();

    const updateFrame = () => {
      if (!mounted) return;
      
      // Use stored heading
      const currentHeading = headingRef.current;

      // Update Compass Bar
      if (compassContainerRef.current) {
          const pxPerDeg = 3; 
          compassContainerRef.current.style.transform = `translateX(calc(50% - ${currentHeading * pxPerDeg}px))`;
      }

      // Update Markers
      nearbyQuests.forEach(q => {
          const el = markerRefs.current.get(q.id);
          if (el) {
              // Calculate relative angle
              let diff = q.bearing - currentHeading;
              while (diff < -180) diff += 360;
              while (diff > 180) diff -= 360;

              // Field of View (FOV) approx 60 degrees for phone camera
              if (Math.abs(diff) < 35) {
                  const leftPercent = 50 + (diff / 35) * 50;
                  const scale = Math.max(0.6, 1 - (q.distance / 1000));
                  
                  el.style.display = 'flex';
                  el.style.left = `${leftPercent}%`;
                  el.style.transform = `scale(${scale}) translateX(-50%)`;
                  el.style.zIndex = Math.floor((1000 - q.distance)).toString();
                  el.style.opacity = '1';
              } else {
                  el.style.display = 'none';
              }
          }
      });

      rafIdRef.current = requestAnimationFrame(updateFrame);
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
       if (e.alpha !== null) {
           let newHeading = (e as any).webkitCompassHeading || (360 - e.alpha);
           if (!newHeading) newHeading = e.alpha;

           const delta = newHeading - headingRef.current;
           if (Math.abs(delta) > 180) {
               headingRef.current = newHeading;
           } else {
               headingRef.current = headingRef.current + (delta * 0.15); // Smooth lerp
           }
       }
    };

    if (!needsPermission) {
        window.addEventListener('deviceorientation', handleOrientation);
    }
    
    rafIdRef.current = requestAnimationFrame(updateFrame);

    return () => {
      mounted = false;
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [nearbyQuests, needsPermission]);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden font-sans text-white">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />

      {/* Error State */}
      {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
              <div className="text-center p-6 bg-white rounded-3xl text-slate-900">
                  <Navigation size={48} className="text-rose-500 mx-auto mb-4" />
                  <p className="font-bold mb-4">{error}</p>
                  <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-xs">Close</button>
              </div>
          </div>
      )}

      {/* iOS Permission Overlay */}
      {needsPermission && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 animate-in fade-in">
              <div className="text-center p-8 max-w-sm bg-white rounded-3xl text-slate-900">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Compass size={40} className="text-indigo-500" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Sensor Calibration</h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">Access to your device compass is required for AR navigation.</p>
                  <button 
                    onClick={requestOrientationPermission}
                    className="w-full py-4 bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
                  >
                    Enable AR
                  </button>
                  <button onClick={onClose} className="mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-900">
                    Cancel
                  </button>
              </div>
          </div>
      )}

      {/* AR View */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent"></div>
         
         {/* Minimal Compass Strip */}
         <div className="absolute top-8 left-0 right-0 h-8 overflow-hidden flex justify-center opacity-90 mask-image-linear-gradient">
            <div 
                ref={compassContainerRef}
                className="flex gap-0 text-white font-bold text-xs will-change-transform items-center"
                style={{ width: 'max-content' }}
            >
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex shrink-0"> 
                        <span className="w-[270px] flex justify-center">N</span>
                        <span className="w-[270px] flex justify-center">E</span>
                        <span className="w-[270px] flex justify-center">S</span>
                        <span className="w-[270px] flex justify-center">W</span>
                    </div>
                ))}
            </div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-white rounded-full left-1/2 -translate-x-1/2 z-10 shadow-lg"></div>
         </div>
      </div>

      {/* AR Markers Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {nearbyQuests.map((q) => (
            <button
                key={q.id}
                ref={(el) => { if (el) markerRefs.current.set(q.id, el); else markerRefs.current.delete(q.id); }}
                onClick={() => { playSound('click'); onQuestSelect(q); }}
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group z-20 will-change-transform pointer-events-auto transition-opacity duration-200"
                style={{ display: 'none' }}
            >
                <div className="relative transform transition-transform group-hover:scale-110">
                    {/* Glass Marker */}
                    <div className={`w-14 h-14 bg-white/10 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center shadow-lg ${q.type === 'STORY' ? 'text-amber-300' : 'text-white'}`}>
                        <MapPin size={24} fill="currentColor" />
                    </div>
                    {/* Distance Pill */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black whitespace-nowrap shadow-sm">
                        {Math.round(q.distance)}m
                    </div>
                </div>
                
                {/* Info Card (Hover/Focus) */}
                <div className="mt-4 bg-white/90 backdrop-blur-xl p-3 rounded-2xl w-32 text-center opacity-0 group-hover:opacity-100 transition-all shadow-xl translate-y-2 group-hover:translate-y-0">
                    <p className="text-[10px] font-bold text-slate-900 leading-tight mb-1 truncate">{q.title}</p>
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider">{q.xpReward} XP</span>
                </div>
            </button>
         ))}
      </div>

      {/* Controls */}
      <div className="absolute top-6 right-6 z-30 pointer-events-auto">
         <button onClick={onClose} className="p-3 bg-white/20 text-white rounded-full shadow-lg active:scale-90 transition-transform backdrop-blur-md border border-white/20"><X size={24} /></button>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center z-30 pointer-events-none">
         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 flex items-center gap-4 shadow-xl">
             <div className="flex flex-col items-center">
                 <span className="text-[8px] text-white/70 font-black uppercase tracking-widest">Scanner</span>
                 <span className="font-bold text-white text-xs">ACTIVE</span>
             </div>
             <div className="w-px h-6 bg-white/20"></div>
             <div className="flex flex-col items-center">
                 <span className="text-[8px] text-white/70 font-bold uppercase tracking-widest">Items</span>
                 <span className="font-bold text-white text-xs">{nearbyQuests.length}</span>
             </div>
         </div>
      </div>
    </div>
  );
};

export default ARLens;
