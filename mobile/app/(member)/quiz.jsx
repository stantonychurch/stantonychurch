import { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerContext } from './_layout';
import { getQuiz } from '../../src/services/api';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { useLanguage } from '../../src/context/LanguageContext';

export default function QuizScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Game states: 'start', 'playing', 'result'
  const [gameState, setGameState] = useState('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const res = await getQuiz();
      setQuestions(res.data || []);
    } catch (_) {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function startQuiz() {
    setScore(0);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setGameState('playing');
  }

  function handleAnswer(opt) {
    if (answered) return;
    setSelectedOption(opt);
    setAnswered(true);
    const correct = questions[currentIndex].correct_answer.toLowerCase();
    if (opt.toLowerCase() === correct) {
      setScore(s => s + 1);
    }
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length && currentIndex < 9) { // limit to 10 questions per run
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setGameState('result');
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeLoading}>
        <ActivityIndicator size="large" color={Colors.gold} />
        <Text style={styles.loadingText}>{t('preparing_quiz')}</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = Math.min(questions.length, 10);

  return (
    <SafeAreaView style={styles.safe}>
      {gameState === 'start' && (
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{t('back_to_church')}</Text>
          </TouchableOpacity>
          <Text style={styles.icon}>🧠</Text>
          <Text style={styles.title}>{t('bible_quiz')}</Text>
          <Text style={styles.subtitle}>{t('test_knowledge')}</Text>
          
          <View style={styles.rulesCard}>
            <Text style={styles.rule}>{t('quiz_rule_1')}</Text>
            <Text style={styles.rule}>{t('quiz_rule_2')}</Text>
            <Text style={styles.rule}>{t('quiz_rule_3')}</Text>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={startQuiz}>
            <Text style={styles.actionBtnText}>{t('start_quiz')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === 'playing' && currentQuestion && (
        <View style={styles.container}>
          <View style={styles.quizHeader}>
            <Text style={styles.progressText}>{t('question')} {currentIndex + 1} {t('of')} {totalQuestions}</Text>
            <Text style={styles.scoreText}>{t('score')}: {score}</Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionCategory}>{currentQuestion.category || 'General'} • {currentQuestion.difficulty || 'Medium'}</Text>
            <Text style={styles.questionText}>{lang === 'ta' && currentQuestion.question_tamil ? currentQuestion.question_tamil : currentQuestion.question}</Text>
          </View>

          <View style={styles.options}>
            {[
              { key: 'a', val: lang === 'ta' && currentQuestion.option_a_tamil ? currentQuestion.option_a_tamil : currentQuestion.option_a },
              { key: 'b', val: lang === 'ta' && currentQuestion.option_b_tamil ? currentQuestion.option_b_tamil : currentQuestion.option_b },
              { key: 'c', val: lang === 'ta' && currentQuestion.option_c_tamil ? currentQuestion.option_c_tamil : currentQuestion.option_c },
              { key: 'd', val: lang === 'ta' && currentQuestion.option_d_tamil ? currentQuestion.option_d_tamil : currentQuestion.option_d },
            ].map(opt => {
              const isSelected = selectedOption === opt.key;
              const isCorrectOpt = opt.key.toLowerCase() === currentQuestion.correct_answer.toLowerCase();
              let btnStyle = styles.optionBtn;
              let txtStyle = styles.optionText;

              if (answered) {
                if (isCorrectOpt) {
                  btnStyle = [styles.optionBtn, styles.optionBtnCorrect];
                  txtStyle = [styles.optionText, styles.optionTextCorrect];
                } else if (isSelected) {
                  btnStyle = [styles.optionBtn, styles.optionBtnWrong];
                  txtStyle = [styles.optionText, styles.optionTextWrong];
                } else {
                  btnStyle = [styles.optionBtn, styles.optionBtnDisabled];
                }
              }

              return (
                <TouchableOpacity 
                  key={opt.key} 
                  style={btnStyle} 
                  onPress={() => handleAnswer(opt.key)} 
                  disabled={answered}
                  activeOpacity={0.7}
                >
                  <Text style={txtStyle}>{opt.key.toUpperCase()}. {opt.val}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {answered && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleNext}>
              <Text style={styles.actionBtnText}>
                {currentIndex + 1 < totalQuestions ? t('next_question') : t('view_results')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {gameState === 'result' && (
        <View style={styles.container}>
          <Text style={styles.icon}>🏆</Text>
          <Text style={styles.title}>{t('quiz_completed')}</Text>
          <Text style={styles.subtitle}>{t('you_scored')} {score} {t('out_of')} {totalQuestions}</Text>

          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackText}>
              {score === totalQuestions 
                ? t('feedback_excellent')
                : score >= totalQuestions * 0.7 
                ? t('feedback_great') 
                : t('feedback_good')}
            </Text>
          </View>

          <TouchableOpacity style={styles.actionBtn} onPress={startQuiz}>
            <Text style={styles.actionBtnText}>{t('play_again')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setGameState('start')}>
            <Text style={styles.secondaryBtnText}>{t('back_to_quiz_home')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuBtn: { padding: 4, marginRight: 8, alignSelf: 'center' },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },
  safe: { flex: 1, backgroundColor: Colors.dark },
  safeLoading: { flex: 1, backgroundColor: Colors.dark, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: Spacing.md, fontSize: 15 },
  container: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.full, marginBottom: Spacing.xl },
  backText: { color: Colors.textMuted, fontSize: 14 },
  icon: { fontSize: 60, textAlign: 'center', marginBottom: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl },
  
  rulesCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.xl },
  rule: { fontSize: 14, color: Colors.text, marginBottom: 8, lineHeight: 20 },
  
  actionBtn: { backgroundColor: Colors.gold, paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.md },
  actionBtnText: { color: Colors.dark, fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.sm, borderWidth: 1, borderColor: Colors.glassBorder },
  secondaryBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },

  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md, alignItems: 'center' },
  progressText: { color: Colors.textMuted, fontSize: 14 },
  scoreText: { color: Colors.gold, fontSize: 16, fontWeight: '700' },

  questionCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  questionCategory: { fontSize: 10, fontWeight: '700', color: Colors.gold, letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' },
  questionText: { fontSize: 17, fontWeight: '700', color: Colors.text, lineHeight: 26 },

  options: { marginBottom: Spacing.md },
  optionBtn: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 10 },
  optionBtnCorrect: { backgroundColor: 'rgba(46,204,113,0.15)', borderColor: Colors.success },
  optionBtnWrong: { backgroundColor: 'rgba(231,76,60,0.15)', borderColor: Colors.error },
  optionBtnDisabled: { opacity: 0.4 },
  optionText: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  optionTextCorrect: { color: Colors.success, fontWeight: '700' },
  optionTextWrong: { color: Colors.error, fontWeight: '700' },

  feedbackCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.xl, alignItems: 'center' },
  feedbackText: { color: Colors.text, fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
