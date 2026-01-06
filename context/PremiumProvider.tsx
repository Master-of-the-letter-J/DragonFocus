import React, { createContext, ReactNode, useContext, useState } from 'react';

interface PremiumContextType {
	isPremium: boolean;
	setPremium: (isPremium: boolean) => void;
	getPremium: () => boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
	const [isPremium, setIsPremiumState] = useState(false);

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
