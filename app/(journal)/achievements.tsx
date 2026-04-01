import { useAchievements } from '@/context/AchievementsProvider';
import { useJournal } from '@/context/JournalProvider';
import { useTheme } from '@/context/ThemeProvider';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Achievements() {
	const theme = useTheme();
	const { achievements, unlockedCount, totalCount } = useAchievements();
	const { entries, getEntriesByDay } = useJournal();
	const dayEntries = getEntriesByDay();

	const totalCoinsEarned = entries.reduce((sum, entry) => sum + (entry.rewards.coins ?? 0), 0);
	const totalShardsEarned = entries.reduce((sum, entry) => sum + (entry.rewards.shards ?? 0), 0);
	const totalXpEarned = entries.reduce((sum, entry) => sum + (entry.rewards.fireXp ?? entry.rewards.xp ?? 0), 0);
	const totalFuryEarned = entries.reduce((sum, entry) => sum + Math.abs(entry.rewards.fury ?? 0), 0);
	const totalPromptsAnswered = entries.filter(entry => !!entry.promptText?.trim()).length;
	const totalTriviaAnswered = entries.filter(entry => !!entry.triviaResult?.trim()).length;
	const totalJournalEntriesWritten = entries.filter(entry => !!entry.text?.trim()).length;
	const habitsPlanned = dayEntries.reduce((sum, day) => sum + (day.morning?.goalsCompleted ?? 0), 0);
	const goalsCompleted = dayEntries.reduce((sum, day) => sum + (day.evening?.goalsCompleted ?? 0), 0);
	const goalsIncomplete = Math.max(0, habitsPlanned - goalsCompleted);
	const bestRewardDay = Math.max(
		0,
		...dayEntries.map(day => (day.morning?.rewards.coins ?? 0) + (day.evening?.rewards.coins ?? 0)),
	);

	const styles = StyleSheet.create({
		container: { flex: 1, backgroundColor: theme.colors.background },
		header: { fontSize: 20, fontWeight: '800', paddingHorizontal: 16, paddingTop: 16, color: theme.colors.text, textAlign: 'center' },
		subHeader: { fontSize: 13, color: theme.colors.text, opacity: 0.75, textAlign: 'center', marginTop: 4, marginBottom: 12 },
		statsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 12, marginBottom: 10 },
		statCard: { width: '47%', backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.colors.border },
		statLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.text, opacity: 0.75 },
		statValue: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginTop: 4 },
		grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 20 },
		achievementCard: { width: '25%', aspectRatio: 1, padding: 8 },
		card: { flex: 1, backgroundColor: theme.colors.card, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
		cardIncomplete: { opacity: 0.45 },
		icon: { fontSize: 30, marginBottom: 8 },
		name: { fontSize: 12, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
		description: { fontSize: 10, color: theme.colors.text, textAlign: 'center', marginTop: 6, opacity: 0.75 },
	});

	return (
		<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 16 }}>
			<Text style={styles.header}>Achievements & Statistics</Text>
			<Text style={styles.subHeader}>
				Unlocked {unlockedCount} of {totalCount}
			</Text>

			<View style={styles.statsWrap}>
				<StatCard label="Habit Goals Incomplete" value={goalsIncomplete} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Goals Completed" value={goalsCompleted} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Prompt Answers" value={totalPromptsAnswered} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Trivia Answers" value={totalTriviaAnswered} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Journal Entries" value={totalJournalEntriesWritten} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Coins Earned" value={totalCoinsEarned} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Shards Earned" value={totalShardsEarned} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Fire XP Earned" value={totalXpEarned} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Fury Changed" value={totalFuryEarned} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
				<StatCard label="Best Reward Day" value={bestRewardDay} cardStyle={styles.statCard} labelStyle={styles.statLabel} valueStyle={styles.statValue} />
			</View>

			<View style={styles.grid}>
				{achievements.map(achievement => {
					const unlocked = !!achievement.unlockedAt;
					return (
						<View key={achievement.id} style={styles.achievementCard}>
							<View style={[styles.card, !unlocked && styles.cardIncomplete]}>
								<Text style={styles.icon}>{achievement.emoji}</Text>
								<Text style={styles.name}>{achievement.title}</Text>
								<Text style={styles.description}>{achievement.description}</Text>
							</View>
						</View>
					);
				})}
			</View>
		</ScrollView>
	);
}

function StatCard({
	label,
	value,
	cardStyle,
	labelStyle,
	valueStyle,
}: {
	label: string;
	value: number;
	cardStyle: any;
	labelStyle: any;
	valueStyle: any;
}) {
	return (
		<View style={cardStyle}>
			<Text style={labelStyle}>{label}</Text>
			<Text style={valueStyle}>{Math.round(value)}</Text>
		</View>
	);
}
