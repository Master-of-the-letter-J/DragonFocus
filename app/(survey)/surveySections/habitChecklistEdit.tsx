import { Text, View } from '@/components/Themed';
import { GOAL_HABIT_ADVICE } from '@/constants/advice';
import { HabitEditor } from '@/components/goalEditor';
import { useGoals, type HabitGoal } from '@/context/GoalsProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useQuestions } from '@/context/QuestionProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

const CHALLENGE_OPTIONS = [
	{ days: 7, cost: 10, rewardCoins: 100, rewardShards: 10, costShards: 0 },
	{ days: 14, cost: 25, rewardCoins: 250, rewardShards: 25, costShards: 0 },
	{ days: 30, cost: 50, rewardCoins: 750, rewardShards: 60, costShards: 5 },
];

export interface HabitChecklistEditState {
	localHabits: HabitGoal[];
	editingHabit: HabitGoal | null;
	selectedChallengeDays: Record<string, number | null>;
}

export type HabitChecklistEditSetState = React.Dispatch<React.SetStateAction<HabitChecklistEditState>>;

export function useHabitChecklistEditSection(): SectionHookResult<HabitChecklistEditState> {
	const goals = useGoals();
	const premium = usePremium();
	const questions = useQuestions();
	const scarLevel = useScarLevel();

	const [state, setState] = useState<HabitChecklistEditState>({
		localHabits: [],
		editingHabit: null,
		selectedChallengeDays: {},
	});

	useEffect(() => {
		setState(prev => ({ ...prev, localHabits: goals.habits }));
	}, [goals.habits]);

	useEffect(() => {
		if ((goals.habits ?? []).length > 0) return;
		const defaults = ['Make Bed', 'Brush Teeth', 'Drink 8 Cups of Water', 'Meditate 10 Minutes', 'Exercise 30 Minutes', 'Sleep with Good Bedtime'];
		defaults.forEach(title => goals.addHabit?.({ title }));
	}, [goals]);

	const habitLimit = useMemo(() => goals.getMaxHabits?.(scarLevel.currentScarLevel ?? 0, premium.isPremium ?? false) ?? Infinity, [goals, premium.isPremium, scarLevel.currentScarLevel]);
	const canAddMoreHabits = state.localHabits.length < habitLimit;
	const remainingRerolls = goals.getRemainingHabitRerolls?.(premium.isPremium ?? false) ?? 0;
	const canReroll = premium.isPremium || remainingRerolls > 0;

	const enabledHabitCategories = useMemo(
		() => new Set([...questions.questionSettings.habitGoals.suggestedCategories, ...questions.questionSettings.habitGoals.customCategories]),
		[questions.questionSettings.habitGoals.customCategories, questions.questionSettings.habitGoals.suggestedCategories],
	);

	const allowedAdviceTypes = useMemo(
		() =>
			Object.entries(questions.questionSettings.advice.types)
				.filter(([, enabled]) => enabled)
				.map(([key]) => key),
		[questions.questionSettings.advice.types],
	);

	const visibleSuggestedHabits = useMemo(() => goals.suggestedHabitGoals.filter(goal => enabledHabitCategories.size === 0 || enabledHabitCategories.has(goal.category)), [enabledHabitCategories, goals.suggestedHabitGoals]);

	const habitGoalTip = useMemo(() => {
		const pool = GOAL_HABIT_ADVICE.filter(item => allowedAdviceTypes.includes(item.category));
		if (pool.length === 0) return null;
		return pool[(state.localHabits.length + new Date().getDate()) % pool.length].text;
	}, [allowedAdviceTypes, state.localHabits.length]);

	const enableChallenge = useCallback(
		(habit: HabitGoal, days: number) => {
			const result = goals.enableChallenge?.(habit.id, days);
			if (!result?.success) {
				Alert.alert('Unable to enable', result?.message || 'Not enough coins or shards.');
				return;
			}
			Alert.alert('Challenge enabled', `${days}-day challenge started.`);
		},
		[goals],
	);

	const cancelHabit = useCallback(
		(habitId: string) => {
			Alert.alert('Delete Habit Goal', 'Warning: deleting this habit removes its editor, challenge progress, and any pending reward tied to it. Continue?', [
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Delete', style: 'destructive', onPress: () => goals.deleteHabit?.(habitId) },
			]);
		},
		[goals],
	);

	const renderHabitItem = useCallback(
		({ item, drag, isActive }: RenderItemParams<HabitGoal>) => {
			const habit = item;
			const activeChallenge = !!habit.isChallenge;
			const currentProgress = habit.streak ?? 0;
			const required = habit.challengeLength ?? 0;

			return (
				<ScaleDecorator>
					<TouchableOpacity
						activeOpacity={0.95}
						disabled={isActive}
						style={[
							sectionStyles.habitRow,
							habit.importance === 'Important+' ? sectionStyles.habitImportantPlus : habit.importance === 'Important' ? sectionStyles.habitImportant : null,
							activeChallenge ? { backgroundColor: '#E8F4FF' } : null,
							isActive ? { transform: [{ scale: 1.02 }], elevation: 4 } : null,
						]}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<View style={{ flex: 1 }}>
								<Text selectable={false} style={sectionStyles.habitTitle}>
									{habit.title}
								</Text>
								<Text selectable={false} style={sectionStyles.habitMeta}>
									{[habit.category, habit.importance].filter(Boolean).join(' - ')} - Goal Streak {habit.streak ?? 0}
								</Text>
								{activeChallenge ? (
									<Text style={{ fontSize: 12, color: '#1976D2', marginTop: 6 }}>
										Challenge Streak {currentProgress}/{required}
									</Text>
								) : null}
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Pressable style={{ marginRight: 8 }} onPress={() => cancelHabit(habit.id)}>
									<Text style={{ fontSize: 12, fontWeight: '700', color: '#E53935' }}>Delete</Text>
								</Pressable>
								{!activeChallenge ? (
									<Pressable style={[sectionStyles.miniButton, sectionStyles.miniEditButton]} onPress={() => setState(prev => ({ ...prev, editingHabit: habit }))}>
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

						{!activeChallenge ? (
							<View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
								{CHALLENGE_OPTIONS.map(option => (
									<Pressable
										key={option.days}
										style={[sectionStyles.challengeButton, state.selectedChallengeDays[habit.id] === option.days ? sectionStyles.challengeSelected : null]}
										onPress={() =>
											setState(prev => ({
												...prev,
												selectedChallengeDays: {
													...prev.selectedChallengeDays,
													[habit.id]: prev.selectedChallengeDays[habit.id] === option.days ? null : option.days,
												},
											}))
										}>
										<Text style={{ fontWeight: '600' }}>{option.days}d</Text>
										<Text style={{ fontSize: 11, color: '#666' }}>
											{option.cost}c{option.costShards ? ` - ${option.costShards}sh` : ''}
										</Text>
									</Pressable>
								))}
								<Pressable
									style={[sectionStyles.smallButton, { marginLeft: 12 }]}
									onPress={() => {
										const days = state.selectedChallengeDays[habit.id];
										if (!days) {
											Alert.alert('Select length', 'Please choose a challenge length to enable.');
											return;
										}
										enableChallenge(habit, days);
									}}>
									<Text selectable={false} style={sectionStyles.smallButtonText}>
										Enable
									</Text>
								</Pressable>
							</View>
						) : (
							<View style={{ marginTop: 8 }}>
								<Text style={{ fontSize: 12, color: '#555' }}>Challenge active - rewards are granted on successful completion during the evening survey.</Text>
							</View>
						)}
					</TouchableOpacity>
				</ScaleDecorator>
			);
		},
		[cancelHabit, enableChallenge, state.selectedChallengeDays],
	);

	const render = useCallback(() => {
		return (
			<View>
				{state.editingHabit ? (
					<Modal visible={!!state.editingHabit} transparent={true} animationType="slide">
						<View style={sectionStyles.modalOverlay}>
							<HabitEditor habit={state.editingHabit} onClose={() => setState(prev => ({ ...prev, editingHabit: null }))} />
						</View>
					</Modal>
				) : null}

				<DraggableFlatList
					data={state.localHabits}
					onDragEnd={({ data }) => {
						setState(prev => ({ ...prev, localHabits: data }));
						goals.reorderHabits?.(data);
					}}
					nestedScrollEnabled={true}
					keyExtractor={item => item.id}
					renderItem={renderHabitItem}
					activationDistance={10}
					contentContainerStyle={sectionStyles.listContentContainer}
					ListHeaderComponent={
						<View>
							<Text style={sectionStyles.question}>Day / Habit Goals</Text>
							<Text style={{ marginBottom: 8 }}>Hold to drag and reorder your daily habits.</Text>
							{habitGoalTip ? <Text style={{ marginBottom: 10, color: '#4B5563' }}>Goal tip: {habitGoalTip}</Text> : null}
						</View>
					}
					ListFooterComponent={
						<View>
							<Pressable
								style={[sectionStyles.smallButton, !canAddMoreHabits ? sectionStyles.buttonDisabled : null]}
								onPress={() => (canAddMoreHabits ? goals.addHabit?.({ title: 'New Habit' }) : null)}
								disabled={!canAddMoreHabits}>
								<Text selectable={false} style={sectionStyles.smallButtonText}>
									{canAddMoreHabits ? '+ Add Habit' : 'Max Habit Quota Reached - Unlock more with higher Scar Level or Premium'}
								</Text>
							</Pressable>

							{visibleSuggestedHabits.length > 0 ? (
								<>
									<Text style={[sectionStyles.label, { marginTop: 16, marginBottom: 8 }]}>Suggested Habits</Text>
									<ScrollView style={sectionStyles.suggestedScrollView} nestedScrollEnabled={true}>
										{visibleSuggestedHabits.map(suggestion => (
											<Pressable
												key={suggestion.title}
												style={sectionStyles.suggestedItem}
												onPress={() => {
													const importance = suggestion.importance === 'Important+' ? 'Important+' : suggestion.importance === 'Important' ? 'Important' : 'Default';
													goals.addHabit?.({
														title: suggestion.title,
														daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
														category: suggestion.category,
														importance,
													});
													goals.rerollSuggestedHabits?.(premium.isPremium);
												}}>
												<Text selectable={false}>
													+ {suggestion.title} - {suggestion.category} - {suggestion.importance}
												</Text>
											</Pressable>
										))}
									</ScrollView>
									<Text style={{ marginTop: 10, fontSize: 12, color: '#6B7280' }}>Habit rerolls: {premium.isPremium ? 'Unlimited (Premium)' : `${remainingRerolls} / 3 remaining today`}</Text>
									<Pressable style={[sectionStyles.rerollButton, !canReroll && sectionStyles.buttonDisabled]} disabled={!canReroll} onPress={() => goals.rerollSuggestedHabits?.(premium.isPremium)}>
										<Text selectable={false} style={sectionStyles.rerollButtonText}>
											Re-Roll Habit Suggestions
										</Text>
									</Pressable>
								</>
							) : (
								<Text style={{ marginTop: 12, fontSize: 12, color: '#6B7280' }}>No built-in habit templates match your current category settings.</Text>
							)}
						</View>
					}
				/>
			</View>
		);
	}, [canAddMoreHabits, canReroll, goals, habitGoalTip, premium.isPremium, remainingRerolls, renderHabitItem, state.editingHabit, state.localHabits, visibleSuggestedHabits]);

	return {
		section: {
			key: 'habitEdit',
			label: 'Day Goals',
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
				localHabits: Array.isArray(data.localHabits) ? data.localHabits : prev.localHabits,
				selectedChallengeDays: data.selectedChallengeDays ?? prev.selectedChallengeDays,
			}));
		},
	};
}
