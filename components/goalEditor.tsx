import ProgressBar from '@/components/ProgressBar';
import { GOAL_CATEGORY_OPTIONS, GOAL_CHALLENGE_TIERS, GOAL_IMPORTANCE_OPTIONS, GOAL_WEEKDAY_OPTIONS, getGoalCategories, isGoalChallengeActive, type GoalChallengeTier, type GoalImportance } from '@/data/goal-utils';
import type { HabitGoal, SubGoal, TodoGoal } from '@/context/GoalsProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useQuestions } from '@/context/QuestionProvider';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';

const WEEKDAY_OPTIONS = [...GOAL_WEEKDAY_OPTIONS] as const;

const buildCategoryOptions = (questionCategories: string[], existingCategories: string[]) => {
	return Array.from(new Set([...GOAL_CATEGORY_OPTIONS, ...questionCategories, ...existingCategories].filter(Boolean)));
};

const toggleValue = (values: string[], value: string) => {
	return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
};

const formatChallengeText = (tier: GoalChallengeTier) => {
	return `${tier.days} days | Cost 🪙 ${tier.coinCost} + 💎 ${tier.shardCost} | Reward 🪙 ${tier.rewardCoins} + 💎 ${tier.rewardShards}`;
};

interface HabitEditorProps {
	habit: HabitGoal;
	onClose: () => void;
}

export function HabitEditor({ habit, onClose }: HabitEditorProps) {
	const goals = useGoals();
	const questions = useQuestions();
	const categoryOptions = useMemo(
		() =>
			buildCategoryOptions(
				[...questions.questionSettings.habitGoals.suggestedCategories, ...questions.questionSettings.habitGoals.customCategories],
				getGoalCategories(habit.categories, habit.category),
			),
		[habit.categories, habit.category, questions.questionSettings.habitGoals.customCategories, questions.questionSettings.habitGoals.suggestedCategories],
	);
	const challengeLocked = isGoalChallengeActive(habit);

	const [form, setForm] = useState({
		title: habit.title,
		importance: habit.importance,
		categories: getGoalCategories(habit.categories, habit.category),
		daysOfWeek: habit.daysOfWeek ?? [...WEEKDAY_OPTIONS],
		selectedChallengeDays: habit.challengeLength ?? 0,
	});

	const handleSave = () => {
		if (!form.title.trim()) {
			Alert.alert('Error', 'Habit title cannot be empty.');
			return;
		}

		if (challengeLocked) {
			Alert.alert('Locked', 'This habit is in an active challenge, so it cannot be edited right now.');
			onClose();
			return;
		}

		goals.editHabit(habit.id, {
			title: form.title.trim(),
			importance: form.importance,
			categories: form.categories,
			category: form.categories[0],
			daysOfWeek: form.daysOfWeek.length > 0 ? form.daysOfWeek : [...WEEKDAY_OPTIONS],
		});
		onClose();
	};

	const handleDelete = () => {
		Alert.alert('Delete Habit Goal', 'Deleting this habit removes its streak and any challenge tied to it. Continue?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => {
					goals.deleteHabit(habit.id);
					onClose();
				},
			},
		]);
	};

	const handleEnableChallenge = () => {
		if (![7, 14, 30, 60, 90, 365].includes(form.selectedChallengeDays)) {
			Alert.alert('Choose a challenge', 'Select a challenge length before enabling it.');
			return;
		}

		const result = goals.enableChallenge(habit.id, form.selectedChallengeDays);
		if (!result.success) {
			Alert.alert('Unable to enable challenge', result.message ?? 'The challenge could not be started.');
			return;
		}

		Alert.alert('Challenge enabled', `${form.selectedChallengeDays}-day challenge mode is now active for this habit.`);
		onClose();
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.formContent}>
				<Text style={styles.title}>Edit Habit Goal</Text>

				<Text style={styles.label}>Title</Text>
				<TextInput editable={!challengeLocked} value={form.title} onChangeText={title => setForm(prev => ({ ...prev, title }))} placeholder="Habit title" style={styles.input} />

				<Text style={styles.label}>Importance</Text>
				<ImportanceSelector value={form.importance} onChange={importance => setForm(prev => ({ ...prev, importance }))} />

				<Text style={styles.label}>Categories</Text>
				<ChipSelector options={categoryOptions} selected={form.categories} onToggle={category => setForm(prev => ({ ...prev, categories: toggleValue(prev.categories, category) }))} />

				<Text style={styles.label}>Days of Week</Text>
				<ChipSelector options={[...WEEKDAY_OPTIONS]} selected={form.daysOfWeek} onToggle={day => setForm(prev => ({ ...prev, daysOfWeek: toggleValue(prev.daysOfWeek, day) }))} />

				<Text style={styles.label}>Challenge Mode</Text>
				{challengeLocked ? (
					<Text style={styles.infoText}>
						Active {habit.challengeLength}-day challenge since {habit.challengeStartDate}. The editor stays locked until that challenge is completed or failed.
					</Text>
				) : (
					<>
						<ChallengeSelector value={form.selectedChallengeDays} onChange={selectedChallengeDays => setForm(prev => ({ ...prev, selectedChallengeDays }))} />
						<Pressable style={[styles.button, styles.buttonSuccess]} onPress={handleEnableChallenge}>
							<Text style={[styles.buttonText, styles.buttonTextLight]}>Add Challenge</Text>
						</Pressable>
					</>
				)}

				<View style={styles.footerButtons}>
					<Pressable style={[styles.button, styles.buttonSuccess]} onPress={handleSave}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Save</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.buttonDanger]} onPress={handleDelete}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Delete</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Close</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

interface TodoEditorProps {
	todo: TodoGoal;
	onClose: () => void;
}

export function TodoEditor({ todo, onClose }: TodoEditorProps) {
	const goals = useGoals();
	const questions = useQuestions();
	const categoryOptions = useMemo(
		() =>
			buildCategoryOptions(
				[...questions.questionSettings.todoGoals.suggestedCategories, ...questions.questionSettings.todoGoals.customCategories],
				getGoalCategories(todo.categories, todo.category),
			),
		[todo.categories, todo.category, questions.questionSettings.todoGoals.customCategories, questions.questionSettings.todoGoals.suggestedCategories],
	);
	const challengeLocked = isGoalChallengeActive(todo);

	const [form, setForm] = useState({
		title: todo.title,
		importance: todo.importance,
		categories: getGoalCategories(todo.categories, todo.category),
		dueDate: todo.dueDate ?? '',
	});
	const [subGoals, setSubGoals] = useState<SubGoal[]>(todo.subGoals ?? []);
	const [newSubGoal, setNewSubGoal] = useState('');
	const [editingSubGoalId, setEditingSubGoalId] = useState<string | null>(null);

	const progress = subGoals.length === 0 ? 0 : subGoals.filter(subGoal => subGoal.completed).length / subGoals.length;
	const todoChallengeDetails = useMemo(() => goals.getTodoChallengeDetails(form.dueDate, todo.createdAt), [form.dueDate, goals, todo.createdAt]);

	const handleSave = () => {
		if (!form.title.trim()) {
			Alert.alert('Error', 'To-do title cannot be empty.');
			return;
		}

		goals.editTodo(todo.id, {
			title: form.title.trim(),
			importance: form.importance,
			categories: form.categories,
			category: form.categories[0],
			dueDate: form.dueDate.trim() || null,
			subGoals,
		});
		onClose();
	};

	const handleDelete = () => {
		Alert.alert('Delete To-Do Goal', 'Deleting this to-do removes its sub-goals and any challenge tied to it. Continue?', [
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

	const handleEnableChallenge = () => {
		if (!todoChallengeDetails) {
			Alert.alert('Add a Due Date', 'Set a valid due date before enabling challenge mode.');
			return;
		}

		Alert.alert(
			'Enable To-Do Challenge',
			`Spend ${todoChallengeDetails.coinCost} coins and ${todoChallengeDetails.shardCost} shards to lock this title and due date, then earn ${todoChallengeDetails.rewardCoins} coins and ${todoChallengeDetails.rewardShards} shards if it is finished on time?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Enable',
					onPress: () => {
						const result = goals.enableTodoChallenge(todo.id, {
							title: form.title.trim(),
							importance: form.importance,
							categories: form.categories,
							category: form.categories[0],
							dueDate: form.dueDate.trim() || null,
							subGoals,
						});
						if (!result.success) {
							Alert.alert('Unable to enable challenge', result.message ?? 'The challenge could not be started.');
							return;
						}
						Alert.alert('Challenge enabled', `${result.details?.days ?? todoChallengeDetails.days}-day challenge mode is now active for this to-do.`);
						onClose();
					},
				},
			],
		);
	};

	const addSubGoal = () => {
		const title = newSubGoal.trim();
		if (!title) return;
		setSubGoals(prev => [...prev, { id: Math.random().toString(36).slice(2), title, completed: false }]);
		setNewSubGoal('');
	};

	const deleteSubGoal = (id: string) => {
		Alert.alert('Delete Sub-Goal', 'Delete this sub-goal permanently?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: () => setSubGoals(prev => prev.filter(subGoal => subGoal.id !== id)) },
		]);
	};

	const updateSubGoalTitle = (id: string, title: string) => {
		setSubGoals(prev => prev.map(subGoal => (subGoal.id === id ? { ...subGoal, title } : subGoal)));
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.formContent}>
				<Text style={styles.title}>Edit To-Do Goal</Text>

				<Text style={styles.label}>Title</Text>
				<TextInput editable={!challengeLocked} value={form.title} onChangeText={title => setForm(prev => ({ ...prev, title }))} placeholder="To-do title" style={styles.input} />

				<Text style={styles.label}>Importance</Text>
				<ImportanceSelector value={form.importance} onChange={importance => setForm(prev => ({ ...prev, importance }))} />

				<Text style={styles.label}>Categories</Text>
				<ChipSelector options={categoryOptions} selected={form.categories} onToggle={category => setForm(prev => ({ ...prev, categories: toggleValue(prev.categories, category) }))} />

				<Text style={styles.label}>Due Date</Text>
				<TextInput editable={!challengeLocked} value={form.dueDate} onChangeText={dueDate => setForm(prev => ({ ...prev, dueDate }))} placeholder="YYYY-MM-DD" style={styles.input} />

				<Text style={styles.label}>Challenge Mode</Text>
				{challengeLocked ? (
					<Text style={styles.infoText}>
						Active {todo.challengeLength}-day challenge | reward {todo.rewardCoins ?? 0} coins + {todo.rewardShards ?? 0} shards.
					</Text>
				) : todoChallengeDetails ? (
					<>
						<Text style={styles.infoText}>{formatChallengeText(todoChallengeDetails)}</Text>
						<Pressable style={[styles.button, styles.buttonSuccess]} onPress={handleEnableChallenge}>
							<Text style={[styles.buttonText, styles.buttonTextLight]}>Add Challenge</Text>
						</Pressable>
					</>
				) : (
					<Text style={styles.infoText}>Add a valid due date to unlock challenge mode for this to-do.</Text>
				)}

				<Text style={styles.label}>Sub-Goals</Text>
				<ProgressBar progress={progress} />

				<View style={styles.inlineRow}>
					<TextInput value={newSubGoal} onChangeText={setNewSubGoal} placeholder="Add a sub-goal" style={[styles.input, styles.flexInput]} />
					<Pressable style={[styles.button, styles.buttonSuccess, styles.inlineButton]} onPress={addSubGoal}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Add</Text>
					</Pressable>
				</View>

				<DraggableFlatList
					data={subGoals}
					keyExtractor={item => item.id}
					onDragEnd={({ data }) => setSubGoals(data)}
					nestedScrollEnabled
					renderItem={({ item, drag, isActive }) => (
						<View style={[styles.subGoalCard, isActive ? styles.subGoalCardDragging : null]}>
							<View style={styles.subGoalActions}>
								<Pressable onPress={() => deleteSubGoal(item.id)}>
									<Text style={styles.deleteText}>Delete</Text>
								</Pressable>
								<Pressable onPress={() => setEditingSubGoalId(item.id)}>
									<Text style={styles.editText}>Edit</Text>
								</Pressable>
								<Pressable onLongPress={drag} delayLongPress={120}>
									<Text style={styles.moveText}>Move</Text>
								</Pressable>
							</View>

							<TextInput
								value={item.title}
								onChangeText={text => updateSubGoalTitle(item.id, text)}
								onFocus={() => setEditingSubGoalId(item.id)}
								onBlur={() => setEditingSubGoalId(current => (current === item.id ? null : current))}
								placeholder="Sub-goal title"
								style={[
									styles.subGoalInput,
									editingSubGoalId === item.id ? styles.subGoalInputActive : null,
									item.completed ? styles.subGoalInputCompleted : null,
								]}
							/>
						</View>
					)}
				/>

				<View style={styles.footerButtons}>
					<Pressable style={[styles.button, styles.buttonSuccess]} onPress={handleSave}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Save</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.buttonDanger]} onPress={handleDelete}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Delete</Text>
					</Pressable>
					<Pressable style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
						<Text style={[styles.buttonText, styles.buttonTextLight]}>Close</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}

function ImportanceSelector({ value, onChange }: { value: GoalImportance; onChange: (value: GoalImportance) => void }) {
	return (
		<View style={styles.buttonGroup}>
			{GOAL_IMPORTANCE_OPTIONS.map(option => (
				<Pressable
					key={option.value}
					style={[styles.segmentButton, value === option.value && styles.segmentActive]}
					onPress={() => onChange(option.value)}>
					<Text style={[styles.segmentText, value === option.value && styles.segmentTextActive, { color: value === option.value ? option.color : '#666' }]}>{option.shortLabel}</Text>
				</Pressable>
			))}
		</View>
	);
}

function ChipSelector({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
	return (
		<View style={styles.buttonGroup}>
			{options.map(option => (
				<Pressable key={option} style={[styles.tagButton, selected.includes(option) && styles.tagActive]} onPress={() => onToggle(option)}>
					<Text style={[styles.tagText, selected.includes(option) && styles.tagTextActive]}>{option}</Text>
				</Pressable>
			))}
		</View>
	);
}

function ChallengeSelector({ value, onChange }: { value: number; onChange: (value: number) => void }) {
	const [showExtended, setShowExtended] = useState(false);
	const visibleTiers = showExtended ? GOAL_CHALLENGE_TIERS : GOAL_CHALLENGE_TIERS.filter(tier => tier.days <= 30);

	return (
		<View style={styles.challengeGrid}>
			<View style={styles.challengeHeaderRow}>
				<Text style={styles.infoText}>Challenges lock the goal and pay extra rewards when finished on time.</Text>
				<Pressable style={styles.infoButton} onPress={() => Alert.alert('Challenges', 'Challenge goals lock important fields, cost coins and shards to start, and pay larger coin/shard rewards when completed successfully.')}>
					<Text style={styles.infoButtonText}>i</Text>
				</Pressable>
			</View>
			{visibleTiers.map(tier => (
				<Pressable key={tier.days} style={[styles.challengeButton, value === tier.days && styles.challengeButtonActive]} onPress={() => onChange(tier.days)}>
					<Text style={[styles.challengeTitle, value === tier.days && styles.challengeTitleActive]}>{tier.days} days</Text>
					<Text style={[styles.challengeMeta, value === tier.days && styles.challengeMetaActive]}>Cost 🪙 {tier.coinCost} + 💎 {tier.shardCost}</Text>
					<Text style={[styles.challengeMeta, value === tier.days && styles.challengeMetaActive]}>Reward 🪙 {tier.rewardCoins} + 💎 {tier.rewardShards}</Text>
				</Pressable>
			))}
			<Pressable style={styles.seeMoreButton} onPress={() => setShowExtended(prev => !prev)}>
				<Text style={styles.seeMoreText}>{showExtended ? 'Hide 60/90/365 Day Challenges' : 'See More Challenges'}</Text>
			</Pressable>
		</View>
	);
}

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
	infoText: {
		fontSize: 13,
		lineHeight: 20,
		color: '#4B5563',
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 10,
		padding: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	flexInput: {
		flex: 1,
	},
	buttonGroup: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	segmentButton: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#D1D5DB',
		backgroundColor: '#fff',
	},
	segmentActive: {
		borderColor: '#111827',
		backgroundColor: '#F9FAFB',
	},
	segmentText: {
		fontSize: 14,
		color: '#666',
	},
	segmentTextActive: {
		fontWeight: '700',
	},
	tagButton: {
		paddingVertical: 7,
		paddingHorizontal: 10,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: '#D1D5DB',
		backgroundColor: '#fff',
	},
	tagActive: {
		borderColor: '#2563EB',
		backgroundColor: '#E0F2FE',
	},
	tagText: {
		fontSize: 13,
		color: '#4B5563',
	},
	tagTextActive: {
		color: '#1D4ED8',
		fontWeight: '700',
	},
	challengeGrid: {
		gap: 8,
	},
	challengeHeaderRow: {
		flexDirection: 'row',
		gap: 8,
		alignItems: 'center',
	},
	infoButton: {
		width: 28,
		height: 28,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#111827',
	},
	infoButtonText: {
		color: '#fff',
		fontWeight: '800',
	},
	challengeButton: {
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 12,
		padding: 12,
		backgroundColor: '#fff',
	},
	challengeButtonActive: {
		borderColor: '#2563EB',
		backgroundColor: '#EFF6FF',
	},
	challengeTitle: {
		fontSize: 14,
		fontWeight: '800',
		color: '#111827',
	},
	challengeTitleActive: {
		color: '#1D4ED8',
	},
	challengeMeta: {
		fontSize: 12,
		color: '#6B7280',
		marginTop: 4,
	},
	challengeMetaActive: {
		color: '#1E40AF',
	},
	seeMoreButton: {
		alignSelf: 'flex-start',
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 10,
		backgroundColor: '#F3F4F6',
	},
	seeMoreText: {
		color: '#374151',
		fontWeight: '800',
	},
	inlineRow: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 8,
		marginBottom: 12,
	},
	inlineButton: {
		flex: 0,
		paddingHorizontal: 16,
	},
	subGoalCard: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	subGoalCardDragging: {
		opacity: 0.65,
	},
	subGoalActions: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 8,
	},
	subGoalInput: {
		borderWidth: 1,
		borderColor: 'transparent',
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 10,
		fontSize: 15,
		color: '#111827',
		backgroundColor: '#fff',
	},
	subGoalInputActive: {
		borderColor: '#CBD5E1',
	},
	subGoalInputCompleted: {
		textDecorationLine: 'line-through',
		color: '#6B7280',
	},
	deleteText: {
		color: '#DC2626',
		fontWeight: '700',
	},
	editText: {
		color: '#2563EB',
		fontWeight: '700',
	},
	moveText: {
		color: '#6B7280',
		fontWeight: '700',
	},
	footerButtons: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 20,
	},
	button: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: 'center',
	},
	buttonSuccess: {
		backgroundColor: '#15803D',
	},
	buttonDanger: {
		backgroundColor: '#DC2626',
	},
	buttonSecondary: {
		backgroundColor: '#6B7280',
	},
	buttonText: {
		fontSize: 14,
		fontWeight: '700',
	},
	buttonTextLight: {
		color: '#fff',
	},
});
