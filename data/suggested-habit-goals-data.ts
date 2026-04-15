export interface SuggestedHabitGoal {
	title: string;
	category: 'Physical' | 'Mental' | 'Personal' | 'Social' | 'Creative' | 'Wellness';
	timesPerWeek?: number;
	importance?: 'Default' | 'Important' | 'Important+';
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
	{ suffix: 'before bed', timesPerWeek: 7, importance: 'Important+' as const },
	{ suffix: 'right after waking up', timesPerWeek: 6, importance: 'Important' as const },
	{ suffix: 'after your first meal', timesPerWeek: 5, importance: 'Default' as const },
	{ suffix: 'after work or class', timesPerWeek: 5, importance: 'Important' as const },
	{ suffix: 'before you check social media', timesPerWeek: 6, importance: 'Important+' as const },
	{ suffix: 'with zero multitasking', timesPerWeek: 4, importance: 'Important' as const },
	{ suffix: 'and log how it felt', timesPerWeek: 4, importance: 'Important' as const },
	{ suffix: 'on low-energy days', timesPerWeek: 3, importance: 'Default' as const },
	{ suffix: 'on your busiest weekday', timesPerWeek: 1, importance: 'Important' as const },
	{ suffix: 'on both weekend days', timesPerWeek: 2, importance: 'Default' as const },
	{ suffix: 'for one focused round', timesPerWeek: 5, importance: 'Important+' as const },
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

const PHYSICAL_HABITS = ['Walk briskly', 'Stretch your full body', 'Do push-ups', 'Go for a run', 'Practice mobility drills', 'Train your core', 'Do squats', 'Cycle at an easy pace', 'Practice balance work', 'Do a yoga flow', 'Take the stairs intentionally', 'Use a resistance band'];
const MENTAL_HABITS = ['Meditate quietly', 'Read something thoughtful', 'Journal your thoughts', 'Practice deep breathing', 'Do a digital detox', 'Study a new idea', 'Solve a puzzle', 'Review your goals', 'Practice gratitude', 'Sit in silence', 'Listen to an educational podcast', 'Reflect on your mood'];
const PERSONAL_HABITS = ['Tidy your room', 'Organize your desk', 'Review your budget', 'Plan tomorrow', 'Work on a passion project', 'Learn a practical skill', 'Prepare a healthy meal', 'Handle home upkeep', 'Review your calendar', 'Practice your personal routine', 'Declutter one small space', 'Care for your plants'];
const SOCIAL_HABITS = ['Send a thoughtful message', 'Call someone you care about', 'Check in on a friend', 'Practice active listening', 'Offer a sincere compliment', 'Do a small act of kindness', 'Reach out to family', 'Share something encouraging', 'Reconnect with an old friend', 'Spend intentional time with someone', 'Help someone with a task', 'Plan a social touchpoint'];
const CREATIVE_HABITS = ['Sketch freely', 'Write creatively', 'Practice an instrument', 'Take photos mindfully', 'Work on digital art', 'Compose new ideas', 'Paint or watercolor', 'Build a craft project', 'Create a short video', 'Experiment with design', 'Collect inspiration', 'Practice a creative challenge'];
const WELLNESS_HABITS = ['Drink water mindfully', 'Go to bed on time', 'Wake up gently', 'Prepare a balanced meal', 'Take your vitamins', 'Stretch before bed', 'Limit caffeine late', 'Take a mindful break', 'Get sunlight', 'Practice self-care', 'Reduce screen time', 'Check in with your body'];

export const SUGGESTED_HABIT_GOALS: SuggestedHabitGoal[] = [
	...buildHabitCategory('Physical', PHYSICAL_HABITS),
	...buildHabitCategory('Mental', MENTAL_HABITS),
	...buildHabitCategory('Personal', PERSONAL_HABITS),
	...buildHabitCategory('Social', SOCIAL_HABITS),
	...buildHabitCategory('Creative', CREATIVE_HABITS),
	...buildHabitCategory('Wellness', WELLNESS_HABITS),
];

export default SUGGESTED_HABIT_GOALS;
