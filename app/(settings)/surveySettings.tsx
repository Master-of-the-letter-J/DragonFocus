import { FUN_FACT_CATEGORY_OPTIONS, PROMPT_CATEGORY_OPTIONS, SURVEY_QUESTION_OPTIONS, TRIVIA_CATEGORY_OPTIONS, useQuestions, type PromptTarget, type SurveyOrderType, type SurveyQuestionKey } from '@/context/QuestionProvider';
import { useSurvey } from '@/context/SurveyProvider';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

const COUNT_OPTIONS = [0, 1, 2, 3] as const;
const ONE_TO_THREE_OPTIONS = [1, 2, 3] as const;
const JOURNAL_OPTIONS = ['none', 'morning', 'night', 'both'] as const;
const PROMPT_TARGET_OPTIONS = ['morning', 'night', 'both'] as const;

export default function SurveySettings() {
	const router = useRouter();
	const survey = useSurvey();
	const questions = useQuestions();

	const [habitCategoryInput, setHabitCategoryInput] = useState('');
	const [todoCategoryInput, setTodoCategoryInput] = useState('');
	const [customPromptInput, setCustomPromptInput] = useState('');
	const [customPromptTarget, setCustomPromptTarget] = useState<PromptTarget>('night');
	const [customPromptRandomized, setCustomPromptRandomized] = useState(false);
	const [customEmojiInput, setCustomEmojiInput] = useState('');
	const [customEmotionLabel, setCustomEmotionLabel] = useState('');
	const [customEmotionFury, setCustomEmotionFury] = useState('0');

	const promptMorningCount = survey.options.randomPromptMorningCount ?? survey.options.randomPromptCount ?? 1;
	const promptNightCount = survey.options.randomPromptNightCount ?? survey.options.randomPromptCount ?? 1;

	const habitCategories = useMemo(() => [...questions.questionSettings.habitGoals.suggestedCategories, ...questions.questionSettings.habitGoals.customCategories], [questions.questionSettings.habitGoals.customCategories, questions.questionSettings.habitGoals.suggestedCategories]);
	const todoCategories = useMemo(() => [...questions.questionSettings.todoGoals.suggestedCategories, ...questions.questionSettings.todoGoals.customCategories], [questions.questionSettings.todoGoals.customCategories, questions.questionSettings.todoGoals.suggestedCategories]);

	const addCustomPrompt = () => {
		if (!customPromptInput.trim()) return;
		questions.addCustomPrompt({
			id: `prompt_${Date.now()}`,
			text: customPromptInput.trim(),
			randomized: customPromptRandomized,
			appliesTo: customPromptTarget,
			custom: true,
		});
		setCustomPromptInput('');
		setCustomPromptTarget('night');
		setCustomPromptRandomized(false);
	};

	const addCustomEmotion = () => {
		const furyChange = Number.parseInt(customEmotionFury, 10);
		if (!customEmojiInput.trim() || !customEmotionLabel.trim() || Number.isNaN(furyChange)) return;
		questions.addCustomEmotion({
			id: `emotion_${Date.now()}`,
			emoji: customEmojiInput.trim(),
			description: customEmotionLabel.trim(),
			furyChange,
			custom: true,
		});
		setCustomEmojiInput('');
		setCustomEmotionLabel('');
		setCustomEmotionFury('0');
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Survey Settings</Text>
			<Text style={styles.subtitle}>Changes apply immediately and the morning/night surveys will use the new settings without needing a separate save button.</Text>

			<Pressable style={styles.tutorialButton} onPress={() => router.push('/survey/tutorial' as any)}>
				<Text style={styles.tutorialButtonText}>Open Full Tutorial</Text>
			</Pressable>

			<SurveyOrderGrid />

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Survey Flow</Text>
				<Text style={styles.helper}>These are the same enabled states used by the reorder controls above.</Text>
				<ToggleRow label="Mood question" value={questions.questionSettings.mood.enabled} onValueChange={value => questions.setQuestionEnabled('mood', value)} />
				<ToggleRow label="Habit goals" value={questions.questionSettings.habitGoals.enabled} onValueChange={value => questions.setQuestionEnabled('habitGoals', value)} />
				<ToggleRow label="To-do goals" value={questions.questionSettings.todoGoals.enabled} onValueChange={value => questions.setQuestionEnabled('todoGoals', value)} />
				<ToggleRow label="Short-answer prompts" value={questions.questionSettings.prompts.enabled} onValueChange={value => questions.setQuestionEnabled('prompts', value)} />
				<ToggleRow label="Trivia questions" value={questions.questionSettings.trivia.enabled} onValueChange={value => questions.setQuestionEnabled('trivia', value)} />
				<ToggleRow label="Fun facts" value={questions.questionSettings.funFacts.enabled} onValueChange={value => questions.setQuestionEnabled('funFacts', value)} />
				<ToggleRow label="Journal entry" value={questions.questionSettings.journalEntry.enabled} onValueChange={value => questions.setQuestionEnabled('journalEntry', value)} />
				<ToggleRow label="Quotes" value={questions.questionSettings.quotes.enabled} onValueChange={value => questions.setQuestionEnabled('quotes', value)} />
				<ToggleRow label="Advice" value={questions.questionSettings.advice.enabled} onValueChange={value => questions.setQuestionEnabled('advice', value)} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Advice & Quotes</Text>
				<Text style={styles.helper}>These toggles shape the survey advice and quote pools.</Text>
				<SegmentRow label="Morning quotes on one page" value={questions.questionSettings.quotes.morningCount} options={ONE_TO_THREE_OPTIONS} onSelect={count => questions.setQuoteCount(count, questions.questionSettings.quotes.nightCount)} />
				<SegmentRow label="Evening quotes on one page" value={questions.questionSettings.quotes.nightCount} options={ONE_TO_THREE_OPTIONS} onSelect={count => questions.setQuoteCount(questions.questionSettings.quotes.morningCount, count)} />
				<ToggleRow label="Inspirational advice" value={questions.questionSettings.advice.types.inspirational} onValueChange={() => questions.updateAdviceSettings({ ...questions.questionSettings.advice.types, inspirational: !questions.questionSettings.advice.types.inspirational })} />
				<ToggleRow label="Witty advice" value={questions.questionSettings.advice.types.witty} onValueChange={() => questions.updateAdviceSettings({ ...questions.questionSettings.advice.types, witty: !questions.questionSettings.advice.types.witty })} />
				<ToggleRow label="Philosophical advice" value={questions.questionSettings.advice.types.philosophical} onValueChange={() => questions.updateAdviceSettings({ ...questions.questionSettings.advice.types, philosophical: !questions.questionSettings.advice.types.philosophical })} />
				<ToggleRow label="Inspirational quotes" value={questions.questionSettings.quotes.types.inspirational} onValueChange={() => questions.updateQuotesSettings({ ...questions.questionSettings.quotes.types, inspirational: !questions.questionSettings.quotes.types.inspirational })} />
				<ToggleRow label="Witty quotes" value={questions.questionSettings.quotes.types.witty} onValueChange={() => questions.updateQuotesSettings({ ...questions.questionSettings.quotes.types, witty: !questions.questionSettings.quotes.types.witty })} />
				<ToggleRow label="Philosophical quotes" value={questions.questionSettings.quotes.types.philosophical} onValueChange={() => questions.updateQuotesSettings({ ...questions.questionSettings.quotes.types, philosophical: !questions.questionSettings.quotes.types.philosophical })} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Prompt Counts & Categories</Text>
				<Text style={styles.helper}>Morning and night prompt counts are separate now, matching the Dragon Focus survey spec more closely.</Text>
				<SegmentRow label="Morning random prompts" value={promptMorningCount} options={COUNT_OPTIONS} onSelect={count => survey.setOption('randomPromptMorningCount', count)} />
				<SegmentRow label="Night random prompts" value={promptNightCount} options={COUNT_OPTIONS} onSelect={count => survey.setOption('randomPromptNightCount', count)} />
				<View style={styles.tagRow}>
					{PROMPT_CATEGORY_OPTIONS.map(option => (
						<TogglePill key={option.key} label={option.label} active={questions.questionSettings.prompts.types[option.key]} onPress={() => questions.togglePromptCategory(option.key)} />
					))}
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Custom Prompts</Text>
				<Text style={styles.helper}>Fixed prompts always appear in the chosen survey. Randomized prompts join the prompt pool for that survey target.</Text>
				<TextInput value={customPromptInput} onChangeText={setCustomPromptInput} placeholder="Write a custom prompt" style={[styles.input, styles.multilineInput]} multiline />
				<SegmentRow label="Prompt target" value={customPromptTarget} options={PROMPT_TARGET_OPTIONS} onSelect={value => setCustomPromptTarget(value)} />
				<ToggleRow label="Add as randomized pool prompt" value={customPromptRandomized} onValueChange={setCustomPromptRandomized} />
				<Pressable style={styles.addButton} onPress={addCustomPrompt}>
					<Text style={styles.addButtonText}>Add Custom Prompt</Text>
				</Pressable>

				{questions.questionSettings.prompts.customPrompts.map(prompt => (
					<View key={prompt.id} style={styles.listCard}>
						<Text style={styles.listTitle}>{prompt.text}</Text>
						<Text style={styles.listMeta}>
							{prompt.appliesTo} | {prompt.randomized ? 'randomized' : 'fixed'}
						</Text>
						{prompt.custom && (
							<Pressable style={styles.removeButton} onPress={() => questions.removeCustomPrompt(prompt.id)}>
								<Text style={styles.removeButtonText}>Remove</Text>
							</Pressable>
						)}
					</View>
				))}
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Trivia</Text>
				<SegmentRow label="Morning Trivia Number of Questions" value={questions.questionSettings.trivia.morningCount} options={COUNT_OPTIONS} onSelect={count => questions.setTriviaCount(count, questions.questionSettings.trivia.nightCount)} />
				<SegmentRow label="Evening Trivia Number of Questions" value={questions.questionSettings.trivia.nightCount} options={COUNT_OPTIONS} onSelect={count => questions.setTriviaCount(questions.questionSettings.trivia.morningCount, count)} />
				<View style={styles.tagRow}>
					{TRIVIA_CATEGORY_OPTIONS.map(option => (
						<TogglePill key={option.key} label={option.label} active={questions.questionSettings.trivia.types[option.key]} onPress={() => questions.toggleTriviaCategory(option.key)} />
					))}
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Fun Facts</Text>
				<Text style={styles.helper}>Fun facts are lightweight survey cards. You can show up to three facts on the same page.</Text>
				<SegmentRow label="Morning fun facts" value={questions.questionSettings.funFacts.morningCount} options={COUNT_OPTIONS} onSelect={count => questions.setFunFactCount(count, questions.questionSettings.funFacts.nightCount)} />
				<SegmentRow label="Evening fun facts" value={questions.questionSettings.funFacts.nightCount} options={COUNT_OPTIONS} onSelect={count => questions.setFunFactCount(questions.questionSettings.funFacts.morningCount, count)} />
				<View style={styles.tagRow}>
					{FUN_FACT_CATEGORY_OPTIONS.map(option => (
						<TogglePill key={option.key} label={option.label} active={questions.questionSettings.funFacts.types[option.key]} onPress={() => questions.updateFunFactsSettings({ ...questions.questionSettings.funFacts.types, [option.key]: !questions.questionSettings.funFacts.types[option.key] })} />
					))}
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Mood Options</Text>
				<Text style={styles.helper}>Custom emotions are used directly by the mood question and can shift fury by up to +/-8.</Text>
				<View style={styles.inlineInputs}>
					<TextInput value={customEmojiInput} onChangeText={setCustomEmojiInput} placeholder="Emoji" style={[styles.input, styles.shortInput]} />
					<TextInput value={customEmotionLabel} onChangeText={setCustomEmotionLabel} placeholder="Label" style={styles.input} />
					<TextInput value={customEmotionFury} onChangeText={setCustomEmotionFury} placeholder="Fury" keyboardType="number-pad" style={[styles.input, styles.shortInput]} />
				</View>
				<Pressable style={styles.addButton} onPress={addCustomEmotion}>
					<Text style={styles.addButtonText}>Add Custom Emotion</Text>
				</Pressable>

				<View style={styles.moodOptionGrid}>
					{questions.questionSettings.mood.customEmotions.map(emotion => (
						<View key={emotion.id} style={styles.moodOptionBox}>
							<Text style={styles.moodEmoji}>{emotion.emoji}</Text>
							<Text style={styles.moodName}>{emotion.description}</Text>
							<Text style={styles.listMeta}>
								Fury {emotion.furyChange >= 0 ? '+' : ''}
								{emotion.furyChange}
							</Text>
							{emotion.custom && (
								<Pressable style={styles.removeButton} onPress={() => questions.removeCustomEmotion(emotion.id)}>
									<Text style={styles.removeButtonText}>Remove</Text>
								</Pressable>
							)}
						</View>
					))}
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Goal Categories</Text>
				<Text style={styles.helper}>Habit and to-do suggestion pools use these lists.</Text>
				<Text style={styles.groupTitle}>Habit categories</Text>
				<View style={styles.tagRow}>
					{habitCategories.map(category => (
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
						style={styles.sideButton}
						onPress={() => {
							questions.addHabitCategory(habitCategoryInput);
							setHabitCategoryInput('');
						}}>
						<Text style={styles.sideButtonText}>Add</Text>
					</Pressable>
				</View>

				<Text style={styles.groupTitle}>To-Do categories</Text>
				<View style={styles.tagRow}>
					{todoCategories.map(category => (
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
						style={styles.sideButton}
						onPress={() => {
							questions.addTodoCategory(todoCategoryInput);
							setTodoCategoryInput('');
						}}>
						<Text style={styles.sideButtonText}>Add</Text>
					</Pressable>
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Journal Placement</Text>
				<Text style={styles.helper}>Choose where the journal prompt shows up in the survey flow.</Text>
				<SegmentRow label="Journal location" value={questions.questionSettings.journalEntry.setting} options={JOURNAL_OPTIONS} onSelect={option => questions.setJournalEntry(option, questions.questionSettings.journalEntry.template)} />
				<TextInput value={questions.questionSettings.journalEntry.template} onChangeText={value => questions.setJournalEntry(questions.questionSettings.journalEntry.setting, value)} placeholder="Optional journal prompt template" style={[styles.input, styles.multilineInput]} multiline />
			</View>
		</ScrollView>
	);
}

function getQuestionLabel(key: SurveyQuestionKey, surveyType: SurveyOrderType) {
	const option = SURVEY_QUESTION_OPTIONS.find(item => item.key === key);
	if (!option) return key;
	return surveyType === 'morning' ? (option.morningLabel ?? option.label) : (option.nightLabel ?? option.label);
}

function SurveyOrderGrid() {
	const questions = useQuestions();
	return (
		<View style={styles.card}>
			<View style={styles.cardTitleRow}>
				<Text style={styles.cardTitleNoMargin}>Survey Question Order</Text>
				<Text style={styles.cardMeta}>Hold + drag</Text>
			</View>
			<View style={styles.orderColumns}>
				<SurveyOrderColumn surveyType="morning" title="Morning" order={questions.questionSettings.morningOrder} />
				<SurveyOrderColumn surveyType="night" title="Evening" order={questions.questionSettings.nightOrder} />
			</View>
		</View>
	);
}

function SurveyOrderColumn({ surveyType, title, order }: { surveyType: SurveyOrderType; title: string; order: SurveyQuestionKey[] }) {
	const questions = useQuestions();

	const renderQuestion = ({ item, drag, isActive, getIndex }: RenderItemParams<SurveyQuestionKey>) => {
		const index = getIndex?.() ?? 0;
		const enabled = questions.questionSettings[item].enabled;
		return (
			<ScaleDecorator>
				<Pressable onLongPress={drag} delayLongPress={120} style={[styles.orderItem, isActive ? styles.orderItemActive : null, !enabled ? styles.orderItemDisabled : null]}>
					<View style={styles.orderItemHeader}>
						<Text style={styles.orderHandle}>::</Text>
						<Text style={styles.orderLabel}>{getQuestionLabel(item, surveyType)}</Text>
						<Switch value={enabled} onValueChange={value => questions.setQuestionEnabled(item, value)} />
					</View>
					<View style={styles.orderActions}>
						<Pressable style={styles.orderMoveButton} onPress={() => questions.moveSurveyQuestion(surveyType, index, index - 1)} disabled={index <= 0}>
							<Text style={[styles.orderMoveText, index <= 0 ? styles.orderMoveTextDisabled : null]}>Up</Text>
						</Pressable>
						<Pressable style={styles.orderMoveButton} onPress={() => questions.moveSurveyQuestion(surveyType, index, index + 1)} disabled={index >= order.length - 1}>
							<Text style={[styles.orderMoveText, index >= order.length - 1 ? styles.orderMoveTextDisabled : null]}>Down</Text>
						</Pressable>
					</View>
				</Pressable>
			</ScaleDecorator>
		);
	};

	return (
		<View style={styles.orderColumn}>
			<Text style={styles.orderColumnTitle}>{title}</Text>
			<View style={styles.orderPanel}>
				<DraggableFlatList data={order} keyExtractor={item => item} renderItem={renderQuestion} onDragEnd={({ data }) => questions.setSurveyQuestionOrder(surveyType, data)} activationDistance={8} scrollEnabled={false} />
				<View style={styles.resultsRow}>
					<Text style={styles.orderHandle}>--</Text>
					<Text style={styles.orderLabel}>Results</Text>
					<Text style={styles.cardMeta}>Always last</Text>
				</View>
			</View>
		</View>
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

function SegmentRow<T extends string | number>({ label, value, options, onSelect }: { label: string; value: T; options: readonly T[]; onSelect: (value: T) => void }) {
	return (
		<View style={styles.inlineRow}>
			<Text style={styles.inlineLabel}>{label}</Text>
			<View style={styles.segmentRow}>
				{options.map(option => (
					<Pressable key={String(option)} style={[styles.segmentButton, value === option && styles.segmentActive]} onPress={() => onSelect(option)}>
						<Text style={[styles.segmentText, value === option && styles.segmentTextActive]}>{String(option)}</Text>
					</Pressable>
				))}
			</View>
		</View>
	);
}

function TogglePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
	return (
		<Pressable style={[styles.segmentButton, active && styles.segmentActive]} onPress={onPress}>
			<Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
		</Pressable>
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
	cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 },
	cardTitleNoMargin: { fontSize: 18, fontWeight: '800', color: '#111827' },
	cardMeta: { fontSize: 11, color: '#6B7280', fontWeight: '700' },
	helper: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 12 },
	orderColumns: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
	orderColumn: { flex: 1, minWidth: 0 },
	orderColumnTitle: { fontSize: 13, fontWeight: '900', color: '#374151', marginBottom: 6 },
	orderPanel: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#E5E7EB' },
	orderItem: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, marginBottom: 8 },
	orderItemActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
	orderItemDisabled: { opacity: 0.55 },
	orderItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	orderHandle: { color: '#6B7280', fontWeight: '900', letterSpacing: 0 },
	orderLabel: { flex: 1, color: '#111827', fontWeight: '800' },
	orderActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
	orderMoveButton: { paddingVertical: 5, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
	orderMoveText: { fontSize: 11, color: '#374151', fontWeight: '800' },
	orderMoveTextDisabled: { color: '#9CA3AF' },
	resultsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#BBF7D0' },
	toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
	toggleLabel: { flex: 1, paddingRight: 12, color: '#374151', fontWeight: '600' },
	inlineRow: { marginBottom: 14 },
	inlineLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
	segmentRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
	segmentButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff' },
	segmentActive: { backgroundColor: '#166534', borderColor: '#166534' },
	segmentText: { color: '#4B5563', fontWeight: '700', textTransform: 'capitalize' },
	segmentTextActive: { color: '#fff' },
	input: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', color: '#111827' },
	multilineInput: { minHeight: 80, textAlignVertical: 'top' },
	inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
	inlineInputs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
	shortInput: { flexBasis: 76, flexGrow: 0 },
	addButton: { alignSelf: 'flex-start', backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
	addButtonText: { color: '#fff', fontWeight: '800' },
	sideButton: { backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center' },
	sideButtonText: { color: '#fff', fontWeight: '800' },
	groupTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 8, marginTop: 6 },
	tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
	tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#F3F4F6' },
	tagText: { color: '#374151', fontWeight: '700' },
	removeText: { color: '#DC2626', fontWeight: '800' },
	listCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 10, backgroundColor: '#FAFAFA' },
	moodOptionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' },
	moodOptionBox: { minWidth: 76, maxWidth: 112, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' },
	moodEmoji: { width: '100%', fontSize: 22, marginBottom: 4, textAlign: 'center' },
	moodName: { fontSize: 11, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 4 },
	listTitle: { fontWeight: '700', color: '#111827', marginBottom: 4 },
	listMeta: { color: '#6B7280', marginBottom: 8, textTransform: 'capitalize' },
	removeButton: { alignSelf: 'flex-start', backgroundColor: '#FEE2E2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
	removeButtonText: { color: '#B91C1C', fontWeight: '800' },
});
