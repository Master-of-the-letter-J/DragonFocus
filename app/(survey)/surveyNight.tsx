import { Text, View } from '@/components/Themed';
import ProgressBar from '@/components/ProgressBar';
import TopHeader from '@/components/TopHeader';
import { getHabitCompletionReward, getTodoCompletionReward } from '@/data/goal-reward-utils';
import { GOAL_CHALLENGE_TIERS, getHabitChallengeFailureDate, isGoalChallengeActive } from '@/data/goal-utils';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { useJournal } from '@/context/JournalProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useQuestions } from '@/context/QuestionProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey, type SurveyProgressState } from '@/context/SurveyProvider';
import { useTranscension } from '@/context/TranscensionProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView } from 'react-native';
import { useExtraPromptsSection } from './surveySections/createExtraPrompts';
import { useFunFactSection } from './surveySections/funFactSection';
import { useHabitChecklistFillSection } from './surveySections/habitChecklistFill';
import { useJournalEntrySection } from './surveySections/journalEntry';
import { useMoodQuestionSection } from './surveySections/moodQuestion';
import { useShortAnswersSection } from './surveySections/prompts';
import { useQuoteSection } from './surveySections/quoteSection';
import { useResultsSection, type SurveyResultsData } from './surveySections/results';
import { useSurveyAdviceSection } from './surveySections/surveyAdvice';
import { sectionStyles } from './surveySections/sectionStyles';
import { orderSurveySections } from './surveySections/orderSections';
import { useTodoChecklistFillSection } from './surveySections/todoChecklistFill';
import { useTriviaQuestionsSection } from './surveySections/triviaQuestions';

const countWords = (value: string) =>
	value
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;

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
	const questions = useQuestions();
	const journal = useJournal();
	const goals = useGoals();
	const transcension = useTranscension();
	const router = useRouter();

	const today = useMemo(() => new Date().toISOString().split('T')[0], []);
	const isRetake = survey.lastNightSurveyDate === today && survey.nightSurveyCompleted;

	const [currentSection, setCurrentSection] = useState(0);
	const [showSurveyLabel, setShowSurveyLabel] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState<SurveyResultsData | null>(null);
	const slideAnim = useRef(new Animated.Value(-100)).current;

	const advice = useSurveyAdviceSection();
	const mood = useMoodQuestionSection({
		readOnly: isRetake,
		lockedMessage: 'Mood is visible for refills, but it stays locked after your first night submission of the day.',
	});
	const habitFill = useHabitChecklistFillSection();
	const todoFill = useTodoChecklistFillSection();
	const shortAnswers = useShortAnswersSection({
		surveyType: 'night',
		readOnly: isRetake,
		lockedMessage: 'Short answers are locked on night refills and keep your original responses for today.',
	});
	const trivia = useTriviaQuestionsSection({ surveyType: 'night' });
	const funFacts = useFunFactSection({ surveyType: 'night' });
	const journalEntry = useJournalEntrySection({ surveyType: 'night' });
	const extraPrompts = useExtraPromptsSection({
		mode: 'answer',
		readOnly: isRetake,
		lockedMessage: 'Extra prompt answers are locked on night refills and keep your original responses for today.',
	});
	const quote = useQuoteSection({ surveyType: 'night' });

	const resultsSection = useResultsSection({
		title: 'Night Survey Complete!',
		results,
		onFinish: () => router.back(),
	});

	const sections = useMemo(() => {
		const fullSurveySections = [
			advice.section,
			mood.section,
			habitFill.section,
			todoFill.section,
			shortAnswers.section,
			extraPrompts.section,
			trivia.section,
			funFacts.section,
			journalEntry.section,
			quote.section,
		];

		return orderSurveySections(fullSurveySections.filter(section => section.isEnabled), questions.questionSettings.nightOrder);
	}, [advice.section, extraPrompts.section, funFacts.section, habitFill.section, journalEntry.section, mood.section, questions.questionSettings.nightOrder, quote.section, shortAnswers.section, todoFill.section, trivia.section]);

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
			funFacts.restoreState(data.funFacts);
			journalEntry.restoreState(data.journal);
			extraPrompts.restoreState(data.extraPrompts);
			quote.restoreState(data.quote);
		}
		setShowSurveyLabel(true);
	}, [survey, today]);

	const buildSaveState = (overrides: Partial<SurveyProgressState> = {}): SurveyProgressState => ({
		savedAt: today,
		section: currentSection,
		sectionData: {
			advice: advice.saveState(),
			mood: mood.saveState(),
			habitFill: habitFill.saveState(),
			todoFill: todoFill.saveState(),
			shortAnswers: shortAnswers.saveState(),
			trivia: trivia.saveState(),
			funFacts: funFacts.saveState(),
			journal: journalEntry.saveState(),
			extraPrompts: extraPrompts.saveState(),
			quote: quote.saveState(),
		},
		progressPercent: totalSections ? Math.floor(((currentSection + 1) / totalSections) * 100) : 0,
		...overrides,
	});

	const handleExitSurvey = () => {
		const saveState = buildSaveState();
		survey.saveProgress?.('night', saveState);
		router.back();
	};

	const submitSurvey = () => {
		const alreadyDoneToday = isRetake;
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
		const surveyDuplicationMultiplier = transcension.getSurveyDuplicationMultiplier();

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

		const rewardSnapshot = { habitIds: rewardHabitIds, todoIds: rewardTodoIds };

		const totalGoalsCompleted = habitSnapshot.completedHabitIds.length + todoSnapshot.completedTodoIds.length;

		if (rewardHabitIds.length > 0) {
			const habitRewards = habitSnapshot.updatedHabits
				.filter(habit => rewardHabitIds.includes(habit.id))
				.map(habit => getHabitCompletionReward(habit));
			const awarded = Math.floor(habitRewards.reduce((sum, reward) => sum + reward.coins, 0) * coinMultiplier);
			const furyReward = habitRewards.reduce((sum, reward) => sum + reward.fury, 0);
			totalCoinsEarned += awarded;
			coins.addCoins?.(awarded);
			furyDelta += furyReward;
			dragon?.addHealthFromGoal?.(rewardHabitIds.length * 2);
		}

		if (rewardTodoIds.length > 0) {
			const todoRewards = todoSnapshot.updatedTodos.filter(todo => rewardTodoIds.includes(todo.id)).map(todo => getTodoCompletionReward(todo));
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

		const challengeFinishers = habitSnapshot.updatedHabits.filter(h => isGoalChallengeActive(h) && h.challengeLength && h.challengeStartDate && (h.streak ?? 0) >= (h.challengeLength ?? 0));
		if (challengeFinishers.length > 0) {
			challengeFinishers.forEach(h => {
				const reward = GOAL_CHALLENGE_TIERS.find(tier => tier.days === Number(h.challengeLength)) ?? { rewardCoins: 0, rewardShards: 0 };
				if (reward.rewardCoins > 0) {
					coins?.addCoins?.(reward.rewardCoins);
					totalCoinsEarned += reward.rewardCoins;
				}
				if (reward.rewardShards > 0) {
					shards?.addShards?.(reward.rewardShards);
					totalShardsEarned += reward.rewardShards;
				}
				goals?.editHabit?.(h.id, { challengeRewardClaimed: true, challengeStatus: 'completed' });
			});
		}

		goals.habits.forEach(habit => {
			const completedToday = habitSnapshot.completedHabitIds.includes(habit.id);
			const failureDate = getHabitChallengeFailureDate(habit, today, completedToday);
			if (!failureDate) return;

			goals.editHabit?.(habit.id, {
				challengeStatus: 'failed',
				challengeFailedDate: failureDate,
			});
		});

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
					itemSnacks.grantRandomUnlockedSnacks?.(surveyBonus.snackDrops * surveyDuplicationMultiplier, scar);
				}
			}

			if (surveyDuplicationMultiplier > 1) {
				const duplicatedCoins = Math.max(0, totalCoinsEarned * (surveyDuplicationMultiplier - 1));
				const duplicatedShards = Math.max(0, totalShardsEarned * (surveyDuplicationMultiplier - 1));
				if (duplicatedCoins > 0) {
					coins.addCoins?.(duplicatedCoins);
					totalCoinsEarned += duplicatedCoins;
				}
				if (duplicatedShards > 0) {
					shards.addShards?.(duplicatedShards);
					totalShardsEarned += duplicatedShards;
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
		if (!alreadyDoneToday) {
			coins.registerSurveyCoins?.(Math.max(0, totalCoins));
		}
		const xpEarned = alreadyDoneToday ? 0 : scarLevel?.addSurveyXP?.(Math.max(0, totalCoins), dragon.age, isPremiumFlag) ?? 0;
		const effectiveFury = alreadyDoneToday ? 0 : furyDelta;

		const completedSaveState = buildSaveState({
			section: 0,
			progressPercent: 100,
			completed: true,
			lastSnapshot: rewardSnapshot,
		});
		survey.completeNightSurvey?.(completedSaveState);
		survey.recordNightSnapshot?.(rewardSnapshot);
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
		const blockedHabitRewards = habitSnapshot.updatedHabits.filter(habit => rewardHabitIds.includes(habit.id) && getHabitCompletionReward(habit).rewardBlocked).map(habit => habit.title);
		const blockedTodoRewards = todoSnapshot.updatedTodos.filter(todo => rewardTodoIds.includes(todo.id) && getTodoCompletionReward(todo).rewardBlocked).map(todo => todo.title);

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
			groups: [
				...(alreadyDoneToday ? [{ title: 'Retake Notes', entries: ['This was a refill survey, so locked answers stayed visible and only still-open goal progress could change.'] }] : []),
				{
					title: 'Survey Answers',
					entries: [
						moodLabel ? `Mood: ${moodLabel}` : 'Mood question skipped',
						trivia.section.isEnabled ? `Trivia score: ${trivia.correctCount()}/${trivia.state.items.length}` : 'Trivia skipped',
						journalEntry.section.isEnabled ? `Journal entry length: ${journalEntry.state.text.trim().length} characters` : 'Journal entry skipped',
					],
				},
				{
					title: 'Habit Goals',
					entries: completedHabitTitles.length > 0 ? completedHabitTitles.map(title => `Completed: ${title}`) : ['No habit goals completed'],
				},
				{
					title: 'To-Do Goals',
					entries:
						completedTodoTitles.length > 0
							? completedTodoTitles.map(title => `Completed: ${title}`)
							: pendingTodoTitles.length > 0
								? pendingTodoTitles.map(title => `Still open: ${title}`)
								: ['No to-do goals completed'],
				},
				{
					title: 'Reward Notes',
					entries: [
						...(failedTodoTitles.length > 0 ? failedTodoTitles.map(title => `Late or failed: ${title}`) : ['No late or failed to-dos']),
						...(blockedHabitRewards.length > 0 ? blockedHabitRewards.map(title => `No normal habit reward yet: ${title}`) : []),
						...(blockedTodoRewards.length > 0 ? blockedTodoRewards.map(title => `No normal to-do reward yet: ${title}`) : []),
					],
				},
			],
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






