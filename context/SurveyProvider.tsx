import React, { createContext, ReactNode, useContext, useState } from 'react';

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
	enableRandomMC?: boolean;
	quoteMorning?: boolean;
}

interface SurveyContextType {
	morningSurveyCompleted: boolean;
	nightSurveyCompleted: boolean;
	lastMorningSurveyDate: string | null;
	lastNightSurveyDate: string | null;
	currentSurveyType: 'morning' | 'night' | null;
	completeMorningSurvey: () => void;
	completeNightSurvey: () => void;
	resetDailySurveys: () => void;
	canTakeMorningSurvey: () => boolean;
	canTakeNightSurvey: () => boolean;
	getMorningProgress: () => number; // 0-100
	getNightProgress: () => number; // 0-100
	saveProgress: (type: 'morning' | 'night', payload: any) => void;
	loadProgress: (type: 'morning' | 'night') => any | null;
	clearProgress: (type: 'morning' | 'night') => void;
	recordNightSnapshot: (snapshot: { habitIds: string[]; todoIds: string[] }) => void;
	getNightSnapshot: () => { habitIds: string[]; todoIds: string[] } | null;
	// Options
	options: SurveyOptions;
	setOption: <K extends keyof SurveyOptions>(key: K, value: SurveyOptions[K]) => void;
	setSurveyType: (type: 'morning' | 'night' | null) => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
	const [morningSurveyCompleted, setMorningSurveyCompleted] = useState(false);
	const [nightSurveyCompleted, setNightSurveyCompleted] = useState(false);
	const [lastMorningSurveyDate, setLastMorningSurveyDate] = useState<string | null>(null);
	const [lastNightSurveyDate, setLastNightSurveyDate] = useState<string | null>(null);
	const [currentSurveyType, setCurrentSurveyType] = useState<'morning' | 'night' | null>(null);
	const [surveyProgress, setSurveyProgress] = useState(0); // 0-100
	const [savedMorning, setSavedMorning] = useState<any | null>(null);
	const [savedNight, setSavedNight] = useState<any | null>(null);
	const [options, setOptions] = useState<SurveyOptions>({
		showQuote: true,
		enableJournalMorning: true,
		enableJournalNight: true,
		enableMoodQuestion: true,
		enableProjectQuestion: true,
		dayChecklistType: 'simple',
		enableAdvice: true,
		adviceScarLevel: 2,
		randomPromptCount: 1,
		enableRandomMC: true,
		quoteMorning: true,
	});

	const today = new Date().toISOString().split('T')[0];

	const resetDailySurveys = () => {
		// This logic handles resetting the "Complete" status when a new day starts
		if (lastMorningSurveyDate !== today) {
			setMorningSurveyCompleted(false);
			// We also clear saved progress from previous days here
			setSavedMorning(null);
		}
		if (lastNightSurveyDate !== today) {
			setNightSurveyCompleted(false);
			setSavedNight(null);
		}
	};

	const completeMorningSurvey = () => {
		setMorningSurveyCompleted(true);
		setLastMorningSurveyDate(today);
		// Note: We DO NOT clear savedMorning here.
		// We keep it so that if the user clicks "Retake", the survey page can load the completed answers.
	};

	const completeNightSurvey = () => {
		setNightSurveyCompleted(true);
		setLastNightSurveyDate(today);
		// Note: We DO NOT clear savedNight here.
		// We keep it for retakes.
	};

	const saveProgress = (type: 'morning' | 'night', payload: any) => {
		const data = { ...payload, savedAt: new Date().toISOString().split('T')[0] };
		if (type === 'morning') setSavedMorning(data);
		else setSavedNight(data);
	};

	const loadProgress = (type: 'morning' | 'night') => {
		// Returns saved data (whether in-progress or completed)
		return type === 'morning' ? savedMorning : savedNight;
	};

	const clearProgress = (type: 'morning' | 'night') => {
		if (type === 'morning') setSavedMorning(null);
		else setSavedNight(null);
	};

	const recordNightSnapshot = (snapshot: { habitIds: string[]; todoIds: string[] }) => {
		// We store the snapshot in the savedNight state so it persists during the session
		// This snapshot tells us which goals were rewarded so we don't reward them again on retake
		setSavedNight((prev: any) => ({ ...(prev || {}), lastSnapshot: snapshot }));
	};

	const getNightSnapshot = () => savedNight?.lastSnapshot || null;

	const canTakeMorningSurvey = (): boolean => {
		// You can always take the survey for the current day,
		// even if completed (Retake mode).
		// We only prevent it if it was somehow taking a future/past survey not handled by reset logic.
		return true;
	};

	const canTakeNightSurvey = (): boolean => {
		// You can always take the survey for the current day,
		// even if completed (Retake mode).
		return true;
	};

	const getMorningProgress = (): number => {
		return morningSurveyCompleted && lastMorningSurveyDate === today ? 100 : 0;
	};

	const getNightProgress = (): number => {
		return nightSurveyCompleted && lastNightSurveyDate === today ? 100 : 0;
	};

	const setOption = <K extends keyof SurveyOptions>(key: K, value: SurveyOptions[K]) => {
		setOptions(prev => ({ ...prev, [key]: value }));
	};

	return (
		<SurveyContext.Provider
			value={{
				morningSurveyCompleted,
				nightSurveyCompleted,
				lastMorningSurveyDate,
				lastNightSurveyDate,
				currentSurveyType,
				completeMorningSurvey,
				completeNightSurvey,
				resetDailySurveys,
				canTakeMorningSurvey,
				canTakeNightSurvey,
				getMorningProgress,
				getNightProgress,
				saveProgress,
				loadProgress,
				clearProgress,
				recordNightSnapshot,
				getNightSnapshot,
				options,
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
