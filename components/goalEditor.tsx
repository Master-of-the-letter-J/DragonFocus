import ProgressBar from '@/components/ProgressBar';
import type { HabitGoal, TodoGoal } from '@/context/GoalsProvider';
import { useGoals } from '@/context/GoalsProvider';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

// ==================== HABIT EDITOR ====================

export interface HabitEditorProps {
	habit: HabitGoal;
	onClose: () => void;
}

export function HabitEditor({ habit, onClose }: HabitEditorProps) {
	const goals = useGoals();
	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const CATEGORIES = ['Health', 'Fitness', 'Learning', 'Work', 'Creativity', 'Social', 'Meditation', 'Reading', 'Other'];

	const [form, setForm] = useState({
		title: habit.title,
		importance: habit.importance,
		category: habit.category || '',
		daysOfWeek: habit.daysOfWeek || [],
		selectedChallenge: 0,
	});

	const handleSave = () => {
		if (!form.title.trim()) {
			Alert.alert('Error', 'Habit title cannot be empty');
			return;
		}
		// If habit is a locked challenge, disallow edits
		if (habit.isChallenge) {
			Alert.alert('Locked', 'This habit is currently in a challenge and cannot be edited.');
			onClose();
			return;
		}
		goals.editHabit(habit.id, {
			title: form.title,
			importance: form.importance as any,
			category: form.category,
			daysOfWeek: form.daysOfWeek,
		});
		onClose();
	};

	const handleEnableChallenge = () => {
		const len = form.selectedChallenge;
		if (![7, 14, 30].includes(len)) {
			Alert.alert('Select a length', 'Choose 7, 14 or 30 days to enable a challenge');
			return;
		}
		const res = goals.enableChallenge(habit.id, len as number);
		if (!res.success) {
			Alert.alert('Unable to enable', res.message || 'Failed to enable challenge');
		} else {
			Alert.alert('Challenge enabled', `Challenge started (${len} days)`);
			onClose();
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.formContent}>
				<Text style={styles.title}>Edit Habit Goal</Text>

				<Text style={styles.label}>Title</Text>
				<TextInput value={form.title} onChangeText={t => setForm({ ...form, title: t })} placeholder="Goal title" style={styles.input} />

				<Text style={styles.label}>Importance</Text>
				<View style={styles.buttonGroup}>
					{(['Default', 'Important', 'Important+'] as const).map(imp => (
						<Pressable key={imp} style={[styles.segmentButton, form.importance === imp && styles.segmentActive]} onPress={() => setForm({ ...form, importance: imp })}>
							<Text style={[styles.segmentText, form.importance === imp && styles.segmentTextActive]}>{imp}</Text>
						</Pressable>
					))}
				</View>

				<Text style={styles.label}>Category</Text>
				<View style={styles.buttonGroup}>
					{CATEGORIES.map(cat => (
						<Pressable
							key={cat}
							style={[styles.tagButton, form.category === cat && styles.tagActive]}
							onPress={() =>
								setForm({
									...form,
									category: form.category === cat ? '' : cat,
								})
							}>
							<Text style={[styles.tagText, form.category === cat && styles.tagTextActive]}>{cat}</Text>
						</Pressable>
					))}
				</View>

				<Text style={styles.label}>Days of Week</Text>
				<View style={styles.buttonGroup}>
					{DAYS.map(day => (
						<Pressable
							key={day}
							style={[styles.dayButton, form.daysOfWeek.includes(day) && styles.dayActive]}
							onPress={() => {
								const updated = form.daysOfWeek.includes(day) ? form.daysOfWeek.filter(d => d !== day) : [...form.daysOfWeek, day];
								setForm({ ...form, daysOfWeek: updated });
							}}>
							<Text style={[styles.dayText, form.daysOfWeek.includes(day) && styles.dayTextActive]}>{day}</Text>
						</Pressable>
					))}
				</View>

				<Text style={styles.label}>Challenge (locked while active)</Text>
				{habit.isChallenge ? (
					<Text style={{ color: '#1565C0', marginBottom: 8 }}>
						Challenge active: {habit.challengeLength} days (started {habit.challengeStartDate})
					</Text>
				) : (
					<View style={{ flexDirection: 'row', gap: 8 }}>
						{[7, 14, 30].map(d => (
							<Pressable key={d} style={[styles.segmentButton, form.selectedChallenge === d && styles.segmentActive]} onPress={() => setForm({ ...form, selectedChallenge: d })}>
								<Text style={[styles.segmentText, form.selectedChallenge === d && styles.segmentTextActive]}>{d}d</Text>
							</Pressable>
						))}
						<Pressable style={[styles.button, styles.buttonSuccess]} onPress={handleEnableChallenge}>
							<Text style={[styles.buttonText, styles.buttonTextLight]}>Enable</Text>
						</Pressable>
					</View>
				)}

				<View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
					<Pressable style={[styles.button, styles.buttonSuccess]} onPress={handleSave}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Save</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Cancel</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

// ==================== TODO EDITOR ====================

export interface TodoEditorProps {
	todo: TodoGoal;
	onClose: () => void;
}

export function TodoEditor({ todo, onClose }: TodoEditorProps) {
	const goals = useGoals();
	const CATEGORIES = ['Work', 'Personal', 'Health', 'Learning', 'Shopping', 'Finance', 'Home', 'Creative', 'Other'];

	const [form, setForm] = useState({
		title: todo.title,
		importance: todo.importance,
		category: todo.category || '',
		dueDate: todo.dueDate || '',
	});

	const [subGoals, setSubGoals] = useState(todo.subGoals || []);
	const [newSubGoal, setNewSubGoal] = useState('');

	const addSubGoal = () => {
		if (!newSubGoal.trim()) return;
		const sg = {
			id: Math.random().toString(36).slice(2),
			title: newSubGoal.trim(),
			completed: false,
		};
		setSubGoals([...subGoals, sg]);
		setNewSubGoal('');
	};

	const toggleSubGoal = (id: string) => {
		setSubGoals(subGoals.map(sg => (sg.id === id ? { ...sg, completed: !sg.completed } : sg)));
	};

	const deleteSubGoal = (id: string) => {
		setSubGoals(subGoals.filter(sg => sg.id !== id));
	};

	const progress = subGoals.length === 0 ? 0 : subGoals.filter(sg => sg.completed).length / subGoals.length;

	const handleSave = () => {
		if (!form.title.trim()) {
			Alert.alert('Error', 'To-Do title cannot be empty');
			return;
		}
		// Disallow edits to challenge to-dos
		if ((todo as any).isChallenge) {
			Alert.alert('Locked', 'This to-do is a challenge and cannot be edited.');
			onClose();
			return;
		}
		goals.editTodo(todo.id, {
			title: form.title,
			importance: form.importance as any,
			category: form.category,
			dueDate: form.dueDate,
			subGoals,
		});
		onClose();
	};

	const handleDelete = () => {
		Alert.alert('Delete To-Do', 'Are you sure you want to delete this to-do?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => {
					goals.deleteTodo(todo.id);
					onClose();
				},
			},
		]);
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.formContent}>
				<Text style={styles.title}>Edit To-Do</Text>

				<Text style={styles.label}>Title</Text>
				<TextInput value={form.title} onChangeText={t => setForm({ ...form, title: t })} placeholder="To-do title" style={styles.input} />

				<Text style={styles.label}>Importance</Text>
				<View style={styles.buttonGroup}>
					{(['Default', 'Important', 'Important+'] as const).map(imp => (
						<Pressable key={imp} style={[styles.segmentButton, form.importance === imp && styles.segmentActive]} onPress={() => setForm({ ...form, importance: imp })}>
							<Text style={[styles.segmentText, form.importance === imp && styles.segmentTextActive]}>{imp}</Text>
						</Pressable>
					))}
				</View>

				<Text style={styles.label}>Category</Text>
				<View style={styles.buttonGroup}>
					{CATEGORIES.map(cat => (
						<Pressable
							key={cat}
							style={[styles.tagButton, form.category === cat && styles.tagActive]}
							onPress={() =>
								setForm({
									...form,
									category: form.category === cat ? '' : cat,
								})
							}>
							<Text style={[styles.tagText, form.category === cat && styles.tagTextActive]}>{cat}</Text>
						</Pressable>
					))}
				</View>

				<Text style={styles.label}>Due Date (optional)</Text>
				<TextInput value={form.dueDate} onChangeText={t => setForm({ ...form, dueDate: t })} placeholder="YYYY-MM-DD" style={styles.input} />

				{/* SUB-GOALS SECTION */}
				<Text style={styles.label}>Sub-Goals</Text>

				<ProgressBar progress={progress} />

				{/* Add new sub-goal */}
				<View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
					<TextInput value={newSubGoal} onChangeText={setNewSubGoal} placeholder="Add a sub-goal" style={[styles.input, { flex: 1 }]} />
					<Pressable style={[styles.button, styles.buttonSuccess, { paddingHorizontal: 16 }]} onPress={addSubGoal}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Add</Text>
					</Pressable>
				</View>

				{/* Draggable list */}
				<DraggableFlatList
					data={subGoals}
					keyExtractor={item => item.id}
					onDragEnd={({ data }) => setSubGoals(data)}
					nestedScrollEnabled={true}
					renderItem={({ item, drag, isActive }) => (
						<Pressable
							onLongPress={drag}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								paddingVertical: 8,
								opacity: isActive ? 0.6 : 1,
								borderBottomWidth: 1,
								borderColor: '#eee',
							}}>
							{/* Checkbox */}
							<Pressable
								onPress={() => toggleSubGoal(item.id)}
								style={{
									width: 22,
									height: 22,
									borderRadius: 4,
									borderWidth: 1,
									borderColor: '#999',
									backgroundColor: item.completed ? '#4CAF50' : 'transparent',
									marginRight: 12,
								}}
							/>

							<Text
								style={{
									flex: 1,
									fontSize: 15,
									textDecorationLine: item.completed ? 'line-through' : 'none',
									color: item.completed ? '#777' : '#000',
								}}>
								{item.title}
							</Text>

							<Pressable onPress={() => deleteSubGoal(item.id)}>
								<Text
									style={{
										color: '#f44336',
										fontWeight: '600',
									}}>
									Delete
								</Text>
							</Pressable>
						</Pressable>
					)}
				/>

				<View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
					<Pressable style={[styles.button, styles.buttonSuccess]} onPress={handleSave}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Save</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.buttonDanger]} onPress={handleDelete}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Delete</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Cancel</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	formContent: {
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		marginTop: 16,
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
	buttonGroup: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
		marginBottom: 8,
	},
	segmentButton: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	segmentActive: {
		borderColor: '#4CAF50',
		backgroundColor: '#E8F5E9',
	},
	segmentText: {
		fontSize: 14,
		color: '#666',
	},
	segmentTextActive: {
		color: '#2E7D32',
		fontWeight: '600',
	},
	tagButton: {
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	tagActive: {
		borderColor: '#2196F3',
		backgroundColor: '#E3F2FD',
	},
	tagText: {
		fontSize: 13,
		color: '#666',
	},
	tagTextActive: {
		color: '#1565C0',
		fontWeight: '600',
	},
	dayButton: {
		width: '13%',
		paddingVertical: 8,
		borderRadius: 6,
		borderWidth: 1,
		borderColor: '#ddd',
		alignItems: 'center',
	},
	dayActive: {
		borderColor: '#4CAF50',
		backgroundColor: '#C8E6C9',
	},
	dayText: {
		fontSize: 12,
		color: '#666',
	},
	dayTextActive: {
		color: '#2E7D32',
		fontWeight: '600',
	},
	button: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
	},
	buttonSuccess: {
		backgroundColor: '#4CAF50',
	},
	buttonDanger: {
		backgroundColor: '#f44336',
	},
	buttonSecondary: {
		backgroundColor: '#999',
	},
	buttonText: {
		fontSize: 14,
		fontWeight: '600',
	},
	buttonTextLight: {
		color: '#fff',
	},
});
