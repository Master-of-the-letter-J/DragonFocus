import { useJournal } from '@/context/JournalProvider';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TableView() {
	const { entries } = useJournal();
	const [open, setOpen] = useState<any>(null);

	return (
		<View style={{ flex: 1 }}>
			<Text style={styles.header}>📊 Logs — Table View</Text>

			<ScrollView horizontal>
				<View style={styles.table}>
					{/* Header */}
					<View style={[styles.row, styles.headerRow]}>
						<Text style={[styles.cell, { minWidth: 120 }]}>Date</Text>
						<Text style={styles.cell}>Mood 🌅</Text>
						<Text style={styles.cell}>Mood 🌙</Text>
						<Text style={styles.cell}>Day Comp</Text>
						<Text style={styles.cell}>Day Incomp</Text>
						<Text style={styles.cell}>% Day</Text>
						<Text style={styles.cell}># To‑Do</Text>
						<Text style={styles.cell}># To‑Do F.</Text>
						<Text style={styles.cell}># To‑Do Rem</Text>
						<Text style={[styles.cell, { minWidth: 160 }]}>Rewards</Text>
						<Text style={[styles.cell, { minWidth: 80 }]}>Journal Info</Text>
					</View>

					{entries.map(e => (
						<View key={e.id} style={styles.row}>
							<Text style={[styles.cell, { minWidth: 120 }]}>{e.date}</Text>
							<Text style={styles.cell}>{e.moodMorning || '—'}</Text>
							<Text style={styles.cell}>{e.moodEvening || '—'}</Text>
							<Text style={styles.cell}>{e.goalsCompleted || 0}</Text>
							<Text style={styles.cell}>{e.goalsIncomplete || 0}</Text>
							<Text style={styles.cell}>{e.schedulePercent ?? 0}%</Text>
							<Text style={styles.cell}>{e.todoCount ?? 0}</Text>
							<Text style={styles.cell}>{e.todoFailed ?? 0}</Text>
							<Text style={styles.cell}>{Math.max(0, (e.todoCount || 0) - (e.todoCompleted || 0) - (e.todoFailed || 0))}</Text>
							<Text style={[styles.cell, { minWidth: 160 }]}>{`💰 ${e.rewards?.coins || 0}, ✨ ${e.rewards?.xp || 0}, 🔥 ${e.rewards?.fury || 0}`}</Text>
							<Pressable style={styles.viewButton} onPress={() => setOpen(e)}>
								<Text>View Journal Info</Text>
							</Pressable>
						</View>
					))}
				</View>
			</ScrollView>

			<Modal visible={!!open} animationType="slide" transparent={false}>
				<View style={{ flex: 1, padding: 12 }}>
					<Pressable onPress={() => setOpen(null)} style={{ alignSelf: 'flex-end', padding: 8 }}>
						<Text style={{ fontSize: 18 }}>✕ Close</Text>
					</Pressable>
					{open && (
						<View>
							<Text style={{ fontSize: 20, fontWeight: '700' }}>{open.date} — Details</Text>
							<Text style={{ marginTop: 12, fontWeight: '700' }}>📝 Prompt & Response</Text>
							<Text style={{ marginTop: 6 }}>{open.promptText || '—'}</Text>

							<Text style={{ marginTop: 12, fontWeight: '700' }}>❓ Trivia</Text>
							<Text style={{ marginTop: 6 }}>{open.triviaQuestion || '—'}</Text>
							<Text style={{ marginTop: 6 }}>{open.triviaResult || '—'}</Text>

							<Text style={{ marginTop: 12, fontWeight: '700' }}>📓 Journal Entry</Text>
							<Text style={{ marginTop: 6 }}>{open.text || '—'}</Text>
						</View>
					)}
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	header: { fontSize: 18, fontWeight: '700', padding: 12 },
	table: { padding: 8 },
	row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
	headerRow: { backgroundColor: '#f7f7f7' },
	cell: { minWidth: 80, paddingHorizontal: 8 },
	viewButton: { padding: 6, backgroundColor: '#eee', borderRadius: 6, marginLeft: 8 },
});
