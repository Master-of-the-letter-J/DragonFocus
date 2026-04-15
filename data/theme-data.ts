import type { ThemeItem } from './market-types';

export const THEME_DATA: ThemeItem[] = [
	{ id: 'theme_dungeon', name: 'Dungeon Theme', type: 'theme', scarLevelRequired: 4, coinCost: 500, description: 'Dark stone walls and torch-lit dungeon atmosphere.' },
	{ id: 'theme_castle_plains', name: 'Castle & Plains Theme', type: 'theme', scarLevelRequired: 4, coinCost: 1400, description: 'A bright castle skyline with rolling fields.' },
	{ id: 'theme_space', name: 'Space Theme', type: 'theme', scarLevelRequired: 6, coinCost: 2200, shardCost: 5, description: 'Stars, deep space, and drifting nebula light.' },
	{ id: 'theme_volcano', name: 'Volcano Theme', type: 'theme', scarLevelRequired: 8, coinCost: 2800, shardCost: 8, description: 'Molten skies and an infernal dragon lair.' },
];

