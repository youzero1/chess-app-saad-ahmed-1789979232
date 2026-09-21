import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

type ThemeId = 'gold' | 'green' | 'wood' | 'blue' | 'dark';

interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    page: string;
    text: string;
    muted: string;
    panel: string;
    panelText: string;
    frame: string;
    frameRing: string;
    lightSquare: string;
    darkSquare: string;
    accent: string;
    accentHover: string;
    accentText: string;
    dialog: string;
    dialogText: string;
    label: string;
    move: string;
    selected: string;
    lastMove: string;
  };
}

const THEMES: ThemeOption[] = [
  {
    id: 'gold',
    name: 'Golden Yellow',
    description: 'Warm gold & cream',
    colors: {
      page: '#fdf6e0', text: '#4a370a', muted: '#8a6b16', panel: '#5c440d', panelText: '#fdf6e0',
      frame: '#7a5b12', frameRing: '#5c440d', lightSquare: '#f7edc8', darkSquare: '#c9a227',
      accent: '#e8c547', accentHover: '#f2d770', accentText: '#4a370a', dialog: '#fbf3d9', dialogText: '#4a370a',
      label: '#fbeec2', move: '#42310a', selected: '#e8c547', lastMove: '#ffe066',
    },
  },
  {
    id: 'green',
    name: 'Tournament',
    description: 'Fresh green & cream',
    colors: {
      page: '#e7eedb', text: '#1e3520', muted: '#5b7a4f', panel: '#1e3520', panelText: '#eef5e4',
      frame: '#2f4f30', frameRing: '#1e3520', lightSquare: '#eeeed2', darkSquare: '#769656',
      accent: '#baca44', accentHover: '#cdd96a', accentText: '#1e3520', dialog: '#eef3e2', dialogText: '#1e3520',
      label: '#e6efd8', move: '#1b3a1b', selected: '#baca44', lastMove: '#f7f769',
    },
  },
  {
    id: 'wood',
    name: 'Classic Wood',
    description: 'Warm walnut & maple',
    colors: {
      page: '#f1e4d2', text: '#3f2818', muted: '#836044', panel: '#4b2f20', panelText: '#fff8ed',
      frame: '#6f462a', frameRing: '#3d2517', lightSquare: '#f0d9b5', darkSquare: '#b58863',
      accent: '#d6a85f', accentHover: '#e4bd7d', accentText: '#382315', dialog: '#fff6e8', dialogText: '#3f2818',
      label: '#f8e9d2', move: '#432818', selected: '#e4b84f', lastMove: '#f3d65c',
    },
  },
  {
    id: 'blue',
    name: 'Ocean',
    description: 'Crisp blue & ivory',
    colors: {
      page: '#e7f0f7', text: '#17344d', muted: '#54758f', panel: '#173b57', panelText: '#eef8ff',
      frame: '#285979', frameRing: '#16384f', lightSquare: '#e8edf2', darkSquare: '#5b8eae',
      accent: '#63c5da', accentHover: '#86d6e5', accentText: '#143348', dialog: '#f1f8fc', dialogText: '#17344d',
      label: '#e9f6ff', move: '#102f45', selected: '#54bfd6', lastMove: '#f0d35d',
    },
  },
  {
    id: 'dark',
    name: 'Midnight',
    description: 'Charcoal & graphite',
    colors: {
      page: '#111318', text: '#f1f3f5', muted: '#9ba3ad', panel: '#1c2028', panelText: '#f7f8fa',
      frame: '#252b35', frameRing: '#0b0d11', lightSquare: '#b7bdc7', darkSquare: '#4a5260',
      accent: '#a78bfa', accentHover: '#bea9fb', accentText: '#191524', dialog: '#20252e', dialogText: '#f4f5f7',
      label: '#d9dde3', move: '#10141a', selected: '#9a7cf4', lastMove: '#d8b94e',
    },
  },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'saad-chess-theme';

function getInitialTheme(): ThemeId {
  if (typeof window === 'undefined') return 'gold';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return THEMES.some((theme) => theme.id === saved) ? (saved as ThemeId) : 'gold';
}

function themeVariables(theme: ThemeOption): CSSProperties {
  return Object.fromEntries(
    Object.entries(theme.colors).map(([key, value]) => [`--theme-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value]),
  ) as CSSProperties;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme);
  const selectedTheme = THEMES.find((option) => option.id === theme) ?? THEMES[0];

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div style={themeVariables(selectedTheme)}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function ThemePicker() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemePicker must be used inside ThemeProvider');

  return (
    <div className="w-full max-w-[36rem]" aria-label="Board theme">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--theme-muted)]">Choose a theme</p>
        <p className="text-xs text-[var(--theme-muted)]">Saved automatically</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {THEMES.map((option) => {
          const active = context.theme === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => context.setTheme(option.id)}
              aria-pressed={active}
              className={`group rounded-xl border p-2.5 text-left transition-all ${
                active
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-dialog)] shadow-md ring-2 ring-[var(--theme-accent)]/30'
                  : 'border-black/10 bg-[var(--theme-dialog)]/65 hover:-translate-y-0.5 hover:bg-[var(--theme-dialog)] hover:shadow-md'
              }`}
            >
              <span className="mb-2 grid h-7 grid-cols-4 overflow-hidden rounded-md ring-1 ring-black/15" aria-hidden>
                <span style={{ backgroundColor: option.colors.frame }} />
                <span style={{ backgroundColor: option.colors.lightSquare }} />
                <span style={{ backgroundColor: option.colors.darkSquare }} />
                <span style={{ backgroundColor: option.colors.accent }} />
              </span>
              <span className="flex items-center justify-between gap-1">
                <span className="text-sm font-semibold text-[var(--theme-text)]">{option.name}</span>
                {active && <span className="text-xs font-bold text-[var(--theme-text)]" aria-hidden>✓</span>}
              </span>
              <span className="block truncate text-[11px] text-[var(--theme-muted)]">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
