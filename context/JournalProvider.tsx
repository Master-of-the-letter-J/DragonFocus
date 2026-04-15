import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react';

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

interface JournalContextType {
	entries: JournalEntry[];
	lairName: string;
	setLairName: (name: string) => void;
	addEntry: (entry: JournalEntry) => void;
	getEntriesByDate: (date: string) => JournalEntry[];
	getEntriesByDay: () => JournalDay[];
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
	const [entries, setEntries] = useState<JournalEntry[]>([]);
	const [lairName, setLairNameState] = useState("Dragon's Lair");

	const setLairName = (name: string) => {
		const trimmed = name.trim();
		if (!trimmed) return;
		setLairNameState(trimmed);
	};

	// Upsert by (date + surveyType) so retakes update the same row instead of duplicating.
	const addEntry = (entry: JournalEntry) => {
		setEntries(prev => {
			const existingIndex = prev.findIndex(e => e.date === entry.date && e.surveyType === entry.surveyType);
			if (existingIndex < 0) return [entry, ...prev];

			const existing = prev[existingIndex];
			const merged: JournalEntry = {
				...existing,
				...entry,
				rewards: {
					...existing.rewards,
					...entry.rewards,
				},
				// Retake rule: if a field is omitted in the new payload, preserve previous value.
				text: entry.text && entry.text.trim().length > 0 ? entry.text : existing.text,
				promptText: entry.promptText && entry.promptText.trim().length > 0 ? entry.promptText : existing.promptText,
				triviaQuestion: entry.triviaQuestion && entry.triviaQuestion.trim().length > 0 ? entry.triviaQuestion : existing.triviaQuestion,
				triviaResult: entry.triviaResult && entry.triviaResult.trim().length > 0 ? entry.triviaResult : existing.triviaResult,
			};

			const next = [...prev];
			next[existingIndex] = merged;
			return next.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.surveyType === 'night' ? -1 : 1));
		});
	};

	const getEntriesByDate = (date: string) => entries.filter(e => e.date === date);

	const getEntriesByDay = () => {
		const grouped = new Map<string, JournalDay>();
		for (const entry of entries) {
			const current = grouped.get(entry.date) ?? { date: entry.date };
			if (entry.surveyType === 'morning') current.morning = entry;
			if (entry.surveyType === 'night') current.evening = entry;
			grouped.set(entry.date, current);
		}
		return Array.from(grouped.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
	};

	const value = useMemo(
		() => ({
			entries,
			lairName,
			setLairName,
			addEntry,
			getEntriesByDate,
			getEntriesByDay,
		}),
		[entries, lairName],
	);

	return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

export function useJournal() {
	const ctx = useContext(JournalContext);
	if (!ctx) throw new Error('useJournal must be used within JournalProvider');
	return ctx;
}
