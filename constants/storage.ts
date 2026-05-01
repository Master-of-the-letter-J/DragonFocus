import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const APP_STORAGE_KEYS = {
	survey: 'dragonfocus:survey-state',
	questionSettings: 'dragonfocus:question-settings',
	dragonCoins: 'dragonfocus:dragon-coins',
	dragonShards: 'dragonfocus:dragon-shards',
	dragonSouls: 'dragonfocus:dragon-souls',
	dragonEmbers: 'dragonfocus:dragon-embers',
	population: 'dragonfocus:population',
	ascension: 'dragonfocus:ascension',
	transcension: 'dragonfocus:transcension',
	goals: 'dragonfocus:goals',
	journal: 'dragonfocus:journal',
} as const;

type StateInitializer<T> = T | (() => T);

interface PersistedStateOptions<T> {
	normalize?: (storedValue: T | null, initialValue: T) => T;
}

interface PersistedStateResult<T> {
	state: T;
	setState: Dispatch<SetStateAction<T>>;
	hasHydrated: boolean;
}

const resolveInitialValue = <T,>(initialValue: StateInitializer<T>) => {
	return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
};

export async function loadStoredJson<T>(key: string) {
	try {
		const rawValue = await AsyncStorage.getItem(key);
		if (!rawValue) return null;
		return JSON.parse(rawValue) as T;
	} catch (error) {
		console.warn(`Failed to load stored value for ${key}.`, error);
		return null;
	}
}

export async function saveStoredJson(key: string, value: unknown) {
	try {
		await AsyncStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.warn(`Failed to save stored value for ${key}.`, error);
	}
}

export async function removeStoredJson(key: string) {
	try {
		await AsyncStorage.removeItem(key);
	} catch (error) {
		console.warn(`Failed to remove stored value for ${key}.`, error);
	}
}

export async function clearAppStorage() {
	try {
		await Promise.all(Object.values(APP_STORAGE_KEYS).map(key => AsyncStorage.removeItem(key)));
	} catch (error) {
		console.warn('Failed to clear Dragon Focus storage.', error);
	}
}

export function usePersistedState<T>(key: string, initialValue: StateInitializer<T>, options: PersistedStateOptions<T> = {}): PersistedStateResult<T> {
	const [state, setState] = useState<T>(() => resolveInitialValue(initialValue));
	const [hasHydrated, setHasHydrated] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const hydrateState = async () => {
			const fallbackState = resolveInitialValue(initialValue);
			const storedValue = await loadStoredJson<T>(key);
			if (cancelled) return;

			setState(options.normalize ? options.normalize(storedValue, fallbackState) : (storedValue ?? fallbackState));
			setHasHydrated(true);
		};

		void hydrateState();

		return () => {
			cancelled = true;
		};
	}, [key]);

	useEffect(() => {
		if (!hasHydrated) return;
		void saveStoredJson(key, state);
	}, [hasHydrated, key, state]);

	return {
		state,
		setState,
		hasHydrated,
	};
}
