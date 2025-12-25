import ProgressBar from '@/components/ProgressBar';
import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { HabitEditor, TodoEditor } from '@/components/goalEditor';
import { ADVICE, PROMPTS, QUOTES } from '@/constants/prompts';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals, type HabitGoal, type TodoGoal } from '@/context/GoalsProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

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
	const goals = useGoals();
	const router = useRouter();

	// Survey state
	const [currentSection, setCurrentSection] = useState(0);
	const [answers, setAnswers] = useState<SurveyAnswers>({});
	const [journalText, setJournalText] = useState('');
	const [randomAdviceIndex, setRandomAdviceIndex] = useState<number | null>(null);
	const [randomPromptIndex, setRandomPromptIndex] = useState<number | null>(null);
	const [randomQuoteIndex, setRandomQuoteIndex] = useState<number | null>(null);
	const [showSurveyLabel, setShowSurveyLabel] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState<any>(null);
	const slideAnim = React.useRef(new Animated.Value(-100)).current;

	// Goal editor modals
	const [editingHabit, setEditingHabit] = useState<HabitGoal | null>(null);
	const [editingTodo, setEditingTodo] = useState<TodoGoal | null>(null);

	// Sections
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

	// Survey label animation
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

	// Initialize survey on mount
	useEffect(() => {
		// Load saved progress if any
		const saved = survey.loadProgress('morning');
		const todayStr = new Date().toISOString().split('T')[0];
		if (saved && saved.savedAt === todayStr) {
			if (saved.answers) setAnswers(saved.answers);
			if (saved.journalText) setJournalText(saved.journalText);
			if (typeof saved.section === 'number') setCurrentSection(saved.section);
		}

		// Alert only if there is a reason (kept for backward compatibility)
		// allow retake with saved responses

		setShowSurveyLabel(true);

		// Pick random values
		if (ADVICE.length > 0) setRandomAdviceIndex(Math.floor(Math.random() * ADVICE.length));
		if (PROMPTS.length > 0) setRandomPromptIndex(Math.floor(Math.random() * PROMPTS.length));
		if (QUOTES.length > 0 && scarLevel.currentScarLevel >= 1) setRandomQuoteIndex(Math.floor(Math.random() * QUOTES.length));
	}, []);

	const goNext = () => {
		if (currentSection === totalSections - 1) {
			submitSurvey();
		} else {
			setCurrentSection(currentSection + 1);
		}
	};

	const handleSaveForLater = () => {
		const percent = Math.round(((currentSection + 1) / totalSections) * 100);
		survey.saveProgress('morning', { answers, journalText, section: currentSection, progressPercent: percent });
		Alert.alert('Survey Saved', 'Your progress has been saved. You can continue later.', [{ text: 'OK', onPress: () => router.back() }]);
	};

	const submitSurvey = () => {
		const today = new Date().toISOString().split('T')[0];
		const alreadyDoneToday = survey.lastMorningSurveyDate === today && survey.morningSurveyCompleted;
		let totalCoinsEarned = 0;
		let furyDelta = 0;

		// If this is the first completion today, give base rewards
		if (!alreadyDoneToday) totalCoinsEarned = 10; // base

		// Mood affects fury
		const mood = answers.mood as number | undefined;
		if (typeof mood === 'number') furyDelta = moodOptions[mood].fury || 0;

		if (!alreadyDoneToday) {
			coins.addCoins(totalCoinsEarned);
			shards.addShards(1);
			if (typeof fury.addFury === 'function') {
				fury.addFury(furyDelta);
			}
		}

		// Prompt reward
		if (answers.promptText && answers.promptText.trim() && !alreadyDoneToday) {
			coins.addCoins(2);
			totalCoinsEarned += 2;
		}

		const fireXPFromCoins = totalCoinsEarned * 10;
		const bonusFireXP = dragon.age * 10;
		if (!alreadyDoneToday) scarLevel.addXP?.(fireXPFromCoins + bonusFireXP);

		// Mark complete
		// mark complete (allow retake but record last date)
		survey.completeMorningSurvey();
		survey.clearProgress('morning');

		// Show results
		setResults({
			coinsEarned: totalCoinsEarned,
			shardsEarned: 1,
			xpEarned: fireXPFromCoins + bonusFireXP,
			furyDelta,
		});
		setShowResults(true);
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
						<Text style={styles.resultText}>✨ XP Earned: +{results.xpEarned}</Text>
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
		<View style={styles.container}>
			<TopHeader isHomePage={false} />

			{/* Goal editor modals */}
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

			{/* Survey Label Animation */}
			<Animated.View style={[styles.surveyLabelContainer, { transform: [{ translateY: slideAnim }] }]}>
				<Text style={styles.surveyLabelText}>🌅 Morning Survey</Text>
			</Animated.View>

			{/* Progress bar */}
			<View style={styles.progressContainer}>
				<ProgressBar progress={Math.round(((currentSection + 1) / totalSections) * 100)} outerStyle={{}} innerStyle={{}} />
				<Text style={styles.progressText}>
					{currentSection + 1}/{totalSections}
				</Text>
			</View>

			{/* Survey content */}
			<ScrollView style={styles.surveyContent} contentContainerStyle={styles.surveyContentInner}>
				<Text style={styles.surveyType}>🌅 Morning Survey</Text>

				{/* ADVICE */}
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

				{/* MOOD */}
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

				{/* DAY GOALS */}
				{section.key === 'dayGoals' && (
					<View>
						<Text style={styles.question}>Day / Habit Goals</Text>
						<Text style={{ marginBottom: 8 }}>Add or edit your daily habit goals.</Text>
						<ScrollView style={styles.goalsScrollView} nestedScrollEnabled={true}>
							{goals.habits
								.filter(h => h.title.trim())
								.map(h => (
									<View key={h.id} style={[styles.habitRow, h.importance === 'Important+' ? styles.habitImportantPlus : h.importance === 'Important' ? styles.habitImportant : null]}>
										<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
											<View style={{ flex: 1 }}>
												<Text selectable={false} style={styles.habitTitle}>
													{h.title}
												</Text>
												<Text selectable={false} style={styles.habitMeta}>
													{h.category ? `${h.category}` : ''} • Streak: {h.streak}
												</Text>
											</View>
											<Pressable style={[styles.miniButton, styles.miniEditButton]} onPress={() => setEditingHabit(h)}>
												<Text selectable={false} style={styles.miniButtonText}>
													✏️
												</Text>
											</Pressable>
										</View>
									</View>
								))}
						</ScrollView>
						<Pressable style={styles.smallButton} onPress={() => goals.addHabit({ title: 'New Habit' })}>
							<Text selectable={false} style={styles.smallButtonText}>
								+ Add Habit
							</Text>
						</Pressable>

						{/* Suggested goals with reroll */}
						{goals.suggestedGoals.length > 0 && (
							<>
								<Text style={[styles.label, { marginTop: 16, marginBottom: 8 }]}>Suggested Goals</Text>
								<ScrollView style={styles.suggestedScrollView} nestedScrollEnabled={true}>
									{goals.suggestedGoals.map(s => (
										<Pressable
											key={s}
											style={styles.suggestedItem}
											onPress={() => {
												goals.addHabit({ title: s, daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
												goals.rerollSuggested();
											}}>
											<Text selectable={false}>+ {s}</Text>
										</Pressable>
									))}
								</ScrollView>
								<Pressable style={styles.rerollButton} onPress={() => goals.rerollSuggested()}>
									<Text selectable={false} style={styles.rerollButtonText}>
										🔄 Re-Roll Suggestions
									</Text>
								</Pressable>
							</>
						)}
					</View>
				)}

				{/* TODO GOALS */}
				{section.key === 'todoGoals' && (
					<View>
						<Text style={styles.question}>To-Do Goals</Text>
						<Text style={{ marginBottom: 8 }}>Add or edit your to-do goals.</Text>
						<ScrollView style={styles.goalsScrollView} nestedScrollEnabled={true}>
							{goals.todos
								.filter(t => t.title.trim())
								.map(t => (
									<View key={t.id} style={[styles.todoItem, t.importance === 'Important+' ? styles.todoImportantPlus : t.importance === 'Important' ? styles.todoImportant : null]}>
										<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
											<View style={{ flex: 1 }}>
												<Text selectable={false} style={styles.habitTitle}>
													{t.title}
												</Text>
												<Text selectable={false} style={styles.habitMeta}>
													{t.importance} {t.category && `• ${t.category}`}
												</Text>
											</View>
											<Pressable style={[styles.miniButton, styles.miniEditButton]} onPress={() => setEditingTodo(t)}>
												<Text selectable={false} style={styles.miniButtonText}>
													✏️
												</Text>
											</Pressable>
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
									</View>
								))}
						</ScrollView>
						<Pressable style={styles.smallButton} onPress={() => goals.addTodo({ title: 'New To-Do' })}>
							<Text selectable={false} style={styles.smallButtonText}>
								+ Add To-Do
							</Text>
						</Pressable>
					</View>
				)}

				{/* PROMPT */}
				{section.key === 'prompt' && (
					<View>
						<Text style={styles.question}>Random Prompt</Text>
						<Text selectable={false} style={{ marginBottom: 12, fontSize: 15, fontStyle: 'italic' }}>
							{randomPromptIndex !== null && PROMPTS[randomPromptIndex] ? PROMPTS[randomPromptIndex].text : 'Write a short response'}
						</Text>
						<TextInput value={answers.promptText || ''} onChangeText={t => setAnswers({ ...answers, promptText: t })} placeholder="Your response..." multiline style={styles.textInputArea} />
					</View>
				)}

				{/* JOURNAL */}
				{section.key === 'journal' && (
					<View>
						<Text style={styles.question}>Journal Entry</Text>
						<TextInput value={journalText} onChangeText={setJournalText} placeholder="Write anything about your day..." multiline style={styles.textInputArea} />
					</View>
				)}

				{/* QUOTE */}
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
							<Text style={{ marginBottom: 12 }}>A inspiring thought for you.</Text>
						)}
					</View>
				)}
			</ScrollView>

			{/* Button controls */}
			<View style={styles.buttonContainer}>
				<Pressable style={styles.buttonSmall} onPress={handleSaveForLater}>
					<Text selectable={false} style={styles.buttonText}>
						Save for Later
					</Text>
				</Pressable>
				<Pressable style={styles.buttonNext} onPress={goNext}>
					<Text selectable={false} style={styles.buttonTextPrimary}>
						{currentSection === totalSections - 1 ? 'Submit' : 'Next'}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	content: { flex: 1, padding: 16 },
	title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	progressContainer: { paddingHorizontal: 16, marginBottom: 16 },
	progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
	progressFill: { height: '100%', backgroundColor: '#4CAF50' },
	progressText: { fontSize: 12, textAlign: 'right' },
	surveyLabelContainer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderColor: '#e0e0e0', alignItems: 'center' },
	surveyLabelText: { fontSize: 18, fontWeight: '700', color: '#333' },
	surveyContent: { flex: 1, paddingHorizontal: 16 },
	surveyContentInner: { paddingVertical: 20 },
	surveyType: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
	question: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
	adviceText: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 8 },
	adviceLabel: { fontSize: 13, color: '#999', fontStyle: 'italic' },
	label: { fontSize: 14, fontWeight: '600', color: '#666' },
	textInputArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, minHeight: 100, fontSize: 16 },
	buttonContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16 },
	buttonSmall: { flex: 1, paddingVertical: 12, backgroundColor: '#fafafa', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
	buttonNext: { flex: 1, paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center' },
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
	habitRow: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
	habitImportant: { borderColor: '#FFB74D', backgroundColor: '#FFF8E1' },
	habitImportantPlus: { borderColor: '#FF8A65', backgroundColor: '#FFF3E0' },
	habitTitle: { fontSize: 16, fontWeight: '600' },
	habitMeta: { fontSize: 12, color: '#666', marginTop: 4 },
	goalsScrollView: { maxHeight: 250, borderRadius: 8, marginVertical: 8 },
	suggestedScrollView: { maxHeight: 150, borderRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
	suggestedItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
	todoItem: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
	todoImportant: { borderColor: '#FFB74D', backgroundColor: '#FFF8E1' },
	todoImportantPlus: { borderColor: '#FF8A65', backgroundColor: '#FFF3E0' },
	subGoalRow: { paddingLeft: 12, paddingVertical: 6 },
	resultsCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 20, marginVertical: 16 },
	resultText: { fontSize: 16, fontWeight: '600', marginVertical: 8 },
	finishButton: { paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center', marginTop: 20 },
	finishButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
});
