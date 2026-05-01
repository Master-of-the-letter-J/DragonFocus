import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { ReactNode, createContext, useContext, useMemo } from 'react';

export type SurveyType = 'morning' | 'night';

export interface JournalRewards {
	coins: number;
	fireXp?: number;
	xp?: number; // legacy fallback
	fury: number;
	shards?: number;
}

export interface JournalEntry {
	id: string;
	date: string; // YYYY-MM-DD
	surveyType: SurveyType;
	goalsCompleted: number;
	goalsIncomplete?: number;
	rewards: JournalRewards;
	text?: string;
	promptText?: string;
	triviaQuestion?: string;
	triviaResult?: string;
	triviaCorrect?: boolean;
	moodMorning?: string;
	moodEvening?: string;
	todoCount?: number;
	todoCompleted?: number;
	todoFailed?: number;
	plannedHabitTitles?: string[];
	plannedTodoTitles?: string[];
	completedHabitTitles?: string[];
	remainingHabitTitles?: string[];
	completedTodoTitles?: string[];
	pendingTodoTitles?: string[];
	failedTodoTitles?: string[];
}

export interface JournalDay {
	date: string;
	morning?: JournalEntry;
	evening?: JournalEntry;
}

interface JournalStoreState {
	entries: JournalEntry[];
	lairName: string;
}

interface JournalContextType {
	entries: JournalEntry[];
	lairName: string;
	setLairName: (name: string) => void;
	addEntry: (entry: JournalEntry) => void;
	getEntriesByDate: (date: string) => JournalEntry[];
	getEntriesByDay: () => JournalDay[];
}

const INITIAL_JOURNAL_STATE: JournalStoreState = {
	entries: [],
	lairName: "Dragon's Lair",
};

const JournalContext = createContext<JournalContextType | undefined>(undefined);

const normalizeJournalState = (storedState: JournalStoreState | null, initialState: JournalStoreState): JournalStoreState => {
	if (!storedState) return initialState;

	return {
		entries: Array.isArray(storedState.entries) ? storedState.entries : initialState.entries,
		lairName: typeof storedState.lairName === 'string' && storedState.lairName.trim().length > 0 ? storedState.lairName.trim() : initialState.lairName,
	};
};

export function JournalProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.journal, INITIAL_JOURNAL_STATE, { normalize: normalizeJournalState });

	const setLairName = (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;

		setState(current => ({
			...current,
			lairName: trimmed,
		}));
	};

	// Upsert by (date + surveyType) so retakes update the same row instead of duplicating.
	const addEntry = (entry: JournalEntry) => {
		setState(current => {
			const existingIndex = current.entries.findIndex(item => item.date === entry.date && item.surveyType === entry.surveyType);
			if (existingIndex < 0) {
				return {
					...current,
					entries: [entry, ...current.entries],
				};
			}

			const existing = current.entries[existingIndex];
			const merged: JournalEntry = {
				...existing,
				...entry,
				rewards: {
					...existing.rewards,
					...entry.rewards,
				},
				text: entry.text && entry.text.trim().length > 0 ? entry.text : existing.text,
				promptText: entry.promptText && entry.promptText.trim().length > 0 ? entry.promptText : existing.promptText,
				triviaQuestion: entry.triviaQuestion && entry.triviaQuestion.trim().length > 0 ? entry.triviaQuestion : existing.triviaQuestion,
				triviaResult: entry.triviaResult && entry.triviaResult.trim().length > 0 ? entry.triviaResult : existing.triviaResult,
			};

			const entries = [...current.entries];
			entries[existingIndex] = merged;
			entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.surveyType === 'night' ? -1 : 1));

			return {
				...current,
				entries,
			};
		});
	};

	const getEntriesByDate = (date: string) => state.entries.filter(entry => entry.date === date);

	const getEntriesByDay = () => {
		const grouped = new Map<string, JournalDay>();
		for (const entry of state.entries) {
			const currentDay = grouped.get(entry.date) ?? { date: entry.date };
			if (entry.surveyType === 'morning') currentDay.morning = entry;
			if (entry.surveyType === 'night') currentDay.evening = entry;
			grouped.set(entry.date, currentDay);
		}
		return Array.from(grouped.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
	};

	const value = useMemo(
		() => ({
			entries: state.entries,
			lairName: state.lairName,
			setLairName,
			addEntry,
			getEntriesByDate,
			getEntriesByDay,
		}),
		[state.entries, state.lairName],
	);

	return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
	const ctx = useContext(JournalContext);
	if (!ctx) throw new Error('useJournal must be used within JournalProvider');
	return ctx;
}
