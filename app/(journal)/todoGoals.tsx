import { Text, View } from '@/components/Themed';
import { getTodoCompletionReward } from '@/data/goal-reward-utils';
import { isGoalChallengeActive } from '@/data/goal-utils';
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
import { useResultsSection, type SurveyResultsData } from '../(survey)/surveySections/results';
import { sectionStyles } from '../(survey)/surveySections/sectionStyles';
import { useTodoChecklistEditSection } from '../(survey)/surveySections/todoChecklistEdit';
import { useTodoChecklistFillSection } from '../(survey)/surveySections/todoChecklistFill';

export default function TodoGoalsPage() {
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

	const editSection = useTodoChecklistEditSection();
	const fillSection = useTodoChecklistFillSection();
	const resultsSection = useResultsSection({
		title: 'To-Do Goals Submitted',
		results,
		onFinish: () => setResults(null),
	});

	const handleSubmit = () => {
		const snapshot = fillSection.getCompletionSnapshot();
		const rewardedTodoIds = survey.getRewardedGoals(today).todoIds;
		const yangValue = fury.furyMeter ?? 0;
		const shardCount = shards.getShards();
		const scar = scarLevel.currentScarLevel;
		const snackMultiplier = itemEconomy.getActiveCoinMultiplier();
		const coinMultiplier = coins.calculateCoinMultiplier(yangValue, shardCount, scar, snackMultiplier, premium.isPremium);

		let totalCoinsEarned = 0;
		let totalShardsEarned = 0;
		let furyDelta = 0;

		const newlyRewardedTodoIds = snapshot.completedTodoIds.filter(id => !rewardedTodoIds.includes(id));
		newlyRewardedTodoIds.forEach(id => goals.completeTodo(id));

		const completedTodos = snapshot.updatedTodos.filter(todo => newlyRewardedTodoIds.includes(todo.id));
		completedTodos.forEach(todo => {
			const reward = getTodoCompletionReward(todo);
			if (reward.coins > 0) {
				const awardedCoins = Math.floor(reward.coins * coinMultiplier);
				totalCoinsEarned += awardedCoins;
				coins.addCoins(awardedCoins);
			}
			furyDelta += reward.fury;

			if (isGoalChallengeActive(todo) && (todo.rewardCoins ?? 0) > 0 && !!todo.completedDate && (!todo.dueDate || todo.completedDate <= todo.dueDate)) {
				totalCoinsEarned += todo.rewardCoins ?? 0;
				totalShardsEarned += todo.rewardShards ?? 0;
				coins.addCoins(todo.rewardCoins ?? 0);
				shards.addShards(todo.rewardShards ?? 0);
				goals.editTodo(todo.id, { challengeRewardClaimed: true, challengeStatus: 'completed' });
			}
		});

		if (furyDelta !== 0) {
			fury.addFury(furyDelta);
		}
		if (completedTodos.length > 0) {
			dragon.addHealthFromGoal(completedTodos.length * 2);
		}

		survey.recordGoalRewards(today, { habitIds: [], todoIds: newlyRewardedTodoIds });

		setResults({
			coinsEarned: totalCoinsEarned,
			shardsEarned: totalShardsEarned,
			xpEarned: 0,
			furyDelta,
			goalsCompleted: newlyRewardedTodoIds.length,
			groups: [
				{
					title: 'Completed To-Dos',
					entries: completedTodos.length > 0 ? completedTodos.map(todo => todo.title) : ['No new to-do completions were submitted'],
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
						<Text style={sectionStyles.buttonTextPrimary}>Submit To-Do Rewards</Text>
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
