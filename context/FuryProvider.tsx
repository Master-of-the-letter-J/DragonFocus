import { roundToDecimalPlaces } from '@/constants/number-abbreviation';
import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useContext } from 'react';

interface FuryContextType {
	furyMeter: number; // 0 = Yin (passive), 100 = Yang (aggressive)
	maxFury: number;
	addFury: (amount: number) => void;
	setFury: (value: number) => void;
	setMaxFuryBonus: (bonus: number) => void;
	getMaxFury: () => number;
	incrementFuryFromSkippedSurveys: (count: number) => void; // +10 per skipped
	incrementFuryFromMissedGoals: (count: number) => void; // +1 per missed
	decrementFuryFromCompletedGoals: (count: number) => void; // -2 per completed
	decrementFuryFromLateGoals: (count: number) => void; // -1 per late completed
	decrementFuryFromStreak: (streak: number) => void; // -1 * streak / day
	resetFury?: () => void;
}

const FuryContext = createContext<FuryContextType | undefined>(undefined);

interface FuryState {
	furyMeter: number;
	maxFuryBonus: number;
}

const INITIAL_FURY_STATE: FuryState = {
	furyMeter: 50,
	maxFuryBonus: 0,
};

export function FuryProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.fury, INITIAL_FURY_STATE, {
		normalize: (storedValue, initialValue) => ({ ...initialValue, ...(storedValue ?? {}) }),
	});

	const furyMeter = state.furyMeter;
	const maxFury = 100 + Math.max(0, state.maxFuryBonus);
	const absoluteFuryLimit = maxFury * 2;

	const addFury = (amount: number) => {
		setState(prev => ({
			...prev,
			furyMeter: roundToDecimalPlaces(Math.max(0, Math.min(absoluteFuryLimit, prev.furyMeter + amount)), 3),
		}));
	};

	const setFury = (value: number) => {
		setState(prev => ({
			...prev,
			furyMeter: roundToDecimalPlaces(Math.max(0, Math.min(absoluteFuryLimit, value)), 3),
		}));
	};

	const resetFury = () => setState(INITIAL_FURY_STATE);
	const setMaxFuryBonus = (bonus: number) => {
		const nextBonus = Math.max(0, Math.floor(bonus));
		setState(prev => ({
			maxFuryBonus: nextBonus,
			furyMeter: roundToDecimalPlaces(Math.max(0, Math.min((100 + nextBonus) * 2, prev.furyMeter)), 3),
		}));
	};
	const getMaxFury = () => maxFury;

	const incrementFuryFromSkippedSurveys = (count: number) => {
		addFury(count * 10);
	};

	const incrementFuryFromMissedGoals = (count: number) => {
		addFury(count * 1);
	};

	const decrementFuryFromCompletedGoals = (count: number) => {
		addFury(count * -2);
	};

	const decrementFuryFromLateGoals = (count: number) => {
		addFury(count * -1);
	};

	const decrementFuryFromStreak = (streak: number) => {
		addFury(-1 * streak);
	};

	return (
		<FuryContext.Provider
			value={{
				furyMeter,
				maxFury,
				addFury,
				setFury,
				setMaxFuryBonus,
				getMaxFury,
				resetFury,
				incrementFuryFromSkippedSurveys,
				incrementFuryFromMissedGoals,
				decrementFuryFromCompletedGoals,
				decrementFuryFromLateGoals,
				decrementFuryFromStreak,
			}}>
			{children}
		</FuryContext.Provider>
	);
}

export function useFury() {
	const context = useContext(FuryContext);
	if (!context) {
		throw new Error('useFury must be used within FuryProvider');
	}
	return context;
}
