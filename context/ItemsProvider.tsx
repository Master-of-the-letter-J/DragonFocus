import { ItemEconomyProvider } from '@/context/ItemEconomyProvider';
import ItemCoreProvider from '@/context/ItemCoreProvider';
import { ItemSnacksProvider } from '@/context/ItemSnacksProvider';
import { ItemStyleProvider } from '@/context/ItemStyleProvider';
import React, { ReactNode } from 'react';

export { useItemCore as useItems } from '@/context/ItemCoreProvider';
export type { ActiveEffect, EffectDisplayEntry, IdleSummary, ItemsContextType, SnackUseToast, SurveyCompletionBonus } from '@/context/ItemCoreProvider';
export type { ItemType, MarketItem } from '@/context/ItemCoreProvider';

export default function ItemsProvider({ children }: { children: ReactNode }) {
	return (
		<ItemCoreProvider>
			<ItemEconomyProvider>
				<ItemSnacksProvider>
					<ItemStyleProvider>{children}</ItemStyleProvider>
				</ItemSnacksProvider>
			</ItemEconomyProvider>
		</ItemCoreProvider>
	);
}
