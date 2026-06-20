import { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, RefreshControl, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { DrawerContext } from './_layout';
import { getJournal, saveJournal, deleteJournal } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { useLanguage } from '../../src/context/LanguageContext';

export default function JournalScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const { t } = useLanguage();
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Compose state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Grateful');
  const [saving, setSaving] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const moods = [
    { label: t('grateful'), emoji: '🙏' },
    { label: t('hopeful'), emoji: '🌟' },
    { label: t('peaceful'), emoji: '☮️' },
    { label: t('struggling'), emoji: '💔' },
    { label: t('joyful'), emoji: '😊' },
    { label: t('faithful'), emoji: '✝️' }
  ];

  async function load() {
    try {
      const res = await getJournal();
      setEntries(res.data || []);
    } catch (_) {} finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    try {
      // apiClient handles attaching the token and backend handles user ID
      await saveJournal({
        member_id: user?.id,
        title: title.trim(),
        content: content.trim(),
        mood: mood
      });
      setTitle('');
      setContent('');
      setMood('Grateful');
      setIsComposing(false);
      await load();
    } catch (_) {} finally { setSaving(false); }
  }

  async function handleDelete(id) {
    // Call direct API request since we export apiClient
    try {
      const apiClient = require('../../src/services/api').default;
      await apiClient.delete(`/journal/${id}`);
      await load();
    } catch (_) {}
  }

  const moodEmojis = { Grateful:'🙏', Hopeful:'🌟', Peaceful:'☮️', Struggling:'💔', Joyful:'😊', Faithful:'✝️' };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: Colors.gold, fontWeight: 'bold' }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}><View style={{flexDirection: 'row', alignItems: 'center'}}>
          
          <Text style={styles.title}>{t('faith_journal')}</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 16, color: Colors.gold }}>🔙 {t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </View>
        <Text style={styles.subtitle}>{t('spiritual_diary')}</Text>
      </View>

      {isComposing ? (
        <ScrollView contentContainerStyle={styles.composeContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.composeHeaderRow}>
            <Text style={styles.sectionTitle}>{t('new_journal_entry')}</Text>
            <TouchableOpacity onPress={() => setIsComposing(false)}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.inputTitle} 
            placeholder={t('title_optional')} 
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.moodLabel}>{t('how_do_you_feel')}</Text>
          <View style={styles.moodGrid}>
            {moods.map(m => (
              <TouchableOpacity 
                key={m.label} 
                style={[styles.moodBtn, mood === m.label && styles.moodBtnActive]}
                onPress={() => setMood(m.label)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodText, mood === m.label && styles.moodTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput 
            style={styles.inputContent} 
            placeholder={t('write_thoughts')} 
            placeholderTextColor="#888"
            multiline
            numberOfLines={8}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.saveBtn, (!content.trim() || saving) && styles.saveBtnDisabled]} 
            onPress={handleSave}
            disabled={!content.trim() || saving}
          >
            {saving ? <ActivityIndicator color={Colors.dark} /> : <Text style={styles.saveBtnText}>{t('save_entry')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.flexContainer}>
          <ScrollView
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={Colors.gold} />}
          >
            {entries.map(entry => {
              const currentMoodLabel = moods.find(m => m.emoji === moodEmojis[entry.mood] || m.label === entry.mood)?.label || entry.mood;
              return (
              <View key={entry.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardMood}>{moodEmojis[entry.mood] || '📝'} {currentMoodLabel}</Text>
                  <Text style={styles.cardDate}>
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''}
                  </Text>
                </View>
                {entry.title ? <Text style={styles.cardTitle}>{entry.title}</Text> : null}
                <Text style={styles.cardContent}>{entry.content}</Text>
                <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>{t('delete_entry')}</Text>
                </TouchableOpacity>
              </View>
              );
            })}
            {!loading && entries.length === 0 && <Text style={styles.empty}>{t('journal_empty')}</Text>}
            <View style={{ height: 80 }} />
          </ScrollView>

          <TouchableOpacity style={styles.fab} onPress={() => setIsComposing(true)}>
            <Text style={styles.fabText}>{t('new_entry_btn')}</Text>
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
  flexContainer: { flex: 1 },
  header: { padding: Spacing.md, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  backBtnSmall: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.sm },
  backTextSmall: { color: Colors.textMuted, fontSize: 12 },
  
  composeContainer: { padding: Spacing.md },
  composeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  cancelText: { color: Colors.error, fontSize: 14, fontWeight: '600' },
  
  inputTitle: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 12, color: Colors.text, fontSize: 16, marginBottom: Spacing.md },
  moodLabel: { fontSize: 13, fontWeight: '600', color: Colors.textMuted, marginBottom: 8 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  moodBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  moodBtnActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  moodEmoji: { fontSize: 14, marginRight: 4 },
  moodText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  moodTextActive: { color: Colors.dark, fontWeight: '700' },
  
  inputContent: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 12, color: Colors.text, fontSize: 15, height: 180, marginBottom: Spacing.md },
  
  saveBtn: { backgroundColor: Colors.gold, paddingVertical: 16, borderRadius: Radius.md, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.dark, fontSize: 16, fontWeight: '700' },

  list: { padding: Spacing.md },
  card: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardMood: { fontSize: 11, fontWeight: '700', color: Colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardDate: { fontSize: 12, color: Colors.textDim },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  cardContent: { fontSize: 14, color: Colors.textMuted, lineHeight: 22, marginBottom: Spacing.sm },
  deleteBtn: { alignSelf: 'flex-end', paddingVertical: 4, paddingHorizontal: 8 },
  deleteText: { color: Colors.error, fontSize: 12, fontWeight: '600' },
  empty: { textAlign: 'center', color: Colors.textDim, fontStyle: 'italic', paddingTop: 60 },
  
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: Colors.gold, paddingHorizontal: 20, paddingVertical: 14, borderRadius: Radius.full, shadowColor: Colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabText: { color: Colors.dark, fontWeight: '700', fontSize: 15 },
});
