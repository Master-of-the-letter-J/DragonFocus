import { COIN_GENERATOR_DATA } from '@/data/coin-generator-data';
import { getSnackEffectConfig } from '@/data/effect-data';
import { MARKET_ITEMS } from '@/data/market-item-data';
import { type ItemType, type MarketItem, type RuntimeMarketStats, type SnackItem, type SoulMultiplierItem } from '@/data/market-types';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useDragonSouls } from '@/context/DragonSoulsProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { usePopulation } from '@/context/PopulationProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import type { ActiveEffect, EffectDisplayEntry, EffectSnapshot, IdleSummary, ItemsContextType, SimResult, SnackUseToast, SurveyCompletionBonus } from '@/context/item-system/types';
import { clamp, DAY_MS, DAY_SECONDS, effectStrength, formatSignedDailyValue, formatSignedValue, makeEffectId, randInt, resolveRangeValue, round2, SNACK_RARE_IDS } from '@/context/item-system/utils';
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export type { ActiveEffect, EffectDisplayEntry, IdleSummary, ItemsContextType, SnackUseToast, SurveyCompletionBonus } from '@/context/item-system/types';
export type { ItemType, MarketItem } from '@/context/item-system/types';

const ItemCoreContext = React.createContext<ItemsContextType | undefined>(undefined);

export const useItemCore = () => {
	const context = useContext(ItemCoreContext);
	if (!context) throw new Error('useItemCore must be used within ItemCoreProvider');
	return context;
};


/** @requires DragonCoinsProvider @requires DragonShardsProvider */
export default function ItemCoreProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const fury = useFury();
	const coins = useDragonCoins();
	const shards = useShards();
	const souls = useDragonSouls();
	const scarLevel = useScarLevel();
	const premium = usePremium();
	const streak = useStreak();
	const population = usePopulation();

	const marketItems = useMemo(() => MARKET_ITEMS, []);
	const [ownedItems, setOwnedItems] = useState<Record<string, number>>({});
	const [snackPurchaseCounts, setSnackPurchaseCounts] = useState<Record<string, number>>({});
	const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
	const [pendingIdleSummary, setPendingIdleSummary] = useState<IdleSummary | null>(null);
	const [snackToast, setSnackToast] = useState<SnackUseToast | null>(null);

	const ownedItemsRef = useRef(ownedItems);
	const snackPurchaseCountsRef = useRef(snackPurchaseCounts);
	const activeEffectsRef = useRef(activeEffects);
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);
	const lastProcessedMsRef = useRef(Date.now());
	const backgroundStartedMsRef = useRef<number | null>(null);

	useEffect(() => {
		ownedItemsRef.current = ownedItems;
	}, [ownedItems]);

	useEffect(() => {
		snackPurchaseCountsRef.current = snackPurchaseCounts;
	}, [snackPurchaseCounts]);

	useEffect(() => {
		activeEffectsRef.current = activeEffects;
	}, [activeEffects]);

	const getMarketItemById = useCallback(
		(id: string) => {
			return marketItems.find(item => item.id === id);
		},
		[marketItems],
	);

	const getOwnedCount = useCallback((id: string) => ownedItemsRef.current[id] ?? 0, []);
	const getSnackPurchaseCount = useCallback((id: string) => snackPurchaseCountsRef.current[id] ?? 0, []);

	const getRuntimeStats = useCallback((): RuntimeMarketStats => {
		const antiTreasuryCount = getOwnedCount('gen_anti_treasury');
		const totalGeneratorCount = COIN_GENERATOR_DATA.reduce((sum, item) => sum + getOwnedCount(item.id), 0);

		return {
			yang: clamp(fury.furyMeter ?? 0, 0, 100),
			yin: 100 - clamp(fury.furyMeter ?? 0, 0, 100),
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

	const getSoulMultiplierCount = useCallback((id: string) => getOwnedCount(id), [getOwnedCount]);

	const getTotalSoulMultiplierCount = useCallback(() => {
		return marketItems.filter(item => item.type === 'soulMultiplier').reduce((sum, item) => sum + getOwnedCount(item.id), 0);
	}, [getOwnedCount, marketItems]);

	const getUniversalPassiveFactor = useCallback(() => {
		const universalOwned = getSoulMultiplierCount('soul_infernal_universal_multiplier');
		const universalCrucibleOwned = getSoulMultiplierCount('soul_infernal_universal_crucible');
		const totalSoulOwned = getTotalSoulMultiplierCount();
		return Math.pow(1.5, universalOwned) * Math.pow(1 + totalSoulOwned / 100, universalCrucibleOwned);
	}, [getSoulMultiplierCount, getTotalSoulMultiplierCount]);

	const getPassiveSoulMultiplier = useCallback(
		(kind: 'survey' | 'generator' | 'clicker') => {
			let factor = getUniversalPassiveFactor();
			if (kind === 'clicker') factor *= Math.pow(2, getSoulMultiplierCount('soul_infernal_click_multiplier'));
			return Math.max(1, factor);
		},
		[getSoulMultiplierCount, getUniversalPassiveFactor],
	);

	const getStatusEffectAmplifier = useCallback(() => Math.pow(2, getSoulMultiplierCount('soul_impossible_effects')), [getSoulMultiplierCount]);

	const baseGeneratorPerUnit = useCallback((generator: (typeof COIN_GENERATOR_DATA)[number], stats: RuntimeMarketStats) => {
		switch (generator.formula) {
			case 'flat':
				return generator.baseOutput;
			case 'yang':
				return generator.baseOutput + stats.yang / 50;
			case 'yin':
				return generator.baseOutput + stats.yin / 50;
			case 'streak':
				return generator.baseOutput + stats.streak / 30;
			case 'antiTreasury':
				return generator.baseOutput + stats.antiTreasuryCount;
			case 'scarLevel':
				return generator.baseOutput + stats.scarLevel;
			case 'age':
				return generator.baseOutput + stats.age / 10;
			case 'destroyedPopulation':
				return generator.baseOutput + Math.log10(Math.max(1, stats.destroyedPopulation));
			case 'population':
				return generator.baseOutput + Math.log10(Math.max(1, stats.population));
			case 'totalGeneratorCount':
				return generator.baseOutput + stats.totalGeneratorCount;
			case 'bigStick':
				return generator.baseOutput;
			default:
				return generator.baseOutput;
		}
	}, []);

	const getGeneratorSpecificFactor = useCallback(
		(generatorId: string, baseTotalOutputPerDay: number) => {
			const multiplierOwned = getSoulMultiplierCount(`soul_${generatorId}_multiplier`);
			const crucibleOwned = getSoulMultiplierCount(`soul_${generatorId}_crucible`);
			return Math.pow(2, multiplierOwned) * Math.pow(Math.max(1, baseTotalOutputPerDay), 0.1 * crucibleOwned);
		},
		[getSoulMultiplierCount],
	);

	const getEffectSnapshotAt = useCallback(
		(atMs: number, sourceEffects: ActiveEffect[] = activeEffectsRef.current): EffectSnapshot => {
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

			const amplifier = getStatusEffectAmplifier();

			return {
				surveyMultiplier: effectStrength(surveyMultiplier, amplifier) ?? 1,
				generatorMultiplier: effectStrength(generatorMultiplier, amplifier) ?? 1,
				clickerMultiplier: effectStrength(clickerMultiplier, amplifier) ?? 1,
				jeopardyMultiplier: effectStrength(jeopardyMultiplier, amplifier) ?? 1,
				furyPerDay: furyPerDay * amplifier,
				healthPerDay: healthPerDay * amplifier,
			};
		},
		[getStatusEffectAmplifier],
	);

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
						default:
							return 1;
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
						effectTag: payload.effectTag,
						protectedEffect: payload.protectedEffect,
					};
				});

				return [...other, ...rebuilt];
			}

			if (payload.effectTag === 'cursed_survey_duplication') {
				const queue = cleaned.filter(item => item.effectTag === payload.effectTag);
				const other = cleaned.filter(item => item.effectTag !== payload.effectTag);

				const segments = queue
					.map(item => {
						const remaining = item.endsAtMs - Math.max(now, item.startsAtMs);
						return {
							sourceItemId: item.sourceItemId,
							name: item.name,
							remaining,
							surveyMultiplier: item.surveyMultiplier ?? 1,
							generatorMultiplier: item.generatorMultiplier ?? 1,
						};
					})
					.filter(segment => segment.remaining > 0);

				const existing = segments.find(
					segment =>
						segment.sourceItemId === payload.sourceItemId &&
						segment.surveyMultiplier === (payload.surveyMultiplier ?? 1) &&
						segment.generatorMultiplier === (payload.generatorMultiplier ?? 1),
				);

				if (existing) {
					existing.remaining += durationMs;
				} else {
					segments.push({
						sourceItemId: payload.sourceItemId,
						name: payload.name,
						remaining: durationMs,
						surveyMultiplier: payload.surveyMultiplier ?? 1,
						generatorMultiplier: payload.generatorMultiplier ?? 1,
					});
				}

				segments.sort((a, b) => {
					if (b.surveyMultiplier !== a.surveyMultiplier) return b.surveyMultiplier - a.surveyMultiplier;
					return a.generatorMultiplier - b.generatorMultiplier;
				});

				let cursor = now;
				const rebuilt: ActiveEffect[] = segments.map(segment => {
					const startsAtMs = cursor;
					const endsAtMs = startsAtMs + segment.remaining;
					cursor = endsAtMs;

					return {
						id: makeEffectId(),
						sourceItemId: segment.sourceItemId,
						name: segment.name,
						effectTag: payload.effectTag,
						startsAtMs,
						endsAtMs,
						surveyMultiplier: segment.surveyMultiplier,
						generatorMultiplier: segment.generatorMultiplier,
					};
				});

				return [...other, ...rebuilt];
			}

			const mergeIndex = cleaned.findIndex(
				item =>
					!item.queueGroup &&
					item.sourceItemId === payload.sourceItemId &&
					item.surveyMultiplier === payload.surveyMultiplier &&
					item.generatorMultiplier === payload.generatorMultiplier &&
					item.clickerMultiplier === payload.clickerMultiplier &&
					item.jeopardyMultiplier === payload.jeopardyMultiplier &&
					item.furyPerDay === payload.furyPerDay &&
					item.healthPerDay === payload.healthPerDay,
			);

			if (mergeIndex >= 0) {
				const next = [...cleaned];
				next[mergeIndex] = { ...next[mergeIndex], endsAtMs: next[mergeIndex].endsAtMs + durationMs };
				return next;
			}

			return [...cleaned, { id: makeEffectId(), ...payload, startsAtMs: now, endsAtMs: now + durationMs }];
		});
	}, []);

	const getItemCoinCost = useCallback(
		(id: string) => {
			const item = getMarketItemById(id);
			if (!item) return 0;
			const baseCost = item.coinCost ?? 0;
			if (baseCost <= 0) return 0;

			if (item.type === 'snack') {
				return round2(baseCost * Math.pow(item.coinGrowth ?? 1, getSnackPurchaseCount(id)));
			}

			if (item.type === 'generator' || item.type === 'clicker') {
				return round2(baseCost * Math.pow(item.coinGrowth ?? 1, getOwnedCount(id)));
			}

			return round2(baseCost);
		},
		[getMarketItemById, getOwnedCount, getSnackPurchaseCount],
	);

	const getItemShardCost = useCallback(
		(id: string) => {
			const item = getMarketItemById(id);
			if (!item) return 0;
			return round2(item.shardCost ?? 0);
		},
		[getMarketItemById],
	);

	const getItemSoulCost = useCallback(
		(id: string) => {
			const item = getMarketItemById(id);
			if (!item) return 0;
			const baseCost = item.soulCost ?? 0;
			if (baseCost <= 0) return 0;
			if (item.type !== 'soulMultiplier') return round2(baseCost);
			return round2(baseCost * Math.pow(item.soulGrowth ?? 1, getOwnedCount(id)));
		},
		[getMarketItemById, getOwnedCount],
	);

	const getBaseTotalGeneratorOutput = useCallback(() => {
		const stats = getRuntimeStats();
		return COIN_GENERATOR_DATA.reduce((sum, generator) => sum + baseGeneratorPerUnit(generator, stats) * getOwnedCount(generator.id), 0);
	}, [baseGeneratorPerUnit, getOwnedCount, getRuntimeStats]);

	const getGeneratorProductionPerDayAt = useCallback(
		(atMs: number, sourceEffects: ActiveEffect[] = activeEffectsRef.current) => {
			const stats = getRuntimeStats();
			const effects = getEffectSnapshotAt(atMs, sourceEffects);
			const generatorSoulMultiplier = getPassiveSoulMultiplier('generator');
			const baseMultiplier = coins.calculateCoinMultiplier(stats.yang, stats.shards, stats.scarLevel, effects.generatorMultiplier * generatorSoulMultiplier, stats.premium);
			const baseTotalOutput = Math.max(1, getBaseTotalGeneratorOutput() * baseMultiplier);
			const antiTreasuryCount = getOwnedCount('gen_anti_treasury');
			const reductionFactor = Math.pow(0.9, antiTreasuryCount);

			let antiTreasuryOutput = 0;
			let otherOutput = 0;

			for (const generator of COIN_GENERATOR_DATA) {
				const count = getOwnedCount(generator.id);
				if (count <= 0) continue;

				const perUnitBase = baseGeneratorPerUnit(generator, stats);
				const specificFactor = getGeneratorSpecificFactor(generator.id, baseTotalOutput);
				const multiplierBoost = generator.formula === 'bigStick' ? baseMultiplier * baseMultiplier : baseMultiplier;
				const totalOutput = perUnitBase * count * multiplierBoost * specificFactor;

				if (generator.id === 'gen_anti_treasury') antiTreasuryOutput += totalOutput;
				else otherOutput += totalOutput;
			}

			return Math.max(0, otherOutput * reductionFactor) + antiTreasuryOutput;
		},
		[baseGeneratorPerUnit, coins, getBaseTotalGeneratorOutput, getEffectSnapshotAt, getGeneratorSpecificFactor, getOwnedCount, getPassiveSoulMultiplier, getRuntimeStats],
	);

	const getGeneratorProductionPerDay = useCallback(
		(id: string) => {
			const generator = COIN_GENERATOR_DATA.find(item => item.id === id);
			if (!generator) return 0;
			const stats = getRuntimeStats();
			const effects = getEffectSnapshotAt(Date.now());
			const generatorSoulMultiplier = getPassiveSoulMultiplier('generator');
			const baseMultiplier = coins.calculateCoinMultiplier(stats.yang, stats.shards, stats.scarLevel, effects.generatorMultiplier * generatorSoulMultiplier, stats.premium);
			const baseTotalOutput = Math.max(1, getBaseTotalGeneratorOutput() * baseMultiplier);
			const specificFactor = getGeneratorSpecificFactor(generator.id, baseTotalOutput);
			const multiplierBoost = generator.formula === 'bigStick' ? baseMultiplier * baseMultiplier : baseMultiplier;
			return round2(baseGeneratorPerUnit(generator, stats) * multiplierBoost * specificFactor);
		},
		[baseGeneratorPerUnit, coins, getBaseTotalGeneratorOutput, getEffectSnapshotAt, getGeneratorSpecificFactor, getPassiveSoulMultiplier, getRuntimeStats],
	);

	const getTotalGeneratorProductionPerDay = useCallback(() => {
		return round2(getGeneratorProductionPerDayAt(Date.now()));
	}, [getGeneratorProductionPerDayAt]);

	const getSurveyMultiplier = useCallback(() => getEffectSnapshotAt(Date.now()).surveyMultiplier * getPassiveSoulMultiplier('survey'), [getEffectSnapshotAt, getPassiveSoulMultiplier]);
	const getGeneratorMultiplier = useCallback(() => getEffectSnapshotAt(Date.now()).generatorMultiplier * getPassiveSoulMultiplier('generator'), [getEffectSnapshotAt, getPassiveSoulMultiplier]);
	const getClickerMultiplier = useCallback(() => getEffectSnapshotAt(Date.now()).clickerMultiplier * getPassiveSoulMultiplier('clicker'), [getEffectSnapshotAt, getPassiveSoulMultiplier]);
	const getActiveJeopardyMultiplier = useCallback(() => getEffectSnapshotAt(Date.now()).jeopardyMultiplier, [getEffectSnapshotAt]);
	const getActiveCoinMultiplier = useCallback(() => getSurveyMultiplier(), [getSurveyMultiplier]);

	const getClickReward = useCallback(() => {
		const stats = getRuntimeStats();
		const effects = getEffectSnapshotAt(Date.now());
		const dragonClicksOwned = getOwnedCount('click_dragon_clicks');
		const ageMultiplierOwned = getOwnedCount('click_age_multiplier');
		const demonicOwned = getOwnedCount('click_demonic_clicks');
		const megaOwned = getOwnedCount('click_mega_clicks');
		const impossibleOwned = getOwnedCount('click_impossible_clicks');
		const ritualMultiplier = Math.pow(10, getSoulMultiplierCount('soul_infernal_ritual_multiplier'));

		const dragonClicksBase = dragonClicksOwned * 0.01 * (1 + ageMultiplierOwned * 0.01 * stats.age);
		const megaClicksBase = megaOwned * 0.1;
		const impossibleClicksBase = impossibleOwned * 1;
		const demonicBase = demonicOwned * getGeneratorProductionPerDayAt(Date.now()) * 0.00001;
		const raw = dragonClicksBase * ritualMultiplier + megaClicksBase * ritualMultiplier + impossibleClicksBase * ritualMultiplier + demonicBase;
		if (raw <= 0) return 0;

		const clickMultiplier = coins.calculateCoinMultiplier(stats.yang, stats.shards, stats.scarLevel, effects.clickerMultiplier * getPassiveSoulMultiplier('clicker'), stats.premium);
		return round2(raw * clickMultiplier);
	}, [coins, getEffectSnapshotAt, getGeneratorProductionPerDayAt, getOwnedCount, getPassiveSoulMultiplier, getRuntimeStats, getSoulMultiplierCount]);

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

	const purchaseItem = useCallback(
		(id: string) => {
			const item = getMarketItemById(id);
			if (!item) return false;
			if ((item.scarLevelRequired ?? 0) > (scarLevel.currentScarLevel ?? 0)) return false;
			if ((item.type === 'cosmetic' || item.type === 'theme') && getOwnedCount(id) > 0) return false;

			const coinCost = getItemCoinCost(id);
			const shardCost = getItemShardCost(id);
			const soulCost = getItemSoulCost(id);

			if (!coins.spendCoins(coinCost)) return false;
			if (shardCost > 0 && !shards.spendShards(shardCost)) {
				coins.addCoins(coinCost);
				return false;
			}
			if (soulCost > 0 && !souls.spendSouls(soulCost)) {
				if (shardCost > 0) shards.addShards(shardCost);
				coins.addCoins(coinCost);
				return false;
			}

			addItemToInventory(id, 1);
			if (item.type === 'snack') {
				setSnackPurchaseCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
			}
			return true;
		},
		[addItemToInventory, coins, getItemCoinCost, getItemShardCost, getItemSoulCost, getMarketItemById, getOwnedCount, scarLevel.currentScarLevel, shards, souls],
	);

	const sellItem = useCallback(
		(id: string) => {
			const item = getMarketItemById(id);
			if (!item) return false;
			if (item.type !== 'generator' && item.type !== 'clicker' && item.type !== 'soulMultiplier') return false;

			const owned = ownedItemsRef.current[id] ?? 0;
			if (owned <= 0) return false;

			setOwnedItems(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));

			if (item.type === 'soulMultiplier') {
				const lastSoulCost = round2((item.soulCost ?? 0) * Math.pow(item.soulGrowth ?? 1, Math.max(0, owned - 1)));
				const soulRefund = Math.max(0, Math.floor(lastSoulCost * 0.75));
				if (soulRefund > 0) souls.addSouls(soulRefund);
				return true;
			}

			const lastCoinCost = round2((item.coinCost ?? 0) * Math.pow(item.coinGrowth ?? 1, Math.max(0, owned - 1)));
			const coinRefund = Math.max(0, round2(lastCoinCost * 0.75));
			if ((item.shardCost ?? 0) > 0) shards.addShards(item.shardCost ?? 0);
			if (coinRefund > 0) coins.addCoins(coinRefund);
			return true;
		},
		[coins, getMarketItemById, shards, souls],
	);

	const simulateElapsedSeconds = useCallback(
		(elapsedSeconds: number): SimResult => {
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
		},
		[coins, dragon, fury, getEffectSnapshotAt, getGeneratorProductionPerDayAt, scarLevel],
	);

	const processDailyPayouts = useCallback(() => {
		const anchor = Date.now();
		lastProcessedMsRef.current = anchor;
		const result = simulateElapsedSeconds(DAY_SECONDS);
		lastProcessedMsRef.current = anchor;
		return result.coins;
	}, [simulateElapsedSeconds]);

	const clearEffects = useCallback((includeProtected = false) => {
		setActiveEffects(prev => prev.filter(effect => !includeProtected && effect.protectedEffect));
	}, []);

	const useItem = useCallback(
		(id: string) => {
			const item = getMarketItemById(id);
			if (!item || item.type !== 'snack') return false;
			const owned = ownedItemsRef.current[id] ?? 0;
			if (owned <= 0) return false;

			const snack = item as SnackItem;
			const effectConfig = getSnackEffectConfig(snack.effectId);
			if (!effectConfig) return false;

			const immediateFury = resolveRangeValue(effectConfig.immediateFury) ?? 0;
			const immediateHealth = resolveRangeValue(effectConfig.immediateHealth) ?? 0;
			const furyPerDay = resolveRangeValue(effectConfig.furyPerDay);
			const healthPerDay = resolveRangeValue(effectConfig.healthPerDay);

			if (effectConfig.clearEffects === 'normal') clearEffects(false);
			if (effectConfig.clearEffects === 'all') clearEffects(true);
			if (immediateFury !== 0) fury.addFury(immediateFury);
			if (immediateHealth > 0) dragon.healHp(immediateHealth);
			if (immediateHealth < 0) dragon.damageHp(Math.abs(immediateHealth));
			for (let index = 0; index < (effectConfig.ageDelta ?? 0); index += 1) dragon.incrementAge();

			if (effectConfig.days && (effectConfig.surveyMultiplier !== undefined || effectConfig.generatorMultiplier !== undefined || effectConfig.clickerMultiplier !== undefined || effectConfig.jeopardyMultiplier !== undefined || furyPerDay !== undefined || healthPerDay !== undefined)) {
				addTimedEffect({
					sourceItemId: id,
					name: `${item.name}, ${effectConfig.days}d`,
					queueGroup: effectConfig.queueGroup,
					effectTag: effectConfig.effectTag,
					surveyMultiplier: effectConfig.surveyMultiplier,
					generatorMultiplier: effectConfig.generatorMultiplier,
					clickerMultiplier: effectConfig.clickerMultiplier,
					jeopardyMultiplier: effectConfig.jeopardyMultiplier,
					furyPerDay,
					healthPerDay,
					days: effectConfig.days,
				});
			}

			let topEffect = effectConfig.toastText;
			if (immediateFury !== 0 && immediateHealth === 0) topEffect = formatSignedValue('Fury', immediateFury);
			if (immediateHealth !== 0 && immediateFury === 0 && !effectConfig.days) topEffect = formatSignedValue('Health', immediateHealth);
			if (immediateFury !== 0 && immediateHealth !== 0) topEffect = `${formatSignedValue('Fury', immediateFury)} and ${formatSignedValue('Health', immediateHealth)}`;
			if (furyPerDay !== undefined && !effectConfig.surveyMultiplier && !effectConfig.generatorMultiplier && !effectConfig.clickerMultiplier && !effectConfig.jeopardyMultiplier) topEffect = formatSignedDailyValue('Fury', furyPerDay);
			if (healthPerDay !== undefined && furyPerDay === undefined && !effectConfig.surveyMultiplier && !effectConfig.generatorMultiplier && !effectConfig.clickerMultiplier && !effectConfig.jeopardyMultiplier) topEffect = formatSignedDailyValue('Health', healthPerDay);

			setOwnedItems(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
			setSnackToast({ name: item.name, topEffect });
			return true;
		},
		[addTimedEffect, clearEffects, dragon, fury, getMarketItemById],
	);

	const getSurveyCompletionBonus = useCallback(
		(surveyCoins: number, baseShards = 1, currentScarLevel = scarLevel.currentScarLevel ?? 0): SurveyCompletionBonus => {
			const generatorOutput = getTotalGeneratorProductionPerDay();
			const exploitationILevels = getSoulMultiplierCount('soul_survey_exploitation_i');
			const exploitationIILevels = getSoulMultiplierCount('soul_survey_exploitation_ii');
			const exploitationIIILevels = getSoulMultiplierCount('soul_survey_exploitation_iii');
			const eternalShardLevels = getSoulMultiplierCount('soul_eternal_shards');
			const duplicationLevels = getSoulMultiplierCount('soul_survey_duplication_glitch');

			const extraCoins = exploitationILevels > 0 ? Math.floor((generatorOutput * surveyCoins) / 100) * exploitationILevels : 0;
			const duplicationMultiplier = Math.pow(2, duplicationLevels);
			const finalCoins = Math.max(0, Math.floor((surveyCoins + extraCoins) * duplicationMultiplier));

			const extraShards = exploitationIILevels > 0 ? Math.floor(Math.sqrt(Math.max(0, surveyCoins))) * exploitationIILevels : 0;
			const shardMultiplier = Math.pow(2, eternalShardLevels) * duplicationMultiplier;
			const finalShards = Math.max(0, Math.floor((baseShards + extraShards) * Math.max(1, shardMultiplier)));

			const baseSnackDrops = currentScarLevel >= 3 ? 1 : 0;
			const snackDrops = Math.max(0, (baseSnackDrops + exploitationIIILevels) * duplicationMultiplier);

			return { finalCoins, finalShards, snackDrops };
		},
		[getSoulMultiplierCount, getTotalGeneratorProductionPerDay, scarLevel.currentScarLevel],
	);

	const grantRandomUnlockedSnacks = useCallback(
		(count: number, currentScarLevel = scarLevel.currentScarLevel ?? 0) => {
			if (count <= 0) return [];

			const unlockedSnacks = marketItems.filter(item => item.type === 'snack' && (item.scarLevelRequired ?? 0) <= currentScarLevel) as SnackItem[];
			if (unlockedSnacks.length === 0) return [];

			const weightedPool = unlockedSnacks.flatMap(item => {
				const weight = SNACK_RARE_IDS.has(item.id) ? 1 : 10;
				return Array.from({ length: weight }, () => item);
			});

			const awardedIds: string[] = [];
			for (let index = 0; index < count; index += 1) {
				const picked = weightedPool[randInt(0, weightedPool.length - 1)];
				if (!picked) continue;
				addItemToInventory(picked.id, 1);
				awardedIds.push(picked.id);
			}

			return awardedIds;
		},
		[addItemToInventory, marketItems, scarLevel.currentScarLevel],
	);

	const consumeIdleSummary = useCallback(() => setPendingIdleSummary(null), []);
	const consumeSnackToast = useCallback(() => setSnackToast(null), []);

	const resetSnackPrices = useCallback(() => {
		setSnackPurchaseCounts({});
	}, []);

	const resetAfterAscension = useCallback(() => {
		const generatorAndClickerIds = marketItems.filter(item => item.type === 'generator' || item.type === 'clicker').map(item => item.id);
		setOwnedItems(prev => {
			const next = { ...prev };
			generatorAndClickerIds.forEach(id => {
				next[id] = 0;
			});
			return next;
		});
		setSnackPurchaseCounts({});
	}, [marketItems]);

	const getOwnedTotalByType = useCallback(
		(type: ItemType) => marketItems.filter(item => item.type === type).reduce((sum, item) => sum + (ownedItems[item.id] || 0), 0),
		[marketItems, ownedItems],
	);

	const getSoulMultiplierRefundTotal = useCallback(() => {
		return marketItems
			.filter(item => item.type === 'soulMultiplier')
			.reduce((sum, item) => {
				const owned = getOwnedCount(item.id);
				if (owned <= 0) return sum;
				const soulItem = item as SoulMultiplierItem;
				let total = 0;
				for (let index = 0; index < owned; index += 1) {
					total += round2((soulItem.soulCost ?? 0) * Math.pow(soulItem.soulGrowth ?? 1, index));
				}
				return sum + total;
			}, 0);
	}, [getOwnedCount, marketItems]);

	const resetSoulMultipliers = useCallback(() => {
		const refund = Math.floor(getSoulMultiplierRefundTotal());
		const soulMultiplierIds = marketItems.filter(item => item.type === 'soulMultiplier').map(item => item.id);
		setOwnedItems(prev => {
			const next = { ...prev };
			soulMultiplierIds.forEach(id => {
				next[id] = 0;
			});
			return next;
		});
		if (refund > 0) souls.addSouls(refund);
		return refund;
	}, [getSoulMultiplierRefundTotal, marketItems, souls]);

	const getEffectDisplayList = useCallback((): EffectDisplayEntry[] => {
		const now = Date.now();
		return activeEffects
			.filter(effect => effect.endsAtMs > now)
			.map(effect => {
				const startsInSeconds = Math.max(0, Math.ceil((effect.startsAtMs - now) / 1000));
				const remainingSeconds = Math.max(0, Math.ceil((effect.endsAtMs - Math.max(now, effect.startsAtMs)) / 1000));
				const topEffect =
					effect.surveyMultiplier !== undefined
						? `Survey x${round2(effect.surveyMultiplier)}`
						: effect.generatorMultiplier !== undefined
							? `Generator x${round2(effect.generatorMultiplier)}`
							: effect.clickerMultiplier !== undefined
								? `Clicker x${round2(effect.clickerMultiplier)}`
								: effect.jeopardyMultiplier !== undefined
									? `Jeopardy x${round2(effect.jeopardyMultiplier)}`
									: effect.furyPerDay !== undefined
										? `Fury/day ${effect.furyPerDay >= 0 ? '+' : ''}${round2(effect.furyPerDay)}`
										: effect.healthPerDay !== undefined
											? `Health/day ${effect.healthPerDay >= 0 ? '+' : ''}${round2(effect.healthPerDay)}`
											: 'Effect active';
				const strength = Math.max(
					Math.abs(effect.surveyMultiplier ?? 0),
					Math.abs(effect.generatorMultiplier ?? 0),
					Math.abs(effect.clickerMultiplier ?? 0),
					Math.abs(effect.jeopardyMultiplier ?? 0),
					Math.abs(effect.furyPerDay ?? 0) / 10,
					Math.abs(effect.healthPerDay ?? 0) / 10,
				);
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
		setSnackPurchaseCounts({});
		setActiveEffects([]);
		setPendingIdleSummary(null);
		setSnackToast(null);
		lastProcessedMsRef.current = Date.now();
		backgroundStartedMsRef.current = null;
	}, []);

	const value: ItemsContextType = {
				marketItems,
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
				getItemSoulCost,
				getGeneratorProductionPerDay,
				getTotalGeneratorProductionPerDay,
				activeEffects,
				getActiveCoinMultiplier,
				getActiveJeopardyMultiplier,
				getSurveyMultiplier,
				getGeneratorMultiplier,
				getClickerMultiplier,
				getSurveyCompletionBonus,
				grantRandomUnlockedSnacks,
				getEffectDisplayList,
				pendingIdleSummary,
				consumeIdleSummary,
				snackToast,
				consumeSnackToast,
				clearEffects,
				addCustomEffect: addTimedEffect,
				resetSnackPrices,
				resetAfterAscension,
				getOwnedTotalByType,
				getSoulMultiplierRefundTotal,
				resetSoulMultipliers,
				resetInventory,
			};

	return <ItemCoreContext.Provider value={value}>{children}</ItemCoreContext.Provider>;
}
