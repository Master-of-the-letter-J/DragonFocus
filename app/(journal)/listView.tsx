import TopHeader from '@/components/TopHeader';
import { useJournal } from '@/context/JournalProvider';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ListView() {
	const { entries } = useJournal();

	return (
		<View style={{ flex: 1 }}>
			<TopHeader isHomePage={false} />
			<Text style={styles.header}>📚 Logs — List View</Text>
			<ScrollView contentContainerStyle={{ padding: 12 }}>
				{entries.map(e => (
					<LogCard key={e.id} entry={e} />
				))}
			</ScrollView>
		</View>
	);
}

function LogCard({ entry }: any) {
	const [open, setOpen] = useState(false);
	return (
		<View style={styles.card}>
			<Pressable onPress={() => setOpen(!open)}>
				<Text style={styles.title}>
					📅 {entry.date} — {entry.surveyType}
				</Text>
				<Text style={styles.meta}>
					🎯 {entry.goalsCompleted} • 💰 {entry.rewards?.coins || 0} • ✨ {entry.rewards?.xp || 0}
				</Text>
			</Pressable>

			{open && (
				<View style={styles.dropdown}>
					<Text>🌅 Mood Morning: {entry.moodMorning || '—'}</Text>
					<Text>🌙 Mood Evening: {entry.moodEvening || '—'}</Text>
					<Text style={{ marginTop: 8, fontWeight: '700' }}>📝 Prompt</Text>
					<Text>{entry.promptText || '—'}</Text>
					<Text style={{ marginTop: 8, fontWeight: '700' }}>❓ Trivia</Text>
					<Text>{entry.triviaQuestion || '—'}</Text>
					<Text style={{ marginTop: 8, fontWeight: '700' }}>📓 Journal</Text>
					<Text>{entry.text || '—'}</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	header: { fontSize: 18, fontWeight: '700', padding: 12 },
	card: { padding: 12, marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
	title: { fontWeight: '700' },
	meta: { marginTop: 6, color: '#666' },
	dropdown: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#f0f0f0' },
});
