import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

type SurveyType = 'morning' | 'night';

interface SurveyOptions {
	showQuote: boolean;
	enableJournalMorning: boolean;
	enableJournalNight: boolean;
	enableMoodQuestion: boolean;
	enableProjectQuestion: boolean;
	dayChecklistType: 'simple' | 'importance' | 'category';
	enableAdvice?: boolean;
	adviceScarLevel?: number;
	randomPromptCount?: number;
	randomPromptMorningCount?: number;
	randomPromptNightCount?: number;
	enableRandomMC?: boolean;
	quoteMorning?: boolean;
}

export interface GoalRewardSnapshot {
	habitIds: string[];
	todoIds: string[];
}

export interface SurveyProgressState {
	savedAt: string;
	section: number;
	progressPercent: number;
	sectionData?: Record<string, any>;
	completed?: boolean;
	lastSnapshot?: GoalRewardSnapshot;
}

interface SurveyStoreState {
	morningSurveyCompleted: boolean;
	nightSurveyCompleted: boolean;
	lastMorningSurveyDate: string | null;
	lastNightSurveyDate: string | null;
	savedMorning: SurveyProgressState | null;
	savedNight: SurveyProgressState | null;
	eveningPromptsByDate: Record<string, string[]>;
	rewardedGoalsByDate: Record<string, GoalRewardSnapshot>;
	options: SurveyOptions;
}

interface SurveyContextType {
	morningSurveyCompleted: boolean;
	nightSurveyCompleted: boolean;
	lastMorningSurveyDate: string | null;
	lastNightSurveyDate: string | null;
	currentSurveyType: SurveyType | null;
	completeMorningSurvey: (payload?: SurveyProgressState | null) => void;
	completeNightSurvey: (payload?: SurveyProgressState | null) => void;
	resetDailySurveys: () => void;
	forceNewDay: () => void;
	setLastMorningSurveyDate: (date: string | null) => void;
	setLastNightSurveyDate: (date: string | null) => void;
	canTakeMorningSurvey: () => boolean;
	canTakeNightSurvey: () => boolean;
	getMorningProgress: () => number;
	getNightProgress: () => number;
	saveProgress: (type: SurveyType, payload: SurveyProgressState) => void;
	loadProgress: (type: SurveyType) => SurveyProgressState | null;
	clearProgress: (type: SurveyType) => void;
	recordNightSnapshot: (snapshot: GoalRewardSnapshot) => void;
	getNightSnapshot: () => GoalRewardSnapshot | null;
	recordGoalRewards: (date: string, snapshot: GoalRewardSnapshot) => void;
	getRewardedGoals: (date: string) => GoalRewardSnapshot;
	getEveningPrompts: (date: string) => string[];
	setEveningPrompts: (date: string, prompts: string[]) => void;
	clearEveningPrompts: (date: string) => void;
	options: SurveyOptions;
	setOption: <K extends keyof SurveyOptions>(key: K, value: SurveyOptions[K]) => void;
	setSurveyType: (type: SurveyType | null) => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

const DEFAULT_SURVEY_OPTIONS: SurveyOptions = {
	showQuote: true,
	enableJournalMorning: true,
	enableJournalNight: true,
	enableMoodQuestion: true,
	enableProjectQuestion: true,
	dayChecklistType: 'simple',
	enableAdvice: true,
	adviceScarLevel: 2,
	randomPromptCount: 1,
	randomPromptMorningCount: 1,
	randomPromptNightCount: 1,
	enableRandomMC: true,
	quoteMorning: true,
};

const EMPTY_GOAL_REWARDS: GoalRewardSnapshot = {
	habitIds: [],
	todoIds: [],
};

const INITIAL_SURVEY_STATE: SurveyStoreState = {
	morningSurveyCompleted: false,
	nightSurveyCompleted: false,
	lastMorningSurveyDate: null,
	lastNightSurveyDate: null,
	savedMorning: null,
	savedNight: null,
	eveningPromptsByDate: {},
	rewardedGoalsByDate: {},
	options: DEFAULT_SURVEY_OPTIONS,
};

const getTodayKey = () => new Date().toISOString().split('T')[0];

const normalizeGoalRewardSnapshot = (snapshot?: Partial<GoalRewardSnapshot> | null): GoalRewardSnapshot => ({
	habitIds: Array.isArray(snapshot?.habitIds) ? Array.from(new Set(snapshot.habitIds.filter(Boolean))) : [],
	todoIds: Array.isArray(snapshot?.todoIds) ? Array.from(new Set(snapshot.todoIds.filter(Boolean))) : [],
});

const mergeGoalRewardSnapshots = (current?: GoalRewardSnapshot | null, next?: GoalRewardSnapshot | null) => {
	return {
		habitIds: Array.from(new Set([...(current?.habitIds ?? []), ...(next?.habitIds ?? [])])),
		todoIds: Array.from(new Set([...(current?.todoIds ?? []), ...(next?.todoIds ?? [])])),
	};
};

const normalizeSurveyProgress = (progress?: Partial<SurveyProgressState> | null): SurveyProgressState | null => {
	if (!progress) return null;

	return {
		savedAt: typeof progress.savedAt === 'string' ? progress.savedAt : getTodayKey(),
		section: typeof progress.section === 'number' ? progress.section : 0,
		progressPercent: typeof progress.progressPercent === 'number' ? progress.progressPercent : 0,
		sectionData: progress.sectionData ?? {},
		completed: !!progress.completed,
		lastSnapshot: progress.lastSnapshot ? normalizeGoalRewardSnapshot(progress.lastSnapshot) : undefined,
	};
};

const mergeSurveyProgress = (current: SurveyProgressState | null, next: SurveyProgressState | null) => {
	if (!next) return current;
	if (!current) return next;

	return {
		...current,
		...next,
		sectionData: next.sectionData ?? current.sectionData ?? {},
		completed: current.completed || next.completed || false,
		lastSnapshot: next.lastSnapshot ? mergeGoalRewardSnapshots(current.lastSnapshot, next.lastSnapshot) : current.lastSnapshot,
	};
};

const normalizeSurveyOptions = (options?: Partial<SurveyOptions> | null): SurveyOptions => ({
	...DEFAULT_SURVEY_OPTIONS,
	...(options ?? {}),
});

const normalizeSurveyState = (storedState: SurveyStoreState | null, initialState: SurveyStoreState): SurveyStoreState => {
	if (!storedState) return initialState;

	return {
		morningSurveyCompleted: !!storedState.morningSurveyCompleted,
		nightSurveyCompleted: !!storedState.nightSurveyCompleted,
		lastMorningSurveyDate: storedState.lastMorningSurveyDate ?? null,
		lastNightSurveyDate: storedState.lastNightSurveyDate ?? null,
		savedMorning: normalizeSurveyProgress(storedState.savedMorning),
		savedNight: normalizeSurveyProgress(storedState.savedNight),
		eveningPromptsByDate: storedState.eveningPromptsByDate ?? {},
		rewardedGoalsByDate: Object.fromEntries(
			Object.entries(storedState.rewardedGoalsByDate ?? {}).map(([date, snapshot]) => [date, normalizeGoalRewardSnapshot(snapshot)]),
		),
		options: normalizeSurveyOptions(storedState.options),
	};
};

export function SurveyProvider({ children }: { children: ReactNode }) {
	const { state, setState, hasHydrated } = usePersistedState(APP_STORAGE_KEYS.survey, INITIAL_SURVEY_STATE, { normalize: normalizeSurveyState });
	const [currentSurveyType, setCurrentSurveyType] = useState<SurveyType | null>(null);

	const resetDailySurveys = () => {
		const today = getTodayKey();
		setState(current => ({
			...current,
			morningSurveyCompleted: current.lastMorningSurveyDate === today ? current.morningSurveyCompleted : false,
			nightSurveyCompleted: current.lastNightSurveyDate === today ? current.nightSurveyCompleted : false,
			savedMorning: current.savedMorning?.savedAt === today ? current.savedMorning : null,
			savedNight: current.savedNight?.savedAt === today ? current.savedNight : null,
		}));
	};

	const forceNewDay = () => {
		const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
		setState(current => ({
			...current,
			lastMorningSurveyDate: yesterday,
			lastNightSurveyDate: yesterday,
			morningSurveyCompleted: false,
			nightSurveyCompleted: false,
			savedMorning: null,
			savedNight: null,
		}));
	};

	useEffect(() => {
		if (!hasHydrated) return;
		resetDailySurveys();
	}, [hasHydrated, state.lastMorningSurveyDate, state.lastNightSurveyDate]);

	const completeMorningSurvey = (payload?: SurveyProgressState | null) => {
		const today = getTodayKey();
		setState(current => ({
			...current,
			morningSurveyCompleted: true,
			lastMorningSurveyDate: today,
			savedMorning: payload
				? mergeSurveyProgress(
						current.savedMorning,
						normalizeSurveyProgress({
							...payload,
							savedAt: today,
							progressPercent: 100,
							completed: true,
						}),
					)
				: current.savedMorning,
		}));
	};

	const completeNightSurvey = (payload?: SurveyProgressState | null) => {
		const today = getTodayKey();
		setState(current => ({
			...current,
			nightSurveyCompleted: true,
			lastNightSurveyDate: today,
			savedNight: payload
				? mergeSurveyProgress(
						current.savedNight,
						normalizeSurveyProgress({
							...payload,
							savedAt: today,
							progressPercent: 100,
							completed: true,
						}),
					)
				: current.savedNight,
		}));
	};

	const saveProgress = (type: SurveyType, payload: SurveyProgressState) => {
		const normalizedPayload = normalizeSurveyProgress({
			...payload,
			savedAt: getTodayKey(),
		});

		setState(current => ({
			...current,
			savedMorning: type === 'morning' ? mergeSurveyProgress(current.savedMorning, normalizedPayload) : current.savedMorning,
			savedNight: type === 'night' ? mergeSurveyProgress(current.savedNight, normalizedPayload) : current.savedNight,
		}));
	};

	const loadProgress = (type: SurveyType) => {
		return type === 'morning' ? state.savedMorning : state.savedNight;
	};

	const clearProgress = (type: SurveyType) => {
		setState(current => ({
			...current,
			savedMorning: type === 'morning' ? null : current.savedMorning,
			savedNight: type === 'night' ? null : current.savedNight,
		}));
	};

	const recordGoalRewards = (date: string, snapshot: GoalRewardSnapshot) => {
		const normalizedSnapshot = normalizeGoalRewardSnapshot(snapshot);
		setState(current => ({
			...current,
			rewardedGoalsByDate: {
				...current.rewardedGoalsByDate,
				[date]: mergeGoalRewardSnapshots(current.rewardedGoalsByDate[date], normalizedSnapshot),
			},
		}));
	};

	const recordNightSnapshot = (snapshot: GoalRewardSnapshot) => {
		const today = getTodayKey();
		const normalizedSnapshot = normalizeGoalRewardSnapshot(snapshot);

		setState(current => ({
			...current,
			savedNight: mergeSurveyProgress(
				current.savedNight,
				normalizeSurveyProgress({
					savedAt: today,
					section: 0,
					progressPercent: current.savedNight?.progressPercent ?? 100,
					completed: current.savedNight?.completed ?? current.nightSurveyCompleted,
					sectionData: current.savedNight?.sectionData ?? {},
					lastSnapshot: normalizedSnapshot,
				}),
			),
			rewardedGoalsByDate: {
				...current.rewardedGoalsByDate,
				[today]: mergeGoalRewardSnapshots(current.rewardedGoalsByDate[today], normalizedSnapshot),
			},
		}));
	};

	const getNightSnapshot = () => {
		const today = getTodayKey();
		return state.rewardedGoalsByDate[today] ?? state.savedNight?.lastSnapshot ?? null;
	};

	const getRewardedGoals = (date: string) => state.rewardedGoalsByDate[date] ?? EMPTY_GOAL_REWARDS;

	const getEveningPrompts = (date: string) => state.eveningPromptsByDate[date] ?? [];

	const setEveningPrompts = (date: string, prompts: string[]) => {
		setState(current => ({
			...current,
			eveningPromptsByDate: { ...current.eveningPromptsByDate, [date]: prompts },
		}));
	};

	const clearEveningPrompts = (date: string) => {
		setState(current => {
			if (!(date in current.eveningPromptsByDate)) return current;

			const eveningPromptsByDate = { ...current.eveningPromptsByDate };
			delete eveningPromptsByDate[date];
			return {
				...current,
				eveningPromptsByDate,
			};
		});
	};

	const canTakeMorningSurvey = () => true;
	const canTakeNightSurvey = () => true;

	const getMorningProgress = () => {
		const today = getTodayKey();
		if (state.morningSurveyCompleted && state.lastMorningSurveyDate === today) return 100;
		return state.savedMorning?.savedAt === today ? state.savedMorning.progressPercent : 0;
	};

	const getNightProgress = () => {
		const today = getTodayKey();
		if (state.nightSurveyCompleted && state.lastNightSurveyDate === today) return 100;
		return state.savedNight?.savedAt === today ? state.savedNight.progressPercent : 0;
	};

	const setOption = <K extends keyof SurveyOptions>(key: K, value: SurveyOptions[K]) => {
		setState(current => ({
			...current,
			options: { ...current.options, [key]: value },
		}));
	};

	return (
		<SurveyContext.Provider
			value={{
				morningSurveyCompleted: state.morningSurveyCompleted,
				nightSurveyCompleted: state.nightSurveyCompleted,
				lastMorningSurveyDate: state.lastMorningSurveyDate,
				lastNightSurveyDate: state.lastNightSurveyDate,
				currentSurveyType,
				completeMorningSurvey,
				completeNightSurvey,
				resetDailySurveys,
				forceNewDay,
				setLastMorningSurveyDate: date =>
					setState(current => ({
						...current,
						lastMorningSurveyDate: date,
					})),
				setLastNightSurveyDate: date =>
					setState(current => ({
						...current,
						lastNightSurveyDate: date,
					})),
				canTakeMorningSurvey,
				canTakeNightSurvey,
				getMorningProgress,
				getNightProgress,
				saveProgress,
				loadProgress,
				clearProgress,
				recordNightSnapshot,
				getNightSnapshot,
				recordGoalRewards,
				getRewardedGoals,
				getEveningPrompts,
				setEveningPrompts,
				clearEveningPrompts,
				options: state.options,
				setOption,
				setSurveyType: setCurrentSurveyType,
			}}>
			{children}
		</SurveyContext.Provider>
	);
}

export function useSurvey() {
	const context = useContext(SurveyContext);
	if (!context) {
		throw new Error('useSurvey must be used within SurveyProvider');
	}
	return context;
}
