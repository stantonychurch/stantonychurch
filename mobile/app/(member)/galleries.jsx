import React, { useEffect, useState, useContext } from 'react';
import { DrawerContext } from './_layout';
import { useLanguage } from '../../src/context/LanguageContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, TextInput } from 'react-native';
import { Colors, Spacing, Radius } from '../../src/config/theme';
import apiClient from '../../src/services/api';
import { API_BASE_URL } from '../../src/config/api';
import SocialBar from '../../src/components/SocialBar';
import { Video, ResizeMode } from 'expo-av';

const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function GalleriesScreen() {
  const { toggleDrawer } = useContext(DrawerContext);
  const { t } = useLanguage();
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    loadGalleries();
  }, []);

  async function loadGalleries() {
    try {
      const res = await apiClient.get('/platform/event-galleries');
      setGalleries(res.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  async function openGallery(gallery) {
    setSelectedGallery(gallery);
    try {
      const res = await apiClient.get(`/platform/event-galleries/${gallery.id}/media`);
      setMedia(res.data || []);
    } catch (e) {
      setMedia([]);
    }
  }

  async function handleLike(mediaId) {
    try {
      const res = await apiClient.post(`/platform/media/${mediaId}/like`);
      setMedia(media.map(m => {
        if (m.id === mediaId) {
          return { ...m, is_liked: res.data.liked, likes_count: res.data.liked ? m.likes_count + 1 : m.likes_count - 1 };
        }
        return m;
      }));
    } catch (e) { console.log(e); }
  }

  async function handleComment(mediaId) {
    const text = commentText[mediaId];
    if (!text || !text.trim()) return;
    try {
      await apiClient.post(`/platform/media/${mediaId}/comment`, { content: text });
      setCommentText({ ...commentText, [mediaId]: '' });
      openGallery(selectedGallery); // Refresh to get the comment
    } catch (e) { console.log(e); }
  }

  if (loading) {
    return <SafeAreaView style={styles.safe}><Text style={styles.loading}>Loading...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{selectedGallery ? selectedGallery.title : t('event_galleries')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {selectedGallery ? (
          <View>
            <TouchableOpacity onPress={() => setSelectedGallery(null)} style={styles.backBtn}>
              <Text style={styles.backTxt}>{t('back_to_galleries')}</Text>
            </TouchableOpacity>
            {media.length === 0 ? <Text style={styles.empty}>{t('no_media')}</Text> : null}
            <View style={styles.feed}>
              {media.map(m => (
                <View key={m.id} style={styles.postCard}>
                  {/* Media Content */}
                  {m.media_type === 'image' && <Image source={{ uri: m.url.startsWith('http') ? m.url : `${SERVER_URL}${m.url}` }} style={styles.postImage} />}
                  {m.media_type === 'video' && (
                    <Video
                      style={styles.videoPlayer}
                      source={{ uri: m.url.startsWith('http') ? m.url : `${SERVER_URL}${m.url}` }}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                      isLooping
                    />
                  )}
                  {m.media_type === 'audio' && (
                    <Video
                      style={styles.audioPlayer}
                      source={{ uri: m.url.startsWith('http') ? m.url : `${SERVER_URL}${m.url}` }}
                      useNativeControls
                      resizeMode={ResizeMode.CONTAIN}
                    />
                  )}
                  
                  {/* Like & Comment Bar */}
                  <View style={styles.interactionBar}>
                    <TouchableOpacity onPress={() => handleLike(m.id)} style={styles.actionBtn}>
                      <Text style={{fontSize: 20}}>{m.is_liked ? '❤️' : '🤍'}</Text>
                      <Text style={styles.actionTxt}>{m.likes_count || 0}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Comments List */}
                  {m.comments && m.comments.length > 0 && m.comments[0].id !== null && (
                    <View style={styles.commentsList}>
                      {m.comments.map(c => (
                        <Text key={c.id} style={styles.commentTxt}>
                          <Text style={{fontWeight: 'bold', color: Colors.gold}}>{c.member_name}: </Text>
                          {c.content}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Add Comment */}
                  <View style={styles.commentInputRow}>
                    <TextInput 
                      style={styles.commentInput} 
                      placeholder={t('add_comment')}
                      placeholderTextColor={Colors.textDim}
                      value={commentText[m.id] || ''}
                      onChangeText={(t) => setCommentText({...commentText, [m.id]: t})}
                    />
                    <TouchableOpacity onPress={() => handleComment(m.id)}>
                      <Text style={{color: Colors.gold, fontWeight: 'bold'}}>{t('post')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            <SocialBar mediaType="event" mediaId={selectedGallery.id} />
          </View>
        ) : (
          <View style={styles.grid}>
            {galleries.length === 0 ? <Text style={styles.empty}>No galleries found.</Text> : null}
            {galleries.map(g => (
              <TouchableOpacity key={g.id} style={styles.galleryCard} onPress={() => openGallery(g)}>
                <Text style={{fontSize: 40, textAlign: 'center'}}>📁</Text>
                <Text style={styles.galleryTitle}>{g.title}</Text>
                <Text style={styles.galleryDate}>{g.event_date || 'No Date'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuBtn: { padding: 4, marginRight: 8, alignSelf: 'center' },
  menuBtnText: { fontSize: 24, color: Colors.gold, fontWeight: 'bold' },
  safe: { flex: 1, backgroundColor: Colors.dark },
  header: { padding: Spacing.md, backgroundColor: Colors.dark2, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  headerTitle: { fontSize: 18, color: Colors.text, fontWeight: '700' },
  scroll: { padding: Spacing.md },
  loading: { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 40 },
  backBtn: { marginBottom: 15, padding: 10, backgroundColor: Colors.darkCard, borderRadius: Radius.sm },
  backTxt: { color: Colors.gold, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  galleryCard: { width: '48%', backgroundColor: Colors.darkCard, padding: Spacing.md, borderRadius: Radius.md, marginBottom: 15, borderWidth: 1, borderColor: Colors.glassBorder },
  galleryTitle: { color: Colors.text, fontWeight: '700', textAlign: 'center', marginTop: 10 },
  galleryDate: { color: Colors.textMuted, textAlign: 'center', fontSize: 12, marginTop: 4 },
  postCard: { backgroundColor: Colors.darkCard, padding: 0, borderRadius: Radius.md, marginBottom: 20, borderWidth: 1, borderColor: Colors.glassBorder, overflow: 'hidden' },
  postImage: { width: '100%', height: 250, backgroundColor: Colors.darkCard },
  videoPlayer: { width: '100%', height: 250 },
  audioPlayer: { width: '100%', height: 80, backgroundColor: '#000' },
  interactionBar: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionTxt: { color: Colors.text, marginLeft: 6, fontWeight: 'bold' },
  commentsList: { paddingHorizontal: 12, paddingBottom: 10 },
  commentTxt: { color: Colors.text, fontSize: 13, marginBottom: 4 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  commentInput: { flex: 1, color: Colors.text, marginRight: 10 }
});
