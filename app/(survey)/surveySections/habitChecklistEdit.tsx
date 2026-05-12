import { Text, View } from '@/components/Themed';
import { GOAL_HABIT_ADVICE } from '@/data/advice-data';
import { GOAL_CHALLENGE_TIERS, getGoalCategories, getImportanceMeta, isGoalChallengeActive } from '@/data/goal-utils';
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
	const [showExtendedChallenges, setShowExtendedChallenges] = useState(false);

	useEffect(() => {
		setState(prev => ({ ...prev, localHabits: goals.habits }));
	}, [goals.habits]);

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
			const activeChallenge = isGoalChallengeActive(habit);
			const currentProgress = habit.streak ?? 0;
			const required = habit.challengeLength ?? 0;
			const importanceMeta = getImportanceMeta(habit.importance);
			const categories = getGoalCategories(habit.categories, habit.category);

			return (
				<ScaleDecorator>
					<TouchableOpacity
						activeOpacity={0.95}
						disabled={isActive}
						style={[
							sectionStyles.habitRow,
							activeChallenge ? { backgroundColor: '#E8F4FF' } : null,
							isActive ? { transform: [{ scale: 1.02 }], elevation: 4 } : null,
						]}>
						<View style={sectionStyles.goalMainRow}>
							<View style={sectionStyles.goalTextColumn}>
								<Text selectable={false} style={sectionStyles.habitTitle}>
									{habit.title}
								</Text>
								<View style={sectionStyles.metaRow}>
									<View style={[sectionStyles.importanceChip, { borderColor: importanceMeta.color }]}>
										<Text selectable={false} style={[sectionStyles.importanceText, { color: importanceMeta.color }]}>{importanceMeta.shortLabel}</Text>
									</View>
									{categories.map(category => (
										<View key={`${habit.id}-${category}`} style={sectionStyles.categoryChip}>
											<Text selectable={false} style={sectionStyles.categoryChipText}>
												{category}
											</Text>
										</View>
									))}
								</View>
								<Text selectable={false} style={sectionStyles.habitMeta}>
									Goal Streak {habit.streak ?? 0}
								</Text>
								{activeChallenge ? (
									<Text style={{ fontSize: 12, color: '#1976D2', marginTop: 6 }}>
										Challenge Streak {currentProgress}/{required}
									</Text>
								) : null}
							</View>
							<View style={sectionStyles.goalActionRow}>
								<Pressable onPress={() => cancelHabit(habit.id)}>
									<Text style={[sectionStyles.goalActionText, { color: '#E53935' }]}>Delete</Text>
								</Pressable>
								{!activeChallenge ? (
									<Pressable style={[sectionStyles.miniButton, sectionStyles.miniEditButton]} onPress={() => setState(prev => ({ ...prev, editingHabit: habit }))}>
										<Text selectable={false} style={sectionStyles.miniButtonText}>
											Edit
										</Text>
									</Pressable>
								) : null}
								<Pressable onLongPress={drag} delayLongPress={150} style={{ padding: 4 }}>
									<Text style={[sectionStyles.goalActionText, { color: '#6B7280' }]}>Move</Text>
								</Pressable>
							</View>
						</View>

						{!activeChallenge ? (
							<View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
								{GOAL_CHALLENGE_TIERS.filter(option => showExtendedChallenges || option.days <= 30).map(option => (
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
											🪙 {option.coinCost}{option.shardCost ? ` / 💎 ${option.shardCost}` : ''}
										</Text>
									</Pressable>
								))}
								<Pressable
									style={[sectionStyles.smallButton, { marginLeft: 4 }]}
									onPress={() => {
										const days = state.selectedChallengeDays[habit.id];
										if (!days) {
											Alert.alert('Select length', 'Please choose a challenge length to enable.');
											return;
										}
										enableChallenge(habit, days);
									}}>
									<Text selectable={false} style={sectionStyles.smallButtonText}>
										Add Challenge
									</Text>
								</Pressable>
								<Pressable style={[sectionStyles.smallButton, { marginLeft: 4 }]} onPress={() => setShowExtendedChallenges(prev => !prev)}>
									<Text selectable={false} style={sectionStyles.smallButtonText}>
										{showExtendedChallenges ? 'Hide 60/90/365' : 'See More Challenges'}
									</Text>
								</Pressable>
							</View>
						) : (
							<View style={{ marginTop: 8 }}>
								<Text style={{ fontSize: 12, color: '#555' }}>Challenge active. Rewards are granted after a successful submission in the night survey or lair.</Text>
							</View>
						)}
					</TouchableOpacity>
				</ScaleDecorator>
			);
		},
		[cancelHabit, enableChallenge, showExtendedChallenges, state.selectedChallengeDays],
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
							<Text style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
								Habit slots: {state.localHabits.length} / {premium.isPremium ? 'Unlimited' : habitLimit}
							</Text>
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
													goals.addHabit?.({
														title: suggestion.title,
														daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
														categories: [suggestion.category],
														category: suggestion.category,
														importance: suggestion.importance ?? 'default',
													});
													goals.rerollSuggestedHabits?.(premium.isPremium);
												}}>
												<Text selectable={false}>
													+ {suggestion.title} - {suggestion.category}
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
			isEnabled: questions.questionSettings.habitGoals.enabled,
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
