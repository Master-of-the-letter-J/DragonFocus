import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import { DRAGON_THEME_PRESETS, type DragonThemePreset, type DragonThemeTokenSet } from '@/data/theme-data';
import React, { createContext, type ReactNode, useContext, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark';
export type BackgroundTheme = 'dungeon' | 'castlePlains' | 'space' | 'volcano' | 'forest' | 'sky' | 'custom';
export type ThemeBrightness = 'bright' | 'slight_bright' | 'normal' | 'slight_dimmer' | 'dimmer';

export interface ThemeColors {
	background: string;
	primaryBackground: string;
	secondaryBackground: string;
	tertiaryBackground: string;
	fourthBackground: string;
	card: string;
	border: string;
	inputBackground: string;
	text: string;
	titleText: string;
	headerText: string;
	subheaderText: string;
	secondaryText: string;
	tint: string;
	success: string;
	warning: string;
	danger: string;
	info: string;
	tabIconDefault: string;
	tabIconSelected: string;
	buttonBackground: string;
	buttonText: string;
	secondaryButton: string;
	secondaryButtonText: string;
}

export interface ThemePalette {
	light: ThemeColors;
	dark: ThemeColors;
}

interface StoredThemeState {
	mode: ThemeMode;
	backgroundTheme: BackgroundTheme;
	customBackgroundColor?: string;
	brightness: ThemeBrightness;
}

export interface ThemeContextType {
	mode: ThemeMode;
	backgroundTheme: BackgroundTheme;
	customBackgroundColor?: string;
	brightness: ThemeBrightness;
	colors: ThemeColors;
	activePreset: DragonThemePreset;
	setPalette: (palette: ThemePalette) => void;
	setMode: (mode: ThemeMode) => void;
	setBackgroundTheme: (theme: BackgroundTheme) => void;
	setCustomBackground: (color: string) => void;
	setBrightness: (level: ThemeBrightness) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_FALLBACK_ID: BackgroundTheme = 'dungeon';

const DEFAULT_THEME_STATE: StoredThemeState = {
	mode: 'dark',
	backgroundTheme: THEME_FALLBACK_ID,
	customBackgroundColor: undefined,
	brightness: 'normal',
};

const normalizeStoredTheme = (storedState: StoredThemeState | null, initialState: StoredThemeState): StoredThemeState => {
	if (!storedState) return initialState;
	const backgroundTheme =
		storedState.backgroundTheme === 'custom'
			? 'custom'
			: storedState.backgroundTheme in DRAGON_THEME_PRESETS
				? storedState.backgroundTheme
				: THEME_FALLBACK_ID;
	return {
		mode: storedState.mode === 'light' ? 'light' : 'dark',
		backgroundTheme,
		customBackgroundColor: storedState.customBackgroundColor || undefined,
		brightness: storedState.brightness ?? 'normal',
	};
};

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const adjustBrightness = (color: string, level: ThemeBrightness) => {
	if (level === 'normal' || !color.startsWith('#') || (color.length !== 7 && color.length !== 4)) return color;

	let ratio = 1;
	switch (level) {
		case 'bright':
			ratio = 1.3;
			break;
		case 'slight_bright':
			ratio = 1.15;
			break;
		case 'slight_dimmer':
			ratio = 0.85;
			break;
		case 'dimmer':
			ratio = 0.7;
			break;
		default:
			ratio = 1;
	}

	const normalizedHex =
		color.length === 4
			? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
			: color;
	const hex = normalizedHex.replace('#', '');
	const r = clampChannel(parseInt(hex.slice(0, 2), 16) * ratio);
	const g = clampChannel(parseInt(hex.slice(2, 4), 16) * ratio);
	const b = clampChannel(parseInt(hex.slice(4, 6), 16) * ratio);

	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const createThemeColors = (tokens: DragonThemeTokenSet, brightness: ThemeBrightness, customBackgroundColor?: string): ThemeColors => ({
	background: customBackgroundColor || adjustBrightness(tokens.primaryBackground, brightness),
	primaryBackground: customBackgroundColor || adjustBrightness(tokens.primaryBackground, brightness),
	secondaryBackground: adjustBrightness(tokens.secondaryBackground, brightness),
	tertiaryBackground: adjustBrightness(tokens.tertiaryBackground, brightness),
	fourthBackground: adjustBrightness(tokens.fourthBackground, brightness),
	card: adjustBrightness(tokens.secondaryBackground, brightness),
	border: adjustBrightness(tokens.border, brightness),
	inputBackground: adjustBrightness(tokens.inputBackground, brightness),
	text: adjustBrightness(tokens.bodyText, brightness),
	titleText: adjustBrightness(tokens.titleText, brightness),
	headerText: adjustBrightness(tokens.headerText, brightness),
	subheaderText: adjustBrightness(tokens.subheaderText, brightness),
	secondaryText: adjustBrightness(tokens.secondaryText, brightness),
	tint: adjustBrightness(tokens.tint, brightness),
	success: adjustBrightness(tokens.success, brightness),
	warning: adjustBrightness(tokens.warning, brightness),
	danger: adjustBrightness(tokens.danger, brightness),
	info: adjustBrightness(tokens.info, brightness),
	tabIconDefault: adjustBrightness(tokens.tabIconDefault, brightness),
	tabIconSelected: adjustBrightness(tokens.tabIconSelected, brightness),
	buttonBackground: adjustBrightness(tokens.buttonBackground, brightness),
	buttonText: adjustBrightness(tokens.buttonText, brightness),
	secondaryButton: adjustBrightness(tokens.secondaryButton, brightness),
	secondaryButtonText: adjustBrightness(tokens.secondaryButtonText, brightness),
});

export function DragonThemeProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.theme, DEFAULT_THEME_STATE, { normalize: normalizeStoredTheme });

	const activePreset = DRAGON_THEME_PRESETS[state.backgroundTheme === 'custom' ? THEME_FALLBACK_ID : state.backgroundTheme] ?? DRAGON_THEME_PRESETS[THEME_FALLBACK_ID];
	const [customPalette, setCustomPaletteState] = React.useState<ThemePalette | null>(null);

	const colors = useMemo(() => {
		if (customPalette) {
			return state.mode === 'light' ? customPalette.light : customPalette.dark;
		}
		return createThemeColors(activePreset[state.mode], state.brightness, state.customBackgroundColor);
	}, [activePreset, customPalette, state.brightness, state.customBackgroundColor, state.mode]);

	const value = useMemo<ThemeContextType>(
		() => ({
			mode: state.mode,
			backgroundTheme: state.backgroundTheme,
			customBackgroundColor: state.customBackgroundColor,
			brightness: state.brightness,
			colors,
			activePreset,
			setPalette: setCustomPaletteState,
			setMode: mode => setState(current => ({ ...current, mode })),
			setBackgroundTheme: backgroundTheme => setState(current => ({ ...current, backgroundTheme, customBackgroundColor: backgroundTheme === 'custom' ? current.customBackgroundColor : undefined })),
			setCustomBackground: color => setState(current => ({ ...current, backgroundTheme: 'custom', customBackgroundColor: color })),
			setBrightness: brightness => setState(current => ({ ...current, brightness })),
		}),
		[activePreset, colors, setState, state.backgroundTheme, state.brightness, state.customBackgroundColor, state.mode],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a DragonThemeProvider');
	}
	return context;
}
