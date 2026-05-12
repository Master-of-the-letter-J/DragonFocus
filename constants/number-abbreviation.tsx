const ABBREVIATION_STEPS = [
	{ suffix: 'K', divisor: 1_000, threshold: 100_000 },
	{ suffix: 'M', divisor: 1_000_000, threshold: 100_000_000 },
	{ suffix: 'B', divisor: 1_000_000_000, threshold: 100_000_000_000 },
	{ suffix: 'T', divisor: 1_000_000_000_000, threshold: 100_000_000_000_000 },
	{ suffix: 'q', divisor: 1_000_000_000_000_000, threshold: 100_000_000_000_000_000 },
	{ suffix: 'Q', divisor: 1_000_000_000_000_000_000, threshold: 100_000_000_000_000_000_000 },
	{ suffix: 's', divisor: 1_000_000_000_000_000_000_000, threshold: 100_000_000_000_000_000_000_000 },
	{ suffix: 'S', divisor: 1_000_000_000_000_000_000_000_000, threshold: 100_000_000_000_000_000_000_000_000 },
	{ suffix: 'N', divisor: 1_000_000_000_000_000_000_000_000_000, threshold: 100_000_000_000_000_000_000_000_000_000 },
	{ suffix: 'D', divisor: 1_000_000_000_000_000_000_000_000_000_000, threshold: 100_000_000_000_000_000_000_000_000_000_000 },
] as const;

const formatInteger = (value: number) => {
	return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(value));
};

export const roundToDecimalPlaces = (value: number, places = 3) => {
	if (!Number.isFinite(value)) return 0;
	const factor = Math.pow(10, places);
	return Math.round(value * factor) / factor;
};

export const formatDecimalNumber = (value: number, maximumFractionDigits = 3) => {
	if (!Number.isFinite(value)) return '0';
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits,
	}).format(value);
};

export const formatCoinNumber = (value: number, fixedCentsBelowThreshold = false) => {
	if (!Number.isFinite(value)) return '0';
	const absoluteValue = Math.abs(value);
	if (absoluteValue < 100_000) {
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: fixedCentsBelowThreshold ? 2 : 0,
			maximumFractionDigits: 2,
		}).format(value);
	}
	return formatAbbreviatedNumber(value);
};

export const formatAbbreviatedNumber = (value: number, minimumThreshold = 100_000) => {
	if (!Number.isFinite(value)) return '0';

	const sign = value < 0 ? '-' : '';
	const absoluteValue = Math.abs(value);

	if (absoluteValue < minimumThreshold) {
		return `${sign}${formatInteger(absoluteValue)}`;
	}

	const matchingStep = [...ABBREVIATION_STEPS].reverse().find(step => absoluteValue >= step.threshold);
	if (!matchingStep) {
		return `${sign}${formatInteger(absoluteValue)}`;
	}

	if (matchingStep.suffix === 'D' && absoluteValue >= matchingStep.threshold * 1000) {
		return `${sign}${absoluteValue.toExponential(2).replace('+', '')}`;
	}

	return `${sign}${formatInteger(absoluteValue / matchingStep.divisor)}${matchingStep.suffix}`;
};

export const formatPopulationNumber = (value: number) => {
	if (!Number.isFinite(value)) return '0';
	if (Math.abs(value) >= 1_000_000_000_000) {
		return value.toExponential(2).replace('+', '');
	}
	return formatAbbreviatedNumber(value, 100_000_000_000_000);
};
