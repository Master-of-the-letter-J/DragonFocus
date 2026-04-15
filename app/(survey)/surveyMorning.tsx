import { Text, View } from '@/components/Themed';
import TopHeader from '@/components/TopHeader';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useShards } from '@/context/DragonShardsProvider';
import { useFury } from '@/context/FuryProvider';
import { useItemEconomy } from '@/context/ItemEconomyProvider';
import { useItemSnacks } from '@/context/ItemSnacksProvider';
import { useJournal } from '@/context/JournalProvider';
import { usePremium } from '@/context/PremiumProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useExtraPromptsSection } from './surveySections/createExtraPrompts';
import { useHabitChecklistEditSection } from './surveySections/habitChecklistEdit';
import { useJournalEntrySection } from './surveySections/journalEntry';
import { useMoodQuestionSection } from './surveySections/moodQuestion';
import { useShortAnswersSection } from './surveySections/prompts';
import { useQuoteSection } from './surveySections/quoteSection';
import { useResultsSection, type SurveyResultsData } from './surveySections/results';
import { useSurveyAdviceSection } from './surveySections/surveyAdvice';
import { sectionStyles } from './surveySections/sectionStyles';
import { useTodoChecklistEditSection } from './surveySections/todoChecklistEdit';
import { useTriviaQuestionsSection } from './surveySections/triviaQuestions';

const countWords = (value: string) =>
	value
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;

export default function SurveyMorningPage() {
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
	const router = useRouter();

	const today = useMemo(() => new Date().toISOString().split('T')[0], []);

	const [currentSection, setCurrentSection] = useState(0);
	const [showSurveyLabel, setShowSurveyLabel] = useState(false);
	const [showIntroModal, setShowIntroModal] = useState(true);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState<SurveyResultsData | null>(null);
	const slideAnim = useRef(new Animated.Value(-100)).current;

	const advice = useSurveyAdviceSection();
	const mood = useMoodQuestionSection();
	const habitEdit = useHabitChecklistEditSection();
	const todoEdit = useTodoChecklistEditSection();
	const shortAnswers = useShortAnswersSection({ surveyType: 'morning' });
	const trivia = useTriviaQuestionsSection({ surveyType: 'morning' });
	const journalEntry = useJournalEntrySection({ surveyType: 'morning' });
	const extraPrompts = useExtraPromptsSection({ mode: 'create' });
	const quote = useQuoteSection({ surveyType: 'morning' });

	const resultsSection = useResultsSection({
		title: 'Morning Survey Complete!',
		results,
		onFinish: () => router.back(),
	});

	const sections = useMemo(() => {
		return [
			advice.section,
			mood.section,
			habitEdit.section,
			todoEdit.section,
			shortAnswers.section,
			trivia.section,
			journalEntry.section,
			extraPrompts.section,
			quote.section,
		].filter(section => section.isEnabled);
	}, [advice.section, mood.section, habitEdit.section, todoEdit.section, shortAnswers.section, trivia.section, journalEntry.section, extraPrompts.section, quote.section]);

	const totalSections = sections.length;
	const section = sections[currentSection];
	const canProceed = section?.enableNext ? section.isNextEnabled : true;

	useEffect(() => {
		if (currentSection > totalSections - 1) {
			setCurrentSection(Math.max(0, totalSections - 1));
		}
	}, [currentSection, totalSections]);

	useEffect(() => {
		const t = setTimeout(() => setShowIntroModal(false), 1000);
		return () => clearTimeout(t);
	}, []);

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
		const saved = survey.loadProgress?.('morning');
		if (saved && saved.savedAt === today) {
			if (typeof saved.section === 'number') setCurrentSection(saved.section);
			const data = saved.sectionData ?? {};
			advice.restoreState(data.advice);
			mood.restoreState(data.mood);
			habitEdit.restoreState(data.habitEdit);
			todoEdit.restoreState(data.todoEdit);
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
				habitEdit: habitEdit.saveState(),
				todoEdit: todoEdit.saveState(),
				shortAnswers: shortAnswers.saveState(),
				trivia: trivia.saveState(),
				journal: journalEntry.saveState(),
				extraPrompts: extraPrompts.saveState(),
				quote: quote.saveState(),
			},
			progressPercent: totalSections ? Math.floor(((currentSection + 1) / totalSections) * 100) : 0,
		};
		survey.saveProgress?.('morning', saveState);
		router.back();
	};

	const submitSurvey = () => {
		const alreadyDoneToday = survey.lastMorningSurveyDate === today && survey.morningSurveyCompleted;
		let totalCoinsEarned = 0;
		let rewardShards = 0;
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
			const morningCoins = typeof coins?.calculateSurveyCoins === 'function' ? coins.calculateSurveyCoins(true, streakVal, yangValue, dragonShardsCount, scar, snackMult, isPremiumFlag) : 0;
			totalCoinsEarned += morningCoins;
			coins.addCoins?.(morningCoins);
			rewardShards += 1;
			shards.addShards?.(1);

			const promptRewardCount = Object.values(shortAnswers.state.responses).filter(text => countWords(text) >= 25).length;
			if (promptRewardCount > 0) {
				const extra = Math.floor(5 * promptRewardCount * coinMultiplier);
				coins.addCoins?.(extra);
				totalCoinsEarned += extra;
			}

			if (trivia.section.isEnabled) {
				const correctCount = trivia.correctCount();
				const incorrectCount = Math.max(0, trivia.state.items.length - correctCount);
				const triviaCoins = Math.floor(correctCount * 5 * jeopardyMultiplier * coinMultiplier);
				if (triviaCoins > 0) {
					coins.addCoins?.(triviaCoins);
					totalCoinsEarned += triviaCoins;
				}
				if (jeopardyMultiplier > 1 && incorrectCount > 0) {
					const penalty = Math.min(coins.getCoins?.() ?? 0, Math.floor(incorrectCount * 5 * jeopardyMultiplier));
					if (penalty > 0) {
						coins.spendCoins?.(penalty);
						totalCoinsEarned -= penalty;
					}
				}
			}

			const surveyBonus = itemSnacks.getSurveyCompletionBonus?.(Math.max(0, totalCoinsEarned), rewardShards, scar);
			if (surveyBonus) {
				const bonusCoins = Math.max(0, surveyBonus.finalCoins - Math.max(0, totalCoinsEarned));
				const bonusShards = Math.max(0, surveyBonus.finalShards - rewardShards);
				if (bonusCoins > 0) {
					coins.addCoins?.(bonusCoins);
					totalCoinsEarned += bonusCoins;
				}
				if (bonusShards > 0) {
					shards.addShards?.(bonusShards);
					rewardShards += bonusShards;
				}
				if ((surveyBonus.snackDrops ?? 0) > 0) {
					itemSnacks.grantRandomUnlockedSnacks?.(surveyBonus.snackDrops, scar);
				}
			}
		}

		if (!alreadyDoneToday && typeof fury.addFury === 'function') {
			fury.addFury(furyDelta);
			const healthDelta = 2 - furyDelta;
			if (healthDelta > 0) dragon.healHp?.(healthDelta);
			if (healthDelta < 0) dragon.damageHp?.(Math.abs(healthDelta));
		}

		const fireXPFromCoins = typeof coins?.calculateFireXP === 'function' ? coins.calculateFireXP(totalCoinsEarned) : 0;
		const xpEarned = alreadyDoneToday ? 0 : fireXPFromCoins;
		const effectiveFury = alreadyDoneToday ? 0 : furyDelta;
		if (!alreadyDoneToday) scarLevel.addXP?.(fireXPFromCoins);

		survey.completeMorningSurvey?.();

		const promptText = Object.values(shortAnswers.state.responses)
			.map(text => text.trim())
			.filter(Boolean)
			.join('\n\n');

		journal.addEntry?.({
			id: `morning-${today}-${Date.now()}`,
			date: today,
			surveyType: 'morning',
			goalsCompleted: habitEdit.state.localHabits.length,
			goalsIncomplete: 0,
			rewards: { coins: totalCoinsEarned, fireXp: xpEarned, xp: xpEarned, fury: effectiveFury, shards: rewardShards },
			text: journalEntry.section.isEnabled ? journalEntry.state.text : undefined,
			promptText: promptText || undefined,
			moodMorning: moodLabel,
			todoCount: todoEdit.state.localTodos.length,
			todoCompleted: 0,
			todoFailed: 0,
			plannedHabitTitles: habitEdit.state.localHabits.map(habit => habit.title).filter(Boolean),
			plannedTodoTitles: todoEdit.state.localTodos.map(todo => todo.title).filter(Boolean),
		});

		setResults({
			coinsEarned: totalCoinsEarned,
			shardsEarned: rewardShards,
			xpEarned: xpEarned,
			furyDelta: effectiveFury,
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
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={sectionStyles.container}>
				<TopHeader isHomePage={false} />

				<Modal visible={showIntroModal} transparent animationType="fade">
					<View style={sectionStyles.fullscreenIntro}>
						<View style={sectionStyles.introInner}>
							<Text style={sectionStyles.introTitle}>Morning Survey</Text>
							<Text style={{ marginTop: 8, textAlign: 'center' }}>Preparing your questions...</Text>
						</View>
					</View>
				</Modal>

				<Animated.View style={[sectionStyles.surveyLabelContainer, { transform: [{ translateY: slideAnim }] }]}>
					<Text style={sectionStyles.surveyLabelText}>Morning Survey</Text>
				</Animated.View>

				<View style={sectionStyles.progressContainer}>
					<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
						<View style={{ flex: 1 }}>
							<View style={sectionStyles.progressBar}>
								<View style={[sectionStyles.progressFill, { width: `${((currentSection + 1) / Math.max(1, totalSections)) * 100}%` }]} />
							</View>
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
					{currentSection > 0 && (
						<Pressable style={sectionStyles.buttonPrevious} onPress={goBack}>
							<Text selectable={false} style={sectionStyles.buttonText}>
								Previous
							</Text>
						</Pressable>
					)}

					<Pressable style={[sectionStyles.buttonNext, !canProceed && sectionStyles.buttonDisabled]} onPress={goNext} disabled={!canProceed}>
						<Text selectable={false} style={sectionStyles.buttonTextPrimary}>
							{currentSection === totalSections - 1 ? 'Submit' : 'Next'}
						</Text>
					</Pressable>
				</View>
			</View>
		</GestureHandlerRootView>
	);
}






