import { useJournal } from '@/context/JournalProvider';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ListView() {
	const { getEntriesByDay } = useJournal();
	const dayEntries = getEntriesByDay();

	return (
		<View style={{ flex: 1 }}>
			<Text style={styles.header}>Logs - List View</Text>
			<ScrollView contentContainerStyle={{ padding: 12 }}>
				{dayEntries.map(day => (
					<LogCard key={day.date} day={day} />
				))}
			</ScrollView>
		</View>
	);
}

function LogCard({ day }: { day: any }) {
	const [open, setOpen] = useState(false);
	const morning = day.morning;
	const evening = day.evening;
	const totalCoins = (morning?.rewards.coins ?? 0) + (evening?.rewards.coins ?? 0);
	const totalShards = (morning?.rewards.shards ?? 0) + (evening?.rewards.shards ?? 0);
	const totalXp = (morning?.rewards.fireXp ?? morning?.rewards.xp ?? 0) + (evening?.rewards.fireXp ?? evening?.rewards.xp ?? 0);

	return (
		<View style={styles.card}>
			<Pressable onPress={() => setOpen(!open)}>
				<Text style={styles.title}>{day.date}</Text>
				<Text style={styles.meta}>Morning: {morning?.moodMorning || '-'} | Night: {evening?.moodEvening || '-'} | Rewards: {totalCoins}c / {totalShards}sh / {totalXp}xp</Text>
			</Pressable>

			{open && (
				<View style={styles.dropdown}>
					<Text style={styles.sectionTitle}>Goal Summary</Text>
					<Text>Habits planned: {morning?.goalsCompleted ?? 0}</Text>
					<Text>Goals completed: {evening?.goalsCompleted ?? 0}</Text>
					<Text>To-Dos: {evening?.todoCount ?? morning?.todoCount ?? 0}</Text>
					<Text>To-Dos failed: {evening?.todoFailed ?? 0}</Text>
					<Text>Habit plan: {(morning?.plannedHabitTitles ?? []).join(', ') || '-'}</Text>
					<Text>To-Do plan: {(morning?.plannedTodoTitles ?? []).join(', ') || '-'}</Text>
					<Text>Completed habits: {(evening?.completedHabitTitles ?? []).join(', ') || '-'}</Text>
					<Text>Remaining habits: {(evening?.remainingHabitTitles ?? []).join(', ') || '-'}</Text>
					<Text>Completed to-dos: {(evening?.completedTodoTitles ?? []).join(', ') || '-'}</Text>
					<Text>Pending to-dos: {(evening?.pendingTodoTitles ?? []).join(', ') || '-'}</Text>
					<Text>Late/failed to-dos: {(evening?.failedTodoTitles ?? []).join(', ') || '-'}</Text>

					<Text style={styles.sectionTitle}>Prompts & Trivia</Text>
					<Text>{morning?.promptText || '-'}</Text>
					<Text>{evening?.promptText || '-'}</Text>
					<Text>{evening?.triviaResult || morning?.triviaResult || '-'}</Text>

					<Text style={styles.sectionTitle}>Journal</Text>
					<Text>{morning?.text || '-'}</Text>
					<Text>{evening?.text || '-'}</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	header: { fontSize: 18, fontWeight: '800', padding: 12 },
	card: { padding: 12, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
	title: { fontWeight: '800', fontSize: 15, color: '#111827' },
	meta: { marginTop: 6, color: '#6B7280', lineHeight: 18 },
	dropdown: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#F3F4F6', gap: 4 },
	sectionTitle: { marginTop: 8, fontWeight: '800', color: '#111827' },
});
