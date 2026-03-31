import { Text, View } from '@/components/Themed';
import { HabitEditor } from '@/components/goalEditor';
import { useGoals, type HabitGoal } from '@/context/GoalsProvider';
import { usePremium } from '@/context/PremiumProvider';
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
		const defaults = ['Make Bed', 'Brush Teeth', 'Drink 8 Cups of Water', 'Meditate 10 Minutes', 'Exercise 30 minutes or more', 'Sleep with Good Bedtime'];
		defaults.forEach(title => goals.addHabit?.({ title }));
	}, [goals]);

	const habitLimit = useMemo(() => goals.getMaxHabits?.(scarLevel.currentScarLevel ?? 0, premium.isPremium ?? false) ?? Infinity, [goals, premium.isPremium, scarLevel.currentScarLevel]);
	const canAddMoreHabits = state.localHabits.length < habitLimit;

	const enableChallenge = useCallback(
		(habit: HabitGoal, days: number) => {
			const res = goals.enableChallenge?.(habit.id, days);
			if (!res?.success) {
				Alert.alert('Unable to enable', res?.message || 'Not enough coins or shards.');
				return;
			}
			Alert.alert('Challenge enabled', `${days}-day challenge started.`);
		},
		[goals],
	);

	const cancelHabit = useCallback(
		(habitId: string) => {
			Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Delete', style: 'destructive', onPress: () => goals.deleteHabit?.(habitId) },
			]);
		},
		[goals],
	);

	const renderHabitItem = useCallback(
		({ item, drag, isActive }: RenderItemParams<HabitGoal>) => {
			const h = item;
			const activeChallenge = !!h.isChallenge;
			const currentProgress = h.streak ?? 0;
			const required = h.challengeLength ?? 0;

			return (
				<ScaleDecorator>
					<TouchableOpacity
						activeOpacity={0.95}
						disabled={isActive}
						style={[
							sectionStyles.habitRow,
							h.importance === 'Important+' ? sectionStyles.habitImportantPlus : h.importance === 'Important' ? sectionStyles.habitImportant : null,
							activeChallenge ? { backgroundColor: '#e8f4ff' } : null,
							isActive && { transform: [{ scale: 1.02 }], elevation: 4 },
						]}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<View style={{ flex: 1 }}>
								<Text selectable={false} style={sectionStyles.habitTitle}>
									{h.title}
								</Text>
								<Text selectable={false} style={sectionStyles.habitMeta}>
									{h.category ? `${h.category}` : ''} • Streak: {h.streak ?? 0}
								</Text>
								{activeChallenge && (
									<Text style={{ fontSize: 12, color: '#1976d2', marginTop: 6 }}>
										Challenge: {currentProgress}/{required} days
									</Text>
								)}
							</View>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Pressable style={{ marginRight: 8 }} onPress={() => cancelHabit(h.id)}>
									<Text style={{ fontSize: 18, color: '#e53935' }}>X</Text>
								</Pressable>
								{!activeChallenge && (
									<Pressable style={[sectionStyles.miniButton, sectionStyles.miniEditButton]} onPress={() => setState(prev => ({ ...prev, editingHabit: h }))}>
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

						{!activeChallenge ? (
							<View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
								{CHALLENGE_OPTIONS.map(opt => (
									<Pressable
										key={opt.days}
										style={[sectionStyles.challengeButton, state.selectedChallengeDays[h.id] === opt.days ? sectionStyles.challengeSelected : null]}
										onPress={() =>
											setState(prev => ({
												...prev,
												selectedChallengeDays: {
													...prev.selectedChallengeDays,
													[h.id]: prev.selectedChallengeDays[h.id] === opt.days ? null : opt.days,
												},
											}))
										}>
										<Text style={{ fontWeight: '600' }}>{opt.days}d</Text>
										<Text style={{ fontSize: 11, color: '#666' }}>
											{opt.cost}c{opt.costShards ? ` • ${opt.costShards}sh` : ''}
										</Text>
									</Pressable>
								))}
								<Pressable
									style={[sectionStyles.smallButton, { marginLeft: 12 }]}
									onPress={() => {
										const days = state.selectedChallengeDays[h.id];
										if (!days) return Alert.alert('Select length', 'Please choose a challenge length to enable.');
										enableChallenge(h, days);
									}}>
									<Text selectable={false} style={sectionStyles.smallButtonText}>
										Enable
									</Text>
								</Pressable>
							</View>
						) : (
							<View style={{ marginTop: 8 }}>
								<Text style={{ fontSize: 12, color: '#555' }}>Challenge active — rewards will be granted on successful completion and applied in the evening survey.</Text>
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
				{state.editingHabit && (
					<Modal visible={!!state.editingHabit} transparent={true} animationType="slide">
						<View style={sectionStyles.modalOverlay}>
							<HabitEditor habit={state.editingHabit} onClose={() => setState(prev => ({ ...prev, editingHabit: null }))} />
						</View>
					</Modal>
				)}

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
						</View>
					}
					ListFooterComponent={
						<View>
							<Pressable
								style={[sectionStyles.smallButton, !canAddMoreHabits ? sectionStyles.buttonDisabled : null]}
								onPress={() => (canAddMoreHabits ? goals.addHabit?.({ title: 'New Habit' }) : null)}
								disabled={!canAddMoreHabits}>
								<Text selectable={false} style={sectionStyles.smallButtonText}>
									{canAddMoreHabits ? '+ Add Habit' : 'Max Habit Quota Reached — Unlock more with higher Scar Level or Premium'}
								</Text>
							</Pressable>
							{goals.suggestedHabitGoals.length > 0 && (
								<>
									<Text style={[sectionStyles.label, { marginTop: 16, marginBottom: 8 }]}>Suggested Habits</Text>
									<ScrollView style={sectionStyles.suggestedScrollView} nestedScrollEnabled={true}>
										{goals.suggestedHabitGoals.map(s => (
											<Pressable
												key={s.title}
												style={sectionStyles.suggestedItem}
												onPress={() => {
													const importance = s.importance === 'Important+' ? 'Important+' : s.importance === 'Important' ? 'Important' : 'Default';
													goals.addHabit?.({ title: s.title, daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], category: s.category, importance });
													goals.rerollSuggestedHabits?.();
												}}>
												<Text selectable={false}>
													+ {s.title} • {s.category} • {s.importance}
												</Text>
											</Pressable>
										))}
									</ScrollView>
									<Pressable style={sectionStyles.rerollButton} onPress={() => goals.rerollSuggestedHabits?.()}>
										<Text selectable={false} style={sectionStyles.rerollButtonText}>
											Re-Roll Habit Suggestions
										</Text>
									</Pressable>
								</>
							)}
						</View>
					}
				/>
			</View>
		);
	}, [canAddMoreHabits, goals, renderHabitItem, state.editingHabit, state.localHabits]);

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



