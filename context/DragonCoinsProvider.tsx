import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useContext } from 'react';

interface DragonCoinState {
	coins: number;
	coinMultiplier: number;
	totalCoinsEarned: number;
	totalSurveyCoinsEarned: number;
	coinsSinceLastAscension: number;
	externalCoinMultiplier: number;
}

interface DragonCoinsContextType {
	coins: number;
	coinMultiplier: number;
	totalCoinsEarned: number;
	totalSurveyCoinsEarned: number;
	coinsSinceLastAscension: number;
	addCoins: (amount: number) => void;
	spendCoins: (amount: number) => boolean;
	getCoins: () => number;
	getCoinsSinceLastAscension: () => number;
	getTotalSurveyCoinsEarned: () => number;
	registerSurveyCoins: (amount: number) => void;
	// Formula: (1 - Yang * 0.005) * (1 + DragonShards * 0.01) * (1 + 0.1 * ScarLevel) * SnackMultipliers * (2 if Premium)
	calculateCoinMultiplier: (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => number;
	calculateSurveyCoins: (isMorningOrNight: boolean, streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => number;
	calculateFireXP: (coins: number) => number; // Fire XP is 10x earned coins.
	addMorningSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addNightSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addAdditionalSurveyCoins: (streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	addClickingCoins: (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number, isPremium: boolean) => void;
	setExternalCoinMultiplier: (amount: number) => void;
	markAscended: () => void;
	resetCoins?: () => void;
}

const DragonCoinsContext = createContext<DragonCoinsContextType | undefined>(undefined);

const round4 = (v: number) => Math.round(v * 10000) / 10000;

const INITIAL_DRAGON_COIN_STATE: DragonCoinState = {
	coins: 0,
	coinMultiplier: 1,
	totalCoinsEarned: 0,
	totalSurveyCoinsEarned: 0,
	coinsSinceLastAscension: 0,
	externalCoinMultiplier: 1,
};

export function DragonCoinsProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.dragonCoins, INITIAL_DRAGON_COIN_STATE);

	const addCoins = (amount: number) => {
		setState(current => ({
			...current,
			coins: Math.max(0, current.coins + amount),
			totalCoinsEarned: amount > 0 ? current.totalCoinsEarned + amount : current.totalCoinsEarned,
			coinsSinceLastAscension: amount > 0 ? current.coinsSinceLastAscension + amount : current.coinsSinceLastAscension,
		}));
	};

	const spendCoins = (amount: number): boolean => {
		if (state.coins >= amount) {
			setState(current => ({
				...current,
				coins: Math.max(0, current.coins - amount),
			}));
			return true;
		}
		return false;
	};

	const getCoins = () => state.coins;
	const getCoinsSinceLastAscension = () => state.coinsSinceLastAscension;
	const getTotalSurveyCoinsEarned = () => state.totalSurveyCoinsEarned;

	const resetCoins = () =>
		setState(current => ({
			...current,
			coins: 0,
		}));
	const markAscended = () =>
		setState(current => ({
			...current,
			coinsSinceLastAscension: 0,
		}));
	const registerSurveyCoins = (amount: number) => {
		if (amount <= 0) return;
		setState(current => ({
			...current,
			totalSurveyCoinsEarned: current.totalSurveyCoinsEarned + amount,
		}));
	};
	const setExternalCoinMultiplier = (amount: number) => {
		setState(current => ({
			...current,
			externalCoinMultiplier: Math.max(1, amount),
		}));
	};

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

		return round4(yangMultiplier * shardMultiplier * scarMultiplier * safeSnackMultiplier * premiumMultiplier * state.externalCoinMultiplier);
	};

	const captureMultiplier = (yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false) => {
		const multiplier = calculateCoinMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		setState(current => ({
			...current,
			coinMultiplier: multiplier,
		}));
		return multiplier;
	};

	const calculateSurveyCoins = (isMorningOrNight: boolean, streak: number, yangValue: number, dragonShards: number, scarLevel: number, snackMultipliers: number = 1, isPremium: boolean = false): number => {
		const baseCoins = 10;
		const multiplier = captureMultiplier(yangValue, dragonShards, scarLevel, snackMultipliers, isPremium);
		return Math.max(0, Math.floor(baseCoins * multiplier));
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
				coins: state.coins,
				coinMultiplier: state.coinMultiplier,
				totalCoinsEarned: state.totalCoinsEarned,
				totalSurveyCoinsEarned: state.totalSurveyCoinsEarned,
				coinsSinceLastAscension: state.coinsSinceLastAscension,
				addCoins,
				spendCoins,
				getCoins,
				getCoinsSinceLastAscension,
				getTotalSurveyCoinsEarned,
				registerSurveyCoins,
				calculateCoinMultiplier,
				calculateSurveyCoins,
				calculateFireXP,
				addMorningSurveyCoins,
				addNightSurveyCoins,
				addAdditionalSurveyCoins,
				addClickingCoins,
				setExternalCoinMultiplier,
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
