import { Text, View } from '@/components/Themed';
import React from 'react';
import { StyleSheet, Switch } from 'react-native';

interface SettingRowProps {
	label: string;
	scarLevelRequired?: number;
	currentScarLevel?: number;
	value: boolean;
	onValueChange: (value: boolean) => void;
	disabled?: boolean;
}

export default function SettingRow({ label, scarLevelRequired, currentScarLevel = 0, value, onValueChange, disabled = false }: SettingRowProps) {
	const isLocked = scarLevelRequired !== undefined && currentScarLevel < scarLevelRequired;
	const isDisabled = disabled || isLocked;

	return (
		<View style={styles.row}>
			<View style={styles.labelContainer}>
				<Text style={styles.label}>{label}</Text>
				{isLocked && <Text style={styles.lockText}>(Scar Level {scarLevelRequired}+ Required)</Text>}
			</View>
			<Switch value={value && !isLocked} onValueChange={onValueChange} disabled={isDisabled} />
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderColor: '#eee',
	},
	labelContainer: {
		flex: 1,
	},
	label: {
		fontSize: 16,
	},
	lockText: {
		fontSize: 12,
		color: '#999',
	},
});
