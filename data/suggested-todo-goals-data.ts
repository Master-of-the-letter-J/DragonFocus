export interface SuggestedTodoGoal {
	title: string;
	category: 'Physical' | 'Mental' | 'Personal' | 'Social' | 'Creative' | 'Wellness' | 'Learning';
	dueDate?: number;
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

const TODO_WINDOWS = [
	{ suffix: 'today', dueDate: 1 },
	{ suffix: 'before tomorrow night', dueDate: 2 },
	{ suffix: 'by noon tomorrow', dueDate: 2 },
	{ suffix: 'before 6 PM tomorrow', dueDate: 2 },
	{ suffix: 'within 3 days', dueDate: 3 },
	{ suffix: 'within 4 days', dueDate: 4 },
	{ suffix: 'within 5 days', dueDate: 5 },
	{ suffix: 'this week', dueDate: 7 },
	{ suffix: 'before the weekend', dueDate: 5 },
	{ suffix: 'before Friday night', dueDate: 5 },
	{ suffix: 'before next Monday', dueDate: 6 },
	{ suffix: 'within 10 days', dueDate: 10 },
	{ suffix: 'within 14 days', dueDate: 14 },
	{ suffix: 'within 21 days', dueDate: 21 },
	{ suffix: 'before next week ends', dueDate: 14 },
	{ suffix: 'this month', dueDate: 30 },
	{ suffix: 'before the month ends', dueDate: 30 },
	{ suffix: 'before your next reset day', dueDate: 7 },
];

const buildTodoCategory = (category: SuggestedTodoGoal['category'], stems: string[]): SuggestedTodoGoal[] => {
	return uniqueByTitle(
		stems.flatMap(stem =>
			TODO_WINDOWS.map(window => ({
				title: `${stem} ${window.suffix}`.trim(),
				category,
				dueDate: window.dueDate,
			})),
		),
	);
};

const PHYSICAL_TODOS = ['Finish a focused walk', 'Complete a short run', 'Do a strength session', 'Stretch your full body', 'Train your core', 'Do a mobility routine', 'Ride a bike route', 'Try a new workout', 'Do a recovery session', 'Practice balance drills', 'Finish a leg-day circuit', 'Take an outdoor movement break'];
const MENTAL_TODOS = ['Write a full journal entry', 'Complete a meditation session', 'Read a chapter of a book', 'Do a digital declutter', 'Solve a logic puzzle', 'Practice deep breathing', 'Learn a new concept', 'Watch a useful lesson', 'Write down your worries', 'Create a calming routine', 'Reflect on a recent challenge', 'Take a screen-free reset'];
const PERSONAL_TODOS = ['Deep-clean one room', 'Organize your desk', 'Plan your week', 'Review your budget', 'Finish a home task', 'Prepare meals', 'Handle an overdue errand', 'Update an important document', 'Declutter a storage area', 'Start a personal project step', 'Finish a personal project step', 'Fix something that needs attention'];
const SOCIAL_TODOS = ['Send the message you have been avoiding', 'Call someone you care about', 'Set up a meetup', 'Write a thank-you note', 'Do a helpful favor', 'Check in on family', 'Reconnect with a friend', 'Resolve a lingering conversation', 'Show appreciation to someone', 'Plan a quality-time activity', 'Attend a community event', 'Offer support to someone'];
const CREATIVE_TODOS = ['Finish a sketch', 'Write a short piece', 'Record a music idea', 'Create a photo set', 'Design a graphic', 'Paint a study piece', 'Draft a story scene', 'Make a short video', 'Build a craft piece', 'Curate a mood board', 'Edit a creative project', 'Experiment with a new style'];
const WELLNESS_TODOS = ['Prepare a nourishing meal', 'Go to sleep on time', 'Plan a low-stress evening', 'Take a long walk outside', 'Do a self-care session', 'Reset your sleep space', 'Schedule a health check-in', 'Build a hydration plan', 'Finish a relaxing stretch routine', 'Pack healthier snacks', 'Take a technology break', 'Spend time in sunlight'];
const LEARNING_TODOS = ['Study one lesson', 'Review your notes', 'Practice a new skill', 'Read a non-fiction section', 'Watch a tutorial and take notes', 'Do a language practice block', 'Summarize what you learned', 'Work through a problem set', 'Practice recall from memory', 'Complete a small research task', 'Teach back a concept', 'Build a mini project'];

export const SUGGESTED_TODO_GOALS: SuggestedTodoGoal[] = [
	...buildTodoCategory('Physical', PHYSICAL_TODOS),
	...buildTodoCategory('Mental', MENTAL_TODOS),
	...buildTodoCategory('Personal', PERSONAL_TODOS),
	...buildTodoCategory('Social', SOCIAL_TODOS),
	...buildTodoCategory('Creative', CREATIVE_TODOS),
	...buildTodoCategory('Wellness', WELLNESS_TODOS),
	...buildTodoCategory('Learning', LEARNING_TODOS),
];

export default SUGGESTED_TODO_GOALS;
