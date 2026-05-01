import { Text, View } from '@/components/Themed';
import React, { useCallback, useState } from 'react';
import { Pressable } from 'react-native';
import type { SectionHookResult } from './sectionTypes';
import { sectionStyles } from './sectionStyles';

interface EditToggleQuestionState {
	selected: boolean | null;
}

interface UseEditToggleQuestionParams {
	key: string;
	label: string;
	question: string;
	description?: string;
}

export function useEditToggleQuestionSection({ key, label, question, description }: UseEditToggleQuestionParams): SectionHookResult<EditToggleQuestionState> {
	const [state, setState] = useState<EditToggleQuestionState>({ selected: null });

	const render = useCallback(() => {
		return (
			<View>
				<Text style={sectionStyles.question}>{question}</Text>
				{description ? <Text style={[sectionStyles.subtleText, { marginBottom: 12 }]}>{description}</Text> : null}

				<View style={{ flexDirection: 'row', gap: 12 }}>
					<Pressable
						style={[sectionStyles.buttonPrevious, state.selected === true ? { borderColor: '#15803D', backgroundColor: '#F0FDF4' } : null]}
						onPress={() => setState({ selected: true })}>
						<Text style={[sectionStyles.buttonText, state.selected === true ? { color: '#15803D' } : null]}>Yes</Text>
					</Pressable>
					<Pressable
						style={[sectionStyles.buttonPrevious, state.selected === false ? { borderColor: '#111827', backgroundColor: '#F9FAFB' } : null]}
						onPress={() => setState({ selected: false })}>
						<Text style={[sectionStyles.buttonText, state.selected === false ? { color: '#111827' } : null]}>No</Text>
					</Pressable>
				</View>
			</View>
		);
	}, [description, question, state.selected]);

	return {
		section: {
			key,
			label,
			isEnabled: true,
			isNextEnabled: state.selected !== null,
			enableNext: null,
			render,
		},
		state,
		setState,
		saveState: () => state,
		restoreState: data => {
			if (!data) return;
			setState({ selected: typeof data.selected === 'boolean' ? data.selected : null });
		},
	};
}
