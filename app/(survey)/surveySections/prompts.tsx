import { Text, View } from '@/components/Themed';
import { PROMPTS, type WrittenPrompt } from '@/constants/prompts';
import { useQuestions, type QuestionSettings, type CustomPrompt } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TextInput } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface PromptItem {
	id: string;
	text: string;
	source: 'random' | 'custom' | 'extra';
}

export interface ShortAnswersState {
	randomPrompts: PromptItem[];
	responses: Record<string, string>;
	nextEnabled: boolean;
}

export type ShortAnswersSetState = React.Dispatch<React.SetStateAction<ShortAnswersState>>;

export interface UseShortAnswersParams {
	surveyType: 'morning' | 'night';
	questionSettings?: QuestionSettings;
	randomPromptCount?: number;
	extraPrompts?: string[];
	enablePrompts?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toPromptItem = (prompt: WrittenPrompt, index: number): PromptItem => ({
	id: `prompt-${index}`,
	text: prompt.text,
	source: 'random',
});

const toCustomItem = (prompt: CustomPrompt): PromptItem => ({
	id: `custom-${prompt.id}`,
	text: prompt.text,
	source: 'custom',
});

const pickRandom = <T,>(items: T[], count: number) => {
	if (count <= 0) return [];
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy.slice(0, Math.min(count, copy.length));
};

const promptCategoryEnabled = (settings: QuestionSettings['prompts']['types'], category: WrittenPrompt['category']) => {
	const key = category as keyof typeof settings;
	if (key in settings) return !!settings[key];
	return false;
};

export function useShortAnswersSection({ surveyType, questionSettings, randomPromptCount, extraPrompts = [], enablePrompts }: UseShortAnswersParams): SectionHookResult<ShortAnswersState> & { promptItems: PromptItem[] } {
	const { questionSettings: contextSettings } = useQuestions();
	const survey = useSurvey();
	const resolvedSettings = questionSettings ?? contextSettings;
	const resolvedEnable = enablePrompts ?? survey.options.enableProjectQuestion ?? true;
	const resolvedRandomCount = randomPromptCount ?? survey.options.randomPromptCount ?? 0;
	const isEnabled = resolvedEnable && resolvedSettings.prompts.enabled;

	const enabledPromptPool = useMemo(() => {
		if (!isEnabled) return [] as WrittenPrompt[];
		return PROMPTS.filter(p => promptCategoryEnabled(resolvedSettings.prompts.types, p.category));
	}, [isEnabled, resolvedSettings.prompts.types]);

	const customPromptsForSurvey = useMemo(() => {
		if (!isEnabled) return [] as CustomPrompt[];
		return (resolvedSettings.prompts.customPrompts ?? []).filter(p => p.appliesTo === 'both' || (surveyType === 'morning' ? p.appliesTo === 'morning' : p.appliesTo === 'evening'));
	}, [isEnabled, resolvedSettings.prompts.customPrompts, surveyType]);

	const fixedCustom = useMemo(() => customPromptsForSurvey.filter(p => !p.randomized), [customPromptsForSurvey]);
	const randomizedCustom = useMemo(() => customPromptsForSurvey.filter(p => p.randomized), [customPromptsForSurvey]);

	const randomCount = clamp(resolvedRandomCount, 0, 3);

	const [state, setState] = useState<ShortAnswersState>({
		randomPrompts: [],
		responses: {},
		nextEnabled: false,
	});

	useEffect(() => {
		if (!isEnabled) return;
		if (state.randomPrompts.length > 0) return;
		const randomPool = [...enabledPromptPool.map(toPromptItem), ...randomizedCustom.map(toCustomItem)];
		const picked = pickRandom(randomPool, randomCount);
		setState(prev => ({ ...prev, randomPrompts: picked }));
	}, [enabledPromptPool, isEnabled, randomCount, randomizedCustom, state.randomPrompts.length]);

	const extraPromptItems = useMemo<PromptItem[]>(() => extraPrompts.map((text, idx) => ({ id: `extra-${idx}`, text, source: 'extra' })), [extraPrompts]);

	const promptItems = useMemo<PromptItem[]>(() => {
		return [...fixedCustom.map(toCustomItem), ...state.randomPrompts, ...extraPromptItems];
	}, [extraPromptItems, fixedCustom, state.randomPrompts]);

	const allFilled = useMemo(() => {
		if (!isEnabled || promptItems.length === 0) return true;
		return promptItems.every(item => {
			const val = state.responses[item.id] ?? '';
			return val.trim().length > 0;
		});
	}, [isEnabled, promptItems, state.responses]);

	const enableNext = useCallback(() => setState(prev => ({ ...prev, nextEnabled: true })), []);

	useEffect(() => {
		if (state.nextEnabled) return;
		if (allFilled) enableNext();
	}, [allFilled, enableNext, state.nextEnabled]);

	const render = useCallback(() => {
		if (!isEnabled) return null;
		if (promptItems.length === 0) {
			return (
				<View>
					<Text style={sectionStyles.question}>Short Answers</Text>
					<Text style={{ marginBottom: 12 }}>No prompts are enabled in settings.</Text>
				</View>
			);
		}

		return (
			<View>
				<Text style={sectionStyles.question}>Short Answers</Text>
				{promptItems.map(item => (
					<View key={item.id} style={{ marginBottom: 16 }}>
						<View style={sectionStyles.arrowRow}>
							<Text style={sectionStyles.arrowBullet}>{'>'}</Text>
							<Text style={sectionStyles.arrowText}>{item.text}</Text>
						</View>
						<TextInput
							value={state.responses[item.id] ?? ''}
							onChangeText={text => setState(prev => ({ ...prev, responses: { ...prev.responses, [item.id]: text } }))}
							placeholder="Your response..."
							multiline
							style={sectionStyles.textInputArea}
						/>
					</View>
				))}
			</View>
		);
	}, [isEnabled, promptItems, state.responses]);

	return {
		section: {
			key: 'shortAnswers',
			label: 'Short Answers',
			isEnabled,
			isNextEnabled: state.nextEnabled || promptItems.length === 0,
			enableNext: isEnabled ? enableNext : null,
			render,
		},
		state,
		setState,
		promptItems,
		saveState: () => ({ ...state }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({
				...prev,
				randomPrompts: Array.isArray(data.randomPrompts) ? data.randomPrompts : prev.randomPrompts,
				responses: data.responses ?? prev.responses,
				nextEnabled: data.nextEnabled ?? prev.nextEnabled,
			}));
		},
	};
}
