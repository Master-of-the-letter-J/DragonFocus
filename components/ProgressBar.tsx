import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export default function ProgressBar({ progress, outerStyle, innerStyle }: { progress: number; outerStyle?: StyleProp<ViewStyle>; innerStyle?: StyleProp<ViewStyle> }) {
	const pct = Math.max(0, Math.min(100, Math.round(progress)));
	return (
		<View style={[styles.outer, outerStyle]}>
			<View style={[styles.inner, { width: `${pct}%` }, innerStyle]} />
		</View>
	);
}

const styles = StyleSheet.create({
	outer: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 6, overflow: 'hidden', marginVertical: 8 },
	inner: { height: '100%', backgroundColor: '#4CAF50' },
});
