export interface BlackMarketCoinBundle {
	id: string;
	shardCost: number;
	coinReward: number;
	instantCoinDays: number;
	label?: string;
}

export interface BlackMarketOrbBundle {
	id: string;
	shardCost: number;
	orbReward: number;
	deathCountDivisor: number;
	label?: string;
}

export interface BlackMarketShardBundle {
	id: string;
	priceLabel: string;
	shardReward: number;
	label?: string;
}

export const BLACK_MARKET_COIN_BUNDLES: BlackMarketCoinBundle[] = [
	{ id: 'coin_bundle_small', shardCost: 150, coinReward: 10_000, instantCoinDays: 1 },
	{ id: 'coin_bundle_medium', shardCost: 1_250, coinReward: 100_000, instantCoinDays: 10, label: 'Recommended' },
	{ id: 'coin_bundle_large', shardCost: 10_000, coinReward: 1_000_000, instantCoinDays: 100, label: 'Best Value' },
];

export const BLACK_MARKET_ORB_BUNDLES: BlackMarketOrbBundle[] = [
	{ id: 'orb_bundle_small', shardCost: 150, orbReward: 300, deathCountDivisor: 100_000 },
	{ id: 'orb_bundle_medium', shardCost: 1_250, orbReward: 3_000, deathCountDivisor: 10_000, label: 'Recommended' },
	{ id: 'orb_bundle_large', shardCost: 10_000, orbReward: 30_000, deathCountDivisor: 1_000, label: 'Best Value' },
];

export const BLACK_MARKET_SHARD_BUNDLES: BlackMarketShardBundle[] = [
	{ id: 'shard_bundle_099', priceLabel: '$0.99', shardReward: 80 },
	{ id: 'shard_bundle_499', priceLabel: '$4.99', shardReward: 500 },
	{ id: 'shard_bundle_999', priceLabel: '$9.99', shardReward: 1_200 },
	{ id: 'shard_bundle_1999', priceLabel: '$19.99', shardReward: 2_500, label: 'Recommended' },
	{ id: 'shard_bundle_4999', priceLabel: '$49.99', shardReward: 6_500, label: 'Great Value' },
	{ id: 'shard_bundle_9999', priceLabel: '$99.99', shardReward: 14_000, label: 'Best Value' },
];
