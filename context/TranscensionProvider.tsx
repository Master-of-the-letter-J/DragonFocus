import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonEmbers } from '@/context/DragonEmbersProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { DRACONIAN_MULTIPLIER_DATA, type DraconianMultiplierDefinition } from '@/data/draconian-multiplier-data';
import React, { ReactNode, createContext, useContext, useEffect } from 'react';

interface TranscensionRequirement {
	label: string;
	met: boolean;
}

interface TranscensionPreview {
	embersEarned: number;
	permanentMaxFuryGain: number;
}

interface TranscensionState {
	transcensionCount: number;
	transcensionUnlocked: boolean;
	draconianLevels: Record<string, number>;
	draconianRespecUnlocked: boolean;
	ascensionSicknessResetUnlocked: boolean;
	ascensionSicknessResetReady: boolean;
	ascensionSicknessResetUsedThisTranscension: boolean;
	deathCountAtLastTranscension: number;
}

interface TranscensionContextType {
	transcensionCount: number;
	transcensionUnlocked: boolean;
	draconianLevels: Record<string, number>;
	getTranscensionUnlockCost: () => number;
	unlockTranscension: () => { success: boolean; message?: string };
	estimateDragonEmbers: (totalSoulsEarned: number) => number;
	getRequiredDeathsForNextTranscension: () => number;
	getDeathsSinceLastTranscension: () => number;
	getTranscensionRequirements: () => TranscensionRequirement[];
	canTranscend: () => boolean;
	getTranscensionPreview: () => TranscensionPreview;
	transcend: () => { success: boolean; message?: string; preview?: TranscensionPreview };
	getDraconianCost: (id: string) => number;
	buyDraconianMultiplier: (id: string) => { success: boolean; message?: string; cost: number };
	getDraconianDefinitions: () => DraconianMultiplierDefinition[];
	getSurveyDuplicationMultiplier: () => number;
	getAscensionShardMultiplier: () => number;
	getAscensionSicknessDivisor: () => number;
	getPermanentMaxFuryBonus: () => number;
	getPopulationGrowthBonus: () => number;
	getDraconianRefundTotal: () => number;
	unlockDraconianRespec: () => { success: boolean; message?: string };
	respecDraconianMultipliers: () => { success: boolean; message?: string; refundedEmbers?: number };
	unlockAscensionSicknessReset: () => { success: boolean; message?: string };
	resetAscensionSicknessTime: () => { success: boolean; message?: string };
	consumeAscensionSicknessReset: () => boolean;
}

const INITIAL_TRANSCENSION_STATE: TranscensionState = {
	transcensionCount: 0,
	transcensionUnlocked: false,
	draconianLevels: {},
	draconianRespecUnlocked: false,
	ascensionSicknessResetUnlocked: false,
	ascensionSicknessResetReady: false,
	ascensionSicknessResetUsedThisTranscension: false,
	deathCountAtLastTranscension: 0,
};

const TranscensionContext = createContext<TranscensionContextType | undefined>(undefined);

const TRANSCENSION_UNLOCK_COST = 100;
const TRANSCENSION_BASE_DEATH_REQUIREMENT = 1_000_000_000;
const DRACONIAN_RESPEC_UNLOCK_COST = 5;
const ASCENSION_SICKNESS_RESET_UNLOCK_COST = 50;
const DRACONIAN_RESPEC_SHARD_COST = 50;
const ASCENSION_SICKNESS_RESET_SHARD_COST = 500;

export function TranscensionProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const souls = useDragonSouls();
	const scarLevel = useScarLevel();
	const population = usePopulation();
	const coins = useDragonCoins();
	const embers = useDragonEmbers();
	const shards = useShards();
	const fury = useFury();
	const itemSnacks = useItemSnacks();
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.transcension, INITIAL_TRANSCENSION_STATE);

	const estimateDragonEmbers = (totalSoulsEarned: number) => {
		return Math.max(0, Math.floor(Math.sqrt(Math.max(0, totalSoulsEarned))));
	};

	const getRequiredDeathsForNextTranscension = () => {
		return TRANSCENSION_BASE_DEATH_REQUIREMENT * Math.pow(10, Math.min(state.transcensionCount, 20));
	};

	const getDeathsSinceLastTranscension = () => {
		return Math.max(0, population.deathCount - state.deathCountAtLastTranscension);
	};

	const getTranscensionUnlockCost = () => TRANSCENSION_UNLOCK_COST;

	const unlockTranscension = () => {
		if (state.transcensionUnlocked) return { success: true };
		if (scarLevel.currentScarLevel < 8) return { success: false, message: 'Reach Scar Level 8 to unlock transcension.' };
		if (!coins.spendCoins(TRANSCENSION_UNLOCK_COST)) {
			return { success: false, message: `Need ${TRANSCENSION_UNLOCK_COST} coins to unlock transcension.` };
		}

		setState(current => ({
			...current,
			transcensionUnlocked: true,
		}));
		return { success: true };
	};

	const getPermanentMaxFuryBonus = () => {
		const draconianBonus = (state.draconianLevels.draconian_max_fury ?? 0) * 25;
		return embers.totalEmbersEarned + draconianBonus;
	};

	const getSurveyDuplicationMultiplier = () => Math.pow(2, state.draconianLevels.draconian_survey_duplication ?? 0);
	const getAscensionShardMultiplier = () => Math.pow(2, state.draconianLevels.draconian_ascension_multiplier ?? 0);
	const getAscensionSicknessDivisor = () => Math.max(1, Math.pow(2, state.draconianLevels.draconian_ascension_charm ?? 0));
	const getPopulationGrowthBonus = () => (state.draconianLevels.draconian_eternal_growth ?? 0) * 0.01;

	const getTranscensionPreview = () => {
		const embersEarned = estimateDragonEmbers(souls.getTotalSoulsEarned());
		return {
			embersEarned,
			permanentMaxFuryGain: embersEarned,
		};
	};

	const getTranscensionRequirements = (): TranscensionRequirement[] => {
		const preview = getTranscensionPreview();
		const deathsSinceLastTranscension = getDeathsSinceLastTranscension();
		const requiredDeaths = getRequiredDeathsForNextTranscension();

		return [
			{ label: `Transcension is unlocked (${state.transcensionUnlocked ? 'yes' : `unlock for ${TRANSCENSION_UNLOCK_COST} coins`})`, met: state.transcensionUnlocked },
			{ label: `Dragon is Juvenile or older (${dragon.age}/30 days)`, met: dragon.age >= 30 },
			{ label: `Scar Level 8 or higher (current: ${scarLevel.currentScarLevel})`, met: scarLevel.currentScarLevel >= 8 },
			{
				label: `Deaths since last transcension meet the ritual requirement (${deathsSinceLastTranscension}/${requiredDeaths})`,
				met: deathsSinceLastTranscension >= requiredDeaths,
			},
			{
				label: `At least 1 Dragon Ember would be earned from lifetime Dragon Souls (current preview: ${preview.embersEarned})`,
				met: preview.embersEarned >= 1,
			},
		];
	};

	const canTranscend = () => getTranscensionRequirements().every(requirement => requirement.met);

	const transcend = () => {
		if (!canTranscend()) {
			const firstMissing = getTranscensionRequirements().find(requirement => !requirement.met);
			return { success: false, message: firstMissing?.label ?? 'Transcension requirements are not met.' };
		}

		const preview = getTranscensionPreview();
		embers.earnEmbers(preview.embersEarned);
		setState(current => ({
			...current,
			transcensionCount: current.transcensionCount + 1,
			ascensionSicknessResetUsedThisTranscension: false,
			ascensionSicknessResetReady: false,
			deathCountAtLastTranscension: population.deathCount,
		}));

		fury.addFury(55);
		itemSnacks.addCustomEffect?.({
			sourceItemId: 'status_transcension_fury_x',
			name: 'Transcension Fury X',
			furyPerDay: 50 / 7,
			days: 7,
			effectTag: 'transcension_fury_x',
		});
		itemSnacks.addCustomEffect?.({
			sourceItemId: 'status_transcension_fury_i',
			name: 'Transcension Fury I',
			furyPerDay: 5 / 30,
			days: 30,
			effectTag: 'transcension_fury_i',
		});

		return { success: true, preview };
	};

	const getDraconianDefinitions = () => DRACONIAN_MULTIPLIER_DATA;

	const getDraconianCost = (id: string) => {
		const definition = DRACONIAN_MULTIPLIER_DATA.find(item => item.id === id);
		if (!definition) return 0;
		const owned = state.draconianLevels[id] ?? 0;
		return Math.max(1, Math.floor(definition.emberCost * Math.pow(definition.emberGrowth, owned)));
	};

	const buyDraconianMultiplier = (id: string) => {
		const cost = getDraconianCost(id);
		if (cost <= 0) return { success: false, message: 'Multiplier not found.', cost: 0 };
		if (!embers.spendEmbers(cost)) return { success: false, message: `Need ${cost} Dragon Embers.`, cost };

		setState(current => ({
			...current,
			draconianLevels: {
				...current.draconianLevels,
				[id]: (current.draconianLevels[id] ?? 0) + 1,
			},
		}));
		return { success: true, cost };
	};

	const getDraconianRefundTotal = () => {
		return DRACONIAN_MULTIPLIER_DATA.reduce((sum, item) => {
			const owned = state.draconianLevels[item.id] ?? 0;
			if (owned <= 0) return sum;

			let totalCost = 0;
			for (let index = 0; index < owned; index += 1) {
				totalCost += Math.max(1, Math.floor(item.emberCost * Math.pow(item.emberGrowth, index)));
			}

			return sum + totalCost;
		}, 0);
	};

	const unlockDraconianRespec = () => {
		if (state.draconianRespecUnlocked) return { success: true };
		if (!embers.spendEmbers(DRACONIAN_RESPEC_UNLOCK_COST)) {
			return { success: false, message: `Need ${DRACONIAN_RESPEC_UNLOCK_COST} Dragon Embers to unlock draconian respec.` };
		}

		setState(current => ({
			...current,
			draconianRespecUnlocked: true,
		}));
		return { success: true };
	};

	const respecDraconianMultipliers = () => {
		if (!state.draconianRespecUnlocked) {
			return { success: false, message: 'Unlock draconian respec first.' };
		}

		const refund = getDraconianRefundTotal();
		if (refund <= 0) return { success: false, message: 'No draconian multipliers are owned.' };
		if (!shards.spendShards(DRACONIAN_RESPEC_SHARD_COST)) {
			return { success: false, message: `Need ${DRACONIAN_RESPEC_SHARD_COST} Dragon Shards.` };
		}

		setState(current => ({
			...current,
			draconianLevels: {},
		}));
		embers.restoreEmbers(refund);
		return { success: true, refundedEmbers: refund };
	};

	const unlockAscensionSicknessReset = () => {
		if (state.ascensionSicknessResetUnlocked) return { success: true };
		if (!embers.spendEmbers(ASCENSION_SICKNESS_RESET_UNLOCK_COST)) {
			return { success: false, message: `Need ${ASCENSION_SICKNESS_RESET_UNLOCK_COST} Dragon Embers to unlock ascension sickness resets.` };
		}

		setState(current => ({
			...current,
			ascensionSicknessResetUnlocked: true,
		}));
		return { success: true };
	};

	const resetAscensionSicknessTime = () => {
		if (!state.ascensionSicknessResetUnlocked) {
			return { success: false, message: 'Unlock ascension sickness resets first.' };
		}
		if (state.transcensionCount <= 0) {
			return { success: false, message: 'Transcend at least once before using this reset.' };
		}
		if (state.ascensionSicknessResetUsedThisTranscension || state.ascensionSicknessResetReady) {
			return { success: false, message: 'Ascension sickness has already been reset during this transcension.' };
		}
		if (!shards.spendShards(ASCENSION_SICKNESS_RESET_SHARD_COST)) {
			return { success: false, message: `Need ${ASCENSION_SICKNESS_RESET_SHARD_COST} Dragon Shards.` };
		}

		setState(current => ({
			...current,
			ascensionSicknessResetReady: true,
			ascensionSicknessResetUsedThisTranscension: true,
		}));
		return { success: true };
	};

	const consumeAscensionSicknessReset = () => {
		if (!state.ascensionSicknessResetReady) return false;

		setState(current => ({
			...current,
			ascensionSicknessResetReady: false,
		}));
		return true;
	};

	useEffect(() => {
		fury.setMaxFuryBonus(getPermanentMaxFuryBonus());
	}, [embers.totalEmbersEarned, fury, state.draconianLevels]);

	useEffect(() => {
		population.setExternalGrowthBonus(getPopulationGrowthBonus());
	}, [population, state.draconianLevels]);

	return (
		<TranscensionContext.Provider
			value={{
				transcensionCount: state.transcensionCount,
				transcensionUnlocked: state.transcensionUnlocked,
				draconianLevels: state.draconianLevels,
				getTranscensionUnlockCost,
				unlockTranscension,
				estimateDragonEmbers,
				getRequiredDeathsForNextTranscension,
				getDeathsSinceLastTranscension,
				getTranscensionRequirements,
				canTranscend,
				getTranscensionPreview,
				transcend,
				getDraconianCost,
				buyDraconianMultiplier,
				getDraconianDefinitions,
				getSurveyDuplicationMultiplier,
				getAscensionShardMultiplier,
				getAscensionSicknessDivisor,
				getPermanentMaxFuryBonus,
				getPopulationGrowthBonus,
				getDraconianRefundTotal,
				unlockDraconianRespec,
				respecDraconianMultipliers,
				unlockAscensionSicknessReset,
				resetAscensionSicknessTime,
				consumeAscensionSicknessReset,
			}}>
			{children}
		</TranscensionContext.Provider>
	);
}

export function useTranscension() {
	const context = useContext(TranscensionContext);
	if (!context) {
		throw new Error('useTranscension must be used within TranscensionProvider');
	}
	return context;
}
