import { useTheme } from '@/context/ThemeProvider';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function SectionTabs<T extends string>({
	tabs,
	active,
	onChange,
}: {
	tabs: Array<{ key: T; label: string }>;
	active: T;
	onChange: (key: T) => void;
}) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);

	return (
		<View style={styles.tabs}>
			{tabs.map(tab => (
				<Pressable key={tab.key} style={[styles.tab, active === tab.key && styles.activeTab]} onPress={() => onChange(tab.key)}>
					<Text style={[styles.tabText, active === tab.key && styles.activeTabText]}>{tab.label}</Text>
				</Pressable>
			))}
		</View>
	);
}

export function Panel({ children, style }: { children: React.ReactNode; style?: object }) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return <View style={[styles.panel, style]}>{children}</View>;
}

export function StatTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<View style={styles.statTile}>
			<Text style={styles.statLabel}>{label}</Text>
			<Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
		</View>
	);
}

export function EmptyState({ title, body }: { title: string; body: string }) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<View style={styles.empty}>
			<Text style={styles.emptyTitle}>{title}</Text>
			<Text style={styles.emptyBody}>{body}</Text>
		</View>
	);
}

export function ActionButton({
	label,
	onPress,
	variant = 'primary',
	disabled = false,
}: {
	label: string;
	onPress: () => void;
	variant?: 'primary' | 'secondary' | 'danger';
	disabled?: boolean;
}) {
	const theme = useTheme();
	const styles = React.useMemo(() => createStyles(theme.colors), [theme.colors]);
	return (
		<Pressable
			style={[
				styles.action,
				variant === 'secondary' && styles.secondaryAction,
				variant === 'danger' && styles.dangerAction,
				disabled && styles.disabled,
			]}
			onPress={onPress}
			disabled={disabled}>
			<Text style={[styles.actionText, variant === 'secondary' && styles.secondaryActionText]}>{label}</Text>
		</Pressable>
	);
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
	StyleSheet.create({
		tabs: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			backgroundColor: colors.background,
			borderBottomWidth: 1,
			borderBottomColor: colors.border,
		},
		tab: {
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.secondaryBackground,
			paddingHorizontal: 12,
			paddingVertical: 9,
		},
		activeTab: {
			backgroundColor: colors.buttonBackground,
			borderColor: colors.buttonBackground,
		},
		tabText: {
			color: colors.text,
			fontSize: 12,
			fontWeight: '800',
		},
		activeTabText: {
			color: colors.buttonText,
		},
		panel: {
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.secondaryBackground,
			padding: 14,
			marginBottom: 12,
		},
		statTile: {
			flexGrow: 1,
			flexBasis: '46%',
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.secondaryBackground,
			padding: 12,
		},
		statLabel: {
			color: colors.secondaryText,
			fontSize: 12,
			fontWeight: '700',
		},
		statValue: {
			color: colors.titleText,
			fontSize: 19,
			fontWeight: '900',
			marginTop: 4,
		},
		empty: {
			borderRadius: 8,
			borderWidth: 1,
			borderColor: colors.border,
			backgroundColor: colors.secondaryBackground,
			padding: 16,
			marginVertical: 8,
		},
		emptyTitle: {
			color: colors.titleText,
			fontSize: 16,
			fontWeight: '900',
		},
		emptyBody: {
			color: colors.secondaryText,
			fontSize: 13,
			lineHeight: 19,
			marginTop: 6,
		},
		action: {
			borderRadius: 8,
			backgroundColor: colors.buttonBackground,
			paddingHorizontal: 13,
			paddingVertical: 10,
			alignItems: 'center',
		},
		secondaryAction: {
			backgroundColor: colors.secondaryButton,
			borderWidth: 1,
			borderColor: colors.border,
		},
		dangerAction: {
			backgroundColor: colors.danger,
		},
		disabled: {
			opacity: 0.45,
		},
		actionText: {
			color: colors.buttonText,
			fontWeight: '900',
			fontSize: 12,
		},
		secondaryActionText: {
			color: colors.secondaryButtonText,
		},
	});
