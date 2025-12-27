import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useDragon } from './DragonProvider';
import { useFury } from './FuryProvider';

export type Weather = 'None' | 'Cloudy' | 'Rainy' | 'Fire' | 'Thunder' | 'Lava Rain';
export type WeatherIntensity = 'Slight' | 'Medium' | 'Heavy';
export type Mood = 'Happy' | 'Conflicted' | 'Heavy Metal' | 'Secluded' | 'Sad';
export type Brightness = 'Bright' | 'Slight Bright' | 'Normal' | 'Slight Dimmer' | 'Dimmer';
export type ColorScheme = 'Normal' | 'Slight Bright' | 'Bright' | 'Slight Dimmer' | 'Dimmer';

export interface WeatherState {
	weather: Weather;
	intensity?: WeatherIntensity;
	mood: Mood;
	brightness: Brightness;
	colors: ColorScheme;
	healthPercentage: number;
	furyPercentage: number;
}

export interface WeatherContextType {
	state: WeatherState;
	enabled: boolean;
	setEnabled: (enabled: boolean) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

/**
 * Maps health (0-100%) and fury (0-100%) percentages to weather state
 * Health determines whether weather is negative (low health) or positive (high health)
 * Fury determines intensity and mood shifts
 *
 * Health ranges: Low (0-33%), Mid (34-66%), High (67-100%)
 * Fury ranges: Calm (0-33%), Moderate (34-66%), Intense (67-100%)
 */
function mapHealthFuryToWeather(healthPercentage: number, furyPercentage: number): Omit<WeatherState, 'healthPercentage' | 'furyPercentage'> {
	// Determine health zone
	const isLowHealth = healthPercentage < 34;
	const isMidHealth = healthPercentage >= 34 && healthPercentage < 67;
	const isHighHealth = healthPercentage >= 67;

	// Determine fury zone
	const isCalm = furyPercentage < 34;
	const isModerate = furyPercentage >= 34 && furyPercentage < 67;
	const isIntense = furyPercentage >= 67;

	// Map combinations: 9 states total
	if (isHighHealth && isCalm) {
		// Dragon is healthy and calm → Pleasant conditions
		return {
			weather: 'None',
			mood: 'Happy',
			brightness: 'Bright',
			colors: 'Bright',
		};
	} else if (isHighHealth && isModerate) {
		// Dragon is healthy but getting restless
		return {
			weather: 'Cloudy',
			intensity: 'Slight',
			mood: 'Conflicted',
			brightness: 'Slight Bright',
			colors: 'Slight Bright',
		};
	} else if (isHighHealth && isIntense) {
		// Dragon is healthy but very angry
		return {
			weather: 'Thunder',
			intensity: 'Heavy',
			mood: 'Heavy Metal',
			brightness: 'Normal',
			colors: 'Normal',
		};
	} else if (isMidHealth && isCalm) {
		// Dragon is okay and content
		return {
			weather: 'None',
			mood: 'Happy',
			brightness: 'Normal',
			colors: 'Normal',
		};
	} else if (isMidHealth && isModerate) {
		// Dragon is okay but worried
		return {
			weather: 'Rainy',
			intensity: 'Medium',
			mood: 'Conflicted',
			brightness: 'Slight Dimmer',
			colors: 'Slight Dimmer',
		};
	} else if (isMidHealth && isIntense) {
		// Dragon is okay but very angry
		return {
			weather: 'Fire',
			intensity: 'Medium',
			mood: 'Heavy Metal',
			brightness: 'Normal',
			colors: 'Normal',
		};
	} else if (isLowHealth && isCalm) {
		// Dragon is weak and sad
		return {
			weather: 'Rainy',
			intensity: 'Medium',
			mood: 'Sad',
			brightness: 'Slight Dimmer',
			colors: 'Slight Dimmer',
		};
	} else if (isLowHealth && isModerate) {
		// Dragon is weak and upset
		return {
			weather: 'Lava Rain',
			intensity: 'Heavy',
			mood: 'Heavy Metal',
			brightness: 'Dimmer',
			colors: 'Dimmer',
		};
	} else {
		// isLowHealth && isIntense - Dragon is dying and furious
		return {
			weather: 'Lava Rain',
			intensity: 'Heavy',
			mood: 'Heavy Metal',
			brightness: 'Dimmer',
			colors: 'Dimmer',
		};
	}
}

export function WeatherProvider({ children }: { children: ReactNode }) {
	const dragon = useDragon();
	const fury = useFury();
	const [enabled, setEnabled] = useState(true);
	const [weatherState, setWeatherState] = useState<WeatherState>(() => ({
		weather: 'None',
		mood: 'Happy',
		brightness: 'Normal',
		colors: 'Normal',
		healthPercentage: 100,
		furyPercentage: 0,
	}));

	useEffect(() => {
		// Recalculate weather whenever health or fury changes
		const healthPercentage = (dragon.hp / dragon.maxHP) * 100;
		const furyPercentage = fury.furyMeter;

		const newWeatherState = mapHealthFuryToWeather(healthPercentage, furyPercentage);

		setWeatherState({
			...newWeatherState,
			healthPercentage,
			furyPercentage,
		});
	}, [dragon.hp, dragon.maxHP, fury.furyMeter]);

	return <WeatherContext.Provider value={{ state: weatherState, enabled, setEnabled }}>{children}</WeatherContext.Provider>;
}

export function useWeather(): WeatherContextType {
	const context = useContext(WeatherContext);
	if (!context) {
		throw new Error('useWeather must be used within a WeatherProvider');
	}
	return context;
}
