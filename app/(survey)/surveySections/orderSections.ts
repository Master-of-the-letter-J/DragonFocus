import type { SurveyQuestionKey } from '@/context/QuestionProvider';
import type { SurveySectionConfig } from './sectionTypes';

const SECTION_TO_QUESTION: Record<string, SurveyQuestionKey> = {
	advice: 'advice',
	mood: 'mood',
	habitEdit: 'habitGoals',
	habitFill: 'habitGoals',
	todoEdit: 'todoGoals',
	todoFill: 'todoGoals',
	shortAnswers: 'prompts',
	extraPromptsCreate: 'prompts',
	extraPromptsAnswer: 'prompts',
	trivia: 'trivia',
	funFacts: 'funFacts',
	journal: 'journalEntry',
	quote: 'quotes',
};

export const orderSurveySections = <TSection extends SurveySectionConfig>(sections: TSection[], order: SurveyQuestionKey[]) => {
	const orderIndex = new Map(order.map((key, index) => [key, index]));
	return [...sections].sort((a, b) => {
		const aIndex = orderIndex.get(SECTION_TO_QUESTION[a.key] ?? 'advice') ?? Number.MAX_SAFE_INTEGER;
		const bIndex = orderIndex.get(SECTION_TO_QUESTION[b.key] ?? 'advice') ?? Number.MAX_SAFE_INTEGER;
		return aIndex - bIndex;
	});
};
