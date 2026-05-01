import { getGoalRewardBlocked, getNormalTodoReward } from './goal-utils';

export const getHabitCompletionReward = (habit: { createdAt: number; streak?: number }, completedAtMs = Date.now()) => {
	if (getGoalRewardBlocked(habit.createdAt, completedAtMs)) {
		return { coins: 0, fury: 0, rewardBlocked: true };
	}

	return {
		coins: 5 + Math.min(5, habit.streak ?? 0),
		fury: -2,
		rewardBlocked: false,
	};
};

export const getTodoCompletionReward = getNormalTodoReward;
