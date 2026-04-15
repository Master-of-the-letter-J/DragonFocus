import { Text, View } from '@/components/Themed';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TextInput } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface JournalEntryState {
	text: string;
	nextEnabled: boolean;
}

export type JournalEntrySetState = React.Dispatch<React.SetStateAction<JournalEntryState>>;

export interface UseJournalEntryParams {
	surveyType: 'morning' | 'night';
	questionSettings?: QuestionSettings;
	initialText?: string;
	enableJournal?: boolean;
}

export function useJournalEntrySection({ surveyType, questionSettings, initialText = '', enableJournal }: UseJournalEntryParams): SectionHookResult<JournalEntryState> {
	const { questionSettings: contextSettings } = useQuestions();
	const survey = useSurvey();
	const resolvedSettings = questionSettings ?? contextSettings;
	const defaultEnable = surveyType === 'morning' ? survey.options.enableJournalMorning : survey.options.enableJournalNight;
	const resolvedEnable = enableJournal ?? defaultEnable ?? true;

	const normalizedType = surveyType === 'night' ? 'night' : 'morning';
	const isEnabled = useMemo(() => {
		if (!resolvedEnable) return false;
		const setting = resolvedSettings.journalEntry.setting;
		if (setting === 'none') return false;
		if (setting === 'both') return true;
		return setting === normalizedType;
	}, [normalizedType, resolvedEnable, resolvedSettings.journalEntry.setting]);

	const [state, setState] = useState<JournalEntryState>({
		text: initialText,
		nextEnabled: false,
	});

	const enableNext = useCallback(() => setState(prev => ({ ...prev, nextEnabled: true })), []);

	useEffect(() => {
		if (state.nextEnabled) return;
		if (state.text.trim().length > 0) enableNext();
	}, [enableNext, state.nextEnabled, state.text]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>Journal Entry</Text>
				<TextInput
					value={state.text}
					onChangeText={t => setState(prev => ({ ...prev, text: t }))}
					placeholder={resolvedSettings.journalEntry.template || 'Write anything about your day...'}
					multiline
					style={sectionStyles.textInputArea}
				/>
			</View>
		);
	}, [resolvedSettings.journalEntry.template, state.text]);

	return {
		section: {
			key: 'journal',
			label: 'Journal',
			isEnabled,
			isNextEnabled: state.nextEnabled,
			enableNext: isEnabled ? enableNext : null,
			render,
		},
		state,
		setState,
		saveState: () => ({ ...state }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({
				...prev,
				text: typeof data.text === 'string' ? data.text : prev.text,
				nextEnabled: data.nextEnabled ?? prev.nextEnabled,
			}));
		},
	};
}
