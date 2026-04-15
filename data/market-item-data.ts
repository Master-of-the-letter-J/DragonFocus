import { COIN_CLICKER_DATA } from './coin-clicker-data';
import { COIN_GENERATOR_DATA } from './coin-generator-data';
import { COSMETIC_DATA } from './cosmetic-data';
import type { MarketItem } from './market-types';
import { SNACK_DATA } from './snack-data';
import { SOUL_MULTIPLIER_DATA } from './soul-multiplier-data';
import { THEME_DATA } from './theme-data';

export const MARKET_ITEMS: MarketItem[] = [...SNACK_DATA, ...COIN_GENERATOR_DATA, ...COIN_CLICKER_DATA, ...SOUL_MULTIPLIER_DATA, ...COSMETIC_DATA, ...THEME_DATA];

