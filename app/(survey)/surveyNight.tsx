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
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

function isYesterday(dateStr: string) {
	const d = new Date(dateStr);
	const y = new Date();
	y.setDate(y.getDate() - 1);
	return d.toISOString().split('T')[0] === y.toISOString().split('T')[0];
}

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

export default function SurveyNightPage() {
	const survey = useSurvey();
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

	// Survey state
	const [currentSection, setCurrentSection] = useState(0);
	const [answers, setAnswers] = useState<SurveyAnswers>({});
	const [journalText, setJournalText] = useState('');
	const [randomAdviceIndex, setRandomAdviceIndex] = useState<number | null>(null);
	const [randomPromptIndex, setRandomPromptIndex] = useState<number | null>(null);
	const [randomQuoteIndex, setRandomQuoteIndex] = useState<number | null>(null);
	const [randomTriviaIndex, setRandomTriviaIndex] = useState<number | null>(null);
	// Holds the randomized answers and the pointer to the correct answer in that specific random order
	const [triviaOptions, setTriviaOptions] = useState<{ answers: string[]; correctLocalIndex: number } | null>(null);

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
		{ key: 'trivia', label: 'Trivia' },
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

	// Initialize on mount (load saved progress if exists, allow retake)
	useEffect(() => {
		const saved = survey.loadProgress('night');
		const todayStr = new Date().toISOString().split('T')[0];

		if (saved && saved.savedAt === todayStr) {
			if (saved.answers) setAnswers(saved.answers);
			if (saved.journalText) setJournalText(saved.journalText);
			if (typeof saved.section === 'number') setCurrentSection(saved.section);

			// Load indices
			if (saved.indices) {
				if (typeof saved.indices.trivia === 'number') setRandomTriviaIndex(saved.indices.trivia);
				if (typeof saved.indices.advice === 'number') setRandomAdviceIndex(saved.indices.advice);
				if (typeof saved.indices.prompt === 'number') setRandomPromptIndex(saved.indices.prompt);
				if (typeof saved.indices.quote === 'number') setRandomQuoteIndex(saved.indices.quote);
			}

			// Important: Load the randomized trivia order if it was saved
			if (saved.triviaOptions) {
				setTriviaOptions(saved.triviaOptions);
			}
		}

		setShowSurveyLabel(true);

		// Pick random values if not set by saved progress
		if (ADVICE.length > 0 && randomAdviceIndex === null) setRandomAdviceIndex(Math.floor(Math.random() * ADVICE.length));
		if (PROMPTS.length > 0 && randomPromptIndex === null) setRandomPromptIndex(Math.floor(Math.random() * PROMPTS.length));
		if (TRIVIA.length > 0 && randomTriviaIndex === null) setRandomTriviaIndex(Math.floor(Math.random() * TRIVIA.length));
		if (QUOTES.length > 0 && scarLevel.currentScarLevel >= 1 && randomQuoteIndex === null) setRandomQuoteIndex(Math.floor(Math.random() * QUOTES.length));
	}, []);

	// Randomize Trivia Answers
	// This effect runs when the index changes. If we loaded triviaOptions from save, we skip this to preserve order.
	useEffect(() => {
		if (randomTriviaIndex !== null && TRIVIA[randomTriviaIndex] && !triviaOptions) {
			const original = TRIVIA[randomTriviaIndex];
			const source = original.answers.map((a, i) => ({ a, i }));

			// Fisher-Yates Shuffle
			for (let i = source.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[source[i], source[j]] = [source[j], source[i]];
			}

			const answersList = source.map(s => s.a);
			const correctLocalIndex = source.findIndex(s => s.i === original.correctIndex);

			setTriviaOptions({ answers: answersList, correctLocalIndex });

			// Store the correct index in answers for easy grading later
			setAnswers(prev => ({ ...prev, _triviaCorrectLocalIndex: correctLocalIndex }));
		}
	}, [randomTriviaIndex]);

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
		// Construct the save object
		const saveState = {
			savedAt: new Date().toISOString().split('T')[0],
			section: currentSection,
			answers: answers,
			journalText: journalText,
			triviaOptions: triviaOptions, // Save the randomized order
			indices: {
				trivia: randomTriviaIndex,
				advice: randomAdviceIndex,
				prompt: randomPromptIndex,
				quote: randomQuoteIndex,
			},
		};

		// Call the provider's save method without alert
		survey.saveProgress('night', saveState);
		router.back();
	};

	const submitSurvey = () => {
		const today = new Date().toISOString().split('T')[0];
		const alreadyDoneToday = survey.lastNightSurveyDate === today && survey.nightSurveyCompleted;
		let totalCoinsEarned = 0; // base awarded only if first completion
		let furyDelta = 0;

		// Mood affects fury
		const mood = answers.mood as number | undefined;
		if (typeof mood === 'number') furyDelta = moodOptions[mood].fury || 0;

		// Gather multiplier inputs
		const streakVal = streakCtx.getStreak ? streakCtx.getStreak() : streakCtx.streak ?? 0;
		const yangValue = fury.furyMeter;
		const dragonShardsCount = shards.shards ?? 0;
		const scar = scarLevel.currentScarLevel ?? 0;
		const snackMult = items.getActiveCoinMultiplier ? items.getActiveCoinMultiplier() : 1;
		const isPremiumFlag = premium.isPremium ?? false;

		if (!alreadyDoneToday) {
			const nightCoins = coins.calculateSurveyCoins(false, streakVal, yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag);
			totalCoinsEarned = nightCoins;
			coins.addCoins(nightCoins);
			shards.addShards(1);
			if (typeof fury.addFury === 'function') fury.addFury(furyDelta);
		}

		// Mark survey complete BEFORE calculating goal rewards
		survey.completeNightSurvey();

		// Goal rewards (only in evening survey). For retakes, only award for newly completed goals.
		let totalGoalCoins = 0;
		let totalGoalsCompleted = 0;

		const todayStr = new Date().toISOString().split('T')[0];
		const habitCompletedIds = goals.habits.filter(h => h.lastCompletedDate === todayStr).map(h => h.id);
		const todoCompletedIds = goals.todos.filter(t => t.completedDate === todayStr).map(t => t.id);
		const habitCompletedCount = habitCompletedIds.length;
		const todoCompletedCount = todoCompletedIds.length;
		totalGoalsCompleted = habitCompletedCount + todoCompletedCount;

		if (habitCompletedCount > 0) {
			const baseHabitCoins = 5 * habitCompletedCount + (goals.habits.some(h => h.streak >= 5) ? 5 : 0);
			if (!alreadyDoneToday) {
				const awarded = Math.floor(baseHabitCoins * coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag));
				coins.addCoins(awarded);
				totalGoalCoins += awarded;
				dragon.addHealthFromGoal(habitCompletedCount * 2);
			} else {
				const snap = survey.getNightSnapshot() || { habitIds: [], todoIds: [] };
				const newHabits = habitCompletedIds.filter(id => !snap.habitIds.includes(id));
				if (newHabits.length > 0) {
					const baseNew = 5 * newHabits.length + (goals.habits.some(h => h.streak >= 5) ? 5 : 0);
					const awarded = Math.floor(baseNew * coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag));
					coins.addCoins(awarded);
					totalGoalCoins += awarded;
					dragon.addHealthFromGoal(newHabits.length * 2);
				}
			}
		}
		if (todoCompletedCount > 0) {
			const baseTodoCoins = 10 * todoCompletedCount;
			if (!alreadyDoneToday) {
				const awarded = Math.floor(baseTodoCoins * coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag));
				coins.addCoins(awarded);
				totalGoalCoins += awarded;
				dragon.addHealthFromGoal(todoCompletedCount * 2);
			} else {
				const snap = survey.getNightSnapshot() || { habitIds: [], todoIds: [] };
				const newTodos = todoCompletedIds.filter(id => !snap.todoIds.includes(id));
				if (newTodos.length > 0) {
					const baseNew = 10 * newTodos.length;
					const awarded = Math.floor(baseNew * coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag));
					coins.addCoins(awarded);
					totalGoalCoins += awarded;
					dragon.addHealthFromGoal(newTodos.length * 2);
				}
			}
		}

		if (dragon.hp <= 0) {
			dragon.die();
		}

		// Prompt and trivia rewards only for first nightly completion
		if (!alreadyDoneToday) {
			// Prompt bonus
			if (answers.promptText && answers.promptText.trim()) {
				const extra = Math.floor(2 * coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag));
				coins.addCoins(extra);
				totalCoinsEarned += extra;
			}
			// Trivia reward
			if (answers.triviaAnswer !== undefined && typeof answers._triviaCorrectLocalIndex === 'number') {
				if (answers.triviaAnswer === answers._triviaCorrectLocalIndex) {
					const extra = Math.floor(2 * coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag));
					coins.addCoins(extra);
					totalCoinsEarned += extra;
				}
			}
		}

		const totalCoins = totalCoinsEarned + totalGoalCoins;
		const fireXPFromCoins = coins.calculateFireXP(totalCoins);
		const bonusFireXP = dragon.age * 10;
		if (!alreadyDoneToday) scarLevel.addXP?.(fireXPFromCoins + bonusFireXP);

		// Journal entry
		const moodLabel = typeof mood === 'number' ? moodOptions[mood].label : '';
		journal.addEntry({
			id: `entry_${today}_night_${Date.now()}`,
			date: today,
			surveyType: 'night',
			goalsCompleted: totalGoalsCompleted,
			schedulePercent: 0,
			text: journalText,
			moodEvening: moodLabel,
			rewards: { coins: totalCoins, xp: fireXPFromCoins + bonusFireXP, fury: furyDelta },
		});

		// Save snapshot for future retakes (store which goals were completed now)
		survey.recordNightSnapshot({ habitIds: habitCompletedIds, todoIds: todoCompletedIds });

		// Clear saved progress
		survey.clearProgress('night');

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

	if (showResults && results) {
		return (
			<View style={styles.container}>
				<TopHeader isHomePage={false} />
				<View style={styles.content}>
					<Text style={styles.title}>🌙 Survey Complete!</Text>
					<View style={styles.resultsCard}>
						<Text style={styles.resultText}>💰 Coins Earned: +{results.coinsEarned}</Text>
						<Text style={styles.resultText}>💎 Shards Earned: +{results.shardsEarned}</Text>
						<Text style={styles.resultText}>✨ fireXP Earned: +{results.xpEarned}</Text>
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
				<Text style={styles.surveyLabelText}>🌙 Night Survey</Text>
			</Animated.View>

			{/* Progress bar */}
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

			{/* Survey content */}
			<ScrollView style={styles.surveyContent} contentContainerStyle={styles.surveyContentInner}>
				<Text style={styles.surveyType}>🌙 Night Survey</Text>

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
						<Text style={{ marginBottom: 8 }}>Check off completed goals today. You can uncheck until you submit.</Text>
						<ScrollView style={styles.goalsScrollView} nestedScrollEnabled={true}>
							{goals.habits
								.filter(h => h.title.trim())
								.map(h => {
									const today = new Date().toISOString().split('T')[0];
									const isCompleted = answers[`habit_${h.id}`];
									const missedStreak = h.streak > 0 && h.lastCompletedDate && h.lastCompletedDate !== today && !isYesterday(h.lastCompletedDate);

									return (
										<View key={h.id}>
											<View style={[styles.habitRow, isCompleted ? styles.habitCompleted : null, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
												<Text selectable={false} style={styles.habitTitle}>
													{h.title}
												</Text>
												<Checkbox value={!!isCompleted} onValueChange={v => setAnswers({ ...answers, [`habit_${h.id}`]: v })} />
											</View>
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

				{/* TODO GOALS */}
				{section.key === 'todoGoals' && (
					<View>
						<Text style={styles.question}>To-Do Goals</Text>
						<Text style={{ marginBottom: 8 }}>Check off completed to-dos and their sub-goals. You can uncheck until you submit.</Text>

						{/* Suggested To‑Dos */}
						{goals.suggestedTodoGoals && goals.suggestedTodoGoals.length > 0 && (
							<>
								<Text style={{ marginTop: 8, marginBottom: 6, fontWeight: '700' }}>💡 Suggested To‑Dos</Text>
								{goals.suggestedTodoGoals.map(s => (
									<Pressable
										key={s.title}
										style={{ padding: 8, backgroundColor: '#fafafa', borderRadius: 8, marginBottom: 6 }}
										onPress={() => {
											goals.addTodo({ title: s.title });
											goals.rerollSuggestedTodos();
										}}>
										<Text>
											+ {s.title} — 💰 {s.coins} coins
										</Text>
									</Pressable>
								))}
								<Pressable style={{ padding: 8, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' }} onPress={() => goals.rerollSuggestedTodos()}>
									<Text>🔄 Re‑Roll To‑Do Suggestions</Text>
								</Pressable>
							</>
						)}
						<ScrollView style={styles.goalsScrollView} nestedScrollEnabled={true}>
							{goals.todos
								.filter(t => t.title.trim())
								.map(t => {
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
											{!canComplete && (
												<Text selectable={false} style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 4 }}>
													(Can complete after 1 day)
												</Text>
											)}
											{isCompleted && t.subGoals.length > 0 && (
												<View style={{ marginTop: 8 }}>
													{t.subGoals.map(sg => (
														<Pressable key={sg.id} style={styles.subGoalRow} onPress={() => goals.toggleSubGoal(t.id, sg.id)}>
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

				{/* TRIVIA */}
				{section.key === 'trivia' && randomTriviaIndex !== null && TRIVIA[randomTriviaIndex] && (
					<View>
						<Text style={styles.question}>Quick Trivia</Text>
						<Text selectable={false} style={{ marginBottom: 12 }}>
							{TRIVIA[randomTriviaIndex].text}
						</Text>
						<Text selectable={false} style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
							Select your answer:
						</Text>
						{(triviaOptions ? triviaOptions.answers : TRIVIA[randomTriviaIndex].answers).map((answer, i) => {
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
				{/* Bottom buttons: Previous / Next (Save moved to top X) */}
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

				{/* Previous Button */}
				<Pressable style={[styles.buttonSmall, { opacity: currentSection === 0 ? 0.5 : 1 }]} onPress={goBack} disabled={currentSection === 0}>
					<Text selectable={false} style={styles.buttonText}>
						Previous
					</Text>
				</Pressable>

				{/* Next/Submit Button */}
				<Pressable style={styles.buttonNext} onPress={goNext}>
					<Text selectable={false} style={styles.buttonTextPrimary}>
						{answers.triviaSubmitted && section.key === 'trivia' ? 'Next' : currentSection === totalSections - 1 ? 'Submit' : 'Next'}
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
	buttonContainer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16 },
	buttonSmall: { flex: 1, paddingVertical: 12, backgroundColor: '#fafafa', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
	buttonNext: { flex: 1, paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 8, alignItems: 'center' },
	buttonText: { fontSize: 14, fontWeight: '600', color: '#666' },
	buttonTextPrimary: { fontSize: 14, fontWeight: '600', color: '#fff' },
	smallButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#eee', borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
	smallButtonText: { fontSize: 13, fontWeight: '600', color: '#333' },
	miniButton: { width: 32, height: 32, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
	miniEditButton: { backgroundColor: '#2196F3' },
	miniButtonText: { fontSize: 14, color: '#fff' },
	moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
	moodButton: { width: '30%', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', marginBottom: 8 },
	moodSelected: { borderColor: '#4CAF50', backgroundColor: '#eefaf0' },
	moodEmoji: { fontSize: 24, marginBottom: 6 },
	moodLabel: { fontSize: 12, textAlign: 'center' },
	habitRow: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
	habitCompleted: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
	habitTitle: { fontSize: 16, fontWeight: '600' },
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
