import { Text, View } from '@/components/Themed';
import { TodoEditor } from '@/components/goalEditor';
import { useGoals, type TodoGoal } from '@/context/GoalsProvider';
import { usePremium } from '@/context/PremiumProvider';
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

	const cancelTodo = useCallback(
		(todoId: string) => {
			Alert.alert('Delete To-Do', 'Are you sure you want to delete this to-do?', [
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Delete', style: 'destructive', onPress: () => goals.deleteTodo?.(todoId) },
			]);
		},
		[goals],
	);

	const renderTodoItem = useCallback(
		({ item, drag, isActive }: RenderItemParams<TodoGoal>) => {
			const t = item;
			const isChallengeTodo = !!t.isChallenge;

			return (
				<ScaleDecorator>
					<TouchableOpacity
						activeOpacity={0.95}
						disabled={isActive}
						style={[sectionStyles.todoItem, isChallengeTodo ? { backgroundColor: '#e8f4ff' } : null, isActive && { transform: [{ scale: 1.02 }], elevation: 4 }]}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<View style={{ flex: 1 }}>
								<Text selectable={false} style={sectionStyles.habitTitle}>
									{t.title}
								</Text>
								<Text selectable={false} style={sectionStyles.habitMeta}>
									{t.importance} {t.category && `• ${t.category}`}
									{t.dueDate ? ` • due ${t.dueDate}` : ''}
								</Text>
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Pressable style={{ marginRight: 8 }} onPress={() => cancelTodo(t.id)}>
									<Text style={{ fontSize: 18, color: '#e53935' }}>X</Text>
								</Pressable>
								{!isChallengeTodo && (
									<Pressable style={[sectionStyles.miniButton, sectionStyles.miniEditButton]} onPress={() => setState(prev => ({ ...prev, editingTodo: t }))}>
										<Text selectable={false} style={sectionStyles.miniButtonText}>
											E
										</Text>
									</Pressable>
								)}
								<Pressable onLongPress={drag} delayLongPress={150} style={{ padding: 6, marginLeft: 8 }}>
									<Text style={{ fontSize: 20, color: '#ccc' }}>=</Text>
								</Pressable>
							</View>
						</View>
						{t.subGoals && t.subGoals.length > 0 && (
							<View style={{ marginTop: 8 }}>
								{t.subGoals.map(sg => (
									<View key={sg.id} style={sectionStyles.subGoalRow}>
										<Text selectable={false} style={{ textDecorationLine: sg.completed ? 'line-through' : 'none' }}>
											• {sg.title}
										</Text>
									</View>
								))}
							</View>
						)}
					</TouchableOpacity>
				</ScaleDecorator>
			);
		},
		[cancelTodo],
	);

	const render = useCallback(() => {
		return (
			<View>
				{state.editingTodo && (
					<Modal visible={!!state.editingTodo} transparent={true} animationType="slide">
						<View style={sectionStyles.modalOverlay}>
							<TodoEditor todo={state.editingTodo} onClose={() => setState(prev => ({ ...prev, editingTodo: null }))} />
						</View>
					</Modal>
				)}

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
						</View>
					}
					ListFooterComponent={
						<View>
							<Pressable
								style={[sectionStyles.smallButton, !canAddMoreTodos ? sectionStyles.buttonDisabled : null]}
								onPress={() => (canAddMoreTodos ? goals.addTodo?.({ title: 'New To-Do' }) : null)}
								disabled={!canAddMoreTodos}>
								<Text selectable={false} style={sectionStyles.smallButtonText}>
									{canAddMoreTodos ? '+ Add To-Do' : 'Max To-Do Quota Reached — Unlock more with higher Scar Level or Premium'}
								</Text>
							</Pressable>
							{goals.suggestedTodoGoals && goals.suggestedTodoGoals.length > 0 && (
								<>
									<Text style={[sectionStyles.label, { marginTop: 12, marginBottom: 8 }]}>Suggested To-Dos</Text>
									<ScrollView style={sectionStyles.suggestedScrollView} nestedScrollEnabled={true}>
										{goals.suggestedTodoGoals.map(s => (
											<Pressable
												key={s.title}
												style={sectionStyles.suggestedItem}
												onPress={() => {
													goals.addTodo?.({ title: s.title, category: s.category, dueDate: s.dueDate ? new Date(Date.now() + s.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null });
													goals.rerollSuggestedTodos?.();
												}}>
												<Text selectable={false}>
													+ {s.title} — Coins {s.coins}
													{s.shards ? ` • Shards ${s.shards}` : ''} • {s.category}
												</Text>
											</Pressable>
										))}
									</ScrollView>
									<Pressable style={sectionStyles.rerollButton} onPress={() => goals.rerollSuggestedTodos?.()}>
										<Text selectable={false} style={sectionStyles.rerollButtonText}>
											Re-Roll To-Do Suggestions
										</Text>
									</Pressable>
								</>
							)}
						</View>
					}
				/>
			</View>
		);
	}, [canAddMoreTodos, goals, renderTodoItem, state.editingTodo, state.localTodos]);

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


