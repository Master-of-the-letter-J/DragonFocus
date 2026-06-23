import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useDragonAttacks } from './DragonAttacksProvider';
import { useDragonCoins } from './DragonCoinsProvider';
import { useDragonOrbs } from './DragonOrbsProvider';
import { useDragon } from './DragonProvider';
import { useShards } from './DragonShardsProvider';
import { useFury } from './FuryProvider';
import { useGoals } from './GoalsProvider';
import { usePopulation } from './PopulationProvider';
import { useScarLevel } from './ScarLevelProvider';
import { useStreak } from './StreakProvider';

export interface Achievement {
	id: string;
	emoji: string;
	title: string;
	description: string;
	unlockedAt?: string | null;
	secret?: boolean;
	points?: number;
}

interface AchievementsContextType {
	achievements: Achievement[];
	unlockedAchievements: Achievement[];
	unlockedCount: number;
	totalCount: number;
	isUnlocked: (id: string) => boolean;
	unlock: (id: string) => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

const tieredAchievements = (
	prefix: string,
	titlePrefix: string,
	descriptionPrefix: string,
	thresholds: number[],
	icon: string,
) =>
	thresholds.map(threshold => ({
		id: `${prefix}_${threshold}`,
		emoji: icon,
		title: `${titlePrefix} ${threshold.toLocaleString()}`,
		description: `${descriptionPrefix} ${threshold.toLocaleString()}.`,
	}));

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
	{ id: 'check_in_1', emoji: 'IN', title: 'First Briefing', description: 'Complete 1 check-in survey' },
	{ id: 'check_out_1', emoji: 'OUT', title: 'First Debrief', description: 'Complete 1 check-out survey' },
	{ id: 'first_habit', emoji: '\uD83C\uDF31', title: 'Seed Planted', description: 'Add your first habit' },
	{ id: 'five_habits', emoji: '\uD83C\uDF3F', title: 'Growing Garden', description: 'Create 5 unique habits' },
	{ id: 'ten_habits', emoji: '\uD83C\uDF33', title: 'Forest of Discipline', description: 'Create 10 unique habits' },

	{ id: 'streak_7', emoji: '\uD83D\uDD25', title: 'Week of Fire', description: 'Achieve a 7-day streak' },
	{ id: 'streak_30', emoji: '\uD83C\uDF1F', title: 'Monthly Champion', description: 'Achieve a 30-day streak' },
	{ id: 'streak_100', emoji: '\u2B50', title: 'Century Champion', description: 'Achieve a 100-day streak' },

	{ id: 'coins_100', emoji: '\uD83D\uDCB0', title: 'First Fortune', description: 'Earn 100 coins' },
	{ id: 'coins_1000', emoji: '\uD83D\uDC8E', title: 'Dragon Hoard', description: 'Accumulate 1000 coins' },
	{ id: 'coins_10000', emoji: '\uD83D\uDC51', title: 'Royal Treasury', description: 'Accumulate 10000 coins' },

	{ id: 'goals_10', emoji: '\u2705', title: 'Accomplished', description: 'Complete 10 goals' },
	{ id: 'goals_50', emoji: '\uD83C\uDFAF', title: 'Focused Warrior', description: 'Complete 50 goals' },
	{ id: 'goals_100', emoji: '\uD83C\uDFC6', title: 'Goal Mastery', description: 'Complete 100 goals' },

	{ id: 'dragon_100', emoji: '\uD83D\uDC09', title: 'Century Dragon', description: 'Reach age 100' },
	{ id: 'dragon_365', emoji: '\uD83D\uDC32', title: 'Year-Old Wyrm', description: 'Reach age 365 (Wyrm)' },

	{ id: 'scar_1', emoji: 'S1', title: 'Marked by Fire', description: 'Reach Scar Level 1' },
	{ id: 'scar_10', emoji: 'S10', title: 'Legend of Scars', description: 'Reach Scar Level 10' },
	{ id: 'scar_15', emoji: 'S15', title: 'Traumatic Scars', description: 'Reach Scar Level 15' },
	{ id: 'scar_30', emoji: 'S30', title: 'Ultimate Dragon Warrior', description: 'Reach the final XP tier at Scar Level 30' },

	{ id: 'population_1m', emoji: '\uD83D\uDC65', title: 'Popular Dragon', description: 'Reach 1 million population' },
	{ id: 'population_1b', emoji: '\uD83C\uDF0D', title: 'Global Icon', description: 'Reach 1 billion population' },

	{ id: 'shards_50', emoji: '\u2728', title: 'Crystal Collector', description: 'Earn 50 shards' },
	{ id: 'orbs_100', emoji: 'O100', title: 'Orb Forged', description: 'Earn 100 Dragon Orbs' },
	{ id: 'damage_100', emoji: 'DMG', title: 'Sharpened Wrath', description: 'Reach 100 dragon damage' },
	{ id: 'legion_1k', emoji: 'OL', title: 'Legion Breaker', description: 'Destroy 1,000 Obsidian Legions' },
	{ id: 'tanks_100', emoji: 'TK', title: 'Tank Breaker', description: 'Destroy 100 Obsidian tanks' },
	{ id: 'aircraft_10', emoji: 'AIR', title: 'Sky Denial', description: 'Destroy 10 Obsidian aircraft' },

	{ id: 'perfect_health', emoji: '\u2764\uFE0F', title: 'Full Vitality', description: 'Have your dragon at full health' },

	{ id: 'fury_chill', emoji: '\uD83E\uDDD8', title: 'Zen Dragon', description: 'Achieve minimum fury (Yin)' },
	{ id: 'fury_raging', emoji: '\uD83D\uDCA2', title: 'Primal Rage', description: 'Reach maximum fury (Yang)', secret: true },

	{ id: 'surveys_7', emoji: '\uD83D\uDCCB', title: 'Survey Enthusiast', description: 'Complete 7 surveys' },
	{ id: 'surveys_30', emoji: '\uD83D\uDCCA', title: 'Daily Tracker', description: 'Complete 30 surveys' },
	...tieredAchievements('check_ins', 'Briefings Filed', 'Complete check-in surveys:', [5, 10, 25, 50, 100, 250, 500], 'CI'),
	...tieredAchievements('check_outs', 'Debriefs Filed', 'Complete check-out surveys:', [5, 10, 25, 50, 100, 250, 500], 'CO'),
	...tieredAchievements('goals_total', 'Directives Executed', 'Complete total goals:', [5, 25, 100, 250, 500, 1000, 2500], 'G'),
	...tieredAchievements('focus_minutes', 'Pomodoro Reactor', 'Complete focus minutes:', [25, 100, 500, 1000, 2500, 5000, 10000], 'POM'),
	...tieredAchievements('energy_total', 'Energy Mandate', 'Earn total energy:', [100, 1000, 10000, 100000, 1000000, 10000000, 100000000], 'EN'),
	...tieredAchievements('dark_energy_total', 'Dark Energy Mandate', 'Earn dark energy:', [10, 50, 100, 500, 1000, 5000, 10000], 'DE'),
	...tieredAchievements('plasma_total', 'Plasma Weather', 'Earn plasma:', [1, 5, 10, 25, 50, 100, 250], 'PL'),
	...tieredAchievements('anomalies_total', 'Anomaly Registry', 'Earn anomalies:', [1, 3, 10, 25, 50, 100, 250], 'AN'),
	...tieredAchievements('crimson_streak', 'Crimson Continuity', 'Reach crimson streak:', [3, 7, 14, 30, 60, 100, 365], 'CS'),
	...tieredAchievements('armageddon_count', 'Armageddon Protocol', 'Complete Armageddon count:', [1, 2, 5, 10, 25, 50], 'ARM'),
	...tieredAchievements('transcension_count', 'Transcension Protocol', 'Complete Transcension count:', [1, 2, 5, 10, 25], 'TR'),
	{ id: 'secret_stillness', emoji: '???', title: '??? Secret Achievement', description: 'Keep the dragon perfectly calm through a full cycle.', secret: true, points: 25 },
	{ id: 'secret_overclock', emoji: '???', title: '??? Secret Achievement', description: 'Create an absurd energy spike in one day.', secret: true, points: 50 },
	{ id: 'secret_last_light', emoji: '???', title: '??? Secret Achievement', description: 'Recover from a catastrophic breach.', secret: true, points: 50 },
];

const normalizeAchievements = (storedValue: Achievement[] | null, initialValue: Achievement[]) => {
	const storedById = new Map((storedValue ?? []).map(item => [item.id, item]));
	return initialValue.map(item => ({ ...item, unlockedAt: storedById.get(item.id)?.unlockedAt ?? item.unlockedAt ?? null }));
};

export function AchievementsProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const coins = useDragonCoins();
	const goals = useGoals();
	const streak = useStreak();
	const scarLevel = useScarLevel();
	const fury = useFury();
	const population = usePopulation();
	const shards = useShards();
	const orbs = useDragonOrbs();
	const attacks = useDragonAttacks();

	const { state: achievements, setState: setAchievements } = usePersistedState(APP_STORAGE_KEYS.achievements, DEFAULT_ACHIEVEMENTS, { normalize: normalizeAchievements });

	useEffect(() => {
		const unlockIfMissing = (id: string) => {
			setAchievements(prev => {
				const achievement = prev.find(item => item.id === id);
				if (achievement && !achievement.unlockedAt) {
					return prev.map(item => (item.id === id ? { ...item, unlockedAt: new Date().toISOString() } : item));
				}
				return prev;
			});
		};

		if (goals.habits.length > 0) unlockIfMissing('first_habit');
		if (goals.habits.length >= 5) unlockIfMissing('five_habits');
		if (goals.habits.length >= 10) unlockIfMissing('ten_habits');

		if (streak.streak >= 7) unlockIfMissing('streak_7');
		if (streak.streak >= 30) unlockIfMissing('streak_30');
		if (streak.streak >= 100) unlockIfMissing('streak_100');

		if (coins.coins >= 100) unlockIfMissing('coins_100');
		if (coins.coins >= 1000) unlockIfMissing('coins_1000');
		if (coins.coins >= 10000) unlockIfMissing('coins_10000');

		const completedGoalsEstimate = goals.habits.length * 5 + goals.todos.length * 2;
		if (completedGoalsEstimate >= 10) unlockIfMissing('goals_10');
		if (completedGoalsEstimate >= 50) unlockIfMissing('goals_50');
		if (completedGoalsEstimate >= 100) unlockIfMissing('goals_100');

		if (dragon.age >= 100) unlockIfMissing('dragon_100');
		if (dragon.age >= 365) unlockIfMissing('dragon_365');

		if (scarLevel.currentScarLevel >= 1) unlockIfMissing('scar_1');
		if (scarLevel.currentScarLevel >= 10) unlockIfMissing('scar_10');
		if (scarLevel.currentScarLevel >= 15) unlockIfMissing('scar_15');
		if (scarLevel.currentScarLevel >= 30) unlockIfMissing('scar_30');

		if (population.population >= 1_000_000) unlockIfMissing('population_1m');
		if (population.population >= 1_000_000_000) unlockIfMissing('population_1b');

		if (shards.shards >= 50) unlockIfMissing('shards_50');
		if (orbs.totalOrbsEarned >= 100) unlockIfMissing('orbs_100');
		if (attacks.rates.damage >= 100) unlockIfMissing('damage_100');
		if (attacks.world.totalLegionsDestroyed >= 1_000) unlockIfMissing('legion_1k');
		if (attacks.world.totalTanksDestroyed >= 100) unlockIfMissing('tanks_100');
		if (attacks.world.totalAircraftDestroyed >= 10) unlockIfMissing('aircraft_10');

		if (dragon.hp === dragon.maxHP) unlockIfMissing('perfect_health');

		if (fury.furyMeter <= 10) unlockIfMissing('fury_chill');
		if (fury.furyMeter >= 90) unlockIfMissing('fury_raging');
	}, [attacks.rates.damage, attacks.world.totalAircraftDestroyed, attacks.world.totalLegionsDestroyed, attacks.world.totalTanksDestroyed, dragon.age, dragon.hp, dragon.maxHP, coins.coins, goals.habits.length, goals.todos.length, streak.streak, scarLevel.currentScarLevel, fury.furyMeter, population.population, shards.shards, orbs.totalOrbsEarned]);

	const unlockedCount = achievements.filter(item => item.unlockedAt).length;
	const totalCount = achievements.length;

	const isUnlocked = (id: string): boolean => achievements.some(item => item.id === id && item.unlockedAt);

	const unlock = (id: string) => {
		setAchievements(prev => prev.map(item => (item.id === id && !item.unlockedAt ? { ...item, unlockedAt: new Date().toISOString() } : item)));
	};

	return (
		<AchievementsContext.Provider
			value={{
				achievements: achievements.map(item => (item.secret && !item.unlockedAt ? { ...item, title: '??? Secret Achievement', description: 'Complete a challenge to unlock' } : item)),
				unlockedAchievements: achievements.filter(item => item.unlockedAt),
				unlockedCount,
				totalCount,
				isUnlocked,
				unlock,
			}}>
			{children}
		</AchievementsContext.Provider>
	);
}

export function useAchievements(): AchievementsContextType {
	const ctx = useContext(AchievementsContext);
	if (!ctx) throw new Error('useAchievements must be used within AchievementsProvider');
	return ctx;
}
