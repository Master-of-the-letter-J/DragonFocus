import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useFury } from '@/context/FuryProvider';
import React, { ReactNode, useContext, useMemo, useState } from 'react';

export type ItemType = 'snack' | 'cosmetic' | 'generator';

export interface ShopItem {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  description?: string;
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
  activeEffects?: ActiveEffect[];
  getActiveCoinMultiplier?: () => number;
  getActiveJeopardyMultiplier?: () => number;
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
    {
      id: 'snack_mood_all',
      name: 'Mood Snacks Box',
      type: 'snack',
      price: 150,
      description: 'Contains a variety of mood snacks that change Fury/Mood.',
      effect: { fury: -10 },
    },
    // Mood snack variants
    { id: 'snack_mood_petite', name: 'Mood Nugget (-5)', type: 'snack', price: 20, description: 'Small snack: -5 Fury', effect: { fury: -5 } },
    { id: 'snack_mood_small', name: 'Mood Bar (-10)', type: 'snack', price: 35, description: 'Small snack: -10 Fury', effect: { fury: -10 } },
    { id: 'snack_mood_medium', name: 'Mood Pack (-25)', type: 'snack', price: 80, description: 'Medium snack: -25 Fury', effect: { fury: -25 } },
    { id: 'snack_mood_large', name: 'Mood Feast (-50)', type: 'snack', price: 160, description: 'Large snack: -50 Fury', effect: { fury: -50 } },
    { id: 'snack_bipolar', name: 'Bipolar Snack', type: 'snack', price: 120, description: 'Randomly shifts happiness between -50 and +50 across the day.', effect: { mood: 0 } },

    // Mood snack full range (negative and positive values)
    { id: 'mood_-100', name: 'Mood Snack (-100)', type: 'snack', price: 500, description: 'Powerful calming snack: -100 Fury', effect: { fury: -100 } },
    { id: 'mood_-75', name: 'Mood Snack (-75)', type: 'snack', price: 250, description: '-75 Fury', effect: { fury: -75 } },
    { id: 'mood_-50', name: 'Mood Snack (-50)', type: 'snack', price: 160, description: '-50 Fury', effect: { fury: -50 } },
    { id: 'mood_-40', name: 'Mood Snack (-40)', type: 'snack', price: 140, description: '-40 Fury', effect: { fury: -40 } },
    { id: 'mood_-30', name: 'Mood Snack (-30)', type: 'snack', price: 120, description: '-30 Fury', effect: { fury: -30 } },
    { id: 'mood_-25', name: 'Mood Snack (-25)', type: 'snack', price: 80, description: '-25 Fury', effect: { fury: -25 } },
    { id: 'mood_-20', name: 'Mood Snack (-20)', type: 'snack', price: 70, description: '-20 Fury', effect: { fury: -20 } },
    { id: 'mood_-15', name: 'Mood Snack (-15)', type: 'snack', price: 60, description: '-15 Fury', effect: { fury: -15 } },
    { id: 'mood_-10', name: 'Mood Snack (-10)', type: 'snack', price: 40, description: '-10 Fury', effect: { fury: -10 } },
    { id: 'mood_-5', name: 'Mood Snack (-5)', type: 'snack', price: 20, description: '-5 Fury', effect: { fury: -5 } },
    { id: 'mood_5', name: 'Mood Snack (+5)', type: 'snack', price: 20, description: '+5 Fury', effect: { fury: 5 } },
    { id: 'mood_10', name: 'Mood Snack (+10)', type: 'snack', price: 35, description: '+10 Fury', effect: { fury: 10 } },
    { id: 'mood_15', name: 'Mood Snack (+15)', type: 'snack', price: 45, description: '+15 Fury', effect: { fury: 15 } },
    { id: 'mood_20', name: 'Mood Snack (+20)', type: 'snack', price: 55, description: '+20 Fury', effect: { fury: 20 } },
    { id: 'mood_25', name: 'Mood Snack (+25)', type: 'snack', price: 70, description: '+25 Fury', effect: { fury: 25 } },
    { id: 'mood_30', name: 'Mood Snack (+30)', type: 'snack', price: 90, description: '+30 Fury', effect: { fury: 30 } },
    { id: 'mood_40', name: 'Mood Snack (+40)', type: 'snack', price: 130, description: '+40 Fury', effect: { fury: 40 } },
    { id: 'mood_50', name: 'Mood Snack (+50)', type: 'snack', price: 200, description: '+50 Fury', effect: { fury: 50 } },
    { id: 'mood_75', name: 'Mood Snack (+75)', type: 'snack', price: 350, description: '+75 Fury', effect: { fury: 75 } },
    { id: 'mood_100', name: 'Mood Snack (+100)', type: 'snack', price: 600, description: '+100 Fury', effect: { fury: 100 } },

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

    // Cosmetics
    { id: 'cosmetic_tie_blue', name: 'Blue Dragon Tie', type: 'cosmetic', price: 75, description: 'A classy blue tie for your dragon.' },
    { id: 'cosmetic_shades', name: 'Sunglasses', type: 'cosmetic', price: 90, description: 'Cool sunglasses for your dragon.' },
    { id: 'cosmetic_crown', name: 'Royal Crown', type: 'cosmetic', price: 1000, description: 'A crown to rule the skies.' },
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

  const [ownedItems, setOwnedItems] = useState<Record<string, number>>({});
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const shopItems = useMemo(() => buildInitialShopItems(), []);

  const addItemToInventory = (id: string, qty = 1) => {
    setOwnedItems(prev => ({ ...prev, [id]: (prev[id] || 0) + qty }));
  };

  const purchaseItem = (id: string) => {
    const item = shopItems.find(i => i.id === id);
    if (!item) return false;
    if (!coins.spendCoins(item.price)) return false;
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

    // Generators: add immediate coins equal to day's value on purchase
    if (item.type === 'generator' && item.effect?.coinsPerDay) {
      coins.addCoins(item.effect.coinsPerDay);
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

  const value: ItemsProviderContextProps = {
    shopItems,
    ownedItems,
    purchaseItem,
    useItem,
    addItemToInventory,
    activeEffects,
    getActiveCoinMultiplier,
    getActiveJeopardyMultiplier,
  };

  return <ItemsProviderContext.Provider value={value}>{children}</ItemsProviderContext.Provider>;
}
