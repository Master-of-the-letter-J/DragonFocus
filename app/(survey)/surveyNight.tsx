import { ActionButton, EmptyState, Panel, StatTile } from '@/components/DragonFocusUI';
import TopHeader from '@/components/TopHeader';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonFocus } from '@/context/DragonFocusProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useJournal } from '@/context/JournalProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const MOODS = [
	{ label: 'Fulfilled', fury: -5 },
	{ label: 'Calm', fury: -3 },
	{ label: 'Okay', fury: 0 },
	{ label: 'Uneasy', fury: 3 },
	{ label: 'Drained', fury: 5 },
];

const todayKey = () => new Date().toISOString().split('T')[0];

export default function SurveyNightPage() {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	const router = useRouter();
	const focus = useDragonFocus();
	const survey = useSurvey();
	const goals = useGoals();
	const coins = useDragonCoins();
	const shards = useShards();
	const fury = useFury();
	const dragon = useDragon();
	const journal = useJournal();
	const streak = useStreak();

	const today = todayKey();
	const isRetake = survey.lastNightSurveyDate === today && survey.nightSurveyCompleted;
	const [mood, setMood] = useState(MOODS[2]);
	const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
	const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);
	const [journalText, setJournalText] = useState('');
	const [results, setResults] = useState<string | null>(null);

	const openHabits = goals.habits.filter(goal => goal.lastCompletedDate !== today);
	const openTodos = goals.todos.filter(goal => !goal.completedDate && !goal.failed);
	const completedToday = [
		...goals.habits.filter(goal => goal.lastCompletedDate === today).map(goal => `habit:${goal.id}`),
		...goals.todos.filter(goal => goal.completedDate === today).map(goal => `todo:${goal.id}`),
	];
	const selectedCount = selectedHabitIds.length + selectedTodoIds.length;

	const toggle = (id: string, type: 'habit' | 'todo') => {
		const setter = type === 'habit' ? setSelectedHabitIds : setSelectedTodoIds;
		setter(current => (current.includes(id) ? current.filter(item => item !== id) : [...current, id]));
	};

	const submit = () => {
		let energy = 0;
		let shardReward = 0;
		let furyDelta = isRetake ? 0 : mood.fury;

		selectedHabitIds.forEach(id => goals.completeHabitToday(id));
		selectedTodoIds.forEach(id => goals.completeTodo(id));

		const harvestIds = [
			...selectedHabitIds.map(id => `habit:${id}`),
			...selectedTodoIds.map(id => `todo:${id}`),
			...completedToday,
		].filter(id => !focus.isGoalHarvested(today, id));

		if (!isRetake) {
			energy += 10 + selectedCount * 20;
			shardReward += 1 + Math.floor(selectedCount / 3);
			coins.addCoins(energy);
			shards.addShards(shardReward);
			furyDelta -= selectedCount * 2;
			fury.addFury(furyDelta);
			dragon.addHealthFromGoal(selectedCount * 2);
			if (survey.lastMorningSurveyDate === today && survey.morningSurveyCompleted) streak.incrementStreak();
		}

		if (focus.settings.showHarvestInCheckOut) {
			focus.markGoalsHarvested(today, harvestIds);
		}

		survey.completeNightSurvey({
			savedAt: today,
			section: 0,
			progressPercent: 100,
			completed: true,
			sectionData: { mood: mood.label, journalText, selectedHabitIds, selectedTodoIds },
			lastSnapshot: {
				habitIds: selectedHabitIds,
				todoIds: selectedTodoIds,
			},
		});

		survey.recordGoalRewards(today, {
			habitIds: selectedHabitIds,
			todoIds: selectedTodoIds,
		});

		journal.addEntry({
			id: `night-${today}-${Date.now()}`,
			date: today,
			surveyType: 'night',
			goalsCompleted: selectedCount,
			goalsIncomplete: Math.max(0, openHabits.length + openTodos.length - selectedCount),
			rewards: { coins: energy, fireXp: energy * 10, fury: furyDelta, shards: shardReward },
			text: focus.settings.showJournal ? journalText : undefined,
			moodEvening: mood.label,
			todoCount: goals.todos.length,
			todoCompleted: selectedTodoIds.length,
			todoFailed: goals.todos.filter(goal => goal.failed).length,
			completedHabitTitles: goals.habits.filter(goal => selectedHabitIds.includes(goal.id)).map(goal => goal.title),
			completedTodoTitles: goals.todos.filter(goal => selectedTodoIds.includes(goal.id)).map(goal => goal.title),
			pendingTodoTitles: goals.todos.filter(goal => !selectedTodoIds.includes(goal.id) && !goal.completedDate).map(goal => goal.title),
		});

		setResults(isRetake ? 'Check-out updated. Rewards were locked because this is a retake.' : `Check-out complete: ${selectedCount} goals, +${energy} energy, +${shardReward} shards, ${furyDelta >= 0 ? '+' : ''}${furyDelta} fury.`);
	};

	if (results) {
		return (
			<View style={styles.container}>
				<TopHeader isHomePage={false} />
				<ScrollView contentContainerStyle={styles.content}>
					<Panel>
						<Text style={styles.sectionTitle}>Check-Out Results</Text>
						<Text style={styles.bodyText}>{results}</Text>
						<ActionButton label="Return" onPress={() => router.back()} />
					</Panel>
				</ScrollView>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.statGrid}>
					<StatTile label="Selectable Goals" value={String(openHabits.length + openTodos.length)} />
					<StatTile label="Selected" value={String(selectedCount)} />
				</View>
				{focus.settings.showSurveyAdvice ? (
					<Panel>
						<Text style={styles.sectionTitle}>Debrief Advice</Text>
						<Text style={styles.bodyText}>Mark only what truly happened. The dragon is volatile, not stupid.</Text>
					</Panel>
				) : null}
				{focus.settings.showMoodQuestion ? (
					<Panel>
						<Text style={styles.sectionTitle}>Mood</Text>
						<View style={styles.actionRow}>
							{MOODS.map(option => (
								<ActionButton key={option.label} label={option.label} variant={mood.label === option.label ? 'primary' : 'secondary'} onPress={() => setMood(option)} />
							))}
						</View>
					</Panel>
				) : null}
				<Panel>
					<Text style={styles.sectionTitle}>Complete Goals</Text>
					{openHabits.length + openTodos.length === 0 ? <EmptyState title="No open goals" body="Completed or harvested goals will still be logged when you submit." /> : null}
					{openHabits.map(goal => <GoalCheck key={`habit-${goal.id}`} label={goal.title} meta="Habit" selected={selectedHabitIds.includes(goal.id)} onPress={() => toggle(goal.id, 'habit')} />)}
					{openTodos.map(goal => <GoalCheck key={`todo-${goal.id}`} label={goal.title} meta={goal.dueDate ? `To-Do due ${goal.dueDate}` : 'To-Do'} selected={selectedTodoIds.includes(goal.id)} onPress={() => toggle(goal.id, 'todo')} />)}
				</Panel>
				{focus.settings.showHarvestInCheckOut ? (
					<Panel>
						<Text style={styles.sectionTitle}>Harvest Preview</Text>
						<Text style={styles.bodyText}>{selectedCount} selected goals will be harvested with this debrief. Already harvested goals are skipped automatically.</Text>
					</Panel>
				) : null}
				{focus.settings.showJournal ? (
					<Panel>
						<Text style={styles.sectionTitle}>Journal</Text>
						<TextInput value={journalText} onChangeText={setJournalText} multiline placeholder="Optional debrief note" placeholderTextColor={theme.colors.secondaryText} style={[styles.input, styles.journalInput]} />
					</Panel>
				) : null}
				<ActionButton label={isRetake ? 'Update Check-Out' : 'Submit Check-Out'} onPress={submit} />
			</ScrollView>
		</View>
	);
}

function GoalCheck({ label, meta, selected, onPress }: { label: string; meta: string; selected: boolean; onPress: () => void }) {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<PressableShim selected={selected} onPress={onPress}>
			<View style={styles.goalText}>
				<Text style={styles.goalTitle}>{label}</Text>
				<Text style={styles.goalMeta}>{meta}</Text>
			</View>
			<Text style={[styles.checkText, selected && styles.checkTextSelected]}>{selected ? 'Done' : 'Open'}</Text>
		</PressableShim>
	);
}

function PressableShim({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: React.ReactNode }) {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<Pressable style={[styles.goalLine, selected && styles.goalLineSelected]} onPress={onPress}>
			{children}
		</Pressable>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: colors.background },
		content: { padding: 14, paddingBottom: 36 },
		statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
		sectionTitle: { color: colors.headerText, fontSize: 18, fontWeight: '900', marginBottom: 8 },
		bodyText: { color: colors.text, fontSize: 13, lineHeight: 20, marginBottom: 12 },
		actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
		input: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text, paddingHorizontal: 12, paddingVertical: 10, fontWeight: '700' },
		journalInput: { minHeight: 110, textAlignVertical: 'top' },
		goalLine: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
		goalLineSelected: { backgroundColor: colors.tertiaryBackground },
		goalText: { flex: 1 },
		goalTitle: { color: colors.titleText, fontSize: 14, fontWeight: '900' },
		goalMeta: { color: colors.secondaryText, fontSize: 12, marginTop: 3 },
		checkText: { color: colors.secondaryText, fontSize: 12, fontWeight: '900' },
		checkTextSelected: { color: colors.success },
	});
