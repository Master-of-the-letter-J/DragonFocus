import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useCallback, useContext } from 'react';
import { useDragonOrbs } from './DragonOrbsProvider';

interface PopulationState {
	population: number;
	deathCount: number;
	externalGrowthBonus: number;
}

interface PopulationContextType {
	population: number;
	deathCount: number;
	addPopulation: (amount: number) => void;
	setPopulation: (amount: number) => void;
	destroyPopulation: (amount: number) => void;
	dailyPopulationUpdate: (yang: number, dragonAge: number) => void;
	onDragonRevival: () => void; // Add 1M when dragon revived
	setExternalGrowthBonus: (amount: number) => void;
	resetPopulationConflict: () => void;
}

const PopulationContext = createContext<PopulationContextType | undefined>(undefined);

const STARTING_POPULATION = 8_000_000_000; // 8 billion

const INITIAL_POPULATION_STATE: PopulationState = {
	population: STARTING_POPULATION,
	deathCount: 0,
	externalGrowthBonus: 0,
};

export function PopulationProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.population, INITIAL_POPULATION_STATE);
	const orbs = useDragonOrbs();

	const addPopulation = useCallback((amount: number) => {
		setState(current => ({
			...current,
			population: Math.max(0, current.population + amount),
		}));
	}, [setState]);

	const setPopulation = useCallback((amount: number) => {
		setState(current => ({
			...current,
			population: Math.max(0, amount),
		}));
	}, [setState]);

	const destroyPopulation = useCallback((amount: number) => {
		if (amount <= 0) return;
		const deaths = Math.min(state.population, amount);
		if (deaths <= 0) return;
		orbs.earnOrbs(deaths * 0.001, 'attack');
		setState(current => {
			const actualDeaths = Math.min(current.population, deaths);
			return {
				...current,
				population: Math.max(0, current.population - actualDeaths),
				deathCount: current.deathCount + actualDeaths,
			};
		});
	}, [orbs, setState, state.population]);

	const dailyPopulationUpdate = useCallback((yang: number, dragonAge: number) => {
		let projectedDeaths = 0;
		if (yang > 50) {
			const overYangRatio = Math.max(0, Math.min(1, (yang - 50) / 50));
			const maxDecreasePercent = 5 + Math.min(20, dragonAge / 73);
			const decreasePercent = (maxDecreasePercent / 100) * overYangRatio;
			projectedDeaths += Math.floor(state.population * decreasePercent);
			projectedDeaths += Math.floor(50_000 * overYangRatio);
		}
		if (projectedDeaths > 0) orbs.earnOrbs(projectedDeaths * 0.001, 'attack');

		setState(current => {
			let newPop = current.population;
			let deaths = 0;

			// +1% growth daily, plus transcension growth bonuses.
			newPop += current.population * (0.01 + Math.max(0, current.externalGrowthBonus));

			// Decrease scales linearly once Yang exceeds 50.
			if (yang > 50) {
				const overYangRatio = Math.max(0, Math.min(1, (yang - 50) / 50));
				const maxDecreasePercent = 5 + Math.min(20, dragonAge / 73);
				const decreasePercent = (maxDecreasePercent / 100) * overYangRatio;
				const popDecrease = Math.floor(current.population * decreasePercent);
				newPop -= popDecrease;
				deaths += popDecrease;
				const flatLoss = Math.floor(50_000 * overYangRatio);
				newPop -= flatLoss;
				deaths += flatLoss;
			}

			return {
				...current,
				population: Math.max(0, newPop),
				deathCount: current.deathCount + deaths,
			};
		});
	}, [orbs, setState, state.population]);

	const onDragonRevival = useCallback(() => {
		addPopulation(1_000_000); // +1 million on revival
	}, [addPopulation]);

	return (
		<PopulationContext.Provider
			value={{
				population: state.population,
				deathCount: state.deathCount,
				addPopulation,
				setPopulation,
				destroyPopulation,
				dailyPopulationUpdate,
				onDragonRevival,
				setExternalGrowthBonus: amount =>
					setState(current => ({
						...current,
						externalGrowthBonus: Math.max(0, amount),
					})),
				resetPopulationConflict: () =>
					setState(current => ({
						...current,
						deathCount: 0,
					})),
			}}>
			{children}
		</PopulationContext.Provider>
	);
}

export function usePopulation() {
	const ctx = useContext(PopulationContext);
	if (!ctx) throw new Error('usePopulation must be used within PopulationProvider');
	return ctx;
}
