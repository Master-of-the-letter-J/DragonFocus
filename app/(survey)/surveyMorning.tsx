import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { HabitEditor, TodoEditor } from '@/components/goalEditor';
import { ADVICE, PROMPTS, QUOTES, TRIVIA } from '@/constants/prompts';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals, type HabitGoal, type TodoGoal } from '@/context/GoalsProvider';
import { useItems } from '@/context/ItemsProvider';
import { useJournal } from '@/context/JournalProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useQuestions } from '@/context/QuestionProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface SurveyAnswers {
	[key: string]: any;
}

// default mood options used as fallback
const DEFAULT_MOOD_OPTIONS = [
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

// Challenge metadata
const CHALLENGE_OPTIONS = [
	{ days: 7, cost: 10, rewardCoins: 100, rewardShards: 10, costShards: 0 },
	{ days: 14, cost: 25, rewardCoins: 250, rewardShards: 25, costShards: 0 },
	{ days: 30, cost: 50, rewardCoins: 750, rewardShards: 60, costShards: 5 },
];

export default function SurveyMorningPage() {
	// --- 1. HOOKS & STATE (Restored from Original) ---
	const survey = useSurvey();
	const { questionSettings } = useQuestions();
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
	const [randomTriviaIndex, setRandomTriviaIndex] = useState<number | null>(null);
	const [triviaOptions, setTriviaOptions] = useState<{ answers: string[]; correctLocalIndex: number } | null>(null);
	const [showSurveyLabel, setShowSurveyLabel] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState<any>(null);
	const slideAnim = useRef(new Animated.Value(-100)).current;

	const [localHabits, setLocalHabits] = useState<HabitGoal[]>([]);
	const [localTodos, setLocalTodos] = useState<TodoGoal[]>([]);

	const [editingHabit, setEditingHabit] = useState<HabitGoal | null>(null);
	const [editingTodo, setEditingTodo] = useState<TodoGoal | null>(null);

	// intro modal at start (1s, full screen animation placeholder)
	const [showIntroModal, setShowIntroModal] = useState(true);

	// Selected challenge length while preparing to enable
	const [selectedChallengeDays, setSelectedChallengeDays] = useState<Record<string, number | null>>({});

	// --- 2. SECTIONS DEFINITION ---
	const baseSections = [
		{ key: 'advice', label: 'Advice' },
		{ key: 'mood', label: 'Mood' },
		{ key: 'dayGoals', label: 'Day Goals' },
		{ key: 'todoGoals', label: 'To-Do Goals' },
		{ key: 'prompt', label: 'Prompt' },
		{ key: 'journal', label: 'Journal' },
	];
	// Add trivia sections based on settings
	const triviaSections = Array(questionSettings.trivia?.morningCount || 0)
		.fill(null)
		.map((_, i) => ({
			key: `trivia${i}`,
			label: `Trivia ${i + 1}`,
		}));
	const sections = [...baseSections, ...triviaSections, { key: 'quote', label: 'Quote' }];

	const totalSections = sections.length;

	// --- 3. EFFECTS (Logic) ---
	useEffect(() => {
		// intro modal hides after 1 second (show animation here)
		const t = setTimeout(() => setShowIntroModal(false), 1000);
		return () => clearTimeout(t);
	}, []);

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
		const saved = survey.loadProgress?.('morning');
		const todayStr = new Date().toISOString().split('T')[0];

		if (saved && saved.savedAt === todayStr) {
			if (saved.answers) setAnswers(saved.answers);
			if (saved.journalText) setJournalText(saved.journalText);
			if (typeof saved.section === 'number') setCurrentSection(saved.section);
			if (typeof saved.indices?.advice === 'number') setRandomAdviceIndex(saved.indices.advice);
			if (typeof saved.indices?.prompt === 'number') setRandomPromptIndex(saved.indices.prompt);
			if (typeof saved.indices?.quote === 'number') setRandomQuoteIndex(saved.indices.quote);
			if (typeof saved.indices?.trivia === 'number') setRandomTriviaIndex(saved.indices.trivia);
			if (saved.triviaOptions) setTriviaOptions(saved.triviaOptions);
		}

		setShowSurveyLabel(true);

		if (ADVICE.length > 0 && randomAdviceIndex === null) setRandomAdviceIndex(Math.floor(Math.random() * ADVICE.length));

		// PROMPTS: pick from enabled categories
		const promptKey = (cat: string) => {
			switch (cat) {
				case 'Self-Discovery':
					return 'SelfDiscovery';
				case 'Reflection':
					return 'Reflection';
				case 'Gratitude':
					return 'Gratitude';
				case 'Fun & Creative':
					return 'FunCreative';
				case 'Mindfulness':
					return 'Mindfulness';
				case 'Productivity':
					return 'Productivity';
				case 'Relationships':
					return 'Relationships';
				default:
					return '';
			}
		};
		const enabledPrompts = PROMPTS.filter(p => {
			const k = promptKey(p.category as string) as keyof typeof questionSettings.prompts.types;
			return !!questionSettings.prompts.types[k];
		});
		if (enabledPrompts.length > 0 && randomPromptIndex === null) {
			const chosen = enabledPrompts[Math.floor(Math.random() * enabledPrompts.length)];
			const globalIndex = PROMPTS.findIndex(x => x === chosen);
			if (globalIndex >= 0) setRandomPromptIndex(globalIndex);
		}

		// TRIVIA: pick from enabled categories
		if ((questionSettings.trivia?.morningCount || 0) > 0) {
			const triviaMap: any = {
				'General Knowledge': 'GeneralKnowledge',
				'Pop Culture': 'PopCulture',
				History: 'History',
				Science: 'Science',
				Geography: 'Geography',
				Sports: 'Sports',
				'Literature / Arts': 'LiteratureArts',
				Food: 'Food',
			};
			const enabledTrivia = TRIVIA.filter(t => {
				const mappedKey = t.category in triviaMap ? triviaMap[t.category] : (t.category as any);
				return !!questionSettings.trivia?.types?.[mappedKey as keyof typeof questionSettings.trivia.types];
			});
			if (enabledTrivia.length > 0 && randomTriviaIndex === null) {
				const chosen = enabledTrivia[Math.floor(Math.random() * enabledTrivia.length)];
				const globalIndex = TRIVIA.findIndex(x => x === chosen);
				if (globalIndex >= 0) setRandomTriviaIndex(globalIndex);
			}
		}

		if (QUOTES.length > 0 && scarLevel.currentScarLevel >= 1 && randomQuoteIndex === null) setRandomQuoteIndex(Math.floor(Math.random() * QUOTES.length));

		// Seed default goals if none exist yet
		if ((goals.habits ?? []).length === 0) {
			const defaultHabits = ['Make Bed', 'Brush Teeth', 'Drink 8 Cups of Water', 'Meditate 10 Minutes', 'Exercise 30 minutes or more', 'Sleep with Good Bedtime'];
			defaultHabits.forEach(title => goals.addHabit?.({ title }));
		}
	}, []);

	// Randomize Trivia Answers
	useEffect(() => {
		if (randomTriviaIndex !== null && TRIVIA[randomTriviaIndex] && !triviaOptions) {
			const q = TRIVIA[randomTriviaIndex];
			const shuffled = [...q.answers].sort(() => Math.random() - 0.5);
			const correctLocalIndex = shuffled.indexOf(q.answers[q.correctIndex]);
			setTriviaOptions({ answers: shuffled, correctLocalIndex });
		}
	}, [randomTriviaIndex, triviaOptions]);

	// --- 4. HELPER FUNCTIONS ---
	const computeHabitQuota = () => {
		if (premium?.isPremium) return Infinity;
		let base = 10;
		const lvl = scarLevel?.currentScarLevel ?? 0;
		if (lvl >= 4) base += 5;
		if (lvl >= 8) base += 5;
		if (lvl >= 10) base += 5;
		return base;
	};

	const computeTodoQuota = () => {
		if (premium?.isPremium) return Infinity;
		let base = 5;
		const lvl = scarLevel?.currentScarLevel ?? 0;
		if (lvl >= 4) base += 5;
		if (lvl >= 8) base += 5;
		if (lvl >= 10) base += 5;
		return base;
	};

	const canAddMoreHabits = () => localHabits.length < computeHabitQuota();
	const canAddMoreTodos = () => localTodos.length < computeTodoQuota();

	const canProceedToNext = (): boolean => {
		const sec = sections[currentSection];
		if (!sec || typeof sec.key !== 'string') return true;

		// Trivia sections must be submitted
		if (sec.key.startsWith('trivia')) {
			return !!answers[`triviaSubmitted_${sec.key}`];
		}

		// Prompt must have at least 1 character
		if (sec.key === 'prompt') {
			const promptText = answers.promptText as string | undefined;
			return !!(promptText && promptText.trim().length > 0);
		}

		// Journal must have at least 1 character
		if (sec.key === 'journal') {
			return !!(journalText && journalText.trim().length > 0);
		}

		return true;
	};

	const goNext = () => {
		if (!canProceedToNext()) return;
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
				trivia: randomTriviaIndex,
			},
			triviaOptions: triviaOptions,
			progressPercent: Math.floor(((currentSection + 1) / totalSections) * 100),
		};
		survey.saveProgress?.('morning', saveState);
		router.back();
	};

	const submitSurvey = () => {
		const today = new Date().toISOString().split('T')[0];
		let baseCoins = 10;
		let furyDelta = 0;

		const mood = answers.mood as number | undefined;
		const moodList = questionSettings.mood.customEmotions && questionSettings.mood.customEmotions.length > 0 ? questionSettings.mood.customEmotions.map(e => ({ emoji: e.emoji, label: e.description, fury: e.furyChange })) : DEFAULT_MOOD_OPTIONS;
		const moodLabel = typeof mood === 'number' ? moodList[mood]?.label || '' : '';
		if (typeof mood === 'number') furyDelta = moodList[mood]?.fury || 0;

		const streakVal = typeof streakCtx?.getStreak === 'function' ? streakCtx.getStreak() : streakCtx?.streak ?? 0;
		const yangValue = fury?.furyMeter ?? 0;
		const dragonShardsCount = shards?.shards ?? 0;
		const scar = scarLevel?.currentScarLevel ?? 0;
		const snackMult = typeof items?.getActiveCoinMultiplier === 'function' ? items.getActiveCoinMultiplier() : 1;
		const isPremiumFlag = premium?.isPremium ?? false;

		const morningCoins = typeof coins?.calculateSurveyCoins === 'function' ? coins.calculateSurveyCoins(true, streakVal, yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 0;
		let totalCoinsEarned = morningCoins;

		coins.addCoins?.(morningCoins);
		shards.addShards?.(1);
		if (typeof fury.addFury === 'function') fury.addFury(furyDelta);

		if (answers.promptText && answers.promptText.trim()) {
			const extra = Math.floor(2 * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
			coins.addCoins?.(extra);
			totalCoinsEarned += extra;
		}

		const fireXPFromCoins = typeof coins?.calculateFireXP === 'function' ? coins.calculateFireXP(totalCoinsEarned) : 0;
		const bonusFireXP = (dragon?.age ?? 0) * 10;
		scarLevel.addXP?.(fireXPFromCoins + bonusFireXP);

		survey.completeMorningSurvey?.();

		journal.addEntry?.({
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

	// Helper to enable a challenge for a habit
	const enableHabitChallenge = (habit: HabitGoal, days: number) => {
		const opt = CHALLENGE_OPTIONS.find(o => o.days === days);
		if (!opt) return;
		if ((coins?.coins ?? 0) < opt.cost) {
			Alert.alert('Not enough coins', `You need ${opt.cost} coins to enable a ${days}-day challenge.`);
			return;
		}
		if ((shards?.shards ?? 0) < (opt.costShards || 0)) {
			Alert.alert('Not enough shards', `You need ${opt.costShards || 0} shards to enable a ${days}-day challenge.`);
			return;
		}

		Alert.alert(`Enable ${days}-day challenge?`, `Cost: ${opt.cost} coins${opt.costShards ? ` and ${opt.costShards} shards` : ''}. Rewards on completion: ${opt.rewardCoins} coins and ${opt.rewardShards} shards. This will lock editing until the challenge is finished or broken.`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Enable',
				onPress: () => {
					coins.addCoins?.(-opt.cost);
					if (opt.costShards) shards.addShards?.(-opt.costShards);
					const today = new Date().toISOString().split('T')[0];
					goals.editHabit?.(habit.id, { isChallenge: true, challengeLength: days, challengeStartDate: today, challengeRewardClaimed: false });
					// update local copy
					setLocalHabits(prev => prev.map(h => (h.id === habit.id ? { ...h, isChallenge: true, challengeLength: days, challengeStartDate: today } : h)));
				},
			},
		]);
	};

	const cancelHabit = (habitId: string) => {
		Alert.alert('Delete Habit', 'Are you sure you want to delete this habit?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: () => goals.deleteHabit?.(habitId) },
		]);
	};

	const cancelTodo = (todoId: string) => {
		Alert.alert('Delete To‑Do', 'Are you sure you want to delete this to-do?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: () => goals.deleteTodo?.(todoId) },
		]);
	};

	const renderHabitItem = ({ item, drag, isActive }: RenderItemParams<HabitGoal>) => {
		const h = item;
		const quotaReached = !canAddMoreHabits();
		const activeChallenge = !!h.isChallenge;
		const currentProgress = h.streak ?? 0;
		const required = h.challengeLength ?? 0;

		return (
			<ScaleDecorator>
				<TouchableOpacity activeOpacity={0.95} disabled={isActive} style={[styles.habitRow, h.importance === 'Important+' ? styles.habitImportantPlus : h.importance === 'Important' ? styles.habitImportant : null, activeChallenge ? { backgroundColor: '#e8f4ff' } : null, isActive && { transform: [{ scale: 1.02 }], elevation: 4 }]}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<View style={{ flex: 1 }}>
							<Text selectable={false} style={styles.habitTitle}>
								{h.title}
							</Text>
							<Text selectable={false} style={styles.habitMeta}>
								{h.category ? `${h.category}` : ''} • Streak: {h.streak ?? 0}
							</Text>
							{activeChallenge && (
								<Text style={{ fontSize: 12, color: '#1976d2', marginTop: 6 }}>
									Challenge: {currentProgress}/{required} days
								</Text>
							)}
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							{/* Delete button (to the right of edit but left of move) */}
							<Pressable style={{ marginRight: 8 }} onPress={() => cancelHabit(h.id)}>
								<Text style={{ fontSize: 18, color: '#e53935' }}>🗑️</Text>
							</Pressable>
							{/* Edit button: hidden when challenge active */}
							{!activeChallenge && (
								<Pressable style={[styles.miniButton, styles.miniEditButton]} onPress={() => setEditingHabit(h)}>
									<Text selectable={false} style={styles.miniButtonText}>
										✏️
									</Text>
								</Pressable>
							)}
							{/* space then move handle */}
							<Pressable onLongPress={drag} delayLongPress={150} style={{ padding: 6, marginLeft: 8 }}>
								<Text style={{ fontSize: 20, color: '#ccc' }}>≡</Text>
							</Pressable>
						</View>
					</View>

					{/* Challenge controls */}
					{!activeChallenge ? (
						<View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
							{CHALLENGE_OPTIONS.map(opt => (
								<Pressable key={opt.days} style={[styles.challengeButton, selectedChallengeDays[h.id] === opt.days ? styles.challengeSelected : null]} onPress={() => setSelectedChallengeDays(prev => ({ ...prev, [h.id]: prev[h.id] === opt.days ? null : opt.days }))}>
									<Text style={{ fontWeight: '600' }}>{opt.days}d</Text>
									<Text style={{ fontSize: 11, color: '#666' }}>
										{opt.cost}c{opt.costShards ? ` • ${opt.costShards}♦` : ''}
									</Text>
								</Pressable>
							))}
							<Pressable
								style={[styles.smallButton, { marginLeft: 12 }]}
								onPress={() => {
									const days = selectedChallengeDays[h.id];
									if (!days) return Alert.alert('Select length', 'Please choose a challenge length to enable.');
									enableHabitChallenge(h, days);
								}}>
								<Text selectable={false} style={styles.smallButtonText}>
									Enable
								</Text>
							</Pressable>
						</View>
					) : (
						<View style={{ marginTop: 8 }}>
							<Text style={{ fontSize: 12, color: '#555' }}>Challenge active — rewards will be granted on successful completion and applied in the evening survey.</Text>
						</View>
					)}
				</TouchableOpacity>
			</ScaleDecorator>
		);
	};

	const renderTodoItem = ({ item, drag, isActive }: RenderItemParams<TodoGoal>) => {
		const t = item;
		const isChallengeTodo = !!t.isChallenge;
		return (
			<ScaleDecorator>
				<TouchableOpacity activeOpacity={0.95} disabled={isActive} style={[styles.todoItem, isChallengeTodo ? { backgroundColor: '#e8f4ff' } : null, isActive && { transform: [{ scale: 1.02 }], elevation: 4 }]}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
						<View style={{ flex: 1 }}>
							<Text selectable={false} style={styles.habitTitle}>
								{t.title}
							</Text>
							<Text selectable={false} style={styles.habitMeta}>
								{t.importance} {t.category && `• ${t.category}`}
								{t.dueDate ? ` • due ${t.dueDate}` : ''}
							</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							{/* Delete button */}
							<Pressable style={{ marginRight: 8 }} onPress={() => cancelTodo(t.id)}>
								<Text style={{ fontSize: 18, color: '#e53935' }}>🗑️</Text>
							</Pressable>
							{/* Edit hidden if challenge todo */}
							{!isChallengeTodo && (
								<Pressable style={[styles.miniButton, styles.miniEditButton]} onPress={() => setEditingTodo(t)}>
									<Text selectable={false} style={styles.miniButtonText}>
										✏️
									</Text>
								</Pressable>
							)}
							<Pressable onLongPress={drag} delayLongPress={150} style={{ padding: 6, marginLeft: 8 }}>
								<Text style={{ fontSize: 20, color: '#ccc' }}>≡</Text>
							</Pressable>
						</View>
					</View>
					{t.subGoals && t.subGoals.length > 0 && (
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

	// --- 5. RENDER RESULTS SCREEN ---
	if (showResults && results) {
		return (
			<View style={styles.container}>
				<TopHeader isHomePage={false} />
				<View style={styles.content}>
					<Text style={styles.title}>🌅 Survey Complete!</Text>
					<View style={styles.resultsCard}>
						<Text style={styles.resultText}>💰 Coins Earned: +{results.coinsEarned}</Text>
						<Text style={styles.resultText}>💎 Shards Earned: +{results.shardsEarned}</Text>
						<Text style={styles.resultText}>✨ Fire-XP Earned: +{results.xpEarned}</Text>
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

	// --- 6. MAIN RENDER (With Fixes applied) ---
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<TopHeader isHomePage={false} />

				{/* Intro modal for 1s with placeholder animation */}
				<Modal visible={showIntroModal} transparent animationType="fade">
					<View style={styles.fullscreenIntro}>
						<View style={styles.introInner}>
							{/* Placeholder for Figma animation - replace with Lottie or webview when available */}
							<Text style={styles.introTitle}>🌅 Morning Survey</Text>
							<Text style={{ marginTop: 8, textAlign: 'center' }}>Preparing your questions...</Text>
						</View>
					</View>
				</Modal>

				{/* MODALS for editors */}
				{editingHabit && (
					<Modal visible={!!editingHabit} transparent={true} animationType="slide">
						<View style={styles.modalOverlay}>
							{/* NOTE: HabitEditor should be updated separately to remove its delete action and to support challenge buttons inside editor. */}
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

				{/* Animated Label */}
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

				<ScrollView style={styles.contentArea}>
					{section.key === 'dayGoals' && (
						<DraggableFlatList
							data={localHabits}
							onDragEnd={({ data }) => setLocalHabits(data)}
							nestedScrollEnabled={true}
							keyExtractor={item => item.id}
							renderItem={renderHabitItem}
							activationDistance={10}
							contentContainerStyle={styles.listContentContainer}
							ListHeaderComponent={
								<View>
									<Text style={styles.question}>Day / Habit Goals</Text>
									<Text style={{ marginBottom: 8 }}>Hold to drag and reorder your daily habits.</Text>
								</View>
							}
							ListFooterComponent={
								<View>
									<Pressable style={[styles.smallButton, !canAddMoreHabits() ? styles.buttonDisabled : null]} onPress={() => (canAddMoreHabits() ? goals.addHabit?.({ title: 'New Habit' }) : null)} disabled={!canAddMoreHabits()}>
										<Text selectable={false} style={styles.smallButtonText}>
											{canAddMoreHabits() ? '+ Add Habit' : 'Max Habit Quota Reached — Unlock more with higher Scar Level or Premium'}
										</Text>
									</Pressable>
									{goals.suggestedHabitGoals.length > 0 && (
										<>
											<Text style={[styles.label, { marginTop: 16, marginBottom: 8 }]}>Suggested Habits</Text>
											<ScrollView style={styles.suggestedScrollView} nestedScrollEnabled={true}>
												{goals.suggestedHabitGoals.map(s => (
													<Pressable
														key={s.title}
														style={styles.suggestedItem}
														onPress={() => {
															const importance = s.importance === 'Important+' ? 'Important+' : s.importance === 'Important' ? 'Important' : 'Default';
															goals.addHabit?.({ title: s.title, daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], category: s.category, importance });
															goals.rerollSuggestedHabits?.();
														}}>
														<Text selectable={false}>
															+ {s.title} • {s.category} • {s.importance}
														</Text>
													</Pressable>
												))}
											</ScrollView>
											<Pressable style={styles.rerollButton} onPress={() => goals.rerollSuggestedHabits?.()}>
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
							activationDistance={10}
							contentContainerStyle={styles.listContentContainer}
							ListHeaderComponent={
								<View>
									<Text style={styles.question}>To-Do Goals</Text>
									<Text style={{ marginBottom: 8 }}>Hold to drag and reorder your to-dos.</Text>
								</View>
							}
							ListFooterComponent={
								<View>
									<Pressable style={[styles.smallButton, !canAddMoreTodos() ? styles.buttonDisabled : null]} onPress={() => (canAddMoreTodos() ? goals.addTodo?.({ title: 'New To-Do' }) : null)} disabled={!canAddMoreTodos()}>
										<Text selectable={false} style={styles.smallButtonText}>
											{canAddMoreTodos() ? '+ Add To-Do' : 'Max To-Do Quota Reached — Unlock more with higher Scar Level or Premium'}
										</Text>
									</Pressable>
									{goals.suggestedTodoGoals && goals.suggestedTodoGoals.length > 0 && (
										<>
											<Text style={[styles.label, { marginTop: 12, marginBottom: 8 }]}>Suggested To‑Dos</Text>
											<ScrollView style={styles.suggestedScrollView} nestedScrollEnabled={true}>
												{goals.suggestedTodoGoals.map(s => (
													<Pressable
														key={s.title}
														style={styles.suggestedItem}
														onPress={() => {
															goals.addTodo?.({ title: s.title, category: s.category, dueDate: s.dueDate ? new Date(Date.now() + s.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null });
															goals.rerollSuggestedTodos?.();
														}}>
														<Text selectable={false}>
															+ {s.title} — 💰 {s.coins}
															{s.shards ? ` • 💎 ${s.shards}` : ''} • {s.category}
														</Text>
													</Pressable>
												))}
											</ScrollView>
											<Pressable style={styles.rerollButton} onPress={() => goals.rerollSuggestedTodos?.()}>
												<Text selectable={false} style={styles.rerollButtonText}>
													🔄 Re-Roll To-Do Suggestions
												</Text>
											</Pressable>
										</>
									)}
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
										{(questionSettings.mood.customEmotions && questionSettings.mood.customEmotions.length > 0 ? questionSettings.mood.customEmotions.map(e => ({ emoji: e.emoji, label: e.description, fury: e.furyChange })) : DEFAULT_MOOD_OPTIONS).map((m, idx) => (
											<Pressable key={`${m.label}-${idx}`} style={[styles.moodButton, answers.mood === idx && styles.moodSelected]} onPress={() => setAnswers({ ...answers, mood: idx })}>
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

							{section.key && section.key.startsWith('trivia') && randomTriviaIndex !== null && TRIVIA[randomTriviaIndex] && (
								<View>
									<Text style={styles.question}>Quick Trivia</Text>
									<Text selectable={false} style={{ marginBottom: 12 }}>
										{TRIVIA[randomTriviaIndex].text}
									</Text>
									<Text selectable={false} style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
										Select your answer:
									</Text>
									{(triviaOptions ? triviaOptions.answers : TRIVIA[randomTriviaIndex].answers).map((answer: string, i: number) => {
										const isSelected = answers[`triviaAnswer_${section.key}`] === i;
										const submitted = answers[`triviaSubmitted_${section.key}`];
										const isCorrect = triviaOptions ? i === triviaOptions.correctLocalIndex : i === TRIVIA[randomTriviaIndex].correctIndex;

										return (
											<Pressable key={`${randomTriviaIndex}-${i}`} style={[styles.mcOption, isSelected && styles.mcSelected, submitted && isCorrect && styles.mcCorrect, submitted && isSelected && !isCorrect && styles.mcIncorrect]} onPress={() => !submitted && setAnswers({ ...answers, [`triviaAnswer_${section.key}`]: i })}>
												<Text selectable={false}>{answer}</Text>
												{submitted && isCorrect && (
													<Text selectable={false} style={{ marginLeft: 8 }}>
														✓
													</Text>
												)}
												{submitted && isSelected && !isCorrect && (
													<Text selectable={false} style={{ marginLeft: 8 }}>
														✗
													</Text>
												)}
											</Pressable>
										);
									})}
									{!answers[`triviaSubmitted_${section.key}`] && (
										<Pressable style={[styles.smallButton, { marginTop: 12 }]} onPress={() => setAnswers({ ...answers, [`triviaSubmitted_${section.key}`]: true })}>
											<Text selectable={false} style={styles.smallButtonText}>
												Submit Answer
											</Text>
										</Pressable>
									)}
									{answers[`triviaSubmitted_${section.key}`] && (
										<Text selectable={false} style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
											Correct answer: {triviaOptions ? triviaOptions.answers[triviaOptions.correctLocalIndex] : TRIVIA[randomTriviaIndex].answers[TRIVIA[randomTriviaIndex].correctIndex]}
										</Text>
									)}
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
											<Text selectable={false} style={[styles.adviceText, { fontStyle: 'italic', marginBottom: 12 }]}>{`"${QUOTES[randomQuoteIndex]}"`}</Text>
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
				</ScrollView>

				<View style={styles.buttonContainer}>
					{currentSection > 0 && (
						<Pressable style={styles.buttonPrevious} onPress={goBack}>
							<Text selectable={false} style={styles.buttonText}>
								Previous
							</Text>
						</Pressable>
					)}

					<Pressable style={[styles.buttonNext, !canProceedToNext() && styles.buttonDisabled]} onPress={goNext} disabled={!canProceedToNext()}>
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
	buttonPrevious: { flex: 1, paddingVertical: 12, backgroundColor: '#fafafa', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
	buttonNext: { flex: 1, paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center' },
	buttonDisabled: { backgroundColor: '#ccc', opacity: 0.6 },
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
	suggestedScrollView: { maxHeight: 300, borderRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
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
	mcOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginVertical: 4, backgroundColor: '#fff' },
	mcSelected: { borderColor: '#2196F3', backgroundColor: '#e3f2fd' },
	mcCorrect: { borderColor: '#4CAF50', backgroundColor: '#e8f5e9' },
	mcIncorrect: { borderColor: '#e74c3c', backgroundColor: '#fadbd8' },
	challengeButton: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginRight: 8, alignItems: 'center' },
	challengeSelected: { borderColor: '#1976d2', backgroundColor: '#e3f2fd' },
	fullscreenIntro: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	introInner: { backgroundColor: '#fff', padding: 24, borderRadius: 16, width: '80%', alignItems: 'center' },
	introTitle: { fontSize: 22, fontWeight: '700' },
});
