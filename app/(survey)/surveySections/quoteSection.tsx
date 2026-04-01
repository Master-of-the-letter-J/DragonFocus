import { Text, View } from '@/components/Themed';
import { QUOTES, type Quote } from '@/constants/quotes';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface QuoteSectionState {
	quoteIndex: number | null;
}

export type QuoteSectionSetState = React.Dispatch<React.SetStateAction<QuoteSectionState>>;

export interface UseQuoteSectionParams {
	surveyType: 'morning' | 'night';
	questionSettings?: QuestionSettings;
	enableQuote?: boolean;
	showInMorning?: boolean;
	currentScarLevel?: number;
}

const pickRandomIndex = (len: number) => (len > 0 ? Math.floor(Math.random() * len) : null);

export function useQuoteSection({ surveyType, questionSettings, enableQuote, showInMorning, currentScarLevel }: UseQuoteSectionParams): SectionHookResult<QuoteSectionState> {
	const { questionSettings: contextSettings } = useQuestions();
	const survey = useSurvey();
	const scarLevel = useScarLevel();
	const resolvedSettings = questionSettings ?? contextSettings;
	const resolvedEnable = enableQuote ?? survey.options.showQuote ?? true;
	const resolvedShowInMorning = showInMorning ?? survey.options.quoteMorning ?? true;
	const resolvedScar = currentScarLevel ?? scarLevel.currentScarLevel ?? 0;

	const allowedTypes = useMemo(() => {
		return Object.entries(resolvedSettings.quotes.types)
			.filter(([, enabled]) => enabled)
			.map(([key]) => key as Quote['category']);
	}, [resolvedSettings.quotes.types]);

	const pool = useMemo(() => {
		if (!resolvedSettings.quotes.enabled) return [] as Quote[];
		if (allowedTypes.length === 0) return [] as Quote[];
		const filtered = QUOTES.filter(q => allowedTypes.includes(q.category));
		return filtered.length > 0 ? filtered : QUOTES;
	}, [allowedTypes, resolvedSettings.quotes.enabled]);

	const isEnabled = resolvedEnable && resolvedSettings.quotes.enabled && (surveyType !== 'morning' || resolvedShowInMorning) && resolvedScar >= 1 && pool.length > 0;
	const [state, setState] = useState<QuoteSectionState>({ quoteIndex: null });

	useEffect(() => {
		if (!isEnabled) return;
		if ((state.quoteIndex === null || state.quoteIndex >= pool.length) && pool.length > 0) {
			setState(prev => ({ ...prev, quoteIndex: pickRandomIndex(pool.length) }));
		}
	}, [isEnabled, pool.length, state.quoteIndex]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>Dragon Exhales...</Text>
				{state.quoteIndex !== null && pool[state.quoteIndex] ? (
					<>
						<Text selectable={false} style={[sectionStyles.adviceText, { fontStyle: 'italic', marginBottom: 12 }]}>
							"{pool[state.quoteIndex].text}{pool[state.quoteIndex].author ? ` — ${pool[state.quoteIndex].author}` : ''}"
						</Text>
						<Text selectable={false} style={sectionStyles.adviceLabel}>
							— Words of wisdom
						</Text>
					</>
				) : (
					<Text style={{ marginBottom: 12 }}>An inspiring thought for you.</Text>
				)}
			</View>
		);
	}, [pool, state.quoteIndex]);

	return {
		section: {
			key: 'quote',
			label: 'Quote',
			isEnabled,
			isNextEnabled: true,
			enableNext: null,
			render,
		},
		state,
		setState,
		saveState: () => ({ quoteIndex: state.quoteIndex }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({ ...prev, quoteIndex: typeof data.quoteIndex === 'number' ? data.quoteIndex : prev.quoteIndex }));
		},
	};
}

