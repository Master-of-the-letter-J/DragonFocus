import { COIN_GENERATOR_DATA } from './coin-generator-data';

export interface DraconianMultiplierDefinition {
	id: string;
	name: string;
	description: string;
	emberCost: number;
	emberGrowth: number;
}

const generatorDraconianMultipliers: DraconianMultiplierDefinition[] = COIN_GENERATOR_DATA.map(generator => ({
	id: `draconian_${generator.id}_multiplier`,
	name: `Draconian ${generator.name} Multiplier`,
	description: `Doubles ${generator.name} effects for each level.`,
	emberCost: 10,
	emberGrowth: 1.15,
}));

export const DRACONIAN_MULTIPLIER_DATA: DraconianMultiplierDefinition[] = [
	{ id: 'draconian_infernon_multiplier', name: 'Draconian Infernon Multiplier', description: 'Increases all Mini-Infernon multipliers by *2 per level.', emberCost: 10, emberGrowth: 1.4 },
	{ id: 'draconian_universal_multiplier', name: 'Draconian Universal Multiplier', description: 'Increases the universal coin multiplier by *2 per level.', emberCost: 15, emberGrowth: 1.3 },
	{ id: 'draconian_universal_crucible', name: 'Draconian Universal Crucible', description: "Increases all Infernon's Crucibles by *2 per level.", emberCost: 25, emberGrowth: 1.45 },
	{ id: 'draconian_staff', name: 'Draconian Staff', description: 'Increases Vulcan click effects by *2 per level.', emberCost: 100, emberGrowth: 1.4 },
	{ id: 'draconian_staff_2', name: 'Draconian Staff 2.0', description: 'Increases Dragon, Mega, and Impossible Dragon Click effects by *10 per level.', emberCost: 50, emberGrowth: 1.5 },
	{ id: 'draconian_ascension_multiplier', name: 'Draconian Ascension Multiplier', description: 'Doubles Dragon Shards earned from ascension for each level.', emberCost: 100, emberGrowth: 1.5 },
	{ id: 'draconian_ascension_charm', name: 'Draconian Ascension Charm', description: 'Halves ascension sickness duration for each level.', emberCost: 1000, emberGrowth: 1.5 },
	{ id: 'draconian_eternal_growth', name: 'Eternal Growth', description: 'Adds +1% population base growth for each level.', emberCost: 50, emberGrowth: 1.5 },
	{ id: 'draconian_impossible_effects', name: 'Impossible Effects', description: 'All status effect strengths are doubled per level.', emberCost: 50, emberGrowth: 1.5 },
	{ id: 'draconian_exponential_shards', name: 'Exponential Shards', description: 'Shard multiplier effect gains another *2 per level.', emberCost: 50, emberGrowth: 1.5 },
	{ id: 'draconian_survey_duplication', name: 'Survey Duplication Glitch', description: 'Doubles survey coins, shards, and snack drops for each level.', emberCost: 100, emberGrowth: 2 },
	...generatorDraconianMultipliers,
];
