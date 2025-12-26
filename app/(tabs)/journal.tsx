// screens/DragonLair.tsx
import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';

import { useDragonAlarm } from '@/context/DragonAlarmProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useGraveyard } from '@/context/GraveyardProvider';
import { useJournal } from '@/context/JournalProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useSurvey } from '@/context/SurveyProvider';

import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

type ViewMode = 'logs-table' | 'logs-list' | 'stats' | 'alarms' | 'achievements' | 'graveyard';

export default function DragonLair() {
	const { entries } = useJournal();
	const goals = useGoals();
	const survey = useSurvey();
	const scar = useScarLevel();
	const alarms = useDragonAlarm();
	const { graveyard } = useGraveyard();

	const [view, setView] = useState<ViewMode>('logs-table');

	// Editable header
	const [title, setTitle] = useState("Dragon's Lair");
	const [editingTitle, setEditingTitle] = useState(false);

	// Stats
	const totalEntries = entries.length;
	const totalGoalsCompleted = entries.reduce((s, e) => s + (e.goalsCompleted || 0), 0);

	const failedTodos = goals.todos.filter(t => t.failed);
	const completedTodos = goals.todos.filter(t => !!t.completedDate);
	const lateTodos = goals.todos.filter(t => t.completedDate && t.dueDate && t.completedDate > t.dueDate);

	const highestStreak = goals.habits.reduce((best, h) => (h.streak > (best.streak || 0) ? h : best), {} as any);

	// Helper
	const toISODate = (value?: string | null | number) => {
		if (!value) return null;
		if (typeof value === 'number') return new Date(value).toISOString().split('T')[0];
		return value.split('T')[0];
	};

	// Logs (Table)
	const renderTableItem = ({ item }: { item: any }) => (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>
				{item.date} • {item.surveyType}
			</Text>
			<Text style={styles.cardText}>
				Goals: {item.goalsCompleted} • Schedule: {item.schedulePercent}%
			</Text>
			<Text style={styles.cardText}>
				Rewards: {item.rewards.coins} coins • {item.rewards.xp} XP • Fury {item.rewards.fury}
			</Text>
		</View>
	);

	// Logs (List)
	const renderLogListItem = ({ item }: { item: any }) => {
		const dateStr = item.date;

		const todosForDay = goals.todos.filter(t => {
			const due = toISODate(t.dueDate);
			const comp = toISODate(t.completedDate);
			const fail = toISODate(t.failedDate);
			return due === dateStr || comp === dateStr || fail === dateStr;
		});

		const todoCompleted = todosForDay.filter(t => t.completedDate && !t.failed).length;
		const todoFailed = todosForDay.filter(t => t.failed).length;
		const todoTotal = todosForDay.length;
		const todoRemaining = Math.max(todoTotal - todoCompleted - todoFailed, 0);

		const [expanded, setExpanded] = useState(false);

		return (
			<View style={styles.card}>
				<Pressable onPress={() => setExpanded(!expanded)}>
					<Text style={styles.cardTitle}>
						{dateStr} • {item.surveyType}
					</Text>
					<Text style={styles.cardText}>
						🎯 Goals: {item.goalsCompleted} • 📅 {item.schedulePercent}%
					</Text>
					<Text style={styles.cardText}>
						📝 To‑Dos: {todoTotal} • ✔️ {todoCompleted} • ❌ {todoFailed} • ⏳ {todoRemaining}
					</Text>
					<Text style={styles.cardText}>
						💰 {item.rewards.coins} coins • ✨ {item.rewards.xp} XP • 🔥 {item.rewards.fury}
					</Text>
				</Pressable>

				{expanded && (
					<View style={styles.dropdown}>
						<Text style={styles.dropdownTitle}>🧾 Day Breakdown</Text>

						<Text style={styles.dropdownText}>🎯 Goals Completed: {item.goalsCompleted}</Text>
						<Text style={styles.dropdownText}>📅 Schedule Completion: {item.schedulePercent}%</Text>

						<Text style={styles.dropdownText}>📝 To‑Dos:</Text>
						{todosForDay.length === 0 && <Text style={styles.dropdownSubText}>• None</Text>}
						{todosForDay.map(t => (
							<Text key={t.id} style={styles.dropdownSubText}>
								• {t.title} {t.completedDate && !t.failed ? '✔️ Completed' : t.failed ? '❌ Failed' : '⏳ Pending'}
							</Text>
						))}

						<Text style={[styles.dropdownTitle, { marginTop: 8 }]}>🎁 Rewards</Text>
						<Text style={styles.dropdownText}>
							Coins: {item.rewards.coins} • XP: {item.rewards.xp} • Fury: {item.rewards.fury}
						</Text>

						{item.text && (
							<>
								<Text style={[styles.dropdownTitle, { marginTop: 8 }]}>📓 Journal Entry</Text>
								<Text style={styles.dropdownSubText}>{item.text}</Text>
							</>
						)}
					</View>
				)}
			</View>
		);
	};

	// Alarms
	const [showAlarmInput, setShowAlarmInput] = useState(false);
	const [newAlarmTime, setNewAlarmTime] = useState('');

	// Graveyard sorted newest first
	const sortedGraveyard = useMemo(() => {
		return [...graveyard].sort((a, b) => {
			const ad = new Date(a.date).getTime();
			const bd = new Date(b.date).getTime();
			return bd - ad;
		});
	}, [graveyard]);

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />

			{/* Editable Header */}
			<View style={styles.headerContainer}>
				{editingTitle ? (
					<TextInput value={title} onChangeText={setTitle} onBlur={() => setEditingTitle(false)} style={styles.headerInput} autoFocus />
				) : (
					<Pressable onPress={() => setEditingTitle(true)}>
						<Text style={styles.title}>{title}</Text>
					</Pressable>
				)}
			</View>

			{/* Segments */}
			<View style={styles.segmentRow}>
				<Pressable style={[styles.segmentButton, view === 'logs-table' && styles.segmentActive]} onPress={() => setView('logs-table')}>
					<Text>Logs (Table)</Text>
				</Pressable>

				<Pressable style={[styles.segmentButton, view === 'logs-list' && styles.segmentActive]} onPress={() => setView('logs-list')}>
					<Text>Logs (List)</Text>
				</Pressable>

				<Pressable style={[styles.segmentButton, view === 'stats' && styles.segmentActive]} onPress={() => setView('stats')}>
					<Text>Statistics</Text>
				</Pressable>
			</View>

			<View style={styles.segmentRow}>
				<Pressable style={[styles.segmentButton, view === 'alarms' && styles.segmentActive]} onPress={() => setView('alarms')}>
					<Text>Alarms</Text>
				</Pressable>

				<Pressable style={[styles.segmentButton, view === 'achievements' && styles.segmentActive]} onPress={() => setView('achievements')}>
					<Text>Achievements</Text>
				</Pressable>

				<Pressable style={[styles.segmentButton, view === 'graveyard' && styles.segmentActive]} onPress={() => setView('graveyard')}>
					<Text>Graveyard</Text>
				</Pressable>
			</View>

			{/* Logs (Table) */}
			{view === 'logs-table' && <FlatList data={entries} keyExtractor={i => i.id} renderItem={renderTableItem} />}

			{/* Logs (List) */}
			{view === 'logs-list' && <FlatList data={entries} keyExtractor={i => i.id} renderItem={renderLogListItem} />}

			{/* Statistics */}
			{view === 'stats' && (
				<ScrollView>
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Statistics</Text>
						<Text style={styles.cardText}>Total journal entries: {totalEntries}</Text>
						<Text style={styles.cardText}>Total goals completed: {totalGoalsCompleted}</Text>
						<Text style={styles.cardText}>Approx completion: {entries.length ? Math.round((totalGoalsCompleted / (entries.length * 3)) * 100) : 0}%</Text>
						<Text style={styles.cardText}>
							Highest streak: {highestStreak?.title || '—'} ({highestStreak?.streak || 0})
						</Text>
					</View>

					<View style={styles.card}>
						<Text style={styles.cardTitle}>Completed To‑Dos</Text>
						{completedTodos.length === 0 ? (
							<Text style={styles.cardText}>None</Text>
						) : (
							completedTodos.map(t => (
								<Text key={t.id} style={styles.cardText}>
									• {t.title} — {t.completedDate}
								</Text>
							))
						)}
					</View>

					<View style={styles.card}>
						<Text style={styles.cardTitle}>Late To‑Dos</Text>
						{lateTodos.length === 0 ? (
							<Text style={styles.cardText}>None</Text>
						) : (
							lateTodos.map(t => (
								<Text key={t.id} style={styles.cardText}>
									• {t.title} — Completed {t.completedDate}, Due {t.dueDate}
								</Text>
							))
						)}
					</View>

					<View style={styles.card}>
						<Text style={styles.cardTitle}>Failed To‑Dos</Text>
						{failedTodos.length === 0 ? (
							<Text style={styles.cardText}>None</Text>
						) : (
							failedTodos.map(t => (
								<Text key={t.id} style={styles.cardText}>
									• {t.title} — Failed {t.failedDate}
								</Text>
							))
						)}
					</View>
				</ScrollView>
			)}

			{/* Alarms */}
			{view === 'alarms' && (
				<ScrollView>
					<Text style={styles.sectionTitle}>Dragon Alarms</Text>

					{alarms.alarms.map(alarm => (
						<View key={alarm.id} style={styles.alarmRow}>
							<View style={{ flex: 1 }}>
								<Text style={{ fontWeight: '600', fontSize: 14 }}>{alarm.label || `Alarm - ${alarm.times.join(', ')}`}</Text>
								<Text style={{ fontSize: 12, color: '#666' }}>{alarm.times.join(', ')}</Text>
							</View>

							<Pressable style={[styles.alarmToggle, alarm.enabled && styles.alarmEnabled]} onPress={() => alarms.toggleAlarm(alarm.id, !alarm.enabled)}>
								<Text
									style={{
										fontSize: 12,
										fontWeight: '600',
										color: alarm.enabled ? '#4CAF50' : '#999',
									}}>
									{alarm.enabled ? '🔔' : '🔕'}
								</Text>
							</Pressable>

							<Pressable
								style={styles.alarmDelete}
								onPress={() => {
									Alert.alert('Delete Alarm', 'Remove this alarm?', [
										{ text: 'Cancel', style: 'cancel' },
										{
											text: 'Delete',
											style: 'destructive',
											onPress: () => alarms.removeAlarm(alarm.id),
										},
									]);
								}}>
								<Text style={{ fontSize: 14, color: '#f44336' }}>✕</Text>
							</Pressable>
						</View>
					))}

					{!showAlarmInput ? (
						<Pressable style={styles.addAlarmButton} onPress={() => setShowAlarmInput(true)}>
							<Text style={styles.addAlarmText}>+ Add Alarm</Text>
						</Pressable>
					) : (
						<View style={styles.alarmInputContainer}>
							<TextInput placeholder="HH:MM" value={newAlarmTime} onChangeText={setNewAlarmTime} style={styles.alarmInput} placeholderTextColor="#ccc" />
							<Pressable
								style={styles.alarmInputButton}
								onPress={() => {
									if (!newAlarmTime.trim()) return;
									alarms.addAlarm(newAlarmTime.trim());
									setNewAlarmTime('');
									setShowAlarmInput(false);
								}}>
								<Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
							</Pressable>
							<Pressable style={[styles.alarmInputButton, { backgroundColor: '#999' }]} onPress={() => setShowAlarmInput(false)}>
								<Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
							</Pressable>
						</View>
					)}
				</ScrollView>
			)}

			{/* Achievements */}
			{view === 'achievements' && (
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Achievements</Text>
					<Text style={styles.cardText}>Coming soon…</Text>
				</View>
			)}

			{/* Graveyard */}
			{view === 'graveyard' && (
				<ScrollView>
					<Text style={styles.sectionTitle}>Dragon Graveyard</Text>

					<View style={styles.graveyardContainer}>
						{sortedGraveyard.map(entry => (
							<View key={entry.id} style={styles.graveItem}>
								<Image source={require('@/assets/images/grave-placeholder.png')} style={styles.graveImage} />
								<View style={styles.graveOverlay}>
									<Text style={styles.graveName}>{entry.name}</Text>
									<Text style={styles.graveInfo}>Age: {entry.age}</Text>
									<Text style={styles.graveInfo}>Stage: {entry.stage}</Text>
									<Text style={styles.graveInfo}>Health: {entry.healthState}</Text>
									<Text style={styles.graveInfo}>Gen: {entry.generation}</Text>
									<Text style={styles.graveInfo}>Date: {entry.date}</Text>
									<Text style={styles.graveInfo}>Cause: {entry.cause}</Text>
								</View>
							</View>
						))}
					</View>
				</ScrollView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 12 },
	headerContainer: { alignItems: 'center', marginBottom: 4 },
	title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
	headerInput: {
		fontSize: 22,
		fontWeight: '700',
		borderBottomWidth: 1,
		paddingHorizontal: 4,
		paddingVertical: 2,
	},

	segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
	segmentButton: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		backgroundColor: '#eee',
		borderRadius: 8,
	},
	segmentActive: { backgroundColor: '#cce9d8' },

	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		marginBottom: 8,
	},

	card: {
		padding: 12,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#ddd',
		marginBottom: 10,
	},
	cardTitle: { fontWeight: '700' },
	cardText: { marginTop: 6, color: '#333' },

	dropdown: {
		marginTop: 10,
		padding: 10,
		backgroundColor: '#fff',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#eee',
	},
	dropdownTitle: { fontWeight: '700', marginBottom: 4 },
	dropdownText: { color: '#333', marginTop: 4 },
	dropdownSubText: { color: '#555', marginTop: 2 },

	// Alarms
	lockedSection: {
		padding: 12,
		backgroundColor: '#f5f5f5',
		borderRadius: 8,
		marginBottom: 12,
		borderLeftWidth: 4,
		borderLeftColor: '#ccc',
	},
	alarmRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		marginBottom: 8,
		gap: 8,
	},
	alarmToggle: {
		paddingHorizontal: 8,
		paddingVertical: 6,
		borderRadius: 6,
		backgroundColor: '#eee',
	},
	alarmEnabled: { backgroundColor: '#E8F5E9' },
	alarmDelete: { paddingHorizontal: 8, paddingVertical: 6 },
	addAlarmButton: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: '#4CAF50',
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 16,
	},
	addAlarmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
	alarmInputContainer: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 16 },
	alarmInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 14,
	},
	alarmInputButton: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: '#4CAF50',
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},

	// Graveyard
	graveyardContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-end', // newest on right
		gap: 12,
		marginTop: 10,
		marginBottom: 16,
	},
	graveItem: {
		width: 140,
		height: 160,
		position: 'relative',
	},
	graveImage: {
		width: '100%',
		height: '100%',
		borderRadius: 10,
	},
	graveOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		padding: 6,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0,0,0,0.35)',
		borderRadius: 10,
	},
	graveName: { color: '#fff', fontWeight: '700', fontSize: 14 },
	graveInfo: { color: '#eee', fontSize: 11 },
});
