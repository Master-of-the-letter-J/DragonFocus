import type { ValueRange } from '@/data/market-types';

export const DAY_SECONDS = 86_400;
export const DAY_MS = DAY_SECONDS * 1000;
export const SNACK_RARE_IDS = new Set(['snack_super', 'snack_age']);

export const round2 = (value: number) => Math.round(value * 100) / 100;
export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const makeEffectId = () => `effect_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const effectStrength = (value: number | undefined, amplifier: number) => {
	if (value === undefined) return undefined;
	if (value === 1) return 1;
	if (value > 1) return 1 + (value - 1) * amplifier;
	return 1 - (1 - value) * amplifier;
};

export const resolveRangeValue = (range?: ValueRange) => {
	if (!range) return undefined;
	const min = Math.round(range.min);
	const max = Math.round(range.max);
	if (min === max) return min;
	return randInt(Math.min(min, max), Math.max(min, max));
};

export const formatSignedValue = (label: string, amount: number) => `${label} ${amount >= 0 ? '+' : ''}${amount}`;
export const formatSignedDailyValue = (label: string, amount: number) => `${label}/day ${amount >= 0 ? '+' : ''}${amount}`;
