import { Text, View } from '@/components/Themed';
import { getTodoCompletionReward } from '@/data/goal-reward-utils';
import { getGoalCategories, getGoalRewardWarning, getImportanceMeta, getTodoCompletionLockReason, isGoalChallengeActive } from '@/data/goal-utils';
import { useGoals, type TodoGoal } from '@/context/GoalsProvider';
import { useQuestions } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import Checkbox from 'expo-checkbox';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { useSectionStyles } from './sectionStyles';

export interface TodoChecklistFillState {
	checked: Record<string, boolean>;
	subGoalChecked: Record<string, boolean>;
}

export type TodoChecklistFillSetState = React.Dispatch<React.SetStateAction<TodoChecklistFillState>>;

export function useTodoChecklistFillSection(): SectionHookResult<TodoChecklistFillState> & {
	getCompletionSnapshot: () => { updatedTodos: TodoGoal[]; completedTodoIds: string[] };
} {
	const goals = useGoals();
	const questions = useQuestions();
	const survey = useSurvey();
	const sectionStyles = useSectionStyles();
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);
	const isRefill = survey.nightSurveyCompleted && survey.lastNightSurveyDate === today;
	const rewardedTodoIds = survey.getRewardedGoals(today).todoIds ?? [];

	const [state, setState] = useState<TodoChecklistFillState>({ checked: {}, subGoalChecked: {} });

	useEffect(() => {
		const seed: Record<string, boolean> = {};
		const subGoalSeed: Record<string, boolean> = {};
		(goals.todos ?? []).forEach(todo => {
			seed[todo.id] = todo.completedDate === today;
			(todo.subGoals ?? []).forEach(subGoal => {
				subGoalSeed[subGoal.id] = subGoal.completed;
			});
		});
		setState(prev => ({
			...prev,
			checked: Object.keys(prev.checked).length === 0 ? seed : { ...seed, ...prev.checked },
			subGoalChecked: Object.keys(prev.subGoalChecked).length === 0 ? subGoalSeed : { ...subGoalSeed, ...prev.subGoalChecked },
		}));
	}, [goals.todos, today]);

	const getCompletionSnapshot = useCallback(() => {
		const completedAtMs = Date.now();
		const updatedTodos = (goals.todos ?? []).map(todo => {
			const updatedSubGoals = (todo.subGoals ?? []).map(subGoal => ({
				...subGoal,
				completed: state.subGoalChecked[subGoal.id] ?? subGoal.completed,
			}));
			const updatedTodo = {
				...todo,
				subGoals: updatedSubGoals,
			};
			if (!state.checked[todo.id]) return todo;
			if (getTodoCompletionLockReason(updatedTodo, today, completedAtMs)) return updatedTodo;
			if (todo.completedDate === today) return updatedTodo;
			return { ...updatedTodo, completedDate: today, failed: false, failedDate: null, challengeStatus: todo.isChallenge ? 'completed' : todo.challengeStatus };
		});
		const completedTodoIds = (goals.todos ?? [])
			.filter(todo => {
				const updatedTodo = {
					...todo,
					subGoals: (todo.subGoals ?? []).map(subGoal => ({
						...subGoal,
						completed: state.subGoalChecked[subGoal.id] ?? subGoal.completed,
					})),
				};
				return state.checked[todo.id] && !getTodoCompletionLockReason(updatedTodo, today, completedAtMs) && !(isRefill && rewardedTodoIds.includes(todo.id));
			})
			.map(todo => todo.id);
		return { updatedTodos, completedTodoIds };
	}, [goals.todos, isRefill, rewardedTodoIds, state.checked, state.subGoalChecked, today]);

	const render = useCallback(() => {
		const visibleTodos = (goals.todos ?? [])
			.filter(todo => todo.title && todo.title.trim())
			.sort((a, b) => {
				const aHasActiveChallenge = isGoalChallengeActive(a);
				const bHasActiveChallenge = isGoalChallengeActive(b);
				if (aHasActiveChallenge !== bHasActiveChallenge) return aHasActiveChallenge ? -1 : 1;
				if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
				if (a.dueDate && !b.dueDate) return -1;
				if (!a.dueDate && b.dueDate) return 1;
				return a.createdAt - b.createdAt;
			});

		return (
			<View>
				<Text style={sectionStyles.question}>To-Do Goals</Text>
				<Text style={[sectionStyles.bodyText, { marginBottom: 8 }]}>Check off completed to-dos and sub-goals. Refill mode only shows to-dos that were not already rewarded.</Text>

				<ScrollView style={sectionStyles.goalsScrollView} nestedScrollEnabled>
					{visibleTodos.map(todo => {
						const isCompleted = !!state.checked[todo.id];
						const isLockedByRefill = isRefill && rewardedTodoIds.includes(todo.id);
						const liveTodo = {
							...todo,
							subGoals: (todo.subGoals ?? []).map(subGoal => ({
								...subGoal,
								completed: state.subGoalChecked[subGoal.id] ?? subGoal.completed,
							})),
						};
						const lockReason = isLockedByRefill ? 'Already rewarded earlier today. Refill mode keeps this to-do locked.' : getTodoCompletionLockReason(liveTodo, today);
						const isLocked = !!lockReason;
						const hasActiveChallenge = isGoalChallengeActive(todo);
						const importanceMeta = getImportanceMeta(todo.importance);
						const categories = getGoalCategories(todo.categories, todo.category);
						const rewardWarning = getGoalRewardWarning(todo.createdAt);
						const normalReward = getTodoCompletionReward(todo);

						return (
							<View
								key={todo.id}
								style={[
									sectionStyles.todoItem,
									hasActiveChallenge ? sectionStyles.challengeRow : null,
									isCompleted ? sectionStyles.todoCompleted : null,
									isLocked ? { opacity: 0.65 } : null,
								]}>
								<View style={sectionStyles.goalMainRow}>
									<View style={sectionStyles.goalTextColumn}>
										<Text selectable={false} style={[sectionStyles.habitTitle, { textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
											{todo.title}
										</Text>
									</View>
									<Checkbox
										value={isCompleted}
										onValueChange={value => {
											if (lockReason) {
												Alert.alert('To-Do Locked', lockReason);
												return;
											}
											if (value && rewardWarning && !hasActiveChallenge) {
												Alert.alert('No normal reward yet', rewardWarning);
											}
											setState(prev => ({ ...prev, checked: { ...prev.checked, [todo.id]: value } }));
										}}
									/>
								</View>

								<View style={sectionStyles.metaRow}>
									<View style={[sectionStyles.importanceChip, { borderColor: importanceMeta.color }]}>
										<Text selectable={false} style={[sectionStyles.importanceText, { color: importanceMeta.color }]}>{importanceMeta.shortLabel}</Text>
									</View>
									{categories.map(category => (
										<View key={`${todo.id}-${category}`} style={sectionStyles.categoryChip}>
											<Text selectable={false} style={sectionStyles.categoryChipText}>
												{category}
											</Text>
										</View>
									))}
								</View>

								<Text style={sectionStyles.habitMeta}>
									{todo.dueDate ? `Due ${todo.dueDate}` : 'No due date'} | Normal reward {normalReward.coins} coins
								</Text>

								{hasActiveChallenge ? (
									<Text style={sectionStyles.infoText}>
										Challenge reward: {todo.rewardCoins ?? 0} coins | {todo.rewardShards ?? 0} shards
									</Text>
								) : null}

								{rewardWarning && !hasActiveChallenge ? <Text style={sectionStyles.warningText}>{rewardWarning}</Text> : null}
								{lockReason ? <Text style={sectionStyles.lockedText}>{lockReason}</Text> : null}

								{todo.subGoals.length > 0 ? (
									<View style={{ marginTop: 5 }}>
										{todo.subGoals.map(subGoal => (
											<Pressable
												key={subGoal.id}
												style={[sectionStyles.subGoalRow, isLockedByRefill ? { opacity: 0.65 } : null]}
												disabled={isLockedByRefill}
												onPress={() =>
													setState(prev => ({
														...prev,
														subGoalChecked: {
															...prev.subGoalChecked,
															[subGoal.id]: !(prev.subGoalChecked[subGoal.id] ?? subGoal.completed),
														},
													}))
												}>
												<Checkbox disabled={isLockedByRefill} value={state.subGoalChecked[subGoal.id] ?? subGoal.completed} />
												<Text selectable={false} style={[sectionStyles.bodyText, { flex: 1, marginLeft: 8, textDecorationLine: (state.subGoalChecked[subGoal.id] ?? subGoal.completed) ? 'line-through' : 'none' }]}>
													{subGoal.title}
												</Text>
											</Pressable>
										))}
									</View>
								) : null}
							</View>
						);
					})}

					{visibleTodos.length === 0 ? <Text style={sectionStyles.helperText}>No to-do goals are available right now.</Text> : null}
				</ScrollView>
			</View>
		);
	}, [goals.todos, isRefill, rewardedTodoIds, state.checked, state.subGoalChecked, today]);

	return {
		section: {
			key: 'todoFill',
			label: 'To-Do Goals',
			isEnabled: questions.questionSettings.todoGoals.enabled,
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
				subGoalChecked: data.subGoalChecked ?? prev.subGoalChecked,
			}));
		},
	};
}
