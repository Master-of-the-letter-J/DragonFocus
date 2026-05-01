import { Text, View } from '@/components/Themed';
import { formatAbbreviatedNumber, formatDecimalNumber } from '@/constants/number-abbreviation';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface SurveyResultsData {
	coinsEarned: number;
	shardsEarned: number;
	xpEarned: number;
	furyDelta: number;
	goalsCompleted?: number;
	groups?: Array<{
		title: string;
		entries: string[];
	}>;
}

export interface ResultsSectionState {
	results: SurveyResultsData | null;
	title: string;
}

export interface UseResultsSectionParams {
	title: string;
	results: SurveyResultsData | null;
	onFinish: () => void;
}

export function useResultsSection({ title, results, onFinish }: UseResultsSectionParams): SectionHookResult<ResultsSectionState> {
	const [state, setState] = useState<ResultsSectionState>({ results, title });

	useEffect(() => {
		setState(prev => ({ ...prev, results, title }));
	}, [results, title]);

	const render = useCallback(() => {
		if (!state.results) return null;
		return (
			<View style={sectionStyles.content}>
				<Text style={sectionStyles.title}>{state.title}</Text>
				<View style={sectionStyles.resultsCard}>
					<Text style={sectionStyles.resultText}>Coins Earned: +{formatAbbreviatedNumber(state.results.coinsEarned)}</Text>
					<Text style={sectionStyles.resultText}>Shards Earned: +{formatAbbreviatedNumber(state.results.shardsEarned)}</Text>
					<Text style={sectionStyles.resultText}>Fire XP Earned: +{formatAbbreviatedNumber(state.results.xpEarned)}</Text>
					<Text style={sectionStyles.resultText}>
						Fury: {state.results.furyDelta > 0 ? '+' : ''}
						{formatDecimalNumber(state.results.furyDelta)}
					</Text>
					{typeof state.results.goalsCompleted === 'number' ? <Text style={sectionStyles.resultText}>Goals Completed Today: {formatAbbreviatedNumber(state.results.goalsCompleted, 0)}</Text> : null}
					{(state.results.groups ?? []).map(group => (
						<View key={group.title} style={sectionStyles.resultsSection}>
							<Text style={sectionStyles.resultsSectionTitle}>{group.title}</Text>
							{group.entries.map(entry => (
								<Text key={`${group.title}-${entry}`} style={sectionStyles.resultListItem}>
									- {entry}
								</Text>
							))}
						</View>
					))}
				</View>
				<Pressable style={sectionStyles.finishButton} onPress={onFinish}>
					<Text style={sectionStyles.finishButtonText}>Return</Text>
				</Pressable>
			</View>
		);
	}, [onFinish, state.results, state.title]);

	return {
		section: {
			key: 'results',
			label: 'Results',
			isEnabled: !!state.results,
			isNextEnabled: true,
			enableNext: null,
			render,
		},
		state,
		setState,
		saveState: () => ({ ...state }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({
				...prev,
				results: data.results ?? prev.results,
				title: data.title ?? prev.title,
			}));
		},
	};
}
