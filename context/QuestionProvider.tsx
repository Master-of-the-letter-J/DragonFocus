import React, { createContext, ReactNode, useContext, useState } from 'react';

export type QuestionType = 'advice' | 'quotes' | 'mood' | 'habitGoals' | 'todoGoals' | 'prompts' | 'trivia' | 'journalEntry';

export interface CustomEmotion {
	id: string;
	emoji: string;
	description: string; // max 50 chars
	furyChange: number;
	custom: boolean;
}

export interface CustomPrompt {
	id: string;
	text: string;
	randomized: boolean;
	appliesTo: 'morning' | 'evening' | 'both';
	custom: boolean;
}

export interface QuestionSettings {
	advice: {
		enabled: boolean;
		types: {
			inspirational: boolean;
			witty: boolean;
			philosophical: boolean;
		};
	};
	quotes: {
		enabled: boolean;
		types: {
			inspirational: boolean;
			witty: boolean;
			philosophical: boolean;
		};
	};
	mood: {
		enabled: boolean;
		customEmotions: CustomEmotion[];
	};
	habitGoals: {
		enabled: boolean; // always true - required question
		suggestedCategories: string[];
		customCategories: string[];
	};
	todoGoals: {
		enabled: boolean; // always true - required question
		suggestedCategories: string[];
		customCategories: string[];
	};
	prompts: {
		enabled: boolean;
		customPrompts: CustomPrompt[];
	};
	trivia: {
		morningCount: number; // 0-3, default 1
		eveningCount: number; // 0-3, default 1
	};
	journalEntry: {
		setting: 'morning' | 'evening' | 'both' | 'none';
		template: string;
	};
}

interface QuestionContextType {
	questionSettings: QuestionSettings;
	updateAdviceSettings: (types: { inspirational: boolean; witty: boolean; philosophical: boolean }) => void;
	updateQuotesSettings: (types: { inspirational: boolean; witty: boolean; philosophical: boolean }) => void;
	toggleMood: (enabled: boolean) => void;
	addCustomEmotion: (emotion: CustomEmotion) => void;
	removeCustomEmotion: (id: string) => void;
	updateHabitCategories: (suggested: string[], custom: string[]) => void;
	addHabitCategory: (name: string) => void;
	removeHabitCategory: (name: string) => void;
	updateTodoCategories: (suggested: string[], custom: string[]) => void;
	addTodoCategory: (name: string) => void;
	removeTodoCategory: (name: string) => void;
	addCustomPrompt: (prompt: CustomPrompt) => void;
	removeCustomPrompt: (id: string) => void;
	updatePromptsEnabled: (enabled: boolean) => void;
	setTriviaCount: (morning: number, evening: number) => void;
	setJournalEntry: (setting: 'morning' | 'evening' | 'both' | 'none', template: string) => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

// Default habit categories
const DEFAULT_HABIT_CATEGORIES = ['Physical', 'Mental', 'Personal', 'Social', 'Creative', 'Wellness'];

// Default todo categories
const DEFAULT_TODO_CATEGORIES = ['Physical', 'Mental', 'Personal', 'Social', 'Creative', 'Learning'];

// Default emotions
const DEFAULT_EMOTIONS: CustomEmotion[] = [
	{ id: '1', emoji: '😭', description: 'Devastated', furyChange: 10, custom: false },
	{ id: '2', emoji: '😢', description: 'Sad', furyChange: 6, custom: false },
	{ id: '3', emoji: '😟', description: 'Worried', furyChange: 3, custom: false },
	{ id: '4', emoji: '😕', description: 'Confused', furyChange: 1, custom: false },
	{ id: '5', emoji: '😐', description: 'Neutral', furyChange: 0, custom: false },
	{ id: '6', emoji: '🙂', description: 'Okay', furyChange: -1, custom: false },
	{ id: '7', emoji: '😊', description: 'Content', furyChange: -3, custom: false },
	{ id: '8', emoji: '😃', description: 'Happy', furyChange: -5, custom: false },
	{ id: '9', emoji: '😁', description: 'Cheerful', furyChange: -7, custom: false },
	{ id: '10', emoji: '🤩', description: 'Excited', furyChange: -8, custom: false },
	{ id: '11', emoji: '😤', description: 'Frustrated', furyChange: 5, custom: false },
	{ id: '12', emoji: '😡', description: 'Angry', furyChange: 9, custom: false },
];

const DEFAULT_SETTINGS: QuestionSettings = {
	advice: {
		enabled: true,
		types: {
			inspirational: true,
			witty: true,
			philosophical: true,
		},
	},
	quotes: {
		enabled: true,
		types: {
			inspirational: true,
			witty: true,
			philosophical: true,
		},
	},
	mood: {
		enabled: true,
		customEmotions: DEFAULT_EMOTIONS,
	},
	habitGoals: {
		enabled: true,
		suggestedCategories: DEFAULT_HABIT_CATEGORIES,
		customCategories: [],
	},
	todoGoals: {
		enabled: true,
		suggestedCategories: DEFAULT_TODO_CATEGORIES,
		customCategories: [],
	},
	prompts: {
		enabled: false,
		customPrompts: [
			{
				id: '1',
				text: 'What was your biggest accomplishment today?',
				randomized: false,
				appliesTo: 'evening',
				custom: false,
			},
		],
	},
	trivia: {
		morningCount: 1,
		eveningCount: 1,
	},
	journalEntry: {
		setting: 'both',
		template: '',
	},
};

export function QuestionProvider({ children }: { children: ReactNode }) {
	const [questionSettings, setQuestionSettings] = useState<QuestionSettings>(DEFAULT_SETTINGS);

	const updateAdviceSettings = (types: { inspirational: boolean; witty: boolean; philosophical: boolean }) => {
		setQuestionSettings(prev => ({
			...prev,
			advice: {
				...prev.advice,
				types,
			},
		}));
	};

	const updateQuotesSettings = (types: { inspirational: boolean; witty: boolean; philosophical: boolean }) => {
		setQuestionSettings(prev => ({
			...prev,
			quotes: {
				...prev.quotes,
				types,
			},
		}));
	};

	const toggleMood = (enabled: boolean) => {
		setQuestionSettings(prev => ({
			...prev,
			mood: {
				...prev.mood,
				enabled,
			},
		}));
	};

	const addCustomEmotion = (emotion: CustomEmotion) => {
		setQuestionSettings(prev => ({
			...prev,
			mood: {
				...prev.mood,
				customEmotions: [...prev.mood.customEmotions, emotion],
			},
		}));
	};

	const removeCustomEmotion = (id: string) => {
		setQuestionSettings(prev => ({
			...prev,
			mood: {
				...prev.mood,
				customEmotions: prev.mood.customEmotions.filter(e => e.id !== id),
			},
		}));
	};

	const updateHabitCategories = (suggested: string[], custom: string[]) => {
		setQuestionSettings(prev => ({
			...prev,
			habitGoals: {
				...prev.habitGoals,
				suggestedCategories: suggested,
				customCategories: custom,
			},
		}));
	};

	const addHabitCategory = (name: string) => {
		setQuestionSettings(prev => ({
			...prev,
			habitGoals: {
				...prev.habitGoals,
				customCategories: [...prev.habitGoals.customCategories, name],
			},
		}));
	};

	const removeHabitCategory = (name: string) => {
		setQuestionSettings(prev => ({
			...prev,
			habitGoals: {
				...prev.habitGoals,
				customCategories: prev.habitGoals.customCategories.filter(c => c !== name),
			},
		}));
	};

	const updateTodoCategories = (suggested: string[], custom: string[]) => {
		setQuestionSettings(prev => ({
			...prev,
			todoGoals: {
				...prev.todoGoals,
				suggestedCategories: suggested,
				customCategories: custom,
			},
		}));
	};

	const addTodoCategory = (name: string) => {
		setQuestionSettings(prev => ({
			...prev,
			todoGoals: {
				...prev.todoGoals,
				customCategories: [...prev.todoGoals.customCategories, name],
			},
		}));
	};

	const removeTodoCategory = (name: string) => {
		setQuestionSettings(prev => ({
			...prev,
			todoGoals: {
				...prev.todoGoals,
				customCategories: prev.todoGoals.customCategories.filter(c => c !== name),
			},
		}));
	};

	const addCustomPrompt = (prompt: CustomPrompt) => {
		setQuestionSettings(prev => ({
			...prev,
			prompts: {
				...prev.prompts,
				customPrompts: [...prev.prompts.customPrompts, prompt],
			},
		}));
	};

	const removeCustomPrompt = (id: string) => {
		setQuestionSettings(prev => ({
			...prev,
			prompts: {
				...prev.prompts,
				customPrompts: prev.prompts.customPrompts.filter(p => p.id !== id),
			},
		}));
	};

	const updatePromptsEnabled = (enabled: boolean) => {
		setQuestionSettings(prev => ({
			...prev,
			prompts: {
				...prev.prompts,
				enabled,
			},
		}));
	};

	const setTriviaCount = (morning: number, evening: number) => {
		setQuestionSettings(prev => ({
			...prev,
			trivia: {
				morningCount: Math.max(0, Math.min(3, morning)),
				eveningCount: Math.max(0, Math.min(3, evening)),
			},
		}));
	};

	const setJournalEntry = (setting: 'morning' | 'evening' | 'both' | 'none', template: string) => {
		setQuestionSettings(prev => ({
			...prev,
			journalEntry: {
				setting,
				template,
			},
		}));
	};

	return (
		<QuestionContext.Provider
			value={{
				questionSettings,
				updateAdviceSettings,
				updateQuotesSettings,
				toggleMood,
				addCustomEmotion,
				removeCustomEmotion,
				updateHabitCategories,
				addHabitCategory,
				removeHabitCategory,
				updateTodoCategories,
				addTodoCategory,
				removeTodoCategory,
				addCustomPrompt,
				removeCustomPrompt,
				updatePromptsEnabled,
				setTriviaCount,
				setJournalEntry,
			}}>
			{children}
		</QuestionContext.Provider>
	);
}

export function useQuestions() {
	const context = useContext(QuestionContext);
	if (!context) {
		throw new Error('useQuestions must be used within QuestionProvider');
	}
	return context;
}
