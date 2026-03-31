import { Text, View } from '@/components/Themed';
import ProgressBar from '@/components/ProgressBar';
import TopHeader from '@/components/TopHeader';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useGoals } from '@/context/GoalsProvider';
import { useItems } from '@/context/ItemsProvider';
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
	30: { coins: 750, shards: 60 },
};

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
		let totalGoalCoins = 0;
		let furyDelta = 0;

		const moodIndex = mood.state.selectedIndex;
		const moodOptions = mood.moodOptions;
		const moodLabel = typeof moodIndex === 'number' && moodOptions[moodIndex] ? moodOptions[moodIndex].label : '';
		if (typeof moodIndex === 'number' && moodOptions[moodIndex]) furyDelta = moodOptions[moodIndex].fury || 0;

		const streakVal = typeof streakCtx?.getStreak === 'function' ? streakCtx.getStreak() : streakCtx?.streak ?? 0;
		const yangValue = fury?.furyMeter ?? 0;
		const dragonShardsCount = shards?.shards ?? 0;
		const scar = scarLevel?.currentScarLevel ?? 0;
		const snackMult = typeof items?.getActiveCoinMultiplier === 'function' ? items.getActiveCoinMultiplier() : 1;
		const isPremiumFlag = premium?.isPremium ?? false;

		if (!alreadyDoneToday) {
			const nightCoins = typeof coins?.calculateSurveyCoins === 'function' ? coins.calculateSurveyCoins(false, streakVal, yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 0;
			totalCoinsEarned += nightCoins;
			coins.addCoins?.(nightCoins);
			shards.addShards?.(1);
			if (typeof fury?.addFury === 'function') fury.addFury(furyDelta);
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
			const streakBonus = habitSnapshot.updatedHabits.some(h => (h.streak ?? 0) >= 5) ? 5 : 0;
			const baseHabitCoins = 5 * rewardHabitIds.length + streakBonus;
			const awarded = Math.floor(baseHabitCoins * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
			totalGoalCoins += awarded;
			coins.addCoins?.(awarded);
			dragon?.addHealthFromGoal?.(rewardHabitIds.length * 2);
		}

		if (rewardTodoIds.length > 0) {
			const baseTodoCoins = 10 * rewardTodoIds.length;
			const awarded = Math.floor(baseTodoCoins * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
			totalGoalCoins += awarded;
			coins.addCoins?.(awarded);
			dragon?.addHealthFromGoal?.(rewardTodoIds.length * 2);
		}

		const challengeFinishers = habitSnapshot.updatedHabits.filter(h => h.isChallenge && h.challengeLength && h.challengeStartDate && !h.challengeRewardClaimed && (h.streak ?? 0) >= (h.challengeLength ?? 0));
		if (challengeFinishers.length > 0) {
			challengeFinishers.forEach(h => {
				const len = Number(h.challengeLength);
				const reward = CHALLENGE_REWARDS[len] ?? { coins: 0, shards: 0 };
				if (reward.coins > 0) {
					coins?.addCoins?.(reward.coins);
					totalGoalCoins += reward.coins;
				}
				if (reward.shards > 0) {
					shards?.addShards?.(reward.shards);
				}
				goals?.editHabit?.(h.id, { challengeRewardClaimed: true });
			});
		}

		if (dragon?.hp <= 0) {
			dragon?.die?.();
		}

		if (!alreadyDoneToday) {
			const hasPromptText = Object.values({ ...shortAnswers.state.responses, ...extraPrompts.state.responses }).some(text => text.trim().length > 0);
			if (hasPromptText) {
				const extra = Math.floor(2 * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
				coins.addCoins?.(extra);
				totalCoinsEarned += extra;
			}

			const correctTriviaCount = trivia.correctCount();
			if (correctTriviaCount > 0) {
				const extra = Math.floor(2 * (typeof coins?.calculateCoinMultiplier === 'function' ? coins.calculateCoinMultiplier(yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 1));
				coins.addCoins?.(extra);
				totalCoinsEarned += extra;
			}
		}

		const totalCoins = totalCoinsEarned + totalGoalCoins;
		const fireXPFromCoins = typeof coins?.calculateFireXP === 'function' ? coins.calculateFireXP(totalCoins) : 0;
		const bonusFireXP = (dragon?.age ?? 0) * 10;

		const xpEarned = alreadyDoneToday ? 0 : fireXPFromCoins + bonusFireXP;
		const effectiveFury = alreadyDoneToday ? 0 : furyDelta;
		if (!alreadyDoneToday) scarLevel?.addXP?.(fireXPFromCoins + bonusFireXP);

		survey.completeNightSurvey?.();
		survey.recordNightSnapshot?.({ habitIds: habitSnapshot.completedHabitIds, todoIds: todoSnapshot.completedTodoIds });
		survey.clearProgress?.('night');
		survey.clearEveningPrompts?.(today);

		if (journalEntry.section.isEnabled) {
			const promptText = Object.values({ ...shortAnswers.state.responses, ...extraPrompts.state.responses })
				.map(text => text.trim())
				.filter(Boolean)
				.join('\n\n');

			journal.addEntry?.({
				id: `entry_${today}_night_${Date.now()}`,
				date: today,
				surveyType: 'night',
				goalsCompleted: totalGoalsCompleted,
				schedulePercent: 0,
				text: journalEntry.state.text,
				promptText: promptText || undefined,
				moodEvening: moodLabel,
				rewards: { coins: totalCoins, xp: xpEarned, fury: effectiveFury },
				triviaResult: trivia.section.isEnabled ? `${trivia.correctCount()}/${trivia.state.items.length}` : undefined,
				triviaCorrect: trivia.section.isEnabled ? trivia.correctCount() > 0 : undefined,
			});
		}

		setResults({
			coinsEarned: totalCoins,
			shardsEarned: alreadyDoneToday ? 0 : 1,
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






