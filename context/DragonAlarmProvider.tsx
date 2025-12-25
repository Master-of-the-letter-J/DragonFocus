import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface DragonAlarm {
	id: string;
	enabled: boolean;
	times: string[]; // HH:MM format
	label?: string;
}

interface DragonAlarmContextType {
	alarms: DragonAlarm[];
	addAlarm: (time: string) => void;
	removeAlarm: (id: string) => void;
	toggleAlarm: (id: string, enabled: boolean) => void;
	updateAlarmLabel: (id: string, label: string) => void;
}

const DragonAlarmContext = createContext<DragonAlarmContextType | undefined>(undefined);

export function DragonAlarmProvider({ children }: { children: ReactNode }) {
	const [alarms, setAlarms] = useState<DragonAlarm[]>([
		{ id: 'default_morning', enabled: true, times: ['07:00'], label: 'Morning Dragon Alarm' },
		{ id: 'default_night', enabled: true, times: ['21:00'], label: 'Night Dragon Alarm' },
	]);

	const addAlarm = (time: string) => {
		const newAlarm: DragonAlarm = {
			id: `alarm_${Date.now()}`,
			enabled: true,
			times: [time],
			label: `Dragon Alarm - ${time}`,
		};
		setAlarms(prev => [...prev, newAlarm]);
	};

	const removeAlarm = (id: string) => {
		setAlarms(prev => prev.filter(a => a.id !== id));
	};

	const toggleAlarm = (id: string, enabled: boolean) => {
		setAlarms(prev => prev.map(a => (a.id === id ? { ...a, enabled } : a)));
	};

	const updateAlarmLabel = (id: string, label: string) => {
		setAlarms(prev => prev.map(a => (a.id === id ? { ...a, label } : a)));
	};

	return (
		<DragonAlarmContext.Provider
			value={{
				alarms,
				addAlarm,
				removeAlarm,
				toggleAlarm,
				updateAlarmLabel,
			}}>
			{children}
		</DragonAlarmContext.Provider>
	);
}

export function useDragonAlarm() {
	const ctx = useContext(DragonAlarmContext);
	if (!ctx) throw new Error('useDragonAlarm must be used within DragonAlarmProvider');
	return ctx;
}
