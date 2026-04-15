import type { CosmeticItem } from './market-types';

export const COSMETIC_DATA: CosmeticItem[] = [
	{ id: 'cosmetic_shades', name: 'Sunglasses', type: 'cosmetic', coinCost: 250, description: 'Cool sunglasses for your dragon.' },
	{ id: 'cosmetic_crown', name: 'Royal Crown', type: 'cosmetic', coinCost: 2500, shardCost: 5, description: 'A crown for a dragon that runs the lair.' },
	{ id: 'cosmetic_crimson_tie', name: 'Crimson Tie', type: 'cosmetic', coinCost: 1800, shardCost: 2, description: 'A formal tie with dramatic dragon energy.' },
	{ id: 'cosmetic_wyrm_hat', name: 'Wyrm Hat', type: 'cosmetic', coinCost: 4200, shardCost: 6, description: 'A bold hat for scar-tier milestones.' },
];

