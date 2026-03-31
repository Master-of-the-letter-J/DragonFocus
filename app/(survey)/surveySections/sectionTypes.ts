import React from 'react';

export type EnableNextHandler = (() => void) | null;

export interface SurveySectionConfig {
	key: string;
	label: string;
	isEnabled: boolean;
	isNextEnabled: boolean;
	enableNext: EnableNextHandler;
	render: () => React.ReactNode;
}

export interface SectionHookResult<TState, TSave = TState> {
	section: SurveySectionConfig;
	state: TState;
	setState: React.Dispatch<React.SetStateAction<TState>>;
	saveState: () => TSave;
	restoreState: (data: TSave | null | undefined) => void;
}
