import type { GeneratorItem } from './market-types';

export const COIN_GENERATOR_DATA: GeneratorItem[] = [
	{ id: 'gen_treasury', name: 'Coin Treasury', type: 'generator', formula: 'flat', baseOutput: 1, scarLevelRequired: 3, coinCost: 5, coinGrowth: 1.08, shardCost: 1, description: '+1 Coins/Day * Multiplier' },
	{ id: 'gen_forge', name: 'Forge', type: 'generator', formula: 'yang', baseOutput: 2, scarLevelRequired: 4, coinCost: 10, coinGrowth: 1.12, shardCost: 1, description: '+(2 + Yang/50) Coins/Day * Multiplier' },
	{ id: 'gen_freezer', name: 'Freezer', type: 'generator', formula: 'yin', baseOutput: 2, scarLevelRequired: 4, coinCost: 10, coinGrowth: 1.12, shardCost: 1, description: '+(2 + Yin/50) Coins/Day * Multiplier' },
	{ id: 'gen_dragon_nft', name: 'Dragon NFT', type: 'generator', formula: 'streak', baseOutput: 3, scarLevelRequired: 4, coinCost: 15, coinGrowth: 1.16, shardCost: 1, description: '+(3 + Streak/30) Coins/Day * Multiplier' },
	{ id: 'gen_coin_mountain', name: 'Coin Mountain', type: 'generator', formula: 'flat', baseOutput: 3, scarLevelRequired: 4, coinCost: 15, coinGrowth: 1.08, shardCost: 1, description: '+3 Coins/Day * Multiplier' },
	{ id: 'gen_anti_treasury', name: 'Anti-Treasury', type: 'generator', formula: 'antiTreasury', baseOutput: 4, scarLevelRequired: 5, coinCost: 20, coinGrowth: 1.2, shardCost: 1, description: '+(4 + Anti-Treasury #) Coins/Day * Multiplier and reduces other generation by 0.9^count' },
	{ id: 'gen_super_treasury', name: 'Super Treasury', type: 'generator', formula: 'flat', baseOutput: 4, scarLevelRequired: 5, coinCost: 20, coinGrowth: 1.08, shardCost: 1, description: '+4 Coins/Day * Multiplier' },
	{ id: 'gen_black_hole', name: 'Black Hole', type: 'generator', formula: 'scarLevel', baseOutput: 5, scarLevelRequired: 5, coinCost: 25, coinGrowth: 1.14, shardCost: 1, description: '+(5 + Scar Level) Coins/Day * Multiplier' },
	{ id: 'gen_golden_saddle', name: 'Golden Saddle', type: 'generator', formula: 'age', baseOutput: 6, scarLevelRequired: 6, coinCost: 30, coinGrowth: 1.3, shardCost: 1, description: '+(6 + Age/10) Coins/Day * Multiplier' },
	{ id: 'gen_coin_continent', name: 'Coin Continent', type: 'generator', formula: 'flat', baseOutput: 6, scarLevelRequired: 6, coinCost: 30, coinGrowth: 1.08, shardCost: 1, description: '+6 Coins/Day * Multiplier' },
	{ id: 'gen_dragon_anti_charm', name: 'Dragon Anti-Charm', type: 'generator', formula: 'destroyedPopulation', baseOutput: 7, scarLevelRequired: 7, coinCost: 35, coinGrowth: 1.1, shardCost: 1, description: '+(7 + log10(Population Destroyed)) Coins/Day * Multiplier' },
	{ id: 'gen_dragon_charm', name: 'Dragon Charm', type: 'generator', formula: 'population', baseOutput: 8, scarLevelRequired: 7, coinCost: 40, coinGrowth: 1.1, shardCost: 1, description: '+(8 + log10(Population)) Coins/Day * Multiplier' },
	{ id: 'gen_coin_planet', name: 'Coin Planet', type: 'generator', formula: 'flat', baseOutput: 9, scarLevelRequired: 8, coinCost: 45, coinGrowth: 1.07, shardCost: 1, description: '+9 Coins/Day * Multiplier' },
	{ id: 'gen_coin_galaxy', name: 'Coin Galaxy', type: 'generator', formula: 'flat', baseOutput: 90, scarLevelRequired: 8, coinCost: 600, coinGrowth: 1.06, shardCost: 1, description: '+90 Coins/Day * Multiplier' },
	{ id: 'gen_coin_universe', name: 'Coin Universe', type: 'generator', formula: 'flat', baseOutput: 900, scarLevelRequired: 8, coinCost: 9000, coinGrowth: 1.05, shardCost: 1, description: '+900 Coins/Day * Multiplier' },
	{ id: 'gen_ultimate_dragon_bracelet', name: 'Ultimate Dragon Bracelet', type: 'generator', formula: 'totalGeneratorCount', baseOutput: 10, scarLevelRequired: 9, coinCost: 50, coinGrowth: 1.18, shardCost: 1, description: '+(10 + Building #) Coins/Day * Multiplier' },
	{ id: 'gen_big_stick', name: 'Big Stick', type: 'generator', formula: 'bigStick', baseOutput: 10, scarLevelRequired: 10, coinCost: 100, coinGrowth: 1.05, shardCost: 1, description: '+10 Coins/Day * Multiplier^2' },
];

