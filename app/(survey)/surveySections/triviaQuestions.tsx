import { Text, View } from '@/components/Themed';
import { TRIVIA, type TriviaQuestion } from '@/constants/prompts';
import { useQuestions, type QuestionSettings } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

export interface TriviaItem {
	id: string;
	question: TriviaQuestion;
	answers: string[];
	correctLocalIndex: number;
}

export interface TriviaQuestionsState {
	items: TriviaItem[];
	responses: Record<string, { selectedIndex: number | null; submitted: boolean }>;
	nextEnabled: boolean;
}

export type TriviaQuestionsSetState = React.Dispatch<React.SetStateAction<TriviaQuestionsState>>;

export interface UseTriviaQuestionsParams {
	surveyType: 'morning' | 'night';
	questionSettings?: QuestionSettings;
	enableTrivia?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const isCategoryEnabled = (types: QuestionSettings['trivia']['types'], category: TriviaQuestion['category']) => {
	const key = category as keyof typeof types;
	if (key in types) return !!types[key];
	if (category === 'General') return !!types.General || !!(types as any).GeneralKnowledge;
	return false;
};

const pickRandom = <T,>(items: T[], count: number) => {
	if (count <= 0) return [];
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy.slice(0, Math.min(count, copy.length));
};

const shuffleAnswers = (question: TriviaQuestion) => {
	const source = question.answers.map((a, i) => ({ a, i }));
	for (let i = source.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[source[i], source[j]] = [source[j], source[i]];
	}
	const answers = source.map(s => s.a);
	const correctLocalIndex = source.findIndex(s => s.i === question.correctIndex);
	return { answers, correctLocalIndex };
};

export function useTriviaQuestionsSection({ surveyType, questionSettings, enableTrivia }: UseTriviaQuestionsParams): SectionHookResult<TriviaQuestionsState> & { correctCount: () => number } {
	const { questionSettings: contextSettings } = useQuestions();
	const survey = useSurvey();
	const resolvedSettings = questionSettings ?? contextSettings;
	const resolvedEnable = enableTrivia ?? survey.options.enableRandomMC ?? true;

	const count = clamp(surveyType === 'morning' ? resolvedSettings.trivia.morningCount : resolvedSettings.trivia.eveningCount, 0, 3);

	const pool = useMemo(() => TRIVIA.filter(t => isCategoryEnabled(resolvedSettings.trivia.types, t.category)), [resolvedSettings.trivia.types]);
	const isEnabled = resolvedEnable && count > 0 && pool.length > 0;

	const [state, setState] = useState<TriviaQuestionsState>({
		items: [],
		responses: {},
		nextEnabled: false,
	});

	useEffect(() => {
		if (!isEnabled) return;
		if (state.items.length > 0) return;
		const picked = pickRandom(pool, count).map(q => {
			const { answers, correctLocalIndex } = shuffleAnswers(q);
			const id = `trivia-${TRIVIA.indexOf(q)}`;
			return { id, question: q, answers, correctLocalIndex };
		});
		setState(prev => ({ ...prev, items: picked }));
	}, [count, isEnabled, pool, state.items.length]);

	const allSubmitted = useMemo(() => {
		if (!isEnabled || state.items.length === 0) return true;
		return state.items.every(item => state.responses[item.id]?.submitted);
	}, [isEnabled, state.items, state.responses]);

	const enableNext = useCallback(() => setState(prev => ({ ...prev, nextEnabled: true })), []);

	useEffect(() => {
		if (state.nextEnabled) return;
		if (allSubmitted) {
			enableNext();
		}
	}, [allSubmitted, enableNext, state.nextEnabled]);

	const correctCount = useCallback(() => {
		return state.items.reduce((acc, item) => {
			const response = state.responses[item.id];
			if (!response?.submitted) return acc;
			if (response.selectedIndex === item.correctLocalIndex) return acc + 1;
			return acc;
		}, 0);
	}, [state.items, state.responses]);

	const render = useCallback(() => {
		if (!isEnabled) return null;
		return (
			<View>
				<Text style={sectionStyles.question}>Quick Trivia</Text>
				{state.items.map(item => {
					const response = state.responses[item.id] || { selectedIndex: null, submitted: false };
					return (
						<View key={item.id} style={{ marginBottom: 16 }}>
							<Text selectable={false} style={{ marginBottom: 12 }}>
								{item.question.text}
							</Text>
							<Text selectable={false} style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
								Select your answer:
							</Text>
							{item.answers.map((answer, i) => {
								const isSelected = response.selectedIndex === i;
								const submitted = response.submitted;
								const isCorrect = i === item.correctLocalIndex;

								return (
									<Pressable
										key={`${item.id}-${i}`}
										style={[sectionStyles.mcOption, isSelected && sectionStyles.mcSelected, submitted && isCorrect && sectionStyles.mcCorrect, submitted && isSelected && !isCorrect && sectionStyles.mcIncorrect]}
										onPress={() =>
											!submitted &&
											setState(prev => ({
												...prev,
												responses: { ...prev.responses, [item.id]: { ...response, selectedIndex: i } },
											}))
										}>
										<Text selectable={false}>{answer}</Text>
										{submitted && isCorrect && (
											<Text selectable={false} style={{ marginLeft: 8 }}>
												OK
											</Text>
										)}
										{submitted && isSelected && !isCorrect && (
											<Text selectable={false} style={{ marginLeft: 8 }}>
												X
											</Text>
										)}
									</Pressable>
								);
							})}

							{!response.submitted && (
								<Pressable
									style={[sectionStyles.smallButton, { marginTop: 12 }]}
									onPress={() =>
										setState(prev => ({
											...prev,
											responses: { ...prev.responses, [item.id]: { ...response, submitted: true } },
										}))
									}>
									<Text selectable={false} style={sectionStyles.smallButtonText}>
										Submit Answer
									</Text>
								</Pressable>
							)}

							{response.submitted && (
								<Text selectable={false} style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
									Correct answer: {item.answers[item.correctLocalIndex]}
								</Text>
							)}
						</View>
					);
				})}
			</View>
		);
	}, [isEnabled, state.items, state.responses]);

	return {
		section: {
			key: 'trivia',
			label: 'Trivia',
			isEnabled,
			isNextEnabled: state.nextEnabled || state.items.length === 0,
			enableNext: isEnabled ? enableNext : null,
			render,
		},
		state,
		setState,
		correctCount,
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
