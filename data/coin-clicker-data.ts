import type { ClickerItem } from './market-types';

export const COIN_CLICKER_DATA: ClickerItem[] = [
	{ id: 'click_dragon_clicks', name: 'Dragon Clicks', type: 'clicker', formula: 'dragonClicks', scarLevelRequired: 3, coinCost: 10, coinGrowth: 1.04, orbCost: 1, description: 'Each upgrade adds +0.01 coins per click.' },
	{ id: 'click_age_multiplier', name: 'Dragon Age Multiplier', type: 'clicker', formula: 'ageMultiplier', scarLevelRequired: 5, coinCost: 10, coinGrowth: 10, orbCost: 1, description: 'Each age multiplies Dragon Clicks by +0.01 * Age.' },
	{ id: 'click_demonic_clicks', name: 'Demonic Dragon Clicks', type: 'clicker', formula: 'demonicClicks', scarLevelRequired: 7, coinCost: 100, coinGrowth: 1.2, orbCost: 1, description: 'Each upgrade adds +0.001% of coin generation/day * base clicks.' },
	{ id: 'click_mega_clicks', name: 'Mega-Dragon Clicks', type: 'clicker', formula: 'megaClicks', scarLevelRequired: 7, coinCost: 100, coinGrowth: 1.02, orbCost: 1, description: 'Each upgrade adds +0.1 coins per click.' },
	{ id: 'click_giga_clicks', name: 'Giga-Dragon Clicks', type: 'clicker', formula: 'gigaClicks', scarLevelRequired: 9, coinCost: 2500, coinGrowth: 1.01, orbCost: 1, description: 'Each upgrade adds +1 coins per click.' },
	{ id: 'click_impossible_clicks', name: 'Impossible Dragon Clicks', type: 'clicker', formula: 'impossibleClicks', scarLevelRequired: 12, coinCost: 50_000, coinGrowth: 1.005, orbCost: 1, description: 'Each upgrade adds +10 coins per click.' },
	{ id: 'click_dragonic_clicks', name: 'Dragonic Dragon Clicks', type: 'clicker', formula: 'dragonicClicks', scarLevelRequired: 15, coinCost: 10_000_000, coinGrowth: 1.0025, orbCost: 1, description: 'Each upgrade adds +1,000 coins per click.' },
];
