export type GoalImportance = 'default' | 'low' | 'medium' | 'high';

export interface GoalImportanceMeta {
	value: GoalImportance;
	label: string;
	shortLabel: string;
	color: string;
}

export interface GoalChallengeTier {
	days: number;
	coinCost: number;
	shardCost: number;
	rewardCoins: number;
	rewardShards: number;
}

export interface GoalDraftTemplate {
	title: string;
	importance: GoalImportance;
	categories: string[];
	daysOfWeek?: string[];
	timesPerWeek?: number;
	dueInDays?: number;
	subGoals?: string[];
}

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;
export const TODO_COMPLETION_WINDOW_DAYS = 7;

export const GOAL_CATEGORY_OPTIONS = ['Personal', 'Mental', 'Physical', 'Career', 'Relationships', 'Contribution', 'Financial', 'Creative', 'Wellness', 'Other'] as const;
export const GOAL_WEEKDAY_OPTIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export type GoalCategory = (typeof GOAL_CATEGORY_OPTIONS)[number];

export interface ChallengeGoalLike {
	isChallenge?: boolean;
	challengeRewardClaimed?: boolean;
	challengeStatus?: 'active' | 'completed' | 'failed';
}

export interface ScheduledHabitLike extends ChallengeGoalLike {
	daysOfWeek?: string[];
	streak?: number;
	lastCompletedDate?: string | null;
	challengeStartDate?: string | null;
	challengeLength?: number;
}

const GOAL_CATEGORY_ALIASES: Record<string, GoalCategory> = {
	social: 'Relationships',
	learning: 'Mental',
	relationship: 'Relationships',
	relationships: 'Relationships',
	finance: 'Financial',
	finances: 'Financial',
	wellbeing: 'Wellness',
	wellness: 'Wellness',
};

export const GOAL_IMPORTANCE_OPTIONS: GoalImportanceMeta[] = [
	{ value: 'high', label: 'High Importance', shortLabel: 'High', color: '#C62828' },
	{ value: 'medium', label: 'Medium Importance', shortLabel: 'Medium', color: '#F57C00' },
	{ value: 'low', label: 'Low Importance', shortLabel: 'Low', color: '#C9A227' },
	{ value: 'default', label: 'Default / Not Important', shortLabel: 'Default', color: '#333333' },
];

export const GOAL_CHALLENGE_TIERS: GoalChallengeTier[] = [
	{ days: 7, coinCost: 50, shardCost: 1, rewardCoins: 100, rewardShards: 10 },
	{ days: 14, coinCost: 100, shardCost: 2, rewardCoins: 250, rewardShards: 25 },
	{ days: 30, coinCost: 250, shardCost: 5, rewardCoins: 750, rewardShards: 75 },
	{ days: 60, coinCost: 600, shardCost: 12, rewardCoins: 2_000, rewardShards: 150 },
	{ days: 90, coinCost: 1_000, shardCost: 20, rewardCoins: 4_500, rewardShards: 300 },
	{ days: 365, coinCost: 5_000, shardCost: 100, rewardCoins: 25_000, rewardShards: 1_500 },
];

export const DEFAULT_HABIT_GOAL_TEMPLATES: GoalDraftTemplate[] = [
	{
		title: 'Make your bed',
		importance: 'low',
		categories: ['Personal'],
		daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		timesPerWeek: 7,
	},
	{
		title: 'Brush your teeth',
		importance: 'medium',
		categories: ['Wellness', 'Personal'],
		daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		timesPerWeek: 7,
	},
	{
		title: 'Drink enough water',
		importance: 'medium',
		categories: ['Wellness', 'Physical'],
		daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		timesPerWeek: 7,
	},
	{
		title: 'Move your body for 30 minutes',
		importance: 'high',
		categories: ['Physical'],
		daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		timesPerWeek: 6,
	},
	{
		title: 'Meditate for 10 minutes',
		importance: 'medium',
		categories: ['Mental', 'Wellness'],
		daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		timesPerWeek: 5,
	},
	{
		title: 'Get to bed on time',
		importance: 'high',
		categories: ['Wellness', 'Personal'],
		daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		timesPerWeek: 7,
	},
];

export const DEFAULT_TODO_GOAL_TEMPLATES: GoalDraftTemplate[] = [
	{
		title: 'Plan your top three priorities',
		importance: 'medium',
		categories: ['Career', 'Personal'],
		dueInDays: 1,
	},
	{
		title: 'Tidy one high-friction space',
		importance: 'low',
		categories: ['Personal'],
		dueInDays: 3,
	},
	{
		title: 'Handle one overdue message or email',
		importance: 'medium',
		categories: ['Relationships', 'Career'],
		dueInDays: 3,
	},
	{
		title: 'Prepare tomorrow before bed',
		importance: 'high',
		categories: ['Personal', 'Career'],
		dueInDays: 2,
		subGoals: ['Set out what you need', 'Write tomorrow’s first task'],
	},
];

export const toDateKey = (value: number | string | Date) => {
	const date = value instanceof Date ? value : new Date(value);
	return date.toISOString().split('T')[0];
};

export const toStartOfDayMs = (dateKey: string) => new Date(`${dateKey}T00:00:00`).getTime();

export const getImportanceMeta = (importance: GoalImportance): GoalImportanceMeta => {
	return GOAL_IMPORTANCE_OPTIONS.find(option => option.value === importance) ?? GOAL_IMPORTANCE_OPTIONS[GOAL_IMPORTANCE_OPTIONS.length - 1];
};

export const normalizeGoalCategory = (value?: string | null) => {
	const trimmed = value?.trim();
	if (!trimmed) return null;

	const canonicalMatch = GOAL_CATEGORY_OPTIONS.find(option => option.toLowerCase() === trimmed.toLowerCase());
	if (canonicalMatch) return canonicalMatch;

	return GOAL_CATEGORY_ALIASES[trimmed.toLowerCase()] ?? trimmed;
};

export const normalizeGoalCategories = (categories?: Array<string | null | undefined>) => {
	if (!Array.isArray(categories)) return [];

	const seen = new Set<string>();
	const normalizedCategories: string[] = [];

	for (const category of categories) {
		const normalized = normalizeGoalCategory(category);
		if (!normalized) continue;

		const key = normalized.toLowerCase();
		if (seen.has(key)) continue;

		seen.add(key);
		normalizedCategories.push(normalized);
	}

	return normalizedCategories;
};

export const getGoalCategories = (categories?: string[], fallbackCategory?: string | null) => {
	if (categories?.length) return normalizeGoalCategories(categories);
	return normalizeGoalCategories(fallbackCategory ? [fallbackCategory] : []);
};

export const isGoalChallengeActive = (goal: ChallengeGoalLike) => {
	if (!goal.isChallenge) return false;
	if (goal.challengeRewardClaimed) return false;
	return goal.challengeStatus !== 'completed' && goal.challengeStatus !== 'failed';
};

export const getScheduledDays = (daysOfWeek?: string[]) => {
	const normalizedDays = (daysOfWeek?.length ? daysOfWeek : [...GOAL_WEEKDAY_OPTIONS]).map(day => day.slice(0, 3));
	return normalizedDays.length > 0 ? normalizedDays : [...GOAL_WEEKDAY_OPTIONS];
};

export const isHabitScheduledOnDate = (daysOfWeek: string[] | undefined, dateKey: string) => {
	const scheduledDays = new Set(getScheduledDays(daysOfWeek));
	const dayName = GOAL_WEEKDAY_OPTIONS[new Date(`${dateKey}T12:00:00`).getDay()];
	return scheduledDays.has(dayName);
};

export const getPreviousScheduledDate = (daysOfWeek: string[] | undefined, dateKey: string) => {
	const cursor = new Date(`${dateKey}T12:00:00`);

	for (let step = 1; step <= 366; step += 1) {
		cursor.setDate(cursor.getDate() - 1);
		const candidate = cursor.toISOString().split('T')[0];
		if (isHabitScheduledOnDate(daysOfWeek, candidate)) {
			return candidate;
		}
	}

	return null;
};

export const getLatestScheduledDateOnOrBefore = (daysOfWeek: string[] | undefined, dateKey: string) => {
	const cursor = new Date(`${dateKey}T12:00:00`);

	for (let step = 0; step <= 366; step += 1) {
		const candidate = cursor.toISOString().split('T')[0];
		if (isHabitScheduledOnDate(daysOfWeek, candidate)) {
			return candidate;
		}
		cursor.setDate(cursor.getDate() - 1);
	}

	return null;
};

export const getHabitCompletionStreak = (habit: Pick<ScheduledHabitLike, 'daysOfWeek' | 'lastCompletedDate' | 'streak'>, completionDate: string) => {
	if (habit.lastCompletedDate === completionDate) return habit.streak ?? 0;

	const previousScheduledDate = getPreviousScheduledDate(habit.daysOfWeek, completionDate);
	const continuedStreak = previousScheduledDate && habit.lastCompletedDate === previousScheduledDate;
	return continuedStreak ? (habit.streak ?? 0) + 1 : 1;
};

export const getHabitChallengeFailureDate = (habit: ScheduledHabitLike, evaluationDate: string, completedToday = false) => {
	if (!isGoalChallengeActive(habit) || !habit.challengeStartDate) return null;

	if (completedToday) {
		if (habit.challengeStartDate === evaluationDate) return null;

		const previousScheduledDate = getPreviousScheduledDate(habit.daysOfWeek, evaluationDate);
		if (!previousScheduledDate || previousScheduledDate < habit.challengeStartDate) return null;

		return habit.lastCompletedDate === previousScheduledDate ? null : previousScheduledDate;
	}

	const latestScheduledDate = getLatestScheduledDateOnOrBefore(habit.daysOfWeek, evaluationDate);
	if (!latestScheduledDate || latestScheduledDate < habit.challengeStartDate) return null;

	return habit.lastCompletedDate === latestScheduledDate ? null : latestScheduledDate;
};

export const getGoalRewardBlocked = (createdAt: number, completedAt = Date.now()) => {
	return completedAt - createdAt < HOUR_MS;
};

export const getGoalRewardWarning = (createdAt: number, completedAt = Date.now()) => {
	if (!getGoalRewardBlocked(createdAt, completedAt)) return null;
	return 'This goal was created less than 1 hour ago, so it can be submitted now but it will not earn the normal reward yet.';
};

export const getChallengeTierByDays = (days: number) => {
	return GOAL_CHALLENGE_TIERS.find(tier => tier.days === days) ?? null;
};

export const getTodoChallengeTier = (goalLengthDays: number) => {
	if (goalLengthDays <= 0) return null;
	return (
		GOAL_CHALLENGE_TIERS.find(tier => goalLengthDays <= tier.days) ??
		GOAL_CHALLENGE_TIERS[GOAL_CHALLENGE_TIERS.length - 1]
	);
};

export const getGoalLengthDays = (createdAt: number, dueDate: string) => {
	const createdKey = toDateKey(createdAt);
	const createdMs = toStartOfDayMs(createdKey);
	const dueMs = toStartOfDayMs(dueDate);
	if (Number.isNaN(createdMs) || Number.isNaN(dueMs) || dueMs < createdMs) return null;
	return Math.max(1, Math.floor((dueMs - createdMs) / DAY_MS) + 1);
};

export const getTodoCompletionLockReason = (
	todo: {
		subGoals?: Array<{ completed: boolean }>;
		dueDate?: string | null;
		createdAt: number;
	},
	today: string,
	completedAtMs = Date.now(),
) => {
	if ((todo.subGoals ?? []).some(subGoal => !subGoal.completed)) {
		return 'Complete all sub-goals before finishing this to-do.';
	}

	if (!todo.dueDate) {
		const unlockMs = todo.createdAt + DAY_MS;
		if (completedAtMs < unlockMs) {
			return 'To-dos without a due date unlock for completion 1 day after they are created.';
		}
		return null;
	}

	const todayMs = toStartOfDayMs(today);
	const dueMs = toStartOfDayMs(todo.dueDate);
	if (Number.isNaN(dueMs)) return 'This to-do needs a valid due date before it can be completed.';

	const isLessThanOneDayLong = dueMs - todo.createdAt < DAY_MS;
	if (isLessThanOneDayLong) return null;

	const earliestCompletionMs = dueMs - TODO_COMPLETION_WINDOW_DAYS * DAY_MS;
	if (todayMs < earliestCompletionMs) {
		return `This to-do can be completed once it is within 7 days of its due date. It unlocks on ${toDateKey(earliestCompletionMs)}.`;
	}

	return null;
};

export const getNormalTodoReward = (
	todo: {
		dueDate?: string | null;
		createdAt: number;
		completedDate?: string | null;
	},
	completedAtMs = Date.now(),
) => {
	if (getGoalRewardBlocked(todo.createdAt, completedAtMs)) {
		return { coins: 0, fury: 0, rewardBlocked: true };
	}

	if (!todo.dueDate) {
		return { coins: 10, fury: -4, rewardBlocked: false };
	}

	const createdKey = toDateKey(todo.createdAt);
	const completedDate = todo.completedDate ?? toDateKey(completedAtMs);
	const goalLengthDays = getGoalLengthDays(todo.createdAt, todo.dueDate) ?? 1;

	if (completedDate <= todo.dueDate) {
		if (goalLengthDays > 30) return { coins: 60, fury: -24, rewardBlocked: false };
		if (goalLengthDays >= 7) return { coins: 20, fury: -8, rewardBlocked: false };
		return { coins: 10, fury: -4, rewardBlocked: false };
	}

	const lateDays = Math.max(0, Math.floor((toStartOfDayMs(completedDate) - toStartOfDayMs(todo.dueDate)) / DAY_MS));
	if (goalLengthDays > 30) return { coins: 10, fury: -1, rewardBlocked: false, lateDays };
	if (goalLengthDays >= 7) return { coins: 5, fury: -1, rewardBlocked: false, lateDays };
	if (lateDays >= 1) return { coins: 2, fury: -1, rewardBlocked: false, lateDays };
	return { coins: 1, fury: -1, rewardBlocked: false, lateDays };
};
