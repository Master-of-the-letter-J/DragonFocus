import type { MarketItem } from '@/data/market-types';
import { useItemCore } from '@/context/ItemCoreProvider';
import React, { ReactNode, createContext, useContext, useMemo } from 'react';

interface ItemEconomyContextType {
	generatorItems: MarketItem[];
	clickerItems: MarketItem[];
	soulMultiplierItems: MarketItem[];
	ownedItems: Record<string, number>;
	pendingIdleSummary: ReturnType<typeof useItemCore>['pendingIdleSummary'];
	consumeIdleSummary: () => void;
	purchaseItem: (id: string) => boolean;
	sellItem: (id: string) => boolean;
	processDailyPayouts: () => number;
	processDragonClick: () => number;
	getClickReward: () => number;
	getItemCoinCost: (id: string) => number;
	getItemShardCost: (id: string) => number;
	getItemSoulCost: (id: string) => number;
	getOwnedTotalByType: ReturnType<typeof useItemCore>['getOwnedTotalByType'];
	getGeneratorProductionPerDay: (id: string) => number;
	getTotalGeneratorProductionPerDay: () => number;
	getSurveyMultiplier: () => number;
	getGeneratorMultiplier: () => number;
	getClickerMultiplier: () => number;
	getActiveJeopardyMultiplier: () => number;
	getActiveCoinMultiplier: () => number;
	getSoulMultiplierRefundTotal: () => number;
	resetSoulMultipliers: () => number;
	resetAfterAscension: () => void;
}

const ItemEconomyContext = createContext<ItemEconomyContextType | undefined>(undefined);

export function ItemEconomyProvider({ children }: { children: ReactNode }) {
	const items = useItemCore();
	const value = useMemo<ItemEconomyContextType>(
		() => ({
			generatorItems: items.marketItems.filter(item => item.type === 'generator'),
			clickerItems: items.marketItems.filter(item => item.type === 'clicker'),
			soulMultiplierItems: items.marketItems.filter(item => item.type === 'soulMultiplier'),
			ownedItems: items.ownedItems,
			pendingIdleSummary: items.pendingIdleSummary,
			consumeIdleSummary: items.consumeIdleSummary,
			purchaseItem: items.purchaseItem,
			sellItem: items.sellItem,
			processDailyPayouts: items.processDailyPayouts,
			processDragonClick: items.processDragonClick,
			getClickReward: items.getClickReward,
			getItemCoinCost: items.getItemCoinCost,
			getItemShardCost: items.getItemShardCost,
			getItemSoulCost: items.getItemSoulCost,
			getOwnedTotalByType: items.getOwnedTotalByType,
			getGeneratorProductionPerDay: items.getGeneratorProductionPerDay,
			getTotalGeneratorProductionPerDay: items.getTotalGeneratorProductionPerDay,
			getSurveyMultiplier: items.getSurveyMultiplier,
			getGeneratorMultiplier: items.getGeneratorMultiplier,
			getClickerMultiplier: items.getClickerMultiplier,
			getActiveJeopardyMultiplier: items.getActiveJeopardyMultiplier,
			getActiveCoinMultiplier: items.getActiveCoinMultiplier,
			getSoulMultiplierRefundTotal: items.getSoulMultiplierRefundTotal,
			resetSoulMultipliers: items.resetSoulMultipliers,
			resetAfterAscension: items.resetAfterAscension,
		}),
		[items],
	);

	return <ItemEconomyContext.Provider value={value}>{children}</ItemEconomyContext.Provider>;
}

export function useItemEconomy() {
	const context = useContext(ItemEconomyContext);
	if (!context) throw new Error('useItemEconomy must be used within ItemEconomyProvider');
	return context;
}
