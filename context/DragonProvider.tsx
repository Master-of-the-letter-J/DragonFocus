import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useGraveyard } from '../context/GraveyardProvider';

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

interface DragonContextType {
	age: number;
	hp: number;
	maxHP: number;
	currentStage: DragonStage;
	dragonName: string;
	dragonJrCount: number;
	deathDebuffDays: number;
	invincible?: boolean;
	dragonState: 'unspawned' | 'alive' | 'dead' | 'awaiting revival';
	lastLifecycleEvent: { id: number; type: 'spawned' | 'died' | 'revived' } | null;
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

const DragonContext = createContext<DragonContextType | undefined>(undefined);

/**@requires GraveyardProvider */
export function DragonProvider({ children }: { children: ReactNode }) {
	const graveyard = useGraveyard(); // <-- NEW

	const getStageForAge = (ageValue: number): DragonStage => {
		return DRAGON_STAGES.find(stage => ageValue >= stage.minAge && ageValue < stage.maxAge) || DRAGON_STAGES[DRAGON_STAGES.length - 1];
	};

	const [age, setAge] = useState(0);
	const initialStage = getStageForAge(0);
	const [hp, setHp] = useState(initialStage.maxHP);
	const [dragonName, setDragonName] = useState('My Dragon');
	const [dragonJrCount, setDragonJrCount] = useState(0);
	const [deathDebuffDays, setDeathDebuffDays] = useState(0);
	const [invincible, setInvincible] = useState(false);
	const [dragonState, setDragonState] = useState<'unspawned' | 'alive' | 'dead' | 'awaiting revival'>('unspawned');
	const [lastLifecycleEvent, setLastLifecycleEvent] = useState<{ id: number; type: 'spawned' | 'died' | 'revived' } | null>(null);

	const currentStage = getStageForAge(age);
	const maxHP = currentStage.maxHP;

	const incrementAge = () => {
		if (dragonState !== 'alive') return;
		setAge(prev => prev + 1);
		const newStage = getStageForAge(age + 1);
		if (newStage.maxHP > maxHP) {
			setHp(prev => Math.min(prev + 5, newStage.maxHP));
		}
	};

	const setAgeValue = (v: number) => {
		setAge(Math.max(0, Math.floor(v)));
	};

	const spawnDragon = () => {
		setDragonState('alive');
		setLastLifecycleEvent({ id: Date.now(), type: 'spawned' });
	};

	const markDead = () => {
		setDragonState(prev => {
			if (prev === 'dead') return prev;
			return 'dead';
		});
		setLastLifecycleEvent({ id: Date.now(), type: 'died' });
		setDeathDebuffDays(3);
	};

	const damageHp = (amount: number) => {
		setHp(prev => {
			const nextHp = Math.max(0, prev - amount);
			if (nextHp <= 0 && dragonState === 'alive' && !invincible) {
				markDead();
			}
			return nextHp;
		});
	};

	const healHp = (amount: number) => {
		setHp(prev => Math.min(maxHP, prev + amount));
	};

	const setHpValue = (amount: number) => {
		const nextHp = Math.max(0, Math.min(maxHP, amount));
		setHp(nextHp);
		if (nextHp <= 0 && dragonState === 'alive' && !invincible) {
			markDead();
		}
	};

	const regenerateHP = (yinValue: number) => {
		const regenerationAmount = Math.floor(yinValue / 10);
		healHp(regenerationAmount);
	};

	const addHealthFromSurvey = () => {
		healHp(2);
	};

	const addHealthFromGoal = (amount: number = 2) => {
		healHp(amount);
	};

	const dailyHealthPenalty = (yinValue: number) => {
		if (yinValue < 50) {
			damageHp(10);
		}
	};

	const getHealthStage = (): 'Depression' | 'Mediocre' | 'Jolly' => {
		const healthPercent = (hp / maxHP) * 100;
		if (healthPercent < 33) return 'Depression';
		if (healthPercent < 67) return 'Mediocre';
		return 'Jolly';
	};

	// -------------------------------------------------------
	// 🪦 DEATH LOGIC — TRANSITION TO 'dead' STATE
	// -------------------------------------------------------
	const die = () => {
		if (invincible) return;
		markDead();
	};

	// -------------------------------------------------------
	// ✨ REVIVE LOGIC — ADD TO GRAVEYARD & RESET
	// -------------------------------------------------------
	const revive = () => {
		// 1. Log graveyard entry
		graveyard.addEntry({
			id: `grave_${Date.now()}`,
			name: dragonName,
			age,
			stage: currentStage.name,
			hp,
			maxHP,
			healthState: getHealthStage(),
			generation: dragonJrCount + 1,
			date: new Date().toISOString().split('T')[0],
			cause: 'Health reached 0',
		});

		// 2. Reset dragon (new generation)
		setAge(0);
		setDragonJrCount(prev => prev + 1);
		setDragonName(`Dragon Jr. ${dragonJrCount + 1}`);
		const newStage = getStageForAge(0);
		setHp(newStage.maxHP);
		setDeathDebuffDays(3);
		setDragonState('alive');
		setLastLifecycleEvent({ id: Date.now(), type: 'revived' });
	};

	const resetDragon = () => {
		setAge(0);
		setHp(getStageForAge(0).maxHP);
		setDragonName('My Dragon');
		setDragonJrCount(0);
		setDeathDebuffDays(0);
		setInvincible(false);
		setDragonState('unspawned');
		setLastLifecycleEvent(null);
	};

	return (
		<DragonContext.Provider
			value={{
				age,
				hp,
				maxHP,
				currentStage,
				dragonName,
				dragonJrCount,
				deathDebuffDays,
				invincible,
				dragonState,
				lastLifecycleEvent,
				spawnDragon,
				clearLifecycleEvent: () => setLastLifecycleEvent(null),
				setInvincible,
				incrementAge,
				damageHp,
				healHp,
				setHp: setHpValue,
				regenerateHP,
				addHealthFromSurvey,
				addHealthFromGoal,
				dailyHealthPenalty,
				getStageForAge,
				setDragonName,
				setAge: setAgeValue,
				die,
				revive,
				resetDragon,
				getHealthStage,
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
