import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export type ItemType = 'snack' | 'cosmetic' | 'generator' | 'clicker' | 'theme';

export interface ShopItem {
	id: string;
	name: string;
	type: ItemType;
	price: number;
	priceGrowth?: number;
	description?: string;
	scarLevelRequired?: number;
	requiresShards?: number;
}

type QueueGroup = 'survey' | 'generator' | 'clicker' | 'jeopardy';

export interface ActiveEffect {
	id: string;
	sourceItemId: string;
	name: string;
	startsAtMs: number;
	endsAtMs: number;
	queueGroup?: QueueGroup;
	surveyMultiplier?: number;
	generatorMultiplier?: number;
	clickerMultiplier?: number;
	jeopardyMultiplier?: number;
	furyPerDay?: number;
	healthPerDay?: number;
}

export interface IdleSummary {
	elapsedSeconds: number;
	coins: number;
	fireXp: number;
	shards: number;
	furyEarned: number;
	furyLost: number;
	furyTotal: number;
	healthEarned: number;
	healthLost: number;
	healthTotal: number;
}

export interface SnackUseToast {
	name: string;
	topEffect: string;
}

export interface EffectDisplayEntry {
	id: string;
	name: string;
	topEffect: string;
	remainingSeconds: number;
	startsInSeconds: number;
	strength: number;
}

type EffectSnapshot = {
	surveyMultiplier: number;
	generatorMultiplier: number;
	clickerMultiplier: number;
	jeopardyMultiplier: number;
	furyPerDay: number;
	healthPerDay: number;
};

type SimResult = {
	coins: number;
	fireXp: number;
	shards: number;
	furyDelta: number;
	healthDelta: number;
};

interface ItemsContextType {
	shopItems: ShopItem[];
	ownedItems: Record<string, number>;
	purchaseItem: (id: string) => boolean;
	useItem: (id: string) => boolean;
	addItemToInventory: (id: string, qty?: number) => void;
	sellItem: (id: string) => boolean;
	processDailyPayouts: () => number;
	processDragonClick: () => number;
	getClickReward: () => number;
	getItemCoinCost: (id: string) => number;
	getItemShardCost: (id: string) => number;
	getGeneratorProductionPerDay: (id: string) => number;
	getTotalGeneratorProductionPerDay: () => number;
	activeEffects: ActiveEffect[];
	getActiveCoinMultiplier: () => number;
	getActiveJeopardyMultiplier: () => number;
	getSurveyMultiplier: () => number;
	getGeneratorMultiplier: () => number;
	getClickerMultiplier: () => number;
	getEffectDisplayList: () => EffectDisplayEntry[];
	pendingIdleSummary: IdleSummary | null;
	consumeIdleSummary: () => void;
	snackToast: SnackUseToast | null;
	consumeSnackToast: () => void;
	resetInventory: () => void;
}

interface RuntimeStats {
	yang: number;
	yin: number;
	shards: number;
	scarLevel: number;
	streak: number;
	age: number;
	population: number;
	destroyedPopulation: number;
	premium: boolean;
	antiTreasuryCount: number;
	totalGeneratorCount: number;
}

type GeneratorId =
	| 'gen_treasury'
	| 'gen_forge'
	| 'gen_freezer'
	| 'gen_dragon_nft'
	| 'gen_anti_treasury'
	| 'gen_black_hole'
	| 'gen_golden_saddle'
	| 'gen_dragon_anti_charm'
	| 'gen_dragon_charm'
	| 'gen_coin_fountain'
	| 'gen_ultimate_dragon_bracelet'
	| 'gen_big_stick';

const ItemsProviderContext = React.createContext<ItemsContextType | undefined>(undefined);

export const useItems = () => {
	const context = useContext(ItemsProviderContext);
	if (!context) throw new Error('useItems must be used within ItemsProvider');
	return context;
};

const DAY_SECONDS = 86400;
const DAY_MS = DAY_SECONDS * 1000;

const round2 = (value: number) => Math.round(value * 100) / 100;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const makeEffectId = () => `effect_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const GENERATOR_IDS: GeneratorId[] = [
	'gen_treasury',
	'gen_forge',
	'gen_freezer',
	'gen_dragon_nft',
	'gen_anti_treasury',
	'gen_black_hole',
	'gen_golden_saddle',
	'gen_dragon_anti_charm',
	'gen_dragon_charm',
	'gen_coin_fountain',
	'gen_ultimate_dragon_bracelet',
	'gen_big_stick',
];

const SHOP_ITEMS: ShopItem[] = [
	{ id: 'gen_treasury', name: 'Treasury', type: 'generator', price: 5, priceGrowth: 1.08, scarLevelRequired: 3, requiresShards: 1, description: '+1 Coins/Day * Multiplier' },
	{ id: 'gen_forge', name: 'Forge', type: 'generator', price: 10, priceGrowth: 1.12, scarLevelRequired: 4, requiresShards: 1, description: '+(2 + Yang/50) Coins/Day * Multiplier' },
	{ id: 'gen_freezer', name: 'Freezer', type: 'generator', price: 10, priceGrowth: 1.12, scarLevelRequired: 4, requiresShards: 1, description: '+(2 + Yin/50) Coins/Day * Multiplier' },
	{ id: 'gen_dragon_nft', name: 'Dragon NFT', type: 'generator', price: 15, priceGrowth: 1.16, scarLevelRequired: 4, requiresShards: 1, description: '+(3 + Streak/30) Coins/Day * Multiplier' },
	{ id: 'gen_anti_treasury', name: 'Anti-Treasury', type: 'generator', price: 20, priceGrowth: 1.2, scarLevelRequired: 5, requiresShards: 1, description: '+(4 + Anti-Treasury #), reduces other generation by 1' },
	{ id: 'gen_black_hole', name: 'Black Hole', type: 'generator', price: 25, priceGrowth: 1.14, scarLevelRequired: 5, requiresShards: 1, description: '+(5 + Scar Level) Coins/Day * Multiplier' },
	{ id: 'gen_golden_saddle', name: 'Golden Saddle', type: 'generator', price: 30, priceGrowth: 1.3, scarLevelRequired: 6, requiresShards: 1, description: '+(6 + Age/10) Coins/Day * Multiplier' },
	{ id: 'gen_dragon_anti_charm', name: 'Dragon Anti-Charm', type: 'generator', price: 35, priceGrowth: 1.1, scarLevelRequired: 7, requiresShards: 1, description: '+(7 + log10(Pop. Destroyed)) Coins/Day * Multiplier' },
	{ id: 'gen_dragon_charm', name: 'Dragon Charm', type: 'generator', price: 40, priceGrowth: 1.1, scarLevelRequired: 7, requiresShards: 1, description: '+(8 + log10(Pop)) Coins/Day * Multiplier' },
	{ id: 'gen_coin_fountain', name: 'Coin Fountain', type: 'generator', price: 45, priceGrowth: 1.08, scarLevelRequired: 8, requiresShards: 1, description: '+9 Coins/Day * Multiplier' },
	{ id: 'gen_ultimate_dragon_bracelet', name: 'Ultimate Dragon Bracelet', type: 'generator', price: 50, priceGrowth: 1.18, scarLevelRequired: 9, requiresShards: 1, description: '+(10 + Building #) Coins/Day * Multiplier' },
	{ id: 'gen_big_stick', name: 'Big Stick', type: 'generator', price: 100, priceGrowth: 1.05, scarLevelRequired: 10, requiresShards: 1, description: '+10 Coins/Day * (Multiplier^2)' },

	{ id: 'click_dragon_clicks', name: 'Dragon Clicks', type: 'clicker', price: 10, priceGrowth: 1.15, scarLevelRequired: 3, requiresShards: 1, description: 'Each gives +0.01 Coins per click' },
	{ id: 'click_age_multiplier', name: 'Dragon Age Multiplier', type: 'clicker', price: 10, priceGrowth: 10, scarLevelRequired: 5, requiresShards: 1, description: 'Each multiplies Dragon Clicks by +0.01*Age' },
	{ id: 'click_demonic_clicks', name: 'Demonic Dragon Clicks', type: 'clicker', price: 100, priceGrowth: 1.2, scarLevelRequired: 7, requiresShards: 1, description: 'Each gives +0.001% of generation/day per click' },
	{ id: 'click_mega_clicks', name: 'Mega-Dragon Clicks', type: 'clicker', price: 1000, priceGrowth: 1.1, scarLevelRequired: 9, requiresShards: 1, description: 'Each gives +0.1 Coins per click' },

	{ id: 'snack_survey_double_1d', name: 'Double Survey Booster', type: 'snack', price: 40, scarLevelRequired: 1, description: 'x2 Survey rewards for 1 day' },
	{ id: 'snack_survey_triple_3d', name: 'Triple Survey Booster', type: 'snack', price: 120, scarLevelRequired: 1, description: 'x3 Survey rewards for 3 days' },
	{ id: 'snack_survey_quad_7d', name: 'Quad Survey Booster', type: 'snack', price: 300, scarLevelRequired: 1, description: 'x4 Survey rewards for 7 days' },
	{ id: 'snack_mood_space', name: 'Space Nuggets', type: 'snack', price: 25, scarLevelRequired: 2, description: 'Random Fury -25 to +25' },
	{ id: 'snack_mood_chill', name: 'Chill Nuggets', type: 'snack', price: 20, scarLevelRequired: 2, description: 'Random Fury -15 to -10' },
	{ id: 'snack_mood_explosive', name: 'Explosive Nuggets', type: 'snack', price: 15, scarLevelRequired: 2, description: 'Random Fury +10 to +15' },
	{ id: 'snack_therapy_10d', name: 'Therapy Nuggets', type: 'snack', price: 80, scarLevelRequired: 2, description: '-10 Fury/day for 10 days' },
	{ id: 'snack_health_chocolate', name: 'Health Chocolate', type: 'snack', price: 30, scarLevelRequired: 3, description: '+10 Health' },
	{ id: 'snack_super_health_chocolate', name: 'Super Health Chocolate', type: 'snack', price: 80, scarLevelRequired: 3, description: '+15 to +25 Health' },
	{ id: 'snack_dark_chocolate', name: 'Dark Chocolate', type: 'snack', price: 50, scarLevelRequired: 3, description: '-10 or +20 Health' },
	{ id: 'snack_white_chocolate', name: 'White Chocolate', type: 'snack', price: 55, scarLevelRequired: 3, description: '-10 to +20 Health' },
	{ id: 'snack_regen_10hp_10d', name: 'Regen Snack +10', type: 'snack', price: 90, scarLevelRequired: 3, description: '+10 Health/day for 10 days' },
	{ id: 'snack_regen_20hp_10d', name: 'Regen Snack +20', type: 'snack', price: 170, scarLevelRequired: 3, description: '+20 Health/day for 10 days' },
	{ id: 'snack_regen_50hp_10d', name: 'Regen Snack +50', type: 'snack', price: 400, scarLevelRequired: 3, description: '+50 Health/day for 10 days' },
	{ id: 'snack_regen_100hp_10d', name: 'Regen Snack +100', type: 'snack', price: 900, scarLevelRequired: 3, description: '+100 Health/day for 10 days' },
	{ id: 'snack_bipolar_10d', name: 'Bipolar Mood Nuggets', type: 'snack', price: 70, scarLevelRequired: 4, description: 'Random Fury/day (-20 to +10) for 10 days' },
	{ id: 'snack_jeopardy_double_1d', name: 'Double Jeopardy Snack', type: 'snack', price: 60, scarLevelRequired: 4, description: 'x2 question gains/losses for 1 day' },
	{ id: 'snack_jeopardy_triple_3d', name: 'Triple Jeopardy Snack', type: 'snack', price: 180, scarLevelRequired: 4, description: 'x3 question gains/losses for 3 days' },
	{ id: 'snack_jeopardy_quad_7d', name: 'Quad Jeopardy Snack', type: 'snack', price: 360, scarLevelRequired: 4, description: 'x4 question gains/losses for 7 days' },
	{ id: 'snack_anti_coin_1d', name: 'Anti-Coin Booster', type: 'snack', price: 120, scarLevelRequired: 6, description: 'Generator x0.5 and Survey x2 for 1 day' },
	{ id: 'snack_anti_coin_3d', name: 'Anti-Coin Booster+', type: 'snack', price: 310, scarLevelRequired: 6, description: 'Generator x0.5 and Survey x2 for 3 days' },
	{ id: 'snack_anti_coin_7d', name: 'Anti-Coin Booster++', type: 'snack', price: 700, scarLevelRequired: 6, description: 'Generator x0.5 and Survey x2 for 7 days' },
	{ id: 'snack_gen_double_1d', name: 'Double Generator Booster', type: 'snack', price: 180, scarLevelRequired: 6, requiresShards: 1, description: 'Generator x2 for 1 day' },
	{ id: 'snack_gen_triple_3d', name: 'Triple Generator Booster', type: 'snack', price: 540, scarLevelRequired: 6, requiresShards: 3, description: 'Generator x3 for 3 days' },
	{ id: 'snack_gen_quad_7d', name: 'Quad Generator Booster', type: 'snack', price: 1300, scarLevelRequired: 6, requiresShards: 7, description: 'Generator x4 for 7 days' },
	{ id: 'snack_click_double_1d', name: 'Double Clicker Booster', type: 'snack', price: 180, scarLevelRequired: 6, requiresShards: 1, description: 'Clicker x2 for 1 day' },
	{ id: 'snack_click_triple_3d', name: 'Triple Clicker Booster', type: 'snack', price: 540, scarLevelRequired: 6, requiresShards: 3, description: 'Clicker x3 for 3 days' },
	{ id: 'snack_click_quad_7d', name: 'Quad Clicker Booster', type: 'snack', price: 1300, scarLevelRequired: 6, requiresShards: 7, description: 'Clicker x4 for 7 days' },
	{ id: 'snack_ice', name: 'Ice Snack', type: 'snack', price: 90, scarLevelRequired: 8, description: '-20 Fury, -10 Health' },
	{ id: 'snack_fire', name: 'Fire Snack', type: 'snack', price: 40, scarLevelRequired: 8, description: '+10 Fury, +5 Health' },
	{ id: 'snack_ice_injection', name: 'Ice Injection', type: 'snack', price: 280, scarLevelRequired: 8, description: '-100 Fury, then -5 Health/day for 5 days' },
	{ id: 'snack_fire_injection', name: 'Fire Injection', type: 'snack', price: 280, scarLevelRequired: 8, description: '+100 Health, then +20 Fury/day for 5 days' },
	{ id: 'snack_super', name: 'Super Snack', type: 'snack', price: 2400, scarLevelRequired: 10, requiresShards: 10, description: '-10 Fury, +10 Health, and x2 Survey/Generator/Clicker for 10 days' },
	{ id: 'snack_age', name: 'Age Snack', type: 'snack', price: 3000, scarLevelRequired: 10, requiresShards: 10, description: '+1 Dragon Age' },

	{ id: 'cosmetic_shades', name: 'Sunglasses', type: 'cosmetic', price: 90, description: 'Cool sunglasses for your dragon.' },
	{ id: 'cosmetic_crown', name: 'Royal Crown', type: 'cosmetic', price: 1000, description: 'A crown to rule the skies.' },
	{ id: 'theme_dungeon', name: 'Dungeon Theme', type: 'theme', price: 500, description: 'Dark stone walls and torch-lit dungeon atmosphere' },
];

/** @requires DragonCoinsProvider @requires DragonShardsProvider */
export default function ItemsProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const fury = useFury();
	const coins = useDragonCoins();
	const shards = useShards();
	const scarLevel = useScarLevel();
	const premium = usePremium();
	const streak = useStreak();
	const population = usePopulation();

	const shopItems = useMemo(() => SHOP_ITEMS, []);
	const [ownedItems, setOwnedItems] = useState<Record<string, number>>({});
	const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
	const [pendingIdleSummary, setPendingIdleSummary] = useState<IdleSummary | null>(null);
	const [snackToast, setSnackToast] = useState<SnackUseToast | null>(null);

	const ownedItemsRef = useRef(ownedItems);
	const activeEffectsRef = useRef(activeEffects);
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);
	const lastProcessedMsRef = useRef(Date.now());
	const backgroundStartedMsRef = useRef<number | null>(null);

	useEffect(() => {
		ownedItemsRef.current = ownedItems;
	}, [ownedItems]);

	useEffect(() => {
		activeEffectsRef.current = activeEffects;
	}, [activeEffects]);

	const getItemById = useCallback(
		(id: string) => {
			return shopItems.find(item => item.id === id);
		},
		[shopItems]
	);

	const getOwnedCount = useCallback((id: string) => ownedItemsRef.current[id] ?? 0, []);

	const getRuntimeStats = useCallback((): RuntimeStats => {
		const yang = clamp(fury.furyMeter ?? 0, 0, 100);
		const antiTreasuryCount = getOwnedCount('gen_anti_treasury');
		const totalGeneratorCount = GENERATOR_IDS.reduce((sum, id) => sum + getOwnedCount(id), 0);
		return {
			yang,
			yin: 100 - yang,
			shards: Math.max(0, shards.shards ?? 0),
			scarLevel: Math.max(0, scarLevel.currentScarLevel ?? 0),
			streak: Math.max(0, streak.streak ?? 0),
			age: Math.max(0, dragon.age ?? 0),
			population: Math.max(0, population.population ?? 0),
			destroyedPopulation: Math.max(0, population.deathCount ?? 0),
			premium: !!premium.isPremium,
			antiTreasuryCount,
			totalGeneratorCount,
		};
	}, [dragon.age, fury.furyMeter, getOwnedCount, population.deathCount, population.population, premium.isPremium, scarLevel.currentScarLevel, shards.shards, streak.streak]);

	const baseGeneratorPerUnit = useCallback((id: GeneratorId, stats: RuntimeStats) => {
		switch (id) {
			case 'gen_treasury':
				return 1;
			case 'gen_forge':
				return 2 + stats.yang / 50;
			case 'gen_freezer':
				return 2 + stats.yin / 50;
			case 'gen_dragon_nft':
				return 3 + stats.streak / 30;
			case 'gen_anti_treasury':
				return 4 + stats.antiTreasuryCount;
			case 'gen_black_hole':
				return 5 + stats.scarLevel;
			case 'gen_golden_saddle':
				return 6 + stats.age / 10;
			case 'gen_dragon_anti_charm':
				return 7 + Math.log10(Math.max(1, stats.destroyedPopulation));
			case 'gen_dragon_charm':
				return 8 + Math.log10(Math.max(1, stats.population));
			case 'gen_coin_fountain':
				return 9;
			case 'gen_ultimate_dragon_bracelet':
				return 10 + stats.totalGeneratorCount;
			case 'gen_big_stick':
				return 10;
			default:
				return 0;
		}
	}, []);

	const getEffectSnapshotAt = useCallback((atMs: number, sourceEffects: ActiveEffect[] = activeEffectsRef.current): EffectSnapshot => {
		let surveyMultiplier = 1;
		let generatorMultiplier = 1;
		let clickerMultiplier = 1;
		let jeopardyMultiplier = 1;
		let furyPerDay = 0;
		let healthPerDay = 0;

		for (const effect of sourceEffects) {
			if (effect.startsAtMs > atMs || effect.endsAtMs <= atMs) continue;
			if (effect.surveyMultiplier !== undefined) surveyMultiplier *= effect.surveyMultiplier;
			if (effect.generatorMultiplier !== undefined) generatorMultiplier *= effect.generatorMultiplier;
			if (effect.clickerMultiplier !== undefined) clickerMultiplier *= effect.clickerMultiplier;
			if (effect.jeopardyMultiplier !== undefined) jeopardyMultiplier *= effect.jeopardyMultiplier;
			if (effect.furyPerDay !== undefined) furyPerDay += effect.furyPerDay;
			if (effect.healthPerDay !== undefined) healthPerDay += effect.healthPerDay;
		}

		return { surveyMultiplier, generatorMultiplier, clickerMultiplier, jeopardyMultiplier, furyPerDay, healthPerDay };
	}, []);

	const addTimedEffect = useCallback((effect: Omit<ActiveEffect, 'id' | 'startsAtMs' | 'endsAtMs'> & { days: number }) => {
		setActiveEffects(prev => {
			const now = Date.now();
			const cleaned = prev.filter(item => item.endsAtMs > now);
			const durationMs = Math.max(0, effect.days) * DAY_MS;
			if (durationMs <= 0) return cleaned;

			const { days, ...payload } = effect;

			if (payload.queueGroup) {
				const queue = cleaned.filter(item => item.queueGroup === payload.queueGroup);
				const other = cleaned.filter(item => item.queueGroup !== payload.queueGroup);

				const getQueueMultiplier = (item: Partial<ActiveEffect>) => {
					switch (payload.queueGroup) {
						case 'survey':
							return item.surveyMultiplier ?? 1;
						case 'generator':
							return item.generatorMultiplier ?? 1;
						case 'clicker':
							return item.clickerMultiplier ?? 1;
						case 'jeopardy':
							return item.jeopardyMultiplier ?? 1;
					}
				};

				const segments = queue
					.map(item => {
						const remaining = item.endsAtMs - Math.max(now, item.startsAtMs);
						return { sourceItemId: item.sourceItemId, name: item.name, remaining, multiplier: getQueueMultiplier(item) ?? 1 };
					})
					.filter(segment => segment.remaining > 0);

				const newMultiplier = getQueueMultiplier(payload) ?? 1;
				const existing = segments.find(segment => segment.sourceItemId === payload.sourceItemId && segment.multiplier === newMultiplier);
				if (existing) {
					existing.remaining += durationMs;
				} else {
					segments.push({ sourceItemId: payload.sourceItemId, name: payload.name, remaining: durationMs, multiplier: newMultiplier });
				}

				segments.sort((a, b) => b.multiplier - a.multiplier);
				let cursor = now;
				const rebuilt: ActiveEffect[] = segments.map(segment => {
					const startsAtMs = cursor;
					const endsAtMs = startsAtMs + segment.remaining;
					cursor = endsAtMs;
					return {
						id: makeEffectId(),
						sourceItemId: segment.sourceItemId,
						name: segment.name,
						queueGroup: payload.queueGroup,
						startsAtMs,
						endsAtMs,
						surveyMultiplier: payload.queueGroup === 'survey' ? segment.multiplier : undefined,
						generatorMultiplier: payload.queueGroup === 'generator' ? segment.multiplier : undefined,
						clickerMultiplier: payload.queueGroup === 'clicker' ? segment.multiplier : undefined,
						jeopardyMultiplier: payload.queueGroup === 'jeopardy' ? segment.multiplier : undefined,
					};
				});

				return [...other, ...rebuilt];
			}

			const mergeIndex = cleaned.findIndex(item => !item.queueGroup && item.sourceItemId === payload.sourceItemId && item.surveyMultiplier === payload.surveyMultiplier && item.generatorMultiplier === payload.generatorMultiplier && item.clickerMultiplier === payload.clickerMultiplier && item.jeopardyMultiplier === payload.jeopardyMultiplier && item.furyPerDay === payload.furyPerDay && item.healthPerDay === payload.healthPerDay);
			if (mergeIndex >= 0) {
				const next = [...cleaned];
				next[mergeIndex] = { ...next[mergeIndex], endsAtMs: next[mergeIndex].endsAtMs + durationMs };
				return next;
			}

			return [...cleaned, { id: makeEffectId(), ...payload, startsAtMs: now, endsAtMs: now + durationMs }];
		});
	}, []);

	const getItemCoinCost = useCallback((id: string) => {
		const item = getItemById(id);
		if (!item) return 0;
		const growth = item.priceGrowth ?? 1;
		return round2(item.price * Math.pow(growth, getOwnedCount(id)));
	}, [getItemById, getOwnedCount]);

	const getItemShardCost = useCallback((id: string) => {
		const item = getItemById(id);
		if (!item) return 0;
		if (item.type === 'generator' || item.type === 'clicker') return 1;
		return item.requiresShards ?? 0;
	}, [getItemById]);

	const getGeneratorProductionPerDayAt = useCallback((atMs: number, sourceEffects: ActiveEffect[] = activeEffectsRef.current) => {
		const stats = getRuntimeStats();
		const effects = getEffectSnapshotAt(atMs, sourceEffects);
		const multiplier = coins.calculateCoinMultiplier(stats.yang, stats.shards, stats.scarLevel, effects.generatorMultiplier, stats.premium);

		let other = 0;
		let antiTreasury = 0;
		let bigStick = 0;

		for (const id of GENERATOR_IDS) {
			const count = getOwnedCount(id);
			if (count <= 0) continue;
			const raw = baseGeneratorPerUnit(id, stats) * count;
			const boosted = id === 'gen_big_stick' ? raw * multiplier * multiplier : raw * multiplier;

			if (id === 'gen_anti_treasury') antiTreasury += boosted;
			else if (id === 'gen_big_stick') bigStick += boosted;
			else other += boosted;
		}

		return Math.max(0, other - stats.antiTreasuryCount) + antiTreasury + bigStick;
	}, [baseGeneratorPerUnit, coins, getEffectSnapshotAt, getOwnedCount, getRuntimeStats]);

	const getGeneratorProductionPerDay = useCallback((id: string) => {
		if (!GENERATOR_IDS.includes(id as GeneratorId)) return 0;
		const stats = getRuntimeStats();
		const effects = getEffectSnapshotAt(Date.now());
		const multiplier = coins.calculateCoinMultiplier(stats.yang, stats.shards, stats.scarLevel, effects.generatorMultiplier, stats.premium);
		const base = baseGeneratorPerUnit(id as GeneratorId, stats);
		const boosted = id === 'gen_big_stick' ? base * multiplier * multiplier : base * multiplier;
		return round2(Math.max(0, boosted));
	}, [baseGeneratorPerUnit, coins, getEffectSnapshotAt, getRuntimeStats]);

	const getTotalGeneratorProductionPerDay = useCallback(() => {
		return round2(getGeneratorProductionPerDayAt(Date.now()));
	}, [getGeneratorProductionPerDayAt]);

	const getSurveyMultiplier = useCallback(() => getEffectSnapshotAt(Date.now()).surveyMultiplier, [getEffectSnapshotAt]);
	const getGeneratorMultiplier = useCallback(() => getEffectSnapshotAt(Date.now()).generatorMultiplier, [getEffectSnapshotAt]);
	const getClickerMultiplier = useCallback(() => getEffectSnapshotAt(Date.now()).clickerMultiplier, [getEffectSnapshotAt]);
	const getActiveJeopardyMultiplier = useCallback(() => getEffectSnapshotAt(Date.now()).jeopardyMultiplier, [getEffectSnapshotAt]);
	const getActiveCoinMultiplier = useCallback(() => getSurveyMultiplier(), [getSurveyMultiplier]);

	const getClickReward = useCallback(() => {
		const stats = getRuntimeStats();
		const effects = getEffectSnapshotAt(Date.now());

		const clicksOwned = getOwnedCount('click_dragon_clicks');
		const ageOwned = getOwnedCount('click_age_multiplier');
		const demonicOwned = getOwnedCount('click_demonic_clicks');
		const megaOwned = getOwnedCount('click_mega_clicks');

		const baseClickCoins = clicksOwned * 0.01 + megaOwned * 0.1;
		const ageMultiplier = 1 + ageOwned * 0.01 * stats.age;
		const generationPerDay = getGeneratorProductionPerDayAt(Date.now());
		const demonicBonus = demonicOwned * generationPerDay * 0.00001;
		const raw = baseClickCoins * ageMultiplier + demonicBonus;
		if (raw <= 0) return 0;

		const clickMultiplier = coins.calculateCoinMultiplier(stats.yang, stats.shards, stats.scarLevel, effects.clickerMultiplier, stats.premium);
		return round2(raw * clickMultiplier);
	}, [coins, getEffectSnapshotAt, getGeneratorProductionPerDayAt, getOwnedCount, getRuntimeStats]);

	const processDragonClick = useCallback(() => {
		const reward = getClickReward();
		if (reward <= 0) return 0;
		coins.addCoins(reward);
		scarLevel.addXP(coins.calculateFireXP(reward));
		return reward;
	}, [coins, getClickReward, scarLevel]);

	const addItemToInventory = useCallback((id: string, qty = 1) => {
		if (qty <= 0) return;
		setOwnedItems(prev => ({ ...prev, [id]: (prev[id] || 0) + qty }));
	}, []);

	const purchaseItem = useCallback((id: string) => {
		const item = getItemById(id);
		if (!item) return false;
		if ((item.scarLevelRequired ?? 0) > (scarLevel.currentScarLevel ?? 0)) return false;

		const coinCost = getItemCoinCost(id);
		const shardCost = getItemShardCost(id);

		if (!coins.spendCoins(coinCost)) return false;
		if (shardCost > 0 && !shards.spendShards(shardCost)) {
			coins.addCoins(coinCost);
			return false;
		}

		addItemToInventory(id, 1);
		return true;
	}, [addItemToInventory, coins, getItemById, getItemCoinCost, getItemShardCost, scarLevel.currentScarLevel, shards]);

	const sellItem = useCallback((id: string) => {
		const item = getItemById(id);
		if (!item) return false;
		if (item.type !== 'generator' && item.type !== 'clicker') return false;
		const owned = ownedItems[id] ?? 0;
		if (owned <= 0) return false;

		const growth = item.priceGrowth ?? 1;
		const tierCost = item.price * Math.pow(growth, owned - 1);
		const refund = round2(tierCost * 0.75);

		setOwnedItems(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
		shards.addShards(1);
		coins.addCoins(refund);
		return true;
	}, [coins, getItemById, ownedItems, shards]);

	const simulateElapsedSeconds = useCallback((elapsedSeconds: number): SimResult => {
		if (elapsedSeconds <= 0) return { coins: 0, fireXp: 0, shards: 0, furyDelta: 0, healthDelta: 0 };

		const fromMs = lastProcessedMsRef.current;
		const toMs = fromMs + elapsedSeconds * 1000;
		const effects = activeEffectsRef.current;
		const boundaries = [fromMs, toMs];

		for (const effect of effects) {
			if (effect.startsAtMs > fromMs && effect.startsAtMs < toMs) boundaries.push(effect.startsAtMs);
			if (effect.endsAtMs > fromMs && effect.endsAtMs < toMs) boundaries.push(effect.endsAtMs);
		}

		boundaries.sort((a, b) => a - b);
		let coinsDelta = 0;
		let furyDelta = 0;
		let healthDelta = 0;

		for (let index = 0; index < boundaries.length - 1; index += 1) {
			const start = boundaries[index];
			const end = boundaries[index + 1];
			const seconds = (end - start) / 1000;
			if (seconds <= 0) continue;
			const midpoint = start + (end - start) / 2;
			const snapshot = getEffectSnapshotAt(midpoint, effects);
			const generatorPerDay = getGeneratorProductionPerDayAt(midpoint, effects);

			coinsDelta += (generatorPerDay / DAY_SECONDS) * seconds;
			furyDelta += (snapshot.furyPerDay / DAY_SECONDS) * seconds;
			healthDelta += (snapshot.healthPerDay / DAY_SECONDS) * seconds;
		}

		coinsDelta = round2(coinsDelta);
		furyDelta = round2(furyDelta);
		healthDelta = round2(healthDelta);

		let fireXp = 0;
		if (coinsDelta > 0) {
			coins.addCoins(coinsDelta);
			fireXp = round2(coins.calculateFireXP(coinsDelta));
			scarLevel.addXP(fireXp);
		}

		if (furyDelta !== 0) fury.addFury(furyDelta);
		if (healthDelta > 0) dragon.healHp(healthDelta);
		if (healthDelta < 0) dragon.damageHp(Math.abs(healthDelta));

		setActiveEffects(prev => prev.filter(effect => effect.endsAtMs > toMs));
		return { coins: coinsDelta, fireXp, shards: 0, furyDelta, healthDelta };
	}, [coins, dragon, fury, getEffectSnapshotAt, getGeneratorProductionPerDayAt, scarLevel]);

	const processDailyPayouts = useCallback(() => {
		const anchor = Date.now();
		lastProcessedMsRef.current = anchor;
		const result = simulateElapsedSeconds(DAY_SECONDS);
		lastProcessedMsRef.current = anchor;
		return result.coins;
	}, [simulateElapsedSeconds]);

	const useItem = useCallback((id: string) => {
		const item = getItemById(id);
		if (!item || item.type !== 'snack') return false;
		const owned = ownedItems[id] ?? 0;
		if (owned <= 0) return false;

		let topEffect = 'No effect';
		const applyFury = (delta: number) => delta !== 0 && fury.addFury(delta);
		const applyHealth = (delta: number) => {
			if (delta > 0) dragon.healHp(delta);
			if (delta < 0) dragon.damageHp(Math.abs(delta));
		};

		switch (id) {
			case 'snack_survey_double_1d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 1d`, queueGroup: 'survey', surveyMultiplier: 2, days: 1 });
				topEffect = 'Survey x2 for 1 day';
				break;
			case 'snack_survey_triple_3d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 3d`, queueGroup: 'survey', surveyMultiplier: 3, days: 3 });
				topEffect = 'Survey x3 for 3 days';
				break;
			case 'snack_survey_quad_7d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 7d`, queueGroup: 'survey', surveyMultiplier: 4, days: 7 });
				topEffect = 'Survey x4 for 7 days';
				break;

			case 'snack_mood_space': {
				const delta = randInt(-25, 25);
				applyFury(delta);
				topEffect = `Fury ${delta >= 0 ? '+' : ''}${delta}`;
				break;
			}
			case 'snack_mood_chill': {
				const delta = -randInt(10, 15);
				applyFury(delta);
				topEffect = `Fury ${delta}`;
				break;
			}
			case 'snack_mood_explosive': {
				const delta = randInt(10, 15);
				applyFury(delta);
				topEffect = `Fury +${delta}`;
				break;
			}
			case 'snack_therapy_10d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 10d`, furyPerDay: -10, days: 10 });
				topEffect = 'Fury -10/day for 10 days';
				break;

			case 'snack_health_chocolate':
				applyHealth(10);
				topEffect = 'Health +10';
				break;
			case 'snack_super_health_chocolate': {
				const hp = randInt(15, 25);
				applyHealth(hp);
				topEffect = `Health +${hp}`;
				break;
			}
			case 'snack_dark_chocolate': {
				const hp = Math.random() < 0.5 ? -10 : 20;
				applyHealth(hp);
				topEffect = `Health ${hp >= 0 ? '+' : ''}${hp}`;
				break;
			}
			case 'snack_white_chocolate': {
				const hp = randInt(-10, 20);
				applyHealth(hp);
				topEffect = `Health ${hp >= 0 ? '+' : ''}${hp}`;
				break;
			}
			case 'snack_regen_10hp_10d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 10d`, healthPerDay: 10, days: 10 });
				topEffect = 'Health +10/day for 10 days';
				break;
			case 'snack_regen_20hp_10d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 10d`, healthPerDay: 20, days: 10 });
				topEffect = 'Health +20/day for 10 days';
				break;
			case 'snack_regen_50hp_10d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 10d`, healthPerDay: 50, days: 10 });
				topEffect = 'Health +50/day for 10 days';
				break;
			case 'snack_regen_100hp_10d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 10d`, healthPerDay: 100, days: 10 });
				topEffect = 'Health +100/day for 10 days';
				break;

			case 'snack_bipolar_10d': {
				const delta = randInt(-20, 10);
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 10d`, furyPerDay: delta, days: 10 });
				topEffect = `Fury/day ${delta >= 0 ? '+' : ''}${delta}`;
				break;
			}
			case 'snack_jeopardy_double_1d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 1d`, queueGroup: 'jeopardy', jeopardyMultiplier: 2, days: 1 });
				topEffect = 'Jeopardy x2 for 1 day';
				break;
			case 'snack_jeopardy_triple_3d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 3d`, queueGroup: 'jeopardy', jeopardyMultiplier: 3, days: 3 });
				topEffect = 'Jeopardy x3 for 3 days';
				break;
			case 'snack_jeopardy_quad_7d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 7d`, queueGroup: 'jeopardy', jeopardyMultiplier: 4, days: 7 });
				topEffect = 'Jeopardy x4 for 7 days';
				break;

			case 'snack_anti_coin_1d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 1d`, surveyMultiplier: 2, generatorMultiplier: 0.5, days: 1 });
				topEffect = 'Survey x2 and Generator x0.5';
				break;
			case 'snack_anti_coin_3d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 3d`, surveyMultiplier: 2, generatorMultiplier: 0.5, days: 3 });
				topEffect = 'Survey x2 and Generator x0.5';
				break;
			case 'snack_anti_coin_7d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 7d`, surveyMultiplier: 2, generatorMultiplier: 0.5, days: 7 });
				topEffect = 'Survey x2 and Generator x0.5';
				break;
			case 'snack_gen_double_1d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 1d`, queueGroup: 'generator', generatorMultiplier: 2, days: 1 });
				topEffect = 'Generator x2 for 1 day';
				break;
			case 'snack_gen_triple_3d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 3d`, queueGroup: 'generator', generatorMultiplier: 3, days: 3 });
				topEffect = 'Generator x3 for 3 days';
				break;
			case 'snack_gen_quad_7d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 7d`, queueGroup: 'generator', generatorMultiplier: 4, days: 7 });
				topEffect = 'Generator x4 for 7 days';
				break;
			case 'snack_click_double_1d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 1d`, queueGroup: 'clicker', clickerMultiplier: 2, days: 1 });
				topEffect = 'Clicker x2 for 1 day';
				break;
			case 'snack_click_triple_3d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 3d`, queueGroup: 'clicker', clickerMultiplier: 3, days: 3 });
				topEffect = 'Clicker x3 for 3 days';
				break;
			case 'snack_click_quad_7d':
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 7d`, queueGroup: 'clicker', clickerMultiplier: 4, days: 7 });
				topEffect = 'Clicker x4 for 7 days';
				break;

			case 'snack_ice':
				applyFury(-20);
				applyHealth(-10);
				topEffect = 'Fury -20, Health -10';
				break;
			case 'snack_fire':
				applyFury(10);
				applyHealth(5);
				topEffect = 'Fury +10, Health +5';
				break;
			case 'snack_ice_injection':
				applyFury(-100);
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 5d`, healthPerDay: -5, days: 5 });
				topEffect = 'Fury -100 and Health -5/day';
				break;
			case 'snack_fire_injection':
				applyHealth(100);
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 5d`, furyPerDay: 20, days: 5 });
				topEffect = 'Health +100 and Fury +20/day';
				break;
			case 'snack_super':
				applyFury(-10);
				applyHealth(10);
				addTimedEffect({ sourceItemId: id, name: `${item.name}, 10d`, surveyMultiplier: 2, generatorMultiplier: 2, clickerMultiplier: 2, days: 10 });
				topEffect = 'Survey/Generator/Clicker x2';
				break;
			case 'snack_age':
				dragon.incrementAge();
				topEffect = 'Dragon Age +1';
				break;
			default:
				return false;
		}

		setOwnedItems(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
		setSnackToast({ name: item.name, topEffect });
		return true;
	}, [addTimedEffect, dragon, fury, getItemById, ownedItems]);

	const consumeIdleSummary = useCallback(() => setPendingIdleSummary(null), []);
	const consumeSnackToast = useCallback(() => setSnackToast(null), []);

	const getEffectDisplayList = useCallback((): EffectDisplayEntry[] => {
		const now = Date.now();
		return activeEffects
			.filter(effect => effect.endsAtMs > now)
			.map(effect => {
				const startsInSeconds = Math.max(0, Math.ceil((effect.startsAtMs - now) / 1000));
				const remainingSeconds = Math.max(0, Math.ceil((effect.endsAtMs - Math.max(now, effect.startsAtMs)) / 1000));
				const topEffect = effect.surveyMultiplier !== undefined ? `Survey x${round2(effect.surveyMultiplier)}` : effect.generatorMultiplier !== undefined ? `Generator x${round2(effect.generatorMultiplier)}` : effect.clickerMultiplier !== undefined ? `Clicker x${round2(effect.clickerMultiplier)}` : effect.jeopardyMultiplier !== undefined ? `Jeopardy x${round2(effect.jeopardyMultiplier)}` : effect.furyPerDay !== undefined ? `Fury/day ${effect.furyPerDay >= 0 ? '+' : ''}${round2(effect.furyPerDay)}` : effect.healthPerDay !== undefined ? `Health/day ${effect.healthPerDay >= 0 ? '+' : ''}${round2(effect.healthPerDay)}` : 'Effect active';
				const strength = Math.max(Math.abs(effect.surveyMultiplier ?? 0), Math.abs(effect.generatorMultiplier ?? 0), Math.abs(effect.clickerMultiplier ?? 0), Math.abs(effect.jeopardyMultiplier ?? 0), Math.abs(effect.furyPerDay ?? 0) / 10, Math.abs(effect.healthPerDay ?? 0) / 10);
				return { id: effect.id, name: effect.name, topEffect, remainingSeconds, startsInSeconds, strength };
			})
			.sort((a, b) => {
				if (a.startsInSeconds === 0 && b.startsInSeconds > 0) return -1;
				if (a.startsInSeconds > 0 && b.startsInSeconds === 0) return 1;
				if (b.strength !== a.strength) return b.strength - a.strength;
				return a.startsInSeconds - b.startsInSeconds;
			});
	}, [activeEffects]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (appStateRef.current !== 'active') return;
			const now = Date.now();
			const elapsed = (now - lastProcessedMsRef.current) / 1000;
			if (elapsed <= 0) return;
			simulateElapsedSeconds(elapsed);
			lastProcessedMsRef.current = now;
		}, 1000);
		return () => clearInterval(interval);
	}, [simulateElapsedSeconds]);

	useEffect(() => {
		const sub = AppState.addEventListener('change', nextState => {
			const now = Date.now();
			const wasActive = appStateRef.current === 'active';
			const isActive = nextState === 'active';

			if (wasActive && !isActive) {
				const elapsed = (now - lastProcessedMsRef.current) / 1000;
				if (elapsed > 0) simulateElapsedSeconds(elapsed);
				lastProcessedMsRef.current = now;
				backgroundStartedMsRef.current = now;
			}

			if (!wasActive && isActive) {
				const startedAt = backgroundStartedMsRef.current ?? lastProcessedMsRef.current;
				const elapsed = (now - startedAt) / 1000;
				if (elapsed > 0) {
					const result = simulateElapsedSeconds(elapsed);
					if (result.coins > 0 || result.fireXp > 0 || result.furyDelta !== 0 || result.healthDelta !== 0 || result.shards > 0) {
						setPendingIdleSummary({
							elapsedSeconds: Math.round(elapsed),
							coins: round2(result.coins),
							fireXp: round2(result.fireXp),
							shards: result.shards,
							furyEarned: result.furyDelta > 0 ? round2(result.furyDelta) : 0,
							furyLost: result.furyDelta < 0 ? round2(Math.abs(result.furyDelta)) : 0,
							furyTotal: round2(clamp((fury.furyMeter ?? 0) + result.furyDelta, 0, 100)),
							healthEarned: result.healthDelta > 0 ? round2(result.healthDelta) : 0,
							healthLost: result.healthDelta < 0 ? round2(Math.abs(result.healthDelta)) : 0,
							healthTotal: round2(clamp((dragon.hp ?? 0) + result.healthDelta, 0, dragon.maxHP ?? 0)),
						});
					}
				}
				lastProcessedMsRef.current = now;
				backgroundStartedMsRef.current = null;
			}

			appStateRef.current = nextState;
		});
		return () => sub.remove();
	}, [dragon.hp, dragon.maxHP, fury.furyMeter, simulateElapsedSeconds]);

	const resetInventory = useCallback(() => {
		setOwnedItems({});
		setActiveEffects([]);
		setPendingIdleSummary(null);
		setSnackToast(null);
		lastProcessedMsRef.current = Date.now();
		backgroundStartedMsRef.current = null;
	}, []);

	return (
		<ItemsProviderContext.Provider
			value={{
				shopItems,
				ownedItems,
				purchaseItem,
				useItem,
				addItemToInventory,
				sellItem,
				processDailyPayouts,
				processDragonClick,
				getClickReward,
				getItemCoinCost,
				getItemShardCost,
				getGeneratorProductionPerDay,
				getTotalGeneratorProductionPerDay,
				activeEffects,
				getActiveCoinMultiplier,
				getActiveJeopardyMultiplier,
				getSurveyMultiplier,
				getGeneratorMultiplier,
				getClickerMultiplier,
				getEffectDisplayList,
				pendingIdleSummary,
				consumeIdleSummary,
				snackToast,
				consumeSnackToast,
				resetInventory,
			}}>
			{children}
		</ItemsProviderContext.Provider>
	);
}
