import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useDragonCoins } from './DragonCoinsProvider';
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

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
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

	{ id: 'perfect_health', emoji: '\u2764\uFE0F', title: 'Full Vitality', description: 'Have your dragon at full health' },

	{ id: 'fury_chill', emoji: '\uD83E\uDDD8', title: 'Zen Dragon', description: 'Achieve minimum fury (Yin)' },
	{ id: 'fury_raging', emoji: '\uD83D\uDCA2', title: 'Primal Rage', description: 'Reach maximum fury (Yang)', secret: true },

	{ id: 'surveys_7', emoji: '\uD83D\uDCCB', title: 'Survey Enthusiast', description: 'Complete 7 surveys' },
	{ id: 'surveys_30', emoji: '\uD83D\uDCCA', title: 'Daily Tracker', description: 'Complete 30 surveys' },
];

export function AchievementsProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const coins = useDragonCoins();
	const goals = useGoals();
	const streak = useStreak();
	const scarLevel = useScarLevel();
	const fury = useFury();
	const population = usePopulation();
	const shards = useShards();

	const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);

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

		if (dragon.hp === dragon.maxHP) unlockIfMissing('perfect_health');

		if (fury.furyMeter <= 10) unlockIfMissing('fury_chill');
		if (fury.furyMeter >= 90) unlockIfMissing('fury_raging');
	}, [dragon.age, dragon.hp, dragon.maxHP, coins.coins, goals.habits.length, goals.todos.length, streak.streak, scarLevel.currentScarLevel, fury.furyMeter, population.population, shards.shards]);

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
