import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DragonCoinsContextType {
	coins: number;
	addCoins: (amount: number) => void;
	spendCoins: (amount: number) => boolean;
	getCoins: () => number;
	// Coin Multiplier System: (1 - Yang * 0.005) * (Dragon Shards * 0.01) * (1 + 0.1 * Scar Level) * (Snack Multipliers) * (2 if Premium)
	calculateCoinMultiplier: (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => number;
	calculateSurveyCoins: (isMorningOrNight: boolean, streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => number;
	calculateFireXP: (coins: number) => number; // XP earned is 1/10 of coins earned, also multiplied by coin multiplier
	addMorningSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addNightSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addAdditionalSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addClickingCoins: (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	resetCoins?: () => void;
}

const DragonCoinsContext = createContext<DragonCoinsContextType | undefined>(undefined);

export function DragonCoinsProvider({ children }: { children: ReactNode }) {
	const [coins, setCoins] = useState(0);

	const addCoins = (amount: number) => {
		setCoins(prev => Math.max(0, prev + amount));
	};

	const spendCoins = (amount: number): boolean => {
		if (coins >= amount) {
			setCoins(prev => prev - amount);
			return true;
		}
		return false;
	};

	const getCoins = () => coins;

	const resetCoins = () => setCoins(0);

	// Calculate the comprehensive coin multiplier
	// Formula: (1 - Yang * 0.005) * (Dragon Shards * 0.01) * (1 + 0.1 * Scar Level) * (Snack Multipliers) * (2 if Premium)
	const calculateCoinMultiplier = (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false): number => {
		// Ensure yangValue is between 0 and 100
		const clampedYang = Math.max(0, Math.min(100, yangValue));

		const yangMultiplier = 1 - clampedYang * 0.005; // (1 - Yang * 0.005)
		const shardMultiplier = dragonShards * 0.01; // (Dragon Shards * 0.01)
		const scarMultiplier = 1 + 0.1 * scarLevel; // (1 + 0.1 * Scar Level)
		const premiumMultiplier = isPremium ? 2 : 1; // (2 if Premium)

		// Final multiplier = all components multiplied together
		return yangMultiplier * shardMultiplier * scarMultiplier * snackMultipliers * premiumMultiplier;
	};

	const calculateSurveyCoins = (isMorningOrNight: boolean, streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false): number => {
		let baseCoins = 10; // +10 Morning/Night
		let streakBonus = streak >= 1 ? 1 * streak : 0; // +1 * Streak
		const multiplier = calculateCoinMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);

		return Math.floor((baseCoins + streakBonus) * multiplier);
	};

	const calculateFireXP = (coins: number): number => {
		// XP earned is 1/10 of coins earned
		return Math.floor(coins / 10);
	};

	const addMorningSurveyCoins = (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		const coins = calculateSurveyCoins(true, streak, yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		addCoins(coins);
	};

	const addNightSurveyCoins = (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		const coins = calculateSurveyCoins(true, streak, yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		addCoins(coins);
	};

	const addAdditionalSurveyCoins = (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		let baseCoins = 1;
		let streakBonus = streak >= 1 ? 1 * streak : 0;
		const multiplier = calculateCoinMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);

		addCoins(Math.floor((baseCoins + streakBonus) * multiplier));
	};

	const addClickingCoins = (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		// +10/(yang/10) where yang = 100 - yin (but yangValue is already provided)
		const baseCoins = 10 / (yangValue / 10);
		const multiplier = calculateCoinMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);

		addCoins(Math.floor(baseCoins * multiplier));
	};

	return (
		<DragonCoinsContext.Provider
			value={{
				coins,
				addCoins,
				spendCoins,
				getCoins,
				calculateCoinMultiplier,
				calculateSurveyCoins,
				calculateFireXP,
				addMorningSurveyCoins,
				addNightSurveyCoins,
				addAdditionalSurveyCoins,
				addClickingCoins,
				resetCoins,
			}}>
			{children}
		</DragonCoinsContext.Provider>
	);
}

export function useDragonCoins() {
	const context = useContext(DragonCoinsContext);
	if (!context) {
		throw new Error('useDragonCoins must be used within DragonCoinsProvider');
	}
	return context;
}
