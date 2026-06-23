import { ActionButton, EmptyState, Panel, StatTile } from '@/components/DragonFocusUI';
import TopHeader from '@/components/TopHeader';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonFocus } from '@/context/DragonFocusProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals, type TodoGoal } from '@/context/GoalsProvider';
import { useJournal } from '@/context/JournalProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const MOODS = [
	{ label: 'Great', fury: -5 },
	{ label: 'Good', fury: -3 },
	{ label: 'Okay', fury: 0 },
	{ label: 'Meh', fury: 3 },
	{ label: 'Down', fury: 5 },
];

const todayKey = () => new Date().toISOString().split('T')[0];

export default function SurveyMorningPage() {
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

	const today = todayKey();
	const isRetake = survey.lastMorningSurveyDate === today && survey.morningSurveyCompleted;
	const [mood, setMood] = useState(MOODS[2]);
	const [todoTitle, setTodoTitle] = useState('');
	const [habitTitle, setHabitTitle] = useState('');
	const [journalText, setJournalText] = useState('');
	const [results, setResults] = useState<string | null>(null);

	const addTodo = () => {
		const title = todoTitle.trim();
		if (!title) return;
		goals.addTodo({ title, dueDate: today, category: 'Focus', importance: 'default' });
		setTodoTitle('');
	};

	const addHabit = () => {
		const title = habitTitle.trim();
		if (!title) return;
		goals.addHabit({ title, category: 'Habit', importance: 'default' });
		setHabitTitle('');
	};

	const submit = () => {
		let energy = 0;
		let shardReward = 0;
		const furyDelta = isRetake ? 0 : mood.fury;

		if (!isRetake) {
			energy = 10;
			shardReward = 1;
			coins.addCoins(energy);
			shards.addShards(shardReward);
			fury.addFury(furyDelta);
			if (furyDelta <= 0) dragon.healHp(2);
			else dragon.damageHp(Math.max(1, furyDelta));
		}

		survey.completeMorningSurvey({
			savedAt: today,
			section: 0,
			progressPercent: 100,
			completed: true,
			sectionData: { mood: mood.label, journalText },
		});

		journal.addEntry({
			id: `morning-${today}-${Date.now()}`,
			date: today,
			surveyType: 'morning',
			goalsCompleted: 0,
			goalsIncomplete: goals.habits.length + goals.todos.filter(goal => !goal.completedDate).length,
			rewards: { coins: energy, fireXp: energy * 10, fury: furyDelta, shards: shardReward },
			text: focus.settings.showJournal ? journalText : undefined,
			moodMorning: mood.label,
			plannedHabitTitles: goals.habits.map(goal => goal.title),
			plannedTodoTitles: goals.todos.filter(goal => !goal.completedDate).map(goal => goal.title),
		});

		setResults(isRetake ? 'Check-in updated. Rewards were locked because this is a retake.' : `Check-in complete: +${energy} energy, +${shardReward} shard, ${furyDelta >= 0 ? '+' : ''}${furyDelta} fury.`);
	};

	if (results) {
		return (
			<View style={styles.container}>
				<TopHeader isHomePage={false} />
				<ScrollView contentContainerStyle={styles.content}>
					<Panel>
						<Text style={styles.sectionTitle}>Check-In Results</Text>
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
					<StatTile label="Open Habits" value={String(goals.habits.length)} />
					<StatTile label="Open To-Dos" value={String(goals.todos.filter(goal => !goal.completedDate).length)} />
				</View>
				{focus.settings.showSurveyAdvice ? (
					<Panel>
						<Text style={styles.sectionTitle}>Briefing Advice</Text>
						<Text style={styles.bodyText}>Pick a small number of directives, make the first step obvious, and leave the dragon fewer excuses to get dramatic.</Text>
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
				{focus.settings.showGoalEditorInCheckIn ? (
					<Panel>
						<Text style={styles.sectionTitle}>Edit Directives</Text>
						<TextInput value={todoTitle} onChangeText={setTodoTitle} placeholder="New to-do for today" placeholderTextColor={theme.colors.secondaryText} style={styles.input} />
						<ActionButton label="Add To-Do" onPress={addTodo} disabled={!todoTitle.trim()} />
						<TextInput value={habitTitle} onChangeText={setHabitTitle} placeholder="New repeating habit" placeholderTextColor={theme.colors.secondaryText} style={styles.inputWithTop} />
						<ActionButton label="Add Habit" onPress={addHabit} disabled={!habitTitle.trim()} />
					</Panel>
				) : null}
				<Panel>
					<Text style={styles.sectionTitle}>Today&apos;s Directives</Text>
					{goals.habits.length + goals.todos.length === 0 ? <EmptyState title="No directives" body="Add one above or skip this section." /> : null}
					{goals.habits.map(goal => <GoalLine key={`habit-${goal.id}`} label={goal.title} meta="Habit" />)}
					{goals.todos.filter((goal: TodoGoal) => !goal.completedDate).map(goal => <GoalLine key={`todo-${goal.id}`} label={goal.title} meta={goal.dueDate ? `To-Do due ${goal.dueDate}` : 'To-Do'} />)}
				</Panel>
				{focus.settings.showJournal ? (
					<Panel>
						<Text style={styles.sectionTitle}>Journal</Text>
						<TextInput value={journalText} onChangeText={setJournalText} multiline placeholder="Optional briefing note" placeholderTextColor={theme.colors.secondaryText} style={[styles.input, styles.journalInput]} />
					</Panel>
				) : null}
				<ActionButton label={isRetake ? 'Update Check-In' : 'Submit Check-In'} onPress={submit} />
			</ScrollView>
		</View>
	);
}

function GoalLine({ label, meta }: { label: string; meta: string }) {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<View style={styles.goalLine}>
			<Text style={styles.goalTitle}>{label}</Text>
			<Text style={styles.goalMeta}>{meta}</Text>
		</View>
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
		input: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontWeight: '700' },
		inputWithTop: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12, marginBottom: 10, fontWeight: '700' },
		journalInput: { minHeight: 110, textAlignVertical: 'top' },
		goalLine: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
		goalTitle: { color: colors.titleText, fontSize: 14, fontWeight: '900' },
		goalMeta: { color: colors.secondaryText, fontSize: 12, marginTop: 3 },
	});
