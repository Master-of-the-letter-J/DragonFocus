import type { ItemType, MarketItem, QueueGroup } from '@/data/market-types';

export type { ItemType, MarketItem } from '@/data/market-types';

export interface ActiveEffect {
	id: string;
	sourceItemId: string;
	name: string;
	startsAtMs: number;
	endsAtMs: number;
	queueGroup?: QueueGroup;
	surveyMultiplier?: number;
	generatorMultiplier?: number;
	clickerMultiplier?: number;
	jeopardyMultiplier?: number;
	furyPerDay?: number;
	healthPerDay?: number;
	effectTag?: string;
	protectedEffect?: boolean;
}

export interface IdleSummary {
	elapsedSeconds: number;
	coins: number;
	fireXp: number;
	shards: number;
	furyEarned: number;
	furyLost: number;
	furyTotal: number;
	healthEarned: number;
	healthLost: number;
	healthTotal: number;
}

export interface SnackUseToast {
	name: string;
	topEffect: string;
}

export interface EffectDisplayEntry {
	id: string;
	name: string;
	topEffect: string;
	remainingSeconds: number;
	startsInSeconds: number;
	strength: number;
}

export interface SurveyCompletionBonus {
	finalCoins: number;
	finalShards: number;
	snackDrops: number;
}

export interface EffectSnapshot {
	surveyMultiplier: number;
	generatorMultiplier: number;
	clickerMultiplier: number;
	jeopardyMultiplier: number;
	furyPerDay: number;
	healthPerDay: number;
}

export interface SimResult {
	coins: number;
	fireXp: number;
	shards: number;
	furyDelta: number;
	healthDelta: number;
}

export interface ItemsContextType {
	marketItems: MarketItem[];
	ownedItems: Record<string, number>;
	purchaseItem: (id: string) => boolean;
	useItem: (id: string) => boolean;
	addItemToInventory: (id: string, qty?: number) => void;
	sellItem: (id: string) => boolean;
	processDailyPayouts: () => number;
	processDragonClick: () => number;
	getClickReward: () => number;
	getItemCoinCost: (id: string) => number;
	getItemShardCost: (id: string) => number;
	getItemSoulCost: (id: string) => number;
	getGeneratorProductionPerDay: (id: string) => number;
	getTotalGeneratorProductionPerDay: () => number;
	activeEffects: ActiveEffect[];
	getActiveCoinMultiplier: () => number;
	getActiveJeopardyMultiplier: () => number;
	getSurveyMultiplier: () => number;
	getGeneratorMultiplier: () => number;
	getClickerMultiplier: () => number;
	getSurveyCompletionBonus: (surveyCoins: number, baseShards?: number, currentScarLevel?: number) => SurveyCompletionBonus;
	grantRandomUnlockedSnacks: (count: number, currentScarLevel?: number) => string[];
	getEffectDisplayList: () => EffectDisplayEntry[];
	pendingIdleSummary: IdleSummary | null;
	consumeIdleSummary: () => void;
	snackToast: SnackUseToast | null;
	consumeSnackToast: () => void;
	clearEffects: (includeProtected?: boolean) => void;
	addCustomEffect: (effect: Omit<ActiveEffect, 'id' | 'startsAtMs' | 'endsAtMs'> & { days: number }) => void;
	resetSnackPrices: () => void;
	resetAfterAscension: () => void;
	getOwnedTotalByType: (type: ItemType) => number;
	getSoulMultiplierRefundTotal: () => number;
	resetSoulMultipliers: () => number;
	resetInventory: () => void;
}

