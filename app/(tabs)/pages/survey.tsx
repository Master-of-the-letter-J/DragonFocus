import { Text, View } from '@/components/Themed';
import { useDragonCoins } from '@/context/DragonCoinsProvider';
import { useDragon } from '@/context/DragonProvider';
import { useFury } from '@/context/FuryProvider';
import { useJournal } from '@/context/JournalProvider';
import { useScarLevel } from '@/context/ScarLevelProvider';
import { useStreak } from '@/context/StreakProvider';
import { useSurvey } from '@/context/SurveyProvider';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

type SurveyType = 'morning' | 'night' | null;

export default function SurveyPage() {
  const [activeSurvey, setActiveSurvey] = useState<SurveyType>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const survey = useSurvey();
  const streak = useStreak();
  const coins = useDragonCoins();
  const dragon = useDragon();
  const scarLevel = useScarLevel();
  const fury = useFury();
  const journal = useJournal();

  const isPremium = false; // TODO: Add premium check

  const surveyQuestions = [
    { question: 'How did you sleep?', type: 'scale' },
    { question: 'What is your current mood?', type: 'scale' },
    { question: 'Any goals for today?', type: 'text' },
  ];

  const totalQuestions = surveyQuestions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleStartSurvey = (type: 'morning' | 'night') => {
    if (type === 'morning' && survey.canTakeMorningSurvey()) {
      setActiveSurvey('morning');
      setCurrentQuestion(0);
    } else if (type === 'night' && survey.canTakeNightSurvey()) {
      setActiveSurvey('night');
      setCurrentQuestion(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeSurvey();
    }
  };

  const completeSurvey = () => {
    if (activeSurvey === 'morning') {
      survey.completeMorningSurvey();
      streak.incrementStreak();
      const coinsEarned = coins.calculateSurveyCoins(true, streak.streak, scarLevel.currentScarLevel, isPremium);
      coins.addCoins(coinsEarned);
      dragon.addHealthFromSurvey();
      scarLevel.addXP(10); // Award XP for completing survey
      // Add journal entry
      const today = new Date().toISOString().split('T')[0];
      journal.addEntry({
        id: `entry_${today}_morning_${Date.now()}`,
        date: today,
        surveyType: 'morning',
        goalsCompleted: 0,
        schedulePercent: 0,
        rewards: { coins: coinsEarned, xp: 10, fury: 0 },
      });
    } else if (activeSurvey === 'night') {
      survey.completeNightSurvey();
      streak.incrementStreak();
      const coinsEarned = coins.calculateSurveyCoins(true, streak.streak, scarLevel.currentScarLevel, isPremium);
      coins.addCoins(coinsEarned);
      dragon.addHealthFromSurvey();
      scarLevel.addXP(10);
      // Add journal entry
      const today = new Date().toISOString().split('T')[0];
      journal.addEntry({
        id: `entry_${today}_night_${Date.now()}`,
        date: today,
        surveyType: 'night',
        goalsCompleted: 0,
        schedulePercent: 0,
        rewards: { coins: coinsEarned, xp: 10, fury: 0 },
      });
    }
    setActiveSurvey(null);
    setCurrentQuestion(0);
  };

  const handleSkipSurvey = () => {
    fury.incrementFuryFromSkippedSurveys(1);
    setActiveSurvey(null);
    setCurrentQuestion(0);
  };

  if (activeSurvey) {
    return (
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{currentQuestion + 1}/{totalQuestions}</Text>
        </View>

        {/* Survey Content */}
        <ScrollView style={styles.surveyContent} contentContainerStyle={styles.surveyContentInner}>
          <Text style={styles.surveyType}>
            {activeSurvey === 'morning' ? '🌅 Morning Survey' : '🌙 Night Survey'}
          </Text>

          <Text style={styles.question}>
            {surveyQuestions[currentQuestion].question}
          </Text>

          {surveyQuestions[currentQuestion].type === 'scale' && (
            <View style={styles.scaleOptions}>
              {[1, 2, 3, 4, 5].map(num => (
                <Pressable key={num} style={styles.scaleButton}>
                  <Text style={styles.scaleButtonText}>{num}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {surveyQuestions[currentQuestion].type === 'text' && (
            <View style={styles.textInputArea}>
              <Text style={styles.inputPlaceholder}>Enter your response...</Text>
            </View>
          )}
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.buttonSkip} onPress={handleSkipSurvey}>
            <Text style={styles.buttonText}>Skip</Text>
          </Pressable>
          <Pressable style={styles.buttonNext} onPress={handleNextQuestion}>
            <Text style={styles.buttonTextPrimary}>
              {currentQuestion === totalQuestions - 1 ? 'Complete' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Surveys</Text>

      <View style={styles.surveySelector}>
        {/* Morning Survey */}
        <Pressable
          style={[styles.surveyCard, survey.canTakeMorningSurvey() ? styles.surveyCardActive : styles.surveyCardCompleted]}
          onPress={() => handleStartSurvey('morning')}
          disabled={!survey.canTakeMorningSurvey()}
        >
          <Text style={styles.surveyCardTitle}>🌅 Morning Survey</Text>
          <View style={styles.surveyProgress}>
            <View style={styles.progressBarSmall}>
              <View style={[styles.progressFillSmall, { width: `${survey.getMorningProgress()}%` }]} />
            </View>
          </View>
          <Text style={styles.surveyCardStatus}>
            {survey.canTakeMorningSurvey() ? 'Ready' : 'Completed'}
          </Text>
        </Pressable>

        {/* Night Survey */}
        <Pressable
          style={[styles.surveyCard, survey.canTakeNightSurvey() ? styles.surveyCardActive : styles.surveyCardCompleted]}
          onPress={() => handleStartSurvey('night')}
          disabled={!survey.canTakeNightSurvey()}
        >
          <Text style={styles.surveyCardTitle}>🌙 Night Survey</Text>
          <View style={styles.surveyProgress}>
            <View style={styles.progressBarSmall}>
              <View style={[styles.progressFillSmall, { width: `${survey.getNightProgress()}%` }]} />
            </View>
          </View>
          <Text style={styles.surveyCardStatus}>
            {survey.canTakeNightSurvey() ? 'Ready' : 'Completed'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  surveyContent: {
    flex: 1,
    marginBottom: 20,
  },
  surveyContentInner: {
    paddingVertical: 20,
  },
  surveyType: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  scaleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  scaleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textInputArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  inputPlaceholder: {
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonSkip: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonNext: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  surveySelector: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  surveyCard: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
  },
  surveyCardActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  surveyCardCompleted: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  surveyCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  surveyProgress: {
    marginBottom: 12,
  },
  progressBarSmall: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  surveyCardStatus: {
    fontSize: 14,
    color: '#666',
  },
});
