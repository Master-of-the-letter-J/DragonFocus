import { Text, View } from '@/components/Themed';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { useSectionStyles } from './sectionStyles';

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
	readOnly?: boolean;
	lockedMessage?: string;
	minPromptLength?: number;
	minResponseLength?: number;
}

const makeId = () => `extra_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export function useExtraPromptsSection({
	mode,
	questionSettings,
	enablePrompts,
	readOnly = false,
	lockedMessage,
	minPromptLength = 10,
	minResponseLength = 25,
}: UseExtraPromptsParams): SectionHookResult<ExtraPromptsState> {
	const { questionSettings: contextSettings } = useQuestions();
	const survey = useSurvey();
	const sectionStyles = useSectionStyles();
	const today = useMemo(() => new Date().toISOString().split('T')[0], []);
	const resolvedSettings = questionSettings ?? contextSettings;
	const resolvedEnable = enablePrompts ?? true;
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
		if (readOnly) return;
		const texts = state.items.map(item => item.text.trim()).filter(Boolean);
		survey.setEveningPrompts?.(today, texts);
	}, [mode, promptsEnabled, readOnly, state.items, survey, today]);

	const allFilled = useMemo(() => {
		if (readOnly) return true;
		if (mode === 'create') {
			return state.items.every(item => item.text.trim().length >= minPromptLength);
		}
		if (mode !== 'answer') return true;
		if (state.items.length === 0) return true;
		return state.items.every(item => (state.responses[item.id] ?? '').trim().length >= minResponseLength);
	}, [minPromptLength, minResponseLength, mode, readOnly, state.items, state.responses]);

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
					<Text style={sectionStyles.question}>Create Extra Prompts for Night</Text>
					<Text style={[sectionStyles.bodyText, { marginBottom: 12 }]}>
						{readOnly ? lockedMessage ?? 'Extra prompts are locked on refill surveys.' : `Add any custom prompts you want to answer in tonight's survey. Each prompt needs ${minPromptLength}+ characters.`}
					</Text>

					{state.items.map(item => (
						<View key={item.id} style={{ marginBottom: 12 }}>
							<TextInput
								editable={!readOnly}
								value={item.text}
								onChangeText={text =>
									readOnly
										? undefined
										: setState(prev => ({
												...prev,
												items: prev.items.map(p => (p.id === item.id ? { ...p, text } : p)),
											}))
								}
								placeholder={readOnly ? 'Locked on refill' : `Write a prompt for your night survey... (${minPromptLength}+ characters)`}
								style={[sectionStyles.textInputArea, readOnly ? { opacity: 0.7 } : null]}
							/>
							{!readOnly ? (
								<Pressable
									style={[sectionStyles.smallButton, { marginTop: 6 }]}
									onPress={() => setState(prev => ({ ...prev, items: prev.items.filter(p => p.id !== item.id) }))}>
									<Text selectable={false} style={sectionStyles.smallButtonText}>
										Remove
									</Text>
								</Pressable>
							) : null}
						</View>
					))}

					{!readOnly ? (
						<Pressable
							style={sectionStyles.smallButton}
							onPress={() => setState(prev => ({ ...prev, items: [...prev.items, { id: makeId(), text: '' }] }))}>
							<Text selectable={false} style={sectionStyles.smallButtonText}>
								+ Add Prompt
							</Text>
						</Pressable>
					) : null}
				</View>
			);
		}

		return (
			<View>
				<Text style={sectionStyles.question}>Answer Your Prompts</Text>
				{readOnly ? <Text style={[sectionStyles.subtleText, { marginBottom: 12 }]}>{lockedMessage ?? 'Extra prompt answers are locked on refill surveys.'}</Text> : null}
				{state.items.map(item => (
					<View key={item.id} style={{ marginBottom: 16 }}>
						<View style={sectionStyles.arrowRow}>
							<Text style={sectionStyles.arrowBullet}>{'>'}</Text>
							<Text style={sectionStyles.arrowText}>{item.text}</Text>
						</View>
						<TextInput
							editable={!readOnly}
							value={state.responses[item.id] ?? ''}
							onChangeText={text => {
								if (readOnly) return;
								setState(prev => ({ ...prev, responses: { ...prev.responses, [item.id]: text } }));
							}}
							placeholder={readOnly ? 'Locked on refill' : `Your response... (${minResponseLength}+ characters)`}
							multiline
							style={[sectionStyles.textInputArea, readOnly ? { opacity: 0.7 } : null]}
						/>
					</View>
				))}
			</View>
		);
	}, [lockedMessage, minPromptLength, minResponseLength, mode, promptsEnabled, readOnly, state.items, state.responses]);

	return {
		section: {
			key: mode === 'create' ? 'extraPromptsCreate' : 'extraPromptsAnswer',
			label: mode === 'create' ? 'Extra Prompts' : 'Answer Prompts',
			isEnabled,
			isNextEnabled: readOnly || allFilled || state.items.length === 0,
			enableNext: readOnly ? null : enableNext,
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
