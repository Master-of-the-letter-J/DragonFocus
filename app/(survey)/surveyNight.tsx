import ProgressBar from '@/components/ProgressBar';
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
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

function isYesterday(dateStr: string) {
	const d = new Date(dateStr);
	const y = new Date();
	y.setDate(y.getDate() - 1);
	return d.toISOString().split('T')[0] === y.toISOString().split('T')[0];
}

interface SurveyAnswers {
	[key: string]: any;
}

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

// Challenge reward map (mirrors Morning)
const CHALLENGE_REWARDS: Record<number, { coins: number; shards: number }> = {
	7: { coins: 100, shards: 10 },
	14: { coins: 250, shards: 25 },
	30: { coins: 750, shards: 60 },
};

export default function SurveyNightPage() {
	// Providers (defensive)
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
	const journal = useJournal();
	const goals = useGoals();
	const router = useRouter();

	//Defensive
	const qSettings = questionSettings; //as any) ?? { prompts: { types: {} }, trivia: { types: {} }, mood: { customEmotions: [] } };

	// Prepare mood options (custom or default)
	const moodOptions: { emoji: string; label: string; fury: number }[] = qSettings?.mood?.customEmotions && qSettings.mood.customEmotions.length > 0 ? qSettings.mood.customEmotions.map((e: any) => ({ emoji: e.emoji, label: e.description ?? e.label ?? 'Custom', fury: e.furyChange ?? 0 })) : DEFAULT_MOOD_OPTIONS;

	// State
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
	const slideAnim = React.useRef(new Animated.Value(-100)).current;

	// Editor modals (Night should not allow editing challenge items; editors are read-only or disabled by provider)
	const [editingHabit, setEditingHabit] = useState<HabitGoal | null>(null);
	const [editingTodo, setEditingTodo] = useState<TodoGoal | null>(null);

	// Sections
	const sections = [
		{ key: 'advice', label: 'Advice' },
		{ key: 'mood', label: 'Mood' },
		{ key: 'dayGoals', label: 'Day Goals' },
		{ key: 'todoGoals', label: 'To-Do Goals' },
		{ key: 'prompt', label: 'Prompt' },
		{ key: 'trivia', label: 'Trivia' },
		{ key: 'journal', label: 'Journal' },
		{ key: 'quote', label: 'Quote' },
	];

	const totalSections = sections.length;

	// Slide label animation
	useEffect(() => {
		if (showSurveyLabel) {
			Animated.sequence([Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }), Animated.delay(1400), Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true })]).start(() => setShowSurveyLabel(false));
		}
	}, [showSurveyLabel]);

	// On mount: load saved progress, seed indices, etc.
	useEffect(() => {
		const saved = survey?.loadProgress?.('night');
		const todayStr = new Date().toISOString().split('T')[0];

		if (saved && saved.savedAt === todayStr) {
			if (saved.answers) setAnswers(saved.answers);
			if (saved.journalText) setJournalText(saved.journalText);
			if (typeof saved.section === 'number') setCurrentSection(saved.section);

			if (saved.indices) {
				if (typeof saved.indices.trivia === 'number') setRandomTriviaIndex(saved.indices.trivia);
				if (typeof saved.indices.advice === 'number') setRandomAdviceIndex(saved.indices.advice);
				if (typeof saved.indices.prompt === 'number') setRandomPromptIndex(saved.indices.prompt);
				if (typeof saved.indices.quote === 'number') setRandomQuoteIndex(saved.indices.quote);
			}
			if (saved.triviaOptions) setTriviaOptions(saved.triviaOptions);
		}

		setShowSurveyLabel(true);

		if (ADVICE.length > 0 && randomAdviceIndex === null) setRandomAdviceIndex(Math.floor(Math.random() * ADVICE.length));

		// Try to pick prompt/trivia defensively
		try {
			const promptMap: Record<string, keyof typeof qSettings.prompts.types> = {
				SelfDiscovery: 'SelfDiscovery',
				Reflection: 'Reflection',
				Gratitude: 'Gratitude',
				Creative: 'Creative',
				Mindfulness: 'Mindfulness',
				Productivity: 'Productivity',
				Relationships: 'Relationships',
			};
			const enabledPrompts = PROMPTS.filter(p => {
				const key = p.category in promptMap ? promptMap[p.category] : p.category;
				return !!qSettings.prompts?.types?.[key];
			});
			if (enabledPrompts.length > 0 && randomPromptIndex === null) {
				const chosen = enabledPrompts[Math.floor(Math.random() * enabledPrompts.length)];
				const globalIndex = PROMPTS.findIndex(x => x === chosen);
				if (globalIndex >= 0) setRandomPromptIndex(globalIndex);
			}
		} catch (e) {
			/* ignore */
		}

		try {
			const triviaMap: Record<string, keyof typeof qSettings.trivia.types> = {
				General: 'General',
				PopCulture: 'PopCulture',
				History: 'History',
				Science: 'Science',
				Geography: 'Geography',
				Sports: 'Sports',
				LiteratureArts: 'LiteratureArts',
				Food: 'Food',
			};
			const enabledTrivia = TRIVIA.filter(t => !!qSettings.trivia?.types?.[t.category in triviaMap ? triviaMap[t.category] : t.category]);
			if (enabledTrivia.length > 0 && randomTriviaIndex === null) {
				const chosen = enabledTrivia[Math.floor(Math.random() * enabledTrivia.length)];
				const globalIndex = TRIVIA.findIndex(x => x === chosen);
				if (globalIndex >= 0) setRandomTriviaIndex(globalIndex);
			}
		} catch (e) {
			/* ignore */
		}

		if (QUOTES.length > 0 && (scarLevel?.currentScarLevel ?? 0) >= 1 && randomQuoteIndex === null) setRandomQuoteIndex(Math.floor(Math.random() * QUOTES.length));
	}, []);

	// Randomize trivia answers (preserve saved order if loaded)
	useEffect(() => {
		if (randomTriviaIndex !== null && TRIVIA[randomTriviaIndex] && !triviaOptions) {
			const original = TRIVIA[randomTriviaIndex];
			const source = original.answers.map((a: string, i: number) => ({ a, i }));

			// Fisher-Yates
			for (let i = source.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[source[i], source[j]] = [source[j], source[i]];
			}
			const answersList = source.map((s: any) => s.a);
			const correctLocalIndex = source.findIndex((s: any) => s.i === original.correctIndex);

			setTriviaOptions({ answers: answersList, correctLocalIndex });
			// store for grading later
			setAnswers(prev => ({ ...prev, _triviaCorrectLocalIndex: correctLocalIndex }));
		}
	}, [randomTriviaIndex]);

	// Can proceed to next section gating
	const canProceedToNext = (): boolean => {
		const sec = sections[currentSection];
		if (!sec || typeof sec.key !== 'string') return true;

		if (sec.key === 'trivia') {
			return !!answers.triviaSubmitted;
		}
		if (sec.key === 'prompt') {
			const promptText = answers.promptText as string | undefined;
			return !!(promptText && promptText.trim().length > 0);
		}
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
			setCurrentSection(prev => Math.min(prev + 1, totalSections - 1));
		}
	};

	const goBack = () => {
		setCurrentSection(prev => Math.max(prev - 1, 0));
	};

	const handleExitSurvey = () => {
		const saveState = {
			savedAt: new Date().toISOString().split('T')[0],
			section: currentSection,
			answers: answers,
			journalText,
			triviaOptions,
			indices: {
				trivia: randomTriviaIndex,
				advice: randomAdviceIndex,
				prompt: randomPromptIndex,
				quote: randomQuoteIndex,
			},
			progressPercent: Math.floor(((currentSection + 1) / totalSections) * 100),
		};
		survey?.saveProgress?.('night', saveState);
		router.back();
	};

	const submitSurvey = () => {
		const today = new Date().toISOString().split('T')[0];
		const alreadyDoneToday = survey?.lastNightSurveyDate === today && survey?.nightSurveyCompleted;
		let totalCoinsEarned = 0;
		let furyDelta = 0;

		// Mood to fury
		const mood = answers.mood as number | undefined;
		if (typeof mood === 'number' && moodOptions[mood]) furyDelta = moodOptions[mood].fury || 0;

		// multipliers
		const streakVal = typeof streakCtx?.getStreak === 'function' ? streakCtx.getStreak() : (streakCtx?.streak ?? 0);
		const yangValue = fury?.furyMeter ?? 0;
		const dragonShardsCount = shards?.shards ?? 0;
		const scar = scarLevel?.currentScarLevel ?? 0;
		const snackMult = typeof items?.getActiveCoinMultiplier === 'function' ? items.getActiveCoinMultiplier() : 1;
		const isPremiumFlag = premium?.isPremium ?? false;

		if (!alreadyDoneToday) {
			const nightCoins = typeof coins?.calculateSurveyCoins === 'function' ? coins.calculateSurveyCoins(false, streakVal, yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 0;
			totalCoinsEarned = nightCoins;
			coins?.addCoins?.(nightCoins);
			shards?.addShards?.(1);
			if (typeof fury?.addFury === 'function') fury.addFury(furyDelta);
		}

		// mark complete before goal rewards
		survey?.completeNightSurvey?.();

		// goal rewards calculation
		let totalGoalCoins = 0;
		let totalGoalsCompleted = 0;

		const todayStr = new Date().toISOString().split('T')[0];
		const habitCompletedIds = (goals?.habits ?? []).filter((h: any) => h.lastCompletedDate === todayStr).map((h: any) => h.id);
		const todoCompletedIds = (goals?.todos ?? []).filter((t: any) => t.completedDate === todayStr).map((t: any) => t.id);
		const habitCompletedCount = habitCompletedIds.length;
		const todoCompletedCount = todoCompletedIds.length;
		totalGoalsCompleted = habitCompletedCount + todoCompletedCount;

		// Habit coins
		if (habitCompletedCount > 0) {
			const baseHabitCoins = 5 * habitCompletedCount + ((goals?.habits ?? []).some((h: any) => h.streak >= 5) ? 5 : 0);
			if (!alreadyDoneToday) {
				const awarded = Math.floor(baseHabitCoins * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
				coins?.addCoins?.(awarded);
				totalGoalCoins += awarded;
				dragon?.addHealthFromGoal?.(habitCompletedCount * 2);
			} else {
				const snap = survey?.getNightSnapshot?.() || { habitIds: [], todoIds: [] };
				const newHabits = habitCompletedIds.filter(id => !snap.habitIds.includes(id));
				if (newHabits.length > 0) {
					const baseNew = 5 * newHabits.length + ((goals?.habits ?? []).some((h: any) => h.streak >= 5) ? 5 : 0);
					const awarded = Math.floor(baseNew * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
					coins?.addCoins?.(awarded);
					totalGoalCoins += awarded;
					dragon?.addHealthFromGoal?.(newHabits.length * 2);
				}
			}
		}

		// Todo coins
		if (todoCompletedCount > 0) {
			const baseTodoCoins = 10 * todoCompletedCount;
			if (!alreadyDoneToday) {
				const awarded = Math.floor(baseTodoCoins * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
				coins?.addCoins?.(awarded);
				totalGoalCoins += awarded;
				dragon?.addHealthFromGoal?.(todoCompletedCount * 2);
			} else {
				const snap = survey?.getNightSnapshot?.() || { habitIds: [], todoIds: [] };
				const newTodos = todoCompletedIds.filter(id => !snap.todoIds.includes(id));
				if (newTodos.length > 0) {
					const baseNew = 10 * newTodos.length;
					const awarded = Math.floor(baseNew * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
					coins?.addCoins?.(awarded);
					totalGoalCoins += awarded;
					dragon?.addHealthFromGoal?.(newTodos.length * 2);
				}
			}
		}

		// CHALLENGE completion rewards: check habits flagged as isChallenge and not yet claimed
		const challengeFinishers = (goals?.habits ?? []).filter((h: any) => h.isChallenge && h.challengeLength && h.challengeStartDate && !h.challengeRewardClaimed && (h.streak ?? 0) >= (h.challengeLength ?? 0));
		if (challengeFinishers.length > 0) {
			challengeFinishers.forEach((h: any) => {
				const len = Number(h.challengeLength);
				const reward = CHALLENGE_REWARDS[len] ?? { coins: 0, shards: 0 };
				if (reward.coins > 0) {
					coins?.addCoins?.(reward.coins);
					totalGoalCoins += reward.coins;
				}
				if (reward.shards > 0) {
					shards?.addShards?.(reward.shards);
				}
				// mark claimed so we don't double-award
				goals?.editHabit?.(h.id, { challengeRewardClaimed: true });
			});
		}

		if (dragon?.hp <= 0) {
			dragon?.die?.();
		}

		// Prompt & trivia extra rewards only if first nightly completion
		if (!alreadyDoneToday) {
			if (answers.promptText && answers.promptText.trim()) {
				const extra = Math.floor(2 * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
				coins?.addCoins?.(extra);
				totalCoinsEarned += extra;
			}

			if (answers.triviaAnswer !== undefined && typeof answers._triviaCorrectLocalIndex === 'number') {
				if (answers.triviaAnswer === answers._triviaCorrectLocalIndex) {
					const extra = Math.floor(2 * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
					coins?.addCoins?.(extra);
					totalCoinsEarned += extra;
				}
			}
		}

		const totalCoins = totalCoinsEarned + totalGoalCoins;
		const fireXPFromCoins = typeof coins?.calculateFireXP === 'function' ? coins.calculateFireXP(totalCoins) : 0;
		const bonusFireXP = (dragon?.age ?? 0) * 10;
		if (!alreadyDoneToday) scarLevel?.addXP?.(fireXPFromCoins + bonusFireXP);

		// Journal entry with mood and rewards
		const moodLabel = typeof mood === 'number' && moodOptions[mood] ? moodOptions[mood].label : '';
		journal?.addEntry?.({
			id: `entry_${today}_night_${Date.now()}`,
			date: today,
			surveyType: 'night',
			goalsCompleted: totalGoalsCompleted,
			schedulePercent: 0,
			text: journalText,
			moodEvening: moodLabel,
			rewards: { coins: totalCoins, xp: fireXPFromCoins + bonusFireXP, fury: furyDelta },
		});

		// Save snapshot (for retakes)
		survey?.recordNightSnapshot?.({ habitIds: habitCompletedIds, todoIds: todoCompletedIds });

		// Clear saved progress
		survey?.clearProgress?.('night');

		// Show results
		setResults({
			coinsEarned: totalCoinsEarned + totalGoalCoins,
			shardsEarned: 1,
			xpEarned: fireXPFromCoins + bonusFireXP,
			furyDelta,
			goalsCompleted: totalGoalsCompleted,
		});
		setShowResults(true);
	};

	// Delete habit / todo from list (confirm)
	const confirmDeleteHabit = (id: string) => {
		Alert.alert('Delete habit', 'Are you sure you want to delete this habit?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: () => goals?.deleteHabit?.(id) },
		]);
	};
	const confirmDeleteTodo = (id: string) => {
		Alert.alert('Delete to-do', 'Are you sure you want to delete this to-do?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: () => goals?.deleteTodo?.(id) },
		]);
	};

	if (showResults && results) {
		return (
			<View style={styles.container}>
				<TopHeader isHomePage={false} />
				<View style={styles.content}>
					<Text style={styles.title}>🌙 Survey Complete!</Text>
					<View style={styles.resultsCard}>
						<Text style={styles.resultText}>💰 Coins Earned: +{results.coinsEarned}</Text>
						<Text style={styles.resultText}>💎 Shards Earned: +{results.shardsEarned}</Text>
						<Text style={styles.resultText}>✨ Fire-XP Earned: +{results.xpEarned}</Text>
						<Text style={styles.resultText}>
							😈 Fury: {results.furyDelta > 0 ? '+' : ''}
							{results.furyDelta}
						</Text>
						<Text style={styles.resultText}>🎯 Goals Completed Today: {results.goalsCompleted}</Text>
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

			{/* Editors (night should not allow editing of challenge-locked items; editors may need to respect isChallenge) */}
			{editingHabit && (
				<Modal visible={!!editingHabit} transparent animationType="slide">
					<View style={styles.modalOverlay}>
						<HabitEditor habit={editingHabit} onClose={() => setEditingHabit(null)} />
					</View>
				</Modal>
			)}
			{editingTodo && (
				<Modal visible={!!editingTodo} transparent animationType="slide">
					<View style={styles.modalOverlay}>
						<TodoEditor todo={editingTodo} onClose={() => setEditingTodo(null)} />
					</View>
				</Modal>
			)}

			{/* Animated label */}
			<Animated.View style={[styles.surveyLabelContainer, { transform: [{ translateY: slideAnim }] }]}>
				<Text style={styles.surveyLabelText}>🌙 Night Survey</Text>
			</Animated.View>

			{/* Progress */}
			<View style={styles.progressContainer}>
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<View style={{ flex: 1 }}>
						<ProgressBar progress={Math.round(((currentSection + 1) / totalSections) * 100)} />
						<Text style={styles.progressText}>
							Question {currentSection + 1} of {totalSections}
						</Text>
					</View>
					<Pressable onPress={handleExitSurvey} style={styles.closeButton}>
						<Text style={styles.closeButtonText}>✕</Text>
					</Pressable>
				</View>
			</View>

			{/* Content */}
			<ScrollView style={styles.surveyContent} contentContainerStyle={styles.surveyContentInner}>
				<Text style={styles.surveyType}>🌙 Night Survey</Text>

				{/* Advice */}
				{section.key === 'advice' && (
					<View>
						<Text style={styles.question}>🐉 Dragon Inhales...</Text>
						{randomAdviceIndex !== null && ADVICE[randomAdviceIndex] ?
							<>
								<Text style={styles.adviceText}>{ADVICE[randomAdviceIndex]}</Text>
								<Text style={styles.adviceLabel}>— Advice for today</Text>
							</>
						:	<Text style={{ marginBottom: 12 }}>A piece of wisdom for your journey.</Text>}
					</View>
				)}

				{/* Mood */}
				{section.key === 'mood' && (
					<View>
						<Text style={styles.question}>How are you feeling?</Text>
						<View style={styles.moodGrid}>
							{moodOptions.map((m, idx) => (
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

				{/* Day / Habit Goals */}
				{section.key === 'dayGoals' && (
					<View>
						<Text style={styles.question}>Day / Habit Goals</Text>
						<Text style={{ marginBottom: 8 }}>Check off completed goals today. You can uncheck until you submit.</Text>

						<ScrollView style={styles.goalsScrollView} nestedScrollEnabled>
							{(goals?.habits ?? [])
								.filter(h => h.title && h.title.trim())
								.map((h: any) => {
									const today = new Date().toISOString().split('T')[0];
									const isCompleted = answers[`habit_${h.id}`];
									const missedStreak = h.streak > 0 && h.lastCompletedDate && h.lastCompletedDate !== today && !isYesterday(h.lastCompletedDate);

									return (
										<View key={h.id}>
											<View style={[styles.habitRow, h.isChallenge ? styles.challengeRow : null, isCompleted ? styles.habitCompleted : null, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
												<View style={{ flex: 1 }}>
													<Text
														selectable={false}
														style={[
															styles.habitTitle,
															h.importance === 'Important+' ? styles.habitImportantPlus
															: h.importance === 'Important' ? styles.habitImportant
															: null,
														]}>
														{h.title}
													</Text>
													<Text selectable={false} style={styles.habitMeta}>
														{h.category ? `${h.category}` : ''} • Streak: {h.streak ?? 0}
													</Text>

													{/* If this habit is a challenge, show progress and reward preview */}
													{h.isChallenge && h.challengeLength && (
														<Text selectable={false} style={{ fontSize: 12, color: '#1565C0', marginTop: 6 }}>
															Challenge: {h.streak ?? 0}/{h.challengeLength} days • Reward:{' '}
															{h.challengeLength === 7 ?
																'💰100 • 💎10'
															: h.challengeLength === 14 ?
																'💰250 • 💎25'
															:	'💰750 • 💎60'}
														</Text>
													)}
												</View>

												{/* Completed checkbox */}
												<Checkbox value={!!isCompleted} onValueChange={v => setAnswers({ ...answers, [`habit_${h.id}`]: v })} />
											</View>

											{/* Missed streak note */}
											{missedStreak && !isCompleted && (
												<View style={{ marginTop: 6 }}>
													<Text selectable={false} style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
														Why didn't you complete this goal?
													</Text>
													<TextInput value={answers[`missed_${h.id}`] || ''} onChangeText={t => setAnswers({ ...answers, [`missed_${h.id}`]: t })} placeholder="Brief note..." style={[styles.textInputArea, { minHeight: 60 }]} multiline />
												</View>
											)}
										</View>
									);
								})}
						</ScrollView>
					</View>
				)}

				{/* To-Do Goals */}
				{section.key === 'todoGoals' && (
					<View>
						<Text style={styles.question}>To-Do Goals</Text>
						<Text style={{ marginBottom: 8 }}>Check off completed to-dos and their sub-goals. You can uncheck until you submit.</Text>

						<ScrollView style={styles.goalsScrollView} nestedScrollEnabled>
							{(goals?.todos ?? [])
								.filter(t => t.title && t.title.trim())
								.map((t: any) => {
									const today = new Date().toISOString().split('T')[0];
									const isCompleted = answers[`todo_${t.id}`];
									const created = new Date(t.createdAt);
									const now = new Date();
									const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
									const canComplete = diffDays >= 1;

									return (
										<View key={t.id} style={[styles.todoItem, isCompleted ? styles.todoCompleted : null]}>
											<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
												<Text selectable={false} style={[styles.habitTitle, { textDecorationLine: isCompleted ? 'line-through' : 'none', opacity: canComplete ? 1 : 0.6 }]}>
													{t.title}
												</Text>
												<Checkbox disabled={!canComplete} value={!!isCompleted} onValueChange={v => setAnswers({ ...answers, [`todo_${t.id}`]: v })} />
											</View>

											{/* show category, due date, importance */}
											{(t.category || t.dueDate || t.importance) && (
												<Text style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
													{t.category ? `${t.category}` : ''}
													{t.category && t.dueDate ? ' • ' : ''}
													{t.dueDate ? `Due: ${t.dueDate}` : ''}
													{(t.category || t.dueDate) && t.importance ? ' • ' : ''}
													{t.importance ? `${t.importance}` : ''}
												</Text>
											)}

											{!canComplete && (
												<Text selectable={false} style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 4 }}>
													(Can complete after 1 day)
												</Text>
											)}

											{/* Subgoals are checkable directly from the night survey */}
											{t.subGoals && t.subGoals.length > 0 && (
												<View style={{ marginTop: 8 }}>
													{t.subGoals.map((sg: any) => (
														<Pressable key={sg.id} style={styles.subGoalRow} onPress={() => goals?.toggleSubGoal?.(t.id, sg.id)}>
															<Text selectable={false} style={{ textDecorationLine: sg.completed ? 'line-through' : 'none' }}>
																{sg.completed ? '✓' : '○'} {sg.title}
															</Text>
														</Pressable>
													))}
												</View>
											)}
										</View>
									);
								})}
						</ScrollView>
					</View>
				)}

				{/* Prompt */}
				{section.key === 'prompt' && (
					<View>
						<Text style={styles.question}>Random Prompt</Text>
						<Text selectable={false} style={{ marginBottom: 12, fontSize: 15, fontStyle: 'italic' }}>
							{randomPromptIndex !== null && PROMPTS[randomPromptIndex] ? PROMPTS[randomPromptIndex].text : 'Write a short response'}
						</Text>
						<TextInput value={answers.promptText || ''} onChangeText={t => setAnswers({ ...answers, promptText: t })} placeholder="Your response..." multiline style={styles.textInputArea} />
					</View>
				)}

				{/* Trivia */}
				{section.key === 'trivia' && randomTriviaIndex !== null && TRIVIA[randomTriviaIndex] && (
					<View>
						<Text style={styles.question}>Quick Trivia</Text>
						<Text selectable={false} style={{ marginBottom: 12 }}>
							{TRIVIA[randomTriviaIndex].text}
						</Text>
						<Text selectable={false} style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
							Select your answer:
						</Text>
						{(triviaOptions ? triviaOptions.answers : TRIVIA[randomTriviaIndex].answers).map((answer: string, i: number) => {
							const isSelected = answers.triviaAnswer === i;
							const submitted = answers.triviaSubmitted;
							const isCorrect = triviaOptions ? i === triviaOptions.correctLocalIndex : i === TRIVIA[randomTriviaIndex].correctIndex;

							return (
								<Pressable key={`${randomTriviaIndex}-${i}`} style={[styles.mcOption, isSelected && styles.mcSelected, submitted && isCorrect && styles.mcCorrect, submitted && isSelected && !isCorrect && styles.mcIncorrect]} onPress={() => !submitted && setAnswers({ ...answers, triviaAnswer: i })}>
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
						{!answers.triviaSubmitted && (
							<Pressable style={[styles.smallButton, { marginTop: 12 }]} onPress={() => setAnswers({ ...answers, triviaSubmitted: true })}>
								<Text selectable={false} style={styles.smallButtonText}>
									Submit Answer
								</Text>
							</Pressable>
						)}
						{answers.triviaSubmitted && (
							<Text selectable={false} style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
								Correct answer: {triviaOptions ? triviaOptions.answers[triviaOptions.correctLocalIndex] : TRIVIA[randomTriviaIndex].answers[TRIVIA[randomTriviaIndex].correctIndex]}
							</Text>
						)}
					</View>
				)}

				{/* Journal */}
				{section.key === 'journal' && (
					<View>
						<Text style={styles.question}>Journal Entry</Text>
						<TextInput value={journalText} onChangeText={setJournalText} placeholder="Write anything about your day..." multiline style={styles.textInputArea} />
					</View>
				)}

				{/* Quote */}
				{section.key === 'quote' && (
					<View>
						<Text style={styles.question}>🐉 Dragon Exhales...</Text>
						{randomQuoteIndex !== null && QUOTES[randomQuoteIndex] ?
							<>
								<Text selectable={false} style={[styles.adviceText, { fontStyle: 'italic', marginBottom: 12 }]}>
									"{QUOTES[randomQuoteIndex]}"
								</Text>
								<Text selectable={false} style={styles.adviceLabel}>
									— Words of wisdom
								</Text>
							</>
						:	<Text style={{ marginBottom: 12 }}>A inspiring thought for you.</Text>}
					</View>
				)}
			</ScrollView>

			{/* Bottom controls */}
			<View style={styles.buttonContainer}>
				{/* Previous */}
				<Pressable style={[styles.buttonSmall, currentSection === 0 ? { opacity: 0.6 } : null]} onPress={goBack} disabled={currentSection === 0}>
					<Text selectable={false} style={styles.buttonText}>
						Previous
					</Text>
				</Pressable>

				{/* Next / Submit */}
				<Pressable style={[styles.buttonNext, !canProceedToNext() && styles.buttonDisabled]} onPress={goNext} disabled={!canProceedToNext()}>
					<Text selectable={false} style={styles.buttonTextPrimary}>
						{answers.triviaSubmitted && section.key === 'trivia' ?
							'Next'
						: currentSection === totalSections - 1 ?
							'Submit'
						:	'Next'}
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
	closeButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
	closeButtonText: { fontSize: 28, fontWeight: '300', color: '#666' },
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
	buttonContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16, gap: 0, justifyContent: 'space-between' },
	buttonSmall: { flex: 1, paddingVertical: 12, backgroundColor: '#fafafa', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
	buttonNext: { flex: 2, paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center' },
	buttonDisabled: { backgroundColor: '#ccc', opacity: 0.6 },
	buttonText: { fontSize: 14, fontWeight: '600', color: '#666' },
	buttonTextPrimary: { fontSize: 14, fontWeight: '600', color: '#fff' },
	smallButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#eee', borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
	smallButtonText: { fontSize: 13, fontWeight: '600', color: '#333' },
	miniButton: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
	miniEditButton: { backgroundColor: '#2196F3' },
	miniButtonText: { fontSize: 14, color: '#fff' },
	moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
	moodButton: { width: '30%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginBottom: 8 },
	moodSelected: { borderColor: '#4CAF50', backgroundColor: '#eefaf0' },
	moodEmoji: { fontSize: 24, marginBottom: 6 },
	moodLabel: { fontSize: 12, textAlign: 'center' },
	habitRow: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
	challengeRow: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d0e8ff', marginBottom: 8, backgroundColor: '#f3f9ff' },
	habitCompleted: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
	habitTitle: { fontSize: 16, fontWeight: '600' },
	habitImportant: { color: '#f57c00' },
	habitImportantPlus: { color: '#d32f2f' },
	habitMeta: { fontSize: 12, color: '#666', marginTop: 4 },
	goalsScrollView: { maxHeight: 250, borderRadius: 8, marginVertical: 8 },
	suggestedScrollView: { maxHeight: 150, borderRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
	todoItem: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
	todoCompleted: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
	subGoalRow: { paddingLeft: 12, paddingVertical: 6 },
	mcOption: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	mcSelected: { borderColor: '#4CAF50', backgroundColor: '#eefaf0' },
	mcCorrect: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
	mcIncorrect: { borderColor: '#f44336', backgroundColor: '#FFEBEE' },
	resultsCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 20, marginVertical: 16 },
	resultText: { fontSize: 16, fontWeight: '600', marginVertical: 8 },
	finishButton: { paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center', marginTop: 20 },
	finishButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
});
