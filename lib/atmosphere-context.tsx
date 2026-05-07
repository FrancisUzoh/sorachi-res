
import React, { createContext, useContext, useState, useEffect } from 'react';

type Atmosphere = 'zen' | 'dusk';

interface AtmosphereContextType {
  mood: Atmosphere;
  toggleMood: () => void;
}

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(undefined);

export const AtmosphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mood, setMood] = useState<Atmosphere>('zen');

  const toggleMood = () => {
    setMood(prev => (prev === 'zen' ? 'dusk' : 'zen'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-mood', mood);
  }, [mood]);

  return (
    <AtmosphereContext.Provider value={{ mood, toggleMood }}>
      {children}
    </AtmosphereContext.Provider>
  );
};

export const useAtmosphere = () => {
  const context = useContext(AtmosphereContext);
  if (!context) throw new Error('useAtmosphere must be used within AtmosphereProvider');
  return context;
};
