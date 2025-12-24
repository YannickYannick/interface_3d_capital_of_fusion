import Scene3D from '../components/Scene3D';
import HeroText from '../components/HeroText';

export default function Home() {
  return (
    <>
      <Scene3D />
      <HeroText text="CApital" />
      <div className="fixed right-4 bottom-4 px-3 py-2.5 bg-white/6 border border-white/12 rounded-lg text-xs text-[#dcdcdc] z-30 backdrop-blur-sm">
        Clique sur une bulle pour zoomer · Double-clic pour reset
      </div>
    </>
  );
}

