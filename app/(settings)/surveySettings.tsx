import { useQuestions } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

export default function SurveySettings() {
	const router = useRouter();
	const survey = useSurvey();
	const questions = useQuestions();

	const [habitCategoryInput, setHabitCategoryInput] = useState('');
	const [todoCategoryInput, setTodoCategoryInput] = useState('');

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Survey Settings</Text>
			<Text style={styles.subtitle}>Changes apply immediately and update the morning/night survey flow automatically.</Text>

			<Pressable style={styles.tutorialButton} onPress={() => router.push('/survey/tutorial' as any)}>
				<Text style={styles.tutorialButtonText}>Open Full Tutorial</Text>
			</Pressable>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Survey Flow</Text>
				<ToggleRow label="Show advice section" value={survey.options.enableAdvice ?? true} onValueChange={value => survey.setOption('enableAdvice', value)} />
				<ToggleRow label="Show mood question" value={survey.options.enableMoodQuestion} onValueChange={value => survey.setOption('enableMoodQuestion', value)} />
				<ToggleRow label="Show quote section" value={survey.options.showQuote} onValueChange={value => survey.setOption('showQuote', value)} />
				<ToggleRow label="Show quote in morning survey" value={survey.options.quoteMorning ?? true} onValueChange={value => survey.setOption('quoteMorning', value)} />
				<ToggleRow label="Enable short-answer prompts" value={survey.options.enableProjectQuestion} onValueChange={value => survey.setOption('enableProjectQuestion', value)} />
				<ToggleRow label="Enable trivia questions" value={survey.options.enableRandomMC ?? true} onValueChange={value => survey.setOption('enableRandomMC', value)} />
				<ToggleRow label="Morning journal entry" value={survey.options.enableJournalMorning} onValueChange={value => survey.setOption('enableJournalMorning', value)} />
				<ToggleRow label="Night journal entry" value={survey.options.enableJournalNight} onValueChange={value => survey.setOption('enableJournalNight', value)} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Advice & Quotes</Text>
				<Text style={styles.helper}>The advice and quote pools use these type toggles. Keep at least one enabled for each section.</Text>
				<ToggleRow label="Inspirational advice" value={questions.questionSettings.advice.types.inspirational} onValueChange={() => questions.updateAdviceSettings({ ...questions.questionSettings.advice.types, inspirational: !questions.questionSettings.advice.types.inspirational })} />
				<ToggleRow label="Witty advice" value={questions.questionSettings.advice.types.witty} onValueChange={() => questions.updateAdviceSettings({ ...questions.questionSettings.advice.types, witty: !questions.questionSettings.advice.types.witty })} />
				<ToggleRow label="Philosophical advice" value={questions.questionSettings.advice.types.philosophical} onValueChange={() => questions.updateAdviceSettings({ ...questions.questionSettings.advice.types, philosophical: !questions.questionSettings.advice.types.philosophical })} />
				<ToggleRow label="Inspirational quotes" value={questions.questionSettings.quotes.types.inspirational} onValueChange={() => questions.updateQuotesSettings({ ...questions.questionSettings.quotes.types, inspirational: !questions.questionSettings.quotes.types.inspirational })} />
				<ToggleRow label="Witty quotes" value={questions.questionSettings.quotes.types.witty} onValueChange={() => questions.updateQuotesSettings({ ...questions.questionSettings.quotes.types, witty: !questions.questionSettings.quotes.types.witty })} />
				<ToggleRow label="Philosophical quotes" value={questions.questionSettings.quotes.types.philosophical} onValueChange={() => questions.updateQuotesSettings({ ...questions.questionSettings.quotes.types, philosophical: !questions.questionSettings.quotes.types.philosophical })} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Prompts & Trivia Counts</Text>
				<ToggleRow label="Enable random prompt section" value={questions.questionSettings.prompts.enabled} onValueChange={questions.updatePromptsEnabled} />
				<View style={styles.inlineRow}>
					<Text style={styles.inlineLabel}>Random prompts per survey</Text>
					<View style={styles.segmentRow}>
						{[0, 1, 2, 3].map(count => (
							<Pressable key={count} style={[styles.segmentButton, (survey.options.randomPromptCount ?? 1) === count && styles.segmentActive]} onPress={() => survey.setOption('randomPromptCount', count)}>
								<Text style={[styles.segmentText, (survey.options.randomPromptCount ?? 1) === count && styles.segmentTextActive]}>{count}</Text>
							</Pressable>
						))}
					</View>
				</View>
				<View style={styles.inlineRow}>
					<Text style={styles.inlineLabel}>Morning trivia</Text>
					<View style={styles.segmentRow}>
						{[0, 1, 2, 3].map(count => (
							<Pressable key={`morning-${count}`} style={[styles.segmentButton, questions.questionSettings.trivia.morningCount === count && styles.segmentActive]} onPress={() => questions.setTriviaCount(count, questions.questionSettings.trivia.eveningCount)}>
								<Text style={[styles.segmentText, questions.questionSettings.trivia.morningCount === count && styles.segmentTextActive]}>{count}</Text>
							</Pressable>
						))}
					</View>
				</View>
				<View style={styles.inlineRow}>
					<Text style={styles.inlineLabel}>Night trivia</Text>
					<View style={styles.segmentRow}>
						{[0, 1, 2, 3].map(count => (
							<Pressable key={`night-${count}`} style={[styles.segmentButton, questions.questionSettings.trivia.eveningCount === count && styles.segmentActive]} onPress={() => questions.setTriviaCount(questions.questionSettings.trivia.morningCount, count)}>
								<Text style={[styles.segmentText, questions.questionSettings.trivia.eveningCount === count && styles.segmentTextActive]}>{count}</Text>
							</Pressable>
						))}
					</View>
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Goal Categories</Text>
				<Text style={styles.helper}>Habit and To-Do suggestions read from these category lists.</Text>
				<Text style={styles.groupTitle}>Habit categories</Text>
				<View style={styles.tagRow}>
					{[...questions.questionSettings.habitGoals.suggestedCategories, ...questions.questionSettings.habitGoals.customCategories].map(category => (
						<View key={category} style={styles.tag}>
							<Text style={styles.tagText}>{category}</Text>
							{questions.questionSettings.habitGoals.customCategories.includes(category) && (
								<Pressable onPress={() => questions.removeHabitCategory(category)}>
									<Text style={styles.removeText}>X</Text>
								</Pressable>
							)}
						</View>
					))}
				</View>
				<View style={styles.inputRow}>
					<TextInput value={habitCategoryInput} onChangeText={setHabitCategoryInput} placeholder="Add habit category" style={styles.input} />
					<Pressable
						style={styles.addButton}
						onPress={() => {
							if (!habitCategoryInput.trim()) return;
							questions.addHabitCategory(habitCategoryInput.trim());
							setHabitCategoryInput('');
						}}>
						<Text style={styles.addButtonText}>Add</Text>
					</Pressable>
				</View>

				<Text style={styles.groupTitle}>To-Do categories</Text>
				<View style={styles.tagRow}>
					{[...questions.questionSettings.todoGoals.suggestedCategories, ...questions.questionSettings.todoGoals.customCategories].map(category => (
						<View key={category} style={styles.tag}>
							<Text style={styles.tagText}>{category}</Text>
							{questions.questionSettings.todoGoals.customCategories.includes(category) && (
								<Pressable onPress={() => questions.removeTodoCategory(category)}>
									<Text style={styles.removeText}>X</Text>
								</Pressable>
							)}
						</View>
					))}
				</View>
				<View style={styles.inputRow}>
					<TextInput value={todoCategoryInput} onChangeText={setTodoCategoryInput} placeholder="Add to-do category" style={styles.input} />
					<Pressable
						style={styles.addButton}
						onPress={() => {
							if (!todoCategoryInput.trim()) return;
							questions.addTodoCategory(todoCategoryInput.trim());
							setTodoCategoryInput('');
						}}>
						<Text style={styles.addButtonText}>Add</Text>
					</Pressable>
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Journal Placement</Text>
				<Text style={styles.helper}>Choose where the journal entry section appears.</Text>
				<View style={styles.segmentRow}>
					{(['none', 'morning', 'evening', 'both'] as const).map(option => (
						<Pressable key={option} style={[styles.segmentButton, questions.questionSettings.journalEntry.setting === option && styles.segmentActive]} onPress={() => questions.setJournalEntry(option, questions.questionSettings.journalEntry.template)}>
							<Text style={[styles.segmentText, questions.questionSettings.journalEntry.setting === option && styles.segmentTextActive]}>{option}</Text>
						</Pressable>
					))}
				</View>
				<TextInput value={questions.questionSettings.journalEntry.template} onChangeText={value => questions.setJournalEntry(questions.questionSettings.journalEntry.setting, value)} placeholder="Optional journal prompt template" style={[styles.input, { marginTop: 12, minHeight: 72 }]} multiline />
			</View>
		</ScrollView>
	);
}

function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
	return (
		<View style={styles.toggleRow}>
			<Text style={styles.toggleLabel}>{label}</Text>
			<Switch value={value} onValueChange={onValueChange} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, paddingBottom: 40 },
	title: { fontSize: 24, fontWeight: '800', color: '#111827' },
	subtitle: { marginTop: 6, marginBottom: 12, color: '#6B7280', lineHeight: 20 },
	tutorialButton: { alignSelf: 'flex-start', backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14 },
	tutorialButtonText: { color: '#fff', fontWeight: '800' },
	card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, marginBottom: 14 },
	cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 10 },
	helper: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 12 },
	toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
	toggleLabel: { flex: 1, paddingRight: 12, color: '#374151', fontWeight: '600' },
	inlineRow: { marginBottom: 12 },
	inlineLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
	segmentRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
	segmentButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff' },
	segmentActive: { backgroundColor: '#166534', borderColor: '#166534' },
	segmentText: { color: '#4B5563', fontWeight: '700', textTransform: 'capitalize' },
	segmentTextActive: { color: '#fff' },
	groupTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 8, marginTop: 6 },
	tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
	tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F3F4F6' },
	tagText: { color: '#374151', fontWeight: '700' },
	removeText: { color: '#DC2626', fontWeight: '800' },
	inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
	input: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', color: '#111827' },
	addButton: { backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center' },
	addButtonText: { color: '#fff', fontWeight: '800' },
});
