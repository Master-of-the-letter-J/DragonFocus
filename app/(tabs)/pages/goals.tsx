import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useGoals, type TodoGoal } from '@/context/GoalsProvider';
import { useTheme } from '@/context/ThemeProvider';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import HabitGoalsPage from '../../(journal)/habitGoals';
import TodoGoalsPage from '../../(journal)/todoGoals';

type GoalsTab = 'habits' | 'todos' | 'focus';

const formatTimer = (seconds: number) => {
	const safeSeconds = Math.max(0, seconds);
	const minutes = Math.floor(safeSeconds / 60);
	const remainder = safeSeconds % 60;
	return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
};

export default function GoalsPage() {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	const [tab, setTab] = useState<GoalsTab>('todos');

	const render = () => {
		if (tab === 'habits') return <HabitGoalsPage />;
		if (tab === 'focus') return <FocusMode />;
		return <TodoGoalsPage />;
	};

	return (
		<View style={styles.container}>
			<TopHeader isHomePage={false} />
			<View style={styles.topTabs}>
				<GoalsTabButton label="Habits" selected={tab === 'habits'} onPress={() => setTab('habits')} />
				<GoalsTabButton label="To-Dos" selected={tab === 'todos'} onPress={() => setTab('todos')} />
				<GoalsTabButton label="Focus" selected={tab === 'focus'} onPress={() => setTab('focus')} />
			</View>
			<View style={styles.content}>{render()}</View>
		</View>
	);
}

function GoalsTabButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<Pressable style={[styles.tabBtn, selected && styles.tabActive]} onPress={onPress}>
			<Text style={[styles.tabText, selected && styles.tabTextActive]}>{label}</Text>
		</Pressable>
	);
}

function FocusMode() {
	const goals = useGoals();
	const theme = useTheme();
	const styles = useMemo(() => createStyles(theme.colors), [theme.colors]);
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);
	const openTodos = useMemo(
		() => goals.todos.filter(todo => todo.title.trim() && todo.completedDate !== today && !todo.failed).sort(sortTodosForFocus),
		[goals.todos, today],
	);
	const [selectedTodoId, setSelectedTodoId] = useState<string | null>(openTodos[0]?.id ?? null);
	const [durationMinutes, setDurationMinutes] = useState('25');
	const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
	const [isRunning, setIsRunning] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);
	const selectedTodo = openTodos.find(todo => todo.id === selectedTodoId) ?? openTodos[0] ?? null;

	useEffect(() => {
		if (!selectedTodo && selectedTodoId) {
			setSelectedTodoId(openTodos[0]?.id ?? null);
		}
	}, [openTodos, selectedTodo, selectedTodoId]);

	useEffect(() => {
		if (isRunning) return;
		if (hasStarted) return;
		setRemainingSeconds(getDurationSeconds(durationMinutes));
	}, [durationMinutes, hasStarted, isRunning]);

	useEffect(() => {
		if (!isRunning) return;
		const timerId = setInterval(() => {
			setRemainingSeconds(current => {
				if (current <= 1) {
					setIsRunning(false);
					return 0;
				}
				return current - 1;
			});
		}, 1000);
		return () => clearInterval(timerId);
	}, [isRunning]);

	const startTimer = () => {
		if (!selectedTodo) {
			Alert.alert('Choose a To-Do', 'Add or select a to-do before starting focus mode.');
			return;
		}
		const seconds = hasStarted ? remainingSeconds : getDurationSeconds(durationMinutes);
		if (seconds <= 0) {
			Alert.alert('Set a Timer', 'Use at least one minute for focus mode.');
			return;
		}
		setRemainingSeconds(seconds);
		setHasStarted(true);
		setIsRunning(true);
	};

	const resetTimer = () => {
		setIsRunning(false);
		setHasStarted(false);
		setRemainingSeconds(getDurationSeconds(durationMinutes));
	};

	const completeSelectedTodo = () => {
		if (!selectedTodo) return;
		goals.completeTodo(selectedTodo.id);
		setIsRunning(false);
		setHasStarted(false);
		Alert.alert('To-Do Complete', 'Nice. You can submit to-do rewards from the To-Dos tab when ready.');
	};

	return (
		<ScrollView style={styles.focusScroll} contentContainerStyle={styles.focusContent}>
			<View style={styles.focusPanel}>
				<Text style={styles.focusTitle}>Focus Mode</Text>
				<Text style={styles.focusSubtitle}>{selectedTodo ? selectedTodo.title : 'No open to-dos available'}</Text>
				<Text style={styles.timerText}>{formatTimer(remainingSeconds)}</Text>

				<View style={styles.durationRow}>
					{['15', '25', '45'].map(minutes => (
						<Pressable
							key={minutes}
							style={[styles.durationButton, durationMinutes === minutes && styles.durationButtonActive]}
							onPress={() => {
								setDurationMinutes(minutes);
								setHasStarted(false);
								setIsRunning(false);
								setRemainingSeconds(Number(minutes) * 60);
							}}>
							<Text style={[styles.durationText, durationMinutes === minutes && styles.durationTextActive]}>{minutes}m</Text>
						</Pressable>
					))}
					<TextInput
						value={durationMinutes}
						onChangeText={text => setDurationMinutes(text.replace(/[^0-9]/g, '').slice(0, 3))}
						keyboardType="number-pad"
						style={styles.durationInput}
						placeholder="min"
						placeholderTextColor={theme.colors.secondaryText}
					/>
				</View>

				<View style={styles.focusActions}>
					<Pressable style={[styles.primaryButton, !selectedTodo && styles.disabledButton]} onPress={isRunning ? () => setIsRunning(false) : startTimer} disabled={!selectedTodo}>
						<Text style={styles.primaryButtonText}>{isRunning ? 'Pause' : hasStarted ? 'Resume' : 'Start'}</Text>
					</Pressable>
					<Pressable style={styles.secondaryButton} onPress={resetTimer}>
						<Text style={styles.secondaryButtonText}>Reset</Text>
					</Pressable>
					<Pressable style={[styles.secondaryButton, !selectedTodo && styles.disabledButton]} onPress={completeSelectedTodo} disabled={!selectedTodo}>
						<Text style={styles.secondaryButtonText}>Done</Text>
					</Pressable>
				</View>
			</View>

			<Text style={styles.listTitle}>Choose To-Do</Text>
			{openTodos.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyText}>No open to-dos yet. Add one in the To-Dos tab.</Text>
				</View>
			) : (
				openTodos.map(todo => (
					<Pressable key={todo.id} style={[styles.todoChoice, selectedTodo?.id === todo.id && styles.todoChoiceActive]} onPress={() => setSelectedTodoId(todo.id)}>
						<View style={styles.todoChoiceText}>
							<Text style={styles.todoTitle}>{todo.title}</Text>
							<Text style={styles.todoMeta}>{todo.dueDate ? `Due ${todo.dueDate}` : 'No due date'}</Text>
						</View>
						<Text style={styles.todoSelectText}>{selectedTodo?.id === todo.id ? 'Selected' : 'Select'}</Text>
					</Pressable>
				))
			)}
		</ScrollView>
	);
}

const getDurationSeconds = (durationMinutes: string) => {
	const minutes = Number.parseInt(durationMinutes, 10);
	if (!Number.isFinite(minutes)) return 0;
	return Math.max(0, minutes) * 60;
};

const sortTodosForFocus = (a: TodoGoal, b: TodoGoal) => {
	if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
	if (a.dueDate && !b.dueDate) return -1;
	if (!a.dueDate && b.dueDate) return 1;
	return a.createdAt - b.createdAt;
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.background },
	topTabs: { flexDirection: 'row', gap: 8, padding: 10, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
	tabBtn: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground, alignItems: 'center', paddingVertical: 10 },
	tabActive: { borderColor: colors.success, backgroundColor: colors.tertiaryBackground },
	tabText: { color: colors.secondaryText, fontWeight: '800', fontSize: 13 },
	tabTextActive: { color: colors.headerText },
	content: { flex: 1, backgroundColor: colors.background },
	focusScroll: { flex: 1, backgroundColor: colors.background },
	focusContent: { padding: 16, paddingBottom: 28 },
	focusPanel: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground, padding: 16, alignItems: 'center' },
	focusTitle: { color: colors.headerText, fontSize: 20, fontWeight: '900' },
	focusSubtitle: { color: colors.secondaryText, fontSize: 14, textAlign: 'center', marginTop: 8, minHeight: 20 },
	timerText: { color: colors.titleText, fontSize: 52, fontWeight: '900', marginVertical: 16 },
	durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', backgroundColor: 'transparent' },
	durationButton: { minWidth: 58, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingVertical: 9, alignItems: 'center' },
	durationButtonActive: { borderColor: colors.success, backgroundColor: colors.tertiaryBackground },
	durationText: { color: colors.secondaryText, fontWeight: '800' },
	durationTextActive: { color: colors.headerText },
	durationInput: { width: 70, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text, textAlign: 'center', paddingVertical: 8, paddingHorizontal: 10, fontWeight: '800' },
	focusActions: { flexDirection: 'row', gap: 8, marginTop: 16, backgroundColor: 'transparent' },
	primaryButton: { flex: 1, backgroundColor: colors.success, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
	primaryButtonText: { color: colors.buttonText, fontWeight: '900' },
	secondaryButton: { flex: 1, backgroundColor: colors.secondaryButton, borderRadius: 8, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
	secondaryButtonText: { color: colors.secondaryButtonText, fontWeight: '900' },
	disabledButton: { opacity: 0.55 },
	listTitle: { color: colors.headerText, fontSize: 16, fontWeight: '900', marginTop: 18, marginBottom: 10 },
	emptyState: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground, padding: 14 },
	emptyText: { color: colors.secondaryText },
	todoChoice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.secondaryBackground, padding: 12, marginBottom: 8 },
	todoChoiceActive: { borderColor: colors.success, backgroundColor: colors.tertiaryBackground },
	todoChoiceText: { flex: 1, minWidth: 0, backgroundColor: 'transparent' },
	todoTitle: { color: colors.titleText, fontSize: 14, fontWeight: '800' },
	todoMeta: { color: colors.secondaryText, fontSize: 12, marginTop: 3 },
	todoSelectText: { color: colors.info, fontSize: 12, fontWeight: '900' },
});
