import { Text, View } from '@/components/Themed';
import { useGoals, type TodoGoal } from '@/context/GoalsProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Checkbox from 'expo-checkbox';
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
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);

	const [state, setState] = useState<TodoChecklistFillState>({ checked: {} });

	useEffect(() => {
		const seed: Record<string, boolean> = {};
		(goals.todos ?? []).forEach(t => {
			seed[t.id] = t.completedDate === today;
		});
		setState(prev => ({
			...prev,
			checked: Object.keys(prev.checked).length === 0 ? seed : { ...seed, ...prev.checked },
		}));
	}, [goals.todos, today]);

	const getCompletionSnapshot = useCallback(() => {
		const updatedTodos = (goals.todos ?? []).map(t => {
			if (!state.checked[t.id]) return t;
			if (t.completedDate === today) return t;
			return { ...t, completedDate: today, failed: false, failedDate: null, challengeStatus: t.isChallenge ? 'completed' : t.challengeStatus };
		});
		const completedTodoIds = (goals.todos ?? []).filter(t => state.checked[t.id]).map(t => t.id);
		return { updatedTodos, completedTodoIds };
	}, [goals.todos, state.checked, today]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>To-Do Goals</Text>
				<Text style={{ marginBottom: 8 }}>Check off completed to-dos and their sub-goals. You can uncheck until you submit.</Text>

				<ScrollView style={sectionStyles.goalsScrollView} nestedScrollEnabled>
					{(goals.todos ?? [])
						.filter(t => t.title && t.title.trim())
						.map(t => {
							const isCompleted = !!state.checked[t.id];
							const created = new Date(t.createdAt);
							const now = new Date();
							const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
							const canComplete = diffDays >= 1;

							return (
								<View key={t.id} style={[sectionStyles.todoItem, isCompleted ? sectionStyles.todoCompleted : null]}>
									<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
										<Text selectable={false} style={[sectionStyles.habitTitle, { textDecorationLine: isCompleted ? 'line-through' : 'none', opacity: canComplete ? 1 : 0.6 }]}>
											{t.title}
										</Text>
										<Checkbox disabled={!canComplete} value={isCompleted} onValueChange={v => setState(prev => ({ ...prev, checked: { ...prev.checked, [t.id]: v } }))} />
									</View>

									{(t.category || t.dueDate || t.importance) && (
										<Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
											{t.category ? `${t.category}` : ''}
											{t.category && t.dueDate ? ' • ' : ''}
											{t.dueDate ? `Due: ${t.dueDate}` : ''}
											{(t.category || t.dueDate) && t.importance ? ' • ' : ''}
											{t.importance ? `${t.importance}` : ''}
										</Text>
									)}

									{!canComplete && (
										<Text selectable={false} style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 4 }}>
											(Can complete after 1 day)
										</Text>
									)}

									{t.subGoals && t.subGoals.length > 0 && (
										<View style={{ marginTop: 8 }}>
											{t.subGoals.map(sg => (
												<Pressable key={sg.id} style={sectionStyles.subGoalRow} onPress={() => goals.toggleSubGoal?.(t.id, sg.id)}>
													<Text selectable={false} style={{ textDecorationLine: sg.completed ? 'line-through' : 'none' }}>
														{sg.completed ? '[x]' : '[ ]'} {sg.title}
													</Text>
												</Pressable>
											))}
										</View>
									)}
								</View>
							);
						})}
				</ScrollView>
			</View>
		);
	}, [goals, state.checked]);

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

