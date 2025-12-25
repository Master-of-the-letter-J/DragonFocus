import React, { createContext, ReactNode, useContext, useState } from 'react';

interface FuryContextType {
	furyMeter: number; // 0 = Yin (passive), 100 = Yang (aggressive)
	addFury: (amount: number) => void;
	setFury: (value: number) => void;
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

	const addFury = (amount: number) => {
		setFuryMeter(prev => Math.max(0, Math.min(100, prev + amount)));
	};

	const setFury = (value: number) => {
		setFuryMeter(Math.max(0, Math.min(100, value)));
	};

	const resetFury = () => setFuryMeter(50);

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
				addFury,
				setFury,
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
