import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../../../src/config/theme';
import apiClient from '../../../src/services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../../src/context/LanguageContext';
import * as DocumentPicker from 'expo-document-picker';
import { Video, ResizeMode } from 'expo-av';
import { API_BASE_URL } from '../../../src/config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function FamilyDashboardScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [candleRes, postsRes] = await Promise.all([
        apiClient.get(`/platform/family/${id}/candle`),
        apiClient.get(`/platform/family/${id}/posts`)
      ]);
      setStats(candleRes?.data?.stats || null);
      setHistory(candleRes?.data?.history || []);
      setPosts(postsRes?.data || []);
    } catch (e) {
      console.log(e);
      Alert.alert(t('error'), t('failed_to_load_family'));
    } finally {
      setLoading(false);
    }
  }

  async function submitPost() {
    if (!newPost.trim() && !selectedFile) return;
    setSubmittingPost(true);
    try {
      const formData = new FormData();
      if (newPost.trim()) formData.append('content', newPost.trim());
      if (selectedFile) {
        formData.append('media', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || 'application/octet-stream'
        });
      }
      await apiClient.post(`/platform/family/${id}/post`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000
      });
      setNewPost('');
      setSelectedFile(null);
      loadData();
    } catch (e) {
      Alert.alert(t('error'), t('failed_to_post'));
    } finally {
      setSubmittingPost(false);
    }
  }

  if (loading) {
    return <SafeAreaView style={styles.safe}><ActivityIndicator color={Colors.gold} style={{marginTop: 50}} /></SafeAreaView>;
  }

  // Generate Weekly String
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // For simplicity, we just map recent history based on today
  const today = new Date();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('family_dashboard')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* PRAYER GAMIFICATION CARD */}
        <LinearGradient colors={['#241a0d', '#1a1209']} style={styles.candleCard}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View>
              <Text style={styles.candleTitle}>{t('family_prayer_progress')}</Text>
              <Text style={styles.candleSub}>{t('strengthen_bond')}</Text>
            </View>
            <Text style={{fontSize: 32}}>🕯️</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats?.candles_completed || 0}</Text>
              <Text style={styles.statLabel}>{t('completed')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats?.prayer_hours ? Number(stats.prayer_hours).toFixed(1) : '0.0'}</Text>
              <Text style={styles.statLabel}>{t('hours')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats?.family_streak || 0} 🔥</Text>
              <Text style={styles.statLabel}>{t('day_streak')}</Text>
            </View>
          </View>

          <View style={styles.currentCandleContainer}>
            <Text style={styles.currentCandleText}>
              {t('current_candle')} {stats?.current_candle_minutes || 0} / 30 {t('mins')}
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(((stats?.current_candle_minutes || 0) / 30) * 100, 100)}%` }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={() => router.push(`/(member)/prayer_room/${id}`)}>
            <LinearGradient colors={[Colors.goldLight, Colors.gold]} style={styles.startBtnGradient} start={{x:0, y:0}} end={{x:1, y:0}}>
              <Text style={styles.startBtnText}>{t('start_family_prayer')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* FEED SECTION */}
        <Text style={styles.sectionTitle}>{t('family_feed')}</Text>
        <Text style={{color: Colors.textDim, fontSize: 12, marginBottom: 10}}>{t('share_notes')}</Text>
        
        <View style={styles.postBox}>
          <TextInput 
            style={styles.postInput} 
            placeholder={t('share_something')} 
            placeholderTextColor={Colors.textDim}
            multiline
            value={newPost}
            onChangeText={setNewPost}
          />
          
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
            <TouchableOpacity 
              style={[{paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.sm}, selectedFile ? {backgroundColor: Colors.gold} : {backgroundColor: 'rgba(255,255,255,0.06)'}]} 
              onPress={async () => {
                try {
                  const res = await DocumentPicker.getDocumentAsync({ type: '*/*' });
                  if (!res.canceled && res.assets && res.assets.length > 0) {
                    setSelectedFile(res.assets[0]);
                  }
                } catch(e) { console.log(e); }
              }}
            >
              <Text style={{color: selectedFile ? '#000' : Colors.text, fontSize: 12, fontWeight: 'bold'}}>
                {selectedFile ? `Selected: ${selectedFile.name.substring(0, 15)}...` : '📎 Attach Photo/Video'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <TouchableOpacity onPress={() => setSelectedFile(null)} style={{marginRight: 10}}>
                <Text style={{color: Colors.error, fontSize: 12, fontWeight: 'bold'}}>Clear</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.postBtn, submittingPost && {opacity: 0.6}]} 
              onPress={submitPost}
              disabled={submittingPost}
            >
              {submittingPost ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.postBtnText}>{t('post')}</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {posts.map(p => (
          <View key={p.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.postAuthor}>{p.member_name}</Text>
              <Text style={styles.postTime}>{new Date(p.created_at).toLocaleDateString()}</Text>
            </View>
            {p.content ? <Text style={styles.postContent}>{p.content}</Text> : null}
            
            {p.media_url ? (
              p.media_type === 'image' ? (
                <Image 
                  source={{ uri: p.media_url.startsWith('http') ? p.media_url : `${SERVER_URL}${p.media_url}` }} 
                  style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 10, backgroundColor: Colors.dark }}
                  resizeMode="cover"
                />
              ) : p.media_type === 'video' ? (
                <Video
                  style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 10 }}
                  source={{ uri: p.media_url.startsWith('http') ? p.media_url : `${SERVER_URL}${p.media_url}` }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                />
              ) : p.media_type === 'audio' ? (
                <Video
                  style={{ width: '100%', height: 50, borderRadius: 8, marginTop: 10, backgroundColor: '#000' }}
                  source={{ uri: p.media_url.startsWith('http') ? p.media_url : `${SERVER_URL}${p.media_url}` }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                />
              ) : null
            ) : null}
          </View>
        ))}

        {posts.length === 0 && (
          <Text style={{color: Colors.textDim, fontStyle: 'italic', textAlign: 'center', marginTop: 20}}>{t('no_posts')}</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },
  header: { padding: Spacing.md, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  backBtnText: { color: Colors.gold, fontWeight: 'bold' },
  headerTitle: { fontSize: 18, color: Colors.text, fontWeight: '700' },
  scroll: { padding: Spacing.md },
  
  candleCard: { borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.gold + '40' },
  candleTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.gold },
  candleSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 22, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  
  currentCandleContainer: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: Radius.sm, marginBottom: 20 },
  currentCandleText: { color: Colors.white, fontSize: 13, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  progressBarBg: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.gold },
  
  startBtn: { borderRadius: Radius.full, overflow: 'hidden', shadowColor: Colors.gold, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  startBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  startBtnText: { color: Colors.dark, fontWeight: 'bold', fontSize: 16 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 5 },
  postBox: { backgroundColor: Colors.darkCard, padding: 10, borderRadius: Radius.sm, marginBottom: 20, borderWidth: 1, borderColor: Colors.glassBorder },
  postInput: { color: Colors.text, minHeight: 60, textAlignVertical: 'top' },
  postBtn: { alignSelf: 'flex-end', backgroundColor: Colors.gold, paddingHorizontal: 20, paddingVertical: 8, borderRadius: Radius.sm, marginTop: 10 },
  postBtnText: { color: Colors.dark, fontWeight: 'bold' },

  postCard: { backgroundColor: Colors.darkCard, padding: Spacing.md, borderRadius: Radius.sm, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  postAuthor: { fontWeight: 'bold', color: Colors.gold },
  postTime: { fontSize: 11, color: Colors.textDim },
  postContent: { color: Colors.text, lineHeight: 20 }
});
