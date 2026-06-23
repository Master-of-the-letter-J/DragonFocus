import { roundToDecimalPlaces } from '@/constants/number-abbreviation';
import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useContext } from 'react';
import { useGraveyard } from './GraveyardProvider';

export type DragonAge = 'Egg' | 'Hatchling' | 'Dragonet' | 'Juvenile' | 'Young Adult' | 'Adult' | 'Elder Dragon' | 'Wyrm';

export interface DragonStage {
	name: DragonAge;
	minAge: number;
	maxAge: number;
	maxHP: number;
}

const DRAGON_STAGES: DragonStage[] = [
	{ name: 'Egg', minAge: 0, maxAge: 10, maxHP: 30 },
	{ name: 'Hatchling', minAge: 10, maxAge: 20, maxHP: 40 },
	{ name: 'Dragonet', minAge: 20, maxAge: 30, maxHP: 50 },
	{ name: 'Juvenile', minAge: 30, maxAge: 90, maxHP: 75 },
	{ name: 'Young Adult', minAge: 90, maxAge: 180, maxHP: 100 },
	{ name: 'Adult', minAge: 180, maxAge: 270, maxHP: 150 },
	{ name: 'Elder Dragon', minAge: 270, maxAge: 365, maxHP: 250 },
	{ name: 'Wyrm', minAge: 365, maxAge: Infinity, maxHP: 500 },
];

type DragonLifeState = 'unspawned' | 'alive' | 'dead' | 'awaiting revival';
type DragonLifecycleEvent = { id: number; type: 'spawned' | 'died' | 'revived' } | null;

interface DragonContextType {
	age: number;
	hp: number;
	maxHP: number;
	currentStage: DragonStage;
	dragonName: string;
	dragonJrCount: number;
	deathDebuffDays: number;
	invincible?: boolean;
	dragonState: DragonLifeState;
	lastLifecycleEvent: DragonLifecycleEvent;
	spawnDragon: () => void;
	clearLifecycleEvent: () => void;
	incrementAge: () => void;
	damageHp: (amount: number) => void;
	healHp: (amount: number) => void;
	setHp: (amount: number) => void;
	regenerateHP: (yinValue: number) => void;
	addHealthFromSurvey: () => void;
	addHealthFromGoal: (amount?: number) => void;
	dailyHealthPenalty: (yinValue: number) => void;
	getStageForAge: (age: number) => DragonStage;
	setDragonName: (name: string) => void;
	die: () => void;
	revive: () => void;
	resetDragon?: () => void;
	getHealthStage: () => 'Depression' | 'Mediocre' | 'Jolly';
	setInvincible?: (v: boolean) => void;
	setAge?: (v: number) => void;
}

interface DragonStoreState {
	age: number;
	hp: number;
	dragonName: string;
	dragonJrCount: number;
	deathDebuffDays: number;
	invincible: boolean;
	dragonState: DragonLifeState;
	lastLifecycleEvent: DragonLifecycleEvent;
}

const INITIAL_DRAGON_STATE: DragonStoreState = {
	age: 0,
	hp: DRAGON_STAGES[0].maxHP,
	dragonName: 'My Dragon',
	dragonJrCount: 0,
	deathDebuffDays: 0,
	invincible: false,
	dragonState: 'unspawned',
	lastLifecycleEvent: null,
};

const getStageForAgeValue = (ageValue: number): DragonStage =>
	DRAGON_STAGES.find(stage => ageValue >= stage.minAge && ageValue < stage.maxAge) ?? DRAGON_STAGES[DRAGON_STAGES.length - 1];

const normalizeDragonState = (storedState: DragonStoreState | null, initialState: DragonStoreState): DragonStoreState => {
	if (!storedState) return initialState;
	const safeAge = Math.max(0, Math.floor(storedState.age ?? initialState.age));
	const safeMaxHp = getStageForAgeValue(safeAge).maxHP;

	return {
		...initialState,
		...storedState,
		age: safeAge,
		hp: Math.max(0, Math.min(safeMaxHp, Number(storedState.hp ?? safeMaxHp))),
		dragonName: typeof storedState.dragonName === 'string' && storedState.dragonName.trim() ? storedState.dragonName.trim() : initialState.dragonName,
		dragonJrCount: Math.max(0, Math.floor(storedState.dragonJrCount ?? 0)),
		deathDebuffDays: Math.max(0, Math.floor(storedState.deathDebuffDays ?? 0)),
		invincible: !!storedState.invincible,
		dragonState: ['unspawned', 'alive', 'dead', 'awaiting revival'].includes(storedState.dragonState) ? storedState.dragonState : initialState.dragonState,
		lastLifecycleEvent: null,
	};
};

const DragonContext = createContext<DragonContextType | undefined>(undefined);

export function DragonProvider({ children }: { children: ReactNode }) {
	const graveyard = useGraveyard();
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.dragon, INITIAL_DRAGON_STATE, { normalize: normalizeDragonState });

	const currentStage = getStageForAgeValue(state.age);
	const maxHP = currentStage.maxHP;

	const updateHp = (amount: number) => {
		const nextHp = roundToDecimalPlaces(Math.max(0, Math.min(maxHP, amount)), 3);
		setState(current => ({ ...current, hp: nextHp }));
		if (nextHp <= 0 && state.dragonState === 'alive' && !state.invincible) {
			markDead();
		}
	};

	const markDead = () => {
		if (state.invincible) return;
		setState(current => ({
			...current,
			dragonState: current.dragonState === 'dead' ? 'dead' : 'dead',
			deathDebuffDays: 3,
			lastLifecycleEvent: { id: Date.now(), type: 'died' },
		}));
	};

	const incrementAge = () => {
		if (state.dragonState !== 'alive') return;
		setState(current => {
			const nextAge = current.age + 1;
			const nextMaxHp = getStageForAgeValue(nextAge).maxHP;
			return {
				...current,
				age: nextAge,
				hp: nextMaxHp > maxHP ? Math.min(current.hp + 5, nextMaxHp) : current.hp,
			};
		});
	};

	const getHealthStage = (): 'Depression' | 'Mediocre' | 'Jolly' => {
		const healthPercent = (state.hp / maxHP) * 100;
		if (healthPercent < 33) return 'Depression';
		if (healthPercent < 67) return 'Mediocre';
		return 'Jolly';
	};

	const revive = () => {
		graveyard.addEntry({
			id: `grave_${Date.now()}`,
			name: state.dragonName,
			age: state.age,
			stage: currentStage.name,
			hp: state.hp,
			maxHP,
			healthState: getHealthStage(),
			generation: state.dragonJrCount + 1,
			date: new Date().toISOString().split('T')[0],
			cause: state.hp <= 0 ? 'Health reached 0' : 'Containment breach',
		});

		setState(current => ({
			...current,
			age: 0,
			hp: DRAGON_STAGES[0].maxHP,
			dragonName: `Dragon Jr. ${current.dragonJrCount + 1}`,
			dragonJrCount: current.dragonJrCount + 1,
			deathDebuffDays: 3,
			dragonState: 'alive',
			lastLifecycleEvent: { id: Date.now(), type: 'revived' },
		}));
	};

	return (
		<DragonContext.Provider
			value={{
				age: state.age,
				hp: state.hp,
				maxHP,
				currentStage,
				dragonName: state.dragonName,
				dragonJrCount: state.dragonJrCount,
				deathDebuffDays: state.deathDebuffDays,
				invincible: state.invincible,
				dragonState: state.dragonState,
				lastLifecycleEvent: state.lastLifecycleEvent,
				spawnDragon: () => setState(current => ({ ...current, dragonState: 'alive', lastLifecycleEvent: { id: Date.now(), type: 'spawned' } })),
				clearLifecycleEvent: () => setState(current => ({ ...current, lastLifecycleEvent: null })),
				incrementAge,
				damageHp: amount => updateHp(state.hp - amount),
				healHp: amount => updateHp(state.hp + amount),
				setHp: updateHp,
				regenerateHP: yinValue => updateHp(state.hp + Math.floor(yinValue / 10)),
				addHealthFromSurvey: () => updateHp(state.hp + 2),
				addHealthFromGoal: (amount = 2) => updateHp(state.hp + amount),
				dailyHealthPenalty: yinValue => {
					if (yinValue < 50) updateHp(state.hp - 10);
				},
				getStageForAge: getStageForAgeValue,
				setDragonName: name => setState(current => ({ ...current, dragonName: name.trim() || current.dragonName })),
				die: markDead,
				revive,
				resetDragon: () => setState(INITIAL_DRAGON_STATE),
				getHealthStage,
				setInvincible: invincible => setState(current => ({ ...current, invincible })),
				setAge: age => {
					const nextAge = Math.max(0, Math.floor(age));
					const nextMaxHp = getStageForAgeValue(nextAge).maxHP;
					setState(current => ({ ...current, age: nextAge, hp: Math.min(current.hp, nextMaxHp) }));
				},
			}}>
			{children}
		</DragonContext.Provider>
	);
}

export function useDragon() {
	const context = useContext(DragonContext);
	if (!context) {
		throw new Error('useDragon must be used within DragonProvider');
	}
	return context;
}
