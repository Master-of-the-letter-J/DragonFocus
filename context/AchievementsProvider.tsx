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
	secret?: boolean; // Hidden until unlocked
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
	// Habit achievements
	{
		id: 'first_habit',
		emoji: '🌱',
		title: 'Seed Planted',
		description: 'Add your first habit',
		secret: false,
	},
	{
		id: 'five_habits',
		emoji: '🌿',
		title: 'Growing Garden',
		description: 'Create 5 unique habits',
		secret: false,
	},
	{
		id: 'ten_habits',
		emoji: '🌳',
		title: 'Forest of Discipline',
		description: 'Create 10 unique habits',
		secret: false,
	},

	// Streak achievements
	{
		id: 'streak_7',
		emoji: '🔥',
		title: 'Week of Fire',
		description: 'Achieve a 7-day streak',
		secret: false,
	},
	{
		id: 'streak_30',
		emoji: '🌟',
		title: 'Monthly Champion',
		description: 'Achieve a 30-day streak',
		secret: false,
	},
	{
		id: 'streak_100',
		emoji: '⭐',
		title: 'Century Champion',
		description: 'Achieve a 100-day streak',
		secret: false,
	},

	// Coin achievements
	{
		id: 'coins_100',
		emoji: '💰',
		title: 'First Fortune',
		description: 'Earn 100 coins',
		secret: false,
	},
	{
		id: 'coins_1000',
		emoji: '💎',
		title: 'Dragon Hoard',
		description: 'Accumulate 1000 coins',
		secret: false,
	},
	{
		id: 'coins_10000',
		emoji: '👑',
		title: 'Royal Treasury',
		description: 'Accumulate 10000 coins',
		secret: false,
	},

	// Goal achievements
	{
		id: 'goals_10',
		emoji: '✅',
		title: 'Accomplished',
		description: 'Complete 10 goals',
		secret: false,
	},
	{
		id: 'goals_50',
		emoji: '🎯',
		title: 'Focused Warrior',
		description: 'Complete 50 goals',
		secret: false,
	},
	{
		id: 'goals_100',
		emoji: '🏆',
		title: 'Goal Mastery',
		description: 'Complete 100 goals',
		secret: false,
	},

	// Dragon age achievements
	{
		id: 'dragon_100',
		emoji: '🐉',
		title: 'Century Dragon',
		description: 'Reach age 100',
		secret: false,
	},
	{
		id: 'dragon_365',
		emoji: '🐲',
		title: 'Year-Old Wyrm',
		description: 'Reach age 365 (Wyrm)',
		secret: false,
	},

	// Scar level achievements
	{
		id: 'scar_5',
		emoji: '🧿',
		title: 'Spiritual Path',
		description: 'Reach Scar Level 5',
		secret: false,
	},
	{
		id: 'scar_10',
		emoji: '👁️',
		title: 'All-Seeing Eye',
		description: 'Reach Scar Level 10',
		secret: false,
	},

	// Population achievements
	{
		id: 'population_1m',
		emoji: '👥',
		title: 'Popular Dragon',
		description: 'Reach 1 million population',
		secret: false,
	},
	{
		id: 'population_1b',
		emoji: '🌍',
		title: 'Global Icon',
		description: 'Reach 1 billion population',
		secret: false,
	},

	// Shards achievements
	{
		id: 'shards_50',
		emoji: '✨',
		title: 'Crystal Collector',
		description: 'Earn 50 shards',
		secret: false,
	},

	// Dragon health achievements
	{
		id: 'perfect_health',
		emoji: '❤️',
		title: 'Full Vitality',
		description: 'Have your dragon at full health',
		secret: false,
	},

	// Fury achievements
	{
		id: 'fury_chill',
		emoji: '🧘',
		title: 'Zen Dragon',
		description: 'Achieve minimum fury (Yin)',
		secret: false,
	},
	{
		id: 'fury_raging',
		emoji: '💢',
		title: 'Primal Rage',
		description: 'Reach maximum fury (Yang)',
		secret: true,
	},

	// Survey achievements
	{
		id: 'surveys_7',
		emoji: '📋',
		title: 'Survey Enthusiast',
		description: 'Complete 7 surveys',
		secret: false,
	},
	{
		id: 'surveys_30',
		emoji: '📊',
		title: 'Daily Tracker',
		description: 'Complete 30 surveys',
		secret: false,
	},
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

	// Auto-unlock achievements based on game state
	useEffect(() => {
		const unlockIfMissing = (id: string) => {
			setAchievements(prev => {
				const achievement = prev.find(a => a.id === id);
				if (achievement && !achievement.unlockedAt) {
					return prev.map(a => (a.id === id ? { ...a, unlockedAt: new Date().toISOString() } : a));
				}
				return prev;
			});
		};

		// Check all achievement conditions
		if (goals.habits.length > 0) unlockIfMissing('first_habit');
		if (goals.habits.length >= 5) unlockIfMissing('five_habits');
		if (goals.habits.length >= 10) unlockIfMissing('ten_habits');

		if (streak.streak >= 7) unlockIfMissing('streak_7');
		if (streak.streak >= 30) unlockIfMissing('streak_30');
		if (streak.streak >= 100) unlockIfMissing('streak_100');

		if (coins.coins >= 100) unlockIfMissing('coins_100');
		if (coins.coins >= 1000) unlockIfMissing('coins_1000');
		if (coins.coins >= 10000) unlockIfMissing('coins_10000');

		// Count completed goals (rough estimate from habits/todos)
		const completedGoalsEstimate = goals.habits.length * 5 + goals.todos.length * 2;
		if (completedGoalsEstimate >= 10) unlockIfMissing('goals_10');
		if (completedGoalsEstimate >= 50) unlockIfMissing('goals_50');
		if (completedGoalsEstimate >= 100) unlockIfMissing('goals_100');

		if (dragon.age >= 100) unlockIfMissing('dragon_100');
		if (dragon.age >= 365) unlockIfMissing('dragon_365');

		if (scarLevel.currentScarLevel >= 5) unlockIfMissing('scar_5');
		if (scarLevel.currentScarLevel >= 10) unlockIfMissing('scar_10');

		if (population.population >= 1000000) unlockIfMissing('population_1m');
		if (population.population >= 1000000000) unlockIfMissing('population_1b');

		if (shards.shards >= 50) unlockIfMissing('shards_50');

		if (dragon.hp === dragon.maxHP) unlockIfMissing('perfect_health');

		if (fury.furyMeter <= 10) unlockIfMissing('fury_chill');
		if (fury.furyMeter >= 90) unlockIfMissing('fury_raging');

		// Survey count would need to be tracked separately - placeholder for now
		// if (surveyCount >= 7) unlockIfMissing('surveys_7');
		// if (surveyCount >= 30) unlockIfMissing('surveys_30');
	}, [dragon.age, dragon.hp, dragon.maxHP, coins.coins, goals.habits.length, goals.todos.length, streak.streak, scarLevel.currentScarLevel, fury.furyMeter, population.population, shards.shards]);

	const unlockedCount = achievements.filter(a => a.unlockedAt).length;
	const totalCount = achievements.length;

	const isUnlocked = (id: string): boolean => {
		return achievements.some(a => a.id === id && a.unlockedAt);
	};

	const unlock = (id: string) => {
		setAchievements(prev => prev.map(a => (a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a)));
	};

	return (
		<AchievementsContext.Provider
			value={{
				achievements: achievements.map(a => (a.secret && !a.unlockedAt ? { ...a, title: '??? Secret Achievement', description: 'Complete a challenge to unlock' } : a)),
				unlockedAchievements: achievements.filter(a => a.unlockedAt),
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
