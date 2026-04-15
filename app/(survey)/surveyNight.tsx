import { Text, View } from '@/components/Themed';
import ProgressBar from '@/components/ProgressBar';
import TopHeader from '@/components/TopHeader';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { useJournal } from '@/context/JournalProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView } from 'react-native';
import { useExtraPromptsSection } from './surveySections/createExtraPrompts';
import { useHabitChecklistFillSection } from './surveySections/habitChecklistFill';
import { useJournalEntrySection } from './surveySections/journalEntry';
import { useMoodQuestionSection } from './surveySections/moodQuestion';
import { useShortAnswersSection } from './surveySections/prompts';
import { useQuoteSection } from './surveySections/quoteSection';
import { useResultsSection, type SurveyResultsData } from './surveySections/results';
import { useSurveyAdviceSection } from './surveySections/surveyAdvice';
import { sectionStyles } from './surveySections/sectionStyles';
import { useTodoChecklistFillSection } from './surveySections/todoChecklistFill';
import { useTriviaQuestionsSection } from './surveySections/triviaQuestions';

const CHALLENGE_REWARDS: Record<number, { coins: number; shards: number }> = {
	7: { coins: 100, shards: 10 },
	14: { coins: 250, shards: 25 },
	30: { coins: 750, shards: 75 },
};

const DAY_MS = 24 * 60 * 60 * 1000;

const countWords = (value: string) =>
	value
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;

const diffDays = (start: string, end: string) => {
	const startMs = new Date(`${start}T00:00:00`).getTime();
	const endMs = new Date(`${end}T00:00:00`).getTime();
	return Math.max(0, Math.floor((endMs - startMs) / DAY_MS));
};

const getTodoReward = (todo: { dueDate?: string | null; createdAt: number; completedDate?: string | null }) => {
	const completedDate = todo.completedDate ?? new Date().toISOString().split('T')[0];
	const createdDate = new Date(todo.createdAt).toISOString().split('T')[0];

	if (!todo.dueDate || completedDate <= todo.dueDate) {
		if (!todo.dueDate) return { coins: 10, fury: -4 };
		const goalLengthDays = diffDays(createdDate, todo.dueDate) + 1;
		if (goalLengthDays > 30) return { coins: 60, fury: -24 };
		if (goalLengthDays >= 7) return { coins: 20, fury: -8 };
		return { coins: 10, fury: -4 };
	}

	const lateDays = diffDays(todo.dueDate, completedDate);
	if (lateDays > 30) return { coins: 10, fury: -1 };
	if (lateDays >= 7) return { coins: 5, fury: -1 };
	if (lateDays >= 1) return { coins: 2, fury: -1 };
	return { coins: 1, fury: -1 };
};

export default function SurveyNightPage() {
	const survey = useSurvey();
	const coins = useDragonCoins();
	const shards = useShards();
	const dragon = useDragon();
	const scarLevel = useScarLevel();
	const fury = useFury();
	const streakCtx = useStreak();
	const itemEconomy = useItemEconomy();
	const itemSnacks = useItemSnacks();
	const premium = usePremium();
	const journal = useJournal();
	const goals = useGoals();
	const router = useRouter();

	const today = useMemo(() => new Date().toISOString().split('T')[0], []);

	const [currentSection, setCurrentSection] = useState(0);
	const [showSurveyLabel, setShowSurveyLabel] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState<SurveyResultsData | null>(null);
	const slideAnim = useRef(new Animated.Value(-100)).current;

	const advice = useSurveyAdviceSection();
	const mood = useMoodQuestionSection();
	const habitFill = useHabitChecklistFillSection();
	const todoFill = useTodoChecklistFillSection();
	const shortAnswers = useShortAnswersSection({ surveyType: 'night' });
	const trivia = useTriviaQuestionsSection({ surveyType: 'night' });
	const journalEntry = useJournalEntrySection({ surveyType: 'night' });
	const extraPrompts = useExtraPromptsSection({ mode: 'answer' });
	const quote = useQuoteSection({ surveyType: 'night' });

	const resultsSection = useResultsSection({
		title: 'Night Survey Complete!',
		results,
		onFinish: () => router.back(),
	});

	const sections = useMemo(() => {
		return [
			advice.section,
			mood.section,
			habitFill.section,
			todoFill.section,
			shortAnswers.section,
			trivia.section,
			journalEntry.section,
			extraPrompts.section,
			quote.section,
		].filter(section => section.isEnabled);
	}, [advice.section, mood.section, habitFill.section, todoFill.section, shortAnswers.section, trivia.section, journalEntry.section, extraPrompts.section, quote.section]);

	const totalSections = sections.length;
	const section = sections[currentSection];
	const canProceed = section?.enableNext ? section.isNextEnabled : true;

	useEffect(() => {
		if (currentSection > totalSections - 1) {
			setCurrentSection(Math.max(0, totalSections - 1));
		}
	}, [currentSection, totalSections]);

	useEffect(() => {
		if (showSurveyLabel) {
			Animated.sequence([
				Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
				Animated.delay(1400),
				Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
			]).start(() => setShowSurveyLabel(false));
		}
	}, [showSurveyLabel, slideAnim]);

	useEffect(() => {
		const saved = survey.loadProgress?.('night');
		if (saved && saved.savedAt === today) {
			if (typeof saved.section === 'number') setCurrentSection(saved.section);
			const data = saved.sectionData ?? {};
			advice.restoreState(data.advice);
			mood.restoreState(data.mood);
			habitFill.restoreState(data.habitFill);
			todoFill.restoreState(data.todoFill);
			shortAnswers.restoreState(data.shortAnswers);
			trivia.restoreState(data.trivia);
			journalEntry.restoreState(data.journal);
			extraPrompts.restoreState(data.extraPrompts);
			quote.restoreState(data.quote);
		}
		setShowSurveyLabel(true);
	}, [survey, today]);

	const handleExitSurvey = () => {
		const saveState = {
			savedAt: today,
			section: currentSection,
			sectionData: {
				advice: advice.saveState(),
				mood: mood.saveState(),
				habitFill: habitFill.saveState(),
				todoFill: todoFill.saveState(),
				shortAnswers: shortAnswers.saveState(),
				trivia: trivia.saveState(),
				journal: journalEntry.saveState(),
				extraPrompts: extraPrompts.saveState(),
				quote: quote.saveState(),
			},
			progressPercent: totalSections ? Math.floor(((currentSection + 1) / totalSections) * 100) : 0,
		};
		survey.saveProgress?.('night', saveState);
		router.back();
	};

	const submitSurvey = () => {
		const alreadyDoneToday = survey.lastNightSurveyDate === today && survey.nightSurveyCompleted;
		let totalCoinsEarned = 0;
		let totalShardsEarned = 0;
		let furyDelta = 0;

		const moodIndex = mood.state.selectedIndex;
		const moodOptions = mood.moodOptions;
		const moodLabel = typeof moodIndex === 'number' && moodOptions[moodIndex] ? moodOptions[moodIndex].label : '';
		if (typeof moodIndex === 'number' && moodOptions[moodIndex]) furyDelta = moodOptions[moodIndex].fury || 0;

		const streakVal = typeof streakCtx?.getStreak === 'function' ? streakCtx.getStreak() : streakCtx?.streak ?? 0;
		const yangValue = fury?.furyMeter ?? 0;
		const dragonShardsCount = shards?.shards ?? 0;
		const scar = scarLevel?.currentScarLevel ?? 0;
		const snackMult = itemEconomy.getActiveCoinMultiplier();
		const jeopardyMultiplier = Math.max(1, itemEconomy.getActiveJeopardyMultiplier?.() ?? 1);
		const isPremiumFlag = premium?.isPremium ?? false;
		const coinMultiplier = typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1;

		if (!alreadyDoneToday) {
			const nightCoins = typeof coins?.calculateSurveyCoins === 'function' ? coins.calculateSurveyCoins(false, streakVal, yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 0;
			totalCoinsEarned += nightCoins;
			coins.addCoins?.(nightCoins);
			totalShardsEarned += 1;
			shards.addShards?.(1);
		}

		const habitSnapshot = habitFill.getCompletionSnapshot();
		const todoSnapshot = todoFill.getCompletionSnapshot();

		habitSnapshot.completedHabitIds.forEach(id => goals.completeHabitToday?.(id));
		todoSnapshot.completedTodoIds.forEach(id => goals.completeTodo?.(id));

		let rewardHabitIds = habitSnapshot.completedHabitIds;
		let rewardTodoIds = todoSnapshot.completedTodoIds;

		if (alreadyDoneToday) {
			const snap = survey.getNightSnapshot?.() || { habitIds: [], todoIds: [] };
			rewardHabitIds = habitSnapshot.completedHabitIds.filter(id => !snap.habitIds.includes(id));
			rewardTodoIds = todoSnapshot.completedTodoIds.filter(id => !snap.todoIds.includes(id));
		}

		const totalGoalsCompleted = habitSnapshot.completedHabitIds.length + todoSnapshot.completedTodoIds.length;

		if (rewardHabitIds.length > 0) {
			const baseHabitCoins = habitSnapshot.updatedHabits
				.filter(habit => rewardHabitIds.includes(habit.id))
				.reduce((sum, habit) => sum + 5 + Math.min(5, habit.streak ?? 0), 0);
			const awarded = Math.floor(baseHabitCoins * coinMultiplier);
			totalCoinsEarned += awarded;
			coins.addCoins?.(awarded);
			furyDelta -= rewardHabitIds.length * 2;
			dragon?.addHealthFromGoal?.(rewardHabitIds.length * 2);
		}

		if (rewardTodoIds.length > 0) {
			const todoRewards = todoSnapshot.updatedTodos.filter(todo => rewardTodoIds.includes(todo.id)).map(todo => getTodoReward(todo));
			const awarded = Math.floor(todoRewards.reduce((sum, reward) => sum + reward.coins, 0) * coinMultiplier);
			const furyReward = todoRewards.reduce((sum, reward) => sum + reward.fury, 0);
			totalCoinsEarned += awarded;
			coins.addCoins?.(awarded);
			furyDelta += furyReward;
			dragon?.addHealthFromGoal?.(rewardTodoIds.length * 2);
		}

		const todoChallengeFinishers = todoSnapshot.updatedTodos.filter(
			todo => todo.isChallenge && !!todo.dueDate && rewardTodoIds.includes(todo.id) && !todo.challengeRewardClaimed && !!todo.completedDate && todo.completedDate <= todo.dueDate,
		);
		if (todoChallengeFinishers.length > 0) {
			todoChallengeFinishers.forEach(todo => {
				if ((todo.rewardCoins ?? 0) > 0) {
					coins?.addCoins?.(todo.rewardCoins ?? 0);
					totalCoinsEarned += todo.rewardCoins ?? 0;
				}
				if ((todo.rewardShards ?? 0) > 0) {
					shards?.addShards?.(todo.rewardShards ?? 0);
					totalShardsEarned += todo.rewardShards ?? 0;
				}
				goals?.editTodo?.(todo.id, { challengeRewardClaimed: true, challengeStatus: 'completed' });
			});
		}

		const lateCompletedChallengeTodos = todoSnapshot.updatedTodos.filter(
			todo => todo.isChallenge && !!todo.dueDate && rewardTodoIds.includes(todo.id) && !!todo.completedDate && todo.completedDate > todo.dueDate,
		);
		lateCompletedChallengeTodos.forEach(todo => goals?.editTodo?.(todo.id, { challengeStatus: 'failed' }));

		const challengeFinishers = habitSnapshot.updatedHabits.filter(h => h.isChallenge && h.challengeLength && h.challengeStartDate && !h.challengeRewardClaimed && (h.streak ?? 0) >= (h.challengeLength ?? 0));
		if (challengeFinishers.length > 0) {
			challengeFinishers.forEach(h => {
				const len = Number(h.challengeLength);
				const reward = CHALLENGE_REWARDS[len] ?? { coins: 0, shards: 0 };
				if (reward.coins > 0) {
					coins?.addCoins?.(reward.coins);
					totalCoinsEarned += reward.coins;
				}
				if (reward.shards > 0) {
					shards?.addShards?.(reward.shards);
					totalShardsEarned += reward.shards;
				}
				goals?.editHabit?.(h.id, { challengeRewardClaimed: true });
			});
		}

		const overdueIncompleteTodoIds = todoSnapshot.updatedTodos
			.filter(todo => !!todo.dueDate && today > todo.dueDate && !todo.completedDate)
			.map(todo => todo.id);
		overdueIncompleteTodoIds.forEach(id => goals.failTodo?.(id, true));

		if (dragon?.hp <= 0) {
			dragon?.die?.();
		}

		if (!alreadyDoneToday) {
			const promptRewardCount = Object.values({ ...shortAnswers.state.responses, ...extraPrompts.state.responses }).filter(text => countWords(text) >= 25).length;
			if (promptRewardCount > 0) {
				const extra = Math.floor(5 * promptRewardCount * coinMultiplier);
				coins.addCoins?.(extra);
				totalCoinsEarned += extra;
			}

			if (trivia.section.isEnabled) {
				const correctTriviaCount = trivia.correctCount();
				const incorrectTriviaCount = Math.max(0, trivia.state.items.length - correctTriviaCount);
				const triviaCoins = Math.floor(correctTriviaCount * 5 * jeopardyMultiplier * coinMultiplier);
				if (triviaCoins > 0) {
					coins.addCoins?.(triviaCoins);
					totalCoinsEarned += triviaCoins;
				}
				if (jeopardyMultiplier > 1 && incorrectTriviaCount > 0) {
					const penalty = Math.min(coins.getCoins?.() ?? 0, Math.floor(incorrectTriviaCount * 5 * jeopardyMultiplier));
					if (penalty > 0) {
						coins.spendCoins?.(penalty);
						totalCoinsEarned -= penalty;
					}
				}
			}

			if (survey.lastMorningSurveyDate === today && survey.morningSurveyCompleted) {
				const bothBonusCoins = Math.floor((10 + Math.max(0, streakVal)) * coinMultiplier);
				coins.addCoins?.(bothBonusCoins);
				totalCoinsEarned += bothBonusCoins;
				shards.addShards?.(1);
				totalShardsEarned += 1;
				furyDelta -= Math.max(0, streakVal);
				streakCtx.incrementStreak?.();
			}

			const surveyBonus = itemSnacks.getSurveyCompletionBonus?.(Math.max(0, totalCoinsEarned), totalShardsEarned, scar);
			if (surveyBonus) {
				const bonusCoins = Math.max(0, surveyBonus.finalCoins - Math.max(0, totalCoinsEarned));
				const bonusShards = Math.max(0, surveyBonus.finalShards - totalShardsEarned);
				if (bonusCoins > 0) {
					coins.addCoins?.(bonusCoins);
					totalCoinsEarned += bonusCoins;
				}
				if (bonusShards > 0) {
					shards.addShards?.(bonusShards);
					totalShardsEarned += bonusShards;
				}
				if ((surveyBonus.snackDrops ?? 0) > 0) {
					itemSnacks.grantRandomUnlockedSnacks?.(surveyBonus.snackDrops, scar);
				}
			}
		}

		if (!alreadyDoneToday && typeof fury?.addFury === 'function') {
			fury.addFury(furyDelta);
			const healthDelta = 2 - furyDelta;
			if (healthDelta > 0) dragon.healHp?.(healthDelta);
			if (healthDelta < 0) dragon.damageHp?.(Math.abs(healthDelta));
		}

		const totalCoins = totalCoinsEarned;
		const fireXPFromCoins = typeof coins?.calculateFireXP === 'function' ? coins.calculateFireXP(totalCoins) : 0;
		const xpEarned = alreadyDoneToday ? 0 : fireXPFromCoins;
		const effectiveFury = alreadyDoneToday ? 0 : furyDelta;
		if (!alreadyDoneToday) scarLevel?.addXP?.(fireXPFromCoins);

		survey.completeNightSurvey?.();
		survey.recordNightSnapshot?.({ habitIds: habitSnapshot.completedHabitIds, todoIds: todoSnapshot.completedTodoIds });
		survey.clearProgress?.('night');
		survey.clearEveningPrompts?.(today);

		const promptText = Object.values({ ...shortAnswers.state.responses, ...extraPrompts.state.responses })
			.map(text => text.trim())
			.filter(Boolean)
			.join('\n\n');
		const completedHabitTitles = habitSnapshot.updatedHabits.filter(habit => habitSnapshot.completedHabitIds.includes(habit.id)).map(habit => habit.title);
		const remainingHabitTitles = habitSnapshot.updatedHabits.filter(habit => !habitSnapshot.completedHabitIds.includes(habit.id)).map(habit => habit.title);
		const completedTodoTitles = todoSnapshot.updatedTodos.filter(todo => todoSnapshot.completedTodoIds.includes(todo.id)).map(todo => todo.title);
		const pendingTodoTitles = todoSnapshot.updatedTodos
			.filter(todo => !todoSnapshot.completedTodoIds.includes(todo.id) && !todo.completedDate)
			.map(todo => todo.title);
		const failedTodoTitles = todoSnapshot.updatedTodos
			.filter(todo => (!!todo.dueDate && today > todo.dueDate && !todo.completedDate) || !!todo.failed || (!!todo.completedDate && !!todo.dueDate && todo.completedDate > todo.dueDate))
			.map(todo => todo.title);

		journal.addEntry?.({
			id: `entry_${today}_night_${Date.now()}`,
			date: today,
			surveyType: 'night',
			goalsCompleted: totalGoalsCompleted,
			goalsIncomplete: Math.max(0, goals.habits.length - habitSnapshot.completedHabitIds.length),
			text: journalEntry.section.isEnabled ? journalEntry.state.text : undefined,
			promptText: promptText || undefined,
			moodEvening: moodLabel,
			rewards: { coins: totalCoins, fireXp: xpEarned, xp: xpEarned, fury: effectiveFury, shards: totalShardsEarned },
			triviaResult: trivia.section.isEnabled ? `${trivia.correctCount()}/${trivia.state.items.length}` : undefined,
			triviaCorrect: trivia.section.isEnabled ? trivia.correctCount() > 0 : undefined,
			todoCount: goals.todos.length,
			todoCompleted: todoSnapshot.completedTodoIds.length,
			todoFailed: failedTodoTitles.length,
			completedHabitTitles,
			remainingHabitTitles,
			completedTodoTitles,
			pendingTodoTitles,
			failedTodoTitles,
		});

		setResults({
			coinsEarned: totalCoins,
			shardsEarned: totalShardsEarned,
			xpEarned: xpEarned,
			furyDelta: effectiveFury,
			goalsCompleted: totalGoalsCompleted,
		});
		setShowResults(true);
	};

	const goNext = () => {
		if (!canProceed) return;
		if (currentSection >= totalSections - 1) {
			submitSurvey();
		} else {
			setCurrentSection(prev => Math.min(prev + 1, totalSections - 1));
		}
	};

	const goBack = () => {
		setCurrentSection(prev => Math.max(prev - 1, 0));
	};

	if (showResults && results) {
		return (
			<View style={sectionStyles.container}>
				<TopHeader isHomePage={false} />
				{resultsSection.section.render()}
			</View>
		);
	}

	return (
		<View style={sectionStyles.container}>
			<TopHeader isHomePage={false} />

			<Animated.View style={[sectionStyles.surveyLabelContainer, { transform: [{ translateY: slideAnim }] }]}>
				<Text style={sectionStyles.surveyLabelText}>Night Survey</Text>
			</Animated.View>

			<View style={sectionStyles.progressContainer}>
				<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<View style={{ flex: 1 }}>
						<ProgressBar progress={Math.round(((currentSection + 1) / Math.max(1, totalSections)) * 100)} />
						<Text style={sectionStyles.progressText}>
							Question {currentSection + 1} of {totalSections}
						</Text>
					</View>
					<Pressable onPress={handleExitSurvey} style={sectionStyles.closeButton}>
						<Text style={sectionStyles.closeButtonText}>X</Text>
					</Pressable>
				</View>
			</View>

			<ScrollView style={sectionStyles.contentArea}>
				<View style={sectionStyles.surveyContent}>
					<View style={sectionStyles.surveyContentInner}>{section?.render()}</View>
				</View>
			</ScrollView>

			<View style={sectionStyles.buttonContainer}>
				<Pressable style={[sectionStyles.buttonSmall, currentSection === 0 ? { opacity: 0.6 } : null]} onPress={goBack} disabled={currentSection === 0}>
					<Text selectable={false} style={sectionStyles.buttonText}>
						Previous
					</Text>
				</Pressable>

				<Pressable style={[sectionStyles.buttonNext, { flex: 2 }, !canProceed && sectionStyles.buttonDisabled]} onPress={goNext} disabled={!canProceed}>
					<Text selectable={false} style={sectionStyles.buttonTextPrimary}>
						{currentSection === totalSections - 1 ? 'Submit' : 'Next'}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}






