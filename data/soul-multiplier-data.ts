import { COIN_GENERATOR_DATA } from './coin-generator-data';
import type { SoulMultiplierItem } from './market-types';

const generatorSoulItems: SoulMultiplierItem[] = COIN_GENERATOR_DATA.map(generator => ({
	id: `soul_${generator.id}_multiplier`,
	name: `Blaze: ${generator.name}`,
	type: 'soulMultiplier',
	scarLevelRequired: Math.max(4, generator.scarLevelRequired ?? 4),
	soulCost: 250,
	soulGrowth: 1.45,
	description: `Increases ${generator.name} by *(1 + owned ${generator.name} / 100).`,
	soulEffect: {
		kind: 'generatorSpecificMultiplier',
		factor: 2,
		relatedGeneratorId: generator.id,
	},
}));

export const SOUL_MULTIPLIER_DATA: SoulMultiplierItem[] = [
	{ id: 'soul_infernon', name: 'Infernon', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 100, soulGrowth: 2, description: 'General Coin Multiplier *1.5 per level.', soulEffect: { kind: 'universalMultiplier', factor: 1.5 } },
	{ id: 'soul_mini_infernon', name: 'Mini-Infernon', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 100, soulGrowth: 1.25, description: 'General Coin Multiplier gains +0.5 per level.', soulEffect: { kind: 'additiveUniversalMultiplier', factor: 0.5 } },
	{ id: 'soul_crucible_treasure', name: "Infernon's Crucible of Treasure", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 10, soulGrowth: 1.15, description: 'Treasury generators gain +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'treasury' } },
	{ id: 'soul_crucible_steam', name: "Infernon's Crucible of Steam", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 20, soulGrowth: 1.15, description: 'Forge and Freezer gain +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'steam' } },
	{ id: 'soul_crucible_assets', name: "Infernon's Crucible of Assets", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 20, soulGrowth: 1.15, description: 'Dragon NFT gains +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'assets' } },
	{ id: 'soul_crucible_sacrifice', name: "Infernon's Crucible of Sacrifice", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 20, soulGrowth: 1.15, description: 'Dragon Ritual gains +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'sacrifice' } },
	{ id: 'soul_crucible_adventure', name: "Infernon's Crucible of Adventure", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 20, soulGrowth: 1.15, description: 'Golden Saddle gains +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'adventure' } },
	{ id: 'soul_crucible_scales', name: "Infernon's Crucible of Scales", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 20, soulGrowth: 1.15, description: 'Dragon Scales generators gain +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'scales' } },
	{ id: 'soul_crucible_drip', name: "Infernon's Crucible of Drip", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 20, soulGrowth: 1.15, description: 'Ultimate Dragon Drip gains +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'drip' } },
	{ id: 'soul_crucible_stick', name: "Infernon's Crucible of The Stick", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 20, soulGrowth: 1.15, description: 'Big Stick gains +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'stick' } },
	{ id: 'soul_crucible_glitches', name: "Infernon's Crucible of Glitches", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 100, soulGrowth: 1.15, description: 'Glitches gain +10 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 10, family: 'glitches' } },
	{ id: 'soul_crucible_universes', name: "Infernon's Crucible of Universes", type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 100, soulGrowth: 1.15, description: 'Coin universe generators gain +1 multiplier per level.', soulEffect: { kind: 'generatorFamilyCrucible', factor: 1, family: 'universes' } },
	{ id: 'soul_midas', name: 'Midas', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 100, soulGrowth: 2.5, description: "All 'Treasury' multipliers are doubled per level.", soulEffect: { kind: 'generatorFamilyCrucible', factor: 2, family: 'midas' } },
	{ id: 'soul_aurora', name: 'Aurora', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 1000, soulGrowth: 5, description: 'Greatly increases extra multiplier effects.', soulEffect: { kind: 'universalCrucible', factorPerHundred: 4 } },
	...generatorSoulItems,
	{ id: 'soul_vulcan', name: 'Vulcan', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 100, soulGrowth: 1.4, description: 'All click rewards gain x2 per level.', soulEffect: { kind: 'clickMultiplier', factor: 2 } },
	{ id: 'soul_cacus', name: 'Cacus', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 100, soulGrowth: 1.5, description: 'Dragon, Mega, Impossible, and Dragonic clicks gain x10 per level.', soulEffect: { kind: 'ritualMultiplier', factor: 10 } },
	{ id: 'soul_caeculus', name: 'Caeculus', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 1000, soulGrowth: 1.5, description: 'Dragonic Dragon Clicks gain x100 per level.', soulEffect: { kind: 'dragonicClickMultiplier', factor: 100 } },
	{ id: 'soul_infernal_artemis', name: 'Infernal Artemis', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 250, soulGrowth: 1.5, description: 'Population Growth^(Level).', soulEffect: { kind: 'populationGrowthPower', factor: 1 } },
	{ id: 'soul_infernal_irene', name: 'Infernal Irene', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 500, soulGrowth: 1.5, description: 'Max Fury /2 per level.', soulEffect: { kind: 'maxFuryDivisor', factor: 2 } },
	{ id: 'soul_infernal_ares', name: 'Infernal Ares', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 500, soulGrowth: 1.5, description: 'Max Fury *2 per level.', soulEffect: { kind: 'maxFuryMultiplier', factor: 2 } },
	{ id: 'soul_infernal_athena', name: 'Infernal Athena', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 500, soulGrowth: 1.5, description: 'All Fury gained/lost is doubled per level.', soulEffect: { kind: 'furyDeltaMultiplier', factor: 2 } },
	{ id: 'soul_impossible_effects', name: 'Infernal Dionysus', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 750, soulGrowth: 2.5, description: 'All status effect strengths are doubled per level.', soulEffect: { kind: 'impossibleEffects', factor: 2 } },
	{ id: 'soul_infernal_zeus', name: 'Infernal Zeus', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 1000, soulGrowth: 2.5, description: 'Orb multiplier effect *2 per level.', soulEffect: { kind: 'orbMultiplier', factor: 2 } },
	{ id: 'soul_survey_exploitation_i', name: 'Survey Exploitation I', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 25, soulGrowth: 1.2, description: '+(Coins/Day)*(Coins Earned By Survey)/100.', soulEffect: { kind: 'surveyExploitationI', factor: 1 } },
	{ id: 'soul_survey_exploitation_ii', name: 'Survey Exploitation II', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 250, soulGrowth: 1.5, description: 'Surveys give +(Total Coins By Survey)^0.5 shards.', soulEffect: { kind: 'surveyExploitationII', factor: 1 } },
	{ id: 'soul_survey_exploitation_iii', name: 'Survey Exploitation III', type: 'soulMultiplier', scarLevelRequired: 4, soulCost: 2500, soulGrowth: 2, description: 'Surveys give +1 additional random unlocked snack.', soulEffect: { kind: 'surveyExploitationIII', factor: 1 } },
];
