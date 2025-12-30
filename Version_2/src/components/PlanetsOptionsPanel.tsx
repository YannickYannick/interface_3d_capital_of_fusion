import { useLocation } from 'react-router-dom';
import { usePlanetsOptions } from '../contexts/PlanetsOptionsContext';

export default function PlanetsOptionsPanel() {
  const location = useLocation();
  const isPlanetsPage = location.pathname === '/planets' || location.pathname === '/planets1';
  const { grayscaleEnabled, setGrayscaleEnabled, videoBlendEnabled, setVideoBlendEnabled, orbitsVisible, setOrbitsVisible } = usePlanetsOptions();

  if (!isPlanetsPage) return null;

  const ToggleButton = ({ 
    label, 
    enabled, 
    onToggle 
  }: { 
    label: string; 
    enabled: boolean; 
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm border ${
        enabled
          ? 'bg-white/20 border-white/40 text-white'
          : 'bg-white/6 border-white/12 text-white/70 hover:bg-white/10'
      }`}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-2">
      <div className="px-4 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg">
        <div className="text-xs text-white/70 mb-2">Options</div>
        <div className="flex flex-col gap-2">
          <ToggleButton
            label={grayscaleEnabled ? '✓ Noir & Blanc' : 'Noir & Blanc'}
            enabled={grayscaleEnabled}
            onToggle={() => setGrayscaleEnabled(!grayscaleEnabled)}
          />
          <ToggleButton
            label={videoBlendEnabled ? '✓ Mélange Vidéos' : 'Mélange Vidéos'}
            enabled={videoBlendEnabled}
            onToggle={() => setVideoBlendEnabled(!videoBlendEnabled)}
          />
          <ToggleButton
            label={orbitsVisible ? '✓ Trajectoires' : 'Trajectoires'}
            enabled={orbitsVisible}
            onToggle={() => setOrbitsVisible(!orbitsVisible)}
          />
        </div>
      </div>
    </div>
  );
}

