export type DragonAttackUpgradeId =
	| 'claws'
	| 'cold_fire_breathing'
	| 'fire_breathing'
	| 'golden_plating'
	| 'guard_creation'
	| 'tank_creation'
	| 'aircraft_creation';

export type DragonAttackAbilityId =
	| 'super_claws'
	| 'tank_denial'
	| 'air_denial'
	| 'guards_attack_all'
	| 'unleashed_fury'
	| 'guard_transformation'
	| 'tank_transformation'
	| 'aircraft_transformation';

export interface DragonAttackUpgradeDefinition {
	id: DragonAttackUpgradeId;
	name: string;
	description: string;
	baseCoinCost: number;
	coinGrowth: number;
	baseOrbCost: number;
	orbGrowth: number;
	maxLevel?: number;
}

export interface DragonAttackAbilityDefinition {
	id: DragonAttackAbilityId;
	name: string;
	description: string;
	orbCost: number;
	durationSeconds?: number;
}

export const DRAGON_ATTACK_UPGRADES: DragonAttackUpgradeDefinition[] = [
	{ id: 'claws', name: 'Claws', description: '+1 base dragon damage per level.', baseCoinCost: 10, coinGrowth: 1.02, baseOrbCost: 5, orbGrowth: 1 },
	{ id: 'cold_fire_breathing', name: 'Cold Fire Breathing', description: '+10 damage per level for each point of Yin below max Fury.', baseCoinCost: 500, coinGrowth: 1.02, baseOrbCost: 10, orbGrowth: 1 },
	{ id: 'fire_breathing', name: 'Fire Breathing', description: '+10 damage per level for each point of current Fury.', baseCoinCost: 1000, coinGrowth: 1.02, baseOrbCost: 15, orbGrowth: 1 },
	{ id: 'golden_plating', name: 'Golden Plating', description: 'Multiplies damage by the cube root of coin production per day.', baseCoinCost: 2500, coinGrowth: 1.1, baseOrbCost: 25, orbGrowth: 1 },
	{ id: 'guard_creation', name: 'Guard Creation', description: '+1% of destroyed population becomes Dragon Guards per level, up to 100%.', baseCoinCost: 5000, coinGrowth: Math.pow(2, 0.1), baseOrbCost: 5, orbGrowth: Math.pow(2, 0.1), maxLevel: 100 },
	{ id: 'tank_creation', name: 'Tank Creation', description: '+1% of destroyed tanks becomes Dragon Guards per level, up to 100%.', baseCoinCost: 10000, coinGrowth: Math.pow(2, 0.1), baseOrbCost: 10, orbGrowth: Math.pow(2, 0.1), maxLevel: 100 },
	{ id: 'aircraft_creation', name: 'Aircraft Creation', description: '+1% of destroyed aircraft becomes Dragon Guards per level, up to 100%.', baseCoinCost: 20000, coinGrowth: Math.pow(2, 0.1), baseOrbCost: 20, orbGrowth: Math.pow(2, 0.1), maxLevel: 100 },
];

export const DRAGON_ATTACK_ABILITIES: DragonAttackAbilityDefinition[] = [
	{ id: 'super_claws', name: 'Super Claws', description: 'Claw damage is multiplied by 10,000 for 1 minute.', orbCost: 5, durationSeconds: 60 },
	{ id: 'tank_denial', name: 'Tank Denial', description: 'Tank damage is multiplied by 1,000 for 1 hour.', orbCost: 5, durationSeconds: 3600 },
	{ id: 'air_denial', name: 'Air Denial', description: 'Aircraft damage is multiplied by 10,000 for 1 hour.', orbCost: 5, durationSeconds: 3600 },
	{ id: 'guards_attack_all', name: 'Guards Attack All At Once', description: 'All Dragon Guards immediately attack the Obsidian Legion.', orbCost: 25 },
	{ id: 'unleashed_fury', name: 'Unleashed Fury', description: 'Damage is multiplied by 10 for 1 day.', orbCost: 50, durationSeconds: 86400 },
	{ id: 'guard_transformation', name: 'Guard Transformation', description: 'Turns one day of legion destruction into Dragon Guards.', orbCost: 100 },
	{ id: 'tank_transformation', name: 'Tank Transformation', description: 'Turns one day of tank destruction into Dragon Tanks.', orbCost: 200 },
	{ id: 'aircraft_transformation', name: 'Aircraft Transformation', description: 'Turns one day of aircraft destruction into Dragon Aircraft.', orbCost: 400 },
];
