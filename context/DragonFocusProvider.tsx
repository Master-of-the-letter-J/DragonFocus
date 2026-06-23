import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import { DRAGON_FOCUS_MILESTONES, type GameModeId } from '@/data/dragon-focus-2-data';
import React, { ReactNode, createContext, useContext, useMemo } from 'react';

export type MenuShortcutId =
	| 'checkIn'
	| 'checkOut'
	| 'incompleteGoals'
	| 'completedGoals'
	| 'pomodoro'
	| 'world'
	| 'account'
	| 'logs'
	| 'stats'
	| 'achievements'
	| 'options'
	| 'gamemodes'
	| 'tutorial';

interface DragonFocusSettings {
	volume: number;
	soundEffectsVolume: number;
	brightness: number;
	themeName: string;
	backgroundName: string;
	weatherRain: boolean;
	weatherTremors: boolean;
	weatherBrightness: boolean;
	devMode: boolean;
	requireCheckIn: boolean;
	requireCheckOut: boolean;
	showSurveyAdvice: boolean;
	showMoodQuestion: boolean;
	showGoalEditorInCheckIn: boolean;
	showHarvestInCheckOut: boolean;
	showJournal: boolean;
	showQuote: boolean;
}

interface DragonFocusState {
	activeGameMode: GameModeId;
	gameModeEndsAt: string | null;
	gameModeNuclear: boolean;
	seenMilestoneIds: string[];
	harvestedGoalIdsByDate: Record<string, string[]>;
	menuShortcuts: Record<MenuShortcutId, boolean>;
	settings: DragonFocusSettings;
}

interface DragonFocusContextType extends DragonFocusState {
	setGameMode: (mode: GameModeId, days?: number, nuclear?: boolean) => void;
	clearTimedGameMode: () => void;
	getUnlockedMilestoneCount: (energy: number) => number;
	getCurrentMilestone: (energy: number) => (typeof DRAGON_FOCUS_MILESTONES)[number];
	getNewMilestones: (energy: number) => typeof DRAGON_FOCUS_MILESTONES;
	markMilestoneSeen: (id: string) => void;
	isGoalHarvested: (date: string, goalId: string) => boolean;
	markGoalsHarvested: (date: string, goalIds: string[]) => void;
	setMenuShortcut: (id: MenuShortcutId, enabled: boolean) => void;
	setSetting: <K extends keyof DragonFocusSettings>(key: K, value: DragonFocusSettings[K]) => void;
	resetDragonFocusState: () => void;
}

const DEFAULT_MENU_SHORTCUTS: Record<MenuShortcutId, boolean> = {
	checkIn: true,
	checkOut: true,
	incompleteGoals: true,
	completedGoals: false,
	pomodoro: false,
	world: false,
	account: false,
	logs: false,
	stats: false,
	achievements: false,
	options: false,
	gamemodes: true,
	tutorial: true,
};

const DEFAULT_SETTINGS: DragonFocusSettings = {
	volume: 70,
	soundEffectsVolume: 70,
	brightness: 80,
	themeName: 'Obsidian Ember',
	backgroundName: 'Containment Lair',
	weatherRain: false,
	weatherTremors: true,
	weatherBrightness: false,
	devMode: false,
	requireCheckIn: false,
	requireCheckOut: false,
	showSurveyAdvice: true,
	showMoodQuestion: true,
	showGoalEditorInCheckIn: true,
	showHarvestInCheckOut: true,
	showJournal: true,
	showQuote: true,
};

const INITIAL_DRAGON_FOCUS_STATE: DragonFocusState = {
	activeGameMode: 'normal',
	gameModeEndsAt: null,
	gameModeNuclear: false,
	seenMilestoneIds: [],
	harvestedGoalIdsByDate: {},
	menuShortcuts: DEFAULT_MENU_SHORTCUTS,
	settings: DEFAULT_SETTINGS,
};

const DragonFocusContext = createContext<DragonFocusContextType | undefined>(undefined);

const normalizeDragonFocusState = (storedState: DragonFocusState | null, initialState: DragonFocusState): DragonFocusState => ({
	...initialState,
	...(storedState ?? {}),
	seenMilestoneIds: Array.isArray(storedState?.seenMilestoneIds) ? storedState.seenMilestoneIds : [],
	harvestedGoalIdsByDate: storedState?.harvestedGoalIdsByDate ?? {},
	menuShortcuts: { ...DEFAULT_MENU_SHORTCUTS, ...(storedState?.menuShortcuts ?? {}) },
	settings: { ...DEFAULT_SETTINGS, ...(storedState?.settings ?? {}) },
});

export function DragonFocusProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.dragonFocus2, INITIAL_DRAGON_FOCUS_STATE, {
		normalize: normalizeDragonFocusState,
	});

	const value = useMemo<DragonFocusContextType>(
		() => ({
			...state,
			setGameMode: (activeGameMode, days, gameModeNuclear = false) => {
				const gameModeEndsAt = days && days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;
				setState(current => ({ ...current, activeGameMode, gameModeEndsAt, gameModeNuclear }));
			},
			clearTimedGameMode: () => {
				setState(current => ({ ...current, activeGameMode: 'normal', gameModeEndsAt: null, gameModeNuclear: false }));
			},
			getUnlockedMilestoneCount: energy => DRAGON_FOCUS_MILESTONES.filter(item => energy >= item.requiredEnergy).length,
			getCurrentMilestone: energy => {
				const unlocked = DRAGON_FOCUS_MILESTONES.filter(item => energy >= item.requiredEnergy);
				return unlocked[unlocked.length - 1] ?? DRAGON_FOCUS_MILESTONES[0];
			},
			getNewMilestones: energy =>
				DRAGON_FOCUS_MILESTONES.filter(item => energy >= item.requiredEnergy && !state.seenMilestoneIds.includes(item.id)),
			markMilestoneSeen: id => {
				setState(current => ({
					...current,
					seenMilestoneIds: current.seenMilestoneIds.includes(id) ? current.seenMilestoneIds : [...current.seenMilestoneIds, id],
				}));
			},
			isGoalHarvested: (date, goalId) => !!state.harvestedGoalIdsByDate[date]?.includes(goalId),
			markGoalsHarvested: (date, goalIds) => {
				if (goalIds.length === 0) return;
				setState(current => ({
					...current,
					harvestedGoalIdsByDate: {
						...current.harvestedGoalIdsByDate,
						[date]: Array.from(new Set([...(current.harvestedGoalIdsByDate[date] ?? []), ...goalIds])),
					},
				}));
			},
			setMenuShortcut: (id, enabled) => {
				setState(current => ({ ...current, menuShortcuts: { ...current.menuShortcuts, [id]: enabled } }));
			},
			setSetting: (key, settingValue) => {
				setState(current => ({ ...current, settings: { ...current.settings, [key]: settingValue } }));
			},
			resetDragonFocusState: () => setState(INITIAL_DRAGON_FOCUS_STATE),
		}),
		[state, setState],
	);

	return <DragonFocusContext.Provider value={value}>{children}</DragonFocusContext.Provider>;
}

export function useDragonFocus() {
	const context = useContext(DragonFocusContext);
	if (!context) throw new Error('useDragonFocus must be used within DragonFocusProvider');
	return context;
}
