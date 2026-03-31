import { Text, View } from '@/components/Themed';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface ExtraPromptItem {
	id: string;
	text: string;
}

export interface ExtraPromptsState {
	items: ExtraPromptItem[];
	responses: Record<string, string>;
	nextEnabled: boolean;
}

export type ExtraPromptsSetState = React.Dispatch<React.SetStateAction<ExtraPromptsState>>;

export interface UseExtraPromptsParams {
	mode: 'create' | 'answer';
	questionSettings?: QuestionSettings;
	enablePrompts?: boolean;
}

const makeId = () => `extra_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export function useExtraPromptsSection({ mode, questionSettings, enablePrompts }: UseExtraPromptsParams): SectionHookResult<ExtraPromptsState> {
	const { questionSettings: contextSettings } = useQuestions();
	const survey = useSurvey();
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);
	const resolvedSettings = questionSettings ?? contextSettings;
	const resolvedEnable = enablePrompts ?? survey.options.enableProjectQuestion ?? true;
	const promptsEnabled = resolvedEnable && resolvedSettings.prompts.enabled;

	const storedPrompts = useMemo(() => survey.getEveningPrompts?.(today) ?? [], [survey, today]);

	const [state, setState] = useState<ExtraPromptsState>({
		items: [],
		responses: {},
		nextEnabled: false,
	});

	useEffect(() => {
		if (!promptsEnabled) return;
		if (state.items.length > 0) return;
		setState(prev => ({
			...prev,
			items: storedPrompts.map((text, idx) => ({ id: `extra-${idx}`, text })),
		}));
	}, [promptsEnabled, state.items.length, storedPrompts]);

	useEffect(() => {
		if (mode !== 'create') return;
		if (!promptsEnabled) return;
		const texts = state.items.map(item => item.text.trim()).filter(Boolean);
		survey.setEveningPrompts?.(today, texts);
	}, [mode, promptsEnabled, state.items, survey, today]);

	const allFilled = useMemo(() => {
		if (mode !== 'answer') return true;
		if (state.items.length === 0) return true;
		return state.items.every(item => (state.responses[item.id] ?? '').trim().length > 0);
	}, [mode, state.items, state.responses]);

	const enableNext = useCallback(() => setState(prev => ({ ...prev, nextEnabled: true })), []);

	useEffect(() => {
		if (state.nextEnabled) return;
		if (allFilled) enableNext();
	}, [allFilled, enableNext, state.nextEnabled]);

	const isEnabled = promptsEnabled && (mode === 'create' || state.items.length > 0);

	const render = useCallback(() => {
		if (!promptsEnabled) return null;

		if (mode === 'create') {
			return (
				<View>
					<Text style={sectionStyles.question}>Create Extra Prompts for Evening</Text>
					<Text style={{ marginBottom: 12 }}>Add any custom prompts you want to answer tonight.</Text>

					{state.items.map(item => (
						<View key={item.id} style={{ marginBottom: 12 }}>
							<TextInput
								value={item.text}
								onChangeText={text =>
									setState(prev => ({
										...prev,
										items: prev.items.map(p => (p.id === item.id ? { ...p, text } : p)),
									}))
								}
								placeholder="Write a prompt for your evening self..."
								style={sectionStyles.textInputArea}
							/>
							<Pressable
								style={[sectionStyles.smallButton, { marginTop: 6 }]}
								onPress={() => setState(prev => ({ ...prev, items: prev.items.filter(p => p.id !== item.id) }))}>
								<Text selectable={false} style={sectionStyles.smallButtonText}>
									Remove
								</Text>
							</Pressable>
						</View>
					))}

					<Pressable
						style={sectionStyles.smallButton}
						onPress={() => setState(prev => ({ ...prev, items: [...prev.items, { id: makeId(), text: '' }] }))}>
						<Text selectable={false} style={sectionStyles.smallButtonText}>
							+ Add Prompt
						</Text>
					</Pressable>
				</View>
			);
		}

		return (
			<View>
				<Text style={sectionStyles.question}>Answer Your Prompts</Text>
				{state.items.map(item => (
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
	}, [mode, promptsEnabled, state.items, state.responses]);

	return {
		section: {
			key: mode === 'create' ? 'extraPromptsCreate' : 'extraPromptsAnswer',
			label: mode === 'create' ? 'Extra Prompts' : 'Answer Prompts',
			isEnabled,
			isNextEnabled: mode === 'answer' ? state.nextEnabled || state.items.length === 0 : true,
			enableNext: mode === 'answer' ? enableNext : null,
			render,
		},
		state,
		setState,
		saveState: () => ({ ...state }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({
				...prev,
				items: Array.isArray(data.items) ? data.items : prev.items,
				responses: data.responses ?? prev.responses,
				nextEnabled: data.nextEnabled ?? prev.nextEnabled,
			}));
		},
	};
}
