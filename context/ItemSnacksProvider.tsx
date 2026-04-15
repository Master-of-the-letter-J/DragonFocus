import type { MarketItem } from '@/data/market-types';
import type { ActiveEffect, EffectDisplayEntry, SnackUseToast, SurveyCompletionBonus } from '@/context/ItemCoreProvider';
import { useItemCore } from '@/context/ItemCoreProvider';
import React, { ReactNode, createContext, useContext, useMemo } from 'react';

interface ItemSnacksContextType {
	snackItems: MarketItem[];
	ownedItems: Record<string, number>;
	activeEffects: ActiveEffect[];
	snackToast: SnackUseToast | null;
	purchaseSnack: (id: string) => boolean;
	useSnack: (id: string) => boolean;
	getSnackCoinCost: (id: string) => number;
	getSnackShardCost: (id: string) => number;
	getSurveyCompletionBonus: (surveyCoins: number, baseShards?: number, currentScarLevel?: number) => SurveyCompletionBonus;
	grantRandomUnlockedSnacks: (count: number, currentScarLevel?: number) => string[];
	getEffectDisplayList: () => EffectDisplayEntry[];
	clearEffects: (includeProtected?: boolean) => void;
	addCustomEffect: ReturnType<typeof useItemCore>['addCustomEffect'];
	resetSnackPrices: () => void;
	consumeSnackToast: () => void;
}

const ItemSnacksContext = createContext<ItemSnacksContextType | undefined>(undefined);

export function ItemSnacksProvider({ children }: { children: ReactNode }) {
	const items = useItemCore();
	const value = useMemo<ItemSnacksContextType>(
		() => ({
			snackItems: items.marketItems.filter(item => item.type === 'snack'),
			ownedItems: items.ownedItems,
			activeEffects: items.activeEffects,
			snackToast: items.snackToast,
			purchaseSnack: items.purchaseItem,
			useSnack: items.useItem,
			getSnackCoinCost: items.getItemCoinCost,
			getSnackShardCost: items.getItemShardCost,
			getSurveyCompletionBonus: items.getSurveyCompletionBonus,
			grantRandomUnlockedSnacks: items.grantRandomUnlockedSnacks,
			getEffectDisplayList: items.getEffectDisplayList,
			clearEffects: items.clearEffects,
			addCustomEffect: items.addCustomEffect,
			resetSnackPrices: items.resetSnackPrices,
			consumeSnackToast: items.consumeSnackToast,
		}),
		[items],
	);

	return <ItemSnacksContext.Provider value={value}>{children}</ItemSnacksContext.Provider>;
}

export function useItemSnacks() {
	const context = useContext(ItemSnacksContext);
	if (!context) throw new Error('useItemSnacks must be used within ItemSnacksProvider');
	return context;
}
