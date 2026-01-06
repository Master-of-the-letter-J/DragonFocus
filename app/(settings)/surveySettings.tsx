import { useQuestions } from '@/context/QuestionProvider';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

function SurveySettingsContent() {
	const { questionSettings, updateAdviceSettings, updateQuotesSettings, toggleMood, addCustomEmotion, removeCustomEmotion, updateHabitCategories, addHabitCategory, removeHabitCategory, updateTodoCategories, addTodoCategory, removeTodoCategory, addCustomPrompt, removeCustomPrompt, updatePromptsEnabled, setTriviaCount, setJournalEntry } = useQuestions();

	const [customHabitCatInput, setCustomHabitCatInput] = useState('');
	const [customTodoCatInput, setCustomTodoCatInput] = useState('');

	return (
		<View>
			{/* 1. Advice Question */}
			<View style={styles.questionBox}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTitle}>💡 Survey Advice</Text>
					<Switch value={questionSettings.advice.enabled} disabled />
				</View>
				<Text style={styles.questionHint}>Adjust types of advice shown at survey start</Text>
				<View style={styles.typeToggleRow}>
					<Pressable style={[styles.typeToggle, questionSettings.advice.types.inspirational && styles.typeToggleActive]} onPress={() => updateAdviceSettings({ ...questionSettings.advice.types, inspirational: !questionSettings.advice.types.inspirational })}>
						<Text style={[styles.typeToggleText, questionSettings.advice.types.inspirational && styles.typeToggleTextActive]}>✨ Inspirational</Text>
					</Pressable>
					<Pressable style={[styles.typeToggle, questionSettings.advice.types.witty && styles.typeToggleActive]} onPress={() => updateAdviceSettings({ ...questionSettings.advice.types, witty: !questionSettings.advice.types.witty })}>
						<Text style={[styles.typeToggleText, questionSettings.advice.types.witty && styles.typeToggleTextActive]}>😄 Witty</Text>
					</Pressable>
					<Pressable style={[styles.typeToggle, questionSettings.advice.types.philosophical && styles.typeToggleActive]} onPress={() => updateAdviceSettings({ ...questionSettings.advice.types, philosophical: !questionSettings.advice.types.philosophical })}>
						<Text style={[styles.typeToggleText, questionSettings.advice.types.philosophical && styles.typeToggleTextActive]}>🤔 Philosophical</Text>
					</Pressable>
				</View>
			</View>

			{/* 2. Quotes Question */}
			<View style={styles.questionBox}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTitle}>💬 End Survey Quotes</Text>
					<Switch value={questionSettings.quotes.enabled} disabled />
				</View>
				<Text style={styles.questionHint}>Adjust types of quotes shown at survey end</Text>
				<View style={styles.typeToggleRow}>
					<Pressable style={[styles.typeToggle, questionSettings.quotes.types.inspirational && styles.typeToggleActive]} onPress={() => updateQuotesSettings({ ...questionSettings.quotes.types, inspirational: !questionSettings.quotes.types.inspirational })}>
						<Text style={[styles.typeToggleText, questionSettings.quotes.types.inspirational && styles.typeToggleTextActive]}>✨ Inspirational</Text>
					</Pressable>
					<Pressable style={[styles.typeToggle, questionSettings.quotes.types.witty && styles.typeToggleActive]} onPress={() => updateQuotesSettings({ ...questionSettings.quotes.types, witty: !questionSettings.quotes.types.witty })}>
						<Text style={[styles.typeToggleText, questionSettings.quotes.types.witty && styles.typeToggleTextActive]}>😄 Witty</Text>
					</Pressable>
					<Pressable style={[styles.typeToggle, questionSettings.quotes.types.philosophical && styles.typeToggleActive]} onPress={() => updateQuotesSettings({ ...questionSettings.quotes.types, philosophical: !questionSettings.quotes.types.philosophical })}>
						<Text style={[styles.typeToggleText, questionSettings.quotes.types.philosophical && styles.typeToggleTextActive]}>🤔 Philosophical</Text>
					</Pressable>
				</View>
			</View>

			{/* 3. Mood Question */}
			<View style={styles.questionBox}>
				<View style={styles.questionHeader}>
					<Text style={styles.questionTitle}>😊 Mood Question</Text>
					<Switch value={questionSettings.mood.enabled} onValueChange={toggleMood} />
				</View>
				<Text style={styles.questionHint}>Customize mood options and emotions</Text>
			</View>

			{/* 4. Habit Goals Categories */}
			<View style={styles.questionBox}>
				<Text style={styles.questionTitle}>🎯 Habit Goal Categories (Required)</Text>
				<Text style={styles.questionHint}>Add custom categories to supplement defaults</Text>
				<View style={styles.categoryRow}>
					{questionSettings.habitGoals.suggestedCategories.map(cat => (
						<Text key={cat} style={styles.categoryTag}>
							{cat}
						</Text>
					))}
				</View>
				<View style={styles.addCategoryRow}>
					<TextInput style={styles.categoryInput} placeholder="Add custom category" value={customHabitCatInput} onChangeText={setCustomHabitCatInput} placeholderTextColor="#999" />
					<Pressable
						style={styles.addButton}
						onPress={() => {
							if (customHabitCatInput.trim()) {
								addHabitCategory(customHabitCatInput);
								setCustomHabitCatInput('');
							}
						}}>
						<Text style={styles.addButtonText}>+ Add</Text>
					</Pressable>
				</View>
				<View style={styles.customCategoryRow}>
					{questionSettings.habitGoals.customCategories.map(cat => (
						<View key={cat} style={styles.customCategoryTag}>
							<Text style={styles.customCategoryText}>{cat}</Text>
							<Pressable onPress={() => removeHabitCategory(cat)}>
								<Text style={styles.removeX}>✕</Text>
							</Pressable>
						</View>
					))}
				</View>
			</View>

			{/* 5. To-Do Goals Categories */}
			<View style={styles.questionBox}>
				<Text style={styles.questionTitle}>☑️ To-Do Goal Categories (Required)</Text>
				<Text style={styles.questionHint}>Add custom categories to supplement defaults</Text>
				<View style={styles.categoryRow}>
					{questionSettings.todoGoals.suggestedCategories.map(cat => (
						<Text key={cat} style={styles.categoryTag}>
							{cat}
						</Text>
					))}
				</View>
				<View style={styles.addCategoryRow}>
					<TextInput style={styles.categoryInput} placeholder="Add custom category" value={customTodoCatInput} onChangeText={setCustomTodoCatInput} placeholderTextColor="#999" />
					<Pressable
						style={styles.addButton}
						onPress={() => {
							if (customTodoCatInput.trim()) {
								addTodoCategory(customTodoCatInput);
								setCustomTodoCatInput('');
							}
						}}>
						<Text style={styles.addButtonText}>+ Add</Text>
					</Pressable>
				</View>
				<View style={styles.customCategoryRow}>
					{questionSettings.todoGoals.customCategories.map(cat => (
						<View key={cat} style={styles.customCategoryTag}>
							<Text style={styles.customCategoryText}>{cat}</Text>
							<Pressable onPress={() => removeTodoCategory(cat)}>
								<Text style={styles.removeX}>✕</Text>
							</Pressable>
						</View>
					))}
				</View>
			</View>

			{/* 6. Trivia */}
			<View style={styles.questionBox}>
				<Text style={styles.questionTitle}>🧠 Trivia Questions</Text>
				<Text style={styles.questionHint}>Set how many trivia questions per survey (0-3 each)</Text>
				<View style={styles.triviaRow}>
					<Text style={styles.triviaLabel}>Morning Trivia:</Text>
					<View style={styles.triviaButtons}>
						{[0, 1, 2, 3].map(n => (
							<Pressable key={`m${n}`} style={[styles.triviaBtn, questionSettings.trivia.morningCount === n && styles.triviaBtnActive]} onPress={() => setTriviaCount(n, questionSettings.trivia.eveningCount)}>
								<Text style={styles.triviaBtnText}>{n}</Text>
							</Pressable>
						))}
					</View>
				</View>
				<View style={styles.triviaRow}>
					<Text style={styles.triviaLabel}>Evening Trivia:</Text>
					<View style={styles.triviaButtons}>
						{[0, 1, 2, 3].map(n => (
							<Pressable key={`e${n}`} style={[styles.triviaBtn, questionSettings.trivia.eveningCount === n && styles.triviaBtnActive]} onPress={() => setTriviaCount(questionSettings.trivia.morningCount, n)}>
								<Text style={styles.triviaBtnText}>{n}</Text>
							</Pressable>
						))}
					</View>
				</View>
			</View>

			{/* 7. Journal Entry */}
			<View style={styles.questionBox}>
				<Text style={styles.questionTitle}>📓 Journal Entry</Text>
				<Text style={styles.questionHint}>Choose when journaling appears in surveys</Text>
				<View style={styles.journalOptions}>
					{(['morning', 'evening', 'both', 'none'] as const).map(setting => (
						<Pressable key={setting} style={[styles.journalOption, questionSettings.journalEntry.setting === setting && styles.journalOptionActive]} onPress={() => setJournalEntry(setting, questionSettings.journalEntry.template)}>
							<Text style={[styles.journalOptionText, questionSettings.journalEntry.setting === setting && styles.journalOptionTextActive]}>{setting === 'both' ? '🌅🌙 Both' : setting === 'morning' ? '🌅 Morning' : setting === 'evening' ? '🌙 Evening' : '⊘ None'}</Text>
						</Pressable>
					))}
				</View>
				<TextInput style={styles.templateInput} placeholder="Optional: Journal template text..." value={questionSettings.journalEntry.template} onChangeText={t => setJournalEntry(questionSettings.journalEntry.setting, t)} multiline placeholderTextColor="#999" />
			</View>
		</View>
	);
}

// The SurveySettings page is rendered inside the settings index (which provides TopHeader)
export default function SurveySettings() {
	const router = useRouter();

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Survey Settings</Text>

			<View style={{ marginBottom: 12 }}>
				<Pressable style={styles.tutorialButton} onPress={() => router.push('/survey/tutorial' as any)}>
					<Text style={styles.tutorialButtonText}>📘 Open Full Tutorial</Text>
				</Pressable>
			</View>

			<SurveySettingsContent />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, paddingBottom: 40 },
	title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
	section: { marginBottom: 18 },
	sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
	subTitle: { fontSize: 16, fontWeight: '700', marginTop: 10, marginBottom: 6 },
	paragraph: { color: '#444', fontSize: 13, lineHeight: 20, marginBottom: 8 },
	bullet: { color: '#444', fontSize: 13, fontWeight: '700', marginTop: 6 },
	questionBox: { marginBottom: 16, padding: 12, backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0' },
	questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
	questionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
	questionHint: { fontSize: 12, color: '#666', marginBottom: 8, fontStyle: 'italic' },
	typeToggleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
	typeToggle: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#EEE', borderRadius: 6, borderWidth: 1, borderColor: '#DDD' },
	typeToggleActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
	typeToggleText: { fontSize: 11, fontWeight: '600', color: '#666' },
	typeToggleTextActive: { color: '#fff' },
	categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
	categoryTag: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#E8F5E9', borderRadius: 6, fontSize: 12, fontWeight: '600', color: '#2E7D32' },
	addCategoryRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
	categoryInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#DDD', fontSize: 12 },
	addButton: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#4CAF50', borderRadius: 6 },
	addButtonText: { fontSize: 12, fontWeight: '700', color: '#fff' },
	customCategoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
	customCategoryTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#FFF3E0', borderRadius: 6, borderWidth: 1, borderColor: '#FF9800' },
	customCategoryText: { fontSize: 12, fontWeight: '600', color: '#E65100' },
	removeX: { marginLeft: 6, fontSize: 14, color: '#E65100', fontWeight: '700' },
	triviaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#EEE' },
	triviaLabel: { fontSize: 13, fontWeight: '600', color: '#333', flex: 1 },
	triviaButtons: { flexDirection: 'row', gap: 4 },
	triviaBtn: { width: 32, height: 32, borderRadius: 4, backgroundColor: '#EEE', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDD' },
	triviaBtnActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
	triviaBtnText: { fontSize: 12, fontWeight: '700', color: '#333' },
	journalOptions: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
	journalOption: { paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#DDD' },
	journalOptionActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
	journalOptionText: { fontSize: 12, fontWeight: '600', color: '#333' },
	journalOptionTextActive: { color: '#fff' },
	templateInput: { padding: 8, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#DDD', fontSize: 12, minHeight: 60, marginTop: 6 },
	// Tutorial button
	tutorialButton: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#1976D2', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
	tutorialButtonText: { color: '#fff', fontWeight: '700' },
});
