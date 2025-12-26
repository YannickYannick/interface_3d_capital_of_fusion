import { useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  src: string;
  className?: string;
}

export default function VideoBackground({ src, className = '' }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      console.log('Video element:', video);
      console.log('Video src:', video.src);
      // S'assurer que la vidéo démarre en boucle
      video.play().catch((error) => {
        console.warn('Erreur lors de la lecture de la vidéo:', error);
      });
      
      video.addEventListener('loadeddata', () => {
        console.log('Video loaded');
      });
      
      video.addEventListener('error', (e) => {
        console.error('Video error:', e);
      });
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className={`w-full h-full object-cover ${className}`}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        pointerEvents: 'none'
      }}
    />
  );
}

