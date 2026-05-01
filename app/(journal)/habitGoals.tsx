import { Text, View } from '@/components/Themed';
import { getHabitCompletionReward } from '@/data/goal-reward-utils';
import { GOAL_CHALLENGE_TIERS, getHabitChallengeFailureDate, isGoalChallengeActive } from '@/data/goal-utils';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useHabitChecklistEditSection } from '../(survey)/surveySections/habitChecklistEdit';
import { useHabitChecklistFillSection } from '../(survey)/surveySections/habitChecklistFill';
import { useResultsSection, type SurveyResultsData } from '../(survey)/surveySections/results';
import { sectionStyles } from '../(survey)/surveySections/sectionStyles';

export default function HabitGoalsPage() {
	const [mode, setMode] = useState<'edit' | 'complete'>('edit');
	const [results, setResults] = useState<SurveyResultsData | null>(null);
	const goals = useGoals();
	const survey = useSurvey();
	const coins = useDragonCoins();
	const shards = useShards();
	const dragon = useDragon();
	const fury = useFury();
	const scarLevel = useScarLevel();
	const itemEconomy = useItemEconomy();
	const premium = usePremium();
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);

	const editSection = useHabitChecklistEditSection();
	const fillSection = useHabitChecklistFillSection();
	const resultsSection = useResultsSection({
		title: 'Habit Goals Submitted',
		results,
		onFinish: () => setResults(null),
	});

	const handleSubmit = () => {
		const snapshot = fillSection.getCompletionSnapshot();
		const rewardedHabitIds = survey.getRewardedGoals(today).habitIds;
		const yangValue = fury.furyMeter ?? 0;
		const shardCount = shards.getShards();
		const scar = scarLevel.currentScarLevel;
		const snackMultiplier = itemEconomy.getActiveCoinMultiplier();
		const coinMultiplier = coins.calculateCoinMultiplier(yangValue, shardCount, scar, snackMultiplier, premium.isPremium);

		let totalCoinsEarned = 0;
		let totalShardsEarned = 0;
		let furyDelta = 0;

		const newlyRewardedHabitIds = snapshot.completedHabitIds.filter(id => !rewardedHabitIds.includes(id));
		newlyRewardedHabitIds.forEach(id => goals.completeHabitToday(id));

		const completedHabits = snapshot.updatedHabits.filter(habit => newlyRewardedHabitIds.includes(habit.id));
		completedHabits.forEach(habit => {
			const reward = getHabitCompletionReward(habit);
			if (reward.coins > 0) {
				const awardedCoins = Math.floor(reward.coins * coinMultiplier);
				totalCoinsEarned += awardedCoins;
				coins.addCoins(awardedCoins);
			}
			furyDelta += reward.fury;

			if (isGoalChallengeActive(habit) && habit.challengeLength && (habit.streak ?? 0) >= habit.challengeLength) {
				const challengeTier = GOAL_CHALLENGE_TIERS.find(tier => tier.days === habit.challengeLength);
				if (challengeTier) {
					totalCoinsEarned += challengeTier.rewardCoins;
					totalShardsEarned += challengeTier.rewardShards;
					coins.addCoins(challengeTier.rewardCoins);
					shards.addShards(challengeTier.rewardShards);
					goals.editHabit(habit.id, { challengeRewardClaimed: true, challengeStatus: 'completed' });
				}
			}
		});

		goals.habits.forEach(habit => {
			const completedToday = snapshot.completedHabitIds.includes(habit.id);
			const failureDate = getHabitChallengeFailureDate(habit, today, completedToday);
			if (!failureDate) return;

			goals.editHabit(habit.id, {
				challengeStatus: 'failed',
				challengeFailedDate: failureDate,
			});
		});

		if (furyDelta !== 0) {
			fury.addFury(furyDelta);
		}
		if (completedHabits.length > 0) {
			dragon.addHealthFromGoal(completedHabits.length * 2);
		}

		survey.recordGoalRewards(today, { habitIds: newlyRewardedHabitIds, todoIds: [] });

		setResults({
			coinsEarned: totalCoinsEarned,
			shardsEarned: totalShardsEarned,
			xpEarned: 0,
			furyDelta,
			goalsCompleted: newlyRewardedHabitIds.length,
			groups: [
				{
					title: 'Completed Habits',
					entries: completedHabits.length > 0 ? completedHabits.map(habit => habit.title) : ['No new habit completions were submitted'],
				},
			],
		});
	};

	if (results) {
		return <View style={{ flex: 1 }}>{resultsSection.section.render()}</View>;
	}

	return (
		<View style={{ flex: 1 }}>
			<View style={styles.modeRow}>
				<ModeButton label="Edit" selected={mode === 'edit'} onPress={() => setMode('edit')} />
				<ModeButton label="Complete" selected={mode === 'complete'} onPress={() => setMode('complete')} />
			</View>

			{mode === 'edit' ? editSection.section.render() : fillSection.section.render()}

			{mode === 'complete' ? (
				<View style={styles.submitRow}>
					<Pressable style={sectionStyles.buttonNext} onPress={handleSubmit}>
						<Text style={sectionStyles.buttonTextPrimary}>Submit Habit Rewards</Text>
					</Pressable>
				</View>
			) : null}
		</View>
	);
}

function ModeButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
	return (
		<Pressable style={[styles.modeButton, selected ? styles.modeButtonActive : null]} onPress={onPress}>
			<Text style={[styles.modeButtonText, selected ? styles.modeButtonTextActive : null]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	modeRow: { flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 0 },
	modeButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff' },
	modeButtonActive: { borderColor: '#166534', backgroundColor: '#E8F5E9' },
	modeButtonText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
	modeButtonTextActive: { color: '#166534' },
	submitRow: { paddingHorizontal: 16, paddingBottom: 16 },
});
