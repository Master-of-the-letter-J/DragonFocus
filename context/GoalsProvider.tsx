import { SUGGESTED_HABIT_GOALS, SUGGESTED_TODO_GOALS } from '@/constants/suggestgoals';
import React, { createContext, ReactNode, useContext, useState } from 'react';

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
	// which days the habit shows up (e.g. ['Mon','Tue'])
	daysOfWeek?: string[];
	timesPerWeek?: number;
	streak: number;
	lastCompletedDate?: string | null;
	isChallenge?: boolean;
	challengeLength?: number;
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
	subGoals: SubGoal[];
	dueDate?: string | null;
	completedDate?: string | null;
	failed?: boolean;
	failedDate?: string | null;
	createdAt: number;
}

interface GoalsContextType {
	habits: HabitGoal[];
	todos: TodoGoal[];
	addHabit: (h: Partial<HabitGoal>) => HabitGoal;
	editHabit: (id: string, patch: Partial<HabitGoal>) => void;
	deleteHabit: (id: string) => void;
	completeHabitToday: (id: string) => void;
	addTodo: (t: Partial<TodoGoal>) => TodoGoal;
	editTodo: (id: string, patch: Partial<TodoGoal>) => void;
	deleteTodo: (id: string) => void;
	addSubGoal: (todoId: string, title: string) => void;
	toggleSubGoal: (todoId: string, subId: string) => void;
	completeTodo: (id: string) => boolean;
	failTodo: (id: string, fail: boolean) => void;
	suggestedHabitGoals: string[];
	suggestedTodoGoals: { title: string; coins: number }[];
	rerollSuggestedHabits: () => void;
	rerollSuggestedTodos: () => void;
	goalTemplates: string[];
	createGoalFromTemplate: (template: string, type: 'habit' | 'todo') => void;
	resetGoals?: () => void;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const PRESET_HABITS: HabitGoal[] = [
	{ id: uid(), title: 'Make bed', importance: 'Default', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
	{ id: uid(), title: 'Drink water', importance: 'Important', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
	{ id: uid(), title: '10 minute meditation', importance: 'Important+', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], timesPerWeek: 7, streak: 0, createdAt: Date.now() },
];

const SUGGESTED = ['Read 10 pages', 'Run 1 mile', 'Practice instrument 30 min', 'Write 100 words', 'Cold shower', 'Stretch for 10 minutes', 'Do 20 push-ups', 'Meditate 15 minutes', 'Take a walk', 'Learn something new', 'Journal about your day', 'Drink 8 glasses of water', 'Tidy your space', 'Call a friend or family', 'Exercise for 30 minutes', 'Cook a healthy meal', 'Do yoga for 20 minutes', 'Take a cold bath', 'Study for 1 hour', 'Plan your day ahead'];

const GOAL_TEMPLATES = ['Run for (Time) minutes', 'Do (Amount) push-ups', 'Walk for (Time) minutes', 'Practice (Activity) for (Time) minutes', 'Read for (Time) minutes', 'Write (Amount) words', 'Stretch for (Time) minutes', 'Meditate for (Time) minutes', 'Drink (Amount) glasses of water', 'Do (Amount) squats'];

export function GoalsProvider({ children }: { children: ReactNode }) {
	const [habits, setHabits] = useState<HabitGoal[]>(PRESET_HABITS);
	const [todos, setTodos] = useState<TodoGoal[]>([]);
	const [suggestedHabitGoals, setSuggestedHabitGoals] = useState<string[]>(() => {
		const shuffled = [...SUGGESTED_HABIT_GOALS].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 6).map(g => g.title);
	});
	const [suggestedTodoGoals, setSuggestedTodoGoals] = useState<{ title: string; coins: number }[]>(() => {
		const shuffled = [...SUGGESTED_TODO_GOALS].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 6).map(g => ({ title: g.title, coins: g.coins }));
	});

	const rerollSuggestedHabits = () => {
		const shuffled = [...SUGGESTED_HABIT_GOALS].sort(() => Math.random() - 0.5);
		setSuggestedHabitGoals(shuffled.slice(0, 6).map(g => g.title));
	};

	const rerollSuggestedTodos = () => {
		const shuffled = [...SUGGESTED_TODO_GOALS].sort(() => Math.random() - 0.5);
		setSuggestedTodoGoals(shuffled.slice(0, 6).map(g => ({ title: g.title, coins: g.coins })));
	};

	const addHabit = (h: Partial<HabitGoal>) => {
		const newHabit: HabitGoal = {
			id: uid(),
			title: h.title || 'New Habit',
			importance: h.importance || 'Default',
			numberFlair: h.numberFlair,
			timeFlair: h.timeFlair,
			category: h.category,
			daysOfWeek: h.daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			timesPerWeek: h.timesPerWeek || 7,
			streak: 0,
			lastCompletedDate: null,
			isChallenge: h.isChallenge || false,
			challengeLength: h.challengeLength,
			createdAt: Date.now(),
		};
		setHabits(prev => [newHabit, ...prev]);
		return newHabit;
	};

	const editHabit = (id: string, patch: Partial<HabitGoal>) => {
		setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...patch } : h)));
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
		const newTodo: TodoGoal = {
			id: uid(),
			title: t.title || 'New To-Do',
			importance: t.importance || 'Default',
			numberFlair: t.numberFlair,
			timeFlair: t.timeFlair,
			category: t.category,
			subGoals: t.subGoals || [],
			dueDate: t.dueDate || null,
			completedDate: null,
			failed: false,
			failedDate: null,
			createdAt: Date.now(),
		};
		setTodos(prev => [newTodo, ...prev]);
		return newTodo;
	};

	const editTodo = (id: string, patch: Partial<TodoGoal>) => {
		setTodos(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
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
		setTodos(prev => prev.map(t => (t.id === id ? { ...t, completedDate: new Date().toISOString().split('T')[0] } : t)));
		return true;
	};

	const failTodo = (id: string, fail: boolean) => {
		const date = fail ? new Date().toISOString().split('T')[0] : null;
		setTodos(prev => prev.map(t => (t.id === id ? { ...t, failed: fail, failedDate: date } : t)));
	};

	const createGoalFromTemplate = (template: string, type: 'habit' | 'todo') => {
		const title = template;
		if (type === 'habit') {
			addHabit({ title, daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
		} else {
			addTodo({ title });
		}
	};

	return (
		<GoalsContext.Provider
			value={{
				habits,
				todos,
				addHabit,
				editHabit,
				deleteHabit,
				completeHabitToday,
				addTodo,
				editTodo,
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
					setSuggestedHabitGoals(shuffled1.slice(0, 6).map(g => g.title));
					const shuffled2 = [...SUGGESTED_TODO_GOALS].sort(() => Math.random() - 0.5);
					setSuggestedTodoGoals(shuffled2.slice(0, 6).map(g => ({ title: g.title, coins: g.coins })));
				},
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
