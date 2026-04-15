import { Text, View } from '@/components/Themed';
import { useGoals, type TodoGoal } from '@/context/GoalsProvider';
import { useSurvey } from '@/context/SurveyProvider';
import Checkbox from 'expo-checkbox';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface TodoChecklistFillState {
	checked: Record<string, boolean>;
}

export type TodoChecklistFillSetState = React.Dispatch<React.SetStateAction<TodoChecklistFillState>>;

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateKey = (value: number | string | Date) => {
	const date = value instanceof Date ? value : new Date(value);
	return date.toISOString().split('T')[0];
};

const toStartOfDayMs = (dateKey: string) => new Date(`${dateKey}T00:00:00`).getTime();

const getTodoLockReason = (todo: TodoGoal, today: string) => {
	if ((todo.subGoals ?? []).some(subGoal => !subGoal.completed)) {
		return 'Complete all sub-goals before finishing this to-do.';
	}

	const todayMs = toStartOfDayMs(today);
	const createdKey = toDateKey(todo.createdAt);
	const createdMs = toStartOfDayMs(createdKey);

	if (todo.dueDate) {
		const dueMs = toStartOfDayMs(todo.dueDate);
		if (Number.isNaN(dueMs)) return 'This to-do needs a valid due date before it can be completed.';
		const isSameDayGoal = todo.dueDate === createdKey;
		const eligibleAtMs = isSameDayGoal ? createdMs : Math.max(createdMs + DAY_MS, dueMs - DAY_MS * 3);
		if (todayMs < eligibleAtMs) {
			return `This to-do unlocks for completion on ${new Date(eligibleAtMs).toISOString().split('T')[0]}.`;
		}
		return null;
	}

	if (todayMs < createdMs + DAY_MS) {
		return `This to-do unlocks for completion on ${new Date(createdMs + DAY_MS).toISOString().split('T')[0]}.`;
	}

	return null;
};

export function useTodoChecklistFillSection(): SectionHookResult<TodoChecklistFillState> & {
	getCompletionSnapshot: () => { updatedTodos: TodoGoal[]; completedTodoIds: string[] };
} {
	const goals = useGoals();
	const survey = useSurvey();
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);
	const isRefill = survey.nightSurveyCompleted && survey.lastNightSurveyDate === today;
	const rewardedTodoIds = survey.getNightSnapshot?.()?.todoIds ?? [];

	const [state, setState] = useState<TodoChecklistFillState>({ checked: {} });

	useEffect(() => {
		const seed: Record<string, boolean> = {};
		(goals.todos ?? []).forEach(todo => {
			seed[todo.id] = todo.completedDate === today;
		});
		setState(prev => ({
			...prev,
			checked: Object.keys(prev.checked).length === 0 ? seed : { ...seed, ...prev.checked },
		}));
	}, [goals.todos, today]);

	const getCompletionSnapshot = useCallback(() => {
		const updatedTodos = (goals.todos ?? []).map(todo => {
			if (!state.checked[todo.id]) return todo;
			if (getTodoLockReason(todo, today)) return todo;
			if (todo.completedDate === today) return todo;
			return { ...todo, completedDate: today, failed: false, failedDate: null, challengeStatus: todo.isChallenge ? 'completed' : todo.challengeStatus };
		});
		const completedTodoIds = (goals.todos ?? [])
			.filter(todo => state.checked[todo.id] && !getTodoLockReason(todo, today) && !(isRefill && rewardedTodoIds.includes(todo.id)))
			.map(todo => todo.id);
		return { updatedTodos, completedTodoIds };
	}, [goals.todos, isRefill, rewardedTodoIds, state.checked, today]);

	const render = useCallback(() => {
		const visibleTodos = (goals.todos ?? [])
			.filter(todo => todo.title && todo.title.trim())
			.filter(todo => !(isRefill && rewardedTodoIds.includes(todo.id)))
			.sort((a, b) => {
				if (!!a.isChallenge !== !!b.isChallenge) return a.isChallenge ? -1 : 1;
				if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
				if (a.dueDate && !b.dueDate) return -1;
				if (!a.dueDate && b.dueDate) return 1;
				return a.createdAt - b.createdAt;
			});

		return (
			<View>
				<Text style={sectionStyles.question}>To-Do Goals</Text>
				<Text style={{ marginBottom: 8 }}>Check off completed to-dos and sub-goals. Refill mode only shows to-dos that were not already rewarded.</Text>

				<ScrollView style={sectionStyles.goalsScrollView} nestedScrollEnabled>
					{visibleTodos.map(todo => {
						const isCompleted = !!state.checked[todo.id];
						const lockReason = getTodoLockReason(todo, today);
						const isLocked = !!lockReason;

						return (
							<View
								key={todo.id}
								style={[
									sectionStyles.todoItem,
									todo.importance === 'Important+' ? sectionStyles.todoImportantPlus : todo.importance === 'Important' ? sectionStyles.todoImportant : null,
									todo.isChallenge ? sectionStyles.challengeRow : null,
									isCompleted ? sectionStyles.todoCompleted : null,
									isLocked ? { opacity: 0.65 } : null,
								]}>
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
									<Text selectable={false} style={[sectionStyles.habitTitle, { textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
										{todo.title}
									</Text>
									<Checkbox
										value={isCompleted}
										onValueChange={value => {
											if (lockReason) {
												Alert.alert('To-Do Locked', lockReason);
												return;
											}
											setState(prev => ({ ...prev, checked: { ...prev.checked, [todo.id]: value } }));
										}}
									/>
								</View>

								<Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
									{[todo.category, todo.importance].filter(Boolean).join(' - ')}
									{todo.dueDate ? `${todo.category || todo.importance ? ' - ' : ''}Due ${todo.dueDate}` : ''}
								</Text>

								{todo.isChallenge ? (
									<Text style={{ fontSize: 12, color: '#1565C0', marginTop: 6 }}>
										Challenge reward: {todo.rewardCoins ?? 0} coins | {todo.rewardShards ?? 0} shards
									</Text>
								) : null}

								{lockReason ? <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{lockReason}</Text> : null}

								{todo.subGoals.length > 0 ? (
									<View style={{ marginTop: 8 }}>
										{todo.subGoals.map(subGoal => (
											<Pressable key={subGoal.id} style={sectionStyles.subGoalRow} onPress={() => goals.toggleSubGoal?.(todo.id, subGoal.id)}>
												<Text selectable={false} style={{ textDecorationLine: subGoal.completed ? 'line-through' : 'none' }}>
													{subGoal.completed ? '[x]' : '[ ]'} {subGoal.title}
												</Text>
											</Pressable>
										))}
									</View>
								) : null}
							</View>
						);
					})}

					{visibleTodos.length === 0 ? <Text style={{ color: '#6B7280' }}>No unrewarded to-dos remain for this refill.</Text> : null}
				</ScrollView>
			</View>
		);
	}, [goals, isRefill, rewardedTodoIds, state.checked]);

	return {
		section: {
			key: 'todoFill',
			label: 'To-Do Goals',
			isEnabled: true,
			isNextEnabled: true,
			enableNext: null,
			render,
		},
		state,
		setState,
		getCompletionSnapshot,
		saveState: () => ({ ...state }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({
				...prev,
				checked: data.checked ?? prev.checked,
			}));
		},
	};
}
