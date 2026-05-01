export interface DraconianMultiplierDefinition {
	id: string;
	name: string;
	description: string;
	emberCost: number;
	emberGrowth: number;
}

export const DRACONIAN_MULTIPLIER_DATA: DraconianMultiplierDefinition[] = [
	{
		id: 'draconian_ascension_multiplier',
		name: 'Draconian Ascension Multiplier',
		description: 'Doubles Dragon Shards earned from ascension for each level.',
		emberCost: 100,
		emberGrowth: 1.5,
	},
	{
		id: 'draconian_ascension_charm',
		name: 'Draconian Ascension Charm',
		description: 'Halves ascension sickness duration for each level.',
		emberCost: 1_000,
		emberGrowth: 1.5,
	},
	{
		id: 'draconian_eternal_growth',
		name: 'Eternal Growth',
		description: 'Adds +1% population base growth for each level.',
		emberCost: 50,
		emberGrowth: 1.5,
	},
	{
		id: 'draconian_survey_duplication',
		name: 'Survey Duplication Glitch',
		description: 'Doubles survey coins, shards, and snack drops for each level.',
		emberCost: 100,
		emberGrowth: 2,
	},
	{
		id: 'draconian_max_fury',
		name: 'Draconian Fury Core',
		description: 'Raises maximum fury by 25 for each level on top of ember bonuses.',
		emberCost: 25,
		emberGrowth: 1.45,
	},
];
