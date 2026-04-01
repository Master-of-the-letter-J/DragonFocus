export interface SuggestedHabitGoal {
	title: string;
	category: 'Physical' | 'Mental' | 'Personal' | 'Social' | 'Creative' | 'Wellness';
	timesPerWeek?: number;
	importance?: 'Default' | 'Important' | 'Important+';
}

export interface SuggestedTodoGoal {
	title: string;
	category: 'Physical' | 'Mental' | 'Personal' | 'Social' | 'Creative' | 'Wellness' | 'Learning';
	dueDate?: number;
	coins: number;
	shards?: number;
	description?: string;
}

const uniqueByTitle = <T extends { title: string }>(items: T[]) => {
	const seen = new Set<string>();
	return items.filter(item => {
		if (seen.has(item.title)) return false;
		seen.add(item.title);
		return true;
	});
};

const HABIT_VARIANTS = [
	{ suffix: 'for 5 minutes', timesPerWeek: 5, importance: 'Default' as const },
	{ suffix: 'for 10 minutes', timesPerWeek: 5, importance: 'Default' as const },
	{ suffix: 'for 15 minutes', timesPerWeek: 6, importance: 'Default' as const },
	{ suffix: 'for 20 minutes', timesPerWeek: 6, importance: 'Important' as const },
	{ suffix: 'for 30 minutes', timesPerWeek: 7, importance: 'Important' as const },
	{ suffix: 'before lunch', timesPerWeek: 5, importance: 'Default' as const },
	{ suffix: 'before dinner', timesPerWeek: 5, importance: 'Important' as const },
	{ suffix: 'and track the result', timesPerWeek: 4, importance: 'Important' as const },
	{ suffix: 'before bed', timesPerWeek: 7, importance: 'Important+' as const },
];

const TODO_WINDOWS = [
	{ suffix: 'today', dueDate: 1, coins: 8 },
	{ suffix: 'before tomorrow night', dueDate: 2, coins: 10 },
	{ suffix: 'within 3 days', dueDate: 3, coins: 12 },
	{ suffix: 'this week', dueDate: 7, coins: 16 },
	{ suffix: 'within 10 days', dueDate: 10, coins: 18 },
	{ suffix: 'before the weekend', dueDate: 5, coins: 14 },
	{ suffix: 'before next Monday', dueDate: 6, coins: 15 },
	{ suffix: 'within 14 days', dueDate: 14, coins: 20 },
	{ suffix: 'before the month ends', dueDate: 30, coins: 24 },
];

const buildHabitCategory = (category: SuggestedHabitGoal['category'], stems: string[]): SuggestedHabitGoal[] => {
	return uniqueByTitle(
		stems.flatMap(stem =>
			HABIT_VARIANTS.map(variant => ({
				title: `${stem} ${variant.suffix}`.trim(),
				category,
				timesPerWeek: variant.timesPerWeek,
				importance: variant.importance,
			})),
		),
	);
};

const buildTodoCategory = (category: SuggestedTodoGoal['category'], stems: string[]): SuggestedTodoGoal[] => {
	return uniqueByTitle(
		stems.flatMap(stem =>
			TODO_WINDOWS.map(window => ({
				title: `${stem} ${window.suffix}`.trim(),
				category,
				dueDate: window.dueDate,
				coins: window.coins,
			})),
		),
	);
};

const PHYSICAL_HABITS = [
	'Walk briskly',
	'Stretch your full body',
	'Do push-ups',
	'Go for a run',
	'Practice mobility drills',
	'Train your core',
	'Do squats',
	'Cycle at an easy pace',
	'Practice balance work',
	'Do a yoga flow',
	'Take the stairs intentionally',
	'Use a resistance band',
];

const MENTAL_HABITS = [
	'Meditate quietly',
	'Read something thoughtful',
	'Journal your thoughts',
	'Practice deep breathing',
	'Do a digital detox',
	'Study a new idea',
	'Solve a puzzle',
	'Review your goals',
	'Practice gratitude',
	'Sit in silence',
	'Listen to an educational podcast',
	'Reflect on your mood',
];

const PERSONAL_HABITS = [
	'Tidy your room',
	'Organize your desk',
	'Review your budget',
	'Plan tomorrow',
	'Work on a passion project',
	'Learn a practical skill',
	'Prepare a healthy meal',
	'Handle home upkeep',
	'Review your calendar',
	'Practice your personal routine',
	'Declutter one small space',
	'Care for your plants',
];

const SOCIAL_HABITS = [
	'Send a thoughtful message',
	'Call someone you care about',
	'Check in on a friend',
	'Practice active listening',
	'Offer a sincere compliment',
	'Do a small act of kindness',
	'Reach out to family',
	'Share something encouraging',
	'Reconnect with an old friend',
	'Spend intentional time with someone',
	'Help someone with a task',
	'Plan a social touchpoint',
];

const CREATIVE_HABITS = [
	'Sketch freely',
	'Write creatively',
	'Practice an instrument',
	'Take photos mindfully',
	'Work on digital art',
	'Compose new ideas',
	'Paint or watercolor',
	'Build a craft project',
	'Create a short video',
	'Experiment with design',
	'Collect inspiration',
	'Practice a creative challenge',
];

const WELLNESS_HABITS = [
	'Drink water mindfully',
	'Go to bed on time',
	'Wake up gently',
	'Prepare a balanced meal',
	'Take your vitamins',
	'Stretch before bed',
	'Limit caffeine late',
	'Take a mindful break',
	'Get sunlight',
	'Practice self-care',
	'Reduce screen time',
	'Check in with your body',
];

const PHYSICAL_TODOS = [
	'Finish a focused walk',
	'Complete a short run',
	'Do a strength session',
	'Stretch your full body',
	'Train your core',
	'Do a mobility routine',
	'Ride a bike route',
	'Try a new workout',
	'Do a recovery session',
	'Practice balance drills',
	'Finish a leg-day circuit',
	'Take an outdoor movement break',
];

const MENTAL_TODOS = [
	'Write a full journal entry',
	'Complete a meditation session',
	'Read a chapter of a book',
	'Do a digital declutter',
	'Solve a logic puzzle',
	'Practice deep breathing',
	'Learn a new concept',
	'Watch a useful lesson',
	'Write down your worries',
	'Create a calming routine',
	'Reflect on a recent challenge',
	'Take a screen-free reset',
];

const PERSONAL_TODOS = [
	'Deep-clean one room',
	'Organize your desk',
	'Plan your week',
	'Review your budget',
	'Finish a home task',
	'Prepare meals',
	'Handle an overdue errand',
	'Update an important document',
	'Declutter a storage area',
	'Start a personal project step',
	'Finish a personal project step',
	'Fix something that needs attention',
];

const SOCIAL_TODOS = [
	'Send the message you have been avoiding',
	'Call someone you care about',
	'Set up a meetup',
	'Write a thank-you note',
	'Do a helpful favor',
	'Check in on family',
	'Reconnect with a friend',
	'Resolve a lingering conversation',
	'Show appreciation to someone',
	'Plan a quality-time activity',
	'Attend a community event',
	'Offer support to someone',
];

const CREATIVE_TODOS = [
	'Finish a sketch',
	'Write a short piece',
	'Record a music idea',
	'Create a photo set',
	'Design a graphic',
	'Paint a study piece',
	'Draft a story scene',
	'Make a short video',
	'Build a craft piece',
	'Curate a mood board',
	'Edit a creative project',
	'Experiment with a new style',
];

const WELLNESS_TODOS = [
	'Prepare a nourishing meal',
	'Go to sleep on time',
	'Plan a low-stress evening',
	'Take a long walk outside',
	'Do a self-care session',
	'Reset your sleep space',
	'Schedule a health check-in',
	'Build a hydration plan',
	'Finish a relaxing stretch routine',
	'Pack healthier snacks',
	'Take a technology break',
	'Spend time in sunlight',
];

const LEARNING_TODOS = [
	'Study one lesson',
	'Review your notes',
	'Practice a new skill',
	'Read a non-fiction section',
	'Watch a tutorial and take notes',
	'Do a language practice block',
	'Summarize what you learned',
	'Work through a problem set',
	'Practice recall from memory',
	'Complete a small research task',
	'Teach back a concept',
	'Build a mini project',
];

export const SUGGESTED_HABIT_GOALS: SuggestedHabitGoal[] = [
	...buildHabitCategory('Physical', PHYSICAL_HABITS),
	...buildHabitCategory('Mental', MENTAL_HABITS),
	...buildHabitCategory('Personal', PERSONAL_HABITS),
	...buildHabitCategory('Social', SOCIAL_HABITS),
	...buildHabitCategory('Creative', CREATIVE_HABITS),
	...buildHabitCategory('Wellness', WELLNESS_HABITS),
];

export const SUGGESTED_TODO_GOALS: SuggestedTodoGoal[] = [
	...buildTodoCategory('Physical', PHYSICAL_TODOS),
	...buildTodoCategory('Mental', MENTAL_TODOS),
	...buildTodoCategory('Personal', PERSONAL_TODOS),
	...buildTodoCategory('Social', SOCIAL_TODOS),
	...buildTodoCategory('Creative', CREATIVE_TODOS),
	...buildTodoCategory('Wellness', WELLNESS_TODOS),
	...buildTodoCategory('Learning', LEARNING_TODOS),
];
