import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useTranscension } from '@/context/TranscensionProvider';
import React, { ReactNode, createContext, useContext, useMemo } from 'react';

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

interface AscensionState {
	ascensionCount: number;
	lastAscensionDate: string | null;
	soulConversions: number;
	snackResetCount: number;
	snackResetUsedThisAscension: boolean;
	ascensionUnlocked: boolean;
}

interface AscensionContextType {
	ascensionCount: number;
	lastAscensionDate: string | null;
	snackResetUsedThisAscension: boolean;
	ascensionUnlocked: boolean;
	getAscensionUnlockCost: () => number;
	unlockAscension: () => { success: boolean; message?: string };
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

const INITIAL_ASCENSION_STATE: AscensionState = {
	ascensionCount: 0,
	lastAscensionDate: null,
	soulConversions: 0,
	snackResetCount: 0,
	snackResetUsedThisAscension: false,
	ascensionUnlocked: false,
};

const AscensionContext = createContext<AscensionContextType | undefined>(undefined);
const ASCENSION_UNLOCK_COST = 50;
const DEFAULT_ASCENSION_SICKNESS_DAYS = 7;

export function AscensionProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const scarLevel = useScarLevel();
	const population = usePopulation();
	const coins = useDragonCoins();
	const shards = useShards();
	const souls = useDragonSouls();
	const itemEconomy = useItemEconomy();
	const itemSnacks = useItemSnacks();
	const transcension = useTranscension();
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.ascension, INITIAL_ASCENSION_STATE);

	const getTodayKey = useMemo(() => () => new Date().toISOString().split('T')[0], []);

	const hasAscensionSickness = () => itemSnacks.activeEffects.some(effect => effect.effectTag === 'ascension_sickness' && effect.endsAtMs > Date.now());
	const getAscensionUnlockCost = () => ASCENSION_UNLOCK_COST;

	const unlockAscension = () => {
		if (state.ascensionUnlocked) return { success: true };
		if (scarLevel.currentScarLevel < 4) return { success: false, message: 'Reach Scar Level 4 to unlock ascension.' };
		if (!coins.spendCoins(ASCENSION_UNLOCK_COST)) {
			return { success: false, message: `Need ${ASCENSION_UNLOCK_COST} coins to unlock ascension.` };
		}

		setState(current => ({
			...current,
			ascensionUnlocked: true,
		}));
		return { success: true };
	};

	const getAscensionRewards = (): AscensionRewards => {
		const generatorsSacrificed = itemEconomy.getOwnedTotalByType?.('generator') ?? 0;
		const clickersSacrificed = itemEconomy.getOwnedTotalByType?.('clicker') ?? 0;
		const coinsBanked = Math.max(0, Math.floor(coins.getCoinsSinceLastAscension?.() ?? coins.getCoins?.() ?? 0));
		const soulReward = Math.max(0, Math.floor(Math.pow(coinsBanked, 0.75)));
		const baseShardReward = Math.max(0, Math.floor(Math.sqrt(coinsBanked) / 25) + generatorsSacrificed + clickersSacrificed);
		const shardReward = Math.max(0, Math.floor(baseShardReward * transcension.getAscensionShardMultiplier()));

		return {
			souls: soulReward,
			shards: shardReward,
			coinsBanked,
			generatorsSacrificed,
			clickersSacrificed,
		};
	};

	const getAscensionRequirements = (): AscensionRequirement[] => [
		{ label: `Ascension is unlocked (${state.ascensionUnlocked ? 'yes' : `unlock for ${ASCENSION_UNLOCK_COST} coins`})`, met: state.ascensionUnlocked },
		{ label: `Dragon is Dragonet or older (${dragon.age}/20 days)`, met: dragon.age >= 20 },
		{ label: `Scar Level 4 or higher (current: ${scarLevel.currentScarLevel})`, met: scarLevel.currentScarLevel >= 4 },
		{ label: 'Dragon is alive', met: dragon.dragonState === 'alive' },
		{ label: 'Ascension sickness is not active', met: !hasAscensionSickness() },
	];

	const canAscend = () => getAscensionRequirements().every(requirement => requirement.met);

	const getSoulConverterCost = () => {
		return Math.max(1, Math.floor(Math.pow(1.02, state.soulConversions)));
	};

	const convertSoulToShard = () => {
		const cost = getSoulConverterCost();
		if (!souls.spendSouls(cost)) {
			return { success: false, message: `Need ${cost} Dragon Souls.`, cost };
		}

		shards.addShards(1);
		setState(current => ({
			...current,
			soulConversions: current.soulConversions + 1,
		}));
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
		souls: Math.max(1000, Math.floor(1000 * Math.pow(1000, state.snackResetCount))),
		shards: 100,
	});

	const resetSnackMarket = () => {
		if (state.snackResetUsedThisAscension) {
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
		setState(current => ({
			...current,
			snackResetCount: current.snackResetCount + 1,
			snackResetUsedThisAscension: true,
		}));
		return { success: true };
	};

	const ascend = () => {
		if (!canAscend()) {
			const firstMissing = getAscensionRequirements().find(requirement => !requirement.met);
			return { success: false, message: firstMissing?.label ?? 'Ascension requirements are not met.' };
		}

		const rewards = getAscensionRewards();
		const usedSicknessReset = transcension.consumeAscensionSicknessReset();
		const baseSicknessDays = usedSicknessReset ? DEFAULT_ASCENSION_SICKNESS_DAYS : DEFAULT_ASCENSION_SICKNESS_DAYS + state.ascensionCount;
		const sicknessDivisor = transcension.getAscensionSicknessDivisor();

		souls.awardAscensionSouls(rewards.souls);
		shards.addShards(rewards.shards);
		coins.resetCoins?.();
		coins.markAscended?.();
		itemEconomy.resetAfterAscension?.();
		itemSnacks.addCustomEffect?.({
			sourceItemId: 'status_ascension_sickness',
			name: `Ascension Sickness ${state.ascensionCount + 1}`,
			healthPerDay: -15,
			days: Math.max(1, Math.ceil(baseSicknessDays / sicknessDivisor)),
			effectTag: 'ascension_sickness',
			protectedEffect: true,
		});
		population.addPopulation(1_000_000);
		setState(current => ({
			...current,
			ascensionCount: current.ascensionCount + 1,
			lastAscensionDate: getTodayKey(),
			snackResetUsedThisAscension: false,
		}));

		return { success: true, rewards };
	};

	return (
		<AscensionContext.Provider
			value={{
				ascensionCount: state.ascensionCount,
				lastAscensionDate: state.lastAscensionDate,
				snackResetUsedThisAscension: state.snackResetUsedThisAscension,
				ascensionUnlocked: state.ascensionUnlocked,
				getAscensionUnlockCost,
				unlockAscension,
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
