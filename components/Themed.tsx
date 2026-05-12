import { useTheme } from '@/context/ThemeProvider';
import { Text as DefaultText, View as DefaultView } from 'react-native';

type ThemeProps = {
	lightColor?: string;
	darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(props: { light?: string; dark?: string }, colorName: 'text' | 'background') {
	const theme = useTheme();
	const colorFromProps = theme.mode === 'light' ? props.light : props.dark;
	if (colorFromProps) return colorFromProps;
	return colorName === 'text' ? theme.colors.text : theme.colors.background;
}

export function Text(props: TextProps) {
	const { style, lightColor, darkColor, ...otherProps } = props;
	const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
	const selectable = typeof (otherProps as { selectable?: boolean }).selectable === 'boolean' ? (otherProps as { selectable?: boolean }).selectable : false;
	return <DefaultText selectable={selectable} style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
	const { style, lightColor, darkColor, ...otherProps } = props;
	const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
	return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
