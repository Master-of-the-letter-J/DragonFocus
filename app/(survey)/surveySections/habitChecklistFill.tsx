import { Text, View } from '@/components/Themed';
import { getHabitCompletionReward } from '@/data/goal-reward-utils';
import { GOAL_CHALLENGE_TIERS, getGoalRewardWarning, getHabitCompletionStreak, getImportanceMeta, getGoalCategories, isGoalChallengeActive, isHabitScheduledOnDate } from '@/data/goal-utils';
import { useGoals, type HabitGoal } from '@/context/GoalsProvider';
import { useQuestions } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import Checkbox from 'expo-checkbox';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, TextInput } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { useSectionStyles } from './sectionStyles';

export interface HabitChecklistFillState {
	checked: Record<string, boolean>;
	missedReasons: Record<string, string>;
}

export type HabitChecklistFillSetState = React.Dispatch<React.SetStateAction<HabitChecklistFillState>>;

export function useHabitChecklistFillSection(): SectionHookResult<HabitChecklistFillState> & {
	getCompletionSnapshot: () => { updatedHabits: HabitGoal[]; completedHabitIds: string[] };
} {
	const goals = useGoals();
	const questions = useQuestions();
	const survey = useSurvey();
	const sectionStyles = useSectionStyles();
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);
	const isRefill = survey.nightSurveyCompleted && survey.lastNightSurveyDate === today;
	const rewardedHabitIds = survey.getRewardedGoals(today).habitIds ?? [];

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
			return {
				...habit,
				lastCompletedDate: today,
				streak: getHabitCompletionStreak(habit, today),
			};
		});
		const completedHabitIds = (goals.habits ?? []).filter(habit => state.checked[habit.id] && !(isRefill && rewardedHabitIds.includes(habit.id))).map(habit => habit.id);
		return { updatedHabits, completedHabitIds };
	}, [goals.habits, isRefill, rewardedHabitIds, state.checked, today]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>Day / Habit Goals</Text>
				<Text style={[sectionStyles.bodyText, { marginBottom: 8 }]}>Check off completed goals today. Refill mode only allows new progress to count.</Text>

				<ScrollView style={sectionStyles.goalsScrollView} nestedScrollEnabled>
					{(goals.habits ?? [])
						.filter(habit => habit.title && habit.title.trim())
						.filter(habit => isHabitScheduledOnDate(habit.daysOfWeek, today))
						.sort((a, b) => {
							const aHasActiveChallenge = isGoalChallengeActive(a);
							const bHasActiveChallenge = isGoalChallengeActive(b);
							if (aHasActiveChallenge !== bHasActiveChallenge) return aHasActiveChallenge ? -1 : 1;
							return (b.streak ?? 0) - (a.streak ?? 0);
						})
						.map(habit => {
							const isCompleted = !!state.checked[habit.id];
							const isLockedByRefill = isRefill && rewardedHabitIds.includes(habit.id);
							const missedStreak = (habit.streak ?? 0) > 0 && !!habit.lastCompletedDate && habit.lastCompletedDate !== today && getHabitCompletionStreak(habit, today) === 1;
							const hasActiveChallenge = isGoalChallengeActive(habit);
							const importanceMeta = getImportanceMeta(habit.importance);
							const categories = getGoalCategories(habit.categories, habit.category);
							const rewardWarning = getGoalRewardWarning(habit.createdAt);
							const challengeTier = GOAL_CHALLENGE_TIERS.find(tier => tier.days === habit.challengeLength);
							const normalReward = getHabitCompletionReward(habit);

							return (
								<View key={habit.id}>
									<View
										style={[
											sectionStyles.habitRow,
											hasActiveChallenge ? sectionStyles.challengeRow : null,
											isCompleted ? sectionStyles.habitCompleted : null,
											isLockedByRefill ? { opacity: 0.55 } : null,
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
													Goal Streak {habit.streak ?? 0} | Normal reward {normalReward.coins} coins
												</Text>
												{hasActiveChallenge && habit.challengeLength && (
													<Text selectable={false} style={sectionStyles.infoText}>
														Challenge Streak {habit.streak ?? 0}/{habit.challengeLength}
														{challengeTier ? ` | Reward ${challengeTier.rewardCoins} coins | ${challengeTier.rewardShards} shards` : ''}
													</Text>
												)}
												{rewardWarning && !hasActiveChallenge ? <Text style={sectionStyles.warningText}>{rewardWarning}</Text> : null}
												{isLockedByRefill && (
													<Text selectable={false} style={sectionStyles.lockedText}>
														Already rewarded earlier today. Refill mode keeps this goal locked.
													</Text>
												)}
											</View>

											<Checkbox
												disabled={isLockedByRefill}
												value={isCompleted}
												onValueChange={value => {
													if (value && rewardWarning && !hasActiveChallenge) {
														Alert.alert('No normal reward yet', rewardWarning);
													}
													setState(prev => ({ ...prev, checked: { ...prev.checked, [habit.id]: value } }));
												}}
											/>
										</View>
									</View>

									{missedStreak && !isCompleted && !isLockedByRefill && (
										<View style={{ marginTop: 6 }}>
											<Text selectable={false} style={[sectionStyles.helperText, { marginBottom: 6 }]}>
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
			isEnabled: questions.questionSettings.habitGoals.enabled,
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
