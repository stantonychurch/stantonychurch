import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import { getPlatform, postPlatform } from '../../src/services/api';
import { API_BASE_URL } from '../../src/config/api';
import { Video, ResizeMode } from 'expo-av';
import { DrawerContext } from './_layout';

const SERVER_URL = API_BASE_URL.replace('/api', '');
import { useLanguage } from '../../src/context/LanguageContext';

export default function YouthScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'pending', 'approved', null
  const [groupName, setGroupName] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [qrCodeId, setQrCodeId] = useState('');

  useEffect(() => {
    loadYouthData();
  }, []);

  async function loadYouthData() {
    try {
      setLoading(true);
      const statusRes = await getPlatform('/youth/my');
      const groups = statusRes.data;
      if (groups && groups.length > 0) {
        const membership = groups[0];
        setStatus(membership.status || 'approved');
        setGroupName(membership.group_name);
        
        if (membership.status === 'approved' || !membership.status) {
          const annRes = await getPlatform(`/youth/${membership.id}/posts`);
          setAnnouncements(annRes.data || []);
        }
      } else {
        setStatus(null);
        setGroupName(null);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  async function joinYouthGroup() {
    if (!qrCodeId.trim()) return Alert.alert('Error', 'Enter an invite code');
    try {
      const res = await postPlatform('/youth/join', { qr_code_id: qrCodeId });
      Alert.alert('Request Sent', res.data?.message || 'Joined youth group! Waiting for admin approval.');
      setQrCodeId('');
      loadYouthData();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.menuBtn}>
          <Text style={{ fontSize: 24, color: Colors.gold, fontWeight: 'bold' }}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}><View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('youth_corner')}</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 16, color: Colors.gold }}>🔙 {t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
          <Text style={styles.loadingText}>{t('loading_details')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {status === null && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('join_youth')}</Text>
              <Text style={styles.sectionSubtitle}>{t('join_youth_desc')}</Text>
              <TextInput 
                style={styles.input} 
                placeholder={t('invite_code_placeholder')}
                placeholderTextColor={Colors.textMuted}
                value={qrCodeId}
                onChangeText={setQrCodeId}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.btnAlt} onPress={joinYouthGroup}>
                <Text style={styles.btnText}>{t('join_group')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'pending' && (
            <View style={styles.pendingCard}>
              <Text style={styles.pendingIcon}>⏳</Text>
              <Text style={styles.pendingTitle}>{t('pending_request')}</Text>
              <Text style={styles.pendingText}>
                {t('pending_request_desc')} <Text style={{ color: Colors.gold, fontWeight: '700' }}>{groupName}</Text>.
              </Text>
              <Text style={[styles.pendingText, { marginTop: 10 }]}>{t('check_back')}</Text>
            </View>
          )}

          {(status === 'approved' || !status && groupName) && (
            <View style={styles.section}>
              <View style={styles.activeHeader}>
                <Text style={styles.sectionTitle}>{groupName}</Text>
                <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>{t('active_member')}</Text></View>
              </View>

              <View style={styles.announcementWall}>
                <Text style={{ color: Colors.gold, fontWeight: 'bold', marginBottom: Spacing.sm }}>{t('youth_announcements')}</Text>
                {announcements.length === 0 ? <Text style={styles.empty}>{t('no_announcements')}</Text> : null}
                {announcements.map(a => (
                  <View key={a.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{a.member_name} (Admin)</Text>
                    {a.content ? <Text style={styles.cardContent}>{a.content}</Text> : null}
                    
                    {a.media_type === 'image' && (
                      <Image source={{ uri: a.media_url.startsWith('http') ? a.media_url : `${SERVER_URL}${a.media_url}` }} style={styles.mediaImage} />
                    )}
                    {a.media_type === 'video' && (
                      <Video
                        style={styles.mediaVideo}
                        source={{ uri: a.media_url.startsWith('http') ? a.media_url : `${SERVER_URL}${a.media_url}` }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                      />
                    )}
                    {a.media_type === 'audio' && (
                      <Video
                        style={styles.mediaAudio}
                        source={{ uri: a.media_url.startsWith('http') ? a.media_url : `${SERVER_URL}${a.media_url}` }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.dark },
  header: { padding: Spacing.md, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  menuBtn: { padding: 4, marginRight: 2 },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },
  headerTitle: { fontSize: 18, color: Colors.text, fontWeight: '700' },
  scroll: { padding: Spacing.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, marginTop: 10 },
  empty: { color: Colors.textMuted, marginTop: 10, fontStyle: 'italic' },
  section: { backgroundColor: Colors.darkCard, padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.glassBorder },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.gold, marginBottom: Spacing.xs },
  sectionSubtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 12, lineHeight: 18 },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', padding: Spacing.md, borderRadius: Radius.sm, marginTop: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.gold, marginBottom: 4 },
  cardContent: { fontSize: 15, color: Colors.text, marginTop: 4, lineHeight: 22 },
  mediaImage: { width: '100%', height: 200, marginTop: 10, borderRadius: Radius.sm },
  mediaVideo: { width: '100%', height: 200, marginTop: 10, borderRadius: Radius.sm },
  mediaAudio: { width: '100%', height: 60, marginTop: 10, borderRadius: Radius.sm, backgroundColor: '#000' },
  input: { backgroundColor: 'rgba(255,255,255,0.1)', color: Colors.text, padding: 12, borderRadius: Radius.sm, marginBottom: 10 },
  btnAlt: { backgroundColor: 'rgba(200,153,26,0.2)', borderWidth: 1, borderColor: Colors.gold, padding: 12, borderRadius: Radius.sm, alignItems: 'center' },
  btnText: { color: Colors.gold, fontWeight: 'bold' },
  
  // Pending Card
  pendingCard: { backgroundColor: 'rgba(243,156,18,0.08)', borderWidth: 1, borderColor: 'rgba(243,156,18,0.3)', borderRadius: Radius.md, padding: 24, alignItems: 'center', marginTop: 20 },
  pendingIcon: { fontSize: 40, marginBottom: 12 },
  pendingTitle: { fontSize: 18, fontWeight: '700', color: Colors.warning, marginBottom: 10 },
  pendingText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  
  // Active Group
  activeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  activeBadge: { backgroundColor: 'rgba(39, 201, 63, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(39, 201, 63, 0.3)' },
  activeBadgeText: { color: '#27c93f', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  announcementWall: { marginTop: 10 },
  pendingSub: { fontSize: 12, color: Colors.textDim, fontStyle: 'italic', marginTop: 15 },

  // Group Header Card
  groupHeaderCard: { backgroundColor: Colors.darkCard, borderWidth: 1, borderColor: Colors.glassBorder, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 4, borderLeftColor: Colors.gold },
  groupHeaderLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  groupHeaderTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
});
