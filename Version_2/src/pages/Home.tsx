import Scene3D from '../components/Scene3D';
import VideoBackground from '../components/VideoBackground';
import Logo from '../components/Logo';

export default function Home() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Background video sur la moitié droite de l'écran */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        width: '50%', 
        height: '100vh', 
        overflow: 'hidden',
        zIndex: -2
      }}>
        <VideoBackground src="/background-video.mp4" />
      </div>
      
      {/* Planètes - toujours au-dessus */}
      <div style={{ position: 'relative', zIndex: 100, isolation: 'isolate' }}>
        <Scene3D />
      </div>
      <Logo />
      <div className="fixed right-4 bottom-4 px-3 py-2.5 bg-white/6 border border-white/12 rounded-lg text-xs text-[#dcdcdc] z-30 backdrop-blur-sm">
        Clique sur une bulle pour zoomer · Double-clic pour reset
      </div>
    </div>
  );
}

