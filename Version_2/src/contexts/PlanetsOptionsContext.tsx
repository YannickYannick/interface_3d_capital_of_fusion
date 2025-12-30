import { createContext, useContext, useState, ReactNode } from 'react';

interface PlanetsOptionsContextType {
  grayscaleEnabled: boolean;
  setGrayscaleEnabled: (enabled: boolean) => void;
  videoBlendEnabled: boolean;
  setVideoBlendEnabled: (enabled: boolean) => void;
  orbitsVisible: boolean;
  setOrbitsVisible: (visible: boolean) => void;
}

const PlanetsOptionsContext = createContext<PlanetsOptionsContextType | undefined>(undefined);

export function PlanetsOptionsProvider({ children }: { children: ReactNode }) {
  const [grayscaleEnabled, setGrayscaleEnabled] = useState(true);
  const [videoBlendEnabled, setVideoBlendEnabled] = useState(false);
  const [orbitsVisible, setOrbitsVisible] = useState(false);

  return (
    <PlanetsOptionsContext.Provider
      value={{
        grayscaleEnabled,
        setGrayscaleEnabled,
        videoBlendEnabled,
        setVideoBlendEnabled,
        orbitsVisible,
        setOrbitsVisible,
      }}
    >
      {children}
    </PlanetsOptionsContext.Provider>
  );
}

export function usePlanetsOptions() {
  const context = useContext(PlanetsOptionsContext);
  if (context === undefined) {
    throw new Error('usePlanetsOptions must be used within a PlanetsOptionsProvider');
  }
  return context;
}

