import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useShards } from '@/context/DragonShardsProvider';
import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export interface AscensionRequirement {
	label: string;
	met: boolean;
}

export interface AscensionRewards {
	souls: number;
	shards: number;
	coinsBanked: number;
	generatorsSacrificed: number;
	clickersSacrificed: number;
}

interface AscensionContextType {
	ascensionCount: number;
	lastAscensionDate: string | null;
	snackResetUsedThisAscension: boolean;
	getAscensionRequirements: () => AscensionRequirement[];
	canAscend: () => boolean;
	getAscensionRewards: () => AscensionRewards;
	ascend: () => { success: boolean; message?: string; rewards?: AscensionRewards };
	getSoulConverterCost: () => number;
	convertSoulToShard: () => { success: boolean; message?: string; cost: number };
	getSoulRespecCost: () => number;
	respecSoulMultipliers: () => { success: boolean; message?: string; refundedSouls: number; cost: number };
	getSnackResetCost: () => { souls: number; shards: number };
	resetSnackMarket: () => { success: boolean; message?: string };
}

const AscensionContext = createContext<AscensionContextType | undefined>(undefined);

const DAY_MS = 24 * 60 * 60 * 1000;

export function AscensionProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const scarLevel = useScarLevel();
	const population = usePopulation();
	const coins = useDragonCoins();
	const shards = useShards();
	const souls = useDragonSouls();
	const itemEconomy = useItemEconomy();
	const itemSnacks = useItemSnacks();

	const [ascensionCount, setAscensionCount] = useState(0);
	const [lastAscensionDate, setLastAscensionDate] = useState<string | null>(null);
	const [soulConversions, setSoulConversions] = useState(0);
	const [snackResetCount, setSnackResetCount] = useState(0);
	const [snackResetUsedThisAscension, setSnackResetUsedThisAscension] = useState(false);

	const getTodayKey = useMemo(() => () => new Date().toISOString().split('T')[0], []);

	const getDaysSinceAscension = () => {
		if (!lastAscensionDate) return Number.POSITIVE_INFINITY;
		const then = new Date(lastAscensionDate).getTime();
		const now = new Date(getTodayKey()).getTime();
		return Math.floor((now - then) / DAY_MS);
	};

	const getAscensionRewards = (): AscensionRewards => {
		const generatorsSacrificed = itemEconomy.getOwnedTotalByType?.('generator') ?? 0;
		const clickersSacrificed = itemEconomy.getOwnedTotalByType?.('clicker') ?? 0;
		const coinsBanked = Math.max(0, Math.floor(coins.getCoinsSinceLastAscension?.() ?? coins.getCoins?.() ?? 0));
		const soulReward = Math.max(0, Math.floor(Math.pow(coinsBanked, 0.75)));
		const shardReward = Math.max(0, Math.floor(Math.sqrt(coinsBanked) / 25) + generatorsSacrificed + clickersSacrificed);
		return {
			souls: soulReward,
			shards: shardReward,
			coinsBanked,
			generatorsSacrificed,
			clickersSacrificed,
		};
	};

	const getAscensionRequirements = (): AscensionRequirement[] => [
		{ label: `Dragon is Juvenile or older (${dragon.age}/30 days)`, met: dragon.age >= 30 },
		{ label: `Scar Level 4 or higher (current: ${scarLevel.currentScarLevel})`, met: scarLevel.currentScarLevel >= 4 },
		{ label: `Dragon is alive`, met: dragon.dragonState === 'alive' },
		{ label: `Ascension cooldown complete (${Math.min(7, getDaysSinceAscension())}/7 days)`, met: getDaysSinceAscension() >= 7 },
	];

	const canAscend = () => getAscensionRequirements().every(requirement => requirement.met);

	const getSoulConverterCost = () => {
		return Math.max(1, Math.floor(Math.pow(1.02, soulConversions)));
	};

	const convertSoulToShard = () => {
		const cost = getSoulConverterCost();
		if (!souls.spendSouls(cost)) {
			return { success: false, message: `Need ${cost} Dragon Souls.`, cost };
		}
		shards.addShards(1);
		setSoulConversions(prev => prev + 1);
		return { success: true, cost };
	};

	const getSoulRespecCost = () => 50;

	const respecSoulMultipliers = () => {
		const cost = getSoulRespecCost();
		const refundPreview = Math.floor(itemEconomy.getSoulMultiplierRefundTotal?.() ?? 0);
		if (refundPreview <= 0) {
			return { success: false, message: 'No soul multipliers are owned yet.', refundedSouls: 0, cost };
		}
		if (shards.getShards() < cost) {
			return { success: false, message: `Need ${cost} Dragon Shards.`, refundedSouls: 0, cost };
		}
		if (!shards.spendShards(cost)) {
			return { success: false, message: `Need ${cost} Dragon Shards.`, refundedSouls: 0, cost };
		}
		const refundedSouls = Math.floor(itemEconomy.resetSoulMultipliers?.() ?? 0);
		return { success: true, refundedSouls, cost };
	};

	const getSnackResetCost = () => ({
		souls: Math.max(1000, Math.floor(1000 * Math.pow(1000, snackResetCount))),
		shards: 100,
	});

	const resetSnackMarket = () => {
		if (snackResetUsedThisAscension) {
			return { success: false, message: 'The snack market has already been reset this ascension.' };
		}
		const cost = getSnackResetCost();
		if (souls.getSouls() < cost.souls || shards.getShards() < cost.shards) {
			return { success: false, message: `Need ${cost.souls} Dragon Souls and ${cost.shards} Dragon Shards.` };
		}
		if (!souls.spendSouls(cost.souls)) {
			return { success: false, message: `Need ${cost.souls} Dragon Souls and ${cost.shards} Dragon Shards.` };
		}
		if (!shards.spendShards(cost.shards)) {
			souls.addSouls(cost.souls);
			return { success: false, message: `Need ${cost.souls} Dragon Souls and ${cost.shards} Dragon Shards.` };
		}
		itemSnacks.resetSnackPrices?.();
		setSnackResetCount(prev => prev + 1);
		setSnackResetUsedThisAscension(true);
		return { success: true };
	};

	const ascend = () => {
		if (!canAscend()) {
			const firstMissing = getAscensionRequirements().find(requirement => !requirement.met);
			return { success: false, message: firstMissing?.label ?? 'Ascension requirements are not met.' };
		}

		const rewards = getAscensionRewards();
		souls.addSouls(rewards.souls);
		shards.addShards(rewards.shards);
		coins.resetCoins?.();
		coins.markAscended?.();
		itemEconomy.resetAfterAscension?.();
		itemSnacks.addCustomEffect?.({
			sourceItemId: 'status_ascension_sickness',
			name: `Ascension Sickness ${ascensionCount + 1}`,
			healthPerDay: -15,
			days: 7 + ascensionCount,
			effectTag: 'ascension_sickness',
			protectedEffect: true,
		});
		population.addPopulation(1_000_000);
		setAscensionCount(prev => prev + 1);
		setLastAscensionDate(getTodayKey());
		setSnackResetUsedThisAscension(false);

		return { success: true, rewards };
	};

	return (
		<AscensionContext.Provider
			value={{
				ascensionCount,
				lastAscensionDate,
				snackResetUsedThisAscension,
				getAscensionRequirements,
				canAscend,
				getAscensionRewards,
				ascend,
				getSoulConverterCost,
				convertSoulToShard,
				getSoulRespecCost,
				respecSoulMultipliers,
				getSnackResetCost,
				resetSnackMarket,
			}}>
			{children}
		</AscensionContext.Provider>
	);
}

export function useAscension() {
	const context = useContext(AscensionContext);
	if (!context) {
		throw new Error('useAscension must be used within AscensionProvider');
	}
	return context;
}
