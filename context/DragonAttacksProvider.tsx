import { formatAbbreviatedNumber, roundToDecimalPlaces } from '@/constants/number-abbreviation';
import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import { DRAGON_ATTACK_ABILITIES, DRAGON_ATTACK_UPGRADES, type DragonAttackAbilityId, type DragonAttackUpgradeId } from '@/data/dragon-attack-data';
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useDragonCoins } from './DragonCoinsProvider';
import { useDragon } from './DragonProvider';
import { useDragonOrbs } from './DragonOrbsProvider';
import { useFury } from './FuryProvider';
import { useItemEconomy } from './ItemEconomyProvider';
import { usePopulation } from './PopulationProvider';

const DAY_SECONDS = 86400;

interface DragonAttackWorldState {
	obsidianLegions: number;
	obsidianTanks: number;
	obsidianAircraft: number;
	dragonGuards: number;
	dragonTanks: number;
	dragonAircraft: number;
	totalPopulationDestroyedByDragon: number;
	totalLegionsDestroyed: number;
	totalTanksDestroyed: number;
	totalAircraftDestroyed: number;
	totalDamageDealt: number;
	totalOrbsFromDestruction: number;
	lastProcessedAtMs: number;
}

interface DragonAttackState {
	upgradeLevels: Record<string, number>;
	activeAbilityUntilMs: Partial<Record<DragonAttackAbilityId, number>>;
	abilityUses: Record<string, number>;
	world: DragonAttackWorldState;
}

export interface DragonAttackRates {
	damage: number;
	healthDeclinePerDay: number;
	populationDestroyedPerDay: number;
	legionsAddedPerDay: number;
	tanksAddedPerDay: number;
	aircraftAddedPerDay: number;
	legionsDestroyedPerDay: number;
	tanksDestroyedPerDay: number;
	aircraftDestroyedPerDay: number;
	orbsPerDay: number;
}

interface DragonAttacksContextType {
	upgradeDefinitions: typeof DRAGON_ATTACK_UPGRADES;
	abilityDefinitions: typeof DRAGON_ATTACK_ABILITIES;
	world: DragonAttackWorldState;
	rates: DragonAttackRates;
	upgradeLevels: Record<string, number>;
	activeAbilityUntilMs: Partial<Record<DragonAttackAbilityId, number>>;
	getUpgradeLevel: (id: DragonAttackUpgradeId) => number;
	getUpgradeCoinCost: (id: DragonAttackUpgradeId) => number;
	getUpgradeOrbCost: (id: DragonAttackUpgradeId) => number;
	getAbilityRemainingSeconds: (id: DragonAttackAbilityId) => number;
	purchaseUpgrade: (id: DragonAttackUpgradeId) => { success: boolean; message?: string };
	activateAbility: (id: DragonAttackAbilityId) => { success: boolean; message?: string };
	addObsidianLegions: (amount: number) => void;
	addDragonGuards: (amount: number) => void;
	resetDragonAttacks: () => void;
}

const DragonAttacksContext = createContext<DragonAttacksContextType | undefined>(undefined);

const INITIAL_WORLD_STATE: DragonAttackWorldState = {
	obsidianLegions: 0,
	obsidianTanks: 0,
	obsidianAircraft: 0,
	dragonGuards: 0,
	dragonTanks: 0,
	dragonAircraft: 0,
	totalPopulationDestroyedByDragon: 0,
	totalLegionsDestroyed: 0,
	totalTanksDestroyed: 0,
	totalAircraftDestroyed: 0,
	totalDamageDealt: 0,
	totalOrbsFromDestruction: 0,
	lastProcessedAtMs: Date.now(),
};

const INITIAL_ATTACK_STATE: DragonAttackState = {
	upgradeLevels: {},
	activeAbilityUntilMs: {},
	abilityUses: {},
	world: INITIAL_WORLD_STATE,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const round3 = (value: number) => roundToDecimalPlaces(value, 3);

const getLegionGrowthPerDay = (dragonAge: number, deathCount: number, dragonAlive: boolean) => {
	if (!dragonAlive || dragonAge < 5 || deathCount < 1) return 0;
	if (deathCount < 1_000) return 1 + deathCount / 16;
	if (deathCount < 10_000) return deathCount / 8;
	if (deathCount < 25_000) return deathCount / 6;
	if (deathCount < 100_000) return deathCount / 4;
	if (deathCount < 250_000) return deathCount / 3;
	if (dragonAge < 10 && deathCount < 500_000) return deathCount / 2;
	if (dragonAge < 20 && deathCount < 1_000_000) return deathCount;
	if (dragonAge < 30 && deathCount < 10_000_000) return deathCount;
	if (dragonAge >= 30 && deathCount < 100_000_000) return deathCount;
	if (dragonAge >= 30 && deathCount < 1_000_000_000) return deathCount;
	if (dragonAge >= 60 && deathCount >= 1_000_000_000) return deathCount;
	return deathCount;
};

const getVehicleRatios = (dragonAge: number, deathCount: number) => {
	let tankRatio = 0;
	let aircraftRatio = 0;

	if (deathCount >= 25_000) tankRatio = 10_000;
	if (deathCount >= 250_000) aircraftRatio = 100_000;
	if (dragonAge >= 10 && dragonAge < 20 && deathCount < 1_000_000) tankRatio = 5_000;
	if (dragonAge >= 20 && dragonAge < 30 && deathCount < 10_000_000) {
		tankRatio = 2_500;
		aircraftRatio = 50_000;
	}
	if (dragonAge >= 30 && deathCount < 100_000_000) {
		tankRatio = 1_000;
		aircraftRatio = 25_000;
	}
	if (dragonAge >= 30 && deathCount >= 100_000_000 && deathCount < 1_000_000_000) {
		tankRatio = 500;
		aircraftRatio = 10_000;
	}
	if (dragonAge >= 60 && deathCount >= 1_000_000_000) {
		tankRatio = 100;
		aircraftRatio = 1_000;
	}

	return { tankRatio, aircraftRatio };
};

const getUpgradeDefinition = (id: DragonAttackUpgradeId) => DRAGON_ATTACK_UPGRADES.find(item => item.id === id);
const getAbilityDefinition = (id: DragonAttackAbilityId) => DRAGON_ATTACK_ABILITIES.find(item => item.id === id);

export function DragonAttacksProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.dragonAttacks, INITIAL_ATTACK_STATE, {
		normalize: (storedValue, initialValue) => ({
			...initialValue,
			...(storedValue ?? {}),
			world: { ...initialValue.world, ...(storedValue?.world ?? {}), lastProcessedAtMs: Date.now() },
			upgradeLevels: storedValue?.upgradeLevels ?? {},
			activeAbilityUntilMs: storedValue?.activeAbilityUntilMs ?? {},
			abilityUses: storedValue?.abilityUses ?? {},
		}),
	});
	const coins = useDragonCoins();
	const orbs = useDragonOrbs();
	const fury = useFury();
	const dragon = useDragon();
	const population = usePopulation();
	const itemEconomy = useItemEconomy();
	const lastProcessedAtMsRef = useRef(Date.now());

	useEffect(() => {
		lastProcessedAtMsRef.current = state.world.lastProcessedAtMs || Date.now();
	}, [state.world.lastProcessedAtMs]);

	const getUpgradeLevel = useCallback((id: DragonAttackUpgradeId) => state.upgradeLevels[id] ?? 0, [state.upgradeLevels]);
	const isAbilityActive = useCallback((id: DragonAttackAbilityId) => (state.activeAbilityUntilMs[id] ?? 0) > Date.now(), [state.activeAbilityUntilMs]);
	const getAbilityRemainingSeconds = useCallback((id: DragonAttackAbilityId) => Math.max(0, Math.ceil(((state.activeAbilityUntilMs[id] ?? 0) - Date.now()) / 1000)), [state.activeAbilityUntilMs]);

	const getUpgradeCoinCost = useCallback(
		(id: DragonAttackUpgradeId) => {
			const definition = getUpgradeDefinition(id);
			if (!definition) return 0;
			return Math.ceil(definition.baseCoinCost * Math.pow(definition.coinGrowth, getUpgradeLevel(id)));
		},
		[getUpgradeLevel],
	);

	const getUpgradeOrbCost = useCallback(
		(id: DragonAttackUpgradeId) => {
			const definition = getUpgradeDefinition(id);
			if (!definition) return 0;
			return Math.ceil(definition.baseOrbCost * Math.pow(definition.orbGrowth, getUpgradeLevel(id)));
		},
		[getUpgradeLevel],
	);

	const rates = useMemo<DragonAttackRates>(() => {
		const furyValue = Math.max(0, fury.furyMeter ?? 0);
		const maxFury = Math.max(1, fury.maxFury ?? 100);
		const coinProductionPerDay = Math.max(1, itemEconomy.getTotalGeneratorProductionPerDay());
		const clawsLevel = getUpgradeLevel('claws');
		const superClawsDamage = isAbilityActive('super_claws') ? clawsLevel * 10000 : 0;
		const yinSpace = Math.max(0, maxFury - Math.min(furyValue, maxFury));
		const baseDamage =
			1 +
			clawsLevel +
			superClawsDamage +
			getUpgradeLevel('cold_fire_breathing') * 10 * yinSpace +
			getUpgradeLevel('fire_breathing') * 10 * furyValue;
		const goldenMultiplier = Math.pow(Math.max(1, Math.cbrt(coinProductionPerDay)), getUpgradeLevel('golden_plating'));
		const unleashedMultiplier = isAbilityActive('unleashed_fury') ? 10 : 1;
		const damage = round3(Math.max(1, baseDamage * goldenMultiplier * unleashedMultiplier));
		const furyOverMax = furyValue >= maxFury ? Math.max(1, furyValue - maxFury) : 0;
		const doubleMaxOverflow = furyValue >= maxFury * 2 ? Math.max(0, furyValue - maxFury * 2) : 0;
		const percentLoss = doubleMaxOverflow > 0 ? Math.max(10, damage * Math.pow(doubleMaxOverflow / 100, 2)) / 100 : 0;
		const populationDestroyedPerDay = furyOverMax > 0 ? damage * Math.pow(furyOverMax, 3) + population.population * percentLoss : 0;
		const legionsDestroyedPerDay = damage * Math.pow(100 + furyValue, 3);
		const tankBaseDamage = state.world.dragonTanks + (isAbilityActive('tank_denial') ? damage * 1000 : 0);
		const aircraftBaseDamage = state.world.dragonAircraft + (isAbilityActive('air_denial') ? damage * 10000 : 0);
		const tanksDestroyedPerDay = tankBaseDamage + (damage / 100000) * Math.pow(100 + furyValue, 3);
		const aircraftDestroyedPerDay = aircraftBaseDamage + (damage / 10000000) * Math.pow(100 + furyValue, 3);
		const healthDeclinePerDay = Math.max(0, Math.pow(Math.max(0, state.world.obsidianLegions), 0.1) - 1) + Math.pow(Math.max(0, state.world.obsidianTanks), 0.25) + Math.pow(Math.max(0, state.world.obsidianAircraft), 0.35);
		const legionsAddedPerDay = getLegionGrowthPerDay(dragon.age, population.deathCount, dragon.dragonState === 'alive');
		const { tankRatio, aircraftRatio } = getVehicleRatios(dragon.age, population.deathCount);
		const tanksAddedPerDay = tankRatio > 0 ? legionsAddedPerDay / tankRatio : 0;
		const aircraftAddedPerDay = aircraftRatio > 0 ? legionsAddedPerDay / aircraftRatio : 0;
		const orbsPerDay = populationDestroyedPerDay * 0.001 + tanksDestroyedPerDay * 0.1 + aircraftDestroyedPerDay;

		return {
			damage,
			healthDeclinePerDay: round3(healthDeclinePerDay),
			populationDestroyedPerDay: round3(populationDestroyedPerDay),
			legionsAddedPerDay: round3(legionsAddedPerDay),
			tanksAddedPerDay: round3(tanksAddedPerDay),
			aircraftAddedPerDay: round3(aircraftAddedPerDay),
			legionsDestroyedPerDay: round3(legionsDestroyedPerDay),
			tanksDestroyedPerDay: round3(tanksDestroyedPerDay),
			aircraftDestroyedPerDay: round3(aircraftDestroyedPerDay),
			orbsPerDay: round3(orbsPerDay),
		};
	}, [dragon.age, dragon.dragonState, fury.furyMeter, fury.maxFury, getUpgradeLevel, isAbilityActive, itemEconomy, population.deathCount, population.population, state.world.dragonAircraft, state.world.dragonTanks, state.world.obsidianAircraft, state.world.obsidianLegions, state.world.obsidianTanks]);

	const processElapsedSeconds = useCallback(
		(elapsedSeconds: number) => {
			if (elapsedSeconds <= 0 || dragon.dragonState !== 'alive') return;
			const ratio = elapsedSeconds / DAY_SECONDS;
			const populationDestroyed = Math.min(population.population, Math.max(0, rates.populationDestroyedPerDay * ratio));
			const healthLoss = Math.max(0, rates.healthDeclinePerDay * ratio);
			const populationOrbReward = populationDestroyed * 0.001;

			if (populationDestroyed > 0) population.destroyPopulation(populationDestroyed);
			if (healthLoss > 0) dragon.damageHp(healthLoss);

			let obsidianLegions = Math.max(0, state.world.obsidianLegions + rates.legionsAddedPerDay * ratio);
			let obsidianTanks = Math.max(0, state.world.obsidianTanks + rates.tanksAddedPerDay * ratio);
			let obsidianAircraft = Math.max(0, state.world.obsidianAircraft + rates.aircraftAddedPerDay * ratio);
			let dragonGuards = Math.max(0, state.world.dragonGuards);

			const guardSacrifice = Math.min(obsidianLegions, dragonGuards * 0.1 * ratio, 1_000_000 * ratio);
			obsidianLegions -= guardSacrifice;
			dragonGuards -= guardSacrifice;

			const legionsDestroyed = Math.min(obsidianLegions, Math.max(0, rates.legionsDestroyedPerDay * ratio));
			obsidianLegions -= legionsDestroyed;

			const tanksDestroyed = Math.min(obsidianTanks, Math.max(0, rates.tanksDestroyedPerDay * ratio));
			obsidianTanks -= tanksDestroyed;

			const aircraftDestroyed = Math.min(obsidianAircraft, Math.max(0, rates.aircraftDestroyedPerDay * ratio));
			obsidianAircraft -= aircraftDestroyed;

			const guardCreationPercent = clamp((state.upgradeLevels.guard_creation ?? 0) / 100, 0, 1);
			const tankCreationPercent = clamp((state.upgradeLevels.tank_creation ?? 0) / 100, 0, 1);
			const aircraftCreationPercent = clamp((state.upgradeLevels.aircraft_creation ?? 0) / 100, 0, 1);
			const newGuards = populationDestroyed * guardCreationPercent + tanksDestroyed * tankCreationPercent + aircraftDestroyed * aircraftCreationPercent;
			const vehicleOrbs = tanksDestroyed * 0.1 + aircraftDestroyed;
			const destructionOrbs = populationOrbReward + vehicleOrbs;

			if (vehicleOrbs > 0) orbs.earnOrbs(vehicleOrbs, 'attack');

			setState(current => {
				return {
					...current,
					world: {
						...current.world,
						obsidianLegions: round3(obsidianLegions),
						obsidianTanks: round3(obsidianTanks),
						obsidianAircraft: round3(obsidianAircraft),
						dragonGuards: round3(dragonGuards + newGuards),
						totalPopulationDestroyedByDragon: round3(state.world.totalPopulationDestroyedByDragon + populationDestroyed),
						totalLegionsDestroyed: round3(state.world.totalLegionsDestroyed + legionsDestroyed + guardSacrifice),
						totalTanksDestroyed: round3(state.world.totalTanksDestroyed + tanksDestroyed),
						totalAircraftDestroyed: round3(state.world.totalAircraftDestroyed + aircraftDestroyed),
						totalDamageDealt: round3(state.world.totalDamageDealt + legionsDestroyed + tanksDestroyed + aircraftDestroyed),
						totalOrbsFromDestruction: round3(state.world.totalOrbsFromDestruction + destructionOrbs),
						lastProcessedAtMs: Date.now(),
					},
				};
			});
		},
		[dragon, orbs, population, rates, setState, state.upgradeLevels, state.world],
	);

	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			const elapsedSeconds = (now - lastProcessedAtMsRef.current) / 1000;
			lastProcessedAtMsRef.current = now;
			processElapsedSeconds(elapsedSeconds);
		}, 1000);
		return () => clearInterval(interval);
	}, [processElapsedSeconds]);

	const purchaseUpgrade = useCallback(
		(id: DragonAttackUpgradeId) => {
			const definition = getUpgradeDefinition(id);
			if (!definition) return { success: false, message: 'Unknown dragon attack upgrade.' };
			const level = getUpgradeLevel(id);
			if (definition.maxLevel !== undefined && level >= definition.maxLevel) return { success: false, message: `${definition.name} is already maxed.` };
			const coinCost = getUpgradeCoinCost(id);
			const orbCost = getUpgradeOrbCost(id);
			if (coins.getCoins() < coinCost || orbs.getOrbs() < orbCost) {
				return { success: false, message: `Need ${formatAbbreviatedNumber(coinCost)} coins and ${formatAbbreviatedNumber(orbCost)} Dragon Orbs.` };
			}
			if (!coins.spendCoins(coinCost)) return { success: false, message: 'Not enough Dragon Coins.' };
			if (!orbs.spendOrbs(orbCost)) {
				coins.addCoins(coinCost);
				return { success: false, message: 'Not enough Dragon Orbs.' };
			}
			setState(current => ({
				...current,
				upgradeLevels: {
					...current.upgradeLevels,
					[id]: (current.upgradeLevels[id] ?? 0) + 1,
				},
			}));
			return { success: true };
		},
		[coins, getUpgradeCoinCost, getUpgradeLevel, getUpgradeOrbCost, orbs, setState],
	);

	const activateAbility = useCallback(
		(id: DragonAttackAbilityId) => {
			const definition = getAbilityDefinition(id);
			if (!definition) return { success: false, message: 'Unknown dragon ability.' };
			if (!orbs.spendOrbs(definition.orbCost)) return { success: false, message: `Need ${formatAbbreviatedNumber(definition.orbCost)} Dragon Orbs.` };
			const now = Date.now();

			setState(current => {
				const next: DragonAttackState = {
					...current,
					abilityUses: { ...current.abilityUses, [id]: (current.abilityUses[id] ?? 0) + 1 },
				};

				if (definition.durationSeconds) {
					next.activeAbilityUntilMs = {
						...current.activeAbilityUntilMs,
						[id]: Math.max(now, current.activeAbilityUntilMs[id] ?? 0) + definition.durationSeconds * 1000,
					};
				}

				if (id === 'guards_attack_all') {
					const guardAttack = Math.min(current.world.dragonGuards, current.world.obsidianLegions);
					next.world = {
						...current.world,
						dragonGuards: round3(current.world.dragonGuards - guardAttack),
						obsidianLegions: round3(current.world.obsidianLegions - guardAttack),
						totalLegionsDestroyed: round3(current.world.totalLegionsDestroyed + guardAttack),
						totalDamageDealt: round3(current.world.totalDamageDealt + guardAttack),
					};
				}

				if (id === 'guard_transformation') {
					next.world = { ...current.world, dragonGuards: round3(current.world.dragonGuards + rates.legionsDestroyedPerDay) };
				}

				if (id === 'tank_transformation') {
					next.world = { ...current.world, dragonTanks: round3(current.world.dragonTanks + rates.tanksDestroyedPerDay) };
				}

				if (id === 'aircraft_transformation') {
					next.world = { ...current.world, dragonAircraft: round3(current.world.dragonAircraft + rates.aircraftDestroyedPerDay) };
				}

				return next;
			});
			return { success: true };
		},
		[orbs, rates.aircraftDestroyedPerDay, rates.legionsDestroyedPerDay, rates.tanksDestroyedPerDay, setState],
	);

	const addObsidianLegions = useCallback(
		(amount: number) => {
			const safeAmount = Math.max(0, Math.min(1_000_000_000, amount));
			if (safeAmount <= 0) return;
			setState(current => ({
				...current,
				world: {
					...current.world,
					obsidianLegions: round3(current.world.obsidianLegions + safeAmount),
				},
			}));
		},
		[setState],
	);

	const addDragonGuards = useCallback(
		(amount: number) => {
			const safeAmount = Math.max(0, Math.min(1_000_000_000, amount));
			if (safeAmount <= 0) return;
			setState(current => ({
				...current,
				world: {
					...current.world,
					dragonGuards: round3(current.world.dragonGuards + safeAmount),
				},
			}));
		},
		[setState],
	);

	const resetDragonAttacks = useCallback(() => setState({ ...INITIAL_ATTACK_STATE, world: { ...INITIAL_WORLD_STATE, lastProcessedAtMs: Date.now() } }), [setState]);

	const value = useMemo<DragonAttacksContextType>(
		() => ({
			upgradeDefinitions: DRAGON_ATTACK_UPGRADES,
			abilityDefinitions: DRAGON_ATTACK_ABILITIES,
			world: state.world,
			rates,
			upgradeLevels: state.upgradeLevels,
			activeAbilityUntilMs: state.activeAbilityUntilMs,
			getUpgradeLevel,
			getUpgradeCoinCost,
			getUpgradeOrbCost,
			getAbilityRemainingSeconds,
			purchaseUpgrade,
			activateAbility,
			addObsidianLegions,
			addDragonGuards,
			resetDragonAttacks,
		}),
		[activateAbility, addDragonGuards, addObsidianLegions, getAbilityRemainingSeconds, getUpgradeCoinCost, getUpgradeLevel, getUpgradeOrbCost, purchaseUpgrade, rates, resetDragonAttacks, state.activeAbilityUntilMs, state.upgradeLevels, state.world],
	);

	return <DragonAttacksContext.Provider value={value}>{children}</DragonAttacksContext.Provider>;
}

export function useDragonAttacks() {
	const context = useContext(DragonAttacksContext);
	if (!context) throw new Error('useDragonAttacks must be used within DragonAttacksProvider');
	return context;
}
