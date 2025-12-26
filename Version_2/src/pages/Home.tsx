import Scene3D from '../components/Scene3D';
import VideoBackground from '../components/VideoBackground';
import Logo from '../components/Logo';
import { useYouTubeVisibility } from '../contexts/YouTubeVisibilityContext';

export default function Home() {
  const { isYouTubeVisible } = useYouTubeVisibility();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Background video en plein écran - caché quand YouTube est visible */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%', 
        height: '100vh', 
        overflow: 'hidden',
        zIndex: -2,
        visibility: isYouTubeVisible ? 'hidden' : 'visible'
      }}>
        <VideoBackground src="/background-video.mp4" />
      </div>
      
      {/* Planètes - toujours au-dessus dans un contexte séparé */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'auto' }}>
        <Scene3D />
      </div>
      <Logo />
      <div className="fixed right-4 bottom-4 px-3 py-2.5 bg-white/6 border border-white/12 rounded-lg text-xs text-[#dcdcdc] z-30 backdrop-blur-sm">
        Clique sur une bulle pour zoomer · Double-clic pour reset
      </div>
    </div>
  );
}

