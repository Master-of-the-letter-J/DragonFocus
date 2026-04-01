import { useJournal } from '@/context/JournalProvider';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TableView() {
	const { getEntriesByDay } = useJournal();
	const [openDate, setOpenDate] = useState<string | null>(null);
	const dayEntries = getEntriesByDay();

	const activeDay = useMemo(() => dayEntries.find(day => day.date === openDate) ?? null, [dayEntries, openDate]);

	return (
		<View style={{ flex: 1 }}>
			<Text style={styles.header}>Logs - Table View</Text>

			<ScrollView horizontal>
				<View style={styles.table}>
					<View style={[styles.row, styles.headerRow]}>
						<Text style={[styles.cell, { minWidth: 110 }]}>Date</Text>
						<Text style={styles.cell}>Mood AM</Text>
						<Text style={styles.cell}>Mood PM</Text>
						<Text style={styles.cell}>Habit Plan</Text>
						<Text style={styles.cell}>Goals Done</Text>
						<Text style={styles.cell}>Goals Left</Text>
						<Text style={styles.cell}>To-Dos</Text>
						<Text style={styles.cell}>To-Do Fail</Text>
						<Text style={styles.cell}>Rewards</Text>
						<Text style={[styles.cell, { minWidth: 90 }]}>Details</Text>
					</View>

					{dayEntries.map(day => {
						const morning = day.morning;
						const evening = day.evening;
						const plannedGoals = morning?.goalsCompleted ?? 0;
						const completedGoals = evening?.goalsCompleted ?? 0;
						const todoCount = evening?.todoCount ?? morning?.todoCount ?? 0;
						const todoCompleted = evening?.todoCompleted ?? 0;
						const todoFailed = evening?.todoFailed ?? 0;
						const totalCoins = (morning?.rewards.coins ?? 0) + (evening?.rewards.coins ?? 0);
						const totalXp = (morning?.rewards.fireXp ?? morning?.rewards.xp ?? 0) + (evening?.rewards.fireXp ?? evening?.rewards.xp ?? 0);
						const totalShards = (morning?.rewards.shards ?? 0) + (evening?.rewards.shards ?? 0);

						return (
							<View key={day.date} style={styles.row}>
								<Text style={[styles.cell, { minWidth: 110 }]}>{day.date}</Text>
								<Text style={styles.cell}>{morning?.moodMorning || '-'}</Text>
								<Text style={styles.cell}>{evening?.moodEvening || '-'}</Text>
								<Text style={styles.cell}>{plannedGoals}</Text>
								<Text style={styles.cell}>{completedGoals}</Text>
								<Text style={styles.cell}>{Math.max(0, plannedGoals - completedGoals)}</Text>
								<Text style={styles.cell}>{todoCount}</Text>
								<Text style={styles.cell}>{todoFailed}</Text>
								<Text style={[styles.cell, { minWidth: 140 }]}>{`${totalCoins}c • ${totalShards}sh • ${totalXp}xp`}</Text>
								<Pressable style={styles.viewButton} onPress={() => setOpenDate(day.date)}>
									<Text style={styles.viewButtonText}>Open</Text>
								</Pressable>
							</View>
						);
					})}
				</View>
			</ScrollView>

			<Modal visible={!!activeDay} animationType="slide" transparent onRequestClose={() => setOpenDate(null)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Pressable onPress={() => setOpenDate(null)} style={styles.closeRow}>
							<Text style={styles.closeText}>Close</Text>
						</Pressable>
						{activeDay && (
							<>
								<Text style={styles.modalTitle}>{activeDay.date}</Text>
								<Text style={styles.modalSection}>Morning Prompt</Text>
								<Text style={styles.modalBody}>{activeDay.morning?.promptText || '-'}</Text>
								<Text style={styles.modalSection}>Evening Prompt</Text>
								<Text style={styles.modalBody}>{activeDay.evening?.promptText || '-'}</Text>
								<Text style={styles.modalSection}>Trivia</Text>
								<Text style={styles.modalBody}>{activeDay.evening?.triviaResult || activeDay.morning?.triviaResult || '-'}</Text>
								<Text style={styles.modalSection}>Morning Journal</Text>
								<Text style={styles.modalBody}>{activeDay.morning?.text || '-'}</Text>
								<Text style={styles.modalSection}>Evening Journal</Text>
								<Text style={styles.modalBody}>{activeDay.evening?.text || '-'}</Text>
							</>
						)}
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	header: { fontSize: 18, fontWeight: '800', padding: 12 },
	table: { padding: 8 },
	row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
	headerRow: { backgroundColor: '#F9FAFB' },
	cell: { minWidth: 80, paddingHorizontal: 8, fontSize: 12 },
	viewButton: { marginLeft: 8, backgroundColor: '#111827', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
	viewButtonText: { color: '#fff', fontWeight: '700' },
	modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
	modalCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, maxHeight: '80%' },
	closeRow: { alignSelf: 'flex-end', marginBottom: 8 },
	closeText: { color: '#2563EB', fontWeight: '700' },
	modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
	modalSection: { fontSize: 14, fontWeight: '800', marginTop: 10, color: '#111827' },
	modalBody: { fontSize: 13, lineHeight: 20, color: '#4B5563', marginTop: 4 },
});
