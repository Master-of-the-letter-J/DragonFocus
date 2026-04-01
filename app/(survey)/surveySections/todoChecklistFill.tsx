import { Text, View } from '@/components/Themed';
import { useGoals, type TodoGoal } from '@/context/GoalsProvider';
import { useSurvey } from '@/context/SurveyProvider';
import Checkbox from 'expo-checkbox';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface TodoChecklistFillState {
	checked: Record<string, boolean>;
}

export type TodoChecklistFillSetState = React.Dispatch<React.SetStateAction<TodoChecklistFillState>>;

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
			if (todo.completedDate === today) return todo;
			return { ...todo, completedDate: today, failed: false, failedDate: null, challengeStatus: todo.isChallenge ? 'completed' : todo.challengeStatus };
		});
		const completedTodoIds = (goals.todos ?? []).filter(todo => state.checked[todo.id] && !(isRefill && rewardedTodoIds.includes(todo.id))).map(todo => todo.id);
		return { updatedTodos, completedTodoIds };
	}, [goals.todos, isRefill, rewardedTodoIds, state.checked, today]);

	const render = useCallback(() => {
		const visibleTodos = (goals.todos ?? []).filter(todo => todo.title && todo.title.trim()).filter(todo => !(isRefill && rewardedTodoIds.includes(todo.id)));

		return (
			<View>
				<Text style={sectionStyles.question}>To-Do Goals</Text>
				<Text style={{ marginBottom: 8 }}>Check off completed to-dos and sub-goals. Refill mode only shows to-dos that were not already rewarded.</Text>

				<ScrollView style={sectionStyles.goalsScrollView} nestedScrollEnabled>
					{visibleTodos.map(todo => {
						const isCompleted = !!state.checked[todo.id];

						return (
							<View key={todo.id} style={[sectionStyles.todoItem, isCompleted ? sectionStyles.todoCompleted : null]}>
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
									<Text selectable={false} style={[sectionStyles.habitTitle, { textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
										{todo.title}
									</Text>
									<Checkbox value={isCompleted} onValueChange={value => setState(prev => ({ ...prev, checked: { ...prev.checked, [todo.id]: value } }))} />
								</View>

								<Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
									{[todo.category, todo.importance].filter(Boolean).join(' - ')}
									{todo.dueDate ? `${todo.category || todo.importance ? ' - ' : ''}Due ${todo.dueDate}` : ''}
								</Text>

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
