import { Text, View } from '@/components/Themed';
import { QUOTES, type Quote } from '@/data/quotes-data';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SectionHookResult } from './sectionTypes';
import { useSectionStyles } from './sectionStyles';

export interface QuoteSectionState {
	quoteIndex: number | null;
	quoteIndices: number[];
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
const pickRandomIndices = (len: number, count: number) => {
	const indices = Array.from({ length: len }, (_, index) => index);
	for (let i = indices.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}
	return indices.slice(0, Math.min(count, len));
};

export function useQuoteSection({ surveyType, questionSettings, enableQuote, showInMorning, currentScarLevel }: UseQuoteSectionParams): SectionHookResult<QuoteSectionState> {
	const { questionSettings: contextSettings } = useQuestions();
	const scarLevel = useScarLevel();
	const sectionStyles = useSectionStyles();
	const resolvedSettings = questionSettings ?? contextSettings;
	const resolvedEnable = enableQuote ?? true;
	const resolvedShowInMorning = showInMorning ?? true;
	const resolvedScar = currentScarLevel ?? scarLevel.currentScarLevel ?? 0;
	const quoteCount = Math.min(3, Math.max(1, surveyType === 'morning' ? resolvedSettings.quotes.morningCount : resolvedSettings.quotes.nightCount));

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
	const [state, setState] = useState<QuoteSectionState>({ quoteIndex: null, quoteIndices: [] });

	useEffect(() => {
		if (!isEnabled) return;
		const validIndices = state.quoteIndices.length === quoteCount && state.quoteIndices.every(index => index < pool.length);
		if (!validIndices && pool.length > 0) {
			const quoteIndices = pickRandomIndices(pool.length, quoteCount);
			setState(prev => ({ ...prev, quoteIndex: quoteIndices[0] ?? pickRandomIndex(pool.length), quoteIndices }));
		}
	}, [isEnabled, pool.length, quoteCount, state.quoteIndices]);

	const quotes = useMemo(() => {
		const indices = state.quoteIndices.length > 0 ? state.quoteIndices : state.quoteIndex !== null ? [state.quoteIndex] : [];
		return indices.map(index => pool[index]).filter(Boolean);
	}, [pool, state.quoteIndex, state.quoteIndices]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>Dragon Exhales...</Text>
				{quotes.length > 0 ? (
					<>
						{quotes.map((quote, index) => (
							<Text key={`${quote.text}-${index}`} selectable={false} style={[sectionStyles.adviceText, { fontStyle: 'italic', marginBottom: 12 }]}>
								"{quote.text}{quote.author ? ` - ${quote.author}` : ''}"
							</Text>
						))}
						<Text selectable={false} style={sectionStyles.adviceLabel}>
							— Words of wisdom
						</Text>
					</>
				) : (
					<Text style={[sectionStyles.bodyText, { marginBottom: 12 }]}>An inspiring thought for you.</Text>
				)}
			</View>
		);
	}, [quotes]);

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
		saveState: () => ({ quoteIndex: state.quoteIndex, quoteIndices: state.quoteIndices }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({
				...prev,
				quoteIndex: typeof data.quoteIndex === 'number' ? data.quoteIndex : prev.quoteIndex,
				quoteIndices: Array.isArray(data.quoteIndices) ? data.quoteIndices : prev.quoteIndices,
			}));
		},
	};
}

