import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type BackgroundTheme = 'dungeon' | 'castlePlains' | 'space' | 'volcano' | 'forest' | 'sky' | 'custom';

export interface ThemeColors {
	// Basic
	text: string;
	background: string;
	tint: string;

	// UI Elements
	card: string;
	border: string;
	inputBackground: string;

	// Status Colors
	success: string;
	warning: string;
	danger: string;
	info: string;

	// Tab Navigation
	tabIconDefault: string;
	tabIconSelected: string;

	// Buttons
	buttonBackground: string;
	buttonText: string;
	secondaryButton: string;
	secondaryButtonText: string;
}

export interface ThemePalette {
	light: ThemeColors;
	dark: ThemeColors;
}

export interface ThemeContextType {
	mode: ThemeMode;
	backgroundTheme: BackgroundTheme;
	customBackgroundColor?: string;
	brightness: 'bright' | 'slight_bright' | 'normal' | 'slight_dimmer' | 'dimmer';
	colors: ThemeColors;
	setPalette: (palette: ThemePalette) => void;
	setMode: (mode: ThemeMode) => void;
	setBackgroundTheme: (theme: BackgroundTheme) => void;
	setCustomBackground: (color: string) => void;
	setBrightness: (level: 'bright' | 'slight_bright' | 'normal' | 'slight_dimmer' | 'dimmer') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultDarkTheme: ThemeColors = {
	text: '#f5f5f5',
	background: '#1a1a1a',
	tint: '#81c784',
	card: '#2a2a2a',
	border: '#404040',
	inputBackground: '#2a2a2a',
	success: '#81c784',
	warning: '#ffb74d',
	danger: '#ef5350',
	info: '#64b5f6',
	tabIconDefault: '#666',
	tabIconSelected: '#81c784',
	buttonBackground: '#2a7a2a',
	buttonText: '#fff',
	secondaryButton: '#404040',
	secondaryButtonText: '#f5f5f5',
};

const defaultLightTheme: ThemeColors = {
	text: '#333333',
	background: '#ffffff',
	tint: '#2f95dc',
	card: '#f5f5f5',
	border: '#e0e0e0',
	inputBackground: '#f9f9f9',
	success: '#4caf50',
	warning: '#ff9800',
	danger: '#f44336',
	info: '#2196f3',
	tabIconDefault: '#ccc',
	tabIconSelected: '#2f95dc',
	buttonBackground: '#4caf50',
	buttonText: '#fff',
	secondaryButton: '#f0f0f0',
	secondaryButtonText: '#333',
};

const defaultPalette: ThemePalette = {
	light: defaultLightTheme,
	dark: defaultDarkTheme,
};

export function DragonThemeProvider({ children }: { children: ReactNode }) {
	const [mode, setModeState] = useState<ThemeMode>('dark');
	const [backgroundTheme, setBackgroundThemeState] = useState<BackgroundTheme>('dungeon');
	const [customBackgroundColor, setCustomBackgroundColor] = useState<string | undefined>(undefined);
	const [brightness, setBrightnessState] = useState<'bright' | 'slight_bright' | 'normal' | 'slight_dimmer' | 'dimmer'>('normal');
	const [palette, setPaletteState] = useState<ThemePalette>(defaultPalette);

	const colors = mode === 'light' ? palette.light : palette.dark;

	// Apply brightness modifier to colors
	const adjustedColors: ThemeColors = {
		...colors,
		background: adjustBrightness(colors.background, brightness),
		card: adjustBrightness(colors.card, brightness),
		text: adjustBrightness(colors.text, brightness),
	};

	return (
		<ThemeContext.Provider
			value={{
				mode,
				backgroundTheme,
				customBackgroundColor,
				brightness,
				colors: adjustedColors,
				setPalette: setPaletteState,
				setMode: setModeState,
				setBackgroundTheme: setBackgroundThemeState,
				setCustomBackground: setCustomBackgroundColor,
				setBrightness: setBrightnessState,
			}}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a DragonThemeProvider');
	}
	return context;
}

/**
 * Adjusts brightness of a hex color string
 */
function adjustBrightness(color: string, level: 'bright' | 'slight_bright' | 'normal' | 'slight_dimmer' | 'dimmer'): string {
	if (level === 'normal') return color;

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

	const hex = color.replace('#', '');
	const r = Math.round(Math.min(255, parseInt(hex.substring(0, 2), 16) * ratio));
	const g = Math.round(Math.min(255, parseInt(hex.substring(2, 4), 16) * ratio));
	const b = Math.round(Math.min(255, parseInt(hex.substring(4, 6), 16) * ratio));

	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
