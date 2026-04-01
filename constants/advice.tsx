export type AdviceCategory = 'inspirational' | 'witty' | 'philosophical';

export interface AdviceItem {
	text: string;
	category: AdviceCategory;
}

export interface GoalAdviceItem extends AdviceItem {
	goalType: 'habit' | 'todo' | 'both';
}

const compact = (value: string) => value.replace(/\s+/g, ' ').trim();

const uniqueByText = <T extends { text: string }>(items: T[]) => {
	const seen = new Set<string>();
	return items.filter(item => {
		if (seen.has(item.text)) return false;
		seen.add(item.text);
		return true;
	});
};

const buildAdvicePool = (category: AdviceCategory, openings: string[], focuses: string[], closings: string[]): AdviceItem[] => {
	const items: AdviceItem[] = [];
	for (const opening of openings) {
		for (const focus of focuses) {
			for (const closing of closings) {
				items.push({
					text: compact(`${opening} ${focus} ${closing}`),
					category,
				});
			}
		}
	}
	return uniqueByText(items);
};

const buildGoalAdvicePool = (goalType: GoalAdviceItem['goalType'], category: AdviceCategory, openings: string[], focuses: string[], closings: string[]): GoalAdviceItem[] => {
	return buildAdvicePool(category, openings, focuses, closings).map(item => ({
		...item,
		goalType,
	}));
};

const SURVEY_INSPIRATIONAL = buildAdvicePool(
	'inspirational',
	['Start this survey knowing', 'Remember while answering', 'Give yourself credit because', 'Take a steady breath because', 'Let today remind you that'],
	[
		'small honest check-ins build powerful momentum',
		'clarity grows when you face the day directly',
		'every thoughtful answer becomes a stronger next step',
		'progress gets easier when you notice what is already working',
		'your routine becomes real when you keep showing up',
		'discipline feels lighter when it is paired with self-respect',
		'tiny wins deserve to be counted',
		'consistency can be gentle and still be strong',
		'you are allowed to improve without rushing',
		'focus grows when you choose one good action at a time',
		'honest reflection is already a form of progress',
		'today can still move in a better direction',
	],
	['today matters.', 'this moment counts.', 'your effort is not wasted.', 'you are building something real.'],
);

const SURVEY_WITTY = buildAdvicePool(
	'witty',
	['Answer like the dragon is watching, because', 'The survey is not judging you, but', 'Productivity gets less dramatic when', 'Even your chaos becomes useful when', 'Treat this check-in like a tiny boss fight, because'],
	[
		'a decent plan beats a heroic excuse',
		'your to-do list should not look like a haunted museum',
		'half-finished intentions still appreciate a little honesty',
		'future-you keeps filing complaints about vague goals',
		'avoiding the obvious task does not make it disappear',
		'the dragon prefers consistency over last-minute theater',
		'a five-minute fix is still a fix',
		'snacks and denial are not the same recovery plan',
		'doing one clear thing is more impressive than starring at twelve tabs',
		'overthinking is just procrastination wearing reading glasses',
		'you cannot optimize a plan you never started',
		'a mood spiral loses power when you name it',
	],
	['for once.', 'today.', 'before bedtime.', 'without making it weird.'],
);

const SURVEY_PHILOSOPHICAL = buildAdvicePool(
	'philosophical',
	['Consider this while you answer:', 'Pause and notice that', 'The quieter truth is that', 'It helps to remember that', 'A useful thought for today is that'],
	[
		'attention shapes reality more than urgency does',
		'routines become identity through repetition',
		'clarity usually arrives after honesty, not before it',
		'what you measure begins to influence what you become',
		'self-knowledge is often built from ordinary moments',
		'the present day is where long-term change actually lives',
		'discipline and compassion do not have to compete',
		'what you avoid can still be teaching you something',
		'momentum is often just trust repeated over time',
		'meaning grows when actions and values start to match',
		'reflection is not delay when it produces direction',
		'every pattern is easier to change once it is visible',
	],
	['in practice.', 'over time.', 'if you let it.', 'more often than people admit.'],
);

export const SURVEY_ADVICE: AdviceItem[] = [...SURVEY_INSPIRATIONAL, ...SURVEY_WITTY, ...SURVEY_PHILOSOPHICAL];

const GOAL_INSPIRATIONAL = buildGoalAdvicePool(
	'both',
	'inspirational',
	['Build your goals so', 'Shape today so', 'Choose your next goal so', 'Let your checklist prove that'],
	[
		'starting small still counts as starting',
		'clear goals can carry a heavy day',
		'one completed promise can steady your confidence',
		'good systems are made from repeatable steps',
		'momentum loves visible progress',
		'the right next step is better than the perfect someday plan',
		'progress survives when the goal fits real life',
		'consistency becomes easier when the goal is specific',
		'you can rebuild trust in yourself one check mark at a time',
		'a focused plan is kinder than a vague wish',
	],
	['this week.', 'today.', 'before the day slips away.', 'without burning yourself out.'],
);

const GOAL_HABIT = buildGoalAdvicePool(
	'habit',
	'philosophical',
	['For habits, remember that', 'Habit streaks last longer when', 'A habit becomes real when', 'Daily structure works best when'],
	[
		'repetition matters more than intensity',
		'the cue is easier to protect than raw motivation',
		'boring consistency is often the hidden superpower',
		'the smallest repeatable version still changes identity',
		'you make the habit easier to begin than to avoid',
		'the environment supports the behavior you want',
		'tracking reveals patterns that emotion hides',
		'one miss does not need to become a collapse',
		'ritual creates less friction than negotiation',
		'the habit fits the life you actually live',
	],
	['over time.', 'in practice.', 'when life gets noisy.', 'on ordinary days.'],
);

const GOAL_TODO = buildGoalAdvicePool(
	'todo',
	'witty',
	['For to-dos, try this:', 'A friendly reminder for your to-do list:', 'To-dos behave better when', 'Future-you would appreciate it if'],
	[
		'the task is clear enough to survive low energy',
		'you stop pretending twelve priorities are all first place',
		'the next action is visible before the excuses arrive',
		'you break the giant problem into smaller, less theatrical pieces',
		'your due date is realistic instead of emotionally ambitious',
		'the hard part is defined before the panic starts',
		'the list contains actions instead of mysterious life categories',
		'you finish one meaningful item before reorganizing the whole universe',
		'the plan can survive a slightly messy day',
		'you stop using your brain as an unpaid reminder app',
	],
	['today.', 'before dinner.', 'this week.', 'without extra drama.'],
);

export const GOAL_ADVICE: GoalAdviceItem[] = [...GOAL_INSPIRATIONAL, ...GOAL_HABIT, ...GOAL_TODO];

export const GOAL_HABIT_ADVICE = GOAL_ADVICE.filter(item => item.goalType === 'habit' || item.goalType === 'both');
export const GOAL_TODO_ADVICE = GOAL_ADVICE.filter(item => item.goalType === 'todo' || item.goalType === 'both');
export const LEGACY_SURVEY_ADVICE = SURVEY_ADVICE.map(item => item.text);

export default SURVEY_ADVICE;
