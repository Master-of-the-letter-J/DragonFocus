import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { HabitEditor, TodoEditor } from '@/components/goalEditor';
import { ADVICE, PROMPTS, QUOTES } from '@/constants/prompts';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals, type HabitGoal, type TodoGoal } from '@/context/GoalsProvider';
import { useItems } from '@/context/ItemsProvider';
import { useJournal } from '@/context/JournalProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface SurveyAnswers {
	[key: string]: any;
}

const moodOptions = [
	{ emoji: '😭', label: 'Devastated', fury: +10 },
	{ emoji: '😢', label: 'Sad', fury: +6 },
	{ emoji: '😟', label: 'Worried', fury: +3 },
	{ emoji: '😕', label: 'Confused', fury: +1 },
	{ emoji: '😐', label: 'Neutral', fury: 0 },
	{ emoji: '🙂', label: 'Okay', fury: -1 },
	{ emoji: '😊', label: 'Content', fury: -3 },
	{ emoji: '😃', label: 'Happy', fury: -5 },
	{ emoji: '😁', label: 'Cheerful', fury: -7 },
	{ emoji: '🤩', label: 'Excited', fury: -8 },
	{ emoji: '😤', label: 'Frustrated', fury: +5 },
	{ emoji: '😡', label: 'Angry', fury: +9 },
];

export default function SurveyMorningPage() {
	const survey = useSurvey();
	const coins = useDragonCoins();
	const shards = useShards();
	const dragon = useDragon();
	const scarLevel = useScarLevel();
	const fury = useFury();
	const streakCtx = useStreak();
	const items = useItems();
	const premium = usePremium();
	const goals = useGoals();
	const journal = useJournal();
	const router = useRouter();

	const [currentSection, setCurrentSection] = useState(0);
	const [answers, setAnswers] = useState<SurveyAnswers>({});
	const [journalText, setJournalText] = useState('');
	const [randomAdviceIndex, setRandomAdviceIndex] = useState<number | null>(null);
	const [randomPromptIndex, setRandomPromptIndex] = useState<number | null>(null);
	const [randomQuoteIndex, setRandomQuoteIndex] = useState<number | null>(null);
	const [showSurveyLabel, setShowSurveyLabel] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState<any>(null);
	const slideAnim = useRef(new Animated.Value(-100)).current;

	const [localHabits, setLocalHabits] = useState<HabitGoal[]>([]);
	const [localTodos, setLocalTodos] = useState<TodoGoal[]>([]);

	const [editingHabit, setEditingHabit] = useState<HabitGoal | null>(null);
	const [editingTodo, setEditingTodo] = useState<TodoGoal | null>(null);

	const sections = [
		{ key: 'advice', label: 'Advice' },
		{ key: 'mood', label: 'Mood' },
		{ key: 'dayGoals', label: 'Day Goals' },
		{ key: 'todoGoals', label: 'To-Do Goals' },
		{ key: 'prompt', label: 'Prompt' },
		{ key: 'journal', label: 'Journal' },
		{ key: 'quote', label: 'Quote' },
	];

	const totalSections = sections.length;

	useEffect(() => {
		setLocalHabits(goals.habits);
	}, [goals.habits]);

	useEffect(() => {
		setLocalTodos(goals.todos);
	}, [goals.todos]);

	useEffect(() => {
		if (showSurveyLabel) {
			Animated.sequence([
				Animated.timing(slideAnim, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.delay(1400),
				Animated.timing(slideAnim, {
					toValue: -100,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start(() => setShowSurveyLabel(false));
		}
	}, [showSurveyLabel]);

	useEffect(() => {
		const saved = survey.loadProgress('morning');
		const todayStr = new Date().toISOString().split('T')[0];

		if (saved && saved.savedAt === todayStr) {
			if (saved.answers) setAnswers(saved.answers);
			if (saved.journalText) setJournalText(saved.journalText);
			if (typeof saved.section === 'number') setCurrentSection(saved.section);
			if (typeof saved.indices?.advice === 'number') setRandomAdviceIndex(saved.indices.advice);
			if (typeof saved.indices?.prompt === 'number') setRandomPromptIndex(saved.indices.prompt);
			if (typeof saved.indices?.quote === 'number') setRandomQuoteIndex(saved.indices.quote);
		}

		setShowSurveyLabel(true);

		if (ADVICE.length > 0 && randomAdviceIndex === null) setRandomAdviceIndex(Math.floor(Math.random() * ADVICE.length));
		if (PROMPTS.length > 0 && randomPromptIndex === null) setRandomPromptIndex(Math.floor(Math.random() * PROMPTS.length));
		if (QUOTES.length > 0 && scarLevel.currentScarLevel >= 1 && randomQuoteIndex === null) setRandomQuoteIndex(Math.floor(Math.random() * QUOTES.length));
	}, []);

	const goNext = () => {
		if (currentSection === totalSections - 1) {
			submitSurvey();
		} else {
			setCurrentSection(currentSection + 1);
		}
	};

	const goBack = () => {
		if (currentSection > 0) {
			setCurrentSection(currentSection - 1);
		}
	};

	const handleExitSurvey = () => {
		const saveState = {
			savedAt: new Date().toISOString().split('T')[0],
			section: currentSection,
			answers: answers,
			journalText: journalText,
			indices: {
				advice: randomAdviceIndex,
				prompt: randomPromptIndex,
				quote: randomQuoteIndex,
			},
		};
		survey.saveProgress('morning', saveState);
		router.back();
	};

	const submitSurvey = () => {
		const today = new Date().toISOString().split('T')[0];
		let baseCoins = 10; // base morning coins
		let furyDelta = 0;

		const mood = answers.mood as number | undefined;
		const moodLabel = typeof mood === 'number' ? moodOptions[mood].label : '';
		if (typeof mood === 'number') furyDelta = moodOptions[mood].fury || 0;

		// Gather multiplier inputs
		const streakVal = streakCtx.getStreak ? streakCtx.getStreak() : streakCtx.streak ?? 0;
		const yangValue = fury.furyMeter;
		const dragonShardsCount = shards.shards ?? 0;
		const scar = scarLevel.currentScarLevel ?? 0;
		const snackMult = items.getActiveCoinMultiplier ? items.getActiveCoinMultiplier() : 1;
		const isPremiumFlag = premium.isPremium ?? false;

		// Calculate base morning coins using provider helper (applies multipliers)
		const morningCoins = coins.calculateSurveyCoins(true, streakVal, yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag);
		let totalCoinsEarned = morningCoins;

		// Award coins and shard, and fury
		coins.addCoins(morningCoins);
		shards.addShards(1);
		if (typeof fury.addFury === 'function') fury.addFury(furyDelta);

		// Prompt bonus: apply multiplier to the small base (2)
		if (answers.promptText && answers.promptText.trim()) {
			const extra = Math.floor(2 * coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag));
			coins.addCoins(extra);
			totalCoinsEarned += extra;
		}

		const fireXPFromCoins = coins.calculateFireXP(totalCoinsEarned);
		const bonusFireXP = dragon.age * 10;
		scarLevel.addXP?.(fireXPFromCoins + bonusFireXP);

		survey.completeMorningSurvey();

		// Add journal entry
		journal.addEntry({
			id: `morning-${today}-${Date.now()}`,
			date: today,
			surveyType: 'morning',
			goalsCompleted: localHabits.length,
			schedulePercent: 100,
			rewards: { coins: totalCoinsEarned, xp: fireXPFromCoins + bonusFireXP, fury: furyDelta },
			text: journalText,
			moodMorning: moodLabel,
		});

		setResults({
			coinsEarned: totalCoinsEarned,
			shardsEarned: 1,
			xpEarned: fireXPFromCoins + bonusFireXP,
			furyDelta,
		});
		setShowResults(true);
	};

	const renderHabitItem = ({ item, drag, isActive }: RenderItemParams<HabitGoal>) => {
		const h = item;
		return (
			<ScaleDecorator>
				<TouchableOpacity activeOpacity={0.95} disabled={isActive} style={[styles.habitRow, h.importance === 'Important+' ? styles.habitImportantPlus : h.importance === 'Important' ? styles.habitImportant : null, isActive && { backgroundColor: '#f0f9ff', borderColor: '#2196F3', elevation: 5 }]}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<View style={{ flex: 1 }}>
							<Text selectable={false} style={styles.habitTitle}>
								{h.title}
							</Text>
							<Text selectable={false} style={styles.habitMeta}>
								{h.category ? `${h.category}` : ''} • Streak: {h.streak}
							</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
							<Pressable style={[styles.miniButton, styles.miniEditButton]} onPress={() => setEditingHabit(h)}>
								<Text selectable={false} style={styles.miniButtonText}>
									✏️
								</Text>
							</Pressable>
							<Pressable onLongPress={drag} delayLongPress={150} style={{ padding: 6 }}>
								<Text style={{ fontSize: 20, color: '#ccc' }}>≡</Text>
							</Pressable>
						</View>
					</View>
				</TouchableOpacity>
			</ScaleDecorator>
		);
	};

	const renderTodoItem = ({ item, drag, isActive }: RenderItemParams<TodoGoal>) => {
		const t = item;
		return (
			<ScaleDecorator>
				<TouchableOpacity activeOpacity={0.95} disabled={isActive} style={[styles.todoItem, t.importance === 'Important+' ? styles.todoImportantPlus : t.importance === 'Important' ? styles.todoImportant : null, isActive && { backgroundColor: '#f0f9ff', borderColor: '#2196F3', elevation: 5 }]}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<View style={{ flex: 1 }}>
							<Text selectable={false} style={styles.habitTitle}>
								{t.title}
							</Text>
							<Text selectable={false} style={styles.habitMeta}>
								{t.importance} {t.category && `• ${t.category}`}
							</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
							<Pressable style={[styles.miniButton, styles.miniEditButton]} onPress={() => setEditingTodo(t)}>
								<Text selectable={false} style={styles.miniButtonText}>
									✏️
								</Text>
							</Pressable>
							<Pressable onLongPress={drag} delayLongPress={150} style={{ padding: 6 }}>
								<Text style={{ fontSize: 20, color: '#ccc' }}>≡</Text>
							</Pressable>
						</View>
					</View>
					{t.subGoals.length > 0 && (
						<View style={{ marginTop: 8 }}>
							{t.subGoals.map(sg => (
								<View key={sg.id} style={styles.subGoalRow}>
									<Text selectable={false} style={{ textDecorationLine: sg.completed ? 'line-through' : 'none' }}>
										• {sg.title}
									</Text>
								</View>
							))}
						</View>
					)}
				</TouchableOpacity>
			</ScaleDecorator>
		);
	};

	if (showResults && results) {
		return (
			<View style={styles.container}>
				<TopHeader isHomePage={false} />
				<View style={styles.content}>
					<Text style={styles.title}>🌅 Survey Complete!</Text>
					<View style={styles.resultsCard}>
						<Text style={styles.resultText}>💰 Coins Earned: +{results.coinsEarned}</Text>
						<Text style={styles.resultText}>💎 Shards Earned: +{results.shardsEarned}</Text>
						<Text style={styles.resultText}>✨ fireXP Earned: +{results.xpEarned}</Text>
						<Text style={styles.resultText}>
							😈 Fury: {results.furyDelta > 0 ? '+' : ''}
							{results.furyDelta}
						</Text>
					</View>
					<Pressable style={styles.finishButton} onPress={() => router.back()}>
						<Text style={styles.finishButtonText}>Return to Home</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	const section = sections[currentSection];

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<TopHeader isHomePage={false} />

				{editingHabit && (
					<Modal visible={!!editingHabit} transparent={true} animationType="slide">
						<View style={styles.modalOverlay}>
							<HabitEditor habit={editingHabit} onClose={() => setEditingHabit(null)} />
						</View>
					</Modal>
				)}

				{editingTodo && (
					<Modal visible={!!editingTodo} transparent={true} animationType="slide">
						<View style={styles.modalOverlay}>
							<TodoEditor todo={editingTodo} onClose={() => setEditingTodo(null)} />
						</View>
					</Modal>
				)}

				<Animated.View style={[styles.surveyLabelContainer, { transform: [{ translateY: slideAnim }] }]}>
					<Text style={styles.surveyLabelText}>🌅 Morning Survey</Text>
				</Animated.View>

				<View style={styles.progressContainer}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
						<View style={{ flex: 1 }}>
							<View style={styles.progressBar}>
								<View style={[styles.progressFill, { width: `${((currentSection + 1) / totalSections) * 100}%` }]} />
							</View>
							<Text style={styles.progressText}>
								Question {currentSection + 1} of {totalSections}
							</Text>
						</View>
						<Pressable onPress={handleExitSurvey} style={styles.closeButton}>
							<Text style={styles.closeButtonText}>✕</Text>
						</Pressable>
					</View>
				</View>

				<View style={styles.contentArea}>
					{section.key === 'dayGoals' && (
						<DraggableFlatList
							data={localHabits}
							onDragEnd={({ data }) => setLocalHabits(data)}
							nestedScrollEnabled={true}
							keyExtractor={item => item.id}
							renderItem={renderHabitItem}
							contentContainerStyle={styles.listContentContainer}
							ListHeaderComponent={
								<View>
									<Text style={styles.question}>Day / Habit Goals</Text>
									<Text style={{ marginBottom: 8 }}>Hold to drag and reorder your daily habits.</Text>
								</View>
							}
							ListFooterComponent={
								<View>
									<Pressable style={styles.smallButton} onPress={() => goals.addHabit({ title: 'New Habit' })}>
										<Text selectable={false} style={styles.smallButtonText}>
											+ Add Habit
										</Text>
									</Pressable>

									{goals.suggestedHabitGoals.length > 0 && (
										<>
											<Text style={[styles.label, { marginTop: 16, marginBottom: 8 }]}>Suggested Habits</Text>
											<ScrollView style={styles.suggestedScrollView} nestedScrollEnabled={true}>
												{goals.suggestedHabitGoals.map(s => (
													<Pressable
														key={s}
														style={styles.suggestedItem}
														onPress={() => {
															goals.addHabit({ title: s, daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
															goals.rerollSuggestedHabits();
														}}>
														<Text selectable={false}>+ {s}</Text>
													</Pressable>
												))}
											</ScrollView>
											<Pressable style={styles.rerollButton} onPress={() => goals.rerollSuggestedHabits()}>
												<Text selectable={false} style={styles.rerollButtonText}>
													🔄 Re-Roll Habit Suggestions
												</Text>
											</Pressable>
										</>
									)}
								</View>
							}
						/>
					)}

					{section.key === 'todoGoals' && (
						<DraggableFlatList
							data={localTodos}
							onDragEnd={({ data }) => setLocalTodos(data)}
							nestedScrollEnabled={true}
							keyExtractor={item => item.id}
							renderItem={renderTodoItem}
							contentContainerStyle={styles.listContentContainer}
							ListHeaderComponent={
								<View>
									<Text style={styles.question}>To-Do Goals</Text>
									<Text style={{ marginBottom: 8 }}>Hold to drag and reorder your to-dos.</Text>
								</View>
							}
							ListFooterComponent={
								<View>
									<Pressable style={styles.smallButton} onPress={() => goals.addTodo({ title: 'New To-Do' })}>
										<Text selectable={false} style={styles.smallButtonText}>
											+ Add To-Do
										</Text>
									</Pressable>
								</View>
							}
						/>
					)}

					{!['dayGoals', 'todoGoals'].includes(section.key) && (
						<ScrollView style={styles.surveyContent} contentContainerStyle={styles.surveyContentInner}>
							{section.key === 'advice' && (
								<View>
									<Text style={styles.question}>🐉 Dragon Inhales...</Text>
									{randomAdviceIndex !== null && ADVICE[randomAdviceIndex] ? (
										<>
											<Text style={styles.adviceText}>{ADVICE[randomAdviceIndex]}</Text>
											<Text style={styles.adviceLabel}>— Advice for today</Text>
										</>
									) : (
										<Text style={{ marginBottom: 12 }}>A piece of wisdom for your journey.</Text>
									)}
								</View>
							)}

							{section.key === 'mood' && (
								<View>
									<Text style={styles.question}>How are you feeling?</Text>
									<View style={styles.moodGrid}>
										{moodOptions.map((m, idx) => (
											<Pressable key={m.label} style={[styles.moodButton, answers.mood === idx && styles.moodSelected]} onPress={() => setAnswers({ ...answers, mood: idx })}>
												<Text selectable={false} style={styles.moodEmoji}>
													{m.emoji}
												</Text>
												<Text selectable={false} style={styles.moodLabel}>
													{m.label}
												</Text>
											</Pressable>
										))}
									</View>
								</View>
							)}

							{section.key === 'prompt' && (
								<View>
									<Text style={styles.question}>Random Prompt</Text>
									<Text selectable={false} style={{ marginBottom: 12, fontSize: 15, fontStyle: 'italic' }}>
										{randomPromptIndex !== null && PROMPTS[randomPromptIndex] ? PROMPTS[randomPromptIndex].text : 'Write a short response'}
									</Text>
									<TextInput value={answers.promptText || ''} onChangeText={t => setAnswers({ ...answers, promptText: t })} placeholder="Your response..." multiline style={styles.textInputArea} />
								</View>
							)}

							{section.key === 'journal' && (
								<View>
									<Text style={styles.question}>Journal Entry</Text>
									<TextInput value={journalText} onChangeText={setJournalText} placeholder="Write about your day..." multiline style={styles.textInputArea} />
								</View>
							)}

							{section.key === 'quote' && (
								<View>
									<Text style={styles.question}>🐉 Dragon Exhales...</Text>
									{randomQuoteIndex !== null && QUOTES[randomQuoteIndex] ? (
										<>
											<Text selectable={false} style={[styles.adviceText, { fontStyle: 'italic', marginBottom: 12 }]}>
												"{QUOTES[randomQuoteIndex]}"
											</Text>
											<Text selectable={false} style={styles.adviceLabel}>
												— Words of wisdom
											</Text>
										</>
									) : (
										<Text style={{ marginBottom: 12 }}>An inspiring thought for you.</Text>
									)}
								</View>
							)}
						</ScrollView>
					)}
				</View>

				<View style={styles.buttonContainer}>
					{currentSection > 0 && (
						<Pressable style={styles.buttonSmall} onPress={goBack}>
							<Text selectable={false} style={styles.buttonText}>
								Previous
							</Text>
						</Pressable>
					)}

					<Pressable style={styles.buttonNext} onPress={goNext}>
						<Text selectable={false} style={styles.buttonTextPrimary}>
							{currentSection === totalSections - 1 ? 'Submit' : 'Next'}
						</Text>
					</Pressable>
				</View>
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	content: { flex: 1, padding: 16 },
	contentArea: { flex: 1 },
	title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	progressContainer: { paddingHorizontal: 16, marginBottom: 8 },
	progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
	progressFill: { height: '100%', backgroundColor: '#4CAF50' },
	progressText: { fontSize: 12, textAlign: 'right' },
	closeButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
	closeButtonText: { fontSize: 28, fontWeight: '300', color: '#666' },
	surveyLabelContainer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
	surveyLabelText: { fontSize: 18, fontWeight: '700', color: '#333' },
	surveyContent: { flex: 1, paddingHorizontal: 16 },
	surveyContentInner: { paddingVertical: 20 },
	listContentContainer: { paddingHorizontal: 16, paddingVertical: 20 },
	question: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
	adviceText: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 8 },
	adviceLabel: { fontSize: 13, color: '#999', fontStyle: 'italic' },
	label: { fontSize: 14, fontWeight: '600', color: '#666' },
	textInputArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, minHeight: 100, fontSize: 16 },
	buttonContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
	buttonSmall: { flex: 1, paddingVertical: 12, backgroundColor: '#fafafa', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
	buttonNext: { flex: 1.5, paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center' },
	buttonText: { fontSize: 14, fontWeight: '600', color: '#666' },
	buttonTextPrimary: { fontSize: 14, fontWeight: '600', color: '#fff' },
	smallButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#eee', borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
	smallButtonText: { fontSize: 13, fontWeight: '600', color: '#333' },
	rerollButton: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#e3f2fd', borderRadius: 8, alignSelf: 'flex-start', marginTop: 12 },
	rerollButtonText: { fontSize: 13, fontWeight: '600', color: '#1976d2' },
	miniButton: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
	miniEditButton: { backgroundColor: '#2196F3' },
	miniButtonText: { fontSize: 14, color: '#fff' },
	moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
	moodButton: { width: '30%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginBottom: 8 },
	moodSelected: { borderColor: '#4CAF50', backgroundColor: '#eefaf0' },
	moodEmoji: { fontSize: 24, marginBottom: 6 },
	moodLabel: { fontSize: 12, textAlign: 'center' },
	habitRow: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8, backgroundColor: '#fff' },
	habitImportant: { borderColor: '#FFB74D', backgroundColor: '#FFF8E1' },
	habitImportantPlus: { borderColor: '#FF8A65', backgroundColor: '#FFF3E0' },
	habitTitle: { fontSize: 16, fontWeight: '600' },
	habitMeta: { fontSize: 12, color: '#666', marginTop: 4 },
	suggestedScrollView: { maxHeight: 150, borderRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
	suggestedItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
	todoItem: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8, backgroundColor: '#fff' },
	todoImportant: { borderColor: '#FFB74D', backgroundColor: '#FFF8E1' },
	todoImportantPlus: { borderColor: '#FF8A65', backgroundColor: '#FFF3E0' },
	subGoalRow: { paddingLeft: 12, paddingVertical: 6 },
	resultsCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 20, marginVertical: 16 },
	resultText: { fontSize: 16, fontWeight: '600', marginVertical: 8 },
	finishButton: { paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center', marginTop: 20 },
	finishButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
});
