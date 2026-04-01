import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DragonCoinsContextType {
	coins: number;
	coinMultiplier: number;
	totalCoinsEarned: number;
	coinsSinceLastAscension: number;
	addCoins: (amount: number) => void;
	spendCoins: (amount: number) => boolean;
	getCoins: () => number;
	getCoinsSinceLastAscension: () => number;
	// Formula: (1 - Yang * 0.005) * (1 + DragonShards * 0.01) * (1 + 0.1 * ScarLevel) * SnackMultipliers * (2 if Premium)
	calculateCoinMultiplier: (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => number;
	calculateSurveyCoins: (isMorningOrNight: boolean, streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => number;
	calculateFireXP: (coins: number) => number; // Fire XP is 10x earned coins.
	addMorningSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addNightSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addAdditionalSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addClickingCoins: (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	markAscended: () => void;
	resetCoins?: () => void;
}

const DragonCoinsContext = createContext<DragonCoinsContextType | undefined>(undefined);

const round4 = (v: number) => Math.round(v * 10000) / 10000;

export function DragonCoinsProvider({ children }: { children: ReactNode }) {
	const [coins, setCoins] = useState(0);
	const [coinMultiplier, setCoinMultiplier] = useState(1);
	const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
	const [coinsSinceLastAscension, setCoinsSinceLastAscension] = useState(0);

	const addCoins = (amount: number) => {
		setCoins(prev => Math.max(0, prev + amount));
		if (amount > 0) {
			setTotalCoinsEarned(prev => prev + amount);
			setCoinsSinceLastAscension(prev => prev + amount);
		}
	};

	const spendCoins = (amount: number): boolean => {
		if (coins >= amount) {
			setCoins(prev => prev - amount);
			return true;
		}
		return false;
	};

	const getCoins = () => coins;
	const getCoinsSinceLastAscension = () => coinsSinceLastAscension;

	const resetCoins = () => setCoins(0);
	const markAscended = () => setCoinsSinceLastAscension(0);

	const calculateCoinMultiplier = (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false): number => {
		const clampedYang = Math.max(0, Math.min(100, yangValue));
		const safeShards = Math.max(0, dragonShards);
		const safeScar = Math.max(0, scarLevel);
		const safeSnackMultiplier = Math.max(0, snackMultipliers || 1);

		const yangMultiplier = Math.max(0, 1 - clampedYang * 0.005);
		// Keep baseline progress possible at 0 shards.
		const shardMultiplier = 1 + safeShards * 0.01;
		const scarMultiplier = 1 + 0.1 * safeScar;
		const premiumMultiplier = isPremium ? 2 : 1;

		return round4(yangMultiplier * shardMultiplier * scarMultiplier * safeSnackMultiplier * premiumMultiplier);
	};

	const captureMultiplier = (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		const multiplier = calculateCoinMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		setCoinMultiplier(multiplier);
		return multiplier;
	};

	const calculateSurveyCoins = (isMorningOrNight: boolean, streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false): number => {
		const baseCoins = 10;
		const streakBonus = Math.max(0, streak);
		const multiplier = captureMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		return Math.max(0, Math.floor((baseCoins + streakBonus) * multiplier));
	};

	const calculateFireXP = (coinsEarned: number): number => {
		return Math.max(0, round4(coinsEarned * 10));
	};

	const addMorningSurveyCoins = (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		const gained = calculateSurveyCoins(true, streak, yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		addCoins(gained);
	};

	const addNightSurveyCoins = (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		const gained = calculateSurveyCoins(false, streak, yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		addCoins(gained);
	};

	const addAdditionalSurveyCoins = (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		const baseCoins = 1;
		const streakBonus = Math.max(0, streak);
		const multiplier = captureMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		addCoins(Math.max(0, Math.floor((baseCoins + streakBonus) * multiplier)));
	};

	const addClickingCoins = (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		// +10/(yang/10) with safe lower bound.
		const baseCoins = 10 / Math.max(1, yangValue / 10);
		const multiplier = captureMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		addCoins(Math.max(0, Math.floor(baseCoins * multiplier)));
	};

	return (
		<DragonCoinsContext.Provider
			value={{
				coins,
				coinMultiplier,
				totalCoinsEarned,
				coinsSinceLastAscension,
				addCoins,
				spendCoins,
				getCoins,
				getCoinsSinceLastAscension,
				calculateCoinMultiplier,
				calculateSurveyCoins,
				calculateFireXP,
				addMorningSurveyCoins,
				addNightSurveyCoins,
				addAdditionalSurveyCoins,
				addClickingCoins,
				markAscended,
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
