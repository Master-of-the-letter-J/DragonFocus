import type { ClickerItem } from './market-types';

export const COIN_CLICKER_DATA: ClickerItem[] = [
	{ id: 'click_dragon_clicks', name: 'Dragon Clicks', type: 'clicker', formula: 'dragonClicks', scarLevelRequired: 3, coinCost: 10, coinGrowth: 1.04, shardCost: 1, description: 'Each upgrade adds +0.01 coins per click.' },
	{ id: 'click_age_multiplier', name: 'Dragon Age Multiplier', type: 'clicker', formula: 'ageMultiplier', scarLevelRequired: 5, coinCost: 10, coinGrowth: 10, shardCost: 1, description: 'Each upgrade adds +0.01 * Age to Dragon Clicks.' },
	{ id: 'click_demonic_clicks', name: 'Demonic Dragon Clicks', type: 'clicker', formula: 'demonicClicks', scarLevelRequired: 7, coinCost: 100, coinGrowth: 1.2, shardCost: 1, description: 'Each upgrade adds +0.001% of generator output per click.' },
	{ id: 'click_mega_clicks', name: 'Mega-Dragon Clicks', type: 'clicker', formula: 'megaClicks', scarLevelRequired: 9, coinCost: 1000, coinGrowth: 1.02, shardCost: 1, description: 'Each upgrade adds +0.1 coins per click.' },
	{ id: 'click_impossible_clicks', name: 'Impossible Dragon Clicks', type: 'clicker', formula: 'impossibleClicks', scarLevelRequired: 12, coinCost: 1_000_000, coinGrowth: 1.01, shardCost: 1, description: 'Each upgrade adds +1 coin per click.' },
];

