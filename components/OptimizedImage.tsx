
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  placeholder?: string;
  priority?: 'high' | 'low' | 'auto';
  srcSet?: string;
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  imgClassName = "object-cover",
  placeholder,
  priority = 'auto',
  srcSet,
  sizes
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(priority === 'high');

  const safeSrc = useMemo(() => {
    if (!src) return '';
    try {
      if (src.startsWith('data:')) return src;
      return src;
    } catch (e) { return src; }
  }, [src]);

  useEffect(() => {
    if (!safeSrc) {
      setError(true);
    } else {
      setIsLoaded(false);
      setError(false);
    }
  }, [safeSrc]);

  useEffect(() => {
    if (isVisible) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, { rootMargin: '300px' });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  // Generate a deterministic gradient based on the alt text or src to ensure consistent fallbacks
  const fallbackGradient = useMemo(() => {
    const seed = alt || src || 'default';
    const hash = seed.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const gradients = [
      'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950',
      'bg-gradient-to-br from-slate-900 via-slate-800 to-black',
      'bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950',
      'bg-gradient-to-br from-blue-950 via-cyan-900 to-slate-950',
      'bg-gradient-to-br from-rose-950 via-pink-900 to-slate-950',
      'bg-gradient-to-br from-amber-950 via-orange-900 to-slate-950',
      'bg-gradient-to-br from-violet-950 via-fuchsia-900 to-slate-950'
    ];
    return gradients[Math.abs(hash) % gradients.length];
  }, [alt, src]);

  // srcSet is now a direct pass-through since we use static images
  const generatedSrcSet = srcSet;

  const defaultSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  // Additional check: some services return 200 OK but with a rate limit image or text.
  // We can't catch 200 OK image content easily without fetch, but standard onLoad/onError handles most network issues.

  return (
    <div
      className={`relative overflow-hidden bg-surface ${className}`}
      ref={imgRef}
      style={{ contain: 'paint layout' }}
    >
      {/* Loading Animation */}
      {!isLoaded && !error && isVisible && (
        <div className="absolute inset-0 bg-white/5 z-10 animate-[pulse_1.5s_infinite]" style={{ backdropFilter: 'blur(5px)' }}></div>
      )}

      {/* Abstract Fallback Background */}
      {(error || !safeSrc) && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-0 ${fallbackGradient}`}>
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}></div>

          {/* Abstract Glowing Orbs */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-black/40"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"></div>

          {/* Minimal Icon to indicate it's a placeholder */}
          <Sparkles className="text-white/10 relative z-10 scale-150" size={32} />
        </div>
      )}

      {/* Actual Image */}
      {isVisible && !error && safeSrc && (
        <img
          key={safeSrc}
          src={safeSrc}
          srcSet={generatedSrcSet}
          sizes={sizes || defaultSizes}
          alt={alt}
          className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          onLoad={(e) => {
            // Some providers return a placeholder image with "rate limit" text on success.
            // This is hard to detect, but we assume if it loads it's better than nothing,
            // unless we specifically want to black-hole known error image dimensions.
            setIsLoaded(true);
          }}
          onError={() => setError(true)}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          {...({ fetchpriority: priority } as any)}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
