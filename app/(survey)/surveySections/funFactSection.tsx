import { Text, View } from '@/components/Themed';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { FUN_FACTS, type FunFact } from '@/data/fun-fact-data';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSectionStyles } from './sectionStyles';
import type { SectionHookResult } from './sectionTypes';

export interface FunFactSectionState {
	factIndices: number[];
}

export interface UseFunFactSectionParams {
	surveyType: 'morning' | 'night';
	questionSettings?: QuestionSettings;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const pickRandomIndices = (length: number, count: number) => {
	const indices = Array.from({ length }, (_, index) => index);
	for (let i = indices.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}
	return indices.slice(0, Math.min(count, length));
};

export function useFunFactSection({ surveyType, questionSettings }: UseFunFactSectionParams): SectionHookResult<FunFactSectionState> {
	const { questionSettings: contextSettings } = useQuestions();
	const sectionStyles = useSectionStyles();
	const resolvedSettings = questionSettings ?? contextSettings;
	const count = clamp(surveyType === 'morning' ? resolvedSettings.funFacts.morningCount : resolvedSettings.funFacts.nightCount, 0, 3);

	const allowedTypes = useMemo(() => {
		return Object.entries(resolvedSettings.funFacts.types)
			.filter(([, enabled]) => enabled)
			.map(([key]) => key as FunFact['category']);
	}, [resolvedSettings.funFacts.types]);

	const pool = useMemo(() => {
		if (!resolvedSettings.funFacts.enabled) return [] as FunFact[];
		if (allowedTypes.length === 0) return [] as FunFact[];
		const filtered = FUN_FACTS.filter(f => allowedTypes.includes(f.category));
		return filtered.length > 0 ? filtered : FUN_FACTS;
	}, [allowedTypes, resolvedSettings.funFacts.enabled]);

	const isEnabled = resolvedSettings.funFacts.enabled && count > 0 && pool.length > 0;
	const [state, setState] = useState<FunFactSectionState>({ factIndices: [] });

	useEffect(() => {
		if (!isEnabled) return;
		if (state.factIndices.length === count && state.factIndices.every(index => index < pool.length)) return;
		setState({ factIndices: pickRandomIndices(pool.length, count) });
	}, [count, isEnabled, pool.length, state.factIndices]);

	const facts = useMemo(() => state.factIndices.map(index => pool[index]).filter(Boolean), [state.factIndices, pool]);

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>Fun Facts</Text>
				{facts.map((fact, index) => (
					<View key={fact.id} style={sectionStyles.factCard}>
						<Text style={sectionStyles.factNumber}>Fact {index + 1}</Text>
						<Text style={sectionStyles.adviceText}>{fact.text}</Text>
					</View>
				))}
			</View>
		);
	}, [facts]);

	return {
		section: {
			key: 'funFacts',
			label: 'Fun Facts',
			isEnabled,
			isNextEnabled: true,
			enableNext: null,
			render,
		},
		state,
		setState,
		saveState: () => ({ factIndices: state.factIndices }),
		restoreState: data => {
			if (!data) return;
			setState(prev => ({ ...prev, factIndices: Array.isArray(data.factIndices) ? data.factIndices : prev.factIndices }));
		},
	};
}
