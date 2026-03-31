import { Text, View } from '@/components/Themed';
import { useGoals, type HabitGoal } from '@/context/GoalsProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Checkbox from 'expo-checkbox';
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
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);

	const [state, setState] = useState<HabitChecklistFillState>({
		checked: {},
		missedReasons: {},
	});

	useEffect(() => {
		const seed: Record<string, boolean> = {};
		(goals.habits ?? []).forEach(h => {
			seed[h.id] = h.lastCompletedDate === today;
		});
		setState(prev => ({
			...prev,
			checked: Object.keys(prev.checked).length === 0 ? seed : { ...seed, ...prev.checked },
		}));
	}, [goals.habits, today]);

	const getCompletionSnapshot = useCallback(() => {
		const updatedHabits = (goals.habits ?? []).map(h => {
			if (!state.checked[h.id]) return h;
			if (h.lastCompletedDate === today) return h;
			const newStreak = h.lastCompletedDate && isYesterday(h.lastCompletedDate) ? (h.streak ?? 0) + 1 : 1;
			return { ...h, lastCompletedDate: today, streak: newStreak };
		});
		const completedHabitIds = (goals.habits ?? []).filter(h => state.checked[h.id]).map(h => h.id);
		return { updatedHabits, completedHabitIds };
	}, [goals.habits, state.checked, today]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>Day / Habit Goals</Text>
				<Text style={{ marginBottom: 8 }}>Check off completed goals today. You can uncheck until you submit.</Text>

				<ScrollView style={sectionStyles.goalsScrollView} nestedScrollEnabled>
					{(goals.habits ?? [])
						.filter(h => h.title && h.title.trim())
						.map(h => {
							const isCompleted = !!state.checked[h.id];
							const missedStreak = h.streak > 0 && h.lastCompletedDate && h.lastCompletedDate !== today && !isYesterday(h.lastCompletedDate);

							return (
								<View key={h.id}>
									<View style={[sectionStyles.habitRow, h.isChallenge ? sectionStyles.challengeRow : null, isCompleted ? sectionStyles.habitCompleted : null, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
										<View style={{ flex: 1 }}>
											<Text
												selectable={false}
												style={[
													sectionStyles.habitTitle,
													h.importance === 'Important+' ? sectionStyles.habitImportantPlus : h.importance === 'Important' ? sectionStyles.habitImportant : null,
												]}>
												{h.title}
											</Text>
											<Text selectable={false} style={sectionStyles.habitMeta}>
												{h.category ? `${h.category}` : ''} • Streak: {h.streak ?? 0}
											</Text>

											{h.isChallenge && h.challengeLength && (
												<Text selectable={false} style={{ fontSize: 12, color: '#1565C0', marginTop: 6 }}>
													Challenge: {h.streak ?? 0}/{h.challengeLength} days • Reward:{' '}
													{h.challengeLength === 7 ? '100 coins • 10 shards' : h.challengeLength === 14 ? '250 coins • 25 shards' : '750 coins • 60 shards'}
												</Text>
											)}
										</View>

										<Checkbox value={isCompleted} onValueChange={v => setState(prev => ({ ...prev, checked: { ...prev.checked, [h.id]: v } }))} />
									</View>

									{missedStreak && !isCompleted && (
										<View style={{ marginTop: 6 }}>
											<Text selectable={false} style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
												Why didn't you complete this goal?
											</Text>
											<TextInput
												value={state.missedReasons[h.id] || ''}
												onChangeText={t => setState(prev => ({ ...prev, missedReasons: { ...prev.missedReasons, [h.id]: t } }))}
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
	}, [goals.habits, state.checked, state.missedReasons, today]);

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


