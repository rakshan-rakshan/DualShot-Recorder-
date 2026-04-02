import { createContext, useContext, useState, ReactNode } from 'react';

export type Resolution = '1080p' | '4k';
export type FPS = 24 | 30 | 60;
export type Format = 'mp4' | 'mov';

interface Settings {
  resolution: Resolution;
  fps: FPS;
  format: Format;
  isPremium: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  resolution: '1080p',
  fps: 30,
  format: 'mp4',
  isPremium: false,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
