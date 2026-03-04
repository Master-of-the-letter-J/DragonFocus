import React, { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export interface ToastOptions {
	durationMs?: number;
	shadowColor?: string;
	textColor?: string;
	shadowAmount?: number;
	backgroundColor?: string;
}

export interface ToastPayload extends ToastOptions {
	title?: string;
	message: string;
}

interface ToastContextType {
	showToast: (payload: ToastPayload | string, options?: ToastOptions) => void;
	hideToast: () => void;
}

const DEFAULT_DURATION_MS = 1800;
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toast, setToast] = useState<ToastPayload | null>(null);
	const fade = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(12)).current;
	const hideTimer = useRef<NodeJS.Timeout | null>(null);

	const hideToast = useCallback(() => {
		if (hideTimer.current) {
			clearTimeout(hideTimer.current);
			hideTimer.current = null;
		}
		Animated.parallel([
			Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }),
			Animated.timing(translateY, { toValue: 12, duration: 160, useNativeDriver: true }),
		]).start(() => setToast(null));
	}, [fade, translateY]);

	const showToast = useCallback(
		(payload: ToastPayload | string, options?: ToastOptions) => {
			const base: ToastPayload =
				typeof payload === 'string'
					? {
							message: payload,
							...(options ?? {}),
						}
					: payload;

			if (hideTimer.current) {
				clearTimeout(hideTimer.current);
				hideTimer.current = null;
			}

			setToast(base);
			fade.setValue(0);
			translateY.setValue(12);

			Animated.parallel([
				Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
				Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
			]).start();

			hideTimer.current = setTimeout(hideToast, base.durationMs ?? DEFAULT_DURATION_MS);
		},
		[fade, hideToast, translateY],
	);

	const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

	return (
		<ToastContext.Provider value={value}>
			<View style={styles.root}>
				{children}
				{toast && (
					<Animated.View
						pointerEvents="none"
						style={[
							styles.overlay,
							{
								opacity: fade,
								transform: [{ translateY }],
							},
						]}>
						<View
							style={[
								styles.toastCard,
								{
									backgroundColor: toast.backgroundColor ?? '#F9FAFB',
									shadowColor: toast.shadowColor ?? '#000',
									shadowOpacity: Math.max(0, Math.min(1, (toast.shadowAmount ?? 10) / 40)),
									shadowRadius: Math.max(2, (toast.shadowAmount ?? 10) / 2),
									elevation: Math.max(2, Math.floor((toast.shadowAmount ?? 10) / 2)),
								},
							]}>
							{toast.title ? <Text style={[styles.title, { color: toast.textColor ?? '#111827' }]}>{toast.title}</Text> : null}
							<Text style={[styles.message, { color: toast.textColor ?? '#111827' }]}>{toast.message}</Text>
						</View>
					</Animated.View>
				)}
			</View>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) throw new Error('useToast must be used within ToastProvider');
	return context;
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	overlay: {
		position: 'absolute',
		left: 12,
		right: 12,
		bottom: 20,
		zIndex: 9999,
	},
	toastCard: {
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		shadowOffset: { width: 0, height: 3 },
	},
	title: {
		fontWeight: '700',
		fontSize: 13,
		marginBottom: 2,
	},
	message: {
		fontSize: 13,
		fontWeight: '500',
	},
});
