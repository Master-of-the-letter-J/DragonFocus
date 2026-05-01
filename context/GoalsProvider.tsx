import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import {
	DEFAULT_HABIT_GOAL_TEMPLATES,
	DEFAULT_TODO_GOAL_TEMPLATES,
	GOAL_WEEKDAY_OPTIONS,
	type GoalChallengeTier,
	type GoalImportance,
	getChallengeTierByDays,
	getGoalCategories,
	getHabitCompletionStreak,
	getGoalLengthDays,
	getTodoChallengeTier,
	isGoalChallengeActive,
} from '@/data/goal-utils';
import { SUGGESTED_HABIT_GOALS, type SuggestedHabitGoal } from '@/data/suggested-habit-goals-data';
import { SUGGESTED_TODO_GOALS, type SuggestedTodoGoal } from '@/data/suggested-todo-goals-data';
import React, { ReactNode, createContext, useContext } from 'react';
import { useDragonCoins } from './DragonCoinsProvider';
import { useShards } from './DragonShardsProvider';

function uid() {
	return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

const getTodayKey = () => new Date().toISOString().split('T')[0];

const buildDueDate = (dueInDays?: number) => {
	if (!dueInDays || dueInDays <= 0) return null;
	return new Date(Date.now() + dueInDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
};

const pickRandomSuggestions = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5).slice(0, 6);

export type Importance = GoalImportance;

export interface HabitGoal {
	id: string;
	title: string;
	importance: Importance;
	numberFlair?: number;
	timeFlair?: number;
	category?: string;
	categories?: string[];
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
	isChallenge?: boolean;
	challengeLength?: number;
	challengeStartDate?: string | null;
	challengeRewardClaimed?: boolean;
	rewardCoins?: number;
	rewardShards?: number;
	challengeStatus?: 'active' | 'completed' | 'failed';
	createdAt: number;
}

export interface TodoChallengeDetails extends GoalChallengeTier {
	goalLengthDays: number;
}

interface GoalStoreState {
	habits: HabitGoal[];
	todos: TodoGoal[];
	suggestedHabitGoals: SuggestedHabitGoal[];
	suggestedTodoGoals: SuggestedTodoGoal[];
	rerollTracker: {
		date: string;
		habit: number;
		todo: number;
	};
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
	rerollSuggestedHabits: (isPremium?: boolean) => void;
	rerollSuggestedTodos: (isPremium?: boolean) => void;
	getRemainingHabitRerolls: (isPremium: boolean) => number;
	getRemainingTodoRerolls: (isPremium: boolean) => number;
	goalTemplates: string[];
	createGoalFromTemplate: (template: string, type: 'habit' | 'todo') => void;
	resetGoals?: () => void;
	getMaxHabits: (scarLevel: number, isPremium: boolean) => number;
	getMaxTodos: (scarLevel: number, isPremium: boolean) => number;
	canAddHabit: (scarLevel: number, isPremium: boolean) => boolean;
	canAddTodo: (scarLevel: number, isPremium: boolean) => boolean;
	enableChallenge: (id: string, length: number) => { success: boolean; message?: string };
	getTodoChallengeDetails: (dueDate?: string | null, createdAt?: number) => TodoChallengeDetails | null;
	enableTodoChallenge: (id: string, draft?: Partial<TodoGoal>) => { success: boolean; message?: string; details?: TodoChallengeDetails };
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const GOAL_TEMPLATES = [
	'Run for (Time) minutes',
	'Do (Amount) push-ups',
	'Walk for (Time) minutes',
	'Practice (Activity) for (Time) minutes',
	'Read for (Time) minutes',
	'Write (Amount) words',
	'Stretch for (Time) minutes',
	'Meditate for (Time) minutes',
	'Drink (Amount) glasses of water',
	'Do (Amount) squats',
];

const buildDefaultHabits = (): HabitGoal[] =>
	DEFAULT_HABIT_GOAL_TEMPLATES.map(template => {
		const categories = getGoalCategories(template.categories);
		return {
			id: uid(),
			title: template.title,
			importance: template.importance,
			category: categories[0],
			categories,
			daysOfWeek: template.daysOfWeek ?? [...GOAL_WEEKDAY_OPTIONS],
			timesPerWeek: template.timesPerWeek ?? 7,
			streak: 0,
			createdAt: Date.now(),
		};
	});

const buildDefaultTodos = (): TodoGoal[] =>
	DEFAULT_TODO_GOAL_TEMPLATES.map(template => {
		const categories = getGoalCategories(template.categories);
		return {
			id: uid(),
			title: template.title,
			importance: template.importance,
			category: categories[0],
			categories,
			subGoals: (template.subGoals ?? []).map(title => ({ id: uid(), title, completed: false })),
			dueDate: buildDueDate(template.dueInDays),
			completedDate: null,
			failed: false,
			failedDate: null,
			createdAt: Date.now(),
		};
	});

const createInitialGoalStore = (): GoalStoreState => ({
	habits: buildDefaultHabits(),
	todos: buildDefaultTodos(),
	suggestedHabitGoals: pickRandomSuggestions(SUGGESTED_HABIT_GOALS),
	suggestedTodoGoals: pickRandomSuggestions(SUGGESTED_TODO_GOALS),
	rerollTracker: { date: getTodayKey(), habit: 0, todo: 0 },
});

const normalizeGoalStore = (storedState: GoalStoreState | null, initialState: GoalStoreState): GoalStoreState => {
	if (!storedState) return initialState;

	return {
		habits: Array.isArray(storedState.habits) ? storedState.habits : initialState.habits,
		todos: Array.isArray(storedState.todos) ? storedState.todos : initialState.todos,
		suggestedHabitGoals: Array.isArray(storedState.suggestedHabitGoals) && storedState.suggestedHabitGoals.length ? storedState.suggestedHabitGoals : initialState.suggestedHabitGoals,
		suggestedTodoGoals: Array.isArray(storedState.suggestedTodoGoals) && storedState.suggestedTodoGoals.length ? storedState.suggestedTodoGoals : initialState.suggestedTodoGoals,
		rerollTracker:
			storedState.rerollTracker && typeof storedState.rerollTracker.date === 'string'
				? storedState.rerollTracker
				: initialState.rerollTracker,
	};
};

export function GoalsProvider({ children }: { children: ReactNode }) {
	const coins = useDragonCoins();
	const shards = useShards();
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.goals, createInitialGoalStore, { normalize: normalizeGoalStore });

	const getFreshRerollTracker = () => {
		const today = getTodayKey();
		return state.rerollTracker.date === today ? state.rerollTracker : { date: today, habit: 0, todo: 0 };
	};

	const rerollSuggestedHabits = (isPremium = false) => {
		const fresh = getFreshRerollTracker();
		if (!isPremium && fresh.habit >= 3) return;

		setState(current => ({
			...current,
			suggestedHabitGoals: pickRandomSuggestions(SUGGESTED_HABIT_GOALS),
			rerollTracker: { ...fresh, habit: isPremium ? fresh.habit : fresh.habit + 1 },
		}));
	};

	const rerollSuggestedTodos = (isPremium = false) => {
		const fresh = getFreshRerollTracker();
		if (!isPremium && fresh.todo >= 3) return;

		setState(current => ({
			...current,
			suggestedTodoGoals: pickRandomSuggestions(SUGGESTED_TODO_GOALS),
			rerollTracker: { ...fresh, todo: isPremium ? fresh.todo : fresh.todo + 1 },
		}));
	};

	const getRemainingHabitRerolls = (isPremium: boolean) => {
		if (isPremium) return Infinity;
		const fresh = getFreshRerollTracker();
		return Math.max(0, 3 - fresh.habit);
	};

	const getRemainingTodoRerolls = (isPremium: boolean) => {
		if (isPremium) return Infinity;
		const fresh = getFreshRerollTracker();
		return Math.max(0, 3 - fresh.todo);
	};

	const getTodoChallengeDetails = (dueDate?: string | null, createdAt = Date.now()): TodoChallengeDetails | null => {
		if (!dueDate) return null;
		const goalLengthDays = getGoalLengthDays(createdAt, dueDate);
		if (!goalLengthDays) return null;
		const tier = getTodoChallengeTier(goalLengthDays);
		if (!tier) return null;
		return { ...tier, goalLengthDays };
	};

	const enableChallenge = (id: string, length: number) => {
		const habit = state.habits.find(item => item.id === id);
		if (!habit) return { success: false, message: 'Habit not found.' };
		if (isGoalChallengeActive(habit)) return { success: false, message: 'Challenge already active.' };

		const tier = getChallengeTierByDays(length);
		if (!tier) return { success: false, message: 'Invalid challenge length.' };
		if (tier.coinCost > 0 && !coins.spendCoins(tier.coinCost)) return { success: false, message: 'Not enough coins.' };
		if (tier.shardCost > 0 && !shards.spendShards(tier.shardCost)) {
			if (tier.coinCost > 0) coins.addCoins(tier.coinCost);
			return { success: false, message: 'Not enough shards.' };
		}

		const startDate = getTodayKey();
		setState(current => ({
			...current,
			habits: current.habits.map(item =>
				item.id === id
					? {
							...item,
							isChallenge: true,
							challengeLength: tier.days,
							challengeStartDate: startDate,
							challengeRewardClaimed: false,
							challengeStatus: 'active',
							challengeFailedDate: null,
						}
					: item,
			),
		}));
		return { success: true };
	};

	const enableTodoChallenge = (id: string, draft?: Partial<TodoGoal>) => {
		const existingTodo = state.todos.find(item => item.id === id);
		if (!existingTodo) return { success: false, message: 'To-do not found.' };
		const todo = { ...existingTodo, ...draft };
		if (isGoalChallengeActive(todo)) return { success: false, message: 'Challenge already active.' };

		const details = getTodoChallengeDetails(todo.dueDate, todo.createdAt);
		if (!details) return { success: false, message: 'Add a valid due date before enabling challenge mode.' };
		if (details.coinCost > 0 && !coins.spendCoins(details.coinCost)) return { success: false, message: 'Not enough coins.' };
		if (details.shardCost > 0 && !shards.spendShards(details.shardCost)) {
			if (details.coinCost > 0) coins.addCoins(details.coinCost);
			return { success: false, message: 'Not enough shards.' };
		}

		const startDate = getTodayKey();
		setState(current => ({
			...current,
			todos: current.todos.map(item =>
				item.id === id
					? (() => {
							const nextCategories = getGoalCategories(
								draft?.categories ?? item.categories,
								draft?.category !== undefined ? draft.category : item.category,
							);
							return {
								...item,
								...draft,
								categories: nextCategories,
								category: nextCategories[0],
								isChallenge: true,
								challengeLength: details.days,
								challengeStartDate: startDate,
								challengeRewardClaimed: false,
								rewardCoins: details.rewardCoins,
								rewardShards: details.rewardShards,
								challengeStatus: 'active',
							};
						})()
					: item,
			),
		}));

		return { success: true, details };
	};

	const addHabit = (habit: Partial<HabitGoal>) => {
		const createdAt = habit.createdAt ?? Date.now();
		const categories = getGoalCategories(habit.categories, habit.category);
		const newHabit: HabitGoal = {
			id: uid(),
			title: habit.title || 'New Habit',
			importance: habit.importance || 'default',
			numberFlair: habit.numberFlair,
			timeFlair: habit.timeFlair,
			category: categories[0],
			categories,
			daysOfWeek: habit.daysOfWeek || [...GOAL_WEEKDAY_OPTIONS],
			timesPerWeek: habit.timesPerWeek || 7,
			streak: habit.streak ?? 0,
			lastCompletedDate: habit.lastCompletedDate ?? null,
			isChallenge: habit.isChallenge || false,
			challengeLength: habit.challengeLength,
			challengeStartDate: habit.challengeStartDate || null,
			challengeRewardClaimed: habit.challengeRewardClaimed || false,
			challengeStatus: habit.challengeStatus || (habit.isChallenge ? 'active' : undefined),
			challengeFailedDate: habit.challengeFailedDate || null,
			createdAt,
		};

		setState(current => ({
			...current,
			habits: [newHabit, ...current.habits],
		}));
		return newHabit;
	};

	const editHabit = (id: string, patch: Partial<HabitGoal>) => {
		setState(current => ({
			...current,
			habits: current.habits.map(habit => {
				if (habit.id !== id) return habit;
				const nextCategories = getGoalCategories(
					patch.categories ?? habit.categories,
					patch.category !== undefined ? patch.category : habit.category,
				);
				return {
					...habit,
					...patch,
					categories: nextCategories,
					category: nextCategories[0],
				};
			}),
		}));
	};

	const reorderHabits = (orderedHabits: HabitGoal[]) => {
		setState(current => ({
			...current,
			habits: orderedHabits,
		}));
	};

	const deleteHabit = (id: string) => {
		setState(current => ({
			...current,
			habits: current.habits.filter(habit => habit.id !== id),
		}));
	};

	const completeHabitToday = (id: string) => {
		const today = getTodayKey();
		setState(current => ({
			...current,
			habits: current.habits.map(habit => {
				if (habit.id !== id) return habit;
				if (habit.lastCompletedDate === today) return habit;
				return {
					...habit,
					lastCompletedDate: today,
					streak: getHabitCompletionStreak(habit, today),
				};
			}),
		}));
	};

	const addTodo = (todo: Partial<TodoGoal>) => {
		const createdAt = todo.createdAt ?? Date.now();
		const categories = getGoalCategories(todo.categories, todo.category);
		const newTodo: TodoGoal = {
			id: uid(),
			title: todo.title || 'New To-Do',
			importance: todo.importance || 'default',
			numberFlair: todo.numberFlair,
			timeFlair: todo.timeFlair,
			category: categories[0],
			categories,
			subGoals: todo.subGoals || [],
			dueDate: todo.dueDate || null,
			completedDate: todo.completedDate || null,
			failed: todo.failed || false,
			failedDate: todo.failedDate || null,
			isChallenge: todo.isChallenge || false,
			challengeLength: todo.challengeLength,
			challengeStartDate: todo.challengeStartDate || null,
			challengeRewardClaimed: todo.challengeRewardClaimed || false,
			rewardCoins: todo.rewardCoins,
			rewardShards: todo.rewardShards,
			challengeStatus: todo.challengeStatus || (todo.isChallenge ? 'active' : undefined),
			createdAt,
		};

		setState(current => ({
			...current,
			todos: [newTodo, ...current.todos],
		}));
		return newTodo;
	};

	const editTodo = (id: string, patch: Partial<TodoGoal>) => {
		setState(current => ({
			...current,
			todos: current.todos.map(todo => {
				if (todo.id !== id) return todo;
				const nextCategories = getGoalCategories(
					patch.categories ?? todo.categories,
					patch.category !== undefined ? patch.category : todo.category,
				);
				return {
					...todo,
					...patch,
					categories: nextCategories,
					category: nextCategories[0],
				};
			}),
		}));
	};

	const reorderTodos = (orderedTodos: TodoGoal[]) => {
		setState(current => ({
			...current,
			todos: orderedTodos,
		}));
	};

	const deleteTodo = (id: string) => {
		setState(current => ({
			...current,
			todos: current.todos.filter(todo => todo.id !== id),
		}));
	};

	const addSubGoal = (todoId: string, title: string) => {
		const subGoal: SubGoal = { id: uid(), title, completed: false };
		setState(current => ({
			...current,
			todos: current.todos.map(todo => (todo.id === todoId ? { ...todo, subGoals: [...todo.subGoals, subGoal] } : todo)),
		}));
	};

	const toggleSubGoal = (todoId: string, subId: string) => {
		setState(current => ({
			...current,
			todos: current.todos.map(todo => {
				if (todo.id !== todoId) return todo;
				return { ...todo, subGoals: todo.subGoals.map(subGoal => (subGoal.id === subId ? { ...subGoal, completed: !subGoal.completed } : subGoal)) };
			}),
		}));
	};

	const completeTodo = (id: string) => {
		const todo = state.todos.find(item => item.id === id);
		if (!todo) return false;

		setState(current => ({
			...current,
			todos: current.todos.map(item =>
				item.id === id
					? {
							...item,
							completedDate: getTodayKey(),
							failed: false,
							failedDate: null,
							challengeStatus: item.isChallenge ? 'completed' : item.challengeStatus,
						}
					: item,
			),
		}));
		return true;
	};

	const failTodo = (id: string, fail: boolean) => {
		const date = fail ? getTodayKey() : null;
		setState(current => ({
			...current,
			todos: current.todos.map(todo =>
				todo.id === id
					? {
							...todo,
							failed: fail,
							failedDate: date,
							challengeStatus: fail && todo.isChallenge ? 'failed' : todo.challengeStatus,
						}
					: todo,
			),
		}));
	};

	const createGoalFromTemplate = (template: string, type: 'habit' | 'todo') => {
		if (type === 'habit') {
			addHabit({ title: template, daysOfWeek: [...GOAL_WEEKDAY_OPTIONS] });
			return;
		}

		addTodo({ title: template });
	};

	const getMaxHabits = (scarLevel: number, isPremium: boolean) => {
		if (isPremium) return Infinity;
		return 20 + Math.max(0, scarLevel) * 3;
	};

	const getMaxTodos = (scarLevel: number, isPremium: boolean) => {
		if (isPremium) return Infinity;
		return 40 + Math.max(0, scarLevel) * 6;
	};

	const canAddHabit = (scarLevel: number, isPremium: boolean) => state.habits.length < getMaxHabits(scarLevel, isPremium);
	const canAddTodo = (scarLevel: number, isPremium: boolean) => state.todos.length < getMaxTodos(scarLevel, isPremium);

	const resetGoals = () => {
		setState(createInitialGoalStore());
	};

	return (
		<GoalsContext.Provider
			value={{
				habits: state.habits,
				todos: state.todos,
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
				suggestedHabitGoals: state.suggestedHabitGoals,
				suggestedTodoGoals: state.suggestedTodoGoals,
				rerollSuggestedHabits,
				rerollSuggestedTodos,
				getRemainingHabitRerolls,
				getRemainingTodoRerolls,
				goalTemplates: GOAL_TEMPLATES,
				createGoalFromTemplate,
				resetGoals,
				getMaxHabits,
				getMaxTodos,
				canAddHabit,
				canAddTodo,
				enableChallenge,
				getTodoChallengeDetails,
				enableTodoChallenge,
			}}>
			{children}
		</GoalsContext.Provider>
	);
}

export function useGoals() {
	const context = useContext(GoalsContext);
	if (!context) throw new Error('useGoals must be used within GoalsProvider');
	return context;
}
