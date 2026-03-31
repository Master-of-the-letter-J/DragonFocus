import { SUGGESTED_HABIT_GOALS, SUGGESTED_TODO_GOALS, SuggestedHabitGoal, SuggestedTodoGoal } from '@/constants/suggestgoals';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useDragonCoins } from './DragonCoinsProvider';
import { useShards } from './DragonShardsProvider';

// Simple uid generator to avoid extra dependency in prototype
function uid() {
	return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

export type Importance = 'Important+' | 'Important' | 'Default';

export interface HabitGoal {
	id: string;
	title: string;
	importance: Importance;
	numberFlair?: number;
	timeFlair?: number; // minutes
	category?: string;
	categories?: string[];
	// which days the habit shows up (e.g. ['Mon','Tue'])
	daysOfWeek?: string[];
	timesPerWeek?: number;
	streak: number;
	lastCompletedDate?: string | null;
	isChallenge?: boolean;
	challengeLength?: number;
	challengeStartDate?: string | null;
	challengeRewardClaimed?: boolean;
	challengeStatus?: 'active' | 'completed' | 'failed';
	challengeFailedDate?: string | null;
	createdAt: number;
}

export interface SubGoal {
	id: string;
	title: string;
	completed: boolean;
}

export interface TodoGoal {
	id: string;
	title: string;
	importance: Importance;
	numberFlair?: number;
	timeFlair?: number;
	category?: string;
	categories?: string[];
	subGoals: SubGoal[];
	dueDate?: string | null;
	completedDate?: string | null;
	failed?: boolean;
	failedDate?: string | null;
	// Challenge fields for to-dos
	isChallenge?: boolean;
	challengeLength?: number;
	challengeStartDate?: string | null;
	challengeRewardClaimed?: boolean;
	rewardCoins?: number;
	rewardShards?: number;
	challengeStatus?: 'active' | 'completed' | 'failed';
	createdAt: number;
}

interface GoalsContextType {
	habits: HabitGoal[];
	todos: TodoGoal[];
	addHabit: (h: Partial<HabitGoal>) => HabitGoal;
	editHabit: (id: string, patch: Partial<HabitGoal>) => void;
	reorderHabits: (habits: HabitGoal[]) => void;
	deleteHabit: (id: string) => void;
	completeHabitToday: (id: string) => void;
	addTodo: (t: Partial<TodoGoal>) => TodoGoal;
	editTodo: (id: string, patch: Partial<TodoGoal>) => void;
	reorderTodos: (todos: TodoGoal[]) => void;
	deleteTodo: (id: string) => void;
	addSubGoal: (todoId: string, title: string) => void;
	toggleSubGoal: (todoId: string, subId: string) => void;
	completeTodo: (id: string) => boolean;
	failTodo: (id: string, fail: boolean) => void;
	suggestedHabitGoals: SuggestedHabitGoal[];
	suggestedTodoGoals: SuggestedTodoGoal[];
	rerollSuggestedHabits: () => void;
	rerollSuggestedTodos: () => void;
	goalTemplates: string[];
	createGoalFromTemplate: (template: string, type: 'habit' | 'todo') => void;
	resetGoals?: () => void;
	// Scar level based limits
	getMaxHabits: (scarLevel: number, isPremium: boolean) => number;
	getMaxTodos: (scarLevel: number, isPremium: boolean) => number;
	canAddHabit: (scarLevel: number, isPremium: boolean) => boolean;
	canAddTodo: (scarLevel: number, isPremium: boolean) => boolean;
	enableChallenge: (id: string, length: number) => { success: boolean; message?: string };
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const PRESET_HABITS: HabitGoal[] = [
	{ id: uid(), title: 'Make Bed', importance: 'Default', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
	{ id: uid(), title: 'Brush Teeth', importance: 'Default', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
	{ id: uid(), title: 'Drink 8 Cups of Water', importance: 'Important', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
	{ id: uid(), title: 'Meditate 10 Minutes', importance: 'Important+', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
	{ id: uid(), title: 'Exercise 30 minutes or more', importance: 'Important', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
	{ id: uid(), title: 'Sleep with Good Bedtime', importance: 'Important', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
];

const SUGGESTED = ['Read 10 pages', 'Run 1 mile', 'Practice instrument 30 min', 'Write 100 words', 'Cold shower', 'Stretch for 10 minutes', 'Do 20 push-ups', 'Meditate 15 minutes', 'Take a walk', 'Learn something new', 'Journal about your day', 'Drink 8 glasses of water', 'Tidy your space', 'Call a friend or family', 'Exercise for 30 minutes', 'Cook a healthy meal', 'Do yoga for 20 minutes', 'Take a cold bath', 'Study for 1 hour', 'Plan your day ahead'];

const GOAL_TEMPLATES = ['Run for (Time) minutes', 'Do (Amount) push-ups', 'Walk for (Time) minutes', 'Practice (Activity) for (Time) minutes', 'Read for (Time) minutes', 'Write (Amount) words', 'Stretch for (Time) minutes', 'Meditate for (Time) minutes', 'Drink (Amount) glasses of water', 'Do (Amount) squats'];

export function GoalsProvider({ children }: { children: ReactNode }) {
	const [habits, setHabits] = useState<HabitGoal[]>(PRESET_HABITS);
	const [todos, setTodos] = useState<TodoGoal[]>([]);
	const [suggestedHabitGoals, setSuggestedHabitGoals] = useState<SuggestedHabitGoal[]>(() => {
		const shuffled = [...SUGGESTED_HABIT_GOALS].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 6);
	});
	const [suggestedTodoGoals, setSuggestedTodoGoals] = useState<SuggestedTodoGoal[]>(() => {
		const shuffled = [...SUGGESTED_TODO_GOALS].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 6);
	});

	const rerollSuggestedHabits = () => {
		const shuffled = [...SUGGESTED_HABIT_GOALS].sort(() => Math.random() - 0.5);
		setSuggestedHabitGoals(shuffled.slice(0, 6));
	};

	const rerollSuggestedTodos = () => {
		const shuffled = [...SUGGESTED_TODO_GOALS].sort(() => Math.random() - 0.5);
		setSuggestedTodoGoals(shuffled.slice(0, 6));
	};

	// access coins/shards providers for challenge payments
	const coins = useDragonCoins();
	const shards = useShards();

	/**
	 * Enable a habit challenge: spends coins/shards and marks habit as challenge-started
	 */
	const enableChallenge = (id: string, length: number) => {
		const h = habits.find(x => x.id === id);
		if (!h) return { success: false, message: 'Habit not found' };
		if (h.isChallenge) return { success: false, message: 'Challenge already active' };
		let coinCost = 0;
		let shardCost = 0;
		switch (length) {
			case 7:
				coinCost = 10;
				break;
			case 14:
				coinCost = 25;
				break;
			case 30:
				coinCost = 50;
				shardCost = 5;
				break;
			default:
				return { success: false, message: 'Invalid challenge length' };
		}

		if (coinCost > 0 && !coins.spendCoins(coinCost)) return { success: false, message: 'Not enough coins' };
		if (shardCost > 0 && !shards.spendShards(shardCost)) {
			// refund coins if shards failed
			if (coinCost > 0) coins.addCoins(coinCost);
			return { success: false, message: 'Not enough shards' };
		}

		const startDate = new Date().toISOString().split('T')[0];
		setHabits(prev =>
			prev.map(x =>
				x.id === id
					? {
							...x,
							isChallenge: true,
							challengeLength: length,
							challengeStartDate: startDate,
							challengeRewardClaimed: false,
							challengeStatus: 'active',
							challengeFailedDate: null,
						}
					: x,
			),
		);
		return { success: true };
	};

	const addHabit = (h: Partial<HabitGoal>) => {
		const categories = h.categories ?? (h.category ? [h.category] : []);
		const newHabit: HabitGoal = {
			id: uid(),
			title: h.title || 'New Habit',
			importance: h.importance || 'Default',
			numberFlair: h.numberFlair,
			timeFlair: h.timeFlair,
			category: categories[0],
			categories,
			daysOfWeek: h.daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			timesPerWeek: h.timesPerWeek || 7,
			streak: 0,
			lastCompletedDate: null,
			isChallenge: h.isChallenge || false,
			challengeLength: h.challengeLength,
			challengeStartDate: h.challengeStartDate || null,
			challengeRewardClaimed: h.challengeRewardClaimed || false,
			challengeStatus: h.challengeStatus || (h.isChallenge ? 'active' : undefined),
			challengeFailedDate: h.challengeFailedDate || null,
			createdAt: Date.now(),
		};
		setHabits(prev => [newHabit, ...prev]);
		return newHabit;
	};

	const editHabit = (id: string, patch: Partial<HabitGoal>) => {
		setHabits(prev =>
			prev.map(h => {
				if (h.id !== id) return h;
				const nextCategories = patch.categories ?? (patch.category !== undefined ? (patch.category ? [patch.category] : []) : h.categories ?? (h.category ? [h.category] : []));
				return {
					...h,
					...patch,
					categories: nextCategories,
					category: nextCategories[0],
				};
			}),
		);
	};

	const reorderHabits = (orderedHabits: HabitGoal[]) => {
		setHabits(orderedHabits);
	};

	const deleteHabit = (id: string) => {
		setHabits(prev => prev.filter(h => h.id !== id));
	};

	const completeHabitToday = (id: string) => {
		const today = new Date().toISOString().split('T')[0];
		setHabits(prev =>
			prev.map(h => {
				if (h.id !== id) return h;
				if (h.lastCompletedDate === today) return h; // already done
				const newStreak = h.lastCompletedDate && isYesterday(h.lastCompletedDate) ? h.streak + 1 : 1;
				return { ...h, lastCompletedDate: today, streak: newStreak };
			}),
		);
	};

	const addTodo = (t: Partial<TodoGoal>) => {
		const categories = t.categories ?? (t.category ? [t.category] : []);
		const newTodo: TodoGoal = {
			id: uid(),
			title: t.title || 'New To-Do',
			importance: t.importance || 'Default',
			numberFlair: t.numberFlair,
			timeFlair: t.timeFlair,
			category: categories[0],
			categories,
			subGoals: t.subGoals || [],
			dueDate: t.dueDate || null,
			completedDate: null,
			failed: false,
			failedDate: null,
			isChallenge: t.isChallenge || false,
			challengeLength: t.challengeLength,
			challengeStartDate: t.challengeStartDate || null,
			challengeRewardClaimed: t.challengeRewardClaimed || false,
			rewardCoins: t.rewardCoins,
			rewardShards: t.rewardShards,
			challengeStatus: t.challengeStatus || (t.isChallenge ? 'active' : undefined),
			createdAt: Date.now(),
		};
		setTodos(prev => [newTodo, ...prev]);
		return newTodo;
	};

	const editTodo = (id: string, patch: Partial<TodoGoal>) => {
		setTodos(prev =>
			prev.map(t => {
				if (t.id !== id) return t;
				const nextCategories = patch.categories ?? (patch.category !== undefined ? (patch.category ? [patch.category] : []) : t.categories ?? (t.category ? [t.category] : []));
				return {
					...t,
					...patch,
					categories: nextCategories,
					category: nextCategories[0],
				};
			}),
		);
	};

	const reorderTodos = (orderedTodos: TodoGoal[]) => {
		setTodos(orderedTodos);
	};

	const deleteTodo = (id: string) => {
		setTodos(prev => prev.filter(t => t.id !== id));
	};

	const addSubGoal = (todoId: string, title: string) => {
		const sub: SubGoal = { id: uid(), title, completed: false };
		setTodos(prev => prev.map(t => (t.id === todoId ? { ...t, subGoals: [...t.subGoals, sub] } : t)));
	};

	const toggleSubGoal = (todoId: string, subId: string) => {
		setTodos(prev =>
			prev.map(t => {
				if (t.id !== todoId) return t;
				return { ...t, subGoals: t.subGoals.map(s => (s.id === subId ? { ...s, completed: !s.completed } : s)) };
			}),
		);
	};

	const completeTodo = (id: string) => {
		const todo = todos.find(t => t.id === id);
		if (!todo) return false;
		// Must wait 1 day after creation
		const created = new Date(todo.createdAt);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
		if (diffDays < 1) return false;
		setTodos(prev =>
			prev.map(t =>
				t.id === id
					? {
							...t,
							completedDate: new Date().toISOString().split('T')[0],
							failed: false,
							failedDate: null,
							challengeStatus: t.isChallenge ? 'completed' : t.challengeStatus,
						}
					: t,
			),
		);
		return true;
	};

	const failTodo = (id: string, fail: boolean) => {
		const date = fail ? new Date().toISOString().split('T')[0] : null;
		setTodos(prev =>
			prev.map(t =>
				t.id === id
					? {
							...t,
							failed: fail,
							failedDate: date,
							challengeStatus: fail && t.isChallenge ? 'failed' : t.challengeStatus,
						}
					: t,
			),
		);
	};

	const createGoalFromTemplate = (template: string, type: 'habit' | 'todo') => {
		const title = template;
		if (type === 'habit') {
			addHabit({ title, daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
		} else {
			addTodo({ title });
		}
	};

	// Helper functions for scar level based limits
	const getMaxHabits = (scarLevel: number, isPremium: boolean): number => {
		if (isPremium) return Infinity; // Unlimited for premium
		let max = 10; // Base = 10
		if (scarLevel >= 4) max += 5; // +5 at level 4
		if (scarLevel >= 8) max += 5; // +5 at level 8
		if (scarLevel >= 10) max += 5; // +5 at level 10
		return max;
	};

	const getMaxTodos = (scarLevel: number, isPremium: boolean): number => {
		if (isPremium) return Infinity; // Unlimited for premium
		let max = 5; // Base = 5
		if (scarLevel >= 4) max += 5; // +5 at level 4
		if (scarLevel >= 8) max += 5; // +5 at level 8
		if (scarLevel >= 10) max += 5; // +5 at level 10
		return max;
	};

	const canAddHabit = (scarLevel: number, isPremium: boolean): boolean => {
		return habits.length < getMaxHabits(scarLevel, isPremium);
	};

	const canAddTodo = (scarLevel: number, isPremium: boolean): boolean => {
		return todos.length < getMaxTodos(scarLevel, isPremium);
	};

	return (
		<GoalsContext.Provider
			value={{
				habits,
				todos,
				addHabit,
				editHabit,
				reorderHabits,
				deleteHabit,
				completeHabitToday,
				addTodo,
				editTodo,
				reorderTodos,
				deleteTodo,
				addSubGoal,
				toggleSubGoal,
				completeTodo,
				failTodo,
				suggestedHabitGoals,
				suggestedTodoGoals,
				rerollSuggestedHabits,
				rerollSuggestedTodos,
				goalTemplates: GOAL_TEMPLATES,
				createGoalFromTemplate,
				resetGoals: () => {
					setHabits(PRESET_HABITS);
					setTodos([]);
					const shuffled1 = [...SUGGESTED_HABIT_GOALS].sort(() => Math.random() - 0.5);
					setSuggestedHabitGoals(shuffled1.slice(0, 6));
					const shuffled2 = [...SUGGESTED_TODO_GOALS].sort(() => Math.random() - 0.5);
					setSuggestedTodoGoals(shuffled2.slice(0, 6));
				},
				getMaxHabits,
				getMaxTodos,
				canAddHabit,
				canAddTodo,
				enableChallenge,
			}}>
			{children}
		</GoalsContext.Provider>
	);
}

function isYesterday(dateStr: string) {
	const d = new Date(dateStr);
	const y = new Date();
	y.setDate(y.getDate() - 1);
	return d.toISOString().split('T')[0] === y.toISOString().split('T')[0];
}

export function useGoals() {
	const ctx = useContext(GoalsContext);
	if (!ctx) throw new Error('useGoals must be used within GoalsProvider');
	return ctx;
}
