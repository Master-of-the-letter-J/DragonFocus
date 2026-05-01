import { roundToDecimalPlaces } from '@/constants/number-abbreviation';
import React, { createContext, ReactNode, useContext, useState } from 'react';

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

export function FuryProvider({ children }: { children: ReactNode }) {
	const [furyMeter, setFuryMeter] = useState(50); // Start at neutral
	const [maxFuryBonus, setMaxFuryBonusState] = useState(0);

	const maxFury = 100 + Math.max(0, maxFuryBonus);

	const addFury = (amount: number) => {
		setFuryMeter(prev => roundToDecimalPlaces(Math.max(0, Math.min(maxFury, prev + amount)), 3));
	};

	const setFury = (value: number) => {
		setFuryMeter(roundToDecimalPlaces(Math.max(0, Math.min(maxFury, value)), 3));
	};

	const resetFury = () => setFuryMeter(50);
	const setMaxFuryBonus = (bonus: number) => {
		const nextBonus = Math.max(0, Math.floor(bonus));
		setMaxFuryBonusState(nextBonus);
		setFuryMeter(prev => roundToDecimalPlaces(Math.max(0, Math.min(100 + nextBonus, prev)), 3));
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
