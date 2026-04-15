import type { QueueGroup, ValueRange } from './market-types';

export interface SnackEffectConfig {
	id: string;
	days?: number;
	queueGroup?: QueueGroup;
	effectTag?: string;
	surveyMultiplier?: number;
	generatorMultiplier?: number;
	clickerMultiplier?: number;
	jeopardyMultiplier?: number;
	immediateFury?: ValueRange;
	immediateHealth?: ValueRange;
	furyPerDay?: ValueRange;
	healthPerDay?: ValueRange;
	clearEffects?: 'normal' | 'all';
	ageDelta?: number;
	toastText: string;
}

const value = (amount: number): ValueRange => ({ min: amount, max: amount });
const range = (min: number, max: number): ValueRange => ({ min, max });

export const SNACK_EFFECT_DATA: Record<string, SnackEffectConfig> = {
	survey_duplication_i_basic: { id: 'survey_duplication_i_basic', days: 1, queueGroup: 'survey', surveyMultiplier: 2, toastText: 'Survey x2 for 1 day' },
	survey_duplication_i: { id: 'survey_duplication_i', days: 7, queueGroup: 'survey', surveyMultiplier: 2, toastText: 'Survey x2 for 7 days' },
	survey_duplication_ii: { id: 'survey_duplication_ii', days: 3, queueGroup: 'survey', surveyMultiplier: 4, toastText: 'Survey x4 for 3 days' },
	survey_duplication_iii: { id: 'survey_duplication_iii', days: 1, queueGroup: 'survey', surveyMultiplier: 8, toastText: 'Survey x8 for 1 day' },
	space_nuggets: { id: 'space_nuggets', immediateFury: range(-25, 25), toastText: 'Random Fury shift applied' },
	chill_nuggets: { id: 'chill_nuggets', immediateFury: range(-15, -10), toastText: 'Fury cooled down' },
	explosive_nuggets: { id: 'explosive_nuggets', immediateFury: range(10, 15), toastText: 'Fury spiked upward' },
	therapy_nuggets: { id: 'therapy_nuggets', days: 10, furyPerDay: range(-15, -5), toastText: 'Fury settles for 10 days' },
	health_chocolate: { id: 'health_chocolate', immediateHealth: value(10), toastText: 'Health +10' },
	super_health_chocolate: { id: 'super_health_chocolate', immediateHealth: range(15, 25), toastText: 'Health surged upward' },
	dark_health_chocolate: { id: 'dark_health_chocolate', immediateHealth: range(-10, 20), toastText: 'Dark chocolate rolled a health shift' },
	white_health_chocolate: { id: 'white_health_chocolate', immediateHealth: range(-10, 20), toastText: 'White chocolate rolled a health shift' },
	regeneration_10: { id: 'regeneration_10', days: 10, healthPerDay: value(10), toastText: 'Health +10/day for 10 days' },
	regeneration_20: { id: 'regeneration_20', days: 10, healthPerDay: value(20), toastText: 'Health +20/day for 10 days' },
	regeneration_50: { id: 'regeneration_50', days: 10, healthPerDay: value(50), toastText: 'Health +50/day for 10 days' },
	regeneration_100: { id: 'regeneration_100', days: 10, healthPerDay: value(100), toastText: 'Health +100/day for 10 days' },
	bipolar_nuggets: { id: 'bipolar_nuggets', days: 10, furyPerDay: range(-20, 10), toastText: 'Mood oscillation active for 10 days' },
	jeopardy_i: { id: 'jeopardy_i', days: 7, queueGroup: 'jeopardy', jeopardyMultiplier: 4, toastText: 'Jeopardy x4 for 7 days' },
	jeopardy_ii: { id: 'jeopardy_ii', days: 3, queueGroup: 'jeopardy', jeopardyMultiplier: 16, toastText: 'Jeopardy x16 for 3 days' },
	jeopardy_iii: { id: 'jeopardy_iii', days: 1, queueGroup: 'jeopardy', jeopardyMultiplier: 64, toastText: 'Jeopardy x64 for 1 day' },
	coin_generator_booster_i_basic: { id: 'coin_generator_booster_i_basic', days: 1, queueGroup: 'generator', generatorMultiplier: 2, toastText: 'Generator x2 for 1 day' },
	coin_clicker_booster_i_basic: { id: 'coin_clicker_booster_i_basic', days: 1, queueGroup: 'clicker', clickerMultiplier: 2, toastText: 'Clicker x2 for 1 day' },
	cursed_survey_duplication_i_basic: { id: 'cursed_survey_duplication_i_basic', days: 1, effectTag: 'cursed_survey_duplication', surveyMultiplier: 4, generatorMultiplier: 0.5, toastText: 'Survey x4 and Generator x0.5 for 1 day' },
	coin_generator_booster_i: { id: 'coin_generator_booster_i', days: 7, queueGroup: 'generator', generatorMultiplier: 2, toastText: 'Generator x2 for 7 days' },
	coin_generator_booster_ii: { id: 'coin_generator_booster_ii', days: 3, queueGroup: 'generator', generatorMultiplier: 4, toastText: 'Generator x4 for 3 days' },
	coin_generator_booster_iii: { id: 'coin_generator_booster_iii', days: 1, queueGroup: 'generator', generatorMultiplier: 8, toastText: 'Generator x8 for 1 day' },
	coin_clicker_booster_i: { id: 'coin_clicker_booster_i', days: 7, queueGroup: 'clicker', clickerMultiplier: 2, toastText: 'Clicker x2 for 7 days' },
	coin_clicker_booster_ii: { id: 'coin_clicker_booster_ii', days: 3, queueGroup: 'clicker', clickerMultiplier: 4, toastText: 'Clicker x4 for 3 days' },
	coin_clicker_booster_iii: { id: 'coin_clicker_booster_iii', days: 1, queueGroup: 'clicker', clickerMultiplier: 8, toastText: 'Clicker x8 for 1 day' },
	cursed_survey_duplication_i: { id: 'cursed_survey_duplication_i', days: 7, effectTag: 'cursed_survey_duplication', surveyMultiplier: 4, generatorMultiplier: 0.5, toastText: 'Survey x4 and Generator x0.5 for 7 days' },
	cursed_survey_duplication_ii: { id: 'cursed_survey_duplication_ii', days: 3, effectTag: 'cursed_survey_duplication', surveyMultiplier: 16, generatorMultiplier: 0.25, toastText: 'Survey x16 and Generator x0.25 for 3 days' },
	cursed_survey_duplication_iii: { id: 'cursed_survey_duplication_iii', days: 1, effectTag: 'cursed_survey_duplication', surveyMultiplier: 64, generatorMultiplier: 0.125, toastText: 'Survey x64 and Generator x0.125 for 1 day' },
	ice_snack: { id: 'ice_snack', immediateFury: value(-20), immediateHealth: value(-10), toastText: 'Fury -20 and Health -10' },
	fire_snack: { id: 'fire_snack', immediateFury: value(10), immediateHealth: value(5), toastText: 'Fury +10 and Health +5' },
	ice_injection: { id: 'ice_injection', days: 5, immediateFury: value(-100), healthPerDay: value(-5), toastText: 'Fury -100 and Health -5/day for 5 days' },
	fire_injection: { id: 'fire_injection', days: 5, immediateHealth: value(100), furyPerDay: value(20), toastText: 'Health +100 and Fury +20/day for 5 days' },
	milk: { id: 'milk', clearEffects: 'normal', toastText: 'Cleared all removable effects' },
	super_milk: { id: 'super_milk', clearEffects: 'all', toastText: 'Cleared every effect, including Ascension Sickness' },
	super_snack: {
		id: 'super_snack',
		days: 10,
		surveyMultiplier: 2,
		generatorMultiplier: 2,
		clickerMultiplier: 2,
		immediateFury: value(-10),
		immediateHealth: value(10),
		toastText: 'Survey, generator, and click rewards doubled for 10 days',
	},
	age_snack: { id: 'age_snack', ageDelta: 1, toastText: 'Dragon Age +1' },
};

export const getSnackEffectConfig = (effectId: string) => SNACK_EFFECT_DATA[effectId];
