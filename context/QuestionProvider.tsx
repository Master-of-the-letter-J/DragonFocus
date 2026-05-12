import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import { GOAL_CATEGORY_OPTIONS, normalizeGoalCategories, normalizeGoalCategory } from '@/data/goal-utils';
import React, { ReactNode, createContext, useContext } from 'react';

export type QuestionType = 'advice' | 'quotes' | 'mood' | 'habitGoals' | 'todoGoals' | 'prompts' | 'trivia' | 'funFacts' | 'journalEntry';
export type SurveyQuestionKey = QuestionType;
export type SurveyOrderType = 'morning' | 'night';
export type PromptTarget = 'morning' | 'night' | 'both';
export type JournalPlacement = 'morning' | 'night' | 'both' | 'none';
export type PromptCategoryKey = 'SelfDiscovery' | 'Reflection' | 'Gratitude' | 'Creative' | 'Mindfulness' | 'Productivity' | 'Relationships';
export type TriviaCategoryKey = 'General' | 'PopCulture' | 'History' | 'Science' | 'Geography' | 'Sports' | 'LiteratureArts' | 'Food';
export type FunFactCategoryKey = 'nature' | 'space' | 'history' | 'science' | 'language' | 'culture' | 'technology' | 'biology';

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
		morningCount: number;
		nightCount: number;
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
		enabled: boolean;
		morningCount: number;
		nightCount: number;
		types: Record<TriviaCategoryKey, boolean>;
	};
	funFacts: {
		enabled: boolean;
		morningCount: number;
		nightCount: number;
		types: Record<FunFactCategoryKey, boolean>;
	};
	journalEntry: {
		enabled: boolean;
		setting: JournalPlacement;
		template: string;
	};
	morningOrder: SurveyQuestionKey[];
	nightOrder: SurveyQuestionKey[];
}

interface QuestionContextType {
	questionSettings: QuestionSettings;
	setQuestionEnabled: (question: QuestionType, enabled: boolean) => void;
	setSurveyQuestionOrder: (surveyType: SurveyOrderType, order: SurveyQuestionKey[]) => void;
	moveSurveyQuestion: (surveyType: SurveyOrderType, fromIndex: number, toIndex: number) => void;
	updateAdviceSettings: (types: { inspirational: boolean; witty: boolean; philosophical: boolean }) => void;
	updateQuotesSettings: (types: { inspirational: boolean; witty: boolean; philosophical: boolean }) => void;
	setQuoteCount: (morning: number, night: number) => void;
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
	updateFunFactsSettings: (types: Record<FunFactCategoryKey, boolean>) => void;
	setFunFactCount: (morning: number, night: number) => void;
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
export const FUN_FACT_CATEGORY_OPTIONS: Array<{ key: FunFactCategoryKey; label: string }> = [
	{ key: 'nature', label: 'Nature' },
	{ key: 'space', label: 'Space' },
	{ key: 'history', label: 'History' },
	{ key: 'science', label: 'Science' },
	{ key: 'language', label: 'Language' },
	{ key: 'culture', label: 'Culture' },
	{ key: 'technology', label: 'Technology' },
	{ key: 'biology', label: 'Biology' },
];
export const SURVEY_QUESTION_OPTIONS: Array<{ key: SurveyQuestionKey; label: string; morningLabel?: string; nightLabel?: string }> = [
	{ key: 'mood', label: 'Mood' },
	{ key: 'habitGoals', label: 'Habit Goals', morningLabel: 'Goals: Habits', nightLabel: 'Goal Checks: Habits' },
	{ key: 'todoGoals', label: 'To-Do Goals', morningLabel: 'Goals: To-Dos', nightLabel: 'Goal Checks: To-Dos' },
	{ key: 'prompts', label: 'Prompts' },
	{ key: 'trivia', label: 'Trivia' },
	{ key: 'funFacts', label: 'Fun Facts' },
	{ key: 'journalEntry', label: 'Journal' },
	{ key: 'quotes', label: 'Quotes' },
	{ key: 'advice', label: 'Advice' },
];

const DEFAULT_MORNING_ORDER: SurveyQuestionKey[] = ['mood', 'habitGoals', 'todoGoals', 'prompts', 'trivia', 'funFacts', 'journalEntry', 'quotes', 'advice'];
const DEFAULT_NIGHT_ORDER: SurveyQuestionKey[] = ['mood', 'habitGoals', 'todoGoals', 'prompts', 'trivia', 'funFacts', 'journalEntry', 'quotes', 'advice'];

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
		enabled: false,
		types: {
			inspirational: true,
			witty: true,
			philosophical: true,
		},
	},
	quotes: {
		enabled: true,
		morningCount: 1,
		nightCount: 1,
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
		enabled: true,
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
	funFacts: {
		enabled: true,
		morningCount: 1,
		nightCount: 1,
		types: {
			nature: true,
			space: true,
			history: true,
			science: true,
			language: true,
			culture: true,
			technology: true,
			biology: true,
		},
	},
	journalEntry: {
		enabled: true,
		setting: 'both',
		template: '',
	},
	morningOrder: DEFAULT_MORNING_ORDER,
	nightOrder: DEFAULT_NIGHT_ORDER,
};

const createDefaultSettings = (): QuestionSettings => ({
	advice: {
		enabled: DEFAULT_SETTINGS.advice.enabled,
		types: { ...DEFAULT_SETTINGS.advice.types },
	},
	quotes: {
		enabled: DEFAULT_SETTINGS.quotes.enabled,
		morningCount: DEFAULT_SETTINGS.quotes.morningCount,
		nightCount: DEFAULT_SETTINGS.quotes.nightCount,
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
		enabled: DEFAULT_SETTINGS.trivia.enabled,
		morningCount: DEFAULT_SETTINGS.trivia.morningCount,
		nightCount: DEFAULT_SETTINGS.trivia.nightCount,
		types: { ...DEFAULT_SETTINGS.trivia.types },
	},
	funFacts: {
		enabled: DEFAULT_SETTINGS.funFacts.enabled,
		morningCount: DEFAULT_SETTINGS.funFacts.morningCount,
		nightCount: DEFAULT_SETTINGS.funFacts.nightCount,
		types: { ...DEFAULT_SETTINGS.funFacts.types },
	},
	journalEntry: {
		enabled: DEFAULT_SETTINGS.journalEntry.enabled,
		setting: DEFAULT_SETTINGS.journalEntry.setting,
		template: DEFAULT_SETTINGS.journalEntry.template,
	},
	morningOrder: [...DEFAULT_MORNING_ORDER],
	nightOrder: [...DEFAULT_NIGHT_ORDER],
});

const normalizeStoredCategoryList = (categories: string[] | undefined, fallbackCategories: string[]) => {
	if (!Array.isArray(categories)) return [...fallbackCategories];
	return normalizeGoalCategories(categories);
};

const normalizeCustomCategoryList = (categories: string[] | undefined) => normalizeGoalCategories(categories);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeSurveyOrder = (order: SurveyQuestionKey[] | undefined, fallback: SurveyQuestionKey[]) => {
	const validKeys = new Set(SURVEY_QUESTION_OPTIONS.map(option => option.key));
	const seen = new Set<string>();
	const normalized = Array.isArray(order) ? order.filter((key): key is SurveyQuestionKey => validKeys.has(key) && !seen.has(key) && !!seen.add(key)) : [];
	return [...normalized, ...fallback.filter(key => !seen.has(key))];
};

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
			morningCount: clamp(storedSettings.quotes?.morningCount ?? defaults.quotes.morningCount, 1, 3),
			nightCount: clamp(storedSettings.quotes?.nightCount ?? defaults.quotes.nightCount, 1, 3),
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
			enabled: storedSettings.trivia?.enabled ?? defaults.trivia.enabled,
			morningCount: clamp(storedSettings.trivia?.morningCount ?? defaults.trivia.morningCount, 0, 3),
			nightCount: clamp(storedSettings.trivia?.nightCount ?? defaults.trivia.nightCount, 0, 3),
			types: {
				...defaults.trivia.types,
				...storedSettings.trivia?.types,
			},
		},
		funFacts: {
			enabled: storedSettings.funFacts?.enabled ?? defaults.funFacts.enabled,
			morningCount: clamp(storedSettings.funFacts?.morningCount ?? defaults.funFacts.morningCount, 0, 3),
			nightCount: clamp(storedSettings.funFacts?.nightCount ?? defaults.funFacts.nightCount, 0, 3),
			types: {
				...defaults.funFacts.types,
				...storedSettings.funFacts?.types,
			},
		},
		journalEntry: {
			enabled: storedSettings.journalEntry?.enabled ?? defaults.journalEntry.enabled,
			setting: storedSettings.journalEntry?.setting ?? defaults.journalEntry.setting,
			template: storedSettings.journalEntry?.template ?? defaults.journalEntry.template,
		},
		morningOrder: normalizeSurveyOrder(storedSettings.morningOrder, DEFAULT_MORNING_ORDER),
		nightOrder: normalizeSurveyOrder(storedSettings.nightOrder, DEFAULT_NIGHT_ORDER),
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

	const setQuestionEnabled = (question: QuestionType, enabled: boolean) => {
		setQuestionSettings(prev => ({
			...prev,
			[question]: {
				...prev[question],
				enabled,
			},
		}));
	};

	const setSurveyQuestionOrder = (surveyType: SurveyOrderType, order: SurveyQuestionKey[]) => {
		setQuestionSettings(prev => ({
			...prev,
			[surveyType === 'morning' ? 'morningOrder' : 'nightOrder']: normalizeSurveyOrder(order, surveyType === 'morning' ? DEFAULT_MORNING_ORDER : DEFAULT_NIGHT_ORDER),
		}));
	};

	const moveSurveyQuestion = (surveyType: SurveyOrderType, fromIndex: number, toIndex: number) => {
		setQuestionSettings(prev => {
			const orderKey = surveyType === 'morning' ? 'morningOrder' : 'nightOrder';
			const nextOrder = [...prev[orderKey]];
			const [moved] = nextOrder.splice(fromIndex, 1);
			if (!moved) return prev;
			nextOrder.splice(Math.max(0, Math.min(toIndex, nextOrder.length)), 0, moved);
			return {
				...prev,
				[orderKey]: normalizeSurveyOrder(nextOrder, surveyType === 'morning' ? DEFAULT_MORNING_ORDER : DEFAULT_NIGHT_ORDER),
			};
		});
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

	const setQuoteCount = (morning: number, night: number) => {
		setQuestionSettings(prev => ({
			...prev,
			quotes: {
				...prev.quotes,
				morningCount: clamp(morning, 1, 3),
				nightCount: clamp(night, 1, 3),
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

	const setFunFactCount = (morning: number, night: number) => {
		setQuestionSettings(prev => ({
			...prev,
			funFacts: {
				...prev.funFacts,
				morningCount: clamp(morning, 0, 3),
				nightCount: clamp(night, 0, 3),
			},
		}));
	};

	const updateFunFactsSettings = (types: Record<FunFactCategoryKey, boolean>) => {
		setQuestionSettings(prev => ({
			...prev,
			funFacts: {
				...prev.funFacts,
				types,
			},
		}));
	};

	const setJournalEntry = (setting: JournalPlacement, template: string) => {
		setQuestionSettings(prev => ({
			...prev,
			journalEntry: {
				...prev.journalEntry,
				setting,
				template,
			},
		}));
	};

	return (
		<QuestionContext.Provider
			value={{
				questionSettings,
				setQuestionEnabled,
				setSurveyQuestionOrder,
				moveSurveyQuestion,
				updateAdviceSettings,
				updateQuotesSettings,
				setQuoteCount,
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
				updateFunFactsSettings,
				setFunFactCount,
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
