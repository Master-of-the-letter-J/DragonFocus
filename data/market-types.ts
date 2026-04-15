export type ItemType = 'snack' | 'cosmetic' | 'generator' | 'clicker' | 'theme' | 'soulMultiplier';

export type QueueGroup = 'survey' | 'generator' | 'clicker' | 'jeopardy';

export interface MarketItemBase {
	id: string;
	name: string;
	type: ItemType;
	description?: string;
	scarLevelRequired?: number;
	icon?: string;
	coinCost?: number;
	coinGrowth?: number;
	shardCost?: number;
	shardGrowth?: number;
	soulCost?: number;
	soulGrowth?: number;
}

export type GeneratorFormula =
	| 'flat'
	| 'yang'
	| 'yin'
	| 'streak'
	| 'antiTreasury'
	| 'scarLevel'
	| 'age'
	| 'destroyedPopulation'
	| 'population'
	| 'totalGeneratorCount'
	| 'bigStick';

export interface GeneratorItem extends MarketItemBase {
	type: 'generator';
	formula: GeneratorFormula;
	baseOutput: number;
}

export type ClickerFormula = 'dragonClicks' | 'ageMultiplier' | 'demonicClicks' | 'megaClicks' | 'impossibleClicks';

export interface ClickerItem extends MarketItemBase {
	type: 'clicker';
	formula: ClickerFormula;
}

export interface SnackItem extends MarketItemBase {
	type: 'snack';
	effectId: string;
}

export type SoulEffect =
	| { kind: 'universalMultiplier'; factor: number }
	| { kind: 'universalCrucible'; factorPerHundred: number }
	| { kind: 'clickMultiplier'; factor: number }
	| { kind: 'ritualMultiplier'; factor: number }
	| { kind: 'impossibleEffects'; factor: number }
	| { kind: 'eternalShards'; factor: number }
	| { kind: 'surveyExploitationI'; factor: number }
	| { kind: 'surveyExploitationII'; factor: number }
	| { kind: 'surveyExploitationIII'; factor: number }
	| { kind: 'surveyDuplicationGlitch'; factor: number }
	| { kind: 'generatorSpecificMultiplier'; factor: number; relatedGeneratorId: string }
	| { kind: 'generatorSpecificCrucible'; power: number; relatedGeneratorId: string };

export interface SoulMultiplierItem extends MarketItemBase {
	type: 'soulMultiplier';
	soulEffect: SoulEffect;
}

export interface CosmeticItem extends MarketItemBase {
	type: 'cosmetic';
}

export interface ThemeItem extends MarketItemBase {
	type: 'theme';
}

export type MarketItem = SnackItem | GeneratorItem | ClickerItem | SoulMultiplierItem | CosmeticItem | ThemeItem;

export interface RuntimeMarketStats {
	yang: number;
	yin: number;
	shards: number;
	scarLevel: number;
	streak: number;
	age: number;
	population: number;
	destroyedPopulation: number;
	premium: boolean;
	antiTreasuryCount: number;
	totalGeneratorCount: number;
}

export interface ValueRange {
	min: number;
	max: number;
}

