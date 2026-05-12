import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeProvider';

export default function ProgressBar({ progress, outerStyle, innerStyle }: { progress: number; outerStyle?: StyleProp<ViewStyle>; innerStyle?: StyleProp<ViewStyle> }) {
	const theme = useTheme();
	const pct = Math.max(0, Math.min(100, Math.round(progress)));
	return (
		<View style={[styles.outer, { backgroundColor: theme.colors.tertiaryBackground }, outerStyle]}>
			<View style={[styles.inner, { width: `${pct}%`, backgroundColor: theme.colors.success }, innerStyle]} />
		</View>
	);
}

const styles = StyleSheet.create({
	outer: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 6, overflow: 'hidden', marginVertical: 8 },
	inner: { height: '100%', backgroundColor: '#4CAF50' },
});
