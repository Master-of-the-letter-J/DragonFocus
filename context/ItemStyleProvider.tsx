import type { MarketItem } from '@/data/market-types';
import { useItemCore } from '@/context/ItemCoreProvider';
import React, { ReactNode, createContext, useContext, useMemo } from 'react';

interface ItemStyleContextType {
	cosmeticItems: MarketItem[];
	themeItems: MarketItem[];
	ownedItems: Record<string, number>;
	purchaseItem: (id: string) => boolean;
	getItemCoinCost: (id: string) => number;
	getItemShardCost: (id: string) => number;
}

const ItemStyleContext = createContext<ItemStyleContextType | undefined>(undefined);

export function ItemStyleProvider({ children }: { children: ReactNode }) {
	const items = useItemCore();
	const value = useMemo<ItemStyleContextType>(
		() => ({
			cosmeticItems: items.marketItems.filter(item => item.type === 'cosmetic'),
			themeItems: items.marketItems.filter(item => item.type === 'theme'),
			ownedItems: items.ownedItems,
			purchaseItem: items.purchaseItem,
			getItemCoinCost: items.getItemCoinCost,
			getItemShardCost: items.getItemShardCost,
		}),
		[items],
	);

	return <ItemStyleContext.Provider value={value}>{children}</ItemStyleContext.Provider>;
}

export function useItemStyle() {
	const context = useContext(ItemStyleContext);
	if (!context) throw new Error('useItemStyle must be used within ItemStyleProvider');
	return context;
}
