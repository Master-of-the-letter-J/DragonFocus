import { Text, View } from '@/components/Themed';
import { SURVEY_ADVICE, type AdviceItem } from '@/constants/advice';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface AdviceSectionState {
	adviceIndex: number | null;
}

export type AdviceSectionSetState = React.Dispatch<React.SetStateAction<AdviceSectionState>>;

export interface UseAdviceSectionParams {
	questionSettings?: QuestionSettings;
	enableAdvice?: boolean;
	minScarLevel?: number;
	currentScarLevel?: number;
	initialIndex?: number | null;
}

const pickRandomIndex = (len: number) => (len > 0 ? Math.floor(Math.random() * len) : null);

export function useSurveyAdviceSection({ questionSettings, enableAdvice, minScarLevel, currentScarLevel, initialIndex = null }: UseAdviceSectionParams = {}): SectionHookResult<AdviceSectionState> {
	const { questionSettings: contextSettings } = useQuestions();
	const survey = useSurvey();
	const scarLevel = useScarLevel();
	const resolvedSettings = questionSettings ?? contextSettings;
	const resolvedEnable = enableAdvice ?? survey.options.enableAdvice ?? true;
	const resolvedMinScar = minScarLevel ?? survey.options.adviceScarLevel ?? 0;
	const resolvedScar = currentScarLevel ?? scarLevel.currentScarLevel ?? 0;

	const allowedTypes = useMemo(() => {
		return Object.entries(resolvedSettings.advice.types)
			.filter(([, enabled]) => enabled)
			.map(([key]) => key as AdviceItem['category']);
	}, [resolvedSettings.advice.types]);

	const pool = useMemo(() => {
		if (!resolvedSettings.advice.enabled || allowedTypes.length === 0) return [] as string[];
		return SURVEY_ADVICE.filter(item => allowedTypes.includes(item.category)).map(item => item.text);
	}, [allowedTypes, resolvedSettings.advice.enabled]);

	const hasEnabledTypes = !!(resolvedSettings.advice.types.inspirational || resolvedSettings.advice.types.witty || resolvedSettings.advice.types.philosophical);
	const isEnabled = resolvedEnable && resolvedSettings.advice.enabled && hasEnabledTypes && pool.length > 0 && resolvedScar >= resolvedMinScar;

	const [state, setState] = useState<AdviceSectionState>({ adviceIndex: initialIndex });

	useEffect(() => {
		if (!isEnabled) return;
		if ((state.adviceIndex === null || state.adviceIndex >= pool.length) && pool.length > 0) {
			setState(prev => ({ ...prev, adviceIndex: pickRandomIndex(pool.length) }));
		}
	}, [isEnabled, pool.length, state.adviceIndex]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>Dragon Inhales...</Text>
				{state.adviceIndex !== null && pool[state.adviceIndex] ? (
					<>
						<Text style={sectionStyles.adviceText}>{pool[state.adviceIndex]}</Text>
						<Text style={sectionStyles.adviceLabel}>— Advice for today</Text>
					</>
				) : (
					<Text style={{ marginBottom: 12 }}>A piece of wisdom for your journey.</Text>
				)}
			</View>
		);
	}, [pool, state.adviceIndex]);

	return {
		section: {
			key: 'advice',
			label: 'Advice',
			isEnabled,
			isNextEnabled: true,
			enableNext: null,
			render,
		},
		state,
		setState,
		saveState: () => ({ adviceIndex: state.adviceIndex }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({ ...prev, adviceIndex: typeof data.adviceIndex === 'number' ? data.adviceIndex : null }));
		},
	};
}

