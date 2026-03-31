import { Text, View } from '@/components/Themed';
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
					<Text style={sectionStyles.resultText}>Coins Earned: +{state.results.coinsEarned}</Text>
					<Text style={sectionStyles.resultText}>Shards Earned: +{state.results.shardsEarned}</Text>
					<Text style={sectionStyles.resultText}>Fire XP Earned: +{state.results.xpEarned}</Text>
					<Text style={sectionStyles.resultText}>
						Fury: {state.results.furyDelta > 0 ? '+' : ''}
						{state.results.furyDelta}
					</Text>
					{typeof state.results.goalsCompleted === 'number' && <Text style={sectionStyles.resultText}>Goals Completed Today: {state.results.goalsCompleted}</Text>}
				</View>
				<Pressable style={sectionStyles.finishButton} onPress={onFinish}>
					<Text style={sectionStyles.finishButtonText}>Return to Home</Text>
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

