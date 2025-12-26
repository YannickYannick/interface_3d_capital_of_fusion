import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface YouTubeBackgroundProps {
  videoId: string;
  className?: string;
}

export default function YouTubeBackground({ videoId, className = '' }: YouTubeBackgroundProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [videoOpacity, setVideoOpacity] = useState(0); // Opacité de la vidéo
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();
  const isPlanetsPage = location.pathname === '/planets';

  const videoUrl = `https://www.youtube.com/embed/${videoId}?si=0hJOpQv2p215JRzm&autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0`;

  // Animation de fade in/out sur la page planets
  useEffect(() => {
    if (!isPlanetsPage) {
      // Sur les autres pages, la vidéo est toujours visible
      setVideoOpacity(1);
      return;
    }

    // Sur la page planets, créer un cycle de fade in/out
    let intervalId: number;
    let timeoutId: number;

    const cycleVideo = () => {
      // Fade in (apparition) - visible pendant 3 secondes
      setVideoOpacity(1);
      
      // Après 3 secondes, fade out (disparition)
      timeoutId = window.setTimeout(() => {
        setVideoOpacity(0);
      }, 3000);
    };

    // Commencer avec la vidéo visible, puis démarrer le cycle
    setVideoOpacity(1);
    
    // Démarrer le premier cycle après 3 secondes
    timeoutId = window.setTimeout(() => {
      setVideoOpacity(0);
      // Répéter le cycle toutes les 8 secondes (3s visible + 5s cachée)
      intervalId = window.setInterval(cycleVideo, 8000);
    }, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPlanetsPage]);

  // Icônes SVG simples pour le volume
  const VolumeXIcon = () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M17 10l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );

  const Volume2Icon = () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );

  return (
    <>
      {/* Video Background - toujours présent avec animation d'opacité */}
      {/* z-index: 0 pour être au-dessus du body mais sous les planètes (z-index: 100) */}
      <div 
        className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`} 
        style={{ 
          zIndex: 0,
          opacity: videoOpacity,
          transition: 'opacity 1s ease-in-out'
        }}
      >
        <iframe
          key={isMuted ? 'muted' : 'unmuted'}
          ref={iframeRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full h-[56.25vw] min-h-full"
          src={videoUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ pointerEvents: 'none' }}
        />
      </div>

      {/* Sound toggle button - toujours visible */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-8 right-8 z-50 p-3 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-black/70 transition-colors text-white"
        aria-label={isMuted ? "Activer le son" : "Couper le son"}
      >
        {isMuted ? <VolumeXIcon /> : <Volume2Icon />}
      </button>
    </>
  );
}

