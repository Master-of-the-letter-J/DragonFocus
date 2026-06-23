import { ActionButton, EmptyState, Panel, SectionTabs, StatTile } from '@/components/DragonFocusUI';
import ProgressBar from '@/components/ProgressBar';
import TopHeader from '@/components/TopHeader';
import { images } from '@/constants';
import { formatAbbreviatedNumber, formatDecimalNumber } from '@/constants/number-abbreviation';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragonFocus } from '@/context/DragonFocusProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals, type HabitGoal, type TodoGoal } from '@/context/GoalsProvider';
import { useJournal } from '@/context/JournalProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useTheme } from '@/context/ThemeProvider';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Animated, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type HatcheryTab = 'nexus' | 'incomplete' | 'completed' | 'pomodoro';
type GoalDraftType = 'todo' | 'habit';

const HATCHERY_TABS: Array<{ key: HatcheryTab; label: string }> = [
	{ key: 'nexus', label: 'Nexus' },
	{ key: 'incomplete', label: 'Incomplete' },
	{ key: 'completed', label: 'Completed' },
	{ key: 'pomodoro', label: 'Pomodoro' },
];

const todayKey = () => new Date().toISOString().split('T')[0];

export default function HatcheryPage() {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	const router = useRouter();
	const dragon = useDragon();
	const fury = useFury();
	const goals = useGoals();
	const survey = useSurvey();
	const coins = useDragonCoins();
	const shards = useShards();
	const focus = useDragonFocus();
	const journal = useJournal();

	const [tab, setTab] = useState<HatcheryTab>('nexus');
	const [dragonQuote, setDragonQuote] = useState('The egg hears routines before it hears names.');
	const [draftType, setDraftType] = useState<GoalDraftType>('todo');
	const [draftTitle, setDraftTitle] = useState('');
	const [draftCategory, setDraftCategory] = useState('Focus');
	const [draftImportance, setDraftImportance] = useState<TodoGoal['importance']>('default');
	const [draftDueDate, setDraftDueDate] = useState(todayKey());
	const [selectedFocusGoal, setSelectedFocusGoal] = useState<string | null>(null);
	const [minutes, setMinutes] = useState('25');
	const [secondsLeft, setSecondsLeft] = useState(25 * 60);
	const [timerRunning, setTimerRunning] = useState(false);
	const pulse = useMemo(() => new Animated.Value(1), []);

	const today = todayKey();
	const openTodos = goals.todos.filter(goal => !goal.completedDate && !goal.failed);
	const dueTodayTodos = openTodos.filter(goal => !goal.dueDate || goal.dueDate <= today);
	const futureTodos = openTodos.filter(goal => !!goal.dueDate && goal.dueDate > today);
	const activeHabits = goals.habits.filter(goal => goal.lastCompletedDate !== today);
	const completedHabits = goals.habits.filter(goal => goal.lastCompletedDate === today);
	const completedTodos = goals.todos.filter(goal => goal.completedDate === today);
	const completedGoalIds = [...completedHabits.map(goal => `habit:${goal.id}`), ...completedTodos.map(goal => `todo:${goal.id}`)];
	const unharvestedGoalIds = completedGoalIds.filter(id => !focus.isGoalHarvested(today, id));
	const focusGoal = openTodos.find(goal => goal.id === selectedFocusGoal) ?? openTodos[0] ?? null;
	const stageImage = dragon.dragonState === 'dead' ? images.grave : images.stages[dragon.currentStage.name];
	const furyPercent = Math.min(100, (fury.furyMeter / Math.max(1, fury.maxFury)) * 100);
	const morningComplete = survey.lastMorningSurveyDate === today && survey.morningSurveyCompleted;
	const nightComplete = survey.lastNightSurveyDate === today && survey.nightSurveyCompleted;

	useEffect(() => {
		if (!timerRunning) return;
		const timer = setInterval(() => {
			setSecondsLeft(current => {
				if (current <= 1) {
					setTimerRunning(false);
					return 0;
				}
				return current - 1;
			});
		}, 1000);
		return () => clearInterval(timer);
	}, [timerRunning]);

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(pulse, { toValue: 1.035, duration: 1400, useNativeDriver: true }),
				Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
			]),
		).start();
	}, [pulse]);

	const addGoal = () => {
		const title = draftTitle.trim();
		if (!title) return;
		if (draftType === 'habit') {
			goals.addHabit({ title, category: draftCategory, importance: draftImportance });
		} else {
			goals.addTodo({ title, category: draftCategory, importance: draftImportance, dueDate: draftDueDate || today });
		}
		setDraftTitle('');
	};

	const harvestRewards = () => {
		if (unharvestedGoalIds.length === 0) return;
		const energy = unharvestedGoalIds.length * 20;
		const shardReward = Math.floor(unharvestedGoalIds.length / 3);
		coins.addCoins(energy);
		if (shardReward > 0) shards.addShards(shardReward);
		fury.decrementFuryFromCompletedGoals(unharvestedGoalIds.length);
		focus.markGoalsHarvested(today, unharvestedGoalIds);
		journal.addEntry({
			id: `harvest-${today}-${Date.now()}`,
			date: today,
			surveyType: 'night',
			goalsCompleted: unharvestedGoalIds.length,
			rewards: { coins: energy, fireXp: energy * 10, fury: -2 * unharvestedGoalIds.length, shards: shardReward },
			text: 'Harvest rewards claimed from completed directives.',
		});
		Alert.alert('Harvest Complete', `Gained ${energy} energy${shardReward ? ` and ${shardReward} crimson shards` : ''}.`);
	};

	const startFocus = (goalId?: string) => {
		if (goalId) setSelectedFocusGoal(goalId);
		const nextSeconds = Math.max(1, Number.parseInt(minutes || '25', 10)) * 60;
		setSecondsLeft(nextSeconds);
		setTimerRunning(true);
		setTab('pomodoro');
	};

	const formatTimer = (seconds: number) => {
		const minutesPart = Math.floor(seconds / 60).toString().padStart(2, '0');
		const secondsPart = Math.floor(seconds % 60).toString().padStart(2, '0');
		return `${minutesPart}:${secondsPart}`;
	};

	const renderNexus = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<View style={styles.statGrid}>
				<StatTile label="Dragon Stage" value={dragon.currentStage.name} />
				<StatTile label="Age" value={`${formatAbbreviatedNumber(dragon.age)} days`} />
				<StatTile label="Health" value={`${formatDecimalNumber(dragon.hp)} / ${formatDecimalNumber(dragon.maxHP)}`} />
				<StatTile label="Fury" value={`${formatAbbreviatedNumber(fury.furyMeter)} / ${formatAbbreviatedNumber(fury.maxFury)}`} accent={theme.colors.warning} />
			</View>

			<View style={styles.dragonWrap}>
				<Pressable
					onPress={() => {
						if (dragon.dragonState === 'unspawned') dragon.spawnDragon();
						else {
							coins.addCoins(1);
							setDragonQuote(getDragonQuote());
						}
					}}>
					<Animated.View style={{ transform: [{ scale: pulse }] }}>
						<Image source={stageImage} style={[styles.dragonImage, dragon.dragonState === 'dead' && styles.deadDragon]} />
					</Animated.View>
				</Pressable>
				<Text style={styles.dragonName}>{dragon.dragonName}</Text>
				<ProgressBar progress={furyPercent} outerStyle={styles.furyBar} innerStyle={styles.furyFill} />
				<Text style={styles.quoteText}>{dragonQuote}</Text>
				<View style={styles.actionRow}>
					{dragon.dragonState === 'unspawned' ? <ActionButton label="Spawn Dragon" onPress={dragon.spawnDragon} /> : null}
					{dragon.dragonState === 'dead' ? <ActionButton label="Revive Dragon" onPress={dragon.revive} /> : null}
					<ActionButton label="Check In" onPress={() => router.push('/surveyMorning')} variant={morningComplete ? 'secondary' : 'primary'} />
					<ActionButton label="Check Out" onPress={() => router.push('/surveyNight')} variant={nightComplete ? 'secondary' : 'primary'} />
				</View>
			</View>

			<Panel>
				<Text style={styles.sectionTitle}>Hatchery Buffer</Text>
				<BufferRow icon="assignment" label="Check-in / Check-out" value={`${morningComplete ? 'Done' : 'Open'} / ${nightComplete ? 'Done' : 'Open'}`} />
				<BufferRow icon="pending-actions" label="Incomplete directives" value={`${activeHabits.length + openTodos.length} active`} onPress={() => setTab('incomplete')} />
				<BufferRow icon="task-alt" label="Completed directives" value={`${completedGoalIds.length} in last 24h`} onPress={() => setTab('completed')} />
				<BufferRow icon="timer" label="Pomodoro cave" value={timerRunning ? 'Active' : 'Ready'} onPress={() => setTab('pomodoro')} />
			</Panel>
		</ScrollView>
	);

	const renderIncomplete = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<Panel>
				<Text style={styles.sectionTitle}>Directive Editor</Text>
				<View style={styles.switchRow}>
					<ActionButton label="To-Do" variant={draftType === 'todo' ? 'primary' : 'secondary'} onPress={() => setDraftType('todo')} />
					<ActionButton label="Habit" variant={draftType === 'habit' ? 'primary' : 'secondary'} onPress={() => setDraftType('habit')} />
				</View>
				<TextInput value={draftTitle} onChangeText={setDraftTitle} placeholder="Directive title" placeholderTextColor={theme.colors.secondaryText} style={styles.input} />
				<View style={styles.formRow}>
					<TextInput value={draftCategory} onChangeText={setDraftCategory} placeholder="Category" placeholderTextColor={theme.colors.secondaryText} style={[styles.input, styles.flexInput]} />
					<TextInput value={draftDueDate} onChangeText={setDraftDueDate} placeholder="YYYY-MM-DD" placeholderTextColor={theme.colors.secondaryText} style={[styles.input, styles.flexInput]} editable={draftType === 'todo'} />
				</View>
				<View style={styles.switchRow}>
					{(['default', 'medium', 'high'] as TodoGoal['importance'][]).map(level => (
						<ActionButton key={level} label={level} variant={draftImportance === level ? 'primary' : 'secondary'} onPress={() => setDraftImportance(level)} />
					))}
				</View>
				<ActionButton label="Add Directive" onPress={addGoal} disabled={!draftTitle.trim()} />
			</Panel>

			<Text style={styles.listHeader}>Habit Goals Due Today</Text>
			{activeHabits.length === 0 ? <EmptyState title="No open habits" body="Habit directives completed today or none created yet." /> : activeHabits.map(goal => <HabitDirective key={goal.id} goal={goal} />)}

			<Text style={styles.listHeader}>To-Do Goals Due Today</Text>
			{dueTodayTodos.length === 0 ? <EmptyState title="No due to-dos" body="Create a directive above or pull one forward from future goals." /> : dueTodayTodos.map(goal => <TodoDirective key={goal.id} goal={goal} onTimer={() => startFocus(goal.id)} />)}

			<Text style={styles.listHeader}>Future Goals</Text>
			{futureTodos.length === 0 ? <EmptyState title="No future to-dos" body="Future directives will appear here once they have a later due date." /> : futureTodos.map(goal => <TodoDirective key={goal.id} goal={goal} onTimer={() => startFocus(goal.id)} />)}
		</ScrollView>
	);

	const renderCompleted = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<Panel>
				<Text style={styles.sectionTitle}>Harvest Rewards</Text>
				<Text style={styles.bodyText}>{unharvestedGoalIds.length} completed directives are ready to harvest. Rewards auto-save and are tracked by date for future account sync.</Text>
				<View style={styles.actionRow}>
					<ActionButton label="Harvest Rewards" onPress={harvestRewards} disabled={unharvestedGoalIds.length === 0} />
					<ActionButton label="Check Out Survey" variant="secondary" onPress={() => router.push('/surveyNight')} />
				</View>
			</Panel>
			{completedGoalIds.length === 0 ? <EmptyState title="Nothing completed yet" body="Completed goals from the last 24 hours will appear here for review and harvesting." /> : null}
			{completedHabits.map(goal => <CompletedDirective key={`habit-${goal.id}`} label={goal.title} type="Habit" harvested={focus.isGoalHarvested(today, `habit:${goal.id}`)} />)}
			{completedTodos.map(goal => <CompletedDirective key={`todo-${goal.id}`} label={goal.title} type="To-Do" harvested={focus.isGoalHarvested(today, `todo:${goal.id}`)} />)}
		</ScrollView>
	);

	const renderPomodoro = () => (
		<ScrollView contentContainerStyle={styles.content}>
			<Panel style={styles.timerPanel}>
				<Text style={styles.sectionTitle}>Pomodoro Cave</Text>
				<Text style={styles.bodyText}>{focusGoal ? focusGoal.title : 'Choose or create a to-do directive to bind a focus session.'}</Text>
				<Text style={styles.timerText}>{formatTimer(secondsLeft)}</Text>
				<TextInput value={minutes} onChangeText={text => setMinutes(text.replace(/[^0-9]/g, '').slice(0, 3))} keyboardType="number-pad" style={styles.minuteInput} placeholder="25" placeholderTextColor={theme.colors.secondaryText} />
				<View style={styles.actionRow}>
					<ActionButton label={timerRunning ? 'Pause' : 'Start'} onPress={() => (timerRunning ? setTimerRunning(false) : startFocus(focusGoal?.id))} disabled={!focusGoal && !selectedFocusGoal} />
					<ActionButton label="Reset" variant="secondary" onPress={() => {
						setTimerRunning(false);
						setSecondsLeft(Math.max(1, Number.parseInt(minutes || '25', 10)) * 60);
					}} />
					<ActionButton label="Complete Goal" variant="secondary" onPress={() => focusGoal && goals.completeTodo(focusGoal.id)} disabled={!focusGoal} />
				</View>
			</Panel>
			<Text style={styles.listHeader}>Focus Queue</Text>
			{openTodos.map(goal => (
				<Pressable key={goal.id} style={[styles.directive, selectedFocusGoal === goal.id && styles.selectedDirective]} onPress={() => setSelectedFocusGoal(goal.id)}>
					<Text style={styles.directiveTitle}>{goal.title}</Text>
					<Text style={styles.directiveMeta}>{goal.dueDate ? `Due ${goal.dueDate}` : 'No due date'}</Text>
				</Pressable>
			))}
		</ScrollView>
	);

	return (
		<View style={styles.container}>
			<TopHeader isHomePage />
			<SectionTabs tabs={HATCHERY_TABS} active={tab} onChange={setTab} />
			{tab === 'nexus' ? renderNexus() : null}
			{tab === 'incomplete' ? renderIncomplete() : null}
			{tab === 'completed' ? renderCompleted() : null}
			{tab === 'pomodoro' ? renderPomodoro() : null}
		</View>
	);
}

function HabitDirective({ goal }: { goal: HabitGoal }) {
	const goals = useGoals();
	return (
		<DirectiveShell title={goal.title} meta={`Habit | ${goal.category ?? 'Uncategorized'} | streak ${goal.streak}`}>
			<ActionButton label="Complete" onPress={() => goals.completeHabitToday(goal.id)} />
			<ActionButton label="Delete" variant="secondary" onPress={() => goals.deleteHabit(goal.id)} />
		</DirectiveShell>
	);
}

function TodoDirective({ goal, onTimer }: { goal: TodoGoal; onTimer: () => void }) {
	const goals = useGoals();
	return (
		<DirectiveShell title={goal.title} meta={`To-Do | ${goal.category ?? 'Uncategorized'} | ${goal.dueDate ? `due ${goal.dueDate}` : 'no due date'}`}>
			<ActionButton label="Complete" onPress={() => goals.completeTodo(goal.id)} />
			<ActionButton label="Timer" variant="secondary" onPress={onTimer} />
			<ActionButton label="Late" variant="secondary" onPress={() => goals.failTodo(goal.id, true)} />
		</DirectiveShell>
	);
}

function CompletedDirective({ label, type, harvested }: { label: string; type: string; harvested: boolean }) {
	return <DirectiveShell title={label} meta={`${type} | ${harvested ? 'Harvested' : 'Ready to harvest'}`} />;
}

function DirectiveShell({ title, meta, children }: { title: string; meta: string; children?: React.ReactNode }) {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<View style={styles.directive}>
			<View style={styles.directiveText}>
				<Text style={styles.directiveTitle}>{title}</Text>
				<Text style={styles.directiveMeta}>{meta}</Text>
			</View>
			{children ? <View style={styles.directiveActions}>{children}</View> : null}
		</View>
	);
}

function BufferRow({ icon, label, value, onPress }: { icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string; value: string; onPress?: () => void }) {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	const Wrapper = onPress ? Pressable : View;
	return (
		<Wrapper style={styles.bufferRow} onPress={onPress as never}>
			<MaterialIcons name={icon} size={18} color={theme.colors.headerText} />
			<Text style={styles.bufferLabel}>{label}</Text>
			<Text style={styles.bufferValue}>{value}</Text>
		</Wrapper>
	);
}

const getDragonQuote = () => {
	const quotes = [
		'Small completions compound into frightening power.',
		'Focus is not obedience. It is leverage.',
		'The world survives another hour when a promise is kept.',
		'Do the next directive. The secrets can wait.',
		'Energy listens to finished work.',
	];
	return quotes[Math.floor(Math.random() * quotes.length)];
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
	StyleSheet.create({
		container: { flex: 1, backgroundColor: colors.background },
		content: { padding: 14, paddingBottom: 36 },
		statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
		dragonWrap: { alignItems: 'center', paddingVertical: 10 },
		dragonImage: { width: 220, height: 220, resizeMode: 'contain' },
		deadDragon: { opacity: 0.68 },
		dragonName: { color: colors.titleText, fontSize: 24, fontWeight: '900', textAlign: 'center' },
		furyBar: { width: '100%', maxWidth: 360, height: 10, borderRadius: 999, backgroundColor: colors.tertiaryBackground, marginTop: 10 },
		furyFill: { backgroundColor: colors.warning },
		quoteText: { color: colors.secondaryText, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 10, marginBottom: 12 },
		actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 10 },
		sectionTitle: { color: colors.headerText, fontSize: 18, fontWeight: '900', marginBottom: 8 },
		bodyText: { color: colors.text, fontSize: 13, lineHeight: 20 },
		bufferRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 10 },
		bufferLabel: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '800' },
		bufferValue: { color: colors.secondaryText, fontSize: 12, fontWeight: '700' },
		switchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
		input: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontWeight: '700' },
		formRow: { flexDirection: 'row', gap: 8 },
		flexInput: { flex: 1 },
		listHeader: { color: colors.titleText, fontSize: 16, fontWeight: '900', marginTop: 10, marginBottom: 8 },
		directive: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground, padding: 12, marginBottom: 8 },
		selectedDirective: { borderColor: colors.success, backgroundColor: colors.tertiaryBackground },
		directiveText: { marginBottom: 10 },
		directiveTitle: { color: colors.titleText, fontSize: 15, fontWeight: '900' },
		directiveMeta: { color: colors.secondaryText, fontSize: 12, marginTop: 3 },
		directiveActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
		timerPanel: { alignItems: 'center' },
		timerText: { color: colors.titleText, fontSize: 58, fontWeight: '900', marginTop: 12 },
		minuteInput: { width: 96, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text, textAlign: 'center', paddingVertical: 10, marginTop: 8, fontWeight: '900' },
	});
