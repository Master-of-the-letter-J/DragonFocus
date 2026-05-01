import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import { GOAL_CATEGORY_OPTIONS, normalizeGoalCategories, normalizeGoalCategory } from '@/data/goal-utils';
import React, { ReactNode, createContext, useContext } from 'react';

export type QuestionType = 'advice' | 'quotes' | 'mood' | 'habitGoals' | 'todoGoals' | 'prompts' | 'trivia' | 'journalEntry';
export type PromptTarget = 'morning' | 'night' | 'both';
export type JournalPlacement = 'morning' | 'night' | 'both' | 'none';
export type PromptCategoryKey = 'SelfDiscovery' | 'Reflection' | 'Gratitude' | 'Creative' | 'Mindfulness' | 'Productivity' | 'Relationships';
export type TriviaCategoryKey = 'General' | 'PopCulture' | 'History' | 'Science' | 'Geography' | 'Sports' | 'LiteratureArts' | 'Food';

export interface CustomEmotion {
	id: string;
	emoji: string;
	description: string;
	furyChange: number;
	custom: boolean;
}

export interface CustomPrompt {
	id: string;
	text: string;
	randomized: boolean;
	appliesTo: PromptTarget;
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
		enabled: boolean;
		suggestedCategories: string[];
		customCategories: string[];
	};
	todoGoals: {
		enabled: boolean;
		suggestedCategories: string[];
		customCategories: string[];
	};
	prompts: {
		enabled: boolean;
		types: Record<PromptCategoryKey, boolean>;
		customPrompts: CustomPrompt[];
	};
	trivia: {
		morningCount: number;
		nightCount: number;
		types: Record<TriviaCategoryKey, boolean>;
	};
	journalEntry: {
		setting: JournalPlacement;
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
	togglePromptCategory: (category: string) => void;
	toggleTriviaCategory: (category: string) => void;
	setTriviaCount: (morning: number, night: number) => void;
	setJournalEntry: (setting: JournalPlacement, template: string) => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const DEFAULT_HABIT_CATEGORIES = [...GOAL_CATEGORY_OPTIONS];
export const DEFAULT_TODO_CATEGORIES = [...GOAL_CATEGORY_OPTIONS];

export const PROMPT_CATEGORY_OPTIONS: Array<{ key: PromptCategoryKey; label: string }> = [
	{ key: 'SelfDiscovery', label: 'Self Discovery' },
	{ key: 'Reflection', label: 'Reflection' },
	{ key: 'Gratitude', label: 'Gratitude' },
	{ key: 'Creative', label: 'Creative' },
	{ key: 'Mindfulness', label: 'Mindfulness' },
	{ key: 'Productivity', label: 'Productivity' },
	{ key: 'Relationships', label: 'Relationships' },
];

export const TRIVIA_CATEGORY_OPTIONS: Array<{ key: TriviaCategoryKey; label: string }> = [
	{ key: 'General', label: 'General' },
	{ key: 'PopCulture', label: 'Pop Culture' },
	{ key: 'History', label: 'History' },
	{ key: 'Science', label: 'Science' },
	{ key: 'Geography', label: 'Geography' },
	{ key: 'Sports', label: 'Sports' },
	{ key: 'LiteratureArts', label: 'Literature / Arts' },
	{ key: 'Food', label: 'Food' },
];

export const DEFAULT_EMOTIONS: CustomEmotion[] = [
	{ id: '1', emoji: '😭', description: 'Devastated', furyChange: 8, custom: false },
	{ id: '2', emoji: '😢', description: 'Sad', furyChange: 5, custom: false },
	{ id: '3', emoji: '😟', description: 'Worried', furyChange: 2, custom: false },
	{ id: '4', emoji: '😕', description: 'Uneasy', furyChange: 1, custom: false },
	{ id: '5', emoji: '😐', description: 'Neutral', furyChange: 0, custom: false },
	{ id: '6', emoji: '🙂', description: 'Okay', furyChange: -1, custom: false },
	{ id: '7', emoji: '😊', description: 'Content', furyChange: -2, custom: false },
	{ id: '8', emoji: '😄', description: 'Happy', furyChange: -4, custom: false },
	{ id: '9', emoji: '😁', description: 'Cheerful', furyChange: -6, custom: false },
	{ id: '10', emoji: '🤩', description: 'Excited', furyChange: -8, custom: false },
	{ id: '11', emoji: '😤', description: 'Frustrated', furyChange: 4, custom: false },
	{ id: '12', emoji: '😡', description: 'Angry', furyChange: 7, custom: false },
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
		types: {
			SelfDiscovery: true,
			Reflection: true,
			Gratitude: true,
			Creative: true,
			Mindfulness: true,
			Productivity: true,
			Relationships: true,
		},
		customPrompts: [
			{
				id: '1',
				text: 'What was your biggest accomplishment today?',
				randomized: false,
				appliesTo: 'night',
				custom: false,
			},
		],
	},
	trivia: {
		morningCount: 1,
		nightCount: 1,
		types: {
			General: true,
			PopCulture: true,
			History: true,
			Science: true,
			Geography: true,
			Sports: true,
			LiteratureArts: true,
			Food: true,
		},
	},
	journalEntry: {
		setting: 'both',
		template: '',
	},
};

const createDefaultSettings = (): QuestionSettings => ({
	advice: {
		enabled: DEFAULT_SETTINGS.advice.enabled,
		types: { ...DEFAULT_SETTINGS.advice.types },
	},
	quotes: {
		enabled: DEFAULT_SETTINGS.quotes.enabled,
		types: { ...DEFAULT_SETTINGS.quotes.types },
	},
	mood: {
		enabled: DEFAULT_SETTINGS.mood.enabled,
		customEmotions: [...DEFAULT_EMOTIONS],
	},
	habitGoals: {
		enabled: DEFAULT_SETTINGS.habitGoals.enabled,
		suggestedCategories: [...DEFAULT_HABIT_CATEGORIES],
		customCategories: [],
	},
	todoGoals: {
		enabled: DEFAULT_SETTINGS.todoGoals.enabled,
		suggestedCategories: [...DEFAULT_TODO_CATEGORIES],
		customCategories: [],
	},
	prompts: {
		enabled: DEFAULT_SETTINGS.prompts.enabled,
		types: { ...DEFAULT_SETTINGS.prompts.types },
		customPrompts: [...DEFAULT_SETTINGS.prompts.customPrompts],
	},
	trivia: {
		morningCount: DEFAULT_SETTINGS.trivia.morningCount,
		nightCount: DEFAULT_SETTINGS.trivia.nightCount,
		types: { ...DEFAULT_SETTINGS.trivia.types },
	},
	journalEntry: {
		setting: DEFAULT_SETTINGS.journalEntry.setting,
		template: DEFAULT_SETTINGS.journalEntry.template,
	},
});

const normalizeStoredCategoryList = (categories: string[] | undefined, fallbackCategories: string[]) => {
	if (!Array.isArray(categories)) return [...fallbackCategories];
	return normalizeGoalCategories(categories);
};

const normalizeCustomCategoryList = (categories: string[] | undefined) => normalizeGoalCategories(categories);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeQuestionSettings = (storedSettings?: Partial<QuestionSettings> | null): QuestionSettings => {
	const defaults = createDefaultSettings();
	if (!storedSettings) return defaults;

	return {
		advice: {
			enabled: storedSettings.advice?.enabled ?? defaults.advice.enabled,
			types: {
				...defaults.advice.types,
				...storedSettings.advice?.types,
			},
		},
		quotes: {
			enabled: storedSettings.quotes?.enabled ?? defaults.quotes.enabled,
			types: {
				...defaults.quotes.types,
				...storedSettings.quotes?.types,
			},
		},
		mood: {
			enabled: storedSettings.mood?.enabled ?? defaults.mood.enabled,
			customEmotions: storedSettings.mood?.customEmotions?.length ? storedSettings.mood.customEmotions : defaults.mood.customEmotions,
		},
		habitGoals: {
			enabled: storedSettings.habitGoals?.enabled ?? defaults.habitGoals.enabled,
			suggestedCategories: normalizeStoredCategoryList(storedSettings.habitGoals?.suggestedCategories, DEFAULT_HABIT_CATEGORIES),
			customCategories: normalizeCustomCategoryList(storedSettings.habitGoals?.customCategories ?? defaults.habitGoals.customCategories),
		},
		todoGoals: {
			enabled: storedSettings.todoGoals?.enabled ?? defaults.todoGoals.enabled,
			suggestedCategories: normalizeStoredCategoryList(storedSettings.todoGoals?.suggestedCategories, DEFAULT_TODO_CATEGORIES),
			customCategories: normalizeCustomCategoryList(storedSettings.todoGoals?.customCategories ?? defaults.todoGoals.customCategories),
		},
		prompts: {
			enabled: storedSettings.prompts?.enabled ?? defaults.prompts.enabled,
			types: {
				...defaults.prompts.types,
				...storedSettings.prompts?.types,
			},
			customPrompts: storedSettings.prompts?.customPrompts?.length ? storedSettings.prompts.customPrompts : defaults.prompts.customPrompts,
		},
		trivia: {
			morningCount: clamp(storedSettings.trivia?.morningCount ?? defaults.trivia.morningCount, 0, 3),
			nightCount: clamp(storedSettings.trivia?.nightCount ?? defaults.trivia.nightCount, 0, 3),
			types: {
				...defaults.trivia.types,
				...storedSettings.trivia?.types,
			},
		},
		journalEntry: {
			setting: storedSettings.journalEntry?.setting ?? defaults.journalEntry.setting,
			template: storedSettings.journalEntry?.template ?? defaults.journalEntry.template,
		},
	};
};

const mapPromptCategoryKey = (category: string): PromptCategoryKey => {
	switch (category) {
		case 'Self-Discovery':
		case 'Self Discovery':
			return 'SelfDiscovery';
		case 'Fun & Creative':
			return 'Creative';
		default:
			return (category in DEFAULT_SETTINGS.prompts.types ? category : 'Reflection') as PromptCategoryKey;
	}
};

const mapTriviaCategoryKey = (category: string): TriviaCategoryKey => {
	switch (category) {
		case 'General Knowledge':
			return 'General';
		case 'Pop Culture':
			return 'PopCulture';
		case 'Literature / Arts':
			return 'LiteratureArts';
		default:
			return (category in DEFAULT_SETTINGS.trivia.types ? category : 'General') as TriviaCategoryKey;
	}
};

export function QuestionProvider({ children }: { children: ReactNode }) {
	const { state: questionSettings, setState: setQuestionSettings } = usePersistedState(APP_STORAGE_KEYS.questionSettings, createDefaultSettings, {
		normalize: storedSettings => normalizeQuestionSettings(storedSettings),
	});

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
		const emoji = emotion.emoji.trim();
		const description = emotion.description.trim().slice(0, 50);
		if (!emoji || !description) return;

		setQuestionSettings(prev => ({
			...prev,
			mood: {
				...prev.mood,
				customEmotions: [
					...prev.mood.customEmotions,
					{
						...emotion,
						emoji,
						description,
						furyChange: clamp(Math.round(emotion.furyChange), -8, 8),
						custom: true,
					},
				],
			},
		}));
	};

	const removeCustomEmotion = (id: string) => {
		setQuestionSettings(prev => ({
			...prev,
			mood: {
				...prev.mood,
				customEmotions: prev.mood.customEmotions.filter(emotion => emotion.id !== id),
			},
		}));
	};

	const updateHabitCategories = (suggested: string[], custom: string[]) => {
		setQuestionSettings(prev => ({
			...prev,
			habitGoals: {
				...prev.habitGoals,
				suggestedCategories: normalizeGoalCategories(suggested),
				customCategories: normalizeCustomCategoryList(custom),
			},
		}));
	};

	const addHabitCategory = (name: string) => {
		const normalizedName = normalizeGoalCategory(name);
		if (!normalizedName) return;

		setQuestionSettings(prev => {
			const existing = new Set([...prev.habitGoals.suggestedCategories, ...prev.habitGoals.customCategories].map(category => category.toLowerCase()));
			if (existing.has(normalizedName.toLowerCase())) return prev;
			return {
				...prev,
				habitGoals: {
					...prev.habitGoals,
					customCategories: [...prev.habitGoals.customCategories, normalizedName],
				},
			};
		});
	};

	const removeHabitCategory = (name: string) => {
		const normalizedName = normalizeGoalCategory(name) ?? name;
		setQuestionSettings(prev => ({
			...prev,
			habitGoals: {
				...prev.habitGoals,
				customCategories: prev.habitGoals.customCategories.filter(category => category !== normalizedName),
			},
		}));
	};

	const updateTodoCategories = (suggested: string[], custom: string[]) => {
		setQuestionSettings(prev => ({
			...prev,
			todoGoals: {
				...prev.todoGoals,
				suggestedCategories: normalizeGoalCategories(suggested),
				customCategories: normalizeCustomCategoryList(custom),
			},
		}));
	};

	const addTodoCategory = (name: string) => {
		const normalizedName = normalizeGoalCategory(name);
		if (!normalizedName) return;

		setQuestionSettings(prev => {
			const existing = new Set([...prev.todoGoals.suggestedCategories, ...prev.todoGoals.customCategories].map(category => category.toLowerCase()));
			if (existing.has(normalizedName.toLowerCase())) return prev;
			return {
				...prev,
				todoGoals: {
					...prev.todoGoals,
					customCategories: [...prev.todoGoals.customCategories, normalizedName],
				},
			};
		});
	};

	const removeTodoCategory = (name: string) => {
		const normalizedName = normalizeGoalCategory(name) ?? name;
		setQuestionSettings(prev => ({
			...prev,
			todoGoals: {
				...prev.todoGoals,
				customCategories: prev.todoGoals.customCategories.filter(category => category !== normalizedName),
			},
		}));
	};

	const addCustomPrompt = (prompt: CustomPrompt) => {
		const text = prompt.text.trim();
		if (!text) return;

		setQuestionSettings(prev => ({
			...prev,
			prompts: {
				...prev.prompts,
				customPrompts: [
					...prev.prompts.customPrompts,
					{
						...prompt,
						text,
						custom: true,
					},
				],
			},
		}));
	};

	const removeCustomPrompt = (id: string) => {
		setQuestionSettings(prev => ({
			...prev,
			prompts: {
				...prev.prompts,
				customPrompts: prev.prompts.customPrompts.filter(prompt => prompt.id !== id),
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

	const togglePromptCategory = (category: string) => {
		const key = mapPromptCategoryKey(category);
		setQuestionSettings(prev => ({
			...prev,
			prompts: {
				...prev.prompts,
				types: {
					...prev.prompts.types,
					[key]: !prev.prompts.types[key],
				},
			},
		}));
	};

	const toggleTriviaCategory = (category: string) => {
		const key = mapTriviaCategoryKey(category);
		setQuestionSettings(prev => ({
			...prev,
			trivia: {
				...prev.trivia,
				types: {
					...prev.trivia.types,
					[key]: !prev.trivia.types[key],
				},
			},
		}));
	};

	const setTriviaCount = (morning: number, night: number) => {
		setQuestionSettings(prev => ({
			...prev,
			trivia: {
				...prev.trivia,
				morningCount: clamp(morning, 0, 3),
				nightCount: clamp(night, 0, 3),
			},
		}));
	};

	const setJournalEntry = (setting: JournalPlacement, template: string) => {
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
				togglePromptCategory,
				toggleTriviaCategory,
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
