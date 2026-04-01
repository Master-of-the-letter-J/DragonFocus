import { Text, View } from '@/components/Themed';
import { useGoals, type HabitGoal } from '@/context/GoalsProvider';
import { useSurvey } from '@/context/SurveyProvider';
import Checkbox from 'expo-checkbox';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, TextInput } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface HabitChecklistFillState {
	checked: Record<string, boolean>;
	missedReasons: Record<string, string>;
}

export type HabitChecklistFillSetState = React.Dispatch<React.SetStateAction<HabitChecklistFillState>>;

const isYesterday = (dateStr: string) => {
	const d = new Date(dateStr);
	const y = new Date();
	y.setDate(y.getDate() - 1);
	return d.toISOString().split('T')[0] === y.toISOString().split('T')[0];
};

export function useHabitChecklistFillSection(): SectionHookResult<HabitChecklistFillState> & {
	getCompletionSnapshot: () => { updatedHabits: HabitGoal[]; completedHabitIds: string[] };
} {
	const goals = useGoals();
	const survey = useSurvey();
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);
	const isRefill = survey.nightSurveyCompleted && survey.lastNightSurveyDate === today;
	const rewardedHabitIds = survey.getNightSnapshot?.()?.habitIds ?? [];

	const [state, setState] = useState<HabitChecklistFillState>({
		checked: {},
		missedReasons: {},
	});

	useEffect(() => {
		const seed: Record<string, boolean> = {};
		(goals.habits ?? []).forEach(habit => {
			seed[habit.id] = habit.lastCompletedDate === today;
		});
		setState(prev => ({
			...prev,
			checked: Object.keys(prev.checked).length === 0 ? seed : { ...seed, ...prev.checked },
		}));
	}, [goals.habits, today]);

	const getCompletionSnapshot = useCallback(() => {
		const updatedHabits = (goals.habits ?? []).map(habit => {
			if (!state.checked[habit.id]) return habit;
			if (habit.lastCompletedDate === today) return habit;
			const newStreak = habit.lastCompletedDate && isYesterday(habit.lastCompletedDate) ? (habit.streak ?? 0) + 1 : 1;
			return { ...habit, lastCompletedDate: today, streak: newStreak };
		});
		const completedHabitIds = (goals.habits ?? []).filter(habit => state.checked[habit.id] && !(isRefill && rewardedHabitIds.includes(habit.id))).map(habit => habit.id);
		return { updatedHabits, completedHabitIds };
	}, [goals.habits, isRefill, rewardedHabitIds, state.checked, today]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>Day / Habit Goals</Text>
				<Text style={{ marginBottom: 8 }}>Check off completed goals today. Refill mode only allows new progress to count.</Text>

				<ScrollView style={sectionStyles.goalsScrollView} nestedScrollEnabled>
					{(goals.habits ?? [])
						.filter(habit => habit.title && habit.title.trim())
						.map(habit => {
							const isCompleted = !!state.checked[habit.id];
							const isLockedByRefill = isRefill && rewardedHabitIds.includes(habit.id);
							const missedStreak = habit.streak > 0 && habit.lastCompletedDate && habit.lastCompletedDate !== today && !isYesterday(habit.lastCompletedDate);

							return (
								<View key={habit.id}>
									<View
										style={[
											sectionStyles.habitRow,
											habit.isChallenge ? sectionStyles.challengeRow : null,
											isCompleted ? sectionStyles.habitCompleted : null,
											isLockedByRefill ? { opacity: 0.55 } : null,
											{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
										]}>
										<View style={{ flex: 1 }}>
											<Text selectable={false} style={[sectionStyles.habitTitle, habit.importance === 'Important+' ? sectionStyles.habitImportantPlus : habit.importance === 'Important' ? sectionStyles.habitImportant : null]}>
												{habit.title}
											</Text>
											<Text selectable={false} style={sectionStyles.habitMeta}>
												{[habit.category, habit.importance].filter(Boolean).join(' • ')} • Goal Streak {habit.streak ?? 0}
											</Text>
											{habit.isChallenge && habit.challengeLength && (
												<Text selectable={false} style={{ fontSize: 12, color: '#1565C0', marginTop: 6 }}>
													Challenge Streak {habit.streak ?? 0}/{habit.challengeLength} • Reward {habit.challengeLength === 7 ? '100 coins • 10 shards' : habit.challengeLength === 14 ? '250 coins • 25 shards' : '750 coins • 60 shards'}
												</Text>
											)}
											{isLockedByRefill && (
												<Text selectable={false} style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>
													Already rewarded earlier today. Refill mode keeps this goal locked.
												</Text>
											)}
										</View>

										<Checkbox disabled={isLockedByRefill} value={isCompleted} onValueChange={value => setState(prev => ({ ...prev, checked: { ...prev.checked, [habit.id]: value } }))} />
									</View>

									{missedStreak && !isCompleted && !isLockedByRefill && (
										<View style={{ marginTop: 6 }}>
											<Text selectable={false} style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
												Why did this streak break?
											</Text>
											<TextInput
												value={state.missedReasons[habit.id] || ''}
												onChangeText={text => setState(prev => ({ ...prev, missedReasons: { ...prev.missedReasons, [habit.id]: text } }))}
												placeholder="Brief note..."
												style={[sectionStyles.textInputArea, { minHeight: 60 }]}
												multiline
											/>
										</View>
									)}
								</View>
							);
						})}
				</ScrollView>
			</View>
		);
	}, [goals.habits, isRefill, rewardedHabitIds, state.checked, state.missedReasons, today]);

	return {
		section: {
			key: 'habitFill',
			label: 'Day Goals',
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
				missedReasons: data.missedReasons ?? prev.missedReasons,
			}));
		},
	};
}
