import { createContext, useContext, useState, ReactNode } from 'react';

interface YouTubeVisibilityContextType {
  isYouTubeVisible: boolean;
  setIsYouTubeVisible: (visible: boolean) => void;
}

const YouTubeVisibilityContext = createContext<YouTubeVisibilityContextType | undefined>(undefined);

export function YouTubeVisibilityProvider({ children }: { children: ReactNode }) {
  const [isYouTubeVisible, setIsYouTubeVisible] = useState(true);

  return (
    <YouTubeVisibilityContext.Provider value={{ isYouTubeVisible, setIsYouTubeVisible }}>
      {children}
    </YouTubeVisibilityContext.Provider>
  );
}

export function useYouTubeVisibility() {
  const context = useContext(YouTubeVisibilityContext);
  if (context === undefined) {
    throw new Error('useYouTubeVisibility must be used within a YouTubeVisibilityProvider');
  }
  return context;
}

