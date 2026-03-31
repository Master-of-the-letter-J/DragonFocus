import { Text, View } from '@/components/Themed';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface MoodOption {
	emoji: string;
	label: string;
	fury: number;
}

export interface MoodSectionState {
	selectedIndex: number | null;
}

export type MoodSectionSetState = React.Dispatch<React.SetStateAction<MoodSectionState>>;

export interface UseMoodQuestionParams {
	questionSettings?: QuestionSettings;
	enableMood?: boolean;
	initialIndex?: number | null;
	onSelect?: (index: number, option: MoodOption) => void;
}

const DEFAULT_MOOD_OPTIONS: MoodOption[] = [
	{ emoji: 'D:', label: 'Devastated', fury: +10 },
	{ emoji: ':-(', label: 'Sad', fury: +6 },
	{ emoji: ':-/', label: 'Worried', fury: +3 },
	{ emoji: 'o_O', label: 'Confused', fury: +1 },
	{ emoji: ':-|', label: 'Neutral', fury: 0 },
	{ emoji: ':-)', label: 'Okay', fury: -1 },
	{ emoji: ':]', label: 'Content', fury: -3 },
	{ emoji: ':D', label: 'Happy', fury: -5 },
	{ emoji: '^_^', label: 'Cheerful', fury: -7 },
	{ emoji: 'XD', label: 'Excited', fury: -8 },
	{ emoji: '>:/', label: 'Frustrated', fury: +5 },
	{ emoji: '>:[', label: 'Angry', fury: +9 },
];

export function useMoodQuestionSection({ questionSettings, enableMood, initialIndex = null, onSelect }: UseMoodQuestionParams = {}): SectionHookResult<MoodSectionState> & { moodOptions: MoodOption[] } {
	const { questionSettings: contextSettings } = useQuestions();
	const survey = useSurvey();
	const resolvedSettings = questionSettings ?? contextSettings;
	const resolvedEnable = enableMood ?? survey.options.enableMoodQuestion ?? true;

	const moodOptions = useMemo<MoodOption[]>(() => {
		if (resolvedSettings.mood.customEmotions && resolvedSettings.mood.customEmotions.length > 0) {
			return resolvedSettings.mood.customEmotions.map(e => ({ emoji: e.emoji, label: e.description ?? e.emoji, fury: e.furyChange }));
		}
		return DEFAULT_MOOD_OPTIONS;
	}, [resolvedSettings.mood.customEmotions]);

	const isEnabled = resolvedEnable && resolvedSettings.mood.enabled && moodOptions.length > 0;
	const [state, setState] = useState<MoodSectionState>({ selectedIndex: initialIndex });

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>How are you feeling?</Text>
				<View style={sectionStyles.moodGrid}>
					{moodOptions.map((m, idx) => (
						<Pressable
							key={`${m.label}-${idx}`}
							style={[sectionStyles.moodButton, state.selectedIndex === idx && sectionStyles.moodSelected]}
							onPress={() => {
								setState(prev => ({ ...prev, selectedIndex: idx }));
								onSelect?.(idx, m);
							}}>
							<Text selectable={false} style={sectionStyles.moodEmoji}>
								{m.emoji}
							</Text>
							<Text selectable={false} style={sectionStyles.moodLabel}>
								{m.label}
							</Text>
						</Pressable>
					))}
				</View>
			</View>
		);
	}, [moodOptions, onSelect, state.selectedIndex]);

	return {
		section: {
			key: 'mood',
			label: 'Mood',
			isEnabled,
			isNextEnabled: true,
			enableNext: null,
			render,
		},
		state,
		setState,
		moodOptions,
		saveState: () => ({ selectedIndex: state.selectedIndex }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({ ...prev, selectedIndex: typeof data.selectedIndex === 'number' ? data.selectedIndex : null }));
		},
	};
}
