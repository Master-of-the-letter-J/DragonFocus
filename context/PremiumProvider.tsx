import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useContext } from 'react';

interface PremiumContextType {
	isPremium: boolean;
	setPremium: (isPremium: boolean) => void;
	getPremium: () => boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
	const { state: isPremium, setState: setIsPremiumState } = usePersistedState(APP_STORAGE_KEYS.premium, false);

	const setPremium = (isPremium: boolean) => {
		setIsPremiumState(isPremium);
	};

	const getPremium = () => isPremium;

	return (
		<PremiumContext.Provider
			value={{
				isPremium,
				setPremium,
				getPremium,
			}}>
			{children}
		</PremiumContext.Provider>
	);
}

export function usePremium() {
	const context = useContext(PremiumContext);
	if (!context) {
		throw new Error('usePremium must be used within PremiumProvider');
	}
	return context;
}
