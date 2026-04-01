import React, { createContext, ReactNode, useContext, useState } from 'react';

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------

export type ScarLevelName = 'Beginner' | 'Apprentice' | 'Rider' | 'Whisperer' | 'Journeyman' | 'Trainer' | 'Warden' | 'Dragon Warrior' | 'Dragon Master' | 'Dragon Grandmaster' | 'Ultimate Dragon Warrior';

export interface ScarLevelInfo {
	level: number;
	name: ScarLevelName;
	levelUpRequiredXP: number;
	multiplier: number;
	features: string[]; // Might be deprecated in future / not used
	premiumFeatures?: string[];
}

// -----------------------------------------------------
// LEVEL DATA (PER-LEVEL XP REQUIREMENTS)
// -----------------------------------------------------

const SCAR_LEVELS: ScarLevelInfo[] = [
	{ level: 0, name: 'Beginner', levelUpRequiredXP: 250, multiplier: 1.0, features: ['Morning/Night Surveys', 'Day Goals', 'Mood', 'Streaks', 'Stats Table'] },
	{ level: 1, name: 'Apprentice', levelUpRequiredXP: 500, multiplier: 1.1, features: ['Custom Checklists', 'Goal Categories', 'Goal Importance', 'Shop (Multiplier Snacks)'] },
	{ level: 2, name: 'Rider', levelUpRequiredXP: 1000, multiplier: 1.2, features: ['Journal', 'Quotes', 'Short Answer Goals', 'Prompts', 'Cosmetics', 'Mood Snacks', 'Dragon Graveyard'] },
	{ level: 3, name: 'Whisperer', levelUpRequiredXP: 2000, multiplier: 1.3, features: ['More Goal Slots', 'More Cosmetics', 'Special Snacks'] },
	{ level: 4, name: 'Journeyman', levelUpRequiredXP: 3000, multiplier: 1.4, features: ['Clicking Dragon', 'Achievements', 'Ascension', 'Background Customization', 'Weather System'] },
	{ level: 5, name: 'Trainer', levelUpRequiredXP: 5000, multiplier: 1.5, features: ['Clicking Dragon Upgrades', 'Coin Generators', 'More Cosmetics', 'Glowing Icon'] },
	{ level: 6, name: 'Warden', levelUpRequiredXP: 10_000, multiplier: 1.6, features: ['Coin Snacks', 'Milk', 'Super Milk'] },
	{ level: 7, name: 'Dragon Warrior', levelUpRequiredXP: 25_000, multiplier: 1.7, features: ['Health Snacks', 'Rename Dragon (Wyrm)', 'Soul Converter'] },
	{ level: 8, name: 'Dragon Master', levelUpRequiredXP: 50_000, multiplier: 1.8, features: ['Advanced Soul Multipliers', 'Shop Resetor'] },
	{ level: 9, name: 'Dragon Grandmaster', levelUpRequiredXP: 200_000, multiplier: 1.9, features: ['Late Game Multipliers', 'Dragon Souls Scaling'] },
	{ level: 10, name: 'Ultimate Dragon Warrior', levelUpRequiredXP: 0, multiplier: 2.0, features: ['Maxed'], premiumFeatures: ['Dragon Pact Premium Features'] },
];

// -----------------------------------------------------
// CONTEXT TYPES
// -----------------------------------------------------

interface ScarLevelContextType {
	currentScarLevel: number;
	currentXP: number;
	addXP: (amount: number) => void;
	levelUp: () => void;
	getCurrentLevelInfo: () => ScarLevelInfo;
	getNextLevelInfo: () => ScarLevelInfo | null;
	getXPToNextLevel: () => number;
	getMultiplier: (isPremium: boolean) => number;
	hasFeature: (feature: string) => boolean;
	setScarLevel: (level: number) => void;
	setXP: (xp: number) => void;
	resetScarLevel: () => void;
}

const ScarLevelContext = createContext<ScarLevelContextType | undefined>(undefined);

// -----------------------------------------------------
// PROVIDER
// -----------------------------------------------------

export function ScarLevelProvider({ children }: { children: ReactNode }) {
	const [currentScarLevel, setCurrentScarLevel] = useState(0);
	const [currentXP, setCurrentXP] = useState(0);

	// -----------------------------
	// LEVEL HELPERS
	// -----------------------------

	const getCurrentLevelInfo = () => SCAR_LEVELS[currentScarLevel] ?? SCAR_LEVELS[SCAR_LEVELS.length - 1];

	const getNextLevelInfo = () => (currentScarLevel < SCAR_LEVELS.length - 1 ? SCAR_LEVELS[currentScarLevel + 1] : null);

	const getXPToNextLevel = () => {
		if (currentScarLevel >= SCAR_LEVELS.length - 1) return 0;
		return Math.max(0, getCurrentLevelInfo().levelUpRequiredXP - currentXP);
	};

	// -----------------------------
	// XP + LEVELING (PER-LEVEL XP)
	// -----------------------------

	const addXP = (amount: number) => {
		if (amount <= 0 || currentScarLevel >= SCAR_LEVELS.length - 1) return;

		let nextLevel = currentScarLevel;
		let nextXP = currentXP + amount;

		while (nextLevel < SCAR_LEVELS.length - 1) {
			const xpNeeded = SCAR_LEVELS[nextLevel].levelUpRequiredXP;
			if (nextXP < xpNeeded) break;
			nextXP -= xpNeeded;
			nextLevel += 1;
		}

		setCurrentScarLevel(nextLevel);
		setCurrentXP(nextLevel >= SCAR_LEVELS.length - 1 ? 0 : nextXP);
	};

	const levelUp = () => {
		if (currentScarLevel >= SCAR_LEVELS.length - 1) return;
		const nextLevel = currentScarLevel + 1;
		setCurrentScarLevel(nextLevel);
		setCurrentXP(0);
	};

	// -----------------------------
	// FEATURES + MULTIPLIER
	// -----------------------------

	const getMultiplier = (isPremium: boolean) => {
		const base = getCurrentLevelInfo().multiplier;
		return isPremium ? base * 2 : base;
	};

	const hasFeature = (feature: string) => getCurrentLevelInfo().features.includes(feature);

	// -----------------------------
	// MANUAL SETTERS & RESET
	// -----------------------------

	const setScarLevelValue = (level: number) => {
		const clamped = Math.max(0, Math.min(level, SCAR_LEVELS.length - 1));
		setCurrentScarLevel(clamped);
		setCurrentXP(0);
	};

	const setXPValue = (xp: number) => {
		const safeXP = Math.max(0, xp);
		const currentLevelInfo = SCAR_LEVELS[currentScarLevel];
		if (!currentLevelInfo || currentScarLevel >= SCAR_LEVELS.length - 1) {
			setCurrentXP(0);
			return;
		}
		setCurrentXP(Math.min(safeXP, currentLevelInfo.levelUpRequiredXP));
	};

	const resetScarLevel = () => {
		setCurrentScarLevel(0);
		setCurrentXP(0);
	};

	// -----------------------------
	// PROVIDER RETURN
	// -----------------------------

	return (
		<ScarLevelContext.Provider
			value={{
				currentScarLevel,
				currentXP,
				addXP,
				levelUp,
				getCurrentLevelInfo,
				getNextLevelInfo,
				getXPToNextLevel,
				getMultiplier,
				hasFeature,
				setScarLevel: setScarLevelValue,
				setXP: setXPValue,
				resetScarLevel,
			}}>
			{children}
		</ScarLevelContext.Provider>
	);
}

// -----------------------------------------------------
// HOOK
// -----------------------------------------------------

export function useScarLevel() {
	const ctx = useContext(ScarLevelContext);
	if (!ctx) throw new Error('useScarLevel must be used within ScarLevelProvider');
	return ctx;
}
