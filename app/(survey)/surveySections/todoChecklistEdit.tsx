import { Text, View } from '@/components/Themed';
import { GOAL_TODO_ADVICE } from '@/data/advice-data';
import { TodoEditor } from '@/components/goalEditor';
import { useGoals, type TodoGoal } from '@/context/GoalsProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useQuestions } from '@/context/QuestionProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface TodoChecklistEditState {
	localTodos: TodoGoal[];
	editingTodo: TodoGoal | null;
}

export type TodoChecklistEditSetState = React.Dispatch<React.SetStateAction<TodoChecklistEditState>>;

export function useTodoChecklistEditSection(): SectionHookResult<TodoChecklistEditState> {
	const goals = useGoals();
	const premium = usePremium();
	const questions = useQuestions();
	const scarLevel = useScarLevel();

	const [state, setState] = useState<TodoChecklistEditState>({
		localTodos: [],
		editingTodo: null,
	});

	useEffect(() => {
		setState(prev => ({ ...prev, localTodos: goals.todos }));
	}, [goals.todos]);

	const todoLimit = useMemo(() => goals.getMaxTodos?.(scarLevel.currentScarLevel ?? 0, premium.isPremium ?? false) ?? Infinity, [goals, premium.isPremium, scarLevel.currentScarLevel]);
	const canAddMoreTodos = state.localTodos.length < todoLimit;
	const remainingRerolls = goals.getRemainingTodoRerolls?.(premium.isPremium ?? false) ?? 0;
	const canReroll = premium.isPremium || remainingRerolls > 0;

	const enabledTodoCategories = useMemo(
		() => new Set([...questions.questionSettings.todoGoals.suggestedCategories, ...questions.questionSettings.todoGoals.customCategories]),
		[questions.questionSettings.todoGoals.customCategories, questions.questionSettings.todoGoals.suggestedCategories],
	);

	const allowedAdviceTypes = useMemo(
		() =>
			Object.entries(questions.questionSettings.advice.types)
				.filter(([, enabled]) => enabled)
				.map(([key]) => key),
		[questions.questionSettings.advice.types],
	);

	const visibleSuggestedTodos = useMemo(() => goals.suggestedTodoGoals.filter(goal => enabledTodoCategories.size === 0 || enabledTodoCategories.has(goal.category)), [enabledTodoCategories, goals.suggestedTodoGoals]);

	const todoGoalTip = useMemo(() => {
		const pool = GOAL_TODO_ADVICE.filter(item => allowedAdviceTypes.includes(item.category));
		if (pool.length === 0) return null;
		return pool[(state.localTodos.length + new Date().getDate()) % pool.length].text;
	}, [allowedAdviceTypes, state.localTodos.length]);

	const cancelTodo = useCallback(
		(todoId: string) => {
			Alert.alert('Delete To-Do Goal', 'Warning: deleting this to-do removes its sub-goals, due date, and any pending challenge reward tied to it. Continue?', [
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Delete', style: 'destructive', onPress: () => goals.deleteTodo?.(todoId) },
			]);
		},
		[goals],
	);

	const renderTodoItem = useCallback(
		({ item, drag, isActive }: RenderItemParams<TodoGoal>) => {
			const todo = item;
			const isChallengeTodo = !!todo.isChallenge;

			return (
				<ScaleDecorator>
					<TouchableOpacity
						activeOpacity={0.95}
						disabled={isActive}
						style={[
							sectionStyles.todoItem,
							todo.importance === 'Important+' ? sectionStyles.todoImportantPlus : todo.importance === 'Important' ? sectionStyles.todoImportant : null,
							isChallengeTodo ? { backgroundColor: '#E8F4FF' } : null,
							isActive ? { transform: [{ scale: 1.02 }], elevation: 4 } : null,
						]}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<View style={{ flex: 1 }}>
								<Text selectable={false} style={sectionStyles.habitTitle}>
									{todo.title}
								</Text>
								<Text selectable={false} style={sectionStyles.habitMeta}>
									{[todo.category, todo.importance].filter(Boolean).join(' - ')}
									{todo.dueDate ? ` - due ${todo.dueDate}` : ''}
								</Text>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Pressable style={{ marginRight: 8 }} onPress={() => cancelTodo(todo.id)}>
									<Text style={{ fontSize: 12, fontWeight: '700', color: '#E53935' }}>Delete</Text>
								</Pressable>
								{!isChallengeTodo ? (
									<Pressable style={[sectionStyles.miniButton, sectionStyles.miniEditButton]} onPress={() => setState(prev => ({ ...prev, editingTodo: todo }))}>
										<Text selectable={false} style={sectionStyles.miniButtonText}>
											Edit
										</Text>
									</Pressable>
								) : null}
								<Pressable onLongPress={drag} delayLongPress={150} style={{ padding: 6, marginLeft: 8 }}>
									<Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280' }}>Move</Text>
								</Pressable>
							</View>
						</View>

						{isChallengeTodo ? (
							<Text style={{ fontSize: 12, color: '#1565C0', marginTop: 8 }}>
								Challenge active | reward {todo.rewardCoins ?? 0} coins | {todo.rewardShards ?? 0} shards
							</Text>
						) : null}

						{todo.subGoals.length > 0 ? (
							<View style={{ marginTop: 8 }}>
								{todo.subGoals.map(subGoal => (
									<View key={subGoal.id} style={sectionStyles.subGoalRow}>
										<Text selectable={false} style={{ textDecorationLine: subGoal.completed ? 'line-through' : 'none' }}>
											- {subGoal.title}
										</Text>
									</View>
								))}
							</View>
						) : null}
					</TouchableOpacity>
				</ScaleDecorator>
			);
		},
		[cancelTodo],
	);

	const render = useCallback(() => {
		return (
			<View>
				{state.editingTodo ? (
					<Modal visible={!!state.editingTodo} transparent={true} animationType="slide">
						<View style={sectionStyles.modalOverlay}>
							<TodoEditor todo={state.editingTodo} onClose={() => setState(prev => ({ ...prev, editingTodo: null }))} />
						</View>
					</Modal>
				) : null}

				<DraggableFlatList
					data={state.localTodos}
					onDragEnd={({ data }) => {
						setState(prev => ({ ...prev, localTodos: data }));
						goals.reorderTodos?.(data);
					}}
					nestedScrollEnabled={true}
					keyExtractor={item => item.id}
					renderItem={renderTodoItem}
					activationDistance={10}
					contentContainerStyle={sectionStyles.listContentContainer}
					ListHeaderComponent={
						<View>
							<Text style={sectionStyles.question}>To-Do Goals</Text>
							<Text style={{ marginBottom: 8 }}>Hold to drag and reorder your to-dos.</Text>
							{todoGoalTip ? <Text style={{ marginBottom: 10, color: '#4B5563' }}>Goal tip: {todoGoalTip}</Text> : null}
						</View>
					}
					ListFooterComponent={
						<View>
							<Text style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
								To-Do slots: {state.localTodos.length} / {premium.isPremium ? 'Unlimited' : todoLimit}
							</Text>
							<Pressable
								style={[sectionStyles.smallButton, !canAddMoreTodos ? sectionStyles.buttonDisabled : null]}
								onPress={() => (canAddMoreTodos ? goals.addTodo?.({ title: 'New To-Do' }) : null)}
								disabled={!canAddMoreTodos}>
								<Text selectable={false} style={sectionStyles.smallButtonText}>
									{canAddMoreTodos ? '+ Add To-Do' : 'Max To-Do Quota Reached - Unlock more with higher Scar Level or Premium'}
								</Text>
							</Pressable>

							{visibleSuggestedTodos.length > 0 ? (
								<>
									<Text style={[sectionStyles.label, { marginTop: 12, marginBottom: 8 }]}>Suggested To-Dos</Text>
									<ScrollView style={sectionStyles.suggestedScrollView} nestedScrollEnabled={true}>
										{visibleSuggestedTodos.map(suggestion => (
											<Pressable
												key={suggestion.title}
												style={sectionStyles.suggestedItem}
												onPress={() => {
													goals.addTodo?.({
														title: suggestion.title,
														category: suggestion.category,
														dueDate: suggestion.dueDate ? new Date(Date.now() + suggestion.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
													});
													goals.rerollSuggestedTodos?.(premium.isPremium);
												}}>
												<Text selectable={false}>
													+ {suggestion.title} - {suggestion.category}
												</Text>
											</Pressable>
										))}
									</ScrollView>
									<Text style={{ marginTop: 10, fontSize: 12, color: '#6B7280' }}>To-Do rerolls: {premium.isPremium ? 'Unlimited (Premium)' : `${remainingRerolls} / 3 remaining today`}</Text>
									<Pressable style={[sectionStyles.rerollButton, !canReroll && sectionStyles.buttonDisabled]} disabled={!canReroll} onPress={() => goals.rerollSuggestedTodos?.(premium.isPremium)}>
										<Text selectable={false} style={sectionStyles.rerollButtonText}>
											Re-Roll To-Do Suggestions
										</Text>
									</Pressable>
								</>
							) : (
								<Text style={{ marginTop: 12, fontSize: 12, color: '#6B7280' }}>No built-in to-do templates match your current category settings.</Text>
							)}
						</View>
					}
				/>
			</View>
		);
	}, [canAddMoreTodos, canReroll, goals, premium.isPremium, remainingRerolls, renderTodoItem, state.editingTodo, state.localTodos, todoGoalTip, visibleSuggestedTodos]);

	return {
		section: {
			key: 'todoEdit',
			label: 'To-Do Goals',
			isEnabled: true,
			isNextEnabled: true,
			enableNext: null,
			render,
		},
		state,
		setState,
		saveState: () => ({ ...state }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({
				...prev,
				localTodos: Array.isArray(data.localTodos) ? data.localTodos : prev.localTodos,
			}));
		},
	};
}
