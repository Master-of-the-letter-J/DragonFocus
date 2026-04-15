import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type ScarLevelName = string;

export interface ScarLevelInfo {
	level: number;
	name: ScarLevelName;
	levelUpRequiredXP: number;
	multiplier: number;
	features: string[];
	premiumFeatures?: string[];
}

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

const EARLY_FEATURES: Record<number, string[]> = {
	0: ['Morning Survey', 'Night Survey', 'Mood Tracking', 'Logs'],
	1: ['Market Page', 'Survey Boosters'],
	2: ['Dragon Graveyard', 'Mood Snacks', 'Therapy Snacks'],
	3: ['Lair Rename', 'Survey Snack Drops', 'Coin Generators', 'Clickers'],
	4: ['Ascension', 'Extra Goal Slots', 'Soul Multipliers', 'Challenges'],
	5: ['Invincible Dragon Mode', 'Glowing Scar Icon'],
	6: ['Coin Booster Snacks'],
	7: ['Wyrm Rename'],
	8: ['Extra Goal Slots', 'Cosmetics', 'Ice and Fire Snacks'],
	9: ['Late-Game Generator Unlocks', 'Late-Game Clickers'],
	10: ['Super Milk', 'Super Snack', 'Age Snack', 'Max Early Unlock Tier'],
};

const buildScarLevels = (): ScarLevelInfo[] => {
	const xpRequirements = [
		100,
		250,
		500,
		750,
		1_000,
		2_500,
		5_000,
		10_000,
		25_000,
		50_000,
		100_000,
		200_000,
		500_000,
		1_000_000,
		2_000_000,
		5_000_000,
		10_000_000,
		25_000_000,
		100_000_000,
		1_000_000_000,
		1e9,
		1e12,
		1e15,
		1e18,
		1e21,
		1e24,
		1e27,
		1e30,
		1e33,
		1e36,
	];

	const levelNames = [
		'Beginner I',
		'Beginner II',
		'Apprentice I',
		'Apprentice II',
		'Journeyman I',
		'Journeyman II',
		'Warrior I',
		'Warrior II',
		'Warlord I',
		'Warlord II',
		'Rider I',
		'Rider II',
		'Whisperer I',
		'Whisperer II',
		'Trainer I',
		'Trainer II',
		'Mage I',
		'Mage II',
		'Archmage I',
		'Archmage II',
		'Warden I',
		'Warden II',
		'Guardian',
		'Commander',
		'Captain',
		'Colonel',
		'Dragon Warrior',
		'Dragon Slayer',
		'Dragon Master',
		'Dragon Grandmaster',
	];

	const levels: ScarLevelInfo[] = [];

	for (let level = 0; level <= 29; level += 1) {
		levels.push({
			level,
			name: levelNames[level],
			levelUpRequiredXP: xpRequirements[level],
			multiplier: 1 + level / 10,
			features: EARLY_FEATURES[level] ?? [`Scar Multiplier ${(1 + level / 10).toFixed(1)}x`, 'Late-game progression'],
		});
	}

	levels.push({
		level: 30,
		name: 'Ultimate Dragon Warrior',
		levelUpRequiredXP: 0,
		multiplier: 4,
		features: ['Maxed'],
		premiumFeatures: ['Premium Dragon Pact - 3 day free trial / $1.99 month / $9.99 year'],
	});

	return levels;
};

const SCAR_LEVELS: ScarLevelInfo[] = buildScarLevels();

export function ScarLevelProvider({ children }: { children: ReactNode }) {
	const [currentScarLevel, setCurrentScarLevel] = useState(0);
	const [currentXP, setCurrentXP] = useState(0);

	const maxScarLevel = SCAR_LEVELS.length - 1;

	const getCurrentLevelInfo = () => SCAR_LEVELS[currentScarLevel] ?? SCAR_LEVELS[maxScarLevel];

	const getNextLevelInfo = () => (currentScarLevel < maxScarLevel ? SCAR_LEVELS[currentScarLevel + 1] : null);

	const getXPToNextLevel = () => {
		if (currentScarLevel >= maxScarLevel) return 0;
		return Math.max(0, getCurrentLevelInfo().levelUpRequiredXP - currentXP);
	};

	const addXP = (amount: number) => {
		if (amount <= 0 || currentScarLevel >= maxScarLevel) return;

		let nextLevel = currentScarLevel;
		let nextXP = currentXP + amount;

		while (nextLevel < maxScarLevel) {
			const xpNeeded = SCAR_LEVELS[nextLevel].levelUpRequiredXP;
			if (nextXP < xpNeeded) break;
			nextXP -= xpNeeded;
			nextLevel += 1;
		}

		setCurrentScarLevel(nextLevel);
		setCurrentXP(nextLevel >= maxScarLevel ? 0 : nextXP);
	};

	const levelUp = () => {
		if (currentScarLevel >= maxScarLevel) return;
		setCurrentScarLevel(prev => Math.min(maxScarLevel, prev + 1));
		setCurrentXP(0);
	};

	const getMultiplier = (isPremium: boolean) => {
		const base = getCurrentLevelInfo().multiplier;
		return isPremium ? base * 2 : base;
	};

	const unlockedFeatures = useMemo(() => {
		return SCAR_LEVELS.slice(0, currentScarLevel + 1).flatMap(level => level.features);
	}, [currentScarLevel]);

	const hasFeature = (feature: string) => unlockedFeatures.includes(feature);

	const setScarLevelValue = (level: number) => {
		const clamped = Math.max(0, Math.min(level, maxScarLevel));
		setCurrentScarLevel(clamped);
		setCurrentXP(0);
	};

	const setXPValue = (xp: number) => {
		const safeXP = Math.max(0, xp);
		const currentLevelInfo = SCAR_LEVELS[currentScarLevel];
		if (!currentLevelInfo || currentScarLevel >= maxScarLevel) {
			setCurrentXP(0);
			return;
		}
		setCurrentXP(Math.min(safeXP, currentLevelInfo.levelUpRequiredXP));
	};

	const resetScarLevel = () => {
		setCurrentScarLevel(0);
		setCurrentXP(0);
	};

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

export function useScarLevel() {
	const ctx = useContext(ScarLevelContext);
	if (!ctx) throw new Error('useScarLevel must be used within ScarLevelProvider');
	return ctx;
}
