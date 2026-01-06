import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React, { ReactNode, useContext, useMemo, useState } from 'react';

export type ItemType = 'snack' | 'cosmetic' | 'generator' | 'theme';

export interface ShopItem {
	id: string;
	name: string;
	type: ItemType;
	price: number;
	description?: string;
	scarLevelRequired?: number; // minimum scar level to purchase
	requiresShards?: number; // shard cost on top of coins
	// effect parameters for snacks/generators
	effect?: {
		hp?: number; // immediate HP
		regenDays?: number; // regeneration duration days
		fury?: number; // immediate fury change
		coinsPerDay?: number; // for generators
		durationDays?: number; // temporary multipliers, etc.
		mood?: number; // mood impact placeholder
	};
}

type ItemsProviderContextProps = {
	shopItems: ShopItem[];
	ownedItems: Record<string, number>; // id -> quantity
	purchaseItem: (id: string) => boolean;
	useItem: (id: string) => boolean;
	addItemToInventory: (id: string, qty?: number) => void;
	sellItem?: (id: string) => boolean;
	processDailyPayouts?: () => number; // returns coins added
	activeEffects?: ActiveEffect[];
	getActiveCoinMultiplier?: () => number;
	getActiveJeopardyMultiplier?: () => number;
	resetInventory?: () => void;
};

const ItemsProviderContext = React.createContext<ItemsProviderContextProps | undefined>(undefined);

export const useItems = () => {
	const context = useContext(ItemsProviderContext);
	if (context === undefined) throw new Error('useItems must be used within ItemsProvider');
	return context;
};

function buildInitialShopItems(): ShopItem[] {
	return [
		{
			id: 'snack_health_chocolate',
			name: 'Health Chocolate',
			type: 'snack',
			price: 25,
			description: 'A delicious chocolate that restores HP (10-50).',
			effect: { hp: 25 },
		},
		{
			id: 'snack_regen_7d',
			name: 'Regeneration Pack (7d)',
			type: 'snack',
			price: 500,
			description: 'Regenerates HP each day for 7 days (+10/day).',
			effect: { regenDays: 7, hp: 10 },
		},
		{
			id: 'snack_double_jeopardy',
			name: 'Double Jeopardy Snack',
			type: 'snack',
			price: 300,
			description: 'Double gains & losses from questions for a day.',
			effect: { durationDays: 1 },
		},
		{
			id: 'generator_treasury',
			name: 'Treasury (Daily)',
			type: 'generator',
			price: 1000,
			description: 'Generates +1 coin/day (multiplied by scar/premium).',
			effect: { coinsPerDay: 1 },
		},
		{
			id: 'cosmetic_hat_red',
			name: 'Red Dragon Hat',
			type: 'cosmetic',
			price: 200,
			description: 'A stylish red hat for your dragon.',
		},
		// Simplified mood snacks
		{ id: 'mood_nugget', name: 'Mood Nugget (-5)', type: 'snack', price: 25, description: 'Small calming snack: -5 Fury', effect: { fury: -5 } },
		{ id: 'mood_bar', name: 'Mood Bar (-15)', type: 'snack', price: 60, description: 'Tough day? -15 Fury', effect: { fury: -15 } },
		{ id: 'mood_feast', name: 'Mood Feast (-40)', type: 'snack', price: 140, description: 'Big calming feast: -40 Fury', effect: { fury: -40 } },

		// Coin boosters
		{ id: 'booster_double', name: 'Double Coin Booster (1d)', type: 'snack', price: 250, description: 'Double coin gains for 1 day.', effect: { durationDays: 1 } },
		{ id: 'booster_triple', name: 'Triple Coin Booster (1d)', type: 'snack', price: 600, description: 'Triple coin gains for 1 day.', effect: { durationDays: 1 } },
		{ id: 'booster_quad', name: 'Quadruple Coin Booster (1d)', type: 'snack', price: 1200, description: '4x coin gains for 1 day.', effect: { durationDays: 1 } },

		// Health snacks (different tiers)
		{ id: 'health_small', name: 'Health Snack (25)', type: 'snack', price: 30, description: 'Restores 25 HP.', effect: { hp: 25 } },
		{ id: 'health_medium', name: 'Health Snack (100)', type: 'snack', price: 100, description: 'Restores 100 HP.', effect: { hp: 100 } },
		{ id: 'health_large', name: 'Health Snack (500)', type: 'snack', price: 400, description: 'Restores 500 HP.', effect: { hp: 500 } },

		// Regeneration snacks
		{ id: 'regen_3d', name: 'Regen 3 Days (+10/day)', type: 'snack', price: 120, description: 'Regenerate +10 HP daily for 3 days.', effect: { regenDays: 3, hp: 10 } },
		{ id: 'regen_10d', name: 'Regen 10 Days (+50/day)', type: 'snack', price: 1200, description: 'Regenerate +50 HP daily for 10 days.', effect: { regenDays: 10, hp: 50 } },

		// Coin Generators (Scar Level Gated - Each costs 1 Dragon Shard + coins)
		// Scar Level 3+
		{ id: 'gen_treasury', name: 'Treasury', type: 'generator', price: 5, description: '+1 Coins/Day * Multiplier', scarLevelRequired: 3, requiresShards: 1, effect: { coinsPerDay: 1 } },

		// Scar Level 4+
		{ id: 'gen_forge', name: 'Forge', type: 'generator', price: 10, description: '+(2 + Yang/50) Coins/Day * Multiplier', scarLevelRequired: 4, requiresShards: 1, effect: { coinsPerDay: 2 } },
		{ id: 'gen_freezer', name: 'Freezer', type: 'generator', price: 10, description: '+(2 + Yin/50) Coins/Day * Multiplier', scarLevelRequired: 4, requiresShards: 1, effect: { coinsPerDay: 2 } },
		{ id: 'gen_dragon_nft', name: 'Dragon NFT', type: 'generator', price: 15, description: '+(3 + Streak/30) Coins/Day * Multiplier', scarLevelRequired: 4, requiresShards: 1, effect: { coinsPerDay: 3 } },

		// Scar Level 5+
		{ id: 'gen_anti_treasury', name: 'Anti-Treasury', type: 'generator', price: 20, description: '+(4 + Count) Coins/Day * Multiplier (reduces other generators -1)', scarLevelRequired: 5, requiresShards: 1, effect: { coinsPerDay: 4 } },
		{ id: 'gen_black_hole', name: 'Black Hole', type: 'generator', price: 25, description: '+(5 + Scar Level) Coins/Day * Multiplier', scarLevelRequired: 5, requiresShards: 1, effect: { coinsPerDay: 5 } },

		// Scar Level 6+
		{ id: 'gen_golden_saddle', name: 'Golden Saddle', type: 'generator', price: 30, description: '+(6 + Age/10) Coins/Day * Multiplier', scarLevelRequired: 6, requiresShards: 1, effect: { coinsPerDay: 6 } },

		// Scar Level 7+
		{ id: 'gen_dragon_anti_charm', name: 'Dragon Anti-Charm', type: 'generator', price: 35, description: '+(7 + log(Destroyed)) Coins/Day * Multiplier', scarLevelRequired: 7, requiresShards: 1, effect: { coinsPerDay: 7 } },
		{ id: 'gen_dragon_charm', name: 'Dragon Charm', type: 'generator', price: 40, description: '+(8 + log(Pop)) Coins/Day * Multiplier', scarLevelRequired: 7, requiresShards: 1, effect: { coinsPerDay: 8 } },

		// Scar Level 8+
		{ id: 'gen_coin_fountain', name: 'Coin Fountain', type: 'generator', price: 45, description: '+9 Coins/Day * Multiplier', scarLevelRequired: 8, requiresShards: 1, effect: { coinsPerDay: 9 } },

		// Scar Level 9+
		{ id: 'gen_ultimate_dragon_bracelet', name: 'Ultimate Dragon Bracelet', type: 'generator', price: 50, description: '+(10 + Building#) Coins/Day * Multiplier', scarLevelRequired: 9, requiresShards: 1, effect: { coinsPerDay: 10 } },

		// Scar Level 10+
		{ id: 'gen_big_stick', name: 'Big Stick', type: 'generator', price: 100, description: '+10 Coins/Day * (Multiplier^2)', scarLevelRequired: 10, requiresShards: 1, effect: { coinsPerDay: 10 } },

		// Dragon Clickers (upgrade item type, gated by scar level)
		{ id: 'click_dragon_clicks', name: 'Dragon Clicks', type: 'generator', price: 10, description: 'Each click +0.01 coins (L4+)', scarLevelRequired: 4, requiresShards: 1, effect: { coinsPerDay: 1 } },
		{ id: 'click_age_multiplier', name: 'Dragon Age Multiplier', type: 'generator', price: 10, description: 'Click gains * 0.01 * Age (L5+)', scarLevelRequired: 5, requiresShards: 1, effect: { coinsPerDay: 1 } },
		{ id: 'click_demonic_clicks', name: 'Demonic Dragon Clicks', type: 'generator', price: 100, description: 'Each click +0.001% of daily generation (L6+)', scarLevelRequired: 6, requiresShards: 1, effect: { coinsPerDay: 1 } },
		{ id: 'click_mega_clicks', name: 'Mega-Dragon Clicks', type: 'generator', price: 1000, description: 'Each click +0.1 coins (L7+)', scarLevelRequired: 7, requiresShards: 1, effect: { coinsPerDay: 1 } },

		// Cosmetics
		{ id: 'cosmetic_tie_blue', name: 'Blue Dragon Tie', type: 'cosmetic', price: 75, description: 'A classy blue tie for your dragon.' },
		{ id: 'cosmetic_shades', name: 'Sunglasses', type: 'cosmetic', price: 90, description: 'Cool sunglasses for your dragon.' },
		{ id: 'cosmetic_crown', name: 'Royal Crown', type: 'cosmetic', price: 1000, description: 'A crown to rule the skies.' },

		// 50 Cosmetic Items (scar level gated)
		{ id: 'cosmetic_golden_crown', name: 'Gold Dragon Crown', type: 'cosmetic', price: 1000, description: 'A regal golden crown fit for dragon royalty', scarLevelRequired: 2 },
		{ id: 'cosmetic_crystalline_horns', name: 'Crystalline Horns', type: 'cosmetic', price: 1500, description: 'Shimmering crystal horns that catch the light beautifully', scarLevelRequired: 3 },
		{ id: 'cosmetic_ethereal_wings', name: 'Ethereal Wings', type: 'cosmetic', price: 2000, description: 'Mystical wings that glow with otherworldly energy', scarLevelRequired: 4 },
		{ id: 'cosmetic_shadow_aura', name: 'Shadow Aura', type: 'cosmetic', price: 1500, description: 'A dark mystical aura that surrounds your dragon' },
		{ id: 'cosmetic_flame_trail', name: 'Flame Trail Effect', type: 'cosmetic', price: 1000, description: 'Leave a trail of flames as your dragon moves' },
		{ id: 'cosmetic_ice_scales', name: 'Frozen Ice Scales', type: 'cosmetic', price: 750, description: 'Pristine ice-blue scales with a frosty shimmer' },
		{ id: 'cosmetic_obsidian_shell', name: 'Obsidian Shell Armor', type: 'cosmetic', price: 3000, description: 'Sleek obsidian plating for a menacing appearance', scarLevelRequired: 5 },
		{ id: 'cosmetic_rose_petals', name: 'Rose Petal Effect', type: 'cosmetic', price: 500, description: 'Rose petals swirl around your dragon in a romantic aura' },
		{ id: 'cosmetic_star_crown', name: 'Starlight Crown', type: 'cosmetic', price: 2000, description: 'A crown adorned with twinkling stars' },
		{ id: 'cosmetic_pearl_horns', name: 'Pearl Horns', type: 'cosmetic', price: 1000, description: 'Lustrous pearl horns with a milky white glow' },
		{ id: 'cosmetic_rainbow_wings', name: 'Rainbow Wings', type: 'cosmetic', price: 2500, description: 'Vibrant wings displaying all colors of the rainbow', scarLevelRequired: 6 },
		{ id: 'cosmetic_purple_mist', name: 'Purple Mist Aura', type: 'cosmetic', price: 750, description: 'An enchanted purple mist that wraps around your dragon' },
		{ id: 'cosmetic_diamond_scales', name: 'Diamond Scales', type: 'cosmetic', price: 1500, description: 'Hard as diamonds and twice as brilliant' },
		{ id: 'cosmetic_crown_of_thorns', name: 'Crown of Thorns', type: 'cosmetic', price: 1200, description: 'A menacing crown with sharp dark thorns', scarLevelRequired: 3 },
		{ id: 'cosmetic_lunar_wings', name: 'Lunar Wings', type: 'cosmetic', price: 1750, description: 'Wings that shimmer like the moonlight' },
		{ id: 'cosmetic_solar_flare', name: 'Solar Flare Effect', type: 'cosmetic', price: 2000, description: 'Radiates burning solar energy in every movement' },
		{ id: 'cosmetic_frost_breath', name: 'Frost Breath Aura', type: 'cosmetic', price: 1000, description: 'Icy breath surrounds your dragon at all times' },
		{ id: 'cosmetic_emerald_eyes', name: 'Emerald Eyes', type: 'cosmetic', price: 500, description: 'Glowing emerald eyes that pierce through darkness' },
		{ id: 'cosmetic_silver_scales', name: 'Silver Scales', type: 'cosmetic', price: 750, description: 'Shimmering silver scales for an elegant look' },
		{ id: 'cosmetic_inferno_wings', name: 'Inferno Wings', type: 'cosmetic', price: 3000, description: 'Wings wreathed in continuous flames', scarLevelRequired: 5 },
		{ id: 'cosmetic_crystal_horns_blue', name: 'Blue Crystal Horns', type: 'cosmetic', price: 1250, description: 'Sapphire-blue crystal horns with inner light' },
		{ id: 'cosmetic_golden_scales', name: 'Golden Scales', type: 'cosmetic', price: 1000, description: 'Luxurious gold-plated scales' },
		{ id: 'cosmetic_thunder_aura', name: 'Thunder Aura', type: 'cosmetic', price: 1500, description: 'Electric energy crackles around your dragon' },
		{ id: 'cosmetic_void_wings', name: 'Void Wings', type: 'cosmetic', price: 5000, description: 'Wings of pure darkness from the void itself', scarLevelRequired: 8 },
		{ id: 'cosmetic_rose_crown', name: 'Rose Crown', type: 'cosmetic', price: 750, description: 'A crown of blooming roses and thorns' },
		{ id: 'cosmetic_turquoise_scales', name: 'Turquoise Scales', type: 'cosmetic', price: 600, description: 'Ocean-blue turquoise scales with a tropical feel' },
		{ id: 'cosmetic_stellar_horns', name: 'Stellar Horns', type: 'cosmetic', price: 1800, description: 'Horns that contain stars and cosmic energy' },
		{ id: 'cosmetic_moonlight_aura', name: 'Moonlight Aura', type: 'cosmetic', price: 1200, description: 'A soft, calming aura of moonlight' },
		{ id: 'cosmetic_lava_scales', name: 'Lava Scales', type: 'cosmetic', price: 1400, description: 'Scales that flow like molten lava', scarLevelRequired: 4 },
		{ id: 'cosmetic_spectral_wings', name: 'Spectral Wings', type: 'cosmetic', price: 2250, description: 'Ghostly wings that phase in and out of reality' },
		{ id: 'cosmetic_jade_horns', name: 'Jade Horns', type: 'cosmetic', price: 1100, description: 'Smooth jade horns with natural green markings' },
		{ id: 'cosmetic_aurora_wings', name: 'Aurora Wings', type: 'cosmetic', price: 2500, description: 'Wings that display the colors of the northern lights', scarLevelRequired: 5 },
		{ id: 'cosmetic_crimson_crown', name: 'Crimson Crown', type: 'cosmetic', price: 1000, description: 'A deep red crown with ruby accents' },
		{ id: 'cosmetic_lightning_trail', name: 'Lightning Trail', type: 'cosmetic', price: 1350, description: 'Strike electricity from the ground with each step' },
		{ id: 'cosmetic_amethyst_scales', name: 'Amethyst Scales', type: 'cosmetic', price: 850, description: 'Purple gem-like scales with natural veins' },
		{ id: 'cosmetic_phoenix_wings', name: 'Phoenix Wings', type: 'cosmetic', price: 3500, description: 'Magnificent wings of flame and rebirth', scarLevelRequired: 6 },
		{ id: 'cosmetic_twilight_aura', name: 'Twilight Aura', type: 'cosmetic', price: 1450, description: 'An aura mixing sunset and moonrise colors' },
		{ id: 'cosmetic_obsidian_horns', name: 'Obsidian Horns', type: 'cosmetic', price: 1200, description: 'Jet-black horns as hard as volcanic glass' },
		{ id: 'cosmetic_prismatic_scales', name: 'Prismatic Scales', type: 'cosmetic', price: 2000, description: 'Scales that refract light into infinite colors' },
		{ id: 'cosmetic_wind_wings', name: 'Wind Wings', type: 'cosmetic', price: 1750, description: 'Wings that flow like invisible wind currents' },
		{ id: 'cosmetic_copper_scales', name: 'Copper Scales', type: 'cosmetic', price: 450, description: 'Warm copper-colored scales with a metallic sheen' },
		{ id: 'cosmetic_shadow_horns', name: 'Shadow Horns', type: 'cosmetic', price: 1500, description: 'Horns wreathed in living shadow' },
		{ id: 'cosmetic_glacial_wings', name: 'Glacial Wings', type: 'cosmetic', price: 2200, description: 'Crystalline ice wings that never melt' },
		{ id: 'cosmetic_flame_crown', name: 'Flame Crown', type: 'cosmetic', price: 1300, description: 'A crown of perpetually burning flames' },
		{ id: 'cosmetic_aquamarine_scales', name: 'Aquamarine Scales', type: 'cosmetic', price: 900, description: 'Deep sea blue scales with a watery gleam' },
		{ id: 'cosmetic_celestial_aura', name: 'Celestial Aura', type: 'cosmetic', price: 2750, description: 'An aura of planets and cosmic wonder', scarLevelRequired: 7 },
		{ id: 'cosmetic_bone_horns', name: 'Ancient Bone Horns', type: 'cosmetic', price: 700, description: 'Weathered horns of great age and power' },
		{ id: 'cosmetic_lightning_wings', name: 'Lightning Wings', type: 'cosmetic', price: 3250, description: 'Wings crackling with electrical energy', scarLevelRequired: 6 },
		{ id: 'cosmetic_platinum_scales', name: 'Platinum Scales', type: 'cosmetic', price: 1600, description: 'Rare platinum scales of ultimate prestige' },
		{ id: 'cosmetic_midnight_crown', name: 'Midnight Crown', type: 'cosmetic', price: 1100, description: 'A dark crown adorned with midnight blue gems' },
		{ id: 'cosmetic_mystic_wings', name: 'Mystic Wings', type: 'cosmetic', price: 2600, description: 'Wings swirling with arcane magical energy' },
		{ id: 'cosmetic_rose_gold_scales', name: 'Rose Gold Scales', type: 'cosmetic', price: 1350, description: 'Elegant rose gold scales with a warm glow', scarLevelRequired: 2 },

		// Background & Theme Items
		{ id: 'theme_dungeon', name: 'Dungeon Theme', type: 'theme', price: 500, description: 'Dark stone walls and torch-lit dungeon atmosphere' },
		{ id: 'theme_castle', name: 'Castle & Plains Theme', type: 'theme', price: 600, description: 'Majestic castle with rolling green plains' },
		{ id: 'theme_space', name: 'Space Theme', type: 'theme', price: 800, description: 'Vast cosmic void with stars and nebulas' },
		{ id: 'theme_volcano', name: 'Volcano Theme', type: 'theme', price: 700, description: 'Fiery volcanic landscape with flowing lava' },
		{ id: 'theme_forest', name: 'Enchanted Forest Theme', type: 'theme', price: 650, description: 'Mystical forest with ancient trees and glowing flora' },
		{ id: 'theme_ocean', name: 'Ocean Depths Theme', type: 'theme', price: 700, description: 'Underwater kingdom with coral and bioluminescent creatures' },
		{ id: 'theme_sky', name: 'Sky Kingdom Theme', type: 'theme', price: 750, description: 'Floating islands among the clouds', scarLevelRequired: 3 },
		{ id: 'theme_neon', name: 'Neon Cyberpunk Theme', type: 'theme', price: 900, description: 'Futuristic neon-lit cyberpunk cityscape', scarLevelRequired: 4 },
		{ id: 'theme_zen', name: 'Zen Garden Theme', type: 'theme', price: 550, description: 'Peaceful zen garden with koi ponds and bamboo' },
		{ id: 'theme_hellscape', name: 'Hellscape Theme', type: 'theme', price: 1000, description: 'Infernal realm with flames and darkness', scarLevelRequired: 5 },
	];
}

export type ActiveEffect = {
	id: string;
	type: 'coinMultiplier' | 'jeopardyMultiplier' | 'moodShift' | 'regen';
	multiplier?: number;
	expiresAt?: string; // ISO date
	sourceItemId?: string;
};

export default function ItemsProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const fury = useFury();
	const coins = useDragonCoins();
	const shards = useShards();
	const scarLevel = useScarLevel();
	const premium = usePremium();

	// give the player one starter Dragon Clicks upgrade regardless of scar level
	const [ownedItems, setOwnedItems] = useState<Record<string, number>>({ click_dragon_clicks: 1 });
	const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
	const shopItems = useMemo(() => buildInitialShopItems(), []);
	const [lastPayoutDate, setLastPayoutDate] = useState<string | null>(null);

	const addItemToInventory = (id: string, qty = 1) => {
		setOwnedItems(prev => ({ ...prev, [id]: (prev[id] || 0) + qty }));
	};

	const purchaseItem = (id: string) => {
		const item = shopItems.find(i => i.id === id);
		if (!item) return false;
		if (!coins.spendCoins(item.price)) return false;
		if (item.requiresShards) {
			if (!shards.spendShards(item.requiresShards)) {
				// refund coins
				coins.addCoins(item.price);
				return false;
			}
		}
		addItemToInventory(id, 1);
		return true;
	};

	const useItem = (id: string) => {
		const qty = ownedItems[id] || 0;
		if (qty <= 0) return false;
		const item = shopItems.find(i => i.id === id);
		if (!item) return false;

		// Apply effects based on item.type/effect
		if (item.type === 'snack' && item.effect) {
			if (item.effect.hp) {
				dragon.healHp(item.effect.hp);
			}
			if (item.effect.regenDays) {
				// For simplicity, immediately heal per-day amount once and rely on a background job later
				dragon.healHp(item.effect.hp || 0);
			}
			if (typeof item.effect.fury === 'number') {
				fury.addFury(item.effect.fury);
			}
		}

		// Generators: add immediate coins equal to day's value on purchase (apply multiplier)
		if (item.type === 'generator' && item.effect?.coinsPerDay) {
			const yangValue = fury.furyMeter;
			const dragonShardsCount = shards.shards ?? 0;
			const scar = scarLevel.currentScarLevel ?? 0;
			const snackMult = getActiveCoinMultiplier();
			const isPremiumFlag = premium.isPremium ?? false;
			const earned = Math.floor(item.effect.coinsPerDay * coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag));
			coins.addCoins(earned);
		}

		// Apply duration-based effects (boosters, jeopardy, regen, etc.)
		if (item.effect?.durationDays) {
			const today = new Date();
			const expires = new Date(today.getTime() + item.effect.durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			// Determine effect type by id heuristics
			if (item.id.startsWith('booster_')) {
				const mult = item.id.includes('double') ? 2 : item.id.includes('triple') ? 3 : item.id.includes('quad') ? 4 : 1;
				setActiveEffects(prev => [...prev, { id: `${item.id}_${Date.now()}`, type: 'coinMultiplier', multiplier: mult, expiresAt: expires, sourceItemId: item.id }]);
			} else if (item.id.includes('jeopardy')) {
				const mult = item.id.includes('double') ? 2 : item.id.includes('triple') ? 3 : item.id.includes('quad') ? 4 : 1;
				setActiveEffects(prev => [...prev, { id: `${item.id}_${Date.now()}`, type: 'jeopardyMultiplier', multiplier: mult, expiresAt: expires, sourceItemId: item.id }]);
			}
		}

		// Mood/Bipolar: randomize mood shift for bipolar
		if (item.id === 'snack_bipolar') {
			const delta = Math.floor(Math.random() * 101) - 50; // -50..+50
			if (delta !== 0) fury.addFury(delta);
		}

		setOwnedItems(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
		return true;
	};

	const getActiveCoinMultiplier = () => {
		const nowStr = new Date().toISOString().split('T')[0];
		const active = activeEffects.filter(e => e.type === 'coinMultiplier' && (!e.expiresAt || e.expiresAt >= nowStr));
		if (active.length === 0) return 1;
		return active.reduce((acc, cur) => acc * (cur.multiplier || 1), 1);
	};

	const getActiveJeopardyMultiplier = () => {
		const nowStr = new Date().toISOString().split('T')[0];
		const active = activeEffects.filter(e => e.type === 'jeopardyMultiplier' && (!e.expiresAt || e.expiresAt >= nowStr));
		if (active.length === 0) return 1;
		return active.reduce((acc, cur) => acc * (cur.multiplier || 1), 1);
	};

	const sellItem = (id: string) => {
		const qty = ownedItems[id] || 0;
		if (qty <= 0) return false;
		const item = shopItems.find(i => i.id === id);
		if (!item) return false;

		// Only generators are sellable for shards + coins (per spec)
		if (item.type !== 'generator') return false;

		// Remove one
		setOwnedItems(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));

		// give 1 shard (if applicable)
		shards.addShards(1);

		// give 75% of coin price back
		const refund = Math.floor(item.price * 0.75);
		coins.addCoins(refund);
		return true;
	};

	const processDailyPayouts = () => {
		const todayStr = new Date().toISOString().split('T')[0];
		if (lastPayoutDate === todayStr) return 0;

		const fromDate = lastPayoutDate ? new Date(lastPayoutDate) : new Date();
		const toDate = new Date(todayStr);
		const days = Math.max(1, Math.floor((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000)));

		let total = 0;
		shopItems.forEach(si => {
			if (si.type === 'generator' && si.effect?.coinsPerDay) {
				const qty = ownedItems[si.id] || 0;
				if (qty <= 0) return;
				const base = si.effect.coinsPerDay * qty;
				const yangValue = fury.furyMeter;
				const dragonShardsCount = shards.shards ?? 0;
				const scar = scarLevel.currentScarLevel ?? 0;
				const snackMult = getActiveCoinMultiplier();
				const isPremiumFlag = premium.isPremium ?? false;
				const multiplier = coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag);
				total += Math.floor(base * multiplier * days);
			}
		});

		if (total > 0) coins.addCoins(total);
		setLastPayoutDate(todayStr);
		return total;
	};

	const value: ItemsProviderContextProps = {
		shopItems,
		ownedItems,
		purchaseItem,
		useItem,
		addItemToInventory,
		sellItem,
		processDailyPayouts,
		resetInventory: () => {
			setOwnedItems({});
			setActiveEffects([]);
		},
		activeEffects,
		getActiveCoinMultiplier,
		getActiveJeopardyMultiplier,
	};

	return <ItemsProviderContext.Provider value={value}>{children}</ItemsProviderContext.Provider>;
}
