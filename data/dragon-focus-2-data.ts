export type GameModeId = 'normal' | 'invincible' | 'lockIn' | 'lockInPlus' | 'hard' | 'hardPlus';

export interface MilestoneDefinition {
	id: string;
	order: number;
	name: string;
	requiredEnergy: number;
	description: string;
	unlocks: string[];
}

export interface GameModeDefinition {
	id: GameModeId;
	name: string;
	milestoneRequired: number;
	description: string;
	energyMultiplier: number;
	darkEnergyMultiplier: number;
	furyMultiplier: number;
	locksWorld?: boolean;
	canExit?: boolean;
}

export const DRAGON_FOCUS_MILESTONES: MilestoneDefinition[] = [
	{
		id: 'awakening',
		order: 1,
		name: 'Awakening Brief',
		requiredEnergy: 25,
		description: 'The agency confirms the dragon is responsive to focus rituals.',
		unlocks: ['Achievements', 'Statistics', 'Secret Government Logs'],
	},
	{
		id: 'pact',
		order: 2,
		name: 'Pact Clearance',
		requiredEnergy: 100,
		description: 'Account tools, Dragon Pact previews, and deeper logs become available.',
		unlocks: ['Dragon Pact', 'Lock In Mode', 'Logs Table'],
	},
	{
		id: 'market',
		order: 3,
		name: 'Black Market Signal',
		requiredEnergy: 500,
		description: 'Unauthorized exchange channels begin accepting crimson shards.',
		unlocks: ['Black Market', 'Dragon Graveyard', 'Hard Mode'],
	},
	{
		id: 'armageddon',
		order: 4,
		name: 'Armageddon Protocol',
		requiredEnergy: 2500,
		description: 'Energy can be sacrificed for plasma to accelerate future runs.',
		unlocks: ['Plasma Boosts', 'Hard+ Mode'],
	},
	{
		id: 'transcension',
		order: 5,
		name: 'Transcension Theory',
		requiredEnergy: 10000,
		description: 'The agency detects deific signatures outside ordinary energy limits.',
		unlocks: ['Deities', 'Anomalies', 'Respec Tools'],
	},
	{
		id: 'cosmic-origin',
		order: 6,
		name: 'Origin File',
		requiredEnergy: 50000,
		description: 'The dragon starts revealing why civilization was chosen.',
		unlocks: ['Late-game secrets', 'Future missions'],
	},
];

export const DRAGON_FOCUS_GAMEMODES: GameModeDefinition[] = [
	{
		id: 'normal',
		name: 'Normal Mode',
		milestoneRequired: 0,
		description: 'Standard energy generation and standard fury pressure.',
		energyMultiplier: 1,
		darkEnergyMultiplier: 1,
		furyMultiplier: 1,
		canExit: true,
	},
	{
		id: 'invincible',
		name: 'Invincible / Vacation',
		milestoneRequired: 1,
		description: 'Energy and dark energy are halved while fury is paused.',
		energyMultiplier: 0.5,
		darkEnergyMultiplier: 0.5,
		furyMultiplier: 0,
		canExit: true,
	},
	{
		id: 'lockIn',
		name: 'Lock In Mode',
		milestoneRequired: 2,
		description: 'Energy, fury, harvesting, and the World tab are paused until you exit.',
		energyMultiplier: 0,
		darkEnergyMultiplier: 0,
		furyMultiplier: 0,
		locksWorld: true,
		canExit: true,
	},
	{
		id: 'lockInPlus',
		name: 'Lock In+ Mode',
		milestoneRequired: 2,
		description: 'A stricter focus mode with simplified labels and an unstoppable minimum timer.',
		energyMultiplier: 0,
		darkEnergyMultiplier: 0,
		furyMultiplier: 0,
		locksWorld: true,
		canExit: true,
	},
	{
		id: 'hard',
		name: 'Hard Mode',
		milestoneRequired: 3,
		description: 'Energy and dark energy double, but fury pressure and fury cap also double.',
		energyMultiplier: 2,
		darkEnergyMultiplier: 2,
		furyMultiplier: 2,
		canExit: true,
	},
	{
		id: 'hardPlus',
		name: 'Hard+ Mode',
		milestoneRequired: 4,
		description: 'Four times energy, four times fury pressure, required surveys, and no easy exit.',
		energyMultiplier: 4,
		darkEnergyMultiplier: 4,
		furyMultiplier: 4,
		canExit: false,
	},
];

export const SECRET_GOVERNMENT_LOGS = [
	{
		id: 'log-001',
		title: 'Log 001: Lair Transfer',
		text: 'Subject accepted the hatchery key. The dragon reacts to structured intention more reliably than coercion.',
	},
	{
		id: 'log-014',
		title: 'Log 014: Energy Ceiling',
		text: 'Energy output appears tied to nearby civilization density. Population collapse would strand the entity.',
	},
	{
		id: 'log-031',
		title: 'Log 031: Crimson Signal',
		text: 'Crimson shards are not mined. They appear after high-integrity behavioral loops.',
	},
	{
		id: 'log-052',
		title: 'Log 052: Armageddon Debate',
		text: 'Committee remains divided on plasma extraction. The dragon seems amused by the term ethical containment.',
	},
	{
		id: 'log-088',
		title: 'Log 088: Origin Leak',
		text: 'The oldest translation does not call it a dragon. It calls it a witness.',
	},
];
