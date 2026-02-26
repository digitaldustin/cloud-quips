import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeId =
  | "dark"
  | "light"
  | "retro"
  | "pipboy"
  | "hellokitty"
  | "transformer"
  | "vaporwave";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "dark",        name: "Dark",         emoji: "🌑", description: "Default dark mode" },
  { id: "light",       name: "Light",        emoji: "☀️",  description: "Clean & bright" },
  { id: "retro",       name: "Retro Arcade", emoji: "🕹️",  description: "Neon 80s vibes" },
  { id: "pipboy",      name: "Pip-Boy",      emoji: "☢️",  description: "Vault-Tec approved" },
  { id: "hellokitty",  name: "Hello Kitty",  emoji: "🎀", description: "Kawaii overload" },
  { id: "transformer", name: "Transformer",  emoji: "🤖", description: "Cybertron steel" },
  { id: "vaporwave",   name: "Vaporwave",    emoji: "🌴", description: "A E S T H E T I C" },
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  themeMeta: ThemeMeta;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "quipslop-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEMES.find((t) => t.id === stored)) return stored as ThemeId;
    return "dark";
  });

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  // Apply theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`));
    // Add current theme class
    root.classList.add(`theme-${theme}`);

    // Also manage the "dark" class for Tailwind dark mode
    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [theme]);

  const themeMeta = THEMES.find((t) => t.id === theme)!;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeMeta }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
